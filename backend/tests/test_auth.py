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
)
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole
from app.schemas.listing import ListingCreate, ListingUpdate
from app.schemas.requirement import RequirementCreate, RequirementUpdate


class MockAuthService:
    """Mock auth service that verifies tokens against an in-memory dictionary of test users."""

    def __init__(self):
        self.users_by_token: Dict[str, AuthenticatedUser] = {}
        self.profiles_by_id: Dict[str, ProfileResponse] = {}

    def add_user(
        self,
        token: str,
        user_id: str,
        email: str,
        role: UserRole,
        full_name: str = "Test User",
        organization: str = "Test Org",
    ) -> AuthenticatedUser:
        profile = ProfileResponse(
            id=user_id,
            full_name=full_name,
            organization=organization,
            role=role,
            created_at=datetime.now(timezone.utc),
        )
        auth_user = AuthenticatedUser(
            id=user_id,
            email=email,
            profile=profile,
            role=role,
        )
        self.users_by_token[token] = auth_user
        self.profiles_by_id[user_id] = profile
        return auth_user

    def get_authenticated_user(self, token: str) -> Optional[AuthenticatedUser]:
        return self.users_by_token.get(token)

    def get_profile_by_id(self, user_id: str) -> Optional[ProfileResponse]:
        return self.profiles_by_id.get(user_id)


