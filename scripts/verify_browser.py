"""Run the browser suite against an isolated, disposable local workshop."""

import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import urllib.request


def main():
    root = Path(__file__).resolve().parents[1]
    with tempfile.TemporaryDirectory(prefix="ravel-browser-") as home:
        unsupported = Path(home) / "unsupported-source"
        unsupported.mkdir()
        (unsupported / "README.md").write_text("No supported feature source here.")
        env = {
            **os.environ,
            "RAVEL_TEST_URL": "http://127.0.0.1:8019",
            "RAVEL_FIXTURE_PATH": str(root / "examples/request-flow"),
            "RAVEL_UNSUPPORTED_PATH": str(unsupported),
            "RAVEL_PHOTO_PATH": str(root / "examples/profile-photo"),
            "RAVEL_REFERENCE_URL": "http://127.0.0.1:8021",
        }
        with open(Path(home) / "server.log", "w", encoding="utf-8") as log:
            reference = subprocess.Popen(
                [sys.executable, "-m", "apps.ravel.cli", "reference", "--port", "8021"],
                cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
            )
            server = subprocess.Popen(
                [
                    sys.executable,
                    "-m",
                    "apps.ravel.cli",
                    "serve",
                    "--home",
                    home,
                    "--port",
                    "8019",
                ],
                cwd=root,
                env=env,
                stdout=log,
                stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
            )
            try:
                for _ in range(100):
                    if server.poll() is not None:
                        raise RuntimeError(
                            "Test server exited; inspect "
                            + str(Path(home) / "server.log")
                        )
                    try:
                        urllib.request.urlopen(
                            env["RAVEL_TEST_URL"] + "/healthz", timeout=1
                        ).close()
                        break
                    except OSError:
                        time.sleep(0.1)
                else:
                    raise RuntimeError("The browser test server did not become ready.")
                # No source paths or arbitrary shell text; the script name is fixed.
                command = (
                    ["cmd", "/d", "/c", "npm.cmd", "run", "test:e2e"]
                    if os.name == "nt"
                    else ["npm", "run", "test:e2e"]
                )
                if len(sys.argv) > 1:
                    command += ["--", *sys.argv[1:]]
                result = subprocess.run(command, cwd=root / "byline", env=env)
                return result.returncode
            finally:
                reference.terminate()
                reference.wait(timeout=10)
                server.terminate()
                try:
                    server.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    server.kill()
                    server.wait()


if __name__ == "__main__":
    sys.exit(main())
