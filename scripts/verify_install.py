"""Verify a wheel in a fresh environment outside the checkout, without Node on PATH."""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import venv
import zipfile


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("wheel", type=Path)
    parser.add_argument("--python", type=Path, help="Reuse a previously created clean environment")
    args = parser.parse_args()
    wheel = args.wheel.resolve(strict=True)
    with zipfile.ZipFile(wheel) as archive:
        names = archive.namelist()
        assert "apps/ravel/_web/index.html" in names
        assert any(n.startswith("apps/ravel/_web/assets/") and n.endswith(".js") for n in names)
    with tempfile.TemporaryDirectory(prefix="ravel-install-") as temporary:
        outside = Path(temporary)
        if args.python:
            python = args.python.resolve(strict=True)
        else:
            environment = outside / "env"
            venv.EnvBuilder(with_pip=True).create(environment)
            python = environment / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        clean = {k: v for k, v in os.environ.items() if k not in {"PYTHONPATH", "PYTHONHOME", "ANTHROPIC_API_KEY", "RAVEL_HOME"}}
        install = [str(python), "-m", "pip", "install", "--disable-pip-version-check", "--force-reinstall"]
        if args.python:
            install.append("--no-deps")
        subprocess.run([*install, str(wheel)], cwd=outside, env=clean, check=True)
        clean["PATH"] = str(python.parent) + (os.pathsep + str(Path(os.environ["SystemRoot"]) / "System32") if os.name == "nt" else "")
        assert shutil.which("node", path=clean["PATH"]) is None
        clean["PYTHONNOUSERSITE"] = "1"
        probe = subprocess.check_output([str(python), "-c", "from apps.ravel.assets import frontend_directory; print(frontend_directory())"], cwd=outside, env=clean, text=True).strip()
        assert "_web" in probe and str(wheel.parent.parent.parent) not in probe
        with socket.socket() as available:
            available.bind(("127.0.0.1", 0))
            port = available.getsockname()[1]
        home = outside / "data"
        command = [str(python), "-m", "apps.ravel.cli"]
        def doctor(storage=home):
            return subprocess.run([*command, "doctor", "--home", str(storage), "--port", str(port)], cwd=outside, env=clean, capture_output=True, text=True)
        assert doctor().returncode == 0
        for alias in ("unravel", "ravel"):
            executable = python.parent / (alias + ".exe" if os.name == "nt" else alias)
            assert executable.is_file(), f"Missing installed CLI alias: {alias}"
            result = subprocess.run([str(executable), "doctor", "--home", str(home), "--port", str(port)], cwd=outside, env=clean, capture_output=True, text=True)
            assert result.returncode == 0, result.stdout + result.stderr
        assert "apps/ravel/_web/photo.html" in names
        assert "apps/ravel/_web/search.html" in names
        blocked = outside / "not-a-folder"
        blocked.write_text("cannot use a file for storage")
        invalid = doctor(blocked)
        assert invalid.returncode == 1 and "--home" in invalid.stdout
        origin = f"http://127.0.0.1:{port}"
        def request(path, payload=None):
            req = urllib.request.Request(origin + path, data=json.dumps(payload).encode() if payload is not None else None, headers={"Content-Type": "application/json", "X-Ravel-Client": "workshop"})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = response.read()
                content_type = response.headers.get_content_type()
                if content_type == "application/json":
                    return json.loads(data)
                if content_type.startswith(("font/", "image/")) or content_type == "application/octet-stream":
                    return data
                return data.decode()
        # A stdin hook stops Uvicorn gracefully inside its own process. This avoids
        # Windows venv redirector child processes surviving forced launcher termination.
        harness = """
import os, sys, threading, uvicorn
original = uvicorn.Server.run
def run(server, *args, **kwargs):
    def stop_on_input():
        os.read(sys.stdin.fileno(), 1)
        server.should_exit = True
    threading.Thread(target=stop_on_input, daemon=True).start()
    return original(server, *args, **kwargs)
uvicorn.Server.run = run
from apps.ravel.cli import main
raise SystemExit(main())
"""
        def start(log):
            server = subprocess.Popen([str(python), "-c", harness, "serve", "--home", str(home), "--port", str(port)], cwd=outside, env=clean, stdin=subprocess.PIPE, stdout=log, stderr=subprocess.STDOUT, creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
            for _ in range(150):
                assert server.poll() is None, "Installed server exited; read its log"
                try:
                    request("/healthz")
                    return server
                except OSError:
                    time.sleep(0.1)
            server.stdin.write(b"x")
            server.stdin.flush()
            server.wait(timeout=10)
            raise AssertionError("Installed server did not start")
        def stop(server):
            server.stdin.write(b"x")
            server.stdin.flush()
            server.wait(timeout=15)
            server.stdin.close()
            assert server.returncode == 0
            try:
                request("/healthz")
            except OSError:
                return
            raise AssertionError("The installed server did not stop")
        source = outside / "example"
        source.mkdir()
        (source / "routes.py").write_text('from fastapi import FastAPI\napp = FastAPI()\n@app.get("/hello")\ndef hello():\n    return {"message": "hello"}\n')
        with (outside / "server.log").open("w") as log:
            server = start(log)
            try:
                html = request("/")
                assert 'data-prerendered="/"' in html
                assert "Understand the app" in html and "you built." in html
                setup_html = request("/docs/quick-start")
                assert "No public download yet." in setup_html
                assert "Windows PowerShell" in setup_html and "macOS / Linux" in setup_html
                assert setup_html != html
                assert "Build with understanding." in request("/docs")
                public_indexes = [name for name in names if name.startswith("apps/ravel/_web/docs/") and name.endswith("/index.html")]
                assert len(public_indexes) == 12
                for name in public_indexes:
                    route = name.removeprefix("apps/ravel/_web").removesuffix("/index.html")
                    assert f'data-prerendered="{route}"' in request(route)
                assets = re.findall(r'(?:src|href)="(/assets/[^" ]+)"', html)
                assert assets
                for asset in assets:
                    assert len(request(asset)) > 100
                for name in names:
                    if name.startswith("apps/ravel/_web/assets/"):
                        address = origin + name.removeprefix("apps/ravel/_web")
                        with urllib.request.urlopen(address, timeout=10) as response:
                            assert len(response.read()) > 0, name
                occupied = doctor()
                assert occupied.returncode == 1 and "--port" in occupied.stdout
                project = request("/api/projects", {"root": str(source)})
                for _ in range(100):
                    job = request("/api/jobs/" + project["job_id"])
                    if job["status"] in {"completed", "failed"}:
                        break
                    time.sleep(0.1)
                assert job["status"] == "completed", job
                feature = request("/api/projects/" + project["id"] + "/features")[0]
                suggestion = request("/api/features/" + feature["id"] + "/recipe-suggestion")
                assert suggestion["feature_id"] == feature["id"]
                assert suggestion["steps"] == [] and suggestion["request_paths"] == []
                assert "200 OK. Broken UI." in html
                assert "search-root" in request("/search.html")
                investigation = request("/api/investigations", {"feature_id": feature["id"]})
                assert "def hello" in request("/api/snapshots/" + investigation["snapshot_id"] + "/source?path=routes.py")["body"]
                try:
                    request("/api/investigations/" + investigation["id"] + "/questions", {"question": "What does this route return?", "consent": True})
                    raise AssertionError("Missing key should not produce an answer")
                except urllib.error.HTTPError as error:
                    assert error.code == 503
                    assert "Source reading" in error.read().decode()
                discovery = request("/api/investigations/" + investigation["id"] + "/discoveries", {"title": "I followed the route", "body": "The handler returns a message."})
            finally:
                stop(server)
            server = start(log)
            try:
                assert request("/api/projects")[0]["id"] == project["id"]
                assert request("/api/investigations/" + investigation["id"] + "/discoveries")[0]["id"] == discovery["id"]
            finally:
                stop(server)
        print("PASS: installed wheel, loopback launch, frontend assets, direct docs, diagnostics, source, missing-key, saved discovery and restart. Node absent from PATH.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

