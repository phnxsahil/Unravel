# Source fixture mirroring the bundled reference app's upload route.
from fastapi import FastAPI, Request, HTTPException
app = FastAPI()
photos = []
@app.post("/api/photo")
async def upload_photo(request: Request):
    body = await request.body()
    if len(body) > 512000 or not body.startswith(b"\x89PNG"):
        raise HTTPException(400, "Use the bundled small PNG fixture.")
    photos.append(body)
    return {"uploaded": True, "count": len(photos)}
