"""Resolve captured imports without executing a project's code or reading outside it."""
from __future__ import annotations

import ast
import json
import posixpath
import re
from pathlib import PurePosixPath


def normalize(path: str) -> str:
    return posixpath.normpath(path)


class ImportResolver:
    def __init__(self, files: list[dict]):
        self.files = {f["path"]: f for f in files}
        self.configs: dict[str, dict] = {}
        for path, file in self.files.items():
            if PurePosixPath(path).suffix != ".json":
                continue
            # JSONC comments and trailing commas, preserving comment-like string values.
            body = re.sub(r'"(?:\\.|[^"\\])*"|//[^\n]*|/\*[\s\S]*?\*/',
                          lambda m: m[0] if m[0].startswith('"') else " ", file["body"])
            body = re.sub(r',\s*([}\]])', r'\1', body)
            try:
                config = json.loads(body)
                if isinstance(config, dict):
                    self.configs[path] = config
            except (ValueError, TypeError):
                continue

    def choose(self, base: str, python: bool = False) -> str | None:
        base = normalize(base)
        if base == ".." or base.startswith("../") or base.startswith("/"):
            return None
        extensions = ["", ".py", "/__init__.py"] if python else [
            "", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx",
        ]
        choices = [base + ext for ext in extensions]
        # TypeScript permits source imports ending in the emitted .js extension.
        if not python and base.endswith(".js"):
            choices += [base[:-3] + ext for ext in [".ts", ".tsx"]]
        return next((p for p in choices if p in self.files), None)

    def compiler_options(self, path: str, seen: set[str] | None = None) -> dict:
        seen = set() if seen is None else seen
        if path in seen:
            return {}
        seen.add(path)
        config = self.configs.get(path, {})
        parent = config.get("extends")
        options = {}
        if isinstance(parent, str) and parent.startswith("."):
            parent_path = normalize(str(PurePosixPath(path).parent / parent))
            if not parent_path.endswith(".json"):
                parent_path += ".json"
            options.update(self.compiler_options(parent_path, seen))
        own = config.get("compilerOptions", {})
        if isinstance(own, dict):
            directory = str(PurePosixPath(path).parent)
            base_url = own.get("baseUrl", ".")
            if not isinstance(base_url, str):
                base_url = "."
            base = normalize(posixpath.join(directory, base_url))
            if "baseUrl" in own:
                options["baseUrl"] = base
            if isinstance(own.get("paths"), dict):
                options["paths"] = own["paths"]
                options["pathsBase"] = options.get("baseUrl", base)
        return options

    def javascript(self, importer: str, module: str) -> str | None:
        if module.startswith("."):
            return self.choose(str(PurePosixPath(importer).parent / module))
        # Nearest package config wins; ancestor/root configs remain fallback candidates.
        for directory in PurePosixPath(importer).parents:
            for name in ["tsconfig.json", "jsconfig.json"]:
                config_path = str(directory / name)
                if config_path not in self.configs:
                    continue
                options = self.compiler_options(config_path)
                mappings = options.get("paths", {})
                for pattern in sorted(mappings, key=len, reverse=True):
                    prefix, star, suffix = pattern.partition("*")
                    if star:
                        if not module.startswith(prefix) or not module.endswith(suffix):
                            continue
                        captured = module[len(prefix):len(module) - len(suffix) if suffix else None]
                    elif module == pattern:
                        captured = ""
                    else:
                        continue
                    targets = mappings[pattern]
                    if not isinstance(targets, list):
                        continue
                    for target in targets:
                        if isinstance(target, str):
                            resolved = self.choose(posixpath.join(options.get("pathsBase", str(directory)), target.replace("*", captured)))
                            if resolved:
                                return resolved
                if "baseUrl" in options:
                    resolved = self.choose(posixpath.join(options["baseUrl"], module))
                    if resolved:
                        return resolved
        return self.choose(module)

    def python(self, importer: str, module: str, level: int = 0) -> str | None:
        module_path = module.replace(".", "/")
        if level:
            directory = PurePosixPath(importer).parent
            for _ in range(level - 1):
                directory = directory.parent
            return self.choose(str(directory / module_path), python=True)
        # Prefer the importing package's ancestors, then other detected package roots.
        top = module.split(".")[0]
        roots = [str(p) for p in PurePosixPath(importer).parents]
        for path in self.files:
            parts = PurePosixPath(path).parts
            for index, part in enumerate(parts[:-1]):
                if part == top:
                    roots.append("/".join(parts[:index]) or ".")
        for root in dict.fromkeys(roots):
            target = self.choose(posixpath.join(root, module_path), python=True)
            if target:
                return target
        return None

    def python_imports(self, importer: str, text: str) -> list[str]:
        try:
            node = ast.parse(text).body[0]
        except (SyntaxError, IndexError):
            return []
        targets = []
        if isinstance(node, ast.Import):
            targets = [self.python(importer, alias.name) for alias in node.names]
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            targets = [self.python(importer, module, node.level)]
            targets += [self.python(importer, ".".join(filter(None, [module, alias.name])), node.level)
                        for alias in node.names if alias.name != "*"]
        return list(dict.fromkeys(t for t in targets if t))


def connected_paths(entry: str, edges: list[dict], hops: int = 2, limit: int = 12) -> list[str]:
    selected, frontier = [entry], [entry]
    for _ in range(hops):
        following = []
        for edge in edges:
            if edge["from"] in frontier and edge["to"] not in selected:
                if len(selected) == limit:
                    return selected
                selected.append(edge["to"])
                following.append(edge["to"])
        frontier = following
    return selected
