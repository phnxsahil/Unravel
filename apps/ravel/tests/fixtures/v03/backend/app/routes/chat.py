from fastapi import APIRouter
from app.services.chat import stream

router = APIRouter()

@router.post(
    "/stream",
)
def stream_chat():
    return stream()
