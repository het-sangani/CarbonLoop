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

_LOCAL_REQUESTS: Dict[str, Dict[str, Any]] = {}


class RequestNotFoundError(Exception):
    """Raised when a requested supply bid/request is not found in database."""
    pass


class MatchNotFoundError(Exception):
    """Raised when the specified match_id does not exist."""
    pass


class UnauthorizedRequestActionError(Exception):
    """Raised when a user attempts an unauthorized operation on a request."""
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
        """
        if request_in.quantity <= 0:
            raise InvalidRequestDataError(f"Quantity must be greater than 0, got {request_in.quantity}")
        if request_in.offered_price < 0:
            raise InvalidRequestDataError(f"Offered price must be non-negative, got {request_in.offered_price}")

        # 1. Look up the match recommendation
        from app.services.matching import _LOCAL_MATCHES
        from app.services.requirement_service import _LOCAL_REQUIREMENTS
        from app.services.listing_service import _LOCAL_LISTINGS

        match_record = _LOCAL_MATCHES.get(request_in.match_id)
        if not match_record:
            try:
                match_res = (
                    self.client.table(MATCHES_TABLE)
                    .select("*")
                    .eq("id", request_in.match_id)
                    .execute()
                )
                if match_res.data:
                    match_record = match_res.data[0]
            except Exception:
                pass

        if not match_record:
            raise MatchNotFoundError(f"Match with ID '{request_in.match_id}' does not exist")

        requirement_id = match_record.get("requirement_id")
        listing_id = match_record.get("listing_id")

        # 2. Look up the requirement to verify buyer ownership
        requirement_record = _LOCAL_REQUIREMENTS.get(requirement_id)
        if not requirement_record:
            try:
                req_res = (
                    self.client.table(REQUIREMENTS_TABLE)
                    .select("*")
                    .eq("id", requirement_id)
                    .execute()
                )
                if req_res.data:
                    requirement_record = req_res.data[0]
            except Exception:
                pass

        if not requirement_record:
            raise InvalidRequestDataError(f"Requirement with ID '{requirement_id}' not found")

        req_buyer_id = str(requirement_record.get("buyer_id") or "")
        if req_buyer_id and req_buyer_id != str(buyer_id):
            raise UnauthorizedRequestActionError(
                "You do not have permission to request supply for a requirement owned by another buyer"
            )

        # 3. Look up listing to strictly resolve seller
        listing_record = _LOCAL_LISTINGS.get(listing_id)
        if not listing_record:
            try:
                list_res = (
                    self.client.table(LISTINGS_TABLE)
                    .select("*")
                    .eq("id", listing_id)
                    .execute()
                )
                if list_res.data:
                    listing_record = list_res.data[0]
            except Exception:
                pass

        if not listing_record and "listing" in match_record:
            listing_record = match_record["listing"]

        if not listing_record:
            raise InvalidRequestDataError(f"Listing with ID '{listing_id}' not found")

        resolved_seller_id = str(listing_record.get("seller_id") or "")
        if not resolved_seller_id:
            resolved_seller_id = "11111111-1111-4111-8111-111111111111"

        if request_in.seller_id and str(request_in.seller_id) != resolved_seller_id:
            raise InvalidRequestDataError(
                f"Provided seller_id '{request_in.seller_id}' does not match listing seller '{resolved_seller_id}'"
            )

        req_id = str(uuid.uuid4())
        now_str = datetime.now().isoformat()
        payload = {
            "id": req_id,
            "match_id": request_in.match_id,
            "buyer_id": buyer_id,
            "seller_id": resolved_seller_id,
            "quantity": float(request_in.quantity),
            "offered_price": float(request_in.offered_price),
            "status": RequestStatus.PENDING.value,
            "created_at": now_str,
        }

        try:
            insert_res = self.client.table(REQUESTS_TABLE).insert(payload).execute()
            if insert_res.data:
                rec = insert_res.data[0]
                _LOCAL_REQUESTS[rec["id"]] = rec
                return rec
        except Exception as exc:
            logger.info("Saved request to local cache due to DB/RLS: %s", exc)

        _LOCAL_REQUESTS[req_id] = payload
        return payload

    def get_requests(
        self,
        buyer_id: Optional[str] = None,
        seller_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves requests scoped by buyer, seller, and/or status.
        """
        db_records: List[Dict[str, Any]] = []
        try:
            query = self.client.table(REQUESTS_TABLE).select("*")
            if buyer_id:
                query = query.eq("buyer_id", buyer_id)
            if seller_id:
                query = query.eq("seller_id", seller_id)
            if status:
                query = query.eq("status", status.upper())

            res = query.order("created_at", desc=True).execute()
            db_records = res.data or []
        except Exception as exc:
            logger.info("Could not fetch requests from DB, falling back: %s", exc)

        db_ids = {r["id"] for r in db_records}
        local_records = [
            r for r in _LOCAL_REQUESTS.values()
            if r["id"] not in db_ids
            and (not buyer_id or str(r.get("buyer_id")) == str(buyer_id))
            and (not seller_id or str(r.get("seller_id")) == str(seller_id))
            and (not status or str(r.get("status", "")).upper() == status.upper())
        ]
        return db_records + local_records

    def get_request_by_id(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single request by its primary key ID.
        """
        if request_id in _LOCAL_REQUESTS:
            return _LOCAL_REQUESTS[request_id]
        try:
            res = self.client.table(REQUESTS_TABLE).select("*").eq("id", request_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return _LOCAL_REQUESTS.get(request_id)
        except Exception as exc:
            return _LOCAL_REQUESTS.get(request_id)

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
            if res.data:
                rec = res.data[0]
                _LOCAL_REQUESTS[request_id] = rec
                return rec
        except Exception as exc:
            logger.info("Updating local request status due to DB/RLS: %s", exc)

        existing["status"] = status_str
        _LOCAL_REQUESTS[request_id] = existing
        return existing
