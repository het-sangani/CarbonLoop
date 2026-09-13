import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import (
    get_auth_service,
    get_listing_service,
    get_requirement_service,
    get_matching_service,
    get_request_service,
    get_transport_service,
)
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole
from app.schemas.listing import ListingCreate, ListingResponse
from app.schemas.requirement import RequirementCreate, RequirementResponse
from app.schemas.request import RequestCreate, RequestStatus
from app.schemas.transport import TransportJobCreate, TransportJobStatus
from app.services.logistics import DistanceEstimator, LogisticsService

# ---------------------------------------------------------------------------
# In-Memory Unified State Double for Complete End-to-End Workflow Verification
# ---------------------------------------------------------------------------

SELLER_TOKEN = "jwt-seller-token"
BUYER_TOKEN = "jwt-buyer-token"
TRANSPORTER_TOKEN = "jwt-transporter-token"

SELLER_ID = "seller-e2e-001"
BUYER_ID = "buyer-e2e-002"
TRANSPORTER_ID = "transporter-e2e-003"


class MockE2EAuthService:
    def __init__(self):
        self.users = {
            SELLER_TOKEN: AuthenticatedUser(
                id=SELLER_ID,
                email="emitter@industrial-capture.com",
                profile=ProfileResponse(
                    id=SELLER_ID,
                    full_name="Gujarat CO2 Capture Terminal",
                    organization="Adani / Reliance Capture Hub",
                    role=UserRole.SELLER,
                ),
                role=UserRole.SELLER,
            ),
            BUYER_TOKEN: AuthenticatedUser(
                id=BUYER_ID,
                email="utilizer@clean-chemicals.com",
                profile=ProfileResponse(
                    id=BUYER_ID,
                    full_name="Surat Green Chemicals Ltd",
                    organization="Surat Chemicals Consortium",
                    role=UserRole.BUYER,
                ),
                role=UserRole.BUYER,
            ),
            TRANSPORTER_TOKEN: AuthenticatedUser(
                id=TRANSPORTER_ID,
                email="carrier@cryo-logistics.com",
                profile=ProfileResponse(
                    id=TRANSPORTER_ID,
                    full_name="Nordic Cryo Fleet Ltd",
                    organization="CryoTrans India Logistics",
                    role=UserRole.TRANSPORTER,
                ),
                role=UserRole.TRANSPORTER,
            ),
        }

    def get_authenticated_user(self, token: str) -> Optional[AuthenticatedUser]:
        return self.users.get(token)


class MockE2EState:
    def __init__(self):
        self.listings: Dict[str, Dict[str, Any]] = {}
        self.requirements: Dict[str, Dict[str, Any]] = {}
        self.matches: Dict[str, Dict[str, Any]] = {}
        self.requests: Dict[str, Dict[str, Any]] = {}
        self.transport_jobs: Dict[str, Dict[str, Any]] = {}
        self.distance_estimator = DistanceEstimator()
        self.logistics_service = LogisticsService(distance_estimator=self.distance_estimator)


