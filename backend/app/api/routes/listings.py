from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
)
from app.services.listing_service import ListingService
from app.api.deps import get_listing_service, get_current_seller_id

router = APIRouter()


@router.post(
    "",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new CO2 supply listing",
)
def create_listing(
    listing_in: ListingCreate,
    service: ListingService = Depends(get_listing_service),
    seller_id: Optional[str] = Depends(get_current_seller_id),
) -> ListingResponse:
    """
    Create a new CO2 supply listing in the platform.
    
    Validation:
    - quantity must be greater than 0
    - purity must be between 0 and 100
    - asking_price must be non-negative
    - availability_start must not be after availability_end
    - status must follow existing conventions ('active', 'in-negotiation', 'fulfilled', 'closed', 'pending')
    
    Seller identification is cleanly separated through an isolated interface.
    """
    try:
        created = service.create_listing(listing_in, seller_id=seller_id)
        return ListingResponse(**created)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create listing: {str(exc)}",
        )


@router.get(
    "",
    response_model=List[ListingResponse],
    status_code=status.HTTP_200_OK,
    summary="List all CO2 supply listings",
)
def get_listings(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by listing status"),
    min_purity: Optional[float] = Query(None, ge=0, le=100, description="Filter by minimum purity %"),
    seller_id: Optional[str] = Query(None, description="Filter by seller identifier"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of listings to return"),
    offset: int = Query(0, ge=0, description="Number of listings to skip"),
    service: ListingService = Depends(get_listing_service),
) -> List[ListingResponse]:
    """
    Retrieve all CO2 supply listings with optional filtering and pagination.
    """
    try:
        records = service.get_listings(
            status=status_filter,
            min_purity=min_purity,
            seller_id=seller_id,
            limit=limit,
            offset=offset,
        )
        return [ListingResponse(**item) for item in records]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve listings: {str(exc)}",
        )


@router.get(
    "/{listing_id}",
    response_model=ListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific CO2 supply listing by ID",
)
def get_listing_by_id(
    listing_id: str,
    service: ListingService = Depends(get_listing_service),
) -> ListingResponse:
    """
    Retrieve details for a specific CO2 supply listing by ID.
    """
    try:
        record = service.get_listing_by_id(listing_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with ID '{listing_id}' not found",
            )
        return ListingResponse(**record)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve listing: {str(exc)}",
        )


@router.patch(
    "/{listing_id}",
    response_model=ListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing CO2 supply listing",
)
def update_listing(
    listing_id: str,
    listing_update: ListingUpdate,
    service: ListingService = Depends(get_listing_service),
) -> ListingResponse:
    """
    Partially update fields on an existing CO2 supply listing.
    """
    try:
        updated = service.update_listing(listing_id, listing_update)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with ID '{listing_id}' not found",
            )
        return ListingResponse(**updated)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update listing: {str(exc)}",
        )


@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a CO2 supply listing",
)
def delete_listing(
    listing_id: str,
    service: ListingService = Depends(get_listing_service),
):
    """
    Delete an existing CO2 supply listing by ID.
    """
    try:
        deleted = service.delete_listing(listing_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with ID '{listing_id}' not found",
            )
        return None
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete listing: {str(exc)}",
        )
