from __future__ import annotations

import asyncio
import json

import pytest
from fastapi.testclient import TestClient

from apps.ravel.ai import validate_evidence
from apps.ravel.api import create_app
from apps.ravel.runner import available_profiles, profile_command, run_check
from apps.ravel.source import capture, difference, make_features, parse
from apps.ravel.storage import Storage
from apps.ravel.service import Workshop

HEADERS = {"X-Ravel-Client": "workshop"}


@pytest.fixture
def project(tmp_path):
    root = tmp_path / "project"
    root.mkdir()
    (root / "store.py").write_text("def save_draft(body):\n    return body\n")
    (root / "routes.py").write_text(
        'from fastapi import APIRouter\nfrom store import save_draft\nrouter = APIRouter()\n@router.post("/drafts")\ndef create_draft(body: str):\n    return save_draft(body)\n'
    )
    (root / "App.tsx").write_text(
        "import {useState} from 'react';\nexport function App() {const [body, setBody] = useState(''); return <textarea value={body} />;}\n"
    )
    (root / "package.json").write_text(
        json.dumps(
            {
                "scripts": {
                    "test": "node -e \"console.log('checked')\"",
                    "build": 'node -e "process.exit(1)"',
                    "dev": "node server.js",
                }
            }
        )
    )
    return root


def test_ingestion_excludes_secrets_binary_and_dependencies(project):
    (project / ".env").write_text("PRIVATE=not-for-the-model")
    (project / "secrets.json").write_text('{"private": "value"}')
    (project / "bad.py").write_bytes(b"\x00binary")
    (project / "large.py").write_text("x" * (512 * 1024 + 1))
    (project / "token.py").write_text('key="sk-ant-' + "a" * 25 + '"')
    (project / "node_modules").mkdir()
    (project / "node_modules" / "private.py").write_text("do_not_read = True")
    s = capture(project)
    paths = {f["path"] for f in s["files"]}
    assert {"routes.py", "App.tsx"} <= paths
    assert not paths & {
        ".env",
        "secrets.json",
        "bad.py",
        "large.py",
        "token.py",
        "node_modules/private.py",
    }
    assert s["excluded"]


def test_snapshot_changes_include_uncommitted_and_non_git_source(project):
    a = {**capture(project), "id": "a"}
    (project / "store.py").write_text(
        "def save_draft(body):\n    return body.strip()\n"
    )
    b = {**capture(project), "id": "b"}
    result = difference(a, b)
    assert a["commit"] is None and a["digest"] != b["digest"]
    assert [c["path"] for c in result["changes"]] == ["store.py"]
    assert "+    return body.strip()" in result["changes"][0]["diff"]


def test_parser_builds_evidenced_routes_symbols_and_imports(project):
    snapshot = capture(project)
    result = parse(snapshot["files"])
    assert any(s["name"] == "save_draft" and s["line"] == 1 for s in result["symbols"])
    assert any(
        e["from"] == "routes.py" and e["to"] == "store.py" for e in result["edges"]
    )
    assert result["routes"][0]["route"] == "/drafts"
    snapshot["analysis"] = result
    f = make_features(snapshot)
    assert any("store.py" in feature["paths"] for feature in f)
    assert any(feature["category"] == "Interface" for feature in f)


def test_parser_failure_preserves_source(project):
    (project / "broken.py").write_text("def unclosed(")
    s = capture(project)
    assert any("broken.py" in message for message in parse(s["files"])["warnings"])


def test_citation_validation_rejects_hallucinated_and_reversed_ranges():
    answer = {
        "summary": "An idea",
        "claims": [
            {
                "text": "A claim",
                "kind": "source",
                "citations": [{"path": "app.py", "line": 1, "end_line": 2}],
            }
        ],
        "questions": ["Why?"],
        "experiment": "Predict the result",
    }
    excerpts = [{"path": "app.py", "start_line": 1, "end_line": 3}]
    assert validate_evidence(answer, excerpts)["claims"]
    answer["claims"][0]["citations"][0]["path"] = "invented.py"
    with pytest.raises(ValueError):
        validate_evidence(answer, excerpts)
    answer["claims"][0]["citations"][0] = {"path": "app.py", "line": 3, "end_line": 1}
    with pytest.raises(ValueError):
        validate_evidence(answer, excerpts)


