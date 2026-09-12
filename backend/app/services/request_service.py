import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
from supabase import Client

from app.core.supabase import get_supabase_client
from app.schemas.request import RequestCreate, RequestStatus

logger = logging.getLogger(__name__)

REQUESTS_TABLE = "requests"
MATCHES_TABLE = "matches"
REQUIREMENTS_TABLE = "requirements"
LISTINGS_TABLE = "co2_listings"


class RequestNotFoundError(Exception):
    """Raised when a requested supply bid/request does not exist."""
    pass


class MatchNotFoundError(Exception):
    """Raised when the specified match ID cannot be found."""
    pass


class UnauthorizedRequestActionError(Exception):
    """Raised when a user attempts an unauthorized action on a request."""
    pass


class InvalidRequestDataError(Exception):
    """Raised when input validation or entity association fails."""
    pass


class RequestService:
    """
    Service layer for managing CO2 supply requests and bids in the CarbonLoop marketplace.
    Implements full lifecycle: creation by buyers, scoping by role, and seller accept/reject.
    """

    def __init__(self, client: Optional[Client] = None):
        self._client = client

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    def create_request(
        self,
        request_in: RequestCreate,
        buyer_id: str,
    ) -> Dict[str, Any]:
        """
        Creates a new supply request for an authenticated buyer from a valid match.
        
        Validations:
        1. match_id must exist in `matches`.
        2. buyer must own the requirement associated with the match.
        3. seller is strictly resolved from the listing associated with the match.
        4. quantity must be > 0.
        5. offered_price must be >= 0.
        """
        if request_in.quantity <= 0:
            raise InvalidRequestDataError(f"Quantity must be greater than 0, got {request_in.quantity}")
        if request_in.offered_price < 0:
            raise InvalidRequestDataError(f"Offered price must be non-negative, got {request_in.offered_price}")

        # 1. Look up the match recommendation
        try:
            match_res = (
                self.client.table(MATCHES_TABLE)
                .select("*")
                .eq("id", request_in.match_id)
                .execute()
            )
        except Exception as exc:
            logger.error("Error querying match %s: %s", request_in.match_id, exc)
            raise MatchNotFoundError(f"Match with ID '{request_in.match_id}' not found") from exc

        if not match_res.data:
            raise MatchNotFoundError(f"Match with ID '{request_in.match_id}' does not exist")

        match_record = match_res.data[0]
        requirement_id = match_record.get("requirement_id")
        listing_id = match_record.get("listing_id")

        # 2. Look up the requirement to verify buyer ownership
        try:
            req_res = (
                self.client.table(REQUIREMENTS_TABLE)
                .select("*")
                .eq("id", requirement_id)
                .execute()
            )
        except Exception as exc:
            logger.error("Error querying requirement %s: %s", requirement_id, exc)
            raise InvalidRequestDataError("Could not retrieve requirement associated with match") from exc

        if not req_res.data:
            raise InvalidRequestDataError(f"Requirement with ID '{requirement_id}' not found")

        requirement_record = req_res.data[0]
        req_buyer_id = str(requirement_record.get("buyer_id") or "")
        if req_buyer_id != str(buyer_id):
            raise UnauthorizedRequestActionError(
                "You do not have permission to request supply for a requirement owned by another buyer"
            )

        # 3. Look up listing to strictly resolve seller
        try:
            list_res = (
                self.client.table(LISTINGS_TABLE)
                .select("*")
                .eq("id", listing_id)
                .execute()
            )
        except Exception as exc:
            logger.error("Error querying listing %s: %s", listing_id, exc)
            raise InvalidRequestDataError("Could not retrieve listing associated with match") from exc

        if not list_res.data:
            raise InvalidRequestDataError(f"Listing with ID '{listing_id}' not found")

        listing_record = list_res.data[0]
        resolved_seller_id = str(listing_record.get("seller_id") or "")
        if not resolved_seller_id:
            raise InvalidRequestDataError("Matched listing has no associated seller profile")

        if request_in.seller_id and str(request_in.seller_id) != resolved_seller_id:
            raise InvalidRequestDataError(
                f"Provided seller_id '{request_in.seller_id}' does not match listing seller '{resolved_seller_id}'"
            )

        # 4. Insert request record
        payload = {
            "match_id": request_in.match_id,
            "buyer_id": buyer_id,
            "seller_id": resolved_seller_id,
            "quantity": float(request_in.quantity),
            "offered_price": float(request_in.offered_price),
            "status": RequestStatus.PENDING.value,
        }

        try:
            insert_res = self.client.table(REQUESTS_TABLE).insert(payload).execute()
            if not insert_res.data:
                raise RuntimeError("Failed to insert supply request: no data returned from database")
            return insert_res.data[0]
        except Exception as exc:
            logger.error("Error creating request in %s: %s", REQUESTS_TABLE, exc)
            raise

    def get_requests(
        self,
        buyer_id: Optional[str] = None,
        seller_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves requests scoped by buyer, seller, and/or status.
        """
        try:
            query = self.client.table(REQUESTS_TABLE).select("*")
            if buyer_id:
                query = query.eq("buyer_id", buyer_id)
            if seller_id:
                query = query.eq("seller_id", seller_id)
            if status:
                query = query.eq("status", status.upper())

            res = query.order("created_at", desc=True).execute()
            return res.data or []
        except Exception as exc:
            logger.error("Error querying requests: %s", exc)
            raise

    def get_request_by_id(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single request by its primary key ID.
        """
        try:
            res = self.client.table(REQUESTS_TABLE).select("*").eq("id", request_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as exc:
            logger.error("Error fetching request %s: %s", request_id, exc)
            raise

    def update_request_status(
        self,
        request_id: str,
        new_status: RequestStatus,
        seller_id: str,
    ) -> Dict[str, Any]:
        """
        Updates the status of a request to ACCEPTED or REJECTED.
        Enforces that only the designated seller can perform this action.
        """
        existing = self.get_request_by_id(request_id)
        if not existing:
            raise RequestNotFoundError(f"Supply request with ID '{request_id}' not found")

        # Verify seller ownership
        if str(existing.get("seller_id") or "") != str(seller_id):
            raise UnauthorizedRequestActionError(
                "Only the seller to whom this supply request is directed may accept or reject it"
            )

        status_str = new_status.value if isinstance(new_status, RequestStatus) else str(new_status)

        try:
            res = (
                self.client.table(REQUESTS_TABLE)
                .update({"status": status_str})
                .eq("id", request_id)
                .execute()
            )
            if not res.data:
                raise RuntimeError(f"Failed to update request status for ID {request_id}")
            return res.data[0]
        except Exception as exc:
            logger.error("Error updating request status %s: %s", request_id, exc)
            raise
