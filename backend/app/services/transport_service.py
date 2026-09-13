import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
from supabase import Client

from app.core.supabase import get_supabase_client
from app.schemas.transport import (
    TransportJobCreate,
    TransportJobStatus,
)
from app.services.logistics import DistanceEstimator, LogisticsService

logger = logging.getLogger(__name__)

TRANSPORT_JOBS_TABLE = "transport_jobs"
REQUESTS_TABLE = "requests"
MATCHES_TABLE = "matches"
LISTINGS_TABLE = "co2_listings"
REQUIREMENTS_TABLE = "requirements"

_LOCAL_TRANSPORT_JOBS: Dict[str, Dict[str, Any]] = {}

VALID_TRANSITIONS: Dict[TransportJobStatus, List[TransportJobStatus]] = {
    TransportJobStatus.PENDING: [TransportJobStatus.ASSIGNED],
    TransportJobStatus.ASSIGNED: [TransportJobStatus.IN_TRANSIT],
    TransportJobStatus.IN_TRANSIT: [TransportJobStatus.DELIVERED],
    TransportJobStatus.DELIVERED: [],
}


class TransportJobNotFoundError(Exception):
    """Raised when a requested transport job does not exist."""
    pass


class InvalidTransportJobStateError(Exception):
    """Raised when a transport job operation violates business lifecycle rules."""
    pass


class UnauthorizedTransportActionError(Exception):
    """Raised when an unauthorized user attempts to manipulate a transport job."""
    pass


class InvalidTransportTransitionError(Exception):
    """Raised when an illegal status lifecycle transition is attempted."""
    pass


