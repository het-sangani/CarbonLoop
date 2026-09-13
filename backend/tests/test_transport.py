import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import (
    get_transport_service,
    get_current_user,
    require_transporter,
)
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole
from app.schemas.transport import (
    TransportJobCreate,
    TransportJobAssign,
    TransportJobStatus,
    TransportJobStatusUpdate,
    TransportJobResponse,
)
from app.services.transport_service import (
    TransportService,
    TransportJobNotFoundError,
    InvalidTransportJobStateError,
    UnauthorizedTransportActionError,
    InvalidTransportTransitionError,
)
from app.services.logistics import DistanceEstimator, LogisticsService

# Fixture Users
TRANSPORTER_A_ID = "transporter-uuid-aaa"
TRANSPORTER_B_ID = "transporter-uuid-bbb"
BUYER_ID = "buyer-uuid-111"
SELLER_ID = "seller-uuid-222"

transporter_user_a = AuthenticatedUser(
    id=TRANSPORTER_A_ID,
    email="carrier_a@transport.com",
    profile=ProfileResponse(id=TRANSPORTER_A_ID, role=UserRole.TRANSPORTER),
    role=UserRole.TRANSPORTER,
)

transporter_user_b = AuthenticatedUser(
    id=TRANSPORTER_B_ID,
    email="carrier_b@transport.com",
    profile=ProfileResponse(id=TRANSPORTER_B_ID, role=UserRole.TRANSPORTER),
    role=UserRole.TRANSPORTER,
)

buyer_user = AuthenticatedUser(
    id=BUYER_ID,
    email="buyer@enterprise.com",
    profile=ProfileResponse(id=BUYER_ID, role=UserRole.BUYER),
    role=UserRole.BUYER,
)


