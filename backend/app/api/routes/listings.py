from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_seller_id
from app.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
)
from app.services.listing_service import ListingService, get_listing_service

router = APIRouter(prefix="/listings", tags=["CO2 Listings"])


@router.post(
    "",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new CO2 supply listing"
)
def create_listing(
    listing_in: ListingCreate,
    seller_id: Optional[str] = Depends(get_current_seller_id),
    service: ListingService = Depends(get_listing_service),
) -> ListingResponse:
    """
    Creates a new CO2 supply listing with comprehensive validation.
    Seller ID can be provided via header `X-Seller-ID` or in the request body.
    """
    return service.create_listing(listing_in, seller_id=seller_id)


@router.get(
    "",
    response_model=List[ListingResponse],
    summary="List all CO2 supply listings"
)
def get_listings(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (e.g. AVAILABLE)"),
    min_purity: Optional[float] = Query(None, ge=0, le=100, description="Minimum purity percentage"),
    min_quantity: Optional[float] = Query(None, gt=0, description="Minimum volume in tonnes"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum asking price per tonne"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of listings to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    service: ListingService = Depends(get_listing_service),
) -> List[ListingResponse]:
    """
    Retrieves available CO2 listings with optional filtering criteria and pagination.
    """
    return service.get_listings(
        status_filter=status_filter,
        min_purity=min_purity,
        min_quantity=min_quantity,
        max_price=max_price,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{listing_id}",
    response_model=ListingResponse,
    summary="Get CO2 listing by ID"
)
def get_listing(
    listing_id: str,
    service: ListingService = Depends(get_listing_service),
) -> ListingResponse:
    """
    Retrieves a single CO2 supply listing by its unique identifier.
    """
    return service.get_listing_by_id(listing_id)


@router.patch(
    "/{listing_id}",
    response_model=ListingResponse,
    summary="Update CO2 listing"
)
def update_listing(
    listing_id: str,
    listing_in: ListingUpdate,
    service: ListingService = Depends(get_listing_service),
) -> ListingResponse:
    """
    Partially updates an existing CO2 supply listing.
    """
    return service.update_listing(listing_id, listing_in)


@router.delete(
    "/{listing_id}",
    summary="Delete CO2 listing"
)
def delete_listing(
    listing_id: str,
    service: ListingService = Depends(get_listing_service),
) -> Dict[str, Any]:
    """
    Deletes a CO2 supply listing by ID.
    """
    return service.delete_listing(listing_id)
