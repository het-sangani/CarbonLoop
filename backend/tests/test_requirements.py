import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import get_requirement_service, require_buyer
from app.schemas.requirement import RequirementCreate, RequirementUpdate
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole
from app.services.requirement_service import RequirementService

DEFAULT_BUYER_ID = "buyer-uuid-5678"
mock_buyer_user = AuthenticatedUser(
    id=DEFAULT_BUYER_ID,
    email="buyer@example.com",
    profile=ProfileResponse(id=DEFAULT_BUYER_ID, role=UserRole.BUYER),
    role=UserRole.BUYER,
)


class MockRequirementService:
    """
    In-memory test double for RequirementService to enable fast, deterministic,
    and isolated testing of API routes and validation without external dependencies.
    """

    def __init__(self):
        self.requirements: Dict[str, Dict[str, Any]] = {}

    def create_requirement(
        self, requirement_in: RequirementCreate, buyer_id: Optional[str] = None
    ) -> Dict[str, Any]:
        req_id = str(uuid.uuid4())
        effective_buyer_id = buyer_id if buyer_id is not None else requirement_in.buyer_id

        record = {
            "id": req_id,
            "buyer_id": effective_buyer_id,
            "required_quantity": requirement_in.required_quantity,
            "min_purity": requirement_in.min_purity,
            "delivery_location": requirement_in.delivery_location,
            "required_date": (
                requirement_in.required_date.isoformat()
                if requirement_in.required_date
                else None
            ),
            "max_budget": requirement_in.max_budget,
            "status": requirement_in.status,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.requirements[req_id] = record
        return record

    def get_requirements(
        self,
        status: Optional[str] = None,
        min_purity: Optional[float] = None,
        buyer_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        results = list(self.requirements.values())
        if status:
            results = [r for r in results if r.get("status") == status.lower()]
        if min_purity is not None:
            results = [r for r in results if r.get("min_purity", 0) >= min_purity]
        if buyer_id:
            results = [r for r in results if r.get("buyer_id") == buyer_id]
        return results[offset : offset + limit]

    def get_requirement_by_id(self, requirement_id: str) -> Optional[Dict[str, Any]]:
        return self.requirements.get(requirement_id)

    def update_requirement(
        self, requirement_id: str, requirement_update: RequirementUpdate
    ) -> Optional[Dict[str, Any]]:
        if requirement_id not in self.requirements:
            return None
        record = self.requirements[requirement_id]
        payload = requirement_update.model_dump(exclude_unset=True)
        for k, v in payload.items():
            if isinstance(v, datetime):
                record[k] = v.isoformat()
            else:
                record[k] = v
        return record

    def delete_requirement(self, requirement_id: str) -> bool:
        if requirement_id in self.requirements:
            del self.requirements[requirement_id]
            return True
        return False


@pytest.fixture
def mock_service():
    service = MockRequirementService()
    app.dependency_overrides[get_requirement_service] = lambda: service
    app.dependency_overrides[require_buyer] = lambda: mock_buyer_user
    yield service
    app.dependency_overrides.clear()


@pytest.fixture
def client(mock_service):
    return TestClient(app)


# ---------------------------------------------------------------------------
# 1. Valid Requirement Creation
# ---------------------------------------------------------------------------

def test_valid_requirement_creation(client):
    """
    Test creating a valid buyer requirement returns 201 Created with correct schema.
    """
    payload = {
        "required_quantity": 1000.0,
        "min_purity": 95.0,
        "delivery_location": "Dahej PCPIR, Gujarat",
        "required_date": "2026-11-15T00:00:00Z",
        "max_budget": 55.0,
        "status": "open",
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["required_quantity"] == 1000.0
    assert data["min_purity"] == 95.0
    assert data["delivery_location"] == "Dahej PCPIR, Gujarat"
    assert data["max_budget"] == 55.0
    assert data["status"] == "open"
    assert data["buyer_id"] == DEFAULT_BUYER_ID


def test_valid_requirement_creation_with_buyer_header(client):
    """
    Test creating a requirement with isolated X-Buyer-ID header sets buyer_id correctly.
    """
    payload = {
        "required_quantity": 2000.0,
        "min_purity": 98.0,
        "delivery_location": "Surat, Gujarat",
        "max_budget": 60.0,
    }
    response = client.post(
        "/api/requirements",
        json=payload,
        headers={"X-Buyer-ID": "buyer-uuid-5678"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["buyer_id"] == "buyer-uuid-5678"
    assert data["required_quantity"] == 2000.0


def test_valid_requirement_creation_defaults(client):
    """
    Test status defaults to 'open' when not provided, and required_date can be None.
    """
    payload = {
        "required_quantity": 500.0,
        "min_purity": 90.0,
        "delivery_location": "Mumbai, Maharashtra",
        "max_budget": 40.0,
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "open"
    assert data["required_date"] is None


# ---------------------------------------------------------------------------
# 2. Invalid Quantity Validation
# ---------------------------------------------------------------------------

def test_create_requirement_invalid_quantity_zero(client):
    """
    Test required_quantity must be strictly greater than 0 (zero should fail).
    """
    payload = {
        "required_quantity": 0.0,
        "min_purity": 95.0,
        "delivery_location": "Vadodara, Gujarat",
        "max_budget": 45.0,
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("required_quantity" in str(err["loc"]) for err in errors)


def test_create_requirement_invalid_quantity_negative(client):
    """
    Test required_quantity must be strictly greater than 0 (negative should fail).
    """
    payload = {
        "required_quantity": -200.0,
        "min_purity": 95.0,
        "delivery_location": "Vadodara, Gujarat",
        "max_budget": 45.0,
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("required_quantity" in str(err["loc"]) for err in errors)


# ---------------------------------------------------------------------------
# 3. Invalid Purity Validation
# ---------------------------------------------------------------------------

def test_create_requirement_invalid_purity_above_100(client):
    """
    Test min_purity cannot exceed 100%.
    """
    payload = {
        "required_quantity": 250.0,
        "min_purity": 100.5,
        "delivery_location": "Ahmedabad, Gujarat",
        "max_budget": 35.0,
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("min_purity" in str(err["loc"]) for err in errors)


def test_create_requirement_invalid_purity_negative(client):
    """
    Test min_purity cannot be negative.
    """
    payload = {
        "required_quantity": 250.0,
        "min_purity": -5.0,
        "delivery_location": "Ahmedabad, Gujarat",
        "max_budget": 35.0,
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("min_purity" in str(err["loc"]) for err in errors)


# ---------------------------------------------------------------------------
# 4. Invalid Budget Validation
# ---------------------------------------------------------------------------

def test_create_requirement_invalid_budget_negative(client):
    """
    Test max_budget must be non-negative (negative should fail).
    """
    payload = {
        "required_quantity": 100.0,
        "min_purity": 92.0,
        "delivery_location": "Pune, Maharashtra",
        "max_budget": -10.0,
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("max_budget" in str(err["loc"]) for err in errors)


def test_create_requirement_valid_budget_zero(client):
    """
    Test max_budget of 0.0 is valid (e.g. free/subsidized intake).
    """
    payload = {
        "required_quantity": 100.0,
        "min_purity": 92.0,
        "delivery_location": "Pune, Maharashtra",
        "max_budget": 0.0,
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 201
    assert response.json()["max_budget"] == 0.0


# ---------------------------------------------------------------------------
# 5. Invalid required_date Validation
# ---------------------------------------------------------------------------

def test_create_requirement_invalid_date_format(client):
    """
    Test required_date must be a valid datetime format.
    """
    payload = {
        "required_quantity": 300.0,
        "min_purity": 96.0,
        "delivery_location": "Chennai, Tamil Nadu",
        "max_budget": 50.0,
        "required_date": "not-a-real-date",
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# 6. Invalid Status Validation
# ---------------------------------------------------------------------------

def test_create_requirement_invalid_status(client):
    """
    Test status must follow allowed conventions.
    """
    payload = {
        "required_quantity": 300.0,
        "min_purity": 96.0,
        "delivery_location": "Chennai, Tamil Nadu",
        "max_budget": 50.0,
        "status": "bogus_status",
    }
    response = client.post("/api/requirements", json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# 7. Retrieving Requirements (GET /api/requirements)
# ---------------------------------------------------------------------------

def test_retrieving_requirements(client):
    """
    Test GET /api/requirements returns list and supports filtering.
    """
    # Create two requirements
    client.post(
        "/api/requirements",
        json={
            "required_quantity": 500.0,
            "min_purity": 94.0,
            "delivery_location": "Site A",
            "max_budget": 40.0,
            "status": "open",
        },
    )
    client.post(
        "/api/requirements",
        json={
            "required_quantity": 1200.0,
            "min_purity": 99.0,
            "delivery_location": "Site B",
            "max_budget": 70.0,
            "status": "evaluating",
        },
    )

    # Retrieve all
    response = client.get("/api/requirements")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) == 2

    # Filter by status
    resp_filtered = client.get("/api/requirements?status=open")
    assert resp_filtered.status_code == 200
    filtered_items = resp_filtered.json()
    assert len(filtered_items) == 1
    assert filtered_items[0]["delivery_location"] == "Site A"

    # Filter by min_purity
    resp_purity = client.get("/api/requirements?min_purity=98.0")
    assert resp_purity.status_code == 200
    purity_items = resp_purity.json()
    assert len(purity_items) == 1
    assert purity_items[0]["delivery_location"] == "Site B"


# ---------------------------------------------------------------------------
# 8. Retrieving a Requirement by ID (GET /api/requirements/{requirement_id})
# ---------------------------------------------------------------------------

def test_retrieving_requirement_by_id(client):
    """
    Test GET /api/requirements/{id} returns the specific requirement, and 404 for missing ID.
    """
    create_res = client.post(
        "/api/requirements",
        json={
            "required_quantity": 750.0,
            "min_purity": 97.0,
            "delivery_location": "Jaipur, Rajasthan",
            "max_budget": 48.0,
        },
    )
    req_id = create_res.json()["id"]

    # Valid ID lookup
    get_res = client.get(f"/api/requirements/{req_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == req_id
    assert data["delivery_location"] == "Jaipur, Rajasthan"
    assert data["required_quantity"] == 750.0

    # Non-existent ID lookup
    missing_res = client.get("/api/requirements/non-existent-uuid-9999")
    assert missing_res.status_code == 404
    assert "not found" in missing_res.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 9. Updating a Requirement (PATCH /api/requirements/{requirement_id})
# ---------------------------------------------------------------------------

def test_update_requirement(client):
    """
    Test PATCH /api/requirements/{id} partially updates fields.
    """
    create_res = client.post(
        "/api/requirements",
        json={
            "required_quantity": 300.0,
            "min_purity": 93.0,
            "delivery_location": "Kolkata, West Bengal",
            "max_budget": 38.0,
        },
    )
    req_id = create_res.json()["id"]

    # Update max_budget and status
    patch_res = client.patch(
        f"/api/requirements/{req_id}",
        json={"max_budget": 42.0, "status": "evaluating"},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["max_budget"] == 42.0
    assert updated["status"] == "evaluating"
    assert updated["required_quantity"] == 300.0  # Unchanged


# ---------------------------------------------------------------------------
# 10. Deleting a Requirement (DELETE /api/requirements/{requirement_id})
# ---------------------------------------------------------------------------

def test_delete_requirement(client):
    """
    Test DELETE /api/requirements/{id} returns 204 No Content and subsequent GET returns 404.
    """
    create_res = client.post(
        "/api/requirements",
        json={
            "required_quantity": 150.0,
            "min_purity": 91.0,
            "delivery_location": "Nagpur, Maharashtra",
            "max_budget": 28.0,
        },
    )
    req_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/requirements/{req_id}")
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = client.get(f"/api/requirements/{req_id}")
    assert get_res.status_code == 404


# ---------------------------------------------------------------------------
# 11. Direct RequirementService Unit Tests (Supabase Client Integration)
# ---------------------------------------------------------------------------

def test_requirement_service_direct_unit_tests():
    """
    Directly unit test RequirementService methods with mocked Supabase client.
    """
    from unittest.mock import MagicMock
    mock_sb = MagicMock()
    service = RequirementService(client=mock_sb)

    # 1. create_requirement
    fake_record = {
        "id": "req-abc-123",
        "required_quantity": 200.0,
        "min_purity": 96.0,
        "delivery_location": "Test Loc",
        "max_budget": 50.0,
        "status": "open",
        "buyer_id": "buyer-001",
    }
    mock_sb.table.return_value.insert.return_value.execute.return_value.data = [fake_record]

    created = service.create_requirement(
        RequirementCreate(
            required_quantity=200.0,
            min_purity=96.0,
            delivery_location="Test Loc",
            max_budget=50.0,
        ),
        buyer_id="buyer-001",
    )
    assert created["id"] == "req-abc-123"
    assert created["buyer_id"] == "buyer-001"
    mock_sb.table.assert_called_with("requirements")

    # 2. get_requirements
    mock_sb.table.return_value.select.return_value.order.return_value.range.return_value.execute.return_value.data = [fake_record]
    reqs = service.get_requirements(limit=10, offset=0)
    assert len(reqs) == 1
    assert reqs[0]["id"] == "req-abc-123"

    # 3. get_requirement_by_id
    mock_sb.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [fake_record]
    one = service.get_requirement_by_id("req-abc-123")
    assert one is not None
    assert one["id"] == "req-abc-123"

    # 4. update_requirement
    updated_record = dict(fake_record)
    updated_record["max_budget"] = 45.0
    mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [updated_record]
    res_update = service.update_requirement("req-abc-123", RequirementUpdate(max_budget=45.0))
    assert res_update["max_budget"] == 45.0

    # 5. delete_requirement
    mock_sb.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [fake_record]
    mock_sb.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = []
    deleted = service.delete_requirement("req-abc-123")
    assert deleted is True


# ---------------------------------------------------------------------------
# 12. Malformed Body & Missing Resource Tests
# ---------------------------------------------------------------------------

def test_create_requirement_malformed_body(client):
    """
    Test sending malformed types (e.g. string for quantity) returns 422 Unprocessable Entity.
    """
    response = client.post(
        "/api/requirements",
        json={
            "required_quantity": "invalid_number",
            "min_purity": 95.0,
            "delivery_location": "Dahej",
            "max_budget": 50.0,
        },
    )
    assert response.status_code == 422


def test_update_nonexistent_requirement_returns_404(client):
    """
    Test updating a nonexistent requirement returns 404 Not Found.
    """
    response = client.patch(
        "/api/requirements/nonexistent-req-uuid",
        json={"max_budget": 60.0},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_nonexistent_requirement_returns_404(client):
    """
    Test deleting a nonexistent requirement returns 404 Not Found.
    """
    response = client.delete("/api/requirements/nonexistent-req-uuid")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
