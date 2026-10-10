from __future__ import annotations

import asyncio
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware

from .runner import available_profiles
from .service import Workshop
from .source import difference
from .storage import Storage
from .assets import frontend_directory


class ProjectInput(BaseModel):
    root: str = Field(min_length=1, max_length=4096)
    name: str = Field(default="", max_length=100)


class InvestigationInput(BaseModel):
    feature_id: str


class InvestigationUpdate(BaseModel):
    note: str | None = Field(default=None, max_length=20000)
    prediction: str | None = Field(default=None, max_length=20000)
    selected_path: str | None = None


class QuestionInput(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    consent: bool = False


class DiscoveryInput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=20000)


class CheckInput(BaseModel):
    profile_id: str
    investigation_id: str


class TrustInput(BaseModel):
    trusted: bool


class Resource(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str
    created_at: str
    updated_at: str
    project_id: str | None = None
    snapshot_id: str | None = None
    parent_id: str | None = None


class ProjectResource(Resource):
    name: str
    root: str
    status: str
    trusted: bool
    latest_snapshot_id: str | None = None
    file_count: int
    feature_count: int
    job_id: str | None = None


class FeatureResource(Resource):
    title: str
    description: str
    category: str
    paths: list[str]
    questions: list[str]
    entry_line: int
    edge_count: int = 0


class InvestigationResource(Resource):
    title: str
    feature_id: str
    paths: list[str]
    questions: list[str]
    note: str
    prediction: str
    selected_path: str
    answers: list[dict]
    outdated: bool


class DiscoveryResource(Resource):
    title: str
    body: str
    outdated: bool


class SnapshotResource(Resource):
    digest: str
    commit: str | None
    dirty: bool
    excluded: list[dict]


class JobResource(Resource):
    kind: str
    status: str
    message: str
    result: dict | None = None


class ProfileResource(Resource):
    label: str
    kind: str
    script: str
    cwd: str
    timeout: int


class CheckResource(Resource):
    label: str
    status: str
    output: str
    source_changed: bool


def create_app(home: Path | None = None) -> FastAPI:
    home = home or Path(os.getenv("RAVEL_HOME", str(Path.home() / ".ravel")))
    db = Storage(home / "ravel.sqlite")
    workshop = Workshop(db)

    @asynccontextmanager
    async def lifespan(app):
        task = asyncio.create_task(workshop.worker())
        yield
        workshop.stopping = True
        await task
        db.engine.dispose()

    app = FastAPI(
        title="Unravel local workshop",
        version="0.2.0",
        lifespan=lifespan,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )
    app.state.db = db
    app.state.workshop = workshop
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "testserver"]
    )

    @app.middleware("http")
    async def protect_local_files(request: Request, call_next):
        # Browsers must have same-origin access; scriptless cross-site forms cannot mutate.
        origin = request.headers.get("origin")
        allowed = {
            f"{request.url.scheme}://{request.url.netloc}",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        }
        if origin and origin not in allowed:
            return JSONResponse(
                {"detail": "This local workshop does not accept cross-site requests."},
                status_code=403,
            )
        if (
            request.method not in {"GET", "HEAD", "OPTIONS"}
            and request.headers.get("x-ravel-client") != "workshop"
        ):
            return JSONResponse(
                {"detail": "Use the Ravel local application for this operation."},
                status_code=403,
            )
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "same-origin"
        return response

    api = APIRouter(prefix="/api")

    def require(kind: str, identifier: str) -> dict:
        value = db.get(kind, identifier)
        if not value:
            raise HTTPException(404, "This item is no longer available.")
        return value

    @api.get("/settings")
    def settings():
        return {
            "mode": "local",
            "provider": "Anthropic",
            "model": os.getenv("RAVEL_MODEL", "claude-sonnet-4-6"),
            "ai_connected": bool(os.getenv("ANTHROPIC_API_KEY")),
            "storage": str(db.path),
            "supported": ["React", "JavaScript", "TypeScript", "Python", "FastAPI"],
            "privacy": "Selected code excerpts are sent to your AI provider only when you ask with consent. Source reading and notes stay local.",
        }

    @api.get("/projects", response_model=list[ProjectResource])
    def projects():
        return db.list("projects")

    @api.post("/projects", response_model=ProjectResource, status_code=201)
    def register(payload: ProjectInput):
        try:
            root = Path(payload.root).expanduser().resolve(strict=True)
        except (OSError, ValueError):
            raise HTTPException(400, "That folder could not be found on this computer.")
        if not root.is_dir():
            raise HTTPException(400, "Choose a project folder.")
        if not Path(payload.root).expanduser().is_absolute():
            raise HTTPException(400, "Use the full absolute folder path.")
        if any(os.path.normcase(p["root"]) == os.path.normcase(str(root)) for p in db.list("projects")):
            raise HTTPException(409, "This project is already connected.")
        project = db.create(
            "projects",
            {
                "root": str(root),
                "name": payload.name.strip() or root.name,
                "status": "indexing",
                "trusted": False,
                "latest_snapshot_id": None,
                "file_count": 0,
                "feature_count": 0,
            },
        )
        job = workshop.enqueue("snapshot", project["id"], {})
        return {**project, "job_id": job["id"]}

    @api.get("/projects/{project_id}", response_model=ProjectResource)
    def project(project_id: str):
        return require("projects", project_id)

    @api.delete("/projects/{project_id}", status_code=204)
    def remove(project_id: str):
        require("projects", project_id)
        if any(
            j["status"] in {"queued", "running"} or j["id"] == workshop.active_job
            for j in db.list("jobs", project_id=project_id)
        ):
            raise HTTPException(
                409, "Wait for active work or cancel it before disconnecting."
            )
        artifact_root = (home / "artifacts").resolve()
        for artifact in db.list("artifacts", project_id=project_id):
            file = (artifact_root / artifact["filename"]).resolve()
            if file.is_relative_to(artifact_root):
                file.unlink(missing_ok=True)
        db.remove_project(project_id)
        return Response(status_code=204)

    @api.patch("/projects/{project_id}/trust", response_model=ProjectResource)
    def trust(project_id: str, payload: TrustInput):
        require("projects", project_id)
        return db.patch("projects", project_id, {"trusted": payload.trusted})

    @api.post(
        "/projects/{project_id}/snapshots", response_model=JobResource, status_code=202
    )
    def refresh(project_id: str):
        require("projects", project_id)
        existing = next(
            (
                j
                for j in db.list("jobs", project_id=project_id)
                if j["kind"] == "snapshot" and j["status"] in {"queued", "running"}
            ),
            None,
        )
        return existing or workshop.enqueue("snapshot", project_id, {})

    @api.get("/projects/{project_id}/snapshots", response_model=list[SnapshotResource])
    def snapshots(project_id: str):
        require("projects", project_id)
        return [
            {k: v for k, v in s.items() if k not in {"files", "analysis"}}
            for s in db.list("snapshots", project_id=project_id)
        ]

    @api.get("/snapshots/{snapshot_id}", response_model=SnapshotResource)
    def snapshot(snapshot_id: str):
        value = require("snapshots", snapshot_id)
        return {
            **value,
            "files": [
                {k: v for k, v in f.items() if k != "body"} for f in value["files"]
            ],
        }

    @api.get("/snapshots/{snapshot_id}/source")
    def source(snapshot_id: str, path: str):
        snapshot = require("snapshots", snapshot_id)
        f = next((f for f in snapshot["files"] if f["path"] == path), None)
        if not f:
            raise HTTPException(404, "This file was not included in this snapshot.")
        return f

    @api.get("/snapshots/{snapshot_id}/compare/{other_id}")
    def compare(snapshot_id: str, other_id: str):
        a, b = require("snapshots", snapshot_id), require("snapshots", other_id)
        if a["project_id"] != b["project_id"]:
            raise HTTPException(400, "Compare versions of the same project.")
        return difference(a, b)

    @api.get("/projects/{project_id}/features", response_model=list[FeatureResource])
    def features(project_id: str):
        p = require("projects", project_id)
        return (
            db.list("features", snapshot_id=p["latest_snapshot_id"])
            if p["latest_snapshot_id"]
            else []
        )

    @api.get(
        "/projects/{project_id}/investigations",
        response_model=list[InvestigationResource],
    )
    def investigations(project_id: str):
        require("projects", project_id)
        return db.list("investigations", project_id=project_id)

    @api.post("/investigations", response_model=InvestigationResource, status_code=201)
    def start(payload: InvestigationInput):
        f = require("features", payload.feature_id)
        existing = next(
            (
                i
                for i in db.list("investigations", snapshot_id=f["snapshot_id"])
                if i["feature_id"] == f["id"]
            ),
            None,
        )
        return existing or db.create(
            "investigations",
            {
                "title": f["title"],
                "feature_id": f["id"],
                "paths": f["paths"],
                "questions": f["questions"],
                "note": "",
                "prediction": "",
                "selected_path": f["paths"][0] if f["paths"] else "",
                "answers": [],
                "outdated": False,
            },
            project_id=f["project_id"],
            snapshot_id=f["snapshot_id"],
        )

    @api.get("/investigations/{investigation_id}", response_model=InvestigationResource)
    def investigation(investigation_id: str):
        return require("investigations", investigation_id)

    @api.patch(
        "/investigations/{investigation_id}", response_model=InvestigationResource
    )
    def annotate(investigation_id: str, payload: InvestigationUpdate):
        inv = require("investigations", investigation_id)
        snapshot = require("snapshots", inv["snapshot_id"])
        if payload.selected_path is not None and payload.selected_path not in {
            f["path"] for f in snapshot["files"]
        }:
            raise HTTPException(400, "Select a file in this investigation.")
        return db.patch(
            "investigations", investigation_id, payload.model_dump(exclude_none=True)
        )

    @api.post(
        "/investigations/{investigation_id}/questions",
        response_model=JobResource,
        status_code=202,
    )
    def ask(investigation_id: str, payload: QuestionInput):
        inv = require("investigations", investigation_id)
        if not payload.consent:
            raise HTTPException(
                400,
                "Confirm that selected code excerpts may be sent to your AI provider.",
            )
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise HTTPException(
                503,
                "Set ANTHROPIC_API_KEY and restart Ravel to ask AI questions. Source reading and notes remain available.",
            )
        return workshop.enqueue(
            "explain",
            inv["project_id"],
            {"investigation_id": investigation_id, "question": payload.question},
        )

    @api.get(
        "/investigations/{investigation_id}/discoveries",
        response_model=list[DiscoveryResource],
    )
    def discoveries(investigation_id: str):
        require("investigations", investigation_id)
        return db.list("discoveries", parent_id=investigation_id)

    @api.post(
        "/investigations/{investigation_id}/discoveries",
        response_model=DiscoveryResource,
        status_code=201,
    )
    def save(investigation_id: str, payload: DiscoveryInput):
        inv = require("investigations", investigation_id)
        return db.create(
            "discoveries",
            {**payload.model_dump(), "outdated": inv["outdated"]},
            project_id=inv["project_id"],
            snapshot_id=inv["snapshot_id"],
            parent_id=investigation_id,
        )

    @api.get("/projects/{project_id}/profiles", response_model=list[ProfileResource])
    def profiles(project_id: str):
        p = require("projects", project_id)
        found = available_profiles(Path(p["root"]))
        saved = db.list("profiles", project_id=project_id)
        results = []
        for f in found:
            previous = next(
                (
                    s
                    for s in saved
                    if all(s[k] == f[k] for k in ["kind", "script", "cwd"])
                ),
                None,
            )
            results.append(previous or db.create("profiles", f, project_id=project_id))
        return results

    @api.post("/checks", response_model=CheckResource, status_code=202)
    def check(payload: CheckInput):
        inv, profile = (
            require("investigations", payload.investigation_id),
            require("profiles", payload.profile_id),
        )
        if inv["project_id"] != profile["project_id"]:
            raise HTTPException(400, "Select a check from this project.")
        p = require("projects", inv["project_id"])
        if not p["trusted"]:
            raise HTTPException(
                400,
                "Trust this local project before executing its check commands. They are not sandboxed.",
            )
        c = db.create(
            "checks",
            {
                "profile_id": profile["id"],
                "label": profile["label"],
                "status": "queued",
                "output": "",
                "source_changed": False,
            },
            project_id=inv["project_id"],
            snapshot_id=inv["snapshot_id"],
            parent_id=inv["id"],
        )
        j = workshop.enqueue(
            "check",
            inv["project_id"],
            {"profile_id": profile["id"], "check_id": c["id"]},
        )
        return {**c, "job_id": j["id"]}

    @api.get(
        "/investigations/{investigation_id}/checks", response_model=list[CheckResource]
    )
    def checks(investigation_id: str):
        require("investigations", investigation_id)
        return db.list("checks", parent_id=investigation_id)

    @api.get("/jobs/{job_id}", response_model=JobResource)
    def job(job_id: str):
        return require("jobs", job_id)

    @api.post("/jobs/{job_id}/cancel", response_model=JobResource)
    def cancel(job_id: str):
        j = require("jobs", job_id)
        if j["status"] in {"queued", "running"}:
            db.patch("jobs", job_id, {"status": "cancelled", "message": "Cancelled"})
            if j["kind"] == "snapshot" and j["status"] == "queued":
                p = require("projects", j["project_id"])
                db.patch(
                    "projects",
                    p["id"],
                    {"status": "ready" if p.get("latest_snapshot_id") else "cancelled"},
                )
            if j["kind"] == "check":
                db.patch("checks", j["payload"]["check_id"], {"status": "cancelled"})
            if j["kind"] == "experiment" and j["status"] == "queued":
                db.patch("experiment_runs", j["payload"]["run_id"], {"status": "cancelled", "message": "Cancelled before starting."})
            db.emit(
                job_id,
                {"type": "complete", "status": "cancelled", "message": "Cancelled"},
            )
        return require("jobs", job_id)

    @api.get("/jobs/{job_id}/events")
    async def events(job_id: str, request: Request, after: int = 0):
        require("jobs", job_id)
        try:
            cursor = max(after, int(request.headers.get("last-event-id", "0")))
        except ValueError:
            cursor = after

        async def stream():
            nonlocal cursor
            while not await request.is_disconnected():
                for e in db.event_list(job_id, cursor):
                    cursor = e["id"]
                    yield f"id: {cursor}\ndata: {json.dumps(e)}\n\n"
                if require("jobs", job_id)["status"] in {
                    "completed",
                    "failed",
                    "cancelled",
                    "interrupted",
                }:
                    break
                yield ": keepalive\n\n"
                await asyncio.sleep(0.3)

        return StreamingResponse(
            stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"},
        )

    @api.get("/investigations/{investigation_id}/export")
    def export(investigation_id: str, format: Literal["markdown", "json"] = "markdown"):
        inv = require("investigations", investigation_id)
        notes, checks = (
            db.list("discoveries", parent_id=investigation_id),
            db.list("checks", parent_id=investigation_id),
        )
        data = {"investigation": inv, "discoveries": notes, "checks": checks}
        if format == "json":
            return Response(
                json.dumps(data, indent=2),
                media_type="application/json",
                headers={
                    "Content-Disposition": 'attachment; filename="ravel-investigation.json"'
                },
            )
        parts = [
            f"# {inv['title']}",
            f"Snapshot: {inv['snapshot_id']}",
            "## Notes",
            inv.get("note", ""),
            "## Prediction",
            inv.get("prediction", ""),
            "## Discoveries",
        ]
        if inv["outdated"]:
            parts.insert(
                2,
                "Source changed since this investigation. Its explanations refer to the original snapshot.",
            )
        for note in notes:
            parts += [
                f"### {note['title']}",
                note["body"],
                "Potentially outdated." if note["outdated"] else "",
            ]
        for answer in inv["answers"]:
            parts += [
                "## Explanation",
                answer["summary"],
                "AI explanation; source-backed and inferred claims require review.",
            ]
            for claim in answer["claims"]:
                parts.append(
                    f"- [{claim['kind']}] {claim['text']} — "
                    + ", ".join(
                        f"{c['path']}:{c['line']}-{c['end_line']}"
                        for c in claim["citations"]
                    )
                )
        parts.append("## Recorded checks")
        for check in checks:
            parts += [
                f"### {check['label']}: {check['status']}",
                check.get("scope", "Only this check was run."),
            ]
            if check.get("source_changed") or check.get("snapshot_outdated"):
                parts.append(
                    "Source changed or differs from the investigation snapshot; this result does not verify the original evidence."
                )
            parts += [
                f"Source before: {check.get('before_digest', 'not recorded')}; after: {check.get('after_digest', 'not recorded')}",
                "```text\n" + check["output"].replace("```", "'''") + "\n```",
            ]
        return Response(
            "\n\n".join(parts),
            media_type="text/markdown",
            headers={
                "Content-Disposition": 'attachment; filename="ravel-investigation.md"'
            },
        )

    app.include_router(api)
    from .experiment_api import router as experiment_router
    app.include_router(experiment_router(db, workshop, home))

    @app.get("/healthz")
    def health():
        return {"status": "ok", "product": "Ravel"}

    dist = frontend_directory()

    @app.get("/{path:path}")
    def frontend(path: str):
        if path == "api" or path.startswith("api/"):
            raise HTTPException(404, "Unknown API endpoint.")
        file = (dist / path).resolve()
        if file.is_relative_to(dist.resolve()) and file.is_file():
            return FileResponse(file)
        index = (file / "index.html").resolve()
        if index.is_relative_to(dist.resolve()) and index.is_file():
            return FileResponse(index)
        if dist.joinpath("index.html").exists():
            return FileResponse(dist / "index.html")
        raise HTTPException(404, "Build the frontend first: cd byline && npm run build")

    return app

