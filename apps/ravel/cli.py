from __future__ import annotations

import argparse
import asyncio
import os
from pathlib import Path
import socket
import tempfile
import subprocess
import sys
import webbrowser

from .assets import frontend_directory


def storage_home(value: Path | None = None) -> Path:
    return (value or Path(os.getenv("RAVEL_HOME", str(Path.home() / ".ravel")))).expanduser().resolve()


def check_storage(home: Path) -> tuple[bool, str]:
    try:
        home.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryFile(dir=home) as probe:
            probe.write(b"ravel")
            probe.flush()
        return True, f"Storage is writable: {home}"
    except OSError:
        return False, "Storage is not writable. Choose another folder with --home PATH."


def check_port(port: int) -> tuple[bool, str]:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.bind(("127.0.0.1", port))
        return True, f"Port {port} is available on this computer."
    except OSError:
        return False, f"Port {port} is unavailable. Close the other server or use --port {port + 1 if port < 65535 else 8000}."


def check_parser() -> tuple[bool, str]:
    # A native parser crash must not take down doctor or the server process.
    script = """from apps.ravel.source import parse
files = [
    {'path': 'probe.py', 'language': 'python', 'body': 'def probe():\\n    return 1\\n'},
    {'path': 'probe.tsx', 'language': 'tsx', 'body': 'export const Probe = () => <div />;'},
    {'path': 'probe.js', 'language': 'javascript', 'body': 'export function probe() { return 1; }'},
]
parse(files)
"""
    try:
        result = subprocess.run(
            [sys.executable, "-c", script], capture_output=True, timeout=20,
        )
    except (OSError, subprocess.TimeoutExpired):
        return False, "Source parser could not be checked. Reinstall with pip install -e . (tree-sitter must be below 0.26)."
    if result.returncode:
        return False, f"Source parser failed or crashed (exit {result.returncode}). Reinstall Unravel with tree-sitter>=0.25.0,<0.26 and its pinned grammars before capturing a project."
    return True, "Source parser is ready (Python, TSX and JavaScript)."


def diagnostics(home: Path, port: int) -> list[tuple[bool, str]]:
    present = (frontend_directory() / "index.html").is_file()
    return [
        (present, "Browser interface is ready." if present else "Browser interface is missing. Reinstall the Ravel wheel; source developers should build byline/."),
        check_storage(home),
        check_port(port),
        check_parser(),
    ]


def open_browser(url: str) -> bool:
    try:
        opened = webbrowser.open(url)
    except Exception:
        opened = False
    if not opened:
        print(f"Your browser could not open automatically. Open {url}")
    return bool(opened)


def port_number(value: str) -> int:
    try:
        number = int(value)
    except ValueError:
        raise argparse.ArgumentTypeError("Choose a port between 1 and 65535.") from None
    if not 1 <= number <= 65535:
        raise argparse.ArgumentTypeError("Choose a port between 1 and 65535.")
    return number


def run_server(home: Path, port: int, launch: bool) -> None:
    import uvicorn
    from .api import create_app

    url = f"http://127.0.0.1:{port}/projects"

    class BrowserServer(uvicorn.Server):
        async def startup(self, sockets=None):
            await super().startup(sockets=sockets)
            if launch and self.started:
                await asyncio.to_thread(open_browser, url)

    print(f"Unravel runs on this computer and opens in your browser: {url}")
    print("Press Ctrl+C in this terminal to stop. Your projects and notes stay saved.")
    BrowserServer(uvicorn.Config(create_app(home), host="127.0.0.1", port=port)).run()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Unravel — understand the app you built")
    parser.add_argument("command", nargs="?", choices=["serve", "doctor", "browser", "reference"])
    parser.add_argument("action", nargs="?", choices=["install"])
    parser.add_argument("--variant", choices=["correct", "broken", "ambiguous"], default="correct")
    parser.add_argument("--example", choices=["photo", "search"], default="photo", help="Choose a disposable reference app")
    parser.add_argument("--port", type=port_number, default=8000)
    parser.add_argument("--home", type=Path)
    parser.add_argument("--open", action="store_true", help="Open the local interface after the server starts")
    args = parser.parse_args(argv)
    if args.command == "reference":
        import uvicorn
        from .reference import create_reference
        print(f"Disposable {args.example} reference: http://127.0.0.1:{args.port}/ (use a different port from Unravel)")
        uvicorn.run(create_reference(args.variant, args.example), host="127.0.0.1", port=args.port)
        return 0
    if args.command == "browser":
        if args.action != "install":
            parser.error("Use unravel browser install.")
        import importlib.util
        if importlib.util.find_spec("playwright") is None:
            print('Install browser support with: python -m pip install "ravel-workshop[browser]" (or your wheel with [browser]).')
            return 1
        import subprocess, sys
        return subprocess.call([sys.executable, "-m", "playwright", "install", "chromium"])
    from dotenv import load_dotenv
    load_dotenv(Path.cwd() / ".env")
    home = storage_home(args.home)
    checks = diagnostics(home, args.port)
    if args.command == "doctor":
        for passed, message in checks:
            print(f"{'OK' if passed else 'FIX'}  {message}")
        return 0 if all(passed for passed, _ in checks) else 1
    failed = [message for passed, message in checks if not passed]
    if failed:
        for message in failed:
            print(message)
        return 1
    os.environ["RAVEL_HOME"] = str(home)
    try:
        run_server(home, args.port, args.command is None or args.open)
    except OSError:
        print("Unravel could not start. Run ravel doctor to check storage and the port.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

