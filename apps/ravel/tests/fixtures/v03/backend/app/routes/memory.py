from fastapi import APIRouter

router = APIRouter(prefix="/memory")

@router.api_route(
    "/items", methods=["GET", "POST"],
)
def memories():
    return []
