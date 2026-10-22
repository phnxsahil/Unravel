"""Editable proposals from captured source, never approved executable plans."""
import re
from pydantic import BaseModel
from .ai import Citation
from .experiments import Step
from .maps import feature_map, literal_requests, citation


class RecipeSuggestion(BaseModel):
    feature_id: str
    snapshot_id: str
    title: str
    request_paths: list[str]
    steps: list[Step]
    citations: list[Citation]
    limitations: list[str]


def recipe_suggestion(snapshot: dict, feature: dict) -> dict:
    graph = feature_map(snapshot, feature)
    selected = {n["id"] for n in graph["nodes"]}
    paths, steps, citations = [], [], []
    for file in snapshot["files"]:
        if file["path"] not in selected:
            continue
        body = file["body"]
        for path, line in literal_requests(body):
            paths.append(path)
            citations.append(citation(file["path"], line))
        # Explicit htmlFor/id pairs only. No inferred selector or credentials.
        for label in re.finditer(r'<label\s*>\s*([^<{]+)\s*<input\b([^>]*)>', body):
            name = label[1].strip()
            if any(s in name.lower() for s in ("password", "secret", "token", "key")):
                continue
            kind = re.search(r'\btype=["\']([^"\']+)', label[2])
            if kind and kind[1] not in {"file", "text", "search"}:
                continue
            steps.append(Step(action="upload" if kind and kind[1] == "file" else "fill", name=name, value="React" if not kind or kind[1] != "file" else ""))
            citations.append(citation(file["path"], body[:label.start()].count("\n") + 1))
        for label in re.finditer(r'<label\b[^>]*htmlFor=["\']([^"\']+)["\'][^>]*>\s*([^<{]+)\s*</label>', body):
            control = re.search(r'<input\b[^>]*\bid=["\']' + re.escape(label[1]) + r'["\'][^>]*>', body)
            name = label[2].strip()
            if not control or any(s in name.lower() for s in ("password", "secret", "token", "key")):
                continue
            kind = re.search(r'\btype=["\']([^"\']+)', control[0])
            if kind and kind[1] not in {"file", "text", "search"}:
                continue
            steps.append(Step(action="upload" if kind and kind[1] == "file" else "fill", name=name, value="React" if not kind or kind[1] != "file" else ""))
            citations.append(citation(file["path"], body[:label.start()].count("\n") + 1))
        button = re.search(r'<button\b[^>]*>\s*([^<{\n]{3,60})\s*<', body)
        if not button:
            button = re.search(r'<button\b[^>]*aria-label=["\']([^"\']{3,60})["\']', body)
        if button:
            steps.append(Step(action="click", name=button[1].strip()))
            citations.append(citation(file["path"], body[:button.start()].count("\n") + 1))
    limitations = ["Source-based suggestions are not a recorded interaction. Review names, order and test data before running.",
                   "Add an assertion with the exact visible result you expect. No expected outcome was inferred."]
    if not paths:
        limitations.append("No complete local request path was found. Enter one from your app's browser Network panel.")
    if not steps:
        limitations.append("No supported named controls were found. Add the action steps yourself.")
    return RecipeSuggestion(feature_id=feature["id"], snapshot_id=snapshot["id"], title=graph["title"],
                            request_paths=list(dict.fromkeys(paths))[:8], steps=steps[:19],
                            citations=citations[:30], limitations=limitations).model_dump()
