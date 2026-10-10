"""Literal FastAPI route discovery, including router registration prefixes."""
from __future__ import annotations

import ast
from .source_imports import ImportResolver


def route_analysis(files: list[dict], resolver: ImportResolver) -> tuple[list[dict], list[dict]]:
    owners: dict[tuple[str, str], dict] = {}
    registrations: dict[tuple[str, str], list[tuple[tuple[str, str], str]]] = {}
    candidates, startups = [], []
    for file in files:
        if file["language"] != "python":
            continue
        path = file["path"]
        try:
            tree = ast.parse(file["body"])
        except SyntaxError:
            continue
        imports, constants = {}, {}
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign) and isinstance(node.value, ast.Constant):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        constants[target.id] = node.value.value
            if isinstance(node, ast.ImportFrom):
                module = node.module or ""
                target = resolver.python(path, module, node.level)
                for alias in node.names:
                    submodule = resolver.python(path, ".".join(filter(None, [module, alias.name])), node.level)
                    imports[alias.asname or alias.name] = (submodule or target, "" if submodule else alias.name)
            if isinstance(node, ast.Import):
                for alias in node.names:
                    target = resolver.python(path, alias.name)
                    if alias.asname:
                        imports[alias.asname] = (target, "")
                    else:
                        imports[alias.name] = (target, "")

        def text_value(node, default=""):
            if isinstance(node, ast.Constant) and isinstance(node.value, str):
                return node.value
            if isinstance(node, ast.Name) and isinstance(constants.get(node.id), str):
                return constants[node.id]
            return default

        def reference(node):
            if isinstance(node, ast.Name):
                target, symbol = imports.get(node.id, (path, node.id))
                return (target, symbol) if target and symbol else None
            if isinstance(node, ast.Attribute):
                parts = []
                while isinstance(node, ast.Attribute):
                    parts.insert(0, node.attr)
                    node = node.value
                if isinstance(node, ast.Name):
                    name = ".".join([node.id, *parts[:-1]])
                    target, _ = imports.get(name, imports.get(node.id, (None, "")))
                    if target:
                        return target, parts[-1]
            return None

        for node in ast.walk(tree):
            if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call):
                call = node.value
                constructor = ast.unparse(call.func).split(".")[-1]
                if constructor in {"APIRouter", "FastAPI"}:
                    prefix = next((text_value(k.value) for k in call.keywords if k.arg == "prefix"), "")
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            owners[(path, target.id)] = {"prefix": prefix, "app": constructor == "FastAPI"}
                            if constructor == "FastAPI":
                                startups.append({"path": path, "line": node.lineno})
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "include_router":
                parent = reference(node.func.value)
                argument = node.args[0] if node.args else next((k.value for k in node.keywords if k.arg == "router"), None)
                child = reference(argument)
                prefix = next((text_value(k.value) for k in node.keywords if k.arg == "prefix"), "")
                if parent and child:
                    registrations.setdefault(child, []).append((parent, prefix))
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for decorator in node.decorator_list:
                    if not isinstance(decorator, ast.Call) or not isinstance(decorator.func, ast.Attribute):
                        continue
                    method = decorator.func.attr
                    if method not in {"get", "post", "put", "patch", "delete", "options", "head", "trace", "api_route"}:
                        continue
                    owner = reference(decorator.func.value)
                    argument = decorator.args[0] if decorator.args else next((k.value for k in decorator.keywords if k.arg == "path"), None)
                    route = text_value(argument, None)
                    if not owner or route is None:
                        continue
                    methods = [method.upper()]
                    if method == "api_route":
                        values = next((k.value for k in decorator.keywords if k.arg == "methods"), None)
                        try:
                            methods = ast.literal_eval(values) if values else ["GET"]
                        except (ValueError, TypeError):
                            continue
                        if not isinstance(methods, (list, tuple, set)) or not all(isinstance(m, str) for m in methods):
                            continue
                    candidates.append((owner, route, methods, path, decorator.lineno))

    def prefixes(owner, visited=frozenset()):
        if owner in visited:
            return []
        own = owners.get(owner, {}).get("prefix", "")
        parents = registrations.get(owner, [])
        if not parents:
            return [own]
        return [base.rstrip("/") + extra.rstrip("/") + own.rstrip("/")
                for parent, extra in parents for base in prefixes(parent, visited | {owner})]

    routes = []
    for owner, route, methods, path, line in candidates:
        for prefix in prefixes(owner):
            full = prefix.rstrip("/") + route
            for method in methods:
                item = {"method": method.upper(), "route": full or "/", "path": path, "line": line}
                if item not in routes:
                    routes.append(item)
    return routes, startups