@pytest.fixture
def e2e_env():
    auth_service = MockE2EAuthService()
    state = MockE2EState()

    # Listing Service Double
    class E2EListingService:
        def create_listing(self, listing_in: ListingCreate, seller_id: Optional[str] = None):
            lid = str(uuid.uuid4())
            record = {
                "id": lid,
                "seller_id": seller_id or SELLER_ID,
                "quantity": float(listing_in.quantity),
                "purity": float(listing_in.purity),
                "location": listing_in.location,
                "availability_start": listing_in.availability_start.isoformat(),
                "availability_end": listing_in.availability_end.isoformat(),
                "asking_price": float(listing_in.asking_price),
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            state.listings[lid] = record
            return record

        def get_listing_by_id(self, lid: str):
            return state.listings.get(lid)

        def get_listings(self, **kwargs):
            return list(state.listings.values())

    # Requirement Service Double
    class E2ERequirementService:
        def create_requirement(self, req_in: RequirementCreate, buyer_id: Optional[str] = None):
            rid = str(uuid.uuid4())
            record = {
                "id": rid,
                "buyer_id": buyer_id or BUYER_ID,
                "required_quantity": float(req_in.required_quantity),
                "min_purity": float(req_in.min_purity),
                "delivery_location": req_in.delivery_location,
                "required_date": req_in.required_date.isoformat() if req_in.required_date else None,
                "max_budget": float(req_in.max_budget) if req_in.max_budget else None,
                "status": "OPEN",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            state.requirements[rid] = record
            return record

        def get_requirement_by_id(self, rid: str):
            return state.requirements.get(rid)

        def get_requirements(self, **kwargs):
            return list(state.requirements.values())

    # Matching Service Double
    class E2EMatchingService:
        def find_matches(self, requirement_id: str, persist: bool = True):
            req = state.requirements.get(requirement_id)
            if not req:
                return []

            results = []
            for lid, listing in state.listings.items():
                if listing.get("status") != "active":
                    continue
                if float(listing["purity"]) < float(req["min_purity"]):
                    continue

                mid = str(uuid.uuid4())
                dist, is_fallback = state.distance_estimator.estimate_distance(
                    listing["location"], req["delivery_location"]
                )
                logistics_res = state.logistics_service.estimate_logistics(
                    pickup_location=listing["location"],
                    delivery_location=req["delivery_location"],
                    quantity_tonnes=min(float(req["required_quantity"]), float(listing["quantity"])),
                    price_per_tonne=float(listing["asking_price"]),
                )

                match_rec = {
                    "id": mid,
                    "listing_id": lid,
                    "requirement_id": requirement_id,
                    "listing": listing,
                    "match_score": 91.5,
                    "purity_score": 98.0,
                    "quantity_score": 90.0,
                    "location_score": 88.0,
                    "availability_score": 95.0,
                    "price_score": 90.0,
                    "distance_km": dist,
                    "explanation": f"Excellent chemical assay ({listing['purity']}%) and close transit corridor ({dist} km).",
                    "logistics": logistics_res,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                state.matches[mid] = match_rec
                results.append(match_rec)

            return results

    # Request Service Double
    class E2ERequestService:
        def create_request(self, request_in: RequestCreate, buyer_id: str):
            from app.services.request_service import MatchNotFoundError, UnauthorizedRequestActionError
            match = state.matches.get(request_in.match_id)
            if not match:
                raise MatchNotFoundError(f"Match '{request_in.match_id}' not found")

            req = state.requirements.get(match["requirement_id"])
            if not req or req["buyer_id"] != buyer_id:
                raise UnauthorizedRequestActionError("Buyer does not own this requirement")

            listing = state.listings.get(match["listing_id"])
            resolved_seller = listing["seller_id"]

            rid = str(uuid.uuid4())
            record = {
                "id": rid,
                "match_id": request_in.match_id,
                "buyer_id": buyer_id,
                "seller_id": resolved_seller,
                "quantity": float(request_in.quantity),
                "offered_price": float(request_in.offered_price),
                "status": "PENDING",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            state.requests[rid] = record
            return record

        def get_requests(self, buyer_id=None, seller_id=None, status=None):
            res = list(state.requests.values())
            if buyer_id:
                res = [r for r in res if r["buyer_id"] == buyer_id]
            if seller_id:
                res = [r for r in res if r["seller_id"] == seller_id]
            if status:
                res = [r for r in res if r["status"] == status]
            return res

        def get_request_by_id(self, request_id: str):
            return state.requests.get(request_id)

        def update_request_status(self, request_id: str, new_status, seller_id: str):
            from app.services.request_service import RequestNotFoundError, UnauthorizedRequestActionError
            req = state.requests.get(request_id)
            if not req:
                raise RequestNotFoundError("Request not found")
            if req["seller_id"] != seller_id:
                raise UnauthorizedRequestActionError("Only recipient seller can update status")
            req["status"] = new_status.value if hasattr(new_status, "value") else str(new_status)
            return req

    # Transport Service Double
    class E2ETransportService:
        def create_transport_job(self, job_in: TransportJobCreate, creator_id=None):
            from app.services.transport_service import TransportJobNotFoundError, InvalidTransportJobStateError
            req = state.requests.get(job_in.request_id)
            if not req:
                raise TransportJobNotFoundError("Request not found")
            if req["status"] != "ACCEPTED":
                raise InvalidTransportJobStateError("Request must be ACCEPTED to create transport job")

            match = state.matches.get(req["match_id"], {})
            listing = state.listings.get(match.get("listing_id"), {})
            requirement = state.requirements.get(match.get("requirement_id"), {})

            pickup = listing.get("location", "Dahej, Gujarat")
            delivery = requirement.get("delivery_location", "Hazira, Gujarat")
            dist, _ = state.distance_estimator.estimate_distance(pickup, delivery)
            cost, _ = state.logistics_service.calculate_transport_cost(dist, float(req["quantity"]))

            jid = str(uuid.uuid4())
            record = {
                "id": jid,
                "request_id": job_in.request_id,
                "transporter_id": job_in.transporter_id,
                "pickup_location": pickup,
                "delivery_location": delivery,
                "distance_km": float(dist),
                "estimated_cost": float(cost),
                "status": "ASSIGNED" if job_in.transporter_id else "PENDING",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            state.transport_jobs[jid] = record
            return record

        def get_transport_jobs(self, transporter_id=None, status=None):
            res = list(state.transport_jobs.values())
            if transporter_id:
                res = [j for j in res if j["transporter_id"] == transporter_id or j["transporter_id"] is None]
            if status:
                res = [j for j in res if j["status"] == status]
            return res

        def get_transport_job_by_id(self, job_id: str):
            return state.transport_jobs.get(job_id)

        def assign_transporter(self, job_id: str, transporter_id: str):
            job = state.transport_jobs.get(job_id)
            job["transporter_id"] = transporter_id
            job["status"] = "ASSIGNED"
            return job

        def update_job_status(self, job_id: str, new_status, transporter_id: str):
            from app.services.transport_service import UnauthorizedTransportActionError, InvalidTransportTransitionError
            job = state.transport_jobs.get(job_id)
            if job["transporter_id"] != transporter_id:
                raise UnauthorizedTransportActionError("Not assigned carrier")
            curr = job["status"]
            if curr == "DELIVERED":
                raise InvalidTransportTransitionError("Cannot advance terminal DELIVERED status")
            job["status"] = new_status.value if hasattr(new_status, "value") else str(new_status)
            return job

    # Override dependencies
    app.dependency_overrides[get_auth_service] = lambda: auth_service
    app.dependency_overrides[get_listing_service] = lambda: E2EListingService()
    app.dependency_overrides[get_requirement_service] = lambda: E2ERequirementService()
    app.dependency_overrides[get_matching_service] = lambda: E2EMatchingService()
    app.dependency_overrides[get_request_service] = lambda: E2ERequestService()
    app.dependency_overrides[get_transport_service] = lambda: E2ETransportService()

    client = TestClient(app)

    yield {
        "client": client,
        "state": state,
    }

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Complete End-to-End Workflow Integration Test
# ---------------------------------------------------------------------------

def test_full_carbonloop_backend_lifecycle(e2e_env):
    """
    Verifies the entire unified marketplace pipeline:
    1. Auth & Profile
    2. Seller creates CO2 Listing
    3. Buyer creates CO2 Requirement
    4. Matchmaking Engine ranks Listing against Requirement
    5. Logistics & Cost estimation generated and attached
    6. Buyer creates Supply Request from Match
    7. Seller views and accepts Request
    8. Transport Job created from accepted Request
    9. Transporter assigns herself to Job
    10. Transporter advances Job lifecycle to IN_TRANSIT and DELIVERED
    11. Security checks at every boundary
    """
    client = e2e_env["client"]

    seller_headers = {"Authorization": f"Bearer {SELLER_TOKEN}"}
    buyer_headers = {"Authorization": f"Bearer {BUYER_TOKEN}"}
    transporter_headers = {"Authorization": f"Bearer {TRANSPORTER_TOKEN}"}

    # 1. AUTHENTICATION & PROFILE VERIFICATION
    # Verify unauthenticated request to protected endpoints is rejected
    unauth_res = client.post("/api/listings", json={})
    assert unauth_res.status_code == 401

    # 2. SELLER CREATES CO2 LISTING
    listing_payload = {
        "purity": 98.8,
        "quantity": 500.0,
        "location": "Dahej, Gujarat",
        "availability_start": "2026-10-01T00:00:00Z",
        "availability_end": "2026-12-31T23:59:59Z",
        "asking_price": 45.0,
        "status": "active",
    }
    res_listing = client.post("/api/listings", json=listing_payload, headers=seller_headers)
    assert res_listing.status_code == 201
    listing_data = res_listing.json()
    listing_id = listing_data["id"]
    assert listing_data["seller_id"] == SELLER_ID
    assert listing_data["purity"] == 98.8
    assert listing_data["status"] == "active"

    # Verify a buyer cannot create a listing (Role check)
    res_forbidden_listing = client.post("/api/listings", json=listing_payload, headers=buyer_headers)
    assert res_forbidden_listing.status_code == 403

    # 3. BUYER CREATES REQUIREMENT
    requirement_payload = {
        "min_purity": 95.0,
        "required_quantity": 200.0,
        "delivery_location": "Hazira, Surat",
        "required_date": "2026-11-15T00:00:00Z",
        "max_budget": 50.0,
    }
    res_req = client.post("/api/requirements", json=requirement_payload, headers=buyer_headers)
    assert res_req.status_code == 201
    req_data = res_req.json()
    requirement_id = req_data["id"]
    assert req_data["buyer_id"] == BUYER_ID
    assert req_data["required_quantity"] == 200.0
    assert req_data["status"] == "OPEN"

    # Verify a seller cannot create a requirement (Role check)
    res_forbidden_req = client.post("/api/requirements", json=requirement_payload, headers=seller_headers)
    assert res_forbidden_req.status_code == 403

    # 4 & 5. MATCHMAKING ENGINE & LOGISTICS / COST ESTIMATION
    # Buyer requests matches for their requirement
    res_matches = client.get(f"/api/matches/{requirement_id}", headers=buyer_headers)
    assert res_matches.status_code == 200
    match_list = res_matches.json()
    assert match_list["total_matches"] >= 1

    matched_item = match_list["matches"][0]
    match_id = matched_item["id"]
    assert matched_item["listing_id"] == listing_id
    assert matched_item["match_score"] > 80.0

    # Verify embedded logistics estimation
    logistics = matched_item["logistics"]
    assert logistics is not None
    assert logistics["distance_km"] > 0
    assert logistics["trips_required"] == 8  # 200 tonnes / 25 tonnes
    assert logistics["co2_purchase_cost"] == 9000.0  # 200t * $45/t
    assert logistics["transport_estimated_cost"] > 0
    assert logistics["total_estimated_cost"] == round(9000.0 + logistics["transport_estimated_cost"], 2)
    assert logistics["transit_emissions_kg"] > 0
    assert "prototype estimate" in logistics["disclaimer"].lower()

    # Verify Seller cannot read Buyer's matches
    res_matches_unauth = client.get(f"/api/matches/{requirement_id}", headers=seller_headers)
    assert res_matches_unauth.status_code == 403

    # 6. BUYER CREATES SUPPLY REQUEST (BID)
    request_payload = {
        "match_id": match_id,
        "quantity": 200.0,
        "offered_price": 42.0,
    }
    res_create_req = client.post("/api/requests", json=request_payload, headers=buyer_headers)
    assert res_create_req.status_code == 201
    req_body = res_create_req.json()
    request_id = req_body["id"]
    assert req_body["buyer_id"] == BUYER_ID
    assert req_body["seller_id"] == SELLER_ID
    assert req_body["quantity"] == 200.0
    assert req_body["offered_price"] == 42.0
    assert req_body["status"] == "PENDING"

    # Verify Transporter cannot create requests
    res_transporter_req = client.post("/api/requests", json=request_payload, headers=transporter_headers)
    assert res_transporter_req.status_code == 403

    # 7. SELLER VIEWS & ACCEPTS REQUEST
    # Seller lists incoming requests
    res_seller_requests = client.get("/api/requests", headers=seller_headers)
    assert res_seller_requests.status_code == 200
    seller_reqs = res_seller_requests.json()
    assert len(seller_reqs) == 1
    assert seller_reqs[0]["id"] == request_id

    # Seller accepts the request
    res_accept = client.patch(
        f"/api/requests/{request_id}/status",
        json={"status": "ACCEPTED"},
        headers=seller_headers,
    )
    assert res_accept.status_code == 200
    assert res_accept.json()["status"] == "ACCEPTED"

    # Verify Buyer cannot accept their own request
    res_buyer_accept = client.patch(
        f"/api/requests/{request_id}/status",
        json={"status": "ACCEPTED"},
        headers=buyer_headers,
    )
    assert res_buyer_accept.status_code == 403

    # 8. TRANSPORT JOB CREATION
    # Create transport job from the ACCEPTED request
    res_job = client.post(
        "/api/transport/jobs",
        json={"request_id": request_id},
        headers=buyer_headers,
    )
    assert res_job.status_code == 201
    job_body = res_job.json()
    job_id = job_body["id"]
    assert job_body["request_id"] == request_id
    assert job_body["pickup_location"] == "Dahej, Gujarat"
    assert job_body["delivery_location"] == "Hazira, Surat"
    assert job_body["distance_km"] > 0
    assert job_body["estimated_cost"] > 0
    assert job_body["status"] == "PENDING"
    assert job_body["transporter_id"] is None

    # 9. TRANSPORTER ASSIGNMENT
    # Transporter claims / assigns herself to the job
    res_assign = client.patch(
        f"/api/transport/jobs/{job_id}/assign",
        headers=transporter_headers,
    )
    assert res_assign.status_code == 200
    assigned_job = res_assign.json()
    assert assigned_job["transporter_id"] == TRANSPORTER_ID
    assert assigned_job["status"] == "ASSIGNED"

    # 10. TRANSPORT LIFECYCLE PROGRESSION
    # Advance to IN_TRANSIT
    res_in_transit = client.patch(
        f"/api/transport/jobs/{job_id}/status",
        json={"status": "IN_TRANSIT"},
        headers=transporter_headers,
    )
    assert res_in_transit.status_code == 200
    assert res_in_transit.json()["status"] == "IN_TRANSIT"

    # Advance to DELIVERED
    res_delivered = client.patch(
        f"/api/transport/jobs/{job_id}/status",
        json={"status": "DELIVERED"},
        headers=transporter_headers,
    )
    assert res_delivered.status_code == 200
    assert res_delivered.json()["status"] == "DELIVERED"

    # 11. TERMINAL STATE GUARD
    # Cannot regress backwards from DELIVERED to PENDING
    res_illegal_regress = client.patch(
        f"/api/transport/jobs/{job_id}/status",
        json={"status": "PENDING"},
        headers=transporter_headers,
    )
    assert res_illegal_regress.status_code == 400