class TransportService:
    """
    Service layer for managing cryogenic CO2 transport jobs.
    Integrates with accepted supply requests, logistics distance & cost models,
    and enforces transporter assignment and status lifecycle state machine.
    """

    def __init__(
        self,
        client: Optional[Client] = None,
        distance_estimator: Optional[DistanceEstimator] = None,
        logistics_service: Optional[LogisticsService] = None,
    ):
        self._client = client
        self.distance_estimator = distance_estimator or DistanceEstimator()
        self.logistics_service = logistics_service or LogisticsService(
            distance_estimator=self.distance_estimator
        )

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    def create_transport_job(
        self,
        job_in: TransportJobCreate,
        creator_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Creates a new transport job from an ACCEPTED supply request.
        
        Rules:
        - Request must exist and have status 'ACCEPTED'.
        - pickup_location derived from matched listing.
        - delivery_location derived from matched buyer requirement.
        - distance_km calculated via DistanceEstimator.
        - estimated_cost calculated via LogisticsService transport cost model.
        """
        from app.services.request_service import _LOCAL_REQUESTS
        from app.services.matching import _LOCAL_MATCHES
        from app.services.listing_service import _LOCAL_LISTINGS
        from app.services.requirement_service import _LOCAL_REQUIREMENTS

        # 1. Fetch request
        request_record = _LOCAL_REQUESTS.get(job_in.request_id)
        if not request_record:
            try:
                req_res = (
                    self.client.table(REQUESTS_TABLE)
                    .select("*")
                    .eq("id", job_in.request_id)
                    .execute()
                )
                if req_res.data:
                    request_record = req_res.data[0]
            except Exception as exc:
                logger.error("Error querying request %s: %s", job_in.request_id, exc)

        if not request_record:
            raise TransportJobNotFoundError(f"Request with ID '{job_in.request_id}' not found")

        req_status = str(request_record.get("status") or "").upper()
        if req_status != "ACCEPTED":
            raise InvalidTransportJobStateError(
                f"Cannot create transport job for request with status '{req_status}'. "
                f"Request must be ACCEPTED before dispatching transport."
            )

        quantity_tonnes = float(request_record.get("quantity") or 100.0)
        match_id = request_record.get("match_id")

        # 2. Fetch match to determine listing and requirement
        match_record = _LOCAL_MATCHES.get(match_id) or {}
        if not match_record and match_id:
            try:
                m_res = self.client.table(MATCHES_TABLE).select("*").eq("id", match_id).execute()
                if m_res.data:
                    match_record = m_res.data[0]
            except Exception as exc:
                logger.warning("Could not fetch match %s: %s", match_id, exc)

        listing_id = match_record.get("listing_id")
        requirement_id = match_record.get("requirement_id")

        # 3. Derive pickup location from listing
        pickup_location = "Dahej, Gujarat"
        listing_record = _LOCAL_LISTINGS.get(listing_id)
        if listing_record and listing_record.get("location"):
            pickup_location = listing_record["location"]
        elif listing_id:
            try:
                l_res = self.client.table(LISTINGS_TABLE).select("*").eq("id", listing_id).execute()
                if l_res.data and l_res.data[0].get("location"):
                    pickup_location = l_res.data[0]["location"]
            except Exception as exc:
                logger.warning("Could not fetch listing %s: %s", listing_id, exc)

        # 4. Derive delivery location from requirement
        delivery_location = "Hazira, Gujarat"
        requirement_record = _LOCAL_REQUIREMENTS.get(requirement_id)
        if requirement_record and requirement_record.get("delivery_location"):
            delivery_location = requirement_record["delivery_location"]
        elif requirement_id:
            try:
                r_res = self.client.table(REQUIREMENTS_TABLE).select("*").eq("id", requirement_id).execute()
                if r_res.data and r_res.data[0].get("delivery_location"):
                    delivery_location = r_res.data[0]["delivery_location"]
            except Exception as exc:
                logger.warning("Could not fetch requirement %s: %s", requirement_id, exc)

        # 5. Calculate distance and transportation cost using logistics model
        distance_km, _ = self.distance_estimator.estimate_distance(pickup_location, delivery_location)
        transport_cost, _ = self.logistics_service.calculate_transport_cost(distance_km, quantity_tonnes)

        initial_status = (
            TransportJobStatus.ASSIGNED.value
            if job_in.transporter_id
            else TransportJobStatus.PENDING.value
        )

        job_id = str(uuid.uuid4())
        now_str = datetime.now().isoformat()
        payload = {
            "id": job_id,
            "request_id": job_in.request_id,
            "transporter_id": job_in.transporter_id,
            "pickup_location": pickup_location,
            "delivery_location": delivery_location,
            "distance_km": float(distance_km),
            "estimated_cost": float(transport_cost),
            "status": initial_status,
            "created_at": now_str,
        }

        try:
            insert_res = self.client.table(TRANSPORT_JOBS_TABLE).insert(payload).execute()
            if insert_res.data:
                rec = insert_res.data[0]
                _LOCAL_TRANSPORT_JOBS[rec["id"]] = rec
                return rec
        except Exception as exc:
            logger.info("Saved transport job to local cache due to DB/RLS: %s", exc)

        _LOCAL_TRANSPORT_JOBS[job_id] = payload
        return payload

    def get_transport_jobs(
        self,
        transporter_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """List transport jobs scoped by transporter and/or status."""
        db_records: List[Dict[str, Any]] = []
        try:
            query = self.client.table(TRANSPORT_JOBS_TABLE).select("*")
            if transporter_id:
                query = query.eq("transporter_id", transporter_id)
            if status:
                query = query.eq("status", status.upper())

            res = query.order("created_at", desc=True).execute()
            db_records = res.data or []
        except Exception as exc:
            logger.info("Could not fetch transport jobs from DB, falling back: %s", exc)

        db_ids = {r["id"] for r in db_records}
        local_records = [
            r for r in _LOCAL_TRANSPORT_JOBS.values()
            if r["id"] not in db_ids
            and (not transporter_id or str(r.get("transporter_id")) == str(transporter_id))
            and (not status or str(r.get("status", "")).upper() == status.upper())
        ]
        return db_records + local_records

    def get_transport_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve single transport job by ID."""
        if job_id in _LOCAL_TRANSPORT_JOBS:
            return _LOCAL_TRANSPORT_JOBS[job_id]
        try:
            res = self.client.table(TRANSPORT_JOBS_TABLE).select("*").eq("id", job_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return _LOCAL_TRANSPORT_JOBS.get(job_id)
        except Exception:
            return _LOCAL_TRANSPORT_JOBS.get(job_id)

    def assign_transporter(
        self,
        job_id: str,
        transporter_id: str,
    ) -> Dict[str, Any]:
        """Assigns an authenticated transporter to a transport job."""
        job = self.get_transport_job_by_id(job_id)
        if not job:
            raise TransportJobNotFoundError(f"Transport job with ID '{job_id}' not found")

        current_status = TransportJobStatus(job.get("status", "PENDING").upper())
        if current_status == TransportJobStatus.DELIVERED:
            raise InvalidTransportJobStateError("Cannot assign transporter to an already DELIVERED job")

        try:
            res = (
                self.client.table(TRANSPORT_JOBS_TABLE)
                .update({
                    "transporter_id": transporter_id,
                    "status": TransportJobStatus.ASSIGNED.value,
                })
                .eq("id", job_id)
                .execute()
            )
            if res.data:
                rec = res.data[0]
                _LOCAL_TRANSPORT_JOBS[job_id] = rec
                return rec
        except Exception as exc:
            logger.info("Updating local transport assignment due to DB/RLS: %s", exc)

        job["transporter_id"] = transporter_id
        job["status"] = TransportJobStatus.ASSIGNED.value
        _LOCAL_TRANSPORT_JOBS[job_id] = job
        return job

    def update_job_status(
        self,
        job_id: str,
        new_status: TransportJobStatus,
        transporter_id: str,
    ) -> Dict[str, Any]:
        """
        Updates delivery status along the valid lifecycle state machine:
        PENDING -> ASSIGNED -> IN_TRANSIT -> DELIVERED
        Enforces that only the assigned transporter can advance the job status.
        """
        job = self.get_transport_job_by_id(job_id)
        if not job:
            raise TransportJobNotFoundError(f"Transport job with ID '{job_id}' not found")

        # Verify assigned transporter
        assigned_id = str(job.get("transporter_id") or "")
        if not assigned_id or assigned_id != str(transporter_id):
            raise UnauthorizedTransportActionError(
                "Only the assigned transporter can update this transport job's status"
            )

        current_status = TransportJobStatus(job.get("status", "PENDING").upper())

        # Validate lifecycle transition
        allowed_next = VALID_TRANSITIONS.get(current_status, [])
        if new_status not in allowed_next:
            raise InvalidTransportTransitionError(
                f"Invalid status transition from '{current_status.value}' to '{new_status.value}'. "
                f"Allowed transitions: {[s.value for s in allowed_next]}"
            )

        try:
            res = (
                self.client.table(TRANSPORT_JOBS_TABLE)
                .update({"status": new_status.value})
                .eq("id", job_id)
                .execute()
            )
            if res.data:
                rec = res.data[0]
                _LOCAL_TRANSPORT_JOBS[job_id] = rec
                return rec
        except Exception as exc:
            logger.info("Updating local transport status due to DB/RLS: %s", exc)

        job["status"] = new_status.value
        _LOCAL_TRANSPORT_JOBS[job_id] = job
        return job
