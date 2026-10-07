from fastapi.testclient import TestClient

from apps.ravel.api import create_app


def test_generated_guides_and_spa_fallback_resolve_inside_assets(tmp_path, monkeypatch):
    web = tmp_path / "web"
    guide = web / "docs" / "quick-start"
    guide.mkdir(parents=True)
    (web / "index.html").write_text("landing shell")
    (guide / "index.html").write_text("readable setup guide")
    (web / "app.js").write_text("bundled javascript")
    monkeypatch.setattr("apps.ravel.api.frontend_directory", lambda: web)
    with TestClient(create_app(tmp_path / "data")) as client:
        assert client.get("/docs/quick-start").text == "readable setup guide"
        assert client.get("/docs/quick-start/").text == "readable setup guide"
        assert client.get("/projects/example/explore/item").text == "landing shell"
        assert client.get("/app.js").text == "bundled javascript"
        assert client.get("/api/unknown").status_code == 404
        assert client.get("/%2e%2e/private.txt").text == "landing shell"
