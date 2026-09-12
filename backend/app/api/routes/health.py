from fastapi import APIRouter, HTTPException, status
from app.schemas.health import HealthResponse, DatabaseHealthResponse
from app.core.supabase import check_supabase_connection

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


@router.get(
    "/health/db",
    response_model=DatabaseHealthResponse,
    summary="Supabase Database Connectivity Diagnostic"
)
def get_db_health() -> DatabaseHealthResponse:
    """
    Diagnostic endpoint that tests real-time connectivity to the Supabase database.
    """
    health_status = check_supabase_connection()
    if not health_status.get("connected"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status,
        )
    return DatabaseHealthResponse(**health_status)
