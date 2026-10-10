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
    """Complete literal paths, including a constant base + static template suffix."""
    constants = set(re.findall(r"\bconst\s+([\w$]+)\s*(?::[^=;\n]+)?=", body))
    pattern = r"(?:fetch|axios\.(?:get|post|put|patch|delete))\(\s*(?:(['\"])([^'\"]+)\1|`([^`]+)`)([^\n]*)"
    for match in re.finditer(pattern, body):
        value, tail = match[2], match[4].lstrip()
        if value is None:
            template = re.fullmatch(r"\$\{\s*([\w$]+)\s*\}(/[^$`]+)", match[3])
            if not template or template[1] not in constants:
                continue
            value = template[2]
        if not value.startswith("/") or value.startswith("//") or "\\" in value:
            continue
        # /users/ + id is not a complete path. /search?q= + query is.
        if tail.startswith("+") and "?" not in value:
            continue
        path = urlsplit(value).path
        yield path, body[:match.start()].count("\n") + 1


def request_chain(entry: str, target: str, edges: list[dict]) -> list[str]:
    """Preserve the shortest import chain to a request when the map is bounded."""
    chains = [[entry]]
    seen = {entry}
    for chain in chains:
        if chain[-1] == target:
            return chain
        for edge in edges:
            if edge["from"] == chain[-1] and edge["to"] not in seen:
                seen.add(edge["to"])
                chains.append([*chain, edge["to"]])
    return [entry]


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
    from .source_imports import connected_paths
    sources = [p for p in connected_paths(entry, analysis["edges"], limit=max(12, len(files))) if p in files]
    selected = sources[:12]
    matches = [(path, line, route) for path in sources
               for url, line in literal_requests(files[path]["body"])
               for route in analysis["routes"] if url == route["route"] and route["path"] in files]
    # A shared API client may mention many routes. Prefer the feature's named path,
    # but keep every match explicitly inferred, never a claim about execution.
    words = set(re.findall(r"[a-z0-9]+", feature["title"].lower()))
    matches.sort(key=lambda match: -len(words & set(match[2]["route"].lower().split("/"))))
    if matches:
        path, _, route = matches[0]
        chain = request_chain(entry, path, analysis["edges"])
        backend = connected_paths(route["path"], analysis["edges"], limit=12 - len(chain))
        selected = list(dict.fromkeys([*chain, *backend, *sources]))[:12]
    for path, _, route in matches:
        if path in selected and route["path"] not in selected and len(selected) < 12:
            selected.append(route["path"])
    routes = {}
    for path, _, route in matches:
        if path in selected:
            routes.setdefault(route["path"], route)
    for path in selected:
        file = files[path]
        label = action_label(file) if path == entry else None
        route = routes.get(path) if path != entry else None
        line = route["line"] if route else label[1] if label else min(feature.get("entry_line", 1) if path == entry else 1, max(1, file["lines"]))
        nodes.append({"id": path, "label": feature["title"] if path == entry else f"{route['method']} {route['route']}" if route else PurePosixPath(path).name,
                      "role": "action" if path == entry else "route" if route else "source", "kind": "source",
                      "citations": [citation(path, line)]})
    for edge in analysis["edges"]:
        if edge["from"] in selected and edge["to"] in selected:
            edges.append({"id": f"import:{edge['from']}:{edge['to']}", "from": edge["from"], "to": edge["to"],
                          "label": "Imports", "kind": "source", "citations": [citation(edge["from"], edge["line"])]})
    # Exact request/route path matches remain candidate connections.
    for path, line, route in matches:
        target = route["path"]
        if path in selected and target in selected and route["route"] == routes[target]["route"]:
            edges.append({"id": f"request:{path}:{target}:{line}", "from": path, "to": target,
                          "label": "Matching request and route; execution unverified", "kind": "inferred",
                          "citations": [citation(path, line), citation(target, route["line"])]})
    # Multiple methods on one literal path still establish one file connection.
    edges = list({edge["id"]: edge for edge in edges}.values())
    return {"version": 1, "snapshot_id": snapshot["id"], "digest": snapshot["digest"], "feature_id": feature["id"],
            "title": feature["title"], "nodes": nodes, "edges": edges,
            "questions": ["How does this work?", "What happens if it fails?", "What would changing it involve?"],
            "limitations": ["Imports establish dependencies, not execution order.", "Dynamic requests and framework behaviour may be missing."]}
