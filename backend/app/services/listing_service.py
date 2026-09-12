import uuid
from typing import Any, Dict, List, Optional
from fastapi import Depends, HTTPException, status
from supabase import Client
from postgrest.exceptions import APIError

from app.core.supabase import get_supabase_client
from app.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
)


class ListingService:
    """
    Service layer responsible for CO2 supply listing operations using Supabase.
    """

    def __init__(self, supabase_client: Client):
        self.client = supabase_client
        self.table_name = "co2_listings"

    def create_listing(
        self,
        listing_in: ListingCreate,
        seller_id: Optional[str] = None
    ) -> ListingResponse:
        """
        Create a new CO2 supply listing in Supabase.
        """
        payload: Dict[str, Any] = {
            "quantity": listing_in.quantity,
            "purity": listing_in.purity,
            "location": listing_in.location,
            "asking_price": listing_in.asking_price,
            "status": listing_in.status,
        }

        # Associate seller_id if available and is a valid UUID
        effective_seller = seller_id or listing_in.seller_id
        if effective_seller:
            try:
                uuid.UUID(str(effective_seller))
                payload["seller_id"] = str(effective_seller)
            except ValueError:
                pass

        # Date serialization
        if listing_in.availability_start:
            payload["availability_start"] = listing_in.availability_start.isoformat()
        if listing_in.availability_end:
            payload["availability_end"] = listing_in.availability_end.isoformat()

        try:
            response = self.client.table(self.table_name).insert(payload).execute()
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create listing: No data returned from database."
                )
            return ListingResponse.model_validate(response.data[0])
        except APIError as exc:
            # 42501 = PostgreSQL RLS permission denied
            if exc.code == "42501":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Database permission denied by Row-Level Security. Authenticated seller context required."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database error: {exc.message}"
            )

    def get_listings(
        self,
        status_filter: Optional[str] = None,
        min_purity: Optional[float] = None,
        min_quantity: Optional[float] = None,
        max_price: Optional[float] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ListingResponse]:
        """
        Retrieve a list of CO2 listings with optional filtering and pagination.
        """
        try:
            query = self.client.table(self.table_name).select("*")

            if status_filter:
                query = query.eq("status", status_filter)
            if min_purity is not None:
                query = query.gte("purity", min_purity)
            if min_quantity is not None:
                query = query.gte("quantity", min_quantity)
            if max_price is not None:
                query = query.lte("asking_price", max_price)

            query = query.range(offset, offset + limit - 1).order("created_at", desc=True)
            response = query.execute()

            return [ListingResponse.model_validate(row) for row in (response.data or [])]
        except APIError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database query error: {exc.message}"
            )

    def get_listing_by_id(self, listing_id: str) -> ListingResponse:
        """
        Retrieve a specific CO2 listing by its ID.
        """
        try:
            response = (
                self.client.table(self.table_name)
                .select("*")
                .eq("id", listing_id)
                .limit(1)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Listing with ID '{listing_id}' was not found."
                )

            return ListingResponse.model_validate(response.data[0])
        except APIError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database query error: {exc.message}"
            )

    def update_listing(
        self,
        listing_id: str,
        listing_in: ListingUpdate
    ) -> ListingResponse:
        """
        Update an existing CO2 supply listing by ID.
        """
        # Verify existence
        self.get_listing_by_id(listing_id)

        update_data = listing_in.model_dump(exclude_unset=True)
        if not update_data:
            return self.get_listing_by_id(listing_id)

        # Serialize dates if present
        if "availability_start" in update_data and update_data["availability_start"]:
            update_data["availability_start"] = update_data["availability_start"].isoformat()
        if "availability_end" in update_data and update_data["availability_end"]:
            update_data["availability_end"] = update_data["availability_end"].isoformat()

        try:
            response = (
                self.client.table(self.table_name)
                .update(update_data)
                .eq("id", listing_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Listing with ID '{listing_id}' could not be updated."
                )

            return ListingResponse.model_validate(response.data[0])
        except APIError as exc:
            if exc.code == "42501":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Database permission denied by Row-Level Security. Seller authorization required."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database update error: {exc.message}"
            )

    def delete_listing(self, listing_id: str) -> Dict[str, Any]:
        """
        Delete a CO2 supply listing by ID.
        """
        # Verify existence
        self.get_listing_by_id(listing_id)

        try:
            response = (
                self.client.table(self.table_name)
                .delete()
                .eq("id", listing_id)
                .execute()
            )

            return {
                "detail": f"Listing '{listing_id}' deleted successfully.",
                "id": listing_id
            }
        except APIError as exc:
            if exc.code == "42501":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Database permission denied by Row-Level Security. Seller authorization required."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database delete error: {exc.message}"
            )


def get_listing_service(
    supabase_client: Client = Depends(get_supabase_client)
) -> ListingService:
    """
    FastAPI dependency returning a ListingService instance.
    """
    return ListingService(supabase_client)
