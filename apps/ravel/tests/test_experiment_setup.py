import httpx
import pytest
from fastapi.testclient import TestClient

from apps.ravel.api import create_app
from apps.ravel import experiments

HEADERS = {"X-Ravel-Client": "workshop"}


@pytest.mark.parametrize("url", ["https://example.com", "http://user:pass@localhost:9000", "http://localhost:9000?token=secret"])
def test_reachability_rejects_nonlocal_or_private_urls(tmp_path, monkeypatch, url):
    def unexpected(*args, **kwargs):
        pytest.fail("Invalid app URL must not make a network request")
    monkeypatch.setattr(httpx, "AsyncClient", unexpected)
    with TestClient(create_app(tmp_path)) as client:
        result = client.post("/api/app/status", json={"url": url}, headers=HEADERS)
        assert result.status_code == 200 and not result.json()["reachable"]


@pytest.mark.parametrize("status,reachable", [(200, True), (302, False), (404, False), (503, False), (None, False)])
def test_app_reachability_is_live_and_does_not_follow_redirects(tmp_path, monkeypatch, status, reachable):
    original = httpx.AsyncClient
    def respond(request):
        assert request.url == "http://127.0.0.1:9000/"
        if status is None:
            raise httpx.ConnectError("unreachable", request=request)
        return httpx.Response(status, headers={"Location": "https://example.com"} if status == 302 else {})
    def client_factory(**kwargs):
        assert kwargs["follow_redirects"] is False and kwargs["trust_env"] is False
        return original(transport=httpx.MockTransport(respond), **kwargs)
    monkeypatch.setattr(httpx, "AsyncClient", client_factory)
    with TestClient(create_app(tmp_path)) as client:
        result = client.post("/api/app/status", json={"url": "http://127.0.0.1:9000/"}, headers=HEADERS).json()
        assert result["reachable"] is reachable
        if status is None:
            assert "Start it" in result["message"]


def test_browser_status_requires_a_chromium_binary(tmp_path, monkeypatch):
    from types import SimpleNamespace
    import sys
    executable = tmp_path / "chromium.exe"
    class Manager:
        def __enter__(self):
            return SimpleNamespace(chromium=SimpleNamespace(executable_path=str(executable)))
        def __exit__(self, *args):
            pass
    monkeypatch.setattr(experiments.importlib.util, "find_spec", lambda name: object())
    monkeypatch.setitem(sys.modules, "playwright.sync_api", SimpleNamespace(sync_playwright=Manager))
    assert not experiments.browser_status()["available"]
    executable.write_bytes(b"fixture")
    assert experiments.browser_status()["available"]


def test_missing_browser_extra_is_not_reported_as_ready(monkeypatch):
    monkeypatch.setattr(experiments.importlib.util, "find_spec", lambda name: None)
    assert not experiments.browser_status()["available"]
