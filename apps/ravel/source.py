"""Read-only bounded ingestion, AST parsing, and evidence-backed static feature paths."""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

EXCLUDED = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    "dist",
    "build",
    ".next",
    ".ravel",
    ".local",
    ".agents",
    ".codex",
    ".aws",
    ".pytest_cache",
    ".cache",
    "coverage",
    "vendor",
    "test-results",
    "playwright-report",
}
EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".css",
    ".md",
    ".toml",
    ".yaml",
    ".yml",
    ".html",
}
SECRET = re.compile(
    r"(?i)(?:sk-ant-[a-z0-9_-]{12,}|sk-[a-z0-9_-]{20,}|gh[pousr]_[a-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)"
)


def git(root: Path, *args: str) -> str | None:
    try:
        return subprocess.run(
            ["git", "-C", str(root), *args],
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            timeout=15,
            check=True,
        ).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return None


def capture(root: Path) -> dict:
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Choose a project folder, not a file.")
    candidates: list[Path] = []
    excluded: list[dict] = []
    for current, directories, names in os.walk(root, followlinks=False):
        directories[:] = sorted(
            d
            for d in directories
            if d not in EXCLUDED and not (Path(current) / d).is_symlink()
        )
        for name in sorted(names):
            if len(candidates) + len(excluded) >= 20000:
                raise ValueError(
                    "This folder contains too many entries. Choose a smaller project folder."
                )
            p = Path(current) / name
            relative = p.relative_to(root).as_posix()
            if (
                p.is_symlink()
                or p.suffix.lower() not in EXTENSIONS
                or name.startswith(".env")
                or any(
                    s in name.lower()
                    for s in [
                        "credential",
                        "secret",
                        "package-lock",
                        "pnpm-lock",
                        "yarn.lock",
                    ]
                )
            ):
                excluded.append(
                    {
                        "path": relative,
                        "reason": "Private, generated, binary, or unsupported file",
                    }
                )
                continue
            candidates.append(p)
    # Check ignore rules in one call; ignore errors for non-Git folders.
    ignored: set[str] = set()
    if candidates:
        try:
            r = subprocess.run(
                ["git", "-C", str(root), "check-ignore", "--stdin"],
                input="\n".join(p.relative_to(root).as_posix() for p in candidates),
                capture_output=True,
                text=True,
                timeout=15,
            )
            ignored = set(r.stdout.splitlines())
        except (OSError, subprocess.SubprocessError):
            pass
    files, total = [], 0
    for p in candidates:
        rel = p.relative_to(root).as_posix()
        if rel in ignored:
            excluded.append({"path": rel, "reason": "Ignored by Git"})
            continue
        if len(files) >= 2500:
            raise ValueError(
                "This project exceeds 2,500 readable files. Choose a smaller folder."
            )
        if p.stat().st_size > 512 * 1024:
            excluded.append({"path": rel, "reason": "Larger than 512 KiB"})
            continue
        if not p.resolve().is_relative_to(root):
            raise ValueError("A source path escaped the project folder.")
        raw = p.read_bytes()
        try:
            body = raw.decode("utf-8")
        except UnicodeDecodeError:
            excluded.append({"path": rel, "reason": "Not UTF-8 text"})
            continue
        if "\x00" in body or SECRET.search(body):
            excluded.append({"path": rel, "reason": "Binary or secret-like content"})
            continue
        total += len(raw)
        if total > 30 * 1024 * 1024:
            raise ValueError(
                "This project exceeds 30 MiB of readable source. Choose a smaller folder."
            )
        files.append(
            {
                "path": rel,
                "body": body,
                "hash": hashlib.sha256(raw).hexdigest(),
                "language": language(p),
                "lines": len(body.splitlines()),
            }
        )
    digest = hashlib.sha256(
        json.dumps(
            [(f["path"], f["hash"]) for f in files], separators=(",", ":")
        ).encode()
    ).hexdigest()
    return {
        "files": files,
        "excluded": excluded,
        "digest": digest,
        "commit": git(root, "rev-parse", "HEAD"),
        "dirty": bool(git(root, "status", "--porcelain")),
        "bytes": total,
    }


def language(p: Path) -> str:
    return {
        ".py": "python",
        ".ts": "typescript",
        ".tsx": "tsx",
        ".js": "javascript",
        ".jsx": "javascript",
        ".json": "json",
        ".css": "css",
        ".md": "markdown",
    }.get(p.suffix, "text")


