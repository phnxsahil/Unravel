"""Approved browser recipes only. A browser context does not isolate backend data."""
from __future__ import annotations

import asyncio
import base64
import fnmatch
import importlib.util
import time
import uuid
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, model_validator

PHOTO = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=")

def origin(url: str) -> str:
    try:
        parsed = urlsplit(url)
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
        if parsed.scheme not in {"http", "https"} or parsed.hostname not in {"localhost", "127.0.0.1", "::1"} or parsed.username or parsed.password:
            raise ValueError()
        host = f"[{parsed.hostname}]" if parsed.hostname == "::1" else parsed.hostname
        return f"{parsed.scheme}://{host}:{port}"
    except (ValueError, TypeError):
        raise ValueError("Choose an http(s) app on localhost, 127.0.0.1 or [::1]. Credentials in URLs are not supported.") from None

class Step(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: Literal["navigate", "click", "fill", "upload", "wait", "reload", "assert"]
    name: str = Field(default="", max_length=120)
    role: Literal["button", "textbox", "link", "checkbox", "combobox"] = "button"
    value: str = Field(default="", max_length=500)
    milliseconds: int = Field(default=500, ge=0, le=10000)
    expectation: Literal["visible", "hidden"] = "visible"

    @model_validator(mode="after")
    def complete(self):
        if self.action in {"click", "fill", "upload", "assert"} and not self.name.strip():
            raise ValueError("Give the step an accessible name or exact visible assertion text.")
        if self.action == "fill" and any(x in self.name.lower() for x in ("password", "secret", "token", "key")):
            raise ValueError("Authentication and secret entry are not supported. Use disposable, unauthenticated development data.")
        if self.action == "navigate" and (not self.value.startswith("/") or self.value.startswith("//") or "\\" in self.value or "?" in self.value or "#" in self.value):
            raise ValueError("Navigate to a relative app path beginning with one slash.")
        return self

class RecipeInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    feature_id: str
    label: str = Field(min_length=3, max_length=120)
    url: str = Field(max_length=2048)
    approved_origins: list[str] = Field(default_factory=list, max_length=3)
    scenario: Literal["ordinary", "failure", "slow", "reload"] = "failure"
    request_path: str = Field(default="/api/*", min_length=1, max_length=200)
    delay_ms: int = Field(default=2000, ge=100, le=10000)
    steps: list[Step] = Field(min_length=1, max_length=20)

    @model_validator(mode="after")
    def approved(self):
        base = origin(self.url)
        parsed = urlsplit(self.url)
        if parsed.query or parsed.fragment:
            raise ValueError("Use a base app URL without query strings or fragments.")
        self.approved_origins = list(dict.fromkeys([base, *(origin(x) for x in self.approved_origins)]))
        if len(self.approved_origins) > 3:
            raise ValueError("Approve at most three local origins, including the app URL.")
        if not self.request_path.startswith("/") or any(x in self.request_path for x in ("?", "#", ":", "\\")):
            raise ValueError("Use a request path such as /api/photo, without host, query or fragment.")
        return self

class RunInput(BaseModel):
    approved: bool = False
    disposable_data: bool = False

def browser_status() -> dict:
    if importlib.util.find_spec("playwright") is None:
        return {"available": False, "message": "Install the wheel's browser extra, then run unravel browser install."}
    return {"available": True, "message": "Browser support is installed. A Chromium binary is also required; run unravel browser install."}

async def run_browser(recipe: dict, home: Path, run_id: str, cancelled, emit) -> dict:
    if not browser_status()["available"]:
        raise ValueError(browser_status()["message"])
    from playwright.async_api import async_playwright, TimeoutError as BrowserTimeout
    recipe = RecipeInput.model_validate(recipe)
    started = time.monotonic()
    events, requests, assertions, artifacts = [], [], [], []
    matched = 0
    blocked = 0
    status = "inconclusive"
    message = "No assertion was configured; review the recorded observations."
    folder = home / "artifacts" / run_id
    folder.mkdir(parents=True, exist_ok=True)
    def event(kind, text):
        if len(events) < 200:
            item = {"kind": kind, "message": text, "elapsed_ms": round((time.monotonic() - started) * 1000)}
            events.append(item)
            emit({"type": "progress", **item})
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch(headless=True)
        except Exception:
            raise ValueError("Chromium could not start. Run unravel browser install and retry.") from None
        context = await browser.new_context(viewport={"width": 1280, "height": 800}, service_workers="block", accept_downloads=False)
        async def guard(route):
            nonlocal matched, blocked
            request = route.request
            try:
                allowed = origin(request.url) in recipe.approved_origins
            except ValueError:
                allowed = False
            if not allowed:
                blocked += 1
                event("blocked", "An unapproved network destination was blocked.")
                await route.abort()
                return
            path = urlsplit(request.url).path
            if request.resource_type in {"fetch", "xhr"} and fnmatch.fnmatchcase(path, recipe.request_path):
                matched += 1
                event("scenario", f"{recipe.scenario if recipe.scenario != 'ordinary' else 'Unmodified request observed'}: {request.method} {path[:160]}")
                if recipe.scenario == "failure":
                    await route.fulfill(status=503, content_type="application/json", body='{"detail":"Controlled experiment: request failed"}')
                    return
                if recipe.scenario == "slow":
                    await asyncio.sleep(recipe.delay_ms / 1000)
            # Redirect hops do not re-enter Playwright's routing handler.
            # Require the app's final URL and never follow a redirect implicitly.
            response = await route.fetch(max_redirects=0, timeout=15000)
            if response.status in {301, 302, 303, 307, 308}:
                blocked += 1
                event("blocked", "A redirect was blocked. Use the app's final local URL; redirect-based sign-in is unsupported.")
                await route.abort()
                await response.dispose()
                return
            await route.fulfill(response=response)
            await response.dispose()
        await context.route("**/*", guard)
        if hasattr(context, "route_web_socket"):
            await context.route_web_socket("**/*", lambda socket: socket.close())
        page = await context.new_page()
        page.set_default_timeout(8000)
        def response_record(response):
            if len(requests) < 100:
                timing = response.request.timing
                observed = {"method": response.request.method, "path": urlsplit(response.url).path[:160],
                    "status": response.status, "elapsed_ms": round((time.monotonic() - started) * 1000),
                    "response_start_ms": max(0, round(timing.get("responseStart", 0)))}
                requests.append(observed)
                event("response", f"{observed['method']} {observed['path']} → {observed['status']}")
                emit({"type": "observation", "request": observed})
        page.on("response", response_record)
        async def screenshot(label):
            identifier = str(uuid.uuid4())
            path = folder / f"{identifier}.png"
            await page.screenshot(path=str(path), animations="disabled", timeout=8000)
            artifacts.append({"id": identifier, "filename": f"{run_id}/{identifier}.png", "label": label, "media_type": "image/png"})
        async def execute():
            nonlocal status, message
            try:
                await page.goto(recipe.url, wait_until="domcontentloaded", timeout=15000)
            except Exception:
                raise ValueError("The local app could not open. Start its development server and check the approved URL.") from None
            event("navigation", "Local app opened in a fresh browser context.")
            for index, step in enumerate(recipe.steps):
                if cancelled():
                    status, message = "cancelled", "Cancelled; partial observations are preserved."
                    return
                event("step", f"Step {index + 1}: {step.action} {step.name}"[:180])
                locator = page.get_by_role(step.role, name=step.name, exact=True)
                if step.action == "navigate":
                    await page.goto(recipe.url.rstrip("/") + step.value, wait_until="domcontentloaded")
                elif step.action == "click":
                    await locator.click()
                elif step.action == "fill":
                    await page.get_by_role("textbox", name=step.name, exact=True).fill(step.value)
                elif step.action == "upload":
                    await page.get_by_label(step.name, exact=True).set_input_files({"name": "unravel-photo.png", "mimeType": "image/png", "buffer": PHOTO})
                elif step.action == "wait":
                    await asyncio.sleep(step.milliseconds / 1000)
                elif step.action == "reload":
                    await page.reload(wait_until="domcontentloaded")
                elif step.action == "assert":
                    target = page.get_by_text(step.name, exact=True)
                    try:
                        await target.wait_for(state="visible" if step.expectation == "visible" else "hidden", timeout=4000)
                        met = True
                    except BrowserTimeout:
                        met = False
                    assertions.append({"text": step.name, "expectation": step.expectation, "met": met})
            if recipe.scenario == "reload":
                # Reload scenario must include a reload BEFORE its assertions.
                if not any(s.action == "reload" for s in recipe.steps):
                    status, message = "inconclusive", "Add a reload step before the final assertion to test persistence."
                    return
            if blocked:
                status, message = "inconclusive", "Unapproved requests were blocked; this run cannot establish the complete behaviour."
            elif recipe.scenario in {"ordinary", "failure", "slow"} and not matched:
                status, message = "inconclusive", "The selected request did not occur. Check the action steps and request path."
            elif assertions:
                status = "expectation_met" if all(a["met"] for a in assertions) else "expectation_not_met"
                message = "Configured expectations were met in this run." if status == "expectation_met" else "A configured expectation was not met. Inspect its evidence."
        task = asyncio.create_task(execute())
        try:
            while not task.done():
                if cancelled():
                    task.cancel()
                    status, message = "cancelled", "Cancelled; partial observations are preserved."
                    break
                if time.monotonic() - started > 90:
                    task.cancel()
                    status, message = "execution_error", "The 90-second experiment limit was reached. Shorten the recipe."
                    break
                await asyncio.sleep(0.15)
            if not task.cancelled() and task.done():
                await task
        except BrowserTimeout:
            status, message = "execution_error", "A step could not find its element. Check the accessible name and whether sign-in is required."
        except ValueError as exc:
            status, message = "execution_error", str(exc)
        except Exception:
            status, message = "execution_error", "The browser experiment could not finish. Review the steps and retry."
        finally:
            if not task.done():
                task.cancel()
            await asyncio.gather(task, return_exceptions=True)
            try:
                await screenshot("Final observed page")
            except Exception:
                event("artifact", "A final screenshot could not be captured.")
            await context.close()
            await browser.close()
    return {"status": status, "message": message, "events": events, "requests": requests,
            "assertions": assertions, "artifacts": artifacts, "matched_requests": matched,
            "duration_ms": round((time.monotonic() - started) * 1000), "blocked_requests": blocked,
            "scope": "Only these configured actions and expectations were observed. Browser context does not isolate backend data."}
