"""Verify network boundaries with real Chromium and two disposable local servers."""
import asyncio
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import tempfile
from threading import Thread
from apps.ravel.experiments import run_browser


async def main():
    received = []
    class Destination(BaseHTTPRequestHandler):
        def do_GET(self):
            received.append(self.path)
            self.send_response(200); self.end_headers(); self.wfile.write(b"unapproved")
        def log_message(self, *args): pass
    destination = ThreadingHTTPServer(("127.0.0.1", 0), Destination)
    forbidden = f"http://127.0.0.1:{destination.server_port}"
    class Source(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/redirect":
                self.send_response(302); self.send_header("Location", forbidden + "/secret"); self.end_headers()
            else:
                self.send_response(200); self.send_header("Content-Type", "text/html"); self.end_headers()
                self.wfile.write(f'<p>Ready</p><script>fetch("{forbidden}/network").catch(()=>{{}})</script>'.encode())
        def log_message(self, *args): pass
    source = ThreadingHTTPServer(("127.0.0.1", 0), Source)
    for server in (source, destination): Thread(target=server.serve_forever, daemon=True).start()
    results = []
    try:
        with tempfile.TemporaryDirectory(prefix="unravel-origins-") as temporary:
            for path in ("/network", "/redirect"):
                recipe = {"feature_id":"fixture", "label":"Origin boundary", "url":f"http://127.0.0.1:{source.server_port}{path}", "scenario":"reload", "steps":[{"action":"wait","milliseconds":300}, {"action":"reload"}]}
                result = await run_browser(recipe, Path(temporary), path[1:], lambda: False, lambda event: None)
                assert result["blocked_requests"] > 0, result
                assert result["status"] in {"inconclusive", "execution_error"}, result
                assert not received, f"Unapproved server received requests: {received}"
                results.append({"case":path,"status":result["status"],"blocked_requests":result["blocked_requests"]})
    finally:
        for server in (source, destination): server.shutdown(); server.server_close()
    output = Path(__file__).resolve().parents[1] / ".local/unravel-origin-results.json"
    output.write_text(json.dumps(results, indent=2))
    print("PASS: unapproved fetch and redirect blocked; destination received zero requests.")


if __name__ == "__main__": asyncio.run(main())
