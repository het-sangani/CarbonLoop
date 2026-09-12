import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from supabase import Client
from app.core.supabase import get_supabase_client
from app.schemas.requirement import RequirementCreate, RequirementUpdate

logger = logging.getLogger(__name__)

TABLE_NAME = "requirements"


class RequirementService:
    """
    Service layer for managing buyer requirements in the Supabase 'requirements' table.
    Encapsulates all persistence and query logic using the existing Supabase client.
    """

    def __init__(self, client: Optional[Client] = None):
        self._client = client

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    def create_requirement(
        self, requirement_in: RequirementCreate, buyer_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Persist a new buyer requirement in 'requirements'.
        """
        payload = requirement_in.model_dump(exclude_unset=True)

        # Isolated buyer_id handling: preference given to explicit argument
        effective_buyer_id = buyer_id if buyer_id is not None else payload.get("buyer_id")
        if effective_buyer_id is not None:
            payload["buyer_id"] = effective_buyer_id
        elif "buyer_id" in payload and payload["buyer_id"] is None:
            payload.pop("buyer_id")

        # Format datetime to ISO string for PostgREST
        if isinstance(payload.get("required_date"), datetime):
            payload["required_date"] = payload["required_date"].isoformat()

        try:
            response = self.client.table(TABLE_NAME).insert(payload).execute()
            if not response.data:
                raise RuntimeError("Failed to insert requirement: no data returned from database")
            return response.data[0]
        except Exception as exc:
            logger.error("Error creating requirement in %s: %s", TABLE_NAME, exc)
            raise

    def get_requirements(
        self,
        status: Optional[str] = None,
        min_purity: Optional[float] = None,
        buyer_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Query requirements from 'requirements' with optional filtering and pagination.
        """
        try:
            query = self.client.table(TABLE_NAME).select("*")
            if status:
                query = query.eq("status", status.lower())
            if min_purity is not None:
                query = query.gte("min_purity", min_purity)
            if buyer_id:
                query = query.eq("buyer_id", buyer_id)

            query = query.order("created_at", desc=True)
            if limit > 0:
                query = query.range(offset, offset + limit - 1)

            response = query.execute()
            return response.data or []
        except Exception as exc:
            logger.error("Error fetching requirements from %s: %s", TABLE_NAME, exc)
            raise

    def get_requirement_by_id(self, requirement_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single requirement from 'requirements' by its ID.
        """
        try:
            response = (
                self.client.table(TABLE_NAME)
                .select("*")
                .eq("id", requirement_id)
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
            logger.error("Error fetching requirement %s from %s: %s", requirement_id, TABLE_NAME, exc)
            raise


    def update_requirement(
        self, requirement_id: str, requirement_update: RequirementUpdate
    ) -> Optional[Dict[str, Any]]:
        """
        Update an existing requirement by ID.
        """
        payload = requirement_update.model_dump(exclude_unset=True)
        if not payload:
            return self.get_requirement_by_id(requirement_id)

        if isinstance(payload.get("required_date"), datetime):
            payload["required_date"] = payload["required_date"].isoformat()

        try:
            response = (
                self.client.table(TABLE_NAME)
                .update(payload)
                .eq("id", requirement_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as exc:
            logger.error("Error updating requirement %s in %s: %s", requirement_id, TABLE_NAME, exc)
            raise

    def delete_requirement(self, requirement_id: str) -> bool:
        """
        Delete a requirement by ID. Returns True if deleted, False if not found.
        """
        try:
            existing = self.get_requirement_by_id(requirement_id)
            if not existing:
                return False

            self.client.table(TABLE_NAME).delete().eq("id", requirement_id).execute()
            return True
        except Exception as exc:
            logger.error("Error deleting requirement %s from %s: %s", requirement_id, TABLE_NAME, exc)
            raise
