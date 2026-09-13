import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.logistics import LogisticsEstimateRequest, LogisticsEstimateResponse
from app.services.logistics import LogisticsService
from app.api.deps import get_logistics_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/estimate",
    response_model=LogisticsEstimateResponse,
    status_code=status.HTTP_200_OK,
    summary="Estimate logistics costs and transport emissions",
)
def estimate_logistics(
    request: LogisticsEstimateRequest,
    logistics_service: LogisticsService = Depends(get_logistics_service),
) -> LogisticsEstimateResponse:
    """
    Calculate deterministic prototype logistics and cost breakdown between supplier
    and buyer locations for CO2 off-take and transport.

    **Note:** This endpoint provides a transparent, rule-based prototype estimate for
    planning and matchmaking; it is NOT an actual commercial transportation quote.

    Formulas:
    - Distance: Haversine distance with 1.20x road circuity factor (or 150 km fallback).
    - Required Trips: ceil(quantity_tonnes / 25.0)
    - Transportation Cost: trips * ($150 base fee + distance_km * $1.50/km)
    - CO2 Purchase Cost: quantity_tonnes * price_per_tonne
    - Total Estimated Cost: purchase_cost + transportation_cost
    - Estimated Transit Emissions: trips * distance_km * 0.85 kg CO2e
    """
    try:
        return logistics_service.estimate_logistics(
            pickup_location=request.pickup_location,
            delivery_location=request.delivery_location,
            quantity_tonnes=request.quantity_tonnes,
            price_per_tonne=request.price_per_tonne,
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err),
        )
    except Exception as exc:
        logger.exception("Logistics estimation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logistics estimation error: {str(exc)}",
        )
