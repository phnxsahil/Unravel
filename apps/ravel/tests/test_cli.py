import asyncio
from pathlib import Path
import socket

import pytest

from apps.ravel import assets, cli


def test_packaged_assets_win_and_development_falls_back(tmp_path, monkeypatch):
    package = tmp_path / "apps" / "ravel"
    package.mkdir(parents=True)
    monkeypatch.setattr(assets, "__file__", str(package / "assets.py"))
    assert assets.frontend_directory() == tmp_path / "byline" / "dist"
    (package / "_web").mkdir()
    (package / "_web" / "index.html").write_text("ready")
    assert assets.frontend_directory() == package / "_web"


@pytest.mark.parametrize("arguments,launch", [([], True), (["serve"], False), (["serve", "--open"], True)])
def test_launch_commands_keep_compatibility(arguments, launch, tmp_path, monkeypatch):
    monkeypatch.setattr(cli, "diagnostics", lambda *_: [(True, "ready")])
    calls = []
    monkeypatch.setattr(cli, "run_server", lambda *args: calls.append(args))
    assert cli.main(arguments + ["--home", str(tmp_path), "--port", "8123"]) == 0
    assert calls == [(tmp_path.resolve(), 8123, launch)]


def test_doctor_reports_failures_without_provider_secrets(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "secret-test-value")
    monkeypatch.setattr(cli, "frontend_directory", lambda: tmp_path / "missing")
    assert cli.main(["doctor", "--home", str(tmp_path), "--port", "8124"]) == 1
    output = capsys.readouterr().out
    assert "interface is missing" in output
    assert "secret-test-value" not in output


def test_occupied_port_and_unwritable_storage_have_recovery(tmp_path, monkeypatch):
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        listener.listen()
        passed, message = cli.check_port(listener.getsockname()[1])
        assert not passed and "--port" in message
    def denied(**_):
        raise PermissionError("private diagnostic")
    monkeypatch.setattr(cli.tempfile, "TemporaryFile", denied)
    passed, message = cli.check_storage(tmp_path)
    assert not passed and "--home" in message
    assert "private diagnostic" not in message


def test_browser_failure_keeps_the_local_address(monkeypatch, capsys):
    monkeypatch.setattr(cli.webbrowser, "open", lambda _: False)
    assert not cli.open_browser("http://127.0.0.1:8125/projects")
    assert "http://127.0.0.1:8125/projects" in capsys.readouterr().out


def test_browser_launch_happens_after_server_start(tmp_path, monkeypatch):
    import uvicorn
    from apps.ravel import api
    order = []
    monkeypatch.setattr(api, "create_app", lambda _: object())
    async def startup(server, sockets=None):
        order.append("ready")
        server.started = True
    monkeypatch.setattr(uvicorn.Server, "startup", startup)
    monkeypatch.setattr(uvicorn.Server, "run", lambda server: asyncio.run(server.startup()))
    monkeypatch.setattr(cli, "open_browser", lambda _: order.append("browser"))
    cli.run_server(tmp_path, 8126, True)
    assert order == ["ready", "browser"]


@pytest.mark.parametrize("port", ["0", "65536", "abc"])
def test_invalid_ports_are_rejected(port):
    with pytest.raises(SystemExit):
        cli.main(["serve", "--port", port])
