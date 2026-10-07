from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, Response
from .experiments import RecipeInput, RunInput, browser_status, origin
from .maps import feature_map, FeatureMap
from .recipe_suggestions import recipe_suggestion, RecipeSuggestion


def router(db, workshop, home: Path):
    api = APIRouter(prefix="/api")
    def require(kind, identifier):
        item = db.get(kind, identifier)
        if not item:
            raise HTTPException(404, "This item is no longer available.")
        return item

    @api.get("/browser/status")
    def browser():
        return browser_status()

    @api.get("/features/{feature_id}/map", response_model=FeatureMap)
    def map_for_feature(feature_id: str):
        feature = require("features", feature_id)
        return feature_map(require("snapshots", feature["snapshot_id"]), feature)

    @api.get("/projects/{project_id}/recipes")
    def recipes(project_id: str):
        require("projects", project_id)
        return db.list("recipes", project_id=project_id)

    @api.get("/features/{feature_id}/recipe-suggestion", response_model=RecipeSuggestion)
    def suggest_recipe(feature_id: str):
        feature = require("features", feature_id)
        return recipe_suggestion(require("snapshots", feature["snapshot_id"]), feature)

    @api.post("/projects/{project_id}/recipes", status_code=201)
    def create_recipe(project_id: str, payload: RecipeInput, request: Request):
        project = require("projects", project_id)
        feature = require("features", payload.feature_id)
        if feature["project_id"] != project_id:
            raise HTTPException(400, "Choose an action from this project.")
        try:
            own = origin(str(request.base_url))
        except ValueError:
            own = ""  # TestClient's trusted testserver is not a runnable app origin.
        if own in payload.approved_origins:
            raise HTTPException(400, "Choose your development app's port, not the Unravel interface.")
        return db.create("recipes", payload.model_dump(), project_id=project_id, snapshot_id=feature["snapshot_id"], parent_id=feature["id"])

    @api.post("/recipes/{recipe_id}/runs", status_code=202)
    def execute(recipe_id: str, payload: RunInput):
        recipe = require("recipes", recipe_id)
        project = require("projects", recipe["project_id"])
        if not payload.approved or not payload.disposable_data or not project["trusted"]:
            raise HTTPException(400, "Trust this project, approve the steps and confirm disposable development data before running.")
        if not browser_status()["available"]:
            raise HTTPException(503, browser_status()["message"])
        active = next((r for r in db.list("experiment_runs", project_id=project["id"]) if r["status"] in {"queued", "running"}), None)
        if active:
            raise HTTPException(409, "Wait for the current experiment or cancel it first.")
        run = db.create("experiment_runs", {"recipe_id": recipe_id, "label": recipe["label"], "status": "queued",
            "message": "Waiting to start", "events": [], "requests": [], "assertions": [], "artifact_ids": []},
            project_id=project["id"], snapshot_id=recipe["snapshot_id"], parent_id=recipe_id)
        job = workshop.enqueue("experiment", project["id"], {"run_id": run["id"], "recipe_id": recipe_id})
        db.patch("experiment_runs", run["id"], {"job_id": job["id"]})
        return {**run, "job_id": job["id"]}

    @api.get("/projects/{project_id}/experiment-runs")
    def runs(project_id: str):
        require("projects", project_id)
        return db.list("experiment_runs", project_id=project_id)

    @api.get("/experiment-runs/{run_id}")
    def run(run_id: str):
        return require("experiment_runs", run_id)

    @api.get("/artifacts/{artifact_id}")
    def artifact(artifact_id: str):
        item = require("artifacts", artifact_id)
        root = (home / "artifacts").resolve()
        file = (root / item["filename"]).resolve()
        if not file.is_relative_to(root) or not file.is_file():
            raise HTTPException(404, "This artifact was deleted or is unavailable.")
        return FileResponse(file, media_type="image/png", headers={"Cache-Control": "no-store"})

    @api.delete("/experiment-runs/{run_id}/artifacts", status_code=204)
    def delete_artifacts(run_id: str):
        run = require("experiment_runs", run_id)
        if run["status"] in {"queued", "running"}:
            raise HTTPException(409, "Wait for the experiment to finish before deleting its artifacts.")
        root = (home / "artifacts").resolve()
        for item in db.list("artifacts", parent_id=run_id):
            file = (root / item["filename"]).resolve()
            if file.is_relative_to(root):
                file.unlink(missing_ok=True)
            db.patch("artifacts", item["id"], {"deleted": True})
        db.patch("experiment_runs", run_id, {"artifact_ids": []})
        return Response(status_code=204)

    @api.get("/projects/{project_id}/walkthrough")
    def walkthrough(project_id: str):
        project = require("projects", project_id)
        parts = [f"# {project['name']} — Unravel walkthrough", "Source-backed explanations and bounded observations; unresolved questions remain explicit."]
        for investigation in db.list("investigations", project_id=project_id):
            parts += [f"## {investigation['title']}", f"Snapshot: {investigation['snapshot_id']}", " → ".join(investigation["paths"])]
            if investigation.get("outdated"):
                parts.append("Potentially outdated: source changed after this exploration.")
            for answer in investigation.get("answers", []):
                parts += [answer["summary"], *[f"- [{c['kind']}] {c['text']} ({', '.join(x['path'] + ':' + str(x['line']) for x in c['citations'])})" for c in answer["claims"]]]
            for note in db.list("discoveries", parent_id=investigation["id"]):
                parts += [f"### {note['title']}", note["body"]]
            parts += ["### Questions to revisit", *[f"- {q}" for q in investigation["questions"]]]
        for run in db.list("experiment_runs", project_id=project_id):
            parts += [f"## Experiment: {run['label']}", f"Result: {run['status']}. {run['message']}", f"Snapshot: {run['snapshot_id']}"]
            if run.get("source_changed") or run.get("snapshot_outdated"):
                parts.append("This run does not verify the original source version.")
            parts += [f"- {a['text']}: {'met' if a['met'] else 'not met'}" for a in run.get("assertions", [])]
        return Response("\n\n".join(parts), media_type="text/markdown", headers={"Content-Disposition": 'attachment; filename="unravel-walkthrough.md"'})
    return api