def test_storage_search_and_project_removal_preserve_source(tmp_path, project):
    db = Storage(tmp_path / "store.sqlite")
    p = db.create("projects", {"name": "Example"})
    s = db.create("snapshots", {"files": []}, project_id=p["id"])
    db.index(s["id"], [{"path": "store.py", "body": "draft persistence database"}])
    assert db.search(s["id"], "persistence") == ["store.py"]
    db.remove_project(p["id"])
    assert not db.get("projects", p["id"]) and not db.search(s["id"], "persistence")
    assert (project / "store.py").exists()
    db.engine.dispose()


def test_real_checks_pass_fail_and_reject_arbitrary_commands(project):
    profiles = available_profiles(project)
    assert not any(p["script"] == "dev" for p in profiles)
    passed = run_check(
        project,
        next(p for p in profiles if p["script"] == "test"),
        lambda: False,
        lambda _: None,
    )
    assert passed["status"] == "passed" and "checked" in passed["output"]
    failed = run_check(
        project,
        next(p for p in profiles if p["script"] == "build"),
        lambda: False,
        lambda _: None,
    )
    assert failed["status"] == "failed" and failed["exit_code"] == 1
    with pytest.raises(ValueError):
        profile_command(project, {"kind": "npm", "script": "test & delete", "cwd": "."})
    with pytest.raises(ValueError):
        profile_command(project, {"kind": "npm", "script": "test", "cwd": ".."})


def test_check_timeout_and_cancellation_terminate_process(project):
    (project / "package.json").write_text(
        json.dumps({"scripts": {"test": 'node -e "setInterval(()=>{},1000)"'}})
    )
    profile = {**available_profiles(project)[0], "timeout": 0.2}
    result = run_check(project, profile, lambda: False, lambda _: None)
    assert result["status"] == "timeout" and result["duration"] < 8
    result = run_check(
        project, {**profile, "timeout": 10}, lambda: True, lambda _: None
    )
    assert result["status"] == "cancelled" and result["duration"] < 8


def wait_job(client, job_id):
    import time

    for _ in range(100):
        job = client.get(f"/api/jobs/{job_id}").json()
        if job["status"] in {"completed", "failed", "cancelled", "interrupted"}:
            return job
        time.sleep(0.05)
    raise AssertionError("Job did not complete")


def test_refresh_upgrades_old_analysis_without_editing_source(tmp_path, project):
    with TestClient(create_app(tmp_path / "data")) as client:
        registered = client.post("/api/projects", json={"root": str(project)}, headers=HEADERS).json()
        first = wait_job(client, registered["job_id"])["result"]["snapshot_id"]
        old = client.app.state.db.get("snapshots", first)
        analysis = dict(old["analysis"])
        analysis.pop("version")
        client.app.state.db.patch("snapshots", first, {"analysis": analysis})
        refresh = client.post(f"/api/projects/{registered['id']}/snapshots", headers=HEADERS).json()
        second = wait_job(client, refresh["id"])["result"]["snapshot_id"]
        assert second != first
        assert client.app.state.db.get("snapshots", second)["digest"] == old["digest"]
        unchanged = client.post(f"/api/projects/{registered['id']}/snapshots", headers=HEADERS).json()
        assert wait_job(client, unchanged["id"])["result"]["unchanged"]