class MockListingService:
    """In-memory store for listings."""

    def __init__(self):
        self.listings: Dict[str, Dict[str, Any]] = {}

    def create_listing(
        self, listing_in: ListingCreate, seller_id: Optional[str] = None
    ) -> Dict[str, Any]:
        listing_id = str(uuid.uuid4())
        record = {
            "id": listing_id,
            "seller_id": seller_id or listing_in.seller_id,
            "quantity": listing_in.quantity,
            "purity": listing_in.purity,
            "location": listing_in.location,
            "availability_start": (
                listing_in.availability_start.isoformat()
                if listing_in.availability_start
                else None
            ),
            "availability_end": (
                listing_in.availability_end.isoformat()
                if listing_in.availability_end
                else None
            ),
            "asking_price": listing_in.asking_price,
            "status": listing_in.status,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.listings[listing_id] = record
        return record

    def get_listings(self, **kwargs) -> List[Dict[str, Any]]:
        return list(self.listings.values())

    def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        return self.listings.get(listing_id)

    def update_listing(
        self, listing_id: str, listing_update: ListingUpdate
    ) -> Optional[Dict[str, Any]]:
        if listing_id not in self.listings:
            return None
        record = self.listings[listing_id]
        update_data = listing_update.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            if hasattr(v, "isoformat"):
                v = v.isoformat()
            record[k] = v
        return record

    def delete_listing(self, listing_id: str) -> bool:
        if listing_id in self.listings:
            del self.listings[listing_id]
            return True
        return False


class MockRequirementService:
    """In-memory store for requirements."""

    def __init__(self):
        self.requirements: Dict[str, Dict[str, Any]] = {}

    def create_requirement(
        self, requirement_in: RequirementCreate, buyer_id: Optional[str] = None
    ) -> Dict[str, Any]:
        req_id = str(uuid.uuid4())
        record = {
            "id": req_id,
            "buyer_id": buyer_id or requirement_in.buyer_id,
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

    def get_requirements(self, **kwargs) -> List[Dict[str, Any]]:
        return list(self.requirements.values())

    def get_requirement_by_id(self, requirement_id: str) -> Optional[Dict[str, Any]]:
        return self.requirements.get(requirement_id)

    def update_requirement(
        self, requirement_id: str, requirement_update: RequirementUpdate
    ) -> Optional[Dict[str, Any]]:
        if requirement_id not in self.requirements:
            return None
        record = self.requirements[requirement_id]
        update_data = requirement_update.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            if hasattr(v, "isoformat"):
                v = v.isoformat()
            record[k] = v
        return record

    def delete_requirement(self, requirement_id: str) -> bool:
        if requirement_id in self.requirements:
            del self.requirements[requirement_id]
            return True
        return False


@pytest.fixture
def auth_fixture():
    mock_auth = MockAuthService()
    mock_listings = MockListingService()
    mock_requirements = MockRequirementService()

    # Pre-populate test personas
    mock_auth.add_user("seller-1-token", "seller-1-uuid", "seller1@carbonloop.io", UserRole.SELLER, "Seller One", "Capture Corp")
    mock_auth.add_user("seller-2-token", "seller-2-uuid", "seller2@carbonloop.io", UserRole.SELLER, "Seller Two", "EcoCapture Ltd")
    mock_auth.add_user("buyer-1-token", "buyer-1-uuid", "buyer1@carbonloop.io", UserRole.BUYER, "Buyer One", "SynFuel Industries")
    mock_auth.add_user("buyer-2-token", "buyer-2-uuid", "buyer2@carbonloop.io", UserRole.BUYER, "Buyer Two", "Concrete Works")
    mock_auth.add_user("transporter-token", "trans-uuid", "trans@carbonloop.io", UserRole.TRANSPORTER, "Transporter One", "Green Logistics")
    mock_auth.add_user("gov-token", "gov-uuid", "gov@carbonloop.io", UserRole.GOVERNMENT_AGENT, "Gov Inspector", "EPA Office")

    app.dependency_overrides[get_auth_service] = lambda: mock_auth
    app.dependency_overrides[get_listing_service] = lambda: mock_listings
    app.dependency_overrides[get_requirement_service] = lambda: mock_requirements

    client = TestClient(app)

    yield {
        "client": client,
        "auth": mock_auth,
        "listings": mock_listings,
        "requirements": mock_requirements,
    }

    app.dependency_overrides.clear()


# ===========================================================================
# 1. Unauthenticated Requests
# ===========================================================================

def test_unauthenticated_me_endpoint(auth_fixture):
    client = auth_fixture["client"]
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    assert "detail" in res.json()


def test_unauthenticated_listing_creation(auth_fixture):
    client = auth_fixture["client"]
    res = client.post("/api/listings", json={
        "quantity": 100.0,
        "purity": 95.0,
        "location": "Ahmedabad",
        "asking_price": 50.0,
    })
    assert res.status_code == 401


def test_unauthenticated_requirement_creation(auth_fixture):
    client = auth_fixture["client"]
    res = client.post("/api/requirements", json={
        "required_quantity": 200.0,
        "min_purity": 90.0,
        "delivery_location": "Surat",
        "max_budget": 60.0,
    })
    assert res.status_code == 401


def test_invalid_token_returns_401(auth_fixture):
    client = auth_fixture["client"]
    res = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-garbage-token"}
    )
    assert res.status_code == 401
    assert "Invalid" in res.json()["detail"] or "authentication" in res.json()["detail"].lower()


# ===========================================================================
# 2. Authenticated User Profile
# ===========================================================================

def test_authenticated_user_profile_success(auth_fixture):
    client = auth_fixture["client"]
    res = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer seller-1-token"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "seller-1-uuid"
    assert data["email"] == "seller1@carbonloop.io"
    assert data["role"] == "SELLER"
    assert data["profile"]["full_name"] == "Seller One"
    assert data["profile"]["organization"] == "Capture Corp"


# ===========================================================================
# 3. Role Restrictions (Incorrect Role)
# ===========================================================================

def test_buyer_cannot_create_listing(auth_fixture):
    """BUYER attempting to create a CO2 listing receives 403 Forbidden."""
    client = auth_fixture["client"]
    res = client.post(
        "/api/listings",
        headers={"Authorization": "Bearer buyer-1-token"},
        json={
            "quantity": 500.0,
            "purity": 98.0,
            "location": "Dahej",
            "asking_price": 45.0,
        }
    )
    assert res.status_code == 403
    assert "Operation not permitted for role 'BUYER'" in res.json()["detail"]


def test_seller_cannot_create_requirement(auth_fixture):
    """SELLER attempting to create a buyer requirement receives 403 Forbidden."""
    client = auth_fixture["client"]
    res = client.post(
        "/api/requirements",
        headers={"Authorization": "Bearer seller-1-token"},
        json={
            "required_quantity": 500.0,
            "min_purity": 98.0,
            "delivery_location": "Dahej",
            "max_budget": 45.0,
        }
    )
    assert res.status_code == 403
    assert "Operation not permitted for role 'SELLER'" in res.json()["detail"]


def test_transporter_cannot_create_listing_or_requirement(auth_fixture):
    """TRANSPORTER receives 403 Forbidden on both listing and requirement creations."""
    client = auth_fixture["client"]
    res_list = client.post(
        "/api/listings",
        headers={"Authorization": "Bearer transporter-token"},
        json={"quantity": 100.0, "purity": 90.0, "location": "Vadodara", "asking_price": 30.0}
    )
    assert res_list.status_code == 403

    res_req = client.post(
        "/api/requirements",
        headers={"Authorization": "Bearer transporter-token"},
        json={"required_quantity": 100.0, "min_purity": 90.0, "delivery_location": "Vadodara", "max_budget": 30.0}
    )
    assert res_req.status_code == 403


# ===========================================================================
# 4. Seller Ownership Isolation (Modify & Delete)
# ===========================================================================

def test_seller_can_create_and_manage_own_listing(auth_fixture):
    client = auth_fixture["client"]

    # 1. Create listing as Seller 1
    create_res = client.post(
        "/api/listings",
        headers={"Authorization": "Bearer seller-1-token"},
        json={
            "quantity": 1000.0,
            "purity": 99.0,
            "location": "Hazira",
            "asking_price": 50.0,
        }
    )
    assert create_res.status_code == 201
    listing = create_res.json()
    listing_id = listing["id"]
    assert listing["seller_id"] == "seller-1-uuid"

    # 2. Update own listing as Seller 1
    patch_res = client.patch(
        f"/api/listings/{listing_id}",
        headers={"Authorization": "Bearer seller-1-token"},
        json={"asking_price": 48.0}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["asking_price"] == 48.0

    # 3. Delete own listing as Seller 1
    del_res = client.delete(
        f"/api/listings/{listing_id}",
        headers={"Authorization": "Bearer seller-1-token"},
    )
    assert del_res.status_code == 204


def test_seller_cannot_modify_another_sellers_listing(auth_fixture):
    client = auth_fixture["client"]

    # 1. Seller 1 creates a listing
    create_res = client.post(
        "/api/listings",
        headers={"Authorization": "Bearer seller-1-token"},
        json={
            "quantity": 1000.0,
            "purity": 99.0,
            "location": "Hazira",
            "asking_price": 50.0,
        }
    )
    assert create_res.status_code == 201
    listing_id = create_res.json()["id"]

    # 2. Seller 2 attempts to PATCH Seller 1's listing -> 403 Forbidden
    patch_res = client.patch(
        f"/api/listings/{listing_id}",
        headers={"Authorization": "Bearer seller-2-token"},
        json={"asking_price": 10.0}
    )
    assert patch_res.status_code == 403
    assert "another seller's listing" in patch_res.json()["detail"]

    # 3. Seller 2 attempts to DELETE Seller 1's listing -> 403 Forbidden
    del_res = client.delete(
        f"/api/listings/{listing_id}",
        headers={"Authorization": "Bearer seller-2-token"},
    )
    assert del_res.status_code == 403
    assert "another seller's listing" in del_res.json()["detail"]


# ===========================================================================
# 5. Buyer Ownership Isolation (Modify & Delete)
# ===========================================================================

def test_buyer_can_create_and_manage_own_requirement(auth_fixture):
    client = auth_fixture["client"]

    # 1. Create requirement as Buyer 1
    create_res = client.post(
        "/api/requirements",
        headers={"Authorization": "Bearer buyer-1-token"},
        json={
            "required_quantity": 800.0,
            "min_purity": 95.0,
            "delivery_location": "Mundra",
            "max_budget": 55.0,
        }
    )
    assert create_res.status_code == 201
    req = create_res.json()
    req_id = req["id"]
    assert req["buyer_id"] == "buyer-1-uuid"

    # 2. Update own requirement as Buyer 1
    patch_res = client.patch(
        f"/api/requirements/{req_id}",
        headers={"Authorization": "Bearer buyer-1-token"},
        json={"max_budget": 52.0}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["max_budget"] == 52.0

    # 3. Delete own requirement as Buyer 1
    del_res = client.delete(
        f"/api/requirements/{req_id}",
        headers={"Authorization": "Bearer buyer-1-token"},
    )
    assert del_res.status_code == 204


def test_buyer_cannot_modify_another_buyers_requirement(auth_fixture):
    client = auth_fixture["client"]

    # 1. Buyer 1 creates a requirement
    create_res = client.post(
        "/api/requirements",
        headers={"Authorization": "Bearer buyer-1-token"},
        json={
            "required_quantity": 800.0,
            "min_purity": 95.0,
            "delivery_location": "Mundra",
            "max_budget": 55.0,
        }
    )
    assert create_res.status_code == 201
    req_id = create_res.json()["id"]

    # 2. Buyer 2 attempts to PATCH Buyer 1's requirement -> 403 Forbidden
    patch_res = client.patch(
        f"/api/requirements/{req_id}",
        headers={"Authorization": "Bearer buyer-2-token"},
        json={"max_budget": 30.0}
    )
    assert patch_res.status_code == 403
    assert "another buyer's requirement" in patch_res.json()["detail"]

    # 3. Buyer 2 attempts to DELETE Buyer 1's requirement -> 403 Forbidden
    del_res = client.delete(
        f"/api/requirements/{req_id}",
        headers={"Authorization": "Bearer buyer-2-token"},
    )
    assert del_res.status_code == 403
    assert "another buyer's requirement" in del_res.json()["detail"]


# ===========================================================================
# 6. Not Found Checks on Protected Routes
# ===========================================================================

def test_patch_nonexistent_listing_returns_404(auth_fixture):
    client = auth_fixture["client"]
    res = client.patch(
        "/api/listings/nonexistent-uuid",
        headers={"Authorization": "Bearer seller-1-token"},
        json={"asking_price": 50.0}
    )
    assert res.status_code == 404


def test_patch_nonexistent_requirement_returns_404(auth_fixture):
    client = auth_fixture["client"]
    res = client.patch(
        "/api/requirements/nonexistent-uuid",
        headers={"Authorization": "Bearer buyer-1-token"},
        json={"max_budget": 50.0}
    )
    assert res.status_code == 404


def test_government_agent_cannot_create_listing_or_requirement(auth_fixture):
    """GOVERNMENT_AGENT receives 403 Forbidden on both listing and requirement creations."""
    client = auth_fixture["client"]
    res_list = client.post(
        "/api/listings",
        headers={"Authorization": "Bearer gov-token"},
        json={"quantity": 100.0, "purity": 90.0, "location": "Vadodara", "asking_price": 30.0}
    )
    assert res_list.status_code == 403

    res_req = client.post(
        "/api/requirements",
        headers={"Authorization": "Bearer gov-token"},
        json={"required_quantity": 100.0, "min_purity": 90.0, "delivery_location": "Vadodara", "max_budget": 30.0}
    )
    assert res_req.status_code == 403


def test_seller_id_strictly_derived_from_token_not_spoofed_payload(auth_fixture):
    """
    Verify that an attacker cannot spoof another seller's ID in the request body.
    The server derives seller_id strictly from the authenticated token.
    """
    client = auth_fixture["client"]
    res = client.post(
        "/api/listings",
        headers={"Authorization": "Bearer seller-1-token"},
        json={
            "seller_id": "spoofed-target-seller-id",
            "quantity": 500.0,
            "purity": 97.0,
            "location": "Dahej",
            "asking_price": 40.0,
        }
    )
    assert res.status_code == 201
    # seller_id must be seller-1-uuid from token, not the spoofed id
    assert res.json()["seller_id"] == "seller-1-uuid"


def test_buyer_id_strictly_derived_from_token_not_spoofed_payload(auth_fixture):
    """
    Verify that an attacker cannot spoof another buyer's ID in the request body.
    The server derives buyer_id strictly from the authenticated token.
    """
    client = auth_fixture["client"]
    res = client.post(
        "/api/requirements",
        headers={"Authorization": "Bearer buyer-1-token"},
        json={
            "buyer_id": "spoofed-target-buyer-id",
            "required_quantity": 500.0,
            "min_purity": 97.0,
            "delivery_location": "Dahej",
            "max_budget": 40.0,
        }
    )
    assert res.status_code == 201
    # buyer_id must be buyer-1-uuid from token, not the spoofed id
    assert res.json()["buyer_id"] == "buyer-1-uuid"