def parse(files: list[dict]) -> dict:
    from tree_sitter import Language, Parser
    import tree_sitter_python, tree_sitter_javascript, tree_sitter_typescript

    parsers = {
        "python": Parser(Language(tree_sitter_python.language())),
        "javascript": Parser(Language(tree_sitter_javascript.language())),
        "typescript": Parser(Language(tree_sitter_typescript.language_typescript())),
        "tsx": Parser(Language(tree_sitter_typescript.language_tsx())),
    }
    symbols, routes, warnings = [], [], []
    paths = {f["path"] for f in files}
    edges: list[dict] = []
    for f in files:
        if f["language"] not in parsers:
            continue
        raw = f["body"].encode()
        tree = parsers[f["language"]].parse(raw)
        if tree.root_node.has_error:
            warnings.append(
                f"Some syntax in {f['path']} could not be parsed; source remains readable."
            )
        stack = [tree.root_node]
        while stack:
            node = stack.pop()
            if node.type in {
                "function_definition",
                "class_definition",
                "function_declaration",
                "class_declaration",
                "lexical_declaration",
            }:
                name_node = node.child_by_field_name("name")
                if (
                    not name_node
                    and node.type == "lexical_declaration"
                    and node.named_children
                ):
                    name_node = node.named_children[0].child_by_field_name("name")
                if name_node:
                    symbols.append(
                        {
                            "name": raw[
                                name_node.start_byte : name_node.end_byte
                            ].decode(),
                            "path": f["path"],
                            "line": node.start_point.row + 1,
                            "end_line": min(
                                node.end_point.row + 1, node.start_point.row + 100
                            ),
                            "kind": node.type,
                        }
                    )
            if node.type in {
                "import_statement",
                "import_from_statement",
                "export_statement",
            }:
                text = raw[node.start_byte : node.end_byte].decode()
                modules = re.findall(r"['\"]([^'\"]+)['\"]", text)
                if f["language"] == "python":
                    m = re.search(r"(?:from|import)\s+([\w.]+)", text)
                    if m:
                        module = m.group(1)
                        relative = len(module) - len(module.lstrip("."))
                        module_path = module.lstrip(".").replace(".", "/")
                        modules = [
                            (
                                ("../" * (relative - 1) if relative > 1 else "./")
                                + module_path
                            )
                            if relative
                            else module_path
                        ]
                    else:
                        modules = []
                for module in modules:
                    base = (
                        (Path(f["path"]).parent / module).as_posix()
                        if module.startswith(".")
                        else module
                    )
                    normalized = os.path.normpath(base).replace("\\", "/")
                    choices = [
                        normalized + ext
                        for ext in [
                            "",
                            ".py",
                            ".ts",
                            ".tsx",
                            ".js",
                            ".jsx",
                            "/index.ts",
                            "/index.tsx",
                            "/__init__.py",
                        ]
                    ]
                    target = next((p for p in choices if p in paths), None)
                    if target:
                        edges.append(
                            {
                                "from": f["path"],
                                "to": target,
                                "kind": "import",
                                "evidence": "source",
                                "line": node.start_point.row + 1,
                            }
                        )
            stack.extend(reversed(node.named_children))
        for i, line in enumerate(f["body"].splitlines(), 1):
            m = re.search(
                r"@(?:\w+\.)?(get|post|put|patch|delete)\(\s*['\"]([^'\"]+)", line
            )
            if m:
                routes.append(
                    {
                        "method": m.group(1).upper(),
                        "route": m.group(2),
                        "path": f["path"],
                        "line": i,
                    }
                )
    return {"symbols": symbols, "edges": edges, "routes": routes, "warnings": warnings}


def make_features(snapshot: dict) -> list[dict]:
    files, analysis = snapshot["files"], snapshot["analysis"]
    features = []
    # Known literal routes are excellent small entrypoints; related modules are expanded on demand.
    for route in analysis["routes"][:10]:
        selected = [route["path"]]
        selected += [e["to"] for e in analysis["edges"] if e["from"] == route["path"]]
        name = route["route"].strip("/").replace("/", " · ") or "Application entry"
        features.append(
            {
                "title": f"{route['method']} /{name}",
                "description": "Follow a request from its route into the implementation.",
                "category": "Backend request",
                "paths": list(dict.fromkeys(selected))[:7],
                "entry_line": route["line"],
                "questions": [
                    "What happens when this request fails?",
                    "Where does the response come from?",
                    "What would I need to change to extend this feature?",
                ],
            }
        )
    for f in files:
        if f["language"] not in {"tsx", "javascript", "typescript"} or not re.search(
            r"(?:return\s*\(?\s*<|useState|useEffect)", f["body"]
        ):
            continue
        related = [e["to"] for e in analysis["edges"] if e["from"] == f["path"]]
        from .maps import action_label
        action = action_label(f)
        title = action[0] if action else Path(f["path"]).stem
        features.append(
            {
                "title": re.sub(r"([a-z])([A-Z])", r"\1 \2", title),
                "description": "Explore a screen's state, actions, and supporting code.",
                "category": "Interface",
                "paths": [f["path"], *related][:7],
                "entry_line": action[1] if action else 1,
                "questions": [
                    "How does this screen respond to a user action?",
                    "What happens after a refresh?",
                    "Which part would I change to improve the experience?",
                ],
            }
        )
        if len(features) >= 18:
            break
    if not features and files:
        features.append(
            {
                "title": "Project entry points",
                "description": "Start with the source files and follow their connections.",
                "category": "Source exploration",
                "paths": [f["path"] for f in files if f["language"] != "markdown"][:7]
                or [files[0]["path"]],
                "entry_line": 1,
                "questions": [
                    "Where does this project start?",
                    "What does this file depend on?",
                    "What can I experiment with here?",
                ],
            }
        )
    return features


def difference(before: dict, after: dict) -> dict:
    import difflib

    a, b = (
        {f["path"]: f for f in before["files"]},
        {f["path"]: f for f in after["files"]},
    )
    changes = []
    for path in sorted(a.keys() | b.keys()):
        if a.get(path, {}).get("hash") == b.get(path, {}).get("hash"):
            continue
        changes.append(
            {
                "path": path,
                "status": "added"
                if path not in a
                else "removed"
                if path not in b
                else "changed",
                "diff": "\n".join(
                    difflib.unified_diff(
                        a.get(path, {}).get("body", "").splitlines(),
                        b.get(path, {}).get("body", "").splitlines(),
                        fromfile="before/" + path,
                        tofile="after/" + path,
                    )
                )[:16000],
            }
        )
    return {"before": before["id"], "after": after["id"], "changes": changes}
