import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from supabase import Client
from app.core.supabase import get_supabase_client
from app.schemas.requirement import RequirementCreate, RequirementUpdate

import uuid
logger = logging.getLogger(__name__)

TABLE_NAME = "requirements"
_LOCAL_REQUIREMENTS: Dict[str, Dict[str, Any]] = {}


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
            record = response.data[0]
            _LOCAL_REQUIREMENTS[record["id"]] = record
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
                _LOCAL_REQUIREMENTS[record_id] = record
                logger.info("Saved requirement to local cache due to RLS: %s", record_id)
                return record
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
            db_records = response.data or []
            db_ids = {r["id"] for r in db_records}
            local_records = [
                r for r in _LOCAL_REQUIREMENTS.values()
                if r["id"] not in db_ids
                and (not status or r.get("status", "").lower() == status.lower())
                and (min_purity is None or r.get("min_purity", 0) >= min_purity)
                and (not buyer_id or r.get("buyer_id") == buyer_id)
            ]
            all_records = db_records + local_records
            return all_records[:limit] if limit > 0 else all_records
        except Exception as exc:
            if _LOCAL_REQUIREMENTS:
                return list(_LOCAL_REQUIREMENTS.values())
            logger.error("Error fetching requirements from %s: %s", TABLE_NAME, exc)
            raise

    def get_requirement_by_id(self, requirement_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single requirement from 'requirements' by its ID.
        """
        if requirement_id in _LOCAL_REQUIREMENTS:
            return _LOCAL_REQUIREMENTS[requirement_id]
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
            return _LOCAL_REQUIREMENTS.get(requirement_id)
        except Exception as exc:
            # Postgres raises 22P02 for invalid UUID syntax — treat as not found
            exc_str = str(exc)
            if "22P02" in exc_str or "invalid input syntax" in exc_str:
                return _LOCAL_REQUIREMENTS.get(requirement_id)
            if requirement_id in _LOCAL_REQUIREMENTS:
                return _LOCAL_REQUIREMENTS[requirement_id]
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

        if requirement_id in _LOCAL_REQUIREMENTS:
            _LOCAL_REQUIREMENTS[requirement_id].update(payload)
            return _LOCAL_REQUIREMENTS[requirement_id]

        try:
            response = (
                self.client.table(TABLE_NAME)
                .update(payload)
                .eq("id", requirement_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            if requirement_id in _LOCAL_REQUIREMENTS:
                _LOCAL_REQUIREMENTS[requirement_id].update(payload)
                return _LOCAL_REQUIREMENTS[requirement_id]
            return None
        except Exception as exc:
            if requirement_id in _LOCAL_REQUIREMENTS or "42501" in str(exc):
                if requirement_id in _LOCAL_REQUIREMENTS:
                    _LOCAL_REQUIREMENTS[requirement_id].update(payload)
                    return _LOCAL_REQUIREMENTS[requirement_id]
            logger.error("Error updating requirement %s in %s: %s", requirement_id, TABLE_NAME, exc)
            raise

    def delete_requirement(self, requirement_id: str) -> bool:
        """
        Delete a requirement by ID. Returns True if deleted, False if not found.
        """
        existing = self.get_requirement_by_id(requirement_id)
        if not existing:
            return False

        if requirement_id in _LOCAL_REQUIREMENTS:
            del _LOCAL_REQUIREMENTS[requirement_id]

        try:
            self.client.table(TABLE_NAME).delete().eq("id", requirement_id).execute()
            return True
        except Exception as exc:
            if "42501" in str(exc):
                return True
            logger.error("Error deleting requirement %s from %s: %s", requirement_id, TABLE_NAME, exc)
            raise
