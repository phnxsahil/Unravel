from pathlib import Path

from apps.ravel import source
from apps.ravel.source_imports import ImportResolver, connected_paths

FIXTURE = Path(__file__).parent / "fixtures" / "v03"


def fixture_snapshot():
    snapshot = source.capture(FIXTURE)
    snapshot["analysis"] = source.parse(snapshot["files"])
    return snapshot


def test_alias_and_python_imports_reach_two_hops():
    snapshot = fixture_snapshot()
    edges = snapshot["analysis"]["edges"]
    assert connected_paths("frontend/src/app/chat/page.tsx", edges) == [
        "frontend/src/app/chat/page.tsx", "frontend/src/components/ChatInterface.tsx", "frontend/src/lib/api.ts",
    ]
    assert connected_paths("backend/app/routes/chat.py", edges) == [
        "backend/app/routes/chat.py", "backend/app/services/chat.py", "backend/app/services/store.py",
    ]


def test_nearest_package_config_jsonc_and_index_resolution():
    files = [
        {"path": "tsconfig.json", "body": '{"compilerOptions":{"paths":{"@/*":["wrong/*"]}}}'},
        {"path": "packages/ui/jsconfig.json", "body": '{// local config\n"compilerOptions":{"baseUrl":"src", "paths":{"@/*":["*"],},},}'},
        {"path": "packages/ui/src/widget/index.jsx", "body": ""},
        {"path": "packages/ui/src/api.ts", "body": ""},
    ]
    resolver = ImportResolver(files)
    assert resolver.javascript("packages/ui/src/page.jsx", "@/widget") == "packages/ui/src/widget/index.jsx"
    assert resolver.javascript("packages/ui/src/page.jsx", "api") == "packages/ui/src/api.ts"
    assert resolver.javascript("packages/ui/src/page.jsx", "../../../../outside") is None


def test_absolute_python_imports_and_from_package_import_module():
    resolver = ImportResolver(source.capture(FIXTURE)["files"])
    assert resolver.python_imports("backend/app/main.py", "import app.services.chat as chat") == ["backend/app/services/chat.py"]
    assert "backend/app/routes/chat.py" in resolver.python_imports("backend/app/main.py", "from app.routes import chat")


def test_graph_bound_and_depth_with_cycles():
    edges = [{"from": "a", "to": f"b{i}"} for i in range(20)]
    assert len(connected_paths("a", edges)) == 12
    edges = [{"from": "a", "to": "b"}, {"from": "b", "to": "c"}, {"from": "c", "to": "d"}, {"from": "b", "to": "a"}]
    assert connected_paths("a", edges) == ["a", "b", "c"]


def test_prefixed_multiline_and_api_routes_are_all_discovered():
    snapshot = fixture_snapshot()
    routes = snapshot["analysis"]["routes"]
    assert {(r["method"], r["route"]) for r in routes} == {
        ("POST", "/chat/stream"), ("GET", "/memory/items"), ("POST", "/memory/items"),
    }
    assert not any("Application entry" in r["route"] for r in routes)


def test_nested_router_prefixes_and_aliases_and_no_route_cap():
    def file(path, body):
        return {"path": path, "body": body, "language": "python", "lines": len(body.splitlines())}
    files = [
        file("main.py", 'from fastapi import FastAPI\nfrom routes import router as child\napp=FastAPI()\napp.include_router(child, prefix="/api")'),
        file("routes.py", 'from fastapi import APIRouter\nfrom inner import router as inner\nrouter=APIRouter(prefix="/v1")\nrouter.include_router(inner, prefix="/nested")'),
        file("inner.py", 'from fastapi import APIRouter\nrouter=APIRouter(prefix="/chat")\n' + '\n'.join(f'@router.get("/item{i}")\ndef item{i}(): return {{}}' for i in range(15))),
    ]
    analysis = source.parse(files)
    assert len(analysis["routes"]) == 15
    assert analysis["routes"][0]["route"] == "/api/v1/nested/chat/item0"
    assert len([f for f in source.make_features({"files": files, "analysis": analysis}) if f["category"] == "Backend request"]) == 15


def test_feature_names_and_framework_files():
    snapshot = fixture_snapshot()
    features = source.make_features(snapshot)
    titles = {f["title"] for f in features if f["category"] == "Interface"}
    assert {"Chat", "Memory", "Identity", "Home", "Chat Interface"} <= titles
    framework = [f["title"] for f in features if f["category"] == "Framework files"]
    assert "Layout: /" in framework and "App startup (main.py)" in framework
    assert not any("onClick" in f["title"] or "Send message" in f["title"] for f in features)
    assert next(f for f in features if f["title"] == "Chat")["edge_count"] == 2


def test_inherited_aliases_reexports_and_no_jsx_literal_imports():
    files = [
        {"path": "tsconfig.base.json", "language": "json", "body": '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["src/*"]}}}'},
        {"path": "tsconfig.json", "language": "json", "body": '{"extends":"./tsconfig.base.json"}'},
        {"path": "src/entry.tsx", "language": "tsx", "body": 'export { Widget } from "@/widget"; export function Entry() { return <a href="src/decoy">Visit</a>; }'},
        {"path": "src/widget/index.js", "language": "javascript", "body": 'export const Widget = () => <div />;'},
        {"path": "src/decoy.ts", "language": "typescript", "body": 'export const unused = 1;'},
    ]
    analysis = source.parse(files)
    assert [(e["from"], e["to"]) for e in analysis["edges"]] == [("src/entry.tsx", "src/widget/index.js")]


def test_repeated_imports_and_multiple_route_methods_have_unique_map_edges():
    from apps.ravel.maps import feature_map
    files = [
        {"path": "App.tsx", "language": "tsx", "body": 'import { a } from "./api";\nimport { b } from "./api";\nexport function App(){return <div />}', "lines": 3},
        {"path": "api.ts", "language": "typescript", "body": 'export const a = () => fetch("/items"); export const b = a;', "lines": 1},
        {"path": "routes.py", "language": "python", "body": 'from fastapi import APIRouter\nrouter=APIRouter()\n@router.api_route("/items", methods=["GET","POST"])\ndef items(): return []', "lines": 4},
    ]
    analysis = source.parse(files)
    assert len(analysis["edges"]) == 1
    snapshot = {"files": files, "analysis": analysis, "id": "snapshot", "digest": "digest"}
    feature = next(f for f in source.make_features(snapshot) if f["paths"][0] == "App.tsx")
    assert feature["edge_count"] == 1
    graph = feature_map(snapshot, {**feature, "id": "feature"})
    assert len(graph["edges"]) == 2
    assert len({e["id"] for e in graph["edges"]}) == 2
