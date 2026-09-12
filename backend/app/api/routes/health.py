from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Service Health Check")
def get_health() -> HealthResponse:
    """
    Returns API health status and service identification.
    """
    return HealthResponse(
        status="ok",
        service="CarbonLoop API"
    )
