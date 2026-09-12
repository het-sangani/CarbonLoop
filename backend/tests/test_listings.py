import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import get_listing_service
from app.schemas.listing import ListingCreate, ListingUpdate
from app.services.listing_service import ListingService


class MockListingService:
    """
    In-memory test double for ListingService to enable fast, deterministic,
    and isolated testing of API routes and validation without external network dependencies.
    """

    def __init__(self):
        self.listings: Dict[str, Dict[str, Any]] = {}

    def create_listing(
        self, listing_in: ListingCreate, seller_id: Optional[str] = None
    ) -> Dict[str, Any]:
        listing_id = str(uuid.uuid4())
        effective_seller_id = seller_id if seller_id is not None else listing_in.seller_id
        
        record = {
            "id": listing_id,
            "seller_id": effective_seller_id,
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

    def get_listings(
        self,
        status: Optional[str] = None,
        min_purity: Optional[float] = None,
        seller_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        results = list(self.listings.values())
        if status:
            results = [l for l in results if l.get("status") == status.lower()]
        if min_purity is not None:
            results = [l for l in results if l.get("purity", 0) >= min_purity]
        if seller_id:
            results = [l for l in results if l.get("seller_id") == seller_id]
        return results[offset : offset + limit]

    def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        return self.listings.get(listing_id)

    def update_listing(
        self, listing_id: str, listing_update: ListingUpdate
    ) -> Optional[Dict[str, Any]]:
        if listing_id not in self.listings:
            return None
        record = self.listings[listing_id]
        payload = listing_update.model_dump(exclude_unset=True)
        for k, v in payload.items():
            if isinstance(v, datetime):
                record[k] = v.isoformat()
            else:
                record[k] = v
        return record

    def delete_listing(self, listing_id: str) -> bool:
        if listing_id in self.listings:
            del self.listings[listing_id]
            return True
        return False


@pytest.fixture
def mock_service():
    service = MockListingService()
    app.dependency_overrides[get_listing_service] = lambda: service
    yield service
    app.dependency_overrides.clear()


@pytest.fixture
def client(mock_service):
    return TestClient(app)


# ---------------------------------------------------------------------------
# 1. Valid Listing Creation
# ---------------------------------------------------------------------------

def test_valid_listing_creation(client):
    """
    Test creating a valid CO2 supply listing returns 201 Created and correct schema.
    """
    payload = {
        "quantity": 500.0,
        "purity": 98.5,
        "location": "Ahmedabad, Gujarat",
        "availability_start": "2026-10-01T00:00:00Z",
        "availability_end": "2026-12-31T23:59:59Z",
        "asking_price": 42.0,
        "status": "active",
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["quantity"] == 500.0
    assert data["purity"] == 98.5
    assert data["location"] == "Ahmedabad, Gujarat"
    assert data["asking_price"] == 42.0
    assert data["status"] == "active"
    assert data["seller_id"] is None


def test_valid_listing_creation_with_isolated_seller_header(client):
    """
    Test creating a listing with isolated X-Seller-ID header sets seller_id correctly.
    """
    payload = {
        "quantity": 1200.0,
        "purity": 99.2,
        "location": "Dahej, Gujarat",
        "asking_price": 55.0,
    }
    response = client.post(
        "/api/listings",
        json=payload,
        headers={"X-Seller-ID": "seller-uuid-1234"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["seller_id"] == "seller-uuid-1234"
    assert data["quantity"] == 1200.0
    assert data["purity"] == 99.2


# ---------------------------------------------------------------------------
# 2. Invalid Quantity Validation
# ---------------------------------------------------------------------------

def test_create_listing_invalid_quantity_zero(client):
    """
    Test quantity must be strictly greater than 0 (zero should fail).
    """
    payload = {
        "quantity": 0.0,
        "purity": 95.0,
        "location": "Surat, Gujarat",
        "asking_price": 30.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("quantity" in str(err["loc"]) for err in errors)


def test_create_listing_invalid_quantity_negative(client):
    """
    Test quantity must be strictly greater than 0 (negative should fail).
    """
    payload = {
        "quantity": -100.0,
        "purity": 95.0,
        "location": "Surat, Gujarat",
        "asking_price": 30.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("quantity" in str(err["loc"]) for err in errors)


# ---------------------------------------------------------------------------
# 3. Invalid Purity Validation
# ---------------------------------------------------------------------------

def test_create_listing_invalid_purity_above_100(client):
    """
    Test purity cannot exceed 100%.
    """
    payload = {
        "quantity": 250.0,
        "purity": 100.5,
        "location": "Vadodara, Gujarat",
        "asking_price": 35.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("purity" in str(err["loc"]) for err in errors)


def test_create_listing_invalid_purity_negative(client):
    """
    Test purity cannot be negative (< 0).
    """
    payload = {
        "quantity": 250.0,
        "purity": -1.0,
        "location": "Vadodara, Gujarat",
        "asking_price": 35.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("purity" in str(err["loc"]) for err in errors)


# ---------------------------------------------------------------------------
# 4. Invalid Price Validation
# ---------------------------------------------------------------------------

def test_create_listing_invalid_price_negative(client):
    """
    Test asking_price must be non-negative (negative should fail).
    """
    payload = {
        "quantity": 100.0,
        "purity": 92.0,
        "location": "Mumbai, Maharashtra",
        "asking_price": -20.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("asking_price" in str(err["loc"]) for err in errors)


def test_create_listing_valid_price_zero(client):
    """
    Test asking_price of 0.0 is valid (free/byproduct stream).
    """
    payload = {
        "quantity": 100.0,
        "purity": 92.0,
        "location": "Mumbai, Maharashtra",
        "asking_price": 0.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 201
    assert response.json()["asking_price"] == 0.0


# ---------------------------------------------------------------------------
# 5. Invalid Availability Range Validation
# ---------------------------------------------------------------------------

def test_create_listing_invalid_availability_range(client):
    """
    Test availability_start must not be after availability_end.
    """
    payload = {
        "quantity": 400.0,
        "purity": 97.0,
        "location": "Chennai, Tamil Nadu",
        "availability_start": "2026-12-31T23:59:59Z",
        "availability_end": "2026-01-01T00:00:00Z",  # Earlier than start!
        "asking_price": 50.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 422
    assert "availability_start must not be after availability_end" in response.text


# ---------------------------------------------------------------------------
# 6. Retrieving Listings (GET /api/listings)
# ---------------------------------------------------------------------------

def test_retrieving_listings(client):
    """
    Test GET /api/listings returns list of all active listings and supports filtering.
    """
    # Create two listings
    client.post(
        "/api/listings",
        json={
            "quantity": 500.0,
            "purity": 96.0,
            "location": "Site A",
            "asking_price": 40.0,
            "status": "active",
        },
    )
    client.post(
        "/api/listings",
        json={
            "quantity": 1000.0,
            "purity": 99.5,
            "location": "Site B",
            "asking_price": 60.0,
            "status": "in-negotiation",
        },
    )

    # Retrieve all
    response = client.get("/api/listings")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) == 2

    # Filter by status
    resp_filtered = client.get("/api/listings?status=active")
    assert resp_filtered.status_code == 200
    filtered_items = resp_filtered.json()
    assert len(filtered_items) == 1
    assert filtered_items[0]["location"] == "Site A"

    # Filter by minimum purity
    resp_purity = client.get("/api/listings?min_purity=98.0")
    assert resp_purity.status_code == 200
    purity_items = resp_purity.json()
    assert len(purity_items) == 1
    assert purity_items[0]["location"] == "Site B"


# ---------------------------------------------------------------------------
# 7. Retrieving a Listing by ID (GET /api/listings/{listing_id})
# ---------------------------------------------------------------------------

def test_retrieving_listing_by_id(client):
    """
    Test GET /api/listings/{id} returns the specific listing, and 404 for missing ID.
    """
    create_res = client.post(
        "/api/listings",
        json={
            "quantity": 750.0,
            "purity": 97.8,
            "location": "Jaipur, Rajasthan",
            "asking_price": 48.0,
        },
    )
    listing_id = create_res.json()["id"]

    # Valid ID lookup
    get_res = client.get(f"/api/listings/{listing_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == listing_id
    assert data["location"] == "Jaipur, Rajasthan"
    assert data["quantity"] == 750.0

    # Non-existent ID lookup
    missing_res = client.get("/api/listings/non-existent-uuid-9999")
    assert missing_res.status_code == 404
    assert "not found" in missing_res.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 8. Updating a Listing (PATCH /api/listings/{listing_id})
# ---------------------------------------------------------------------------

def test_update_listing(client):
    """
    Test PATCH /api/listings/{id} partially updates listing fields.
    """
    create_res = client.post(
        "/api/listings",
        json={
            "quantity": 300.0,
            "purity": 94.0,
            "location": "Kolkata, West Bengal",
            "asking_price": 38.0,
        },
    )
    listing_id = create_res.json()["id"]

    # Update asking price and status
    patch_res = client.patch(
        f"/api/listings/{listing_id}",
        json={"asking_price": 35.5, "status": "closed"},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["asking_price"] == 35.5
    assert updated["status"] == "closed"
    assert updated["quantity"] == 300.0  # Unchanged


# ---------------------------------------------------------------------------
# 9. Deleting a Listing (DELETE /api/listings/{listing_id})
# ---------------------------------------------------------------------------

def test_delete_listing(client):
    """
    Test DELETE /api/listings/{id} deletes listing and returns 204 No Content.
    """
    create_res = client.post(
        "/api/listings",
        json={
            "quantity": 150.0,
            "purity": 91.0,
            "location": "Nagpur, Maharashtra",
            "asking_price": 28.0,
        },
    )
    listing_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/listings/{listing_id}")
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = client.get(f"/api/listings/{listing_id}")
    assert get_res.status_code == 404


# ---------------------------------------------------------------------------
# 10. Direct ListingService Unit Tests (Supabase Client Integration)
# ---------------------------------------------------------------------------

def test_listing_service_direct_unit_tests():
    """
    Directly unit test ListingService methods with mocked Supabase client.
    """
    from unittest.mock import MagicMock
    mock_sb = MagicMock()
    service = ListingService(client=mock_sb)

    # 1. create_listing
    fake_record = {
        "id": "abc-123",
        "quantity": 100.0,
        "purity": 99.0,
        "location": "Test Loc",
        "asking_price": 50.0,
        "status": "active",
        "seller_id": "seller-001",
    }
    mock_sb.table.return_value.insert.return_value.execute.return_value.data = [fake_record]

    created = service.create_listing(
        ListingCreate(
            quantity=100.0,
            purity=99.0,
            location="Test Loc",
            asking_price=50.0,
        ),
        seller_id="seller-001",
    )
    assert created["id"] == "abc-123"
    assert created["seller_id"] == "seller-001"
    mock_sb.table.assert_called_with("co2_listings")

    # 2. get_listings
    mock_sb.table.return_value.select.return_value.order.return_value.range.return_value.execute.return_value.data = [fake_record]
    listings = service.get_listings(limit=10, offset=0)
    assert len(listings) == 1
    assert listings[0]["id"] == "abc-123"

    # 3. get_listing_by_id
    mock_sb.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [fake_record]
    one = service.get_listing_by_id("abc-123")
    assert one is not None
    assert one["id"] == "abc-123"

    # 4. update_listing
    updated_record = dict(fake_record)
    updated_record["asking_price"] = 45.0
    mock_sb.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [updated_record]
    res_update = service.update_listing("abc-123", ListingUpdate(asking_price=45.0))
    assert res_update["asking_price"] == 45.0

    # 5. delete_listing
    # First query checks existing
    mock_sb.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [fake_record]
    mock_sb.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = []
    deleted = service.delete_listing("abc-123")
    assert deleted is True
