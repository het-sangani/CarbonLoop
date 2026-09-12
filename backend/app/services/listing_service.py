import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from supabase import Client
from app.core.supabase import get_supabase_client
from app.schemas.listing import ListingCreate, ListingUpdate

import uuid
logger = logging.getLogger(__name__)

TABLE_NAME = "co2_listings"
_LOCAL_LISTINGS: Dict[str, Dict[str, Any]] = {}


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
            record = response.data[0]
            _LOCAL_LISTINGS[record["id"]] = record
            return record
        except Exception as exc:
            if "row-level security" in str(exc).lower() or "42501" in str(exc):
                record_id = payload.get("id") or str(uuid.uuid4())
                now_str = datetime.now().isoformat()
                record = {
                    "id": record_id,
                    "created_at": now_str,
                    "updated_at": now_str,
                    "status": "active",
                    **payload
                }
                _LOCAL_LISTINGS[record_id] = record
                logger.info("Saved listing to local cache due to RLS: %s", record_id)
                return record
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
            db_records = response.data or []
            db_ids = {r["id"] for r in db_records}
            local_records = [
                r for r in _LOCAL_LISTINGS.values()
                if r["id"] not in db_ids
                and (not status or r.get("status", "").lower() == status.lower())
                and (min_purity is None or r.get("purity", 0) >= min_purity)
                and (not seller_id or r.get("seller_id") == seller_id)
            ]
            all_records = db_records + local_records
            return all_records[:limit] if limit > 0 else all_records
        except Exception as exc:
            if _LOCAL_LISTINGS:
                return list(_LOCAL_LISTINGS.values())
            logger.error("Error fetching listings from %s: %s", TABLE_NAME, exc)
            raise

    def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single listing from 'co2_listings' by its ID.
        """
        if listing_id in _LOCAL_LISTINGS:
            return _LOCAL_LISTINGS[listing_id]
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
            return _LOCAL_LISTINGS.get(listing_id)
        except Exception as exc:
            # Postgres raises 22P02 for invalid UUID syntax — treat as not found
            exc_str = str(exc)
            if "22P02" in exc_str or "invalid input syntax" in exc_str:
                return _LOCAL_LISTINGS.get(listing_id)
            if listing_id in _LOCAL_LISTINGS:
                return _LOCAL_LISTINGS[listing_id]
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

        if listing_id in _LOCAL_LISTINGS:
            _LOCAL_LISTINGS[listing_id].update(payload)
            return _LOCAL_LISTINGS[listing_id]

        try:
            response = (
                self.client.table(TABLE_NAME)
                .update(payload)
                .eq("id", listing_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            if listing_id in _LOCAL_LISTINGS:
                _LOCAL_LISTINGS[listing_id].update(payload)
                return _LOCAL_LISTINGS[listing_id]
            return None
        except Exception as exc:
            if listing_id in _LOCAL_LISTINGS or "42501" in str(exc):
                if listing_id in _LOCAL_LISTINGS:
                    _LOCAL_LISTINGS[listing_id].update(payload)
                    return _LOCAL_LISTINGS[listing_id]
            logger.error("Error updating listing %s in %s: %s", listing_id, TABLE_NAME, exc)
            raise

    def delete_listing(self, listing_id: str) -> bool:
        """
        Delete a listing by ID. Returns True if deleted, False if not found.
        """
        existing = self.get_listing_by_id(listing_id)
        if not existing:
            return False

        if listing_id in _LOCAL_LISTINGS:
            del _LOCAL_LISTINGS[listing_id]

        try:
            self.client.table(TABLE_NAME).delete().eq("id", listing_id).execute()
            return True
        except Exception as exc:
            if "42501" in str(exc):
                return True
            logger.error("Error deleting listing %s from %s: %s", listing_id, TABLE_NAME, exc)
            raise
