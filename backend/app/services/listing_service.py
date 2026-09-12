import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from supabase import Client
from app.core.supabase import get_supabase_client
from app.schemas.listing import ListingCreate, ListingUpdate

logger = logging.getLogger(__name__)

TABLE_NAME = "co2_listings"


class ListingService:
    """
    Service layer for managing CO2 supply listings in the Supabase 'co2_listings' table.
    Encapsulates all persistence and query logic using the existing Supabase client.
    """

    def __init__(self, client: Optional[Client] = None):
        self._client = client

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    def create_listing(
        self, listing_in: ListingCreate, seller_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Persist a new CO2 supply listing in 'co2_listings'.
        """
        payload = listing_in.model_dump(exclude_unset=True)

        # Isolated seller_id handling: preference given to explicit argument
        effective_seller_id = seller_id if seller_id is not None else payload.get("seller_id")
        if effective_seller_id is not None:
            payload["seller_id"] = effective_seller_id
        elif "seller_id" in payload and payload["seller_id"] is None:
            payload.pop("seller_id")

        # Format datetimes to ISO strings for PostgREST
        if isinstance(payload.get("availability_start"), datetime):
            payload["availability_start"] = payload["availability_start"].isoformat()
        if isinstance(payload.get("availability_end"), datetime):
            payload["availability_end"] = payload["availability_end"].isoformat()

        try:
            response = self.client.table(TABLE_NAME).insert(payload).execute()
            if not response.data:
                raise RuntimeError("Failed to insert listing: no data returned from database")
            return response.data[0]
        except Exception as exc:
            logger.error("Error creating listing in %s: %s", TABLE_NAME, exc)
            raise

    def get_listings(
        self,
        status: Optional[str] = None,
        min_purity: Optional[float] = None,
        seller_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Query listings from 'co2_listings' with optional filtering and pagination.
        """
        try:
            query = self.client.table(TABLE_NAME).select("*")
            if status:
                query = query.eq("status", status.lower())
            if min_purity is not None:
                query = query.gte("purity", min_purity)
            if seller_id:
                query = query.eq("seller_id", seller_id)

            query = query.order("created_at", desc=True)
            if limit > 0:
                query = query.range(offset, offset + limit - 1)

            response = query.execute()
            return response.data or []
        except Exception as exc:
            logger.error("Error fetching listings from %s: %s", TABLE_NAME, exc)
            raise

    def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single listing from 'co2_listings' by its ID.
        """
        try:
            response = (
                self.client.table(TABLE_NAME)
                .select("*")
                .eq("id", listing_id)
                .limit(1)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as exc:
            # Postgres raises 22P02 for invalid UUID syntax — treat as not found
            exc_str = str(exc)
            if "22P02" in exc_str or "invalid input syntax" in exc_str:
                return None
            logger.error("Error fetching listing %s from %s: %s", listing_id, TABLE_NAME, exc)
            raise

    def update_listing(
        self, listing_id: str, listing_update: ListingUpdate
    ) -> Optional[Dict[str, Any]]:
        """
        Update an existing listing by ID.
        """
        payload = listing_update.model_dump(exclude_unset=True)
        if not payload:
            return self.get_listing_by_id(listing_id)

        if isinstance(payload.get("availability_start"), datetime):
            payload["availability_start"] = payload["availability_start"].isoformat()
        if isinstance(payload.get("availability_end"), datetime):
            payload["availability_end"] = payload["availability_end"].isoformat()

        try:
            response = (
                self.client.table(TABLE_NAME)
                .update(payload)
                .eq("id", listing_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as exc:
            logger.error("Error updating listing %s in %s: %s", listing_id, TABLE_NAME, exc)
            raise

    def delete_listing(self, listing_id: str) -> bool:
        """
        Delete a listing by ID. Returns True if deleted, False if not found.
        """
        try:
            existing = self.get_listing_by_id(listing_id)
            if not existing:
                return False

            self.client.table(TABLE_NAME).delete().eq("id", listing_id).execute()
            return True
        except Exception as exc:
            logger.error("Error deleting listing %s from %s: %s", listing_id, TABLE_NAME, exc)
            raise
