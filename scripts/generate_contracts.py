"""Generate request/response types from the actual FastAPI OpenAPI document."""

from pathlib import Path
import json
import tempfile
from apps.ravel.api import create_app


def ts(schema):
    if "$ref" in schema:
        return schema["$ref"].split("/")[-1]
    if "anyOf" in schema:
        return " | ".join(ts(s) for s in schema["anyOf"])
    if "enum" in schema:
        return " | ".join(json.dumps(s) for s in schema["enum"])
    kind = schema.get("type")
    if kind == "array":
        return f"Array<{ts(schema.get('items', {}))}>"
    if kind == "object":
        required = schema.get("required", [])
        fields = [
            f"{json.dumps(k)}{'?' if k not in required else ''}: {ts(v)}"
            for k, v in schema.get("properties", {}).items()
        ]
        if schema.get("additionalProperties"):
            fields.append("[key: string]: unknown")
        return "{ " + "; ".join(fields) + " }" if fields else "Record<string, unknown>"
    return {
        "string": "string",
        "integer": "number",
        "number": "number",
        "boolean": "boolean",
        "null": "null",
    }.get(kind, "unknown")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    with tempfile.TemporaryDirectory() as temporary:
        app = create_app(Path(temporary))
        spec = app.openapi()
        app.state.db.engine.dispose()
    output = "// Generated from Ravel FastAPI OpenAPI. Run python -m scripts.generate_contracts.\n"
    for name, schema in spec["components"]["schemas"].items():
        output += f"export type {name} = {ts(schema)};\n"
    output += (
        "\nexport const endpoints = "
        + json.dumps(
            {
                name: {
                    method: {"operationId": op.get("operationId")}
                    for method, op in methods.items()
                }
                for name, methods in spec["paths"].items()
            },
            indent=2,
        )
        + " as const;\n"
    )
    (root / "byline/src/ravel/contracts.generated.ts").write_text(
        output, encoding="utf-8"
    )
    print("Generated Ravel API contracts")
