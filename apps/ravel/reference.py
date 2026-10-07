"""Disposable profile-photo app for source exploration and controlled experiments."""
import base64
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from .assets import frontend_directory


def create_reference(variant: str = "correct", example: str = "photo"):
    app = FastAPI(title=f"Unravel disposable {example} reference")
    photos: list[bytes] = []

    @app.get("/api/search")
    def search(q: str = ""):
        if variant == "broken":
            raise HTTPException(500, "Deliberate failure")
        if variant == "ambiguous":
            return {"items": ["A result"], "accepted": True}
        return {"results": [item for item in ["React", "FastAPI", "SQLite"] if q.lower() in item.lower()]}

    @app.post("/api/photo")
    async def upload_photo(request: Request):
        body = await request.body()
        if len(body) > 512000 or not body.startswith(b"\x89PNG"):
            raise HTTPException(400, "Use the bundled small PNG fixture.")
        if variant == "broken":
            raise HTTPException(500, "Deliberately broken reference storage")
        if variant == "ambiguous":
            return {"accepted": True, "stored": False}
        photos.append(body)
        return {"uploaded": True, "count": len(photos)}

    @app.get("/{path:path}")
    def interface(path: str):
        root = frontend_directory().resolve()
        file = (root / path).resolve() if path else root / ("search.html" if example == "search" else "photo.html")
        if file.is_relative_to(root) and file.is_file():
            return FileResponse(file)
        raise HTTPException(404, "Reference asset unavailable. Build or reinstall the interface.")
    return app