def test_complete_local_journey_snapshot_notes_compare_checks_export(
    tmp_path, project, monkeypatch
):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    app = create_app(tmp_path / "data")
    with TestClient(app) as client:
        registered = client.post(
            "/api/projects", json={"root": str(project)}, headers=HEADERS
        )
        assert registered.status_code == 201
        p = registered.json()
        assert wait_job(client, p["job_id"])["status"] == "completed"
        same = client.post(f"/api/projects/{p['id']}/snapshots", headers=HEADERS).json()
        assert wait_job(client, same["id"])["result"]["unchanged"]
        assert client.get(f"/api/projects/{p['id']}").json()["status"] == "ready"
        feature = next(
            f
            for f in client.get(f"/api/projects/{p['id']}/features").json()
            if "store.py" in f["paths"]
        )
        inv = client.post(
            "/api/investigations", json={"feature_id": feature["id"]}, headers=HEADERS
        ).json()
        assert (
            client.get(
                f"/api/snapshots/{inv['snapshot_id']}/source",
                params={"path": "../.env"},
            ).status_code
            == 404
        )
        updated = client.patch(
            f"/api/investigations/{inv['id']}",
            json={
                "note": "I traced the request",
                "prediction": "A strip removes whitespace",
            },
            headers=HEADERS,
        )
        assert updated.status_code == 200
        saved = client.post(
            f"/api/investigations/{inv['id']}/discoveries",
            json={
                "title": "A request becomes a record",
                "body": "I found the save function",
            },
            headers=HEADERS,
        )
        assert saved.status_code == 201
        assert (
            client.post(
                f"/api/investigations/{inv['id']}/questions",
                json={"question": "What happens here?", "consent": False},
                headers=HEADERS,
            ).status_code
            == 400
        )
        assert (
            client.post(
                f"/api/investigations/{inv['id']}/questions",
                json={"question": "What happens here?", "consent": True},
                headers=HEADERS,
            ).status_code
            == 503
        )
        (project / "store.py").write_text(
            "def save_draft(body):\n    return body.strip()\n"
        )
        job = client.post(f"/api/projects/{p['id']}/snapshots", headers=HEADERS).json()
        refreshed = wait_job(client, job["id"])
        assert refreshed["status"] == "completed"
        latest = refreshed["result"]["snapshot_id"]
        assert client.get(f"/api/investigations/{inv['id']}").json()["outdated"]
        comparison = client.get(
            f"/api/snapshots/{inv['snapshot_id']}/compare/{latest}"
        ).json()
        assert comparison["changes"][0]["path"] == "store.py"
        profile = next(
            f
            for f in client.get(f"/api/projects/{p['id']}/profiles").json()
            if f["script"] == "test"
        )
        payload = {"profile_id": profile["id"], "investigation_id": inv["id"]}
        assert (
            client.post("/api/checks", json=payload, headers=HEADERS).status_code == 400
        )
        client.patch(
            f"/api/projects/{p['id']}/trust", json={"trusted": True}, headers=HEADERS
        )
        check = client.post("/api/checks", json=payload, headers=HEADERS).json()
        assert wait_job(client, check["job_id"])["status"] == "completed"
        assert (
            client.get(f"/api/investigations/{inv['id']}/checks").json()[0]["status"]
            == "passed"
        )
        assert client.get(f"/api/investigations/{inv['id']}/checks").json()[0][
            "snapshot_outdated"
        ]
        assert (
            "A request becomes a record"
            in client.get(f"/api/investigations/{inv['id']}/export").text
        )
        events = client.get(f"/api/jobs/{check['job_id']}/events").text
        assert "checked" in events and "id:" in events
        import re

        first_event = int(re.findall(r"id: (\d+)", events)[0])
        resumed = client.get(
            f"/api/jobs/{check['job_id']}/events",
            headers={"Last-Event-ID": str(first_event)},
        ).text
        assert all(int(n) > first_event for n in re.findall(r"id: (\d+)", resumed))
        client.delete(f"/api/projects/{p['id']}", headers=HEADERS)
        assert project.exists()


def test_host_origin_mutation_protection_and_api_404(tmp_path):
    with TestClient(create_app(tmp_path / "data")) as client:
        assert (
            client.post("/api/projects", json={"root": str(tmp_path)}).status_code
            == 403
        )
        assert (
            client.get(
                "/api/settings", headers={"Origin": "https://attacker.example"}
            ).status_code
            == 403
        )
        assert (
            client.get(
                "/api/settings", headers={"Host": "attacker.example"}
            ).status_code
            == 400
        )
        assert client.get("/api/missing").status_code == 404
        assert "api_key" not in client.get("/api/settings").text.lower()


