from __future__ import annotations

import asyncio
import hashlib
import json
import os
from pathlib import Path

from . import ai
from .runner import run_check
from .source import capture, difference, make_features, parse
from .storage import Storage


class Workshop:
    def __init__(self, storage: Storage):
        self.db = storage
        self.stopping = False
        self.active_job: str | None = None

    def enqueue(self, kind: str, project_id: str, payload: dict) -> dict:
        job = self.db.create(
            "jobs",
            {
                "kind": kind,
                "status": "queued",
                "payload": payload,
                "message": "Waiting to start",
                "result": None,
            },
            project_id=project_id,
        )
        self.db.emit(
            job["id"], {"type": "progress", "message": "Queued", "status": "queued"}
        )
        if kind == "snapshot":
            self.db.patch("projects", project_id, {"job_id": job["id"]})
        return job

    async def worker(self):
        for job in self.db.list("jobs"):
            if job["status"] == "running":
                status = "interrupted" if job["kind"] in {"check", "experiment"} else "queued"
                self.db.patch(
                    "jobs",
                    job["id"],
                    {
                        "status": status,
                        "message": "Interrupted; rerun the check"
                        if status == "interrupted"
                        else "Resuming interrupted analysis",
                    },
                )
                if job["kind"] == "check" and job["payload"].get("check_id"):
                    self.db.patch(
                        "checks", job["payload"]["check_id"], {"status": "interrupted"}
                    )
                if job["kind"] == "experiment" and job["payload"].get("run_id"):
                    self.db.patch("experiment_runs", job["payload"]["run_id"], {"status": "execution_error", "message": "Interrupted by restart. Review partial evidence and explicitly rerun."})
        while not self.stopping:
            jobs = [
                j for j in reversed(self.db.list("jobs")) if j["status"] == "queued"
            ]
            if not jobs:
                await asyncio.sleep(0.2)
                continue
            self.active_job = jobs[0]["id"]
            try:
                await self.process(jobs[0])
            finally:
                self.active_job = None

    async def process(self, job: dict):
        jid = job["id"]
        self.db.patch("jobs", jid, {"status": "running", "message": "Working"})
        self.db.emit(
            jid, {"type": "progress", "message": "Started", "status": "running"}
        )
        try:
            project = self.db.get("projects", job["project_id"])
            if not project:
                raise ValueError("The project is no longer registered.")
            if job["kind"] == "snapshot":
                result = await asyncio.to_thread(self.snapshot, project, jid)
            elif job["kind"] == "explain":
                result = await self.explanation(job)
            elif job["kind"] == "experiment":
                from .experiments import run_browser
                recipe = self.db.get("recipes", job["payload"]["recipe_id"])
                if not recipe or not project.get("trusted"):
                    raise ValueError("Trust the project and choose an approved recipe first.")
                run_id = job["payload"]["run_id"]
                self.db.patch("experiment_runs", run_id, {"status": "running"})
                before = await asyncio.to_thread(capture, Path(project["root"]))
                def record_observation(event):
                    self.db.emit(jid, event)
                    current = self.db.get("experiment_runs", run_id)
                    if event.get("type") == "observation":
                        self.db.patch("experiment_runs", run_id, {"requests": [*current.get("requests", []), event["request"]][-100:]})
                    elif event.get("type") == "progress" and event.get("kind"):
                        self.db.patch("experiment_runs", run_id, {"events": [*current.get("events", []), event][-200:]})
                result = await run_browser({k: v for k, v in recipe.items() if k in {"feature_id", "label", "url", "approved_origins", "scenario", "request_path", "delay_ms", "steps"}},
                    self.db.path.parent, run_id, lambda: self.stopping or self.db.get("jobs", jid)["status"] == "cancelled", record_observation)
                after = await asyncio.to_thread(capture, Path(project["root"]))
                expected = self.db.get("snapshots", recipe["snapshot_id"])
                result.update(before_digest=before["digest"], after_digest=after["digest"], source_changed=before["digest"] != after["digest"], snapshot_outdated=before["digest"] != expected["digest"])
                artifacts = result.pop("artifacts")
                identifiers = []
                for artifact in artifacts:
                    original = artifact.pop("id")
                    saved = self.db.create("artifacts", artifact, project_id=project["id"], snapshot_id=recipe["snapshot_id"], parent_id=run_id)
                    identifiers.append(saved["id"])
                result["artifact_ids"] = identifiers
                self.db.patch("experiment_runs", run_id, result)
            elif job["kind"] == "check":
                profile = self.db.get("profiles", job["payload"]["profile_id"])
                if not profile or not project.get("trusted"):
                    raise ValueError(
                        "Trust this project and choose an existing check first."
                    )
                result = await asyncio.to_thread(
                    run_check,
                    Path(project["root"]),
                    profile,
                    lambda: (
                        self.stopping
                        or self.db.get("jobs", jid)["status"] == "cancelled"
                    ),
                    lambda event: self.db.emit(jid, event),
                )
                check = self.db.get("checks", job["payload"]["check_id"])
                expected = self.db.get("snapshots", check["snapshot_id"])
                result["snapshot_outdated"] = (
                    result["before_digest"] != expected["digest"]
                )
                self.db.patch("checks", job["payload"]["check_id"], result)
            else:
                raise ValueError("Unsupported job type.")
            current = self.db.get("jobs", jid)
            status = "cancelled" if current["status"] == "cancelled" else "completed"
            self.db.patch(
                "jobs",
                jid,
                {
                    "status": status,
                    "result": result,
                    "message": "Finished" if status == "completed" else "Cancelled",
                },
            )
            self.db.emit(
                jid,
                {
                    "type": "complete",
                    "status": status,
                    "message": "Finished",
                    "result": result,
                },
            )
        except Exception as exc:
            # Never leak provider request data, credentials, or stack traces through events.
            message = (
                str(exc)
                if isinstance(exc, (ValueError, FileNotFoundError))
                else "The operation could not finish. Check setup and retry; your previous work is saved."
            )
            if job["kind"] == "snapshot":
                self.db.patch(
                    "projects",
                    job["project_id"],
                    {"status": "error", "last_error": message},
                )
            self.db.patch("jobs", jid, {"status": "failed", "message": message})
            if job["kind"] == "check" and job["payload"].get("check_id"):
                self.db.patch(
                    "checks",
                    job["payload"]["check_id"],
                    {"status": "failed", "output": message},
                )
            if job["kind"] == "experiment" and job["payload"].get("run_id"):
                self.db.patch("experiment_runs", job["payload"]["run_id"], {"status": "execution_error", "message": message})
            self.db.emit(jid, {"type": "error", "status": "failed", "message": message})

    def snapshot(self, project: dict, jid: str) -> dict:
        self.db.emit(
            jid,
            {"type": "progress", "message": "Reading source and applying exclusions"},
        )
        snap = capture(Path(project["root"]))
        current = self.db.get("jobs", jid)
        if current["status"] == "cancelled":
            self.db.patch(
                "projects",
                project["id"],
                {
                    "status": "ready"
                    if project.get("latest_snapshot_id")
                    else "cancelled"
                },
            )
            return {"cancelled": True}
        previous = self.db.list("snapshots", project_id=project["id"])
        if previous and previous[0]["digest"] == snap["digest"]:
            self.db.patch(
                "projects", project["id"], {"status": "ready", "last_error": None}
            )
            return {"snapshot_id": previous[0]["id"], "unchanged": True}
        self.db.emit(
            jid,
            {
                "type": "progress",
                "message": "Following imports, components, and request routes",
            },
        )
        snap["analysis"] = parse(snap["files"])
        if self.db.get("jobs", jid)["status"] == "cancelled":
            self.db.patch(
                "projects",
                project["id"],
                {
                    "status": "ready"
                    if project.get("latest_snapshot_id")
                    else "cancelled"
                },
            )
            return {"cancelled": True}
        snapshot = self.db.create("snapshots", snap, project_id=project["id"])
        self.db.index(snapshot["id"], snap["files"])
        features = make_features(snap)
        for feature in features:
            self.db.create(
                "features",
                feature,
                project_id=project["id"],
                snapshot_id=snapshot["id"],
            )
        self.db.patch(
            "projects",
            project["id"],
            {
                "latest_snapshot_id": snapshot["id"],
                "file_count": len(snap["files"]),
                "feature_count": len(features),
                "status": "ready",
                "last_error": None,
            },
        )
        if previous:
            changed = {c["path"] for c in difference(previous[0], snapshot)["changes"]}
            for inv in self.db.list("investigations", project_id=project["id"]):
                if set(inv.get("paths", [])) & changed:
                    self.db.patch("investigations", inv["id"], {"outdated": True})
                    for d in self.db.list("discoveries", parent_id=inv["id"]):
                        self.db.patch("discoveries", d["id"], {"outdated": True})
        return {
            "snapshot_id": snapshot["id"],
            "file_count": len(snap["files"]),
            "feature_count": len(features),
            "excluded_count": len(snap["excluded"]),
        }

    async def explanation(self, job: dict) -> dict:
        payload = job["payload"]
        inv = self.db.get("investigations", payload["investigation_id"])
        snapshot = self.db.get("snapshots", inv["snapshot_id"])
        model = os.getenv("RAVEL_MODEL", "claude-sonnet-4-6")
        key = hashlib.sha256(
            json.dumps(
                [
                    snapshot["id"],
                    inv["paths"],
                    payload["question"],
                    ai.PROMPT_VERSION,
                    model,
                ]
            ).encode()
        ).hexdigest()
        for cached in self.db.list("investigations", project_id=inv["project_id"]):
            for answer in cached.get("answers", []):
                if answer.get("cache_key") == key:
                    result = {**answer, "cached": True}
                    break
            else:
                continue
            break
        else:
            def record(metrics):
                self.db.patch("jobs", job["id"], {"result": {"investigation_metrics": metrics}})
                self.db.emit(job["id"], {"type": "progress", "message": f"Inspecting evidence, round {metrics['rounds']}", "metrics": metrics})
            result = await ai.investigate(payload["question"], snapshot, inv["paths"], model, record)
            result.update(
                {
                    "question": payload["question"],
                    "model": model,
                    "prompt_version": ai.PROMPT_VERSION,
                    "cache_key": key,
                    "snapshot_id": snapshot["id"],
                }
            )
        # Don't overwrite notes/answers added while the provider call was running.
        if self.db.get("jobs", job["id"])["status"] == "cancelled":
            return {"cancelled": True}
        latest = self.db.get("investigations", inv["id"])
        self.db.patch(
            "investigations",
            inv["id"],
            {"answers": [*latest.get("answers", []), result]},
        )
        return result