class MockTransportService:
    """In-memory test double for TransportService."""

    def __init__(self):
        self.requests: Dict[str, Dict[str, Any]] = {}
        self.matches: Dict[str, Dict[str, Any]] = {}
        self.listings: Dict[str, Dict[str, Any]] = {}
        self.requirements: Dict[str, Dict[str, Any]] = {}
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.distance_estimator = DistanceEstimator()
        self.logistics_service = LogisticsService(distance_estimator=self.distance_estimator)

    def seed_scenario(
        self,
        request_id: str,
        match_id: str,
        req_id: str,
        list_id: str,
        pickup_loc: str = "Dahej, Gujarat",
        delivery_loc: str = "Hazira, Gujarat",
        quantity: float = 200.0,
        request_status: str = "ACCEPTED",
    ):
        self.listings[list_id] = {
            "id": list_id,
            "location": pickup_loc,
            "quantity": 500.0,
        }
        self.requirements[req_id] = {
            "id": req_id,
            "delivery_location": delivery_loc,
            "required_quantity": quantity,
        }
        self.matches[match_id] = {
            "id": match_id,
            "listing_id": list_id,
            "requirement_id": req_id,
        }
        self.requests[request_id] = {
            "id": request_id,
            "match_id": match_id,
            "quantity": quantity,
            "status": request_status,
        }

    def create_transport_job(self, job_in: TransportJobCreate, creator_id: Optional[str] = None) -> Dict[str, Any]:
        req = self.requests.get(job_in.request_id)
        if not req:
            raise TransportJobNotFoundError(f"Request '{job_in.request_id}' not found")
        if req.get("status") != "ACCEPTED":
            raise InvalidTransportJobStateError(
                f"Cannot create transport job for request with status '{req.get('status')}'. Request must be ACCEPTED."
            )

        match = self.matches.get(req.get("match_id", ""), {})
        listing = self.listings.get(match.get("listing_id", ""), {})
        requirement = self.requirements.get(match.get("requirement_id", ""), {})

        pickup = listing.get("location", "Dahej, Gujarat")
        delivery = requirement.get("delivery_location", "Hazira, Gujarat")
        dist, _ = self.distance_estimator.estimate_distance(pickup, delivery)
        cost, _ = self.logistics_service.calculate_transport_cost(dist, float(req.get("quantity", 100.0)))

        job_id = str(uuid.uuid4())
        initial_status = TransportJobStatus.ASSIGNED.value if job_in.transporter_id else TransportJobStatus.PENDING.value
        record = {
            "id": job_id,
            "request_id": job_in.request_id,
            "transporter_id": job_in.transporter_id,
            "pickup_location": pickup,
            "delivery_location": delivery,
            "distance_km": float(dist),
            "estimated_cost": float(cost),
            "status": initial_status,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.jobs[job_id] = record
        return record

    def get_transport_jobs(self, transporter_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        results = list(self.jobs.values())
        if transporter_id:
            results = [j for j in results if j["transporter_id"] == transporter_id or j["transporter_id"] is None]
        if status:
            results = [j for j in results if j["status"].upper() == status.upper()]
        return results

    def get_transport_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self.jobs.get(job_id)

    def assign_transporter(self, job_id: str, transporter_id: str) -> Dict[str, Any]:
        job = self.jobs.get(job_id)
        if not job:
            raise TransportJobNotFoundError(f"Job '{job_id}' not found")
        if job["status"] == TransportJobStatus.DELIVERED.value:
            raise InvalidTransportJobStateError("Cannot assign transporter to an already DELIVERED job")
        job["transporter_id"] = transporter_id
        job["status"] = TransportJobStatus.ASSIGNED.value
        return job

    def update_job_status(self, job_id: str, new_status: TransportJobStatus, transporter_id: str) -> Dict[str, Any]:
        job = self.jobs.get(job_id)
        if not job:
            raise TransportJobNotFoundError(f"Job '{job_id}' not found")
        if str(job.get("transporter_id") or "") != str(transporter_id):
            raise UnauthorizedTransportActionError("Only the assigned transporter can update job status")

        curr = TransportJobStatus(job["status"])
        valid_transitions = {
            TransportJobStatus.PENDING: [TransportJobStatus.ASSIGNED],
            TransportJobStatus.ASSIGNED: [TransportJobStatus.IN_TRANSIT],
            TransportJobStatus.IN_TRANSIT: [TransportJobStatus.DELIVERED],
            TransportJobStatus.DELIVERED: [],
        }
        if new_status not in valid_transitions.get(curr, []):
            raise InvalidTransportTransitionError(f"Cannot transition from {curr.value} to {new_status.value}")

        job["status"] = new_status.value
        return job


@pytest.fixture
def transport_env():
    mock_service = MockTransportService()
    mock_service.seed_scenario(
        request_id="req-acc-1",
        match_id="match-1",
        req_id="requirement-1",
        list_id="listing-1",
        pickup_loc="Dahej, Gujarat",
        delivery_loc="Hazira, Surat",
        quantity=200.0,
        request_status="ACCEPTED",
    )
    mock_service.seed_scenario(
        request_id="req-pend-1",
        match_id="match-2",
        req_id="requirement-2",
        list_id="listing-2",
        pickup_loc="Dahej, Gujarat",
        delivery_loc="Hazira, Surat",
        quantity=150.0,
        request_status="PENDING",
    )

    app.dependency_overrides[get_transport_service] = lambda: mock_service
    client = TestClient(app)

    yield {
        "client": client,
        "service": mock_service,
    }

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# TEST 9.1 — CREATE JOB FROM ACCEPTED REQUEST
# ---------------------------------------------------------------------------
def test_9_1_create_job_from_accepted_request(transport_env):
    """Verify creating transport job from ACCEPTED request succeeds."""
    client = transport_env["client"]
    app.dependency_overrides[get_current_user] = lambda: buyer_user

    res = client.post("/api/transport/jobs", json={"request_id": "req-acc-1"})
    assert res.status_code == 201
    data = res.json()

    assert data["request_id"] == "req-acc-1"
    assert data["pickup_location"] == "Dahej, Gujarat"
    assert data["delivery_location"] == "Hazira, Surat"
    assert data["distance_km"] > 0
    assert data["estimated_cost"] > 0
    assert data["status"] == "PENDING"


# ---------------------------------------------------------------------------
# TEST 9.2 — CREATE JOB FROM PENDING REQUEST
# ---------------------------------------------------------------------------
def test_9_2_create_job_from_pending_request_rejected(transport_env):
    """Verify creating transport job from PENDING request is rejected with 400."""
    client = transport_env["client"]
    app.dependency_overrides[get_current_user] = lambda: buyer_user

    res = client.post("/api/transport/jobs", json={"request_id": "req-pend-1"})
    assert res.status_code == 400
    assert "must be accepted" in res.json()["detail"].lower()


# ---------------------------------------------------------------------------
# TEST 9.3 — PICKUP LOCATION
# ---------------------------------------------------------------------------
def test_9_3_pickup_location_from_listing(transport_env):
    """Verify pickup_location comes from the supplier/listing context."""
    client = transport_env["client"]
    app.dependency_overrides[get_current_user] = lambda: buyer_user

    res = client.post("/api/transport/jobs", json={"request_id": "req-acc-1"})
    assert res.status_code == 201
    assert res.json()["pickup_location"] == "Dahej, Gujarat"


# ---------------------------------------------------------------------------
# TEST 9.4 — DELIVERY LOCATION
# ---------------------------------------------------------------------------
def test_9_4_delivery_location_from_requirement(transport_env):
    """Verify delivery_location comes from the buyer requirement/request context."""
    client = transport_env["client"]
    app.dependency_overrides[get_current_user] = lambda: buyer_user

    res = client.post("/api/transport/jobs", json={"request_id": "req-acc-1"})
    assert res.status_code == 201
    assert res.json()["delivery_location"] == "Hazira, Surat"


# ---------------------------------------------------------------------------
# TEST 9.5 — DISTANCE
# ---------------------------------------------------------------------------
def test_9_5_distance_from_logistics_service(transport_env):
    """Verify distance_km matches logistics service calculation."""
    client = transport_env["client"]
    app.dependency_overrides[get_current_user] = lambda: buyer_user

    res = client.post("/api/transport/jobs", json={"request_id": "req-acc-1"})
    dist = res.json()["distance_km"]

    expected_dist, _ = DistanceEstimator().estimate_distance("Dahej, Gujarat", "Hazira, Surat")
    assert dist == expected_dist


# ---------------------------------------------------------------------------
# TEST 9.6 — COST
# ---------------------------------------------------------------------------
def test_9_6_cost_matches_logistics_formula(transport_env):
    """Verify estimated_cost matches logistics transport cost calculation."""
    client = transport_env["client"]
    app.dependency_overrides[get_current_user] = lambda: buyer_user

    res = client.post("/api/transport/jobs", json={"request_id": "req-acc-1"})
    cost = res.json()["estimated_cost"]
    dist = res.json()["distance_km"]

    expected_cost, _ = LogisticsService.calculate_transport_cost(dist, 200.0)
    assert cost == expected_cost


# ---------------------------------------------------------------------------
# TEST 9.7 — TRANSPORTER ASSIGNMENT
# ---------------------------------------------------------------------------
def test_9_7_transporter_assignment(transport_env):
    """Verify authenticated user with role TRANSPORTER can assign themselves to the job."""
    client = transport_env["client"]
    service = transport_env["service"]

    job = service.create_transport_job(TransportJobCreate(request_id="req-acc-1"))
    job_id = job["id"]

    app.dependency_overrides[require_transporter] = lambda: transporter_user_a
    res = client.patch(f"/api/transport/jobs/{job_id}/assign")
    assert res.status_code == 200
    data = res.json()
    assert data["transporter_id"] == TRANSPORTER_A_ID
    assert data["status"] == "ASSIGNED"


# ---------------------------------------------------------------------------
# TEST 9.8 — UNAUTHORIZED TRANSPORTER
# ---------------------------------------------------------------------------
def test_9_8_unauthorized_transporter_access(transport_env):
    """Transporter B cannot view or manipulate Transporter A's assigned job."""
    client = transport_env["client"]
    service = transport_env["service"]

    job = service.create_transport_job(TransportJobCreate(request_id="req-acc-1", transporter_id=TRANSPORTER_A_ID))
    job_id = job["id"]

    # Transporter B attempts to view private job
    app.dependency_overrides[get_current_user] = lambda: transporter_user_b
    res = client.get(f"/api/transport/jobs/{job_id}")
    assert res.status_code == 403

    # Transporter B attempts to update status on Transporter A's job
    app.dependency_overrides[require_transporter] = lambda: transporter_user_b
    res = client.patch(f"/api/transport/jobs/{job_id}/status", json={"status": "IN_TRANSIT"})
    assert res.status_code == 403


# ---------------------------------------------------------------------------
# TEST 9.9 — STATUS LIFECYCLE
# ---------------------------------------------------------------------------
def test_9_9_status_lifecycle_progression(transport_env):
    """Verify sequential lifecycle: ASSIGNED -> IN_TRANSIT -> DELIVERED."""
    client = transport_env["client"]
    service = transport_env["service"]

    job = service.create_transport_job(TransportJobCreate(request_id="req-acc-1", transporter_id=TRANSPORTER_A_ID))
    job_id = job["id"]

    app.dependency_overrides[require_transporter] = lambda: transporter_user_a

    # ASSIGNED -> IN_TRANSIT
    res1 = client.patch(f"/api/transport/jobs/{job_id}/status", json={"status": "IN_TRANSIT"})
    assert res1.status_code == 200
    assert res1.json()["status"] == "IN_TRANSIT"

    # IN_TRANSIT -> DELIVERED
    res2 = client.patch(f"/api/transport/jobs/{job_id}/status", json={"status": "DELIVERED"})
    assert res2.status_code == 200
    assert res2.json()["status"] == "DELIVERED"


# ---------------------------------------------------------------------------
# TEST 9.10 — INVALID STATUS TRANSITION
# ---------------------------------------------------------------------------
def test_9_10_invalid_status_transition_rejected(transport_env):
    """Verify invalid transition DELIVERED -> PENDING is rejected and state unchanged."""
    client = transport_env["client"]
    service = transport_env["service"]

    job = service.create_transport_job(TransportJobCreate(request_id="req-acc-1", transporter_id=TRANSPORTER_A_ID))
    job_id = job["id"]

    app.dependency_overrides[require_transporter] = lambda: transporter_user_a

    # Advance to DELIVERED
    client.patch(f"/api/transport/jobs/{job_id}/status", json={"status": "IN_TRANSIT"})
    client.patch(f"/api/transport/jobs/{job_id}/status", json={"status": "DELIVERED"})

    # Attempt illegal transition DELIVERED -> PENDING
    res = client.patch(f"/api/transport/jobs/{job_id}/status", json={"status": "PENDING"})
    assert res.status_code == 400

    # Verify state remains DELIVERED
    app.dependency_overrides[get_current_user] = lambda: transporter_user_a
    check = client.get(f"/api/transport/jobs/{job_id}")
    assert check.json()["status"] == "DELIVERED"