@pytest.mark.asyncio
async def test_worker_recovers_indexing_but_does_not_rerun_interrupted_check(
    tmp_path, project
):
    db = Storage(tmp_path / "data.sqlite")
    p = db.create(
        "projects", {"root": str(project), "name": "Recovery", "trusted": True}
    )
    workshop = Workshop(db)
    indexed = workshop.enqueue("snapshot", p["id"], {})
    db.patch("jobs", indexed["id"], {"status": "running"})
    check = db.create("checks", {"status": "running"}, project_id=p["id"])
    j = workshop.enqueue("check", p["id"], {"check_id": check["id"]})
    db.patch("jobs", j["id"], {"status": "running"})
    task = asyncio.create_task(workshop.worker())
    for _ in range(100):
        if db.get("jobs", indexed["id"])["status"] == "completed":
            break
        await asyncio.sleep(0.03)
    workshop.stopping = True
    await task
    assert db.get("jobs", indexed["id"])["status"] == "completed"
    assert db.get("jobs", j["id"])["status"] == "interrupted"
    assert db.get("checks", check["id"])["status"] == "interrupted"
    db.engine.dispose()


def test_migrations_are_repeatable_and_preserve_notes(tmp_path):
    path = tmp_path / "workshop.sqlite"
    db = Storage(path)
    note = db.create("discoveries", {"title": "Keep me", "body": "A discovery"})
    db.engine.dispose()
    reopened = Storage(path)
    assert reopened.get("discoveries", note["id"])["body"] == "A discovery"
    with reopened.engine.connect() as connection:
        assert (
            connection.exec_driver_sql(
                "SELECT version_num FROM ravel_alembic_version"
            ).scalar()
            == "0002_experiments"
        )
    reopened.engine.dispose()


def test_changes_during_check_are_recorded(project):
    def edit_on_output(event):
        if event["type"] == "log":
            (project / "store.py").write_text(
                "def save_draft(body):\n    return body.strip()\n"
            )

    profile = next(p for p in available_profiles(project) if p["script"] == "test")
    result = run_check(project, profile, lambda: False, edit_on_output)
    assert result["status"] == "passed" and result["source_changed"]


def test_first_use_invalid_duplicate_and_unsupported_projects(tmp_path):
    root = tmp_path / "unsupported"
    root.mkdir()
    (root / "readme.md").write_text("A folder without supported feature source")
    with TestClient(create_app(tmp_path / "data")) as client:
        missing = client.post("/api/projects", json={"root": str(tmp_path / "missing")}, headers=HEADERS)
        assert missing.status_code == 400 and "could not be found" in missing.text
        file = client.post("/api/projects", json={"root": str(root / "readme.md")}, headers=HEADERS)
        assert file.status_code == 400 and "folder" in file.text
        project = client.post("/api/projects", json={"root": str(root)}, headers=HEADERS).json()
        assert wait_job(client, project["job_id"])["status"] == "completed"
        features = client.get(f"/api/projects/{project['id']}/features").json()
        assert all(f["category"] == "Source exploration" for f in features)
        assert features[0]["paths"] == ["readme.md"]
        duplicate = client.post("/api/projects", json={"root": str(root)}, headers=HEADERS)
        assert duplicate.status_code == 409 and "already connected" in duplicate.text


def test_failed_recapture_preserves_source_and_can_retry(tmp_path, project, monkeypatch):
    with TestClient(create_app(tmp_path / "data")) as client:
        p = client.post("/api/projects", json={"root": str(project)}, headers=HEADERS).json()
        assert wait_job(client, p["job_id"])["status"] == "completed"
        snapshot = client.get(f"/api/projects/{p['id']}").json()["latest_snapshot_id"]
        original = client.get(f"/api/snapshots/{snapshot}/source?path=routes.py").json()["body"]
        with monkeypatch.context() as patch:
            def denied(*args, **kwargs):
                raise PermissionError("private error text")
            patch.setattr("apps.ravel.service.capture", denied)
            retry = client.post(f"/api/projects/{p['id']}/snapshots", headers=HEADERS).json()
            failed = wait_job(client, retry["id"])
            assert failed["status"] == "failed" and "private error text" not in str(failed)
            assert client.get(f"/api/snapshots/{snapshot}/source?path=routes.py").json()["body"] == original
        retry = client.post(f"/api/projects/{p['id']}/snapshots", headers=HEADERS).json()
        assert wait_job(client, retry["id"])["status"] == "completed"
        assert client.get(f"/api/projects/{p['id']}").json()["status"] == "ready"

