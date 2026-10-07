from fastapi import APIRouter
from store import save_draft

router = APIRouter()


@router.post("/drafts")
def create_draft(body: str):
    return save_draft(body)
