import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import (
    get_request_service,
    get_current_user,
    require_buyer,
    require_seller,
)
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole
from app.schemas.request import (
    RequestCreate,
    RequestStatus,
    RequestStatusUpdate,
    RequestResponse,
)
from app.services.request_service import (
    RequestService,
    RequestNotFoundError,
    MatchNotFoundError,
    UnauthorizedRequestActionError,
    InvalidRequestDataError,
)

# Test User Fixtures
BUYER_A_ID = "buyer-uuid-aaa"
BUYER_B_ID = "buyer-uuid-bbb"
SELLER_A_ID = "seller-uuid-aaa"
SELLER_B_ID = "seller-uuid-bbb"
TRANSPORTER_ID = "transporter-uuid-ttt"

buyer_user_a = AuthenticatedUser(
    id=BUYER_A_ID,
    email="buyer_a@example.com",
    profile=ProfileResponse(id=BUYER_A_ID, role=UserRole.BUYER),
    role=UserRole.BUYER,
)

buyer_user_b = AuthenticatedUser(
    id=BUYER_B_ID,
    email="buyer_b@example.com",
    profile=ProfileResponse(id=BUYER_B_ID, role=UserRole.BUYER),
    role=UserRole.BUYER,
)

seller_user_a = AuthenticatedUser(
    id=SELLER_A_ID,
    email="seller_a@example.com",
    profile=ProfileResponse(id=SELLER_A_ID, role=UserRole.SELLER),
    role=UserRole.SELLER,
)

seller_user_b = AuthenticatedUser(
    id=SELLER_B_ID,
    email="seller_b@example.com",
    profile=ProfileResponse(id=SELLER_B_ID, role=UserRole.SELLER),
    role=UserRole.SELLER,
)

transporter_user = AuthenticatedUser(
    id=TRANSPORTER_ID,
    email="transporter@example.com",
    profile=ProfileResponse(id=TRANSPORTER_ID, role=UserRole.TRANSPORTER),
    role=UserRole.TRANSPORTER,
)


