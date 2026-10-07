"""Observe the Search contract using real Chromium and disposable reference servers."""
import asyncio
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import urllib.request
from apps.ravel.experiments import run_browser

ROOT = Path(__file__).resolve().parents[1]


async def main():
    results = []
    with tempfile.TemporaryDirectory(prefix="unravel-search-") as temporary:
        home = Path(temporary)
        for variant in ("correct", "ambiguous", "broken"):
            with (home / f"{variant}.log").open("w") as log:
                server = subprocess.Popen([sys.executable, "-m", "apps.ravel.cli", "reference", "--example", "search", "--variant", variant, "--port", "8025"], cwd=ROOT, stdout=log, stderr=subprocess.STDOUT,
                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
                try:
                    for _ in range(100):
                        if server.poll() is not None: raise RuntimeError("Search reference exited before verification")
                        try:
                            urllib.request.urlopen("http://127.0.0.1:8025/", timeout=1).close()
                            break
                        except OSError: await asyncio.sleep(.1)
                    else: raise RuntimeError("Search reference did not start")
                    for scenario, expected, outcome in (
                        ("ordinary", "Results loaded" if variant == "correct" else "Search unavailable", "expectation_met"),
                        ("ordinary", "Search unavailable" if variant == "correct" else "Results loaded", "expectation_not_met"),
                        ("failure", "Search unavailable", "expectation_met"),
                    ):
                        recipe = {"feature_id": "search", "label": f"{variant} {scenario}", "url": "http://127.0.0.1:8025", "scenario": scenario, "request_path": "/api/search", "steps": [
                            {"action": "fill", "name": "Search query", "value": "React"}, {"action": "click", "name": "Search"}, {"action": "assert", "name": expected}]}
                        result = await run_browser(recipe, home, f"{variant}-{scenario}-{outcome}", lambda: False, lambda _: None)
                        assert result['status'] == outcome, result
                        status = 503 if scenario == 'failure' else 500 if variant == 'broken' else 200
                        assert any(r['path'] == '/api/search' and r['status'] == status for r in result['requests']), result
                        assert not any('body' in r for r in result['requests'])
                        results.append({"variant": variant, "scenario": scenario, "expected": expected, "status": result['status'], "request_status": status, "duration_ms": result['duration_ms']})
                finally:
                    server.terminate(); server.wait(timeout=10)
    output = ROOT / '.local/search-browser-results.json'
    output.parent.mkdir(exist_ok=True)
    output.write_text(json.dumps(results, indent=2), encoding='utf-8')
    print(f"PASS: {len(results)} real Search runs, including HTTP 200 with incompatible response shape. {output}")


if __name__ == '__main__': asyncio.run(main())
