from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
)
from app.schemas.auth import AuthenticatedUser
from app.services.listing_service import ListingService
from app.api.deps import get_listing_service, require_seller, get_current_seller_id

router = APIRouter()


@router.post(
    "",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new CO2 supply listing",
)
def create_listing(
    listing_in: ListingCreate,
    current_user: AuthenticatedUser = Depends(require_seller),
    seller_id: Optional[str] = Depends(get_current_seller_id),
    service: ListingService = Depends(get_listing_service),
) -> ListingResponse:
    """
    Create a new CO2 supply listing in the platform.
    Requires SELLER role. The seller_id is automatically bound to the authenticated user ID.
    """
    try:
        effective_seller = seller_id or (current_user.id if current_user else None)
        created = service.create_listing(listing_in, seller_id=effective_seller)
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
    Marketplace explorer endpoint accessible to all users.
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
    current_user: AuthenticatedUser = Depends(require_seller),
    service: ListingService = Depends(get_listing_service),
) -> ListingResponse:
    """
    Partially update fields on an existing CO2 supply listing.
    Requires SELLER role. Enforces that only the creator/owner seller can modify their listing.
    """
    try:
        existing = service.get_listing_by_id(listing_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with ID '{listing_id}' not found",
            )

        # Ownership check: seller cannot modify another seller's listing
        if existing.get("seller_id") and current_user and str(existing["seller_id"]) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify another seller's listing",
            )

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
    current_user: AuthenticatedUser = Depends(require_seller),
    service: ListingService = Depends(get_listing_service),
):
    """
    Delete an existing CO2 supply listing by ID.
    Requires SELLER role. Enforces that only the creator/owner seller can delete their listing.
    """
    try:
        existing = service.get_listing_by_id(listing_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing with ID '{listing_id}' not found",
            )

        # Ownership check: seller cannot delete another seller's listing
        if existing.get("seller_id") and current_user and str(existing["seller_id"]) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete another seller's listing",
            )

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
