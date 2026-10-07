"""Execute only registered, trusted local check profiles; not a sandbox."""

from __future__ import annotations

import json
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Callable

import psutil

from .source import SECRET, capture


def available_profiles(root: Path) -> list[dict]:
    profiles = []
    for base in [
        root,
        root / "byline",
        root / "frontend",
        root / "web",
        root / "apps" / "web",
    ]:
        file = base / "package.json"
        if file.is_file():
            try:
                scripts = json.loads(file.read_text(encoding="utf-8")).get(
                    "scripts", {}
                )
            except (ValueError, OSError):
                continue
            for name in scripts:
                if re.fullmatch(r"[A-Za-z0-9:_-]+", name) and any(
                    k in name for k in ["test", "build", "lint", "typecheck", "check"]
                ):
                    profiles.append(
                        {
                            "kind": "npm",
                            "script": name,
                            "cwd": base.relative_to(root).as_posix(),
                            "label": f"{base.relative_to(root).as_posix()} · npm run {name}",
                            "timeout": 300,
                        }
                    )
    for path in [root / "pyproject.toml", root / "pytest.ini"]:
        if path.exists():
            if path.name == "pytest.ini" or "pytest" in path.read_text(
                encoding="utf-8"
            ):
                profiles.append(
                    {
                        "kind": "pytest",
                        "script": "",
                        "cwd": ".",
                        "label": "Python tests · pytest",
                        "timeout": 300,
                    }
                )
            break
    return profiles


def profile_command(root: Path, profile: dict) -> tuple[list[str], Path]:
    cwd = (root / profile["cwd"]).resolve()
    if not cwd.is_relative_to(root.resolve()) or not cwd.is_dir():
        raise ValueError("The check folder must stay inside this project.")
    candidates = available_profiles(root)
    if not any(
        all(p[k] == profile[k] for k in ["kind", "script", "cwd"]) for p in candidates
    ):
        raise ValueError(
            "This profile is no longer a supported existing check. Refresh the check profiles."
        )
    if profile["kind"] == "pytest":
        return [sys.executable, "-m", "pytest"], cwd
    npm = shutil.which("npm")
    if not npm:
        raise ValueError("Node.js/npm is not installed or not on PATH.")
    if os.name == "nt":
        # Script names are validated above; only a system npm wrapper is passed to cmd.
        return [
            os.getenv("COMSPEC", "cmd.exe"),
            "/d",
            "/c",
            npm,
            "run",
            profile["script"],
        ], cwd
    return [npm, "run", profile["script"]], cwd


def terminate_tree(process: subprocess.Popen) -> None:
    try:
        parent = psutil.Process(process.pid)
        children = parent.children(recursive=True)
        for child in children:
            try:
                child.terminate()
            except psutil.Error:
                pass
        try:
            parent.terminate()
        except psutil.Error:
            pass
        _, alive = psutil.wait_procs([*children, parent], timeout=2)
        for child in alive:
            try:
                child.kill()
            except psutil.Error:
                pass
    except psutil.Error:
        pass


def run_check(
    root: Path,
    profile: dict,
    cancelled: Callable[[], bool],
    emit: Callable[[dict], None],
) -> dict:
    command, cwd = profile_command(root, profile)
    before = capture(root)["digest"]
    started = time.monotonic()
    emit({"type": "progress", "message": "Running the selected local check."})
    p = subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        env={**os.environ, "NO_COLOR": "1"},
    )
    lines: queue.Queue[str] = queue.Queue()

    def read():
        if p.stdout:
            for line in p.stdout:
                lines.put(SECRET.sub("[redacted]", line))

    reader = threading.Thread(target=read, daemon=True)
    reader.start()
    output, size, state = [], 0, None
    while p.poll() is None or not lines.empty() or reader.is_alive():
        if cancelled():
            state = "cancelled"
            terminate_tree(p)
        elif time.monotonic() - started > profile.get("timeout", 300):
            state = "timeout"
            terminate_tree(p)
        try:
            line = lines.get(timeout=0.1)
            if size < 2 * 1024 * 1024:
                output.append(line)
                size += len(line)
                emit({"type": "log", "message": line.rstrip()})
        except queue.Empty:
            pass
        if state:
            reader.join(timeout=2)
            break
    if p.stdout:
        p.stdout.close()
    after = capture(root)["digest"]
    return {
        "status": state or ("passed" if p.returncode == 0 else "failed"),
        "exit_code": p.returncode,
        "output": "".join(output),
        "duration": round(time.monotonic() - started, 2),
        "before_digest": before,
        "after_digest": after,
        "source_changed": before != after,
        "command": " ".join(command),
        "scope": "Only this configured check was executed. Passing does not certify the whole project.",
    }