class MockRequestService:
    """In-memory test double for RequestService."""

    def __init__(self):
        self.matches: Dict[str, Dict[str, Any]] = {}
        self.requirements: Dict[str, Dict[str, Any]] = {}
        self.listings: Dict[str, Dict[str, Any]] = {}
        self.requests: Dict[str, Dict[str, Any]] = {}

    def seed_scenario(
        self,
        match_id: str,
        requirement_id: str,
        listing_id: str,
        buyer_id: str,
        seller_id: str,
    ):
        self.requirements[requirement_id] = {
            "id": requirement_id,
            "buyer_id": buyer_id,
            "required_quantity": 200.0,
            "status": "OPEN",
        }
        self.listings[listing_id] = {
            "id": listing_id,
            "seller_id": seller_id,
            "quantity": 500.0,
            "asking_price": 40.0,
            "status": "active",
        }
        self.matches[match_id] = {
            "id": match_id,
            "requirement_id": requirement_id,
            "listing_id": listing_id,
            "match_score": 92.5,
        }

    def create_request(
        self,
        request_in: RequestCreate,
        buyer_id: str,
    ) -> Dict[str, Any]:
        if request_in.quantity <= 0:
            raise InvalidRequestDataError("Quantity must be > 0")
        if request_in.offered_price < 0:
            raise InvalidRequestDataError("Offered price must be >= 0")

        match_record = self.matches.get(request_in.match_id)
        if not match_record:
            raise MatchNotFoundError(f"Match with ID '{request_in.match_id}' does not exist")

        req = self.requirements.get(match_record["requirement_id"])
        if not req:
            raise InvalidRequestDataError("Requirement not found")
        if str(req.get("buyer_id")) != str(buyer_id):
            raise UnauthorizedRequestActionError(
                "You do not have permission to request supply for a requirement owned by another buyer"
            )

        listing = self.listings.get(match_record["listing_id"])
        if not listing:
            raise InvalidRequestDataError("Listing not found")

        resolved_seller_id = str(listing.get("seller_id"))
        if request_in.seller_id and str(request_in.seller_id) != resolved_seller_id:
            raise InvalidRequestDataError("Provided seller_id does not match listing seller")

        req_id = str(uuid.uuid4())
        record = {
            "id": req_id,
            "match_id": request_in.match_id,
            "buyer_id": buyer_id,
            "seller_id": resolved_seller_id,
            "quantity": float(request_in.quantity),
            "offered_price": float(request_in.offered_price),
            "status": RequestStatus.PENDING.value,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.requests[req_id] = record
        return record

    def get_requests(
        self,
        buyer_id: Optional[str] = None,
        seller_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        results = list(self.requests.values())
        if buyer_id:
            results = [r for r in results if r["buyer_id"] == buyer_id]
        if seller_id:
            results = [r for r in results if r["seller_id"] == seller_id]
        if status:
            results = [r for r in results if r["status"].upper() == status.upper()]
        return results

    def get_request_by_id(self, request_id: str) -> Optional[Dict[str, Any]]:
        return self.requests.get(request_id)

    def update_request_status(
        self,
        request_id: str,
        new_status: RequestStatus,
        seller_id: str,
    ) -> Dict[str, Any]:
        req = self.requests.get(request_id)
        if not req:
            raise RequestNotFoundError(f"Supply request with ID '{request_id}' not found")
        if str(req.get("seller_id")) != str(seller_id):
            raise UnauthorizedRequestActionError(
                "Only the seller to whom this supply request is directed may accept or reject it"
            )

        val = new_status.value if isinstance(new_status, RequestStatus) else str(new_status)
        req["status"] = val
        return req


@pytest.fixture
def req_env():
    mock_service = MockRequestService()
    # Seed default valid scenario
    mock_service.seed_scenario(
        match_id="match-111",
        requirement_id="req-111",
        listing_id="list-111",
        buyer_id=BUYER_A_ID,
        seller_id=SELLER_A_ID,
    )

    app.dependency_overrides[get_request_service] = lambda: mock_service

    client = TestClient(app)

    yield {
        "client": client,
        "service": mock_service,
    }

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# 1. POST /api/requests Tests
# ---------------------------------------------------------------------------

def test_valid_request_creation(req_env):
    """Rule 1 & Rule 2: Authenticated buyer creates request on their matched listing."""
    client = req_env["client"]
    app.dependency_overrides[require_buyer] = lambda: buyer_user_a

    payload = {
        "match_id": "match-111",
        "quantity": 150.0,
        "offered_price": 42.5,
    }
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 201
    data = res.json()

    assert data["match_id"] == "match-111"
    assert data["buyer_id"] == BUYER_A_ID
    assert data["seller_id"] == SELLER_A_ID
    assert data["quantity"] == 150.0
    assert data["offered_price"] == 42.5
    assert data["status"] == "PENDING"
    assert "id" in data


def test_create_request_invalid_quantity(req_env):
    """Rule 5: Quantity must be positive (> 0)."""
    client = req_env["client"]
    app.dependency_overrides[require_buyer] = lambda: buyer_user_a

    # Zero quantity
    res = client.post("/api/requests", json={"match_id": "match-111", "quantity": 0.0, "offered_price": 40.0})
    assert res.status_code == 422

    # Negative quantity
    res = client.post("/api/requests", json={"match_id": "match-111", "quantity": -50.0, "offered_price": 40.0})
    assert res.status_code == 422


def test_create_request_invalid_price(req_env):
    """Rule 6: Offered price must be non-negative (>= 0)."""
    client = req_env["client"]
    app.dependency_overrides[require_buyer] = lambda: buyer_user_a

    res = client.post("/api/requests", json={"match_id": "match-111", "quantity": 100.0, "offered_price": -1.0})
    assert res.status_code == 422


def test_create_request_nonexistent_match(req_env):
    """Rule 4: Buyer cannot create a request for an invalid/nonexistent match."""
    client = req_env["client"]
    app.dependency_overrides[require_buyer] = lambda: buyer_user_a

    res = client.post("/api/requests", json={"match_id": "match-999-does-not-exist", "quantity": 100.0, "offered_price": 40.0})
    assert res.status_code == 404
    assert "not exist" in res.json()["detail"] or "not found" in res.json()["detail"]


def test_create_request_unauthorized_buyer(req_env):
    """Rule 2: Buyer B cannot create a request on Match 111 owned by Buyer A."""
    client = req_env["client"]
    # Authenticate as Buyer B
    app.dependency_overrides[require_buyer] = lambda: buyer_user_b

    res = client.post("/api/requests", json={"match_id": "match-111", "quantity": 100.0, "offered_price": 40.0})
    assert res.status_code == 403
    assert "another buyer" in res.json()["detail"].lower() or "permission" in res.json()["detail"].lower()


def test_create_request_unauthorized_role(req_env):
    """Rule 1: Sellers or unauthenticated users cannot create supply requests."""
    client = req_env["client"]
    app.dependency_overrides[require_buyer] = lambda: (_ for _ in ()).throw(
        pytest.importorskip("fastapi").HTTPException(status_code=403, detail="Forbidden role")
    )

    res = client.post("/api/requests", json={"match_id": "match-111", "quantity": 100.0, "offered_price": 40.0})
    assert res.status_code == 403


# ---------------------------------------------------------------------------
# 2. PATCH /api/requests/{request_id}/status Tests (Accept / Reject)
# ---------------------------------------------------------------------------

def test_seller_accepting_request(req_env):
    """Rule 7: Designated Seller A accepts an incoming request."""
    client = req_env["client"]
    service = req_env["service"]

    # Pre-create request
    created = service.create_request(
        RequestCreate(match_id="match-111", quantity=100.0, offered_price=40.0),
        buyer_id=BUYER_A_ID,
    )
    req_id = created["id"]

    # Authenticate as Seller A
    app.dependency_overrides[require_seller] = lambda: seller_user_a

    res = client.patch(f"/api/requests/{req_id}/status", json={"status": "ACCEPTED"})
    assert res.status_code == 200
    assert res.json()["status"] == "ACCEPTED"


def test_seller_rejecting_request(req_env):
    """Rule 7: Designated Seller A rejects an incoming request."""
    client = req_env["client"]
    service = req_env["service"]

    created = service.create_request(
        RequestCreate(match_id="match-111", quantity=100.0, offered_price=40.0),
        buyer_id=BUYER_A_ID,
    )
    req_id = created["id"]

    app.dependency_overrides[require_seller] = lambda: seller_user_a

    res = client.patch(f"/api/requests/{req_id}/status", json={"status": "REJECTED"})
    assert res.status_code == 200
    assert res.json()["status"] == "REJECTED"


def test_unauthorized_seller_modification(req_env):
    """Rule 10: Seller B cannot accept/reject request directed to Seller A."""
    client = req_env["client"]
    service = req_env["service"]

    created = service.create_request(
        RequestCreate(match_id="match-111", quantity=100.0, offered_price=40.0),
        buyer_id=BUYER_A_ID,
    )
    req_id = created["id"]

    # Authenticate as Seller B
    app.dependency_overrides[require_seller] = lambda: seller_user_b

    res = client.patch(f"/api/requests/{req_id}/status", json={"status": "ACCEPTED"})
    assert res.status_code == 403
    assert "only the seller" in res.json()["detail"].lower() or "permission" in res.json()["detail"].lower()


def test_patch_status_invalid_transition(req_env):
    """Status can only be updated to ACCEPTED or REJECTED."""
    client = req_env["client"]
    service = req_env["service"]

    created = service.create_request(
        RequestCreate(match_id="match-111", quantity=100.0, offered_price=40.0),
        buyer_id=BUYER_A_ID,
    )
    req_id = created["id"]

    app.dependency_overrides[require_seller] = lambda: seller_user_a

    res = client.patch(f"/api/requests/{req_id}/status", json={"status": "PENDING"})
    assert res.status_code == 422


# ---------------------------------------------------------------------------
# 3. Scoped Listing & Retrieval Tests (GET /api/requests & GET /api/requests/{id})
# ---------------------------------------------------------------------------

def test_buyer_views_own_requests(req_env):
    """Rule 8: Buyer views only their own sent requests."""
    client = req_env["client"]
    service = req_env["service"]

    # Seed another match for Buyer B
    service.seed_scenario("match-222", "req-222", "list-111", BUYER_B_ID, SELLER_A_ID)

    # Create request by Buyer A
    service.create_request(RequestCreate(match_id="match-111", quantity=100.0, offered_price=40.0), BUYER_A_ID)
    # Create request by Buyer B
    service.create_request(RequestCreate(match_id="match-222", quantity=200.0, offered_price=45.0), BUYER_B_ID)

    # Query as Buyer A
    app.dependency_overrides[get_current_user] = lambda: buyer_user_a
    res = client.get("/api/requests")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 1
    assert items[0]["buyer_id"] == BUYER_A_ID


def test_seller_views_incoming_requests(req_env):
    """Rule 9: Seller views only requests directed to them."""
    client = req_env["client"]
    service = req_env["service"]

    # Match 111 directed to Seller A
    service.create_request(RequestCreate(match_id="match-111", quantity=100.0, offered_price=40.0), BUYER_A_ID)

    # Seed match directed to Seller B
    service.seed_scenario("match-333", "req-333", "list-333", BUYER_A_ID, SELLER_B_ID)
    service.create_request(RequestCreate(match_id="match-333", quantity=80.0, offered_price=38.0), BUYER_A_ID)

    # Query as Seller A
    app.dependency_overrides[get_current_user] = lambda: seller_user_a
    res = client.get("/api/requests")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 1
    assert items[0]["seller_id"] == SELLER_A_ID


def test_transporter_forbidden_from_requests(req_env):
    """Transporters do not participate in supply requests."""
    client = req_env["client"]
    app.dependency_overrides[get_current_user] = lambda: transporter_user
    res = client.get("/api/requests")
    assert res.status_code == 403


def test_get_request_by_id_permissions(req_env):
    """GET /api/requests/{id} allows buyer and seller owner, forbids third-party."""
    client = req_env["client"]
    service = req_env["service"]

    req = service.create_request(RequestCreate(match_id="match-111", quantity=100.0, offered_price=40.0), BUYER_A_ID)
    req_id = req["id"]

    # Allowed: Buyer A
    app.dependency_overrides[get_current_user] = lambda: buyer_user_a
    res = client.get(f"/api/requests/{req_id}")
    assert res.status_code == 200

    # Allowed: Seller A
    app.dependency_overrides[get_current_user] = lambda: seller_user_a
    res = client.get(f"/api/requests/{req_id}")
    assert res.status_code == 200

    # Forbidden: Buyer B
    app.dependency_overrides[get_current_user] = lambda: buyer_user_b
    res = client.get(f"/api/requests/{req_id}")
    assert res.status_code == 403

    # Forbidden: Seller B
    app.dependency_overrides[get_current_user] = lambda: seller_user_b
    res = client.get(f"/api/requests/{req_id}")
    assert res.status_code == 403


# ---------------------------------------------------------------------------
# 4. Direct RequestService Unit Tests (with Supabase Client Mock)
# ---------------------------------------------------------------------------

def test_request_service_direct_unit():
    """Unit test RequestService methods with mocked Supabase client."""
    mock_client = MagicMock()

    # 1. Mock match lookup
    mock_match_resp = MagicMock()
    mock_match_resp.data = [{
        "id": "match-unit-1",
        "requirement_id": "req-unit-1",
        "listing_id": "list-unit-1",
    }]

    # 2. Mock requirement lookup
    mock_req_resp = MagicMock()
    mock_req_resp.data = [{
        "id": "req-unit-1",
        "buyer_id": "buyer-unit-1",
    }]

    # 3. Mock listing lookup
    mock_list_resp = MagicMock()
    mock_list_resp.data = [{
        "id": "list-unit-1",
        "seller_id": "seller-unit-1",
    }]

    # 4. Mock request insert
    mock_insert_resp = MagicMock()
    mock_insert_resp.data = [{
        "id": "req-inserted-1",
        "match_id": "match-unit-1",
        "buyer_id": "buyer-unit-1",
        "seller_id": "seller-unit-1",
        "quantity": 100.0,
        "offered_price": 50.0,
        "status": "PENDING",
    }]

    def table_router(table_name):
        mock_builder = MagicMock()
        if table_name == "matches":
            mock_builder.select.return_value.eq.return_value.execute.return_value = mock_match_resp
        elif table_name == "requirements":
            mock_builder.select.return_value.eq.return_value.execute.return_value = mock_req_resp
        elif table_name == "co2_listings":
            mock_builder.select.return_value.eq.return_value.execute.return_value = mock_list_resp
        elif table_name == "requests":
            mock_builder.insert.return_value.execute.return_value = mock_insert_resp
            mock_builder.select.return_value.eq.return_value.execute.return_value = mock_insert_resp
            mock_builder.update.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[{**mock_insert_resp.data[0], "status": "ACCEPTED"}]
            )
        return mock_builder

    mock_client.table.side_effect = table_router

    service = RequestService(client=mock_client)

    # Test creation
    created = service.create_request(
        RequestCreate(match_id="match-unit-1", quantity=100.0, offered_price=50.0),
        buyer_id="buyer-unit-1",
    )
    assert created["id"] == "req-inserted-1"
    assert created["status"] == "PENDING"

    # Test create with wrong buyer raises
    with pytest.raises(UnauthorizedRequestActionError):
        service.create_request(
            RequestCreate(match_id="match-unit-1", quantity=100.0, offered_price=50.0),
            buyer_id="wrong-buyer",
        )

    # Test get_request_by_id
    item = service.get_request_by_id("req-inserted-1")
    assert item is not None
    assert item["id"] == "req-inserted-1"

    # Test update status by correct seller
    updated = service.update_request_status("req-inserted-1", RequestStatus.ACCEPTED, seller_id="seller-unit-1")
    assert updated["status"] == "ACCEPTED"

    # Test update status by wrong seller raises
    with pytest.raises(UnauthorizedRequestActionError):
        service.update_request_status("req-inserted-1", RequestStatus.ACCEPTED, seller_id="wrong-seller")
