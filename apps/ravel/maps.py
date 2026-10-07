"""Bounded source maps. Static links are not claims about executed behaviour."""
from __future__ import annotations

import re
from urllib.parse import urlsplit
from pathlib import PurePosixPath
from pydantic import BaseModel, Field
from typing import Literal
from .ai import Citation

class MapNode(BaseModel):
    id: str
    label: str
    role: Literal["action", "source", "route"]
    kind: Literal["source", "inferred"]
    citations: list[Citation]

class MapEdge(BaseModel):
    id: str
    label: str
    kind: Literal["source", "inferred"]
    citations: list[Citation]
    # Alias preserves the public graph field named 'from'.
    to: str
    from_: str = Field(alias="from")

class FeatureMap(BaseModel):
    version: int
    snapshot_id: str
    digest: str
    feature_id: str
    title: str
    nodes: list[MapNode]
    edges: list[MapEdge]
    questions: list[str]
    limitations: list[str]


def citation(path: str, line: int) -> dict:
    return {"path": path, "line": line, "end_line": line}


def literal_requests(body: str):
    """Only complete literal paths, or query suffixes, can establish a candidate."""
    pattern = r"(?:fetch|axios\.(?:get|post|put|patch|delete))\(\s*(['\"])([^'\"]+)\1([^\n]*)"
    for match in re.finditer(pattern, body):
        value, tail = match[2], match[3].lstrip()
        if not value.startswith("/") or value.startswith("//") or "\\" in value:
            continue
        # /users/ + id is not a complete path. /search?q= + query is.
        if tail.startswith("+") and "?" not in value:
            continue
        path = urlsplit(value).path
        yield path, body[:match.start()].count("\n") + 1


def action_label(file: dict) -> tuple[str, int] | None:
    for line, text in enumerate(file["body"].splitlines(), 1):
        match = re.search(r"<button[^>]*>\s*([^<{\n]{3,60})\s*<", text)
        if match:
            return match[1].strip(), line
    for line, text in enumerate(file["body"].splitlines(), 1):
        match = re.search(r"<(?:button|label)[^>]*>\s*([^<{\n]{3,60})\s*<", text)
        if match:
            return match[1].strip(), line
        match = re.search(r'aria-label=["\']([^"\']{3,60})["\']', text)
        if match:
            return match[1], line
    return None


def feature_map(snapshot: dict, feature: dict) -> dict:
    files = {f["path"]: f for f in snapshot["files"]}
    analysis = snapshot["analysis"]
    nodes, edges = [], []
    entry = feature["paths"][0] if feature.get("paths") else next(iter(files), "")
    selected = [p for p in feature.get("paths", []) if p in files]
    # Expand imports by two hops; cap the visible map, do not invent dynamic edges.
    for _ in range(2):
        selected += [e["to"] for e in analysis["edges"] if e["from"] in selected and e["to"] in files]
        selected = list(dict.fromkeys(selected))[:8]
    for path in selected:
        file = files[path]
        label = action_label(file) if path == entry else None
        line = label[1] if label else min(feature.get("entry_line", 1) if path == entry else 1, max(1, file["lines"]))
        nodes.append({"id": path, "label": label[0] if label else PurePosixPath(path).name,
                      "role": "action" if path == entry else "source", "kind": "source",
                      "citations": [citation(path, line)]})
    for edge in analysis["edges"]:
        if edge["from"] in selected and edge["to"] in selected:
            edges.append({"id": f"import:{edge['from']}:{edge['to']}", "from": edge["from"], "to": edge["to"],
                          "label": "Imports", "kind": "source", "citations": [citation(edge["from"], edge["line"])]})
    # Exact literal request/route matches are candidate connections, explicitly inferred.
    for path in list(selected):
        for url, line in literal_requests(files[path]["body"]):
            for route in analysis["routes"]:
                target = route["path"]
                prefix = re.search(r'(?:APIRouter|FastAPI)\([^\n]*prefix\s*=\s*["\']([^"\']+)', files[target]["body"])
                full = (prefix[1] if prefix else "") + route["route"]
                if url != full:
                    continue
                if target not in selected and len(selected) < 10:
                    selected.append(target)
                    nodes.append({"id": target, "label": f"{route['method']} {full}", "role": "route", "kind": "source",
                                  "citations": [citation(target, route["line"])]})
                if target in selected:
                    edges.append({"id": f"request:{path}:{target}:{line}", "from": path, "to": target,
                                  "label": "Matching request and route; execution unverified", "kind": "inferred",
                                  "citations": [citation(path, line), citation(target, route["line"])]})
    return {"version": 1, "snapshot_id": snapshot["id"], "digest": snapshot["digest"], "feature_id": feature["id"],
            "title": feature["title"], "nodes": nodes, "edges": edges,
            "questions": ["How does this work?", "What happens if it fails?", "What would changing it involve?"],
            "limitations": ["Imports establish dependencies, not execution order.", "Dynamic requests and framework behaviour may be missing."]}
