import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import (
    get_matching_service,
    get_requirement_service,
    require_buyer,
)
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole
from app.services.matching import MatchingService, calculate_distance_km


# ---------------------------------------------------------------------------
# Unit Tests for Scoring Algorithm (Pure Functions & Determinism)
# ---------------------------------------------------------------------------

def test_excellent_match():
    """
    Test 1: Excellent match
    - Purity exceeds minimum
    - Quantity fulfills requirement
    - Same/nearby location
    - Timing aligns
    - Price is at or below maximum budget
    """
    requirement = {
        "min_purity": 95.0,
        "required_quantity": 1000.0,
        "delivery_location": "Dahej, Gujarat",
        "required_date": "2026-11-15T00:00:00Z",
        "max_budget": 50.0,
    }
    listing = {
        "purity": 99.0,
        "quantity": 1200.0,
        "location": "Dahej, Gujarat",
        "availability_start": "2026-10-01T00:00:00Z",
        "availability_end": "2026-12-31T23:59:59Z",
        "asking_price": 45.0,
    }

    sub_scores, match_score, explanation = MatchingService.calculate_scores(listing, requirement)

    assert sub_scores["purity_score"] >= 95.0
    assert sub_scores["quantity_score"] >= 90.0
    assert sub_scores["location_score"] == 100.0  # same location / intra-cluster
    assert sub_scores["availability_score"] == 100.0
    assert sub_scores["price_score"] >= 85.0
    assert match_score >= 85.0
    assert "satisfies the buyer's 95.0% minimum requirement" in explanation
    assert "The supplier can provide 1200.0 tonnes" in explanation


def test_poor_purity_match():
    """
    Test 2: Poor purity
    Listing purity is strictly below the buyer's minimum required purity.
    Must result in a 0 purity score and 0 match score (chemical assay failure).
    """
    requirement = {
        "min_purity": 98.0,
        "required_quantity": 500.0,
        "delivery_location": "Surat, Gujarat",
        "max_budget": 60.0,
    }
    listing = {
        "purity": 92.0,  # Below 98%
        "quantity": 1000.0,
        "location": "Surat, Gujarat",
        "asking_price": 40.0,
    }

    sub_scores, match_score, explanation = MatchingService.calculate_scores(listing, requirement)

    assert sub_scores["purity_score"] == 0.0
    assert match_score == 0.0
    assert "fails the buyer's 98.0% minimum requirement" in explanation


def test_insufficient_quantity_match():
    """
    Test 3: Insufficient quantity
    Supplier has only a small fraction of the required quantity.
    Quantity score and overall match score should be significantly penalized.
    """
    requirement = {
        "min_purity": 95.0,
        "required_quantity": 1000.0,
        "delivery_location": "Ahmedabad, Gujarat",
        "max_budget": 50.0,
    }
    listing = {
        "purity": 96.0,
        "quantity": 100.0,  # Only 10% of required volume
        "location": "Ahmedabad, Gujarat",
        "asking_price": 45.0,
    }

    sub_scores, match_score, explanation = MatchingService.calculate_scores(listing, requirement)

    assert sub_scores["quantity_score"] <= 15.0
    assert match_score < 60.0
    assert "partial capacity" in explanation


def test_excessive_distance_match():
    """
    Test 4: Excessive distance
    Supplier is in a very distant city, resulting in a low location score.
    """
    requirement = {
        "min_purity": 95.0,
        "required_quantity": 500.0,
        "delivery_location": "Surat, Gujarat",
        "max_budget": 50.0,
    }
    listing_local = {
        "purity": 95.0,
        "quantity": 500.0,
        "location": "Hazira, Gujarat",  # Nearby Surat (~15-20km)
        "asking_price": 45.0,
    }
    listing_distant = {
        "purity": 95.0,
        "quantity": 500.0,
        "location": "Kolkata, West Bengal",  # ~1600 km away
        "asking_price": 45.0,
    }

    sub_local, score_local, _ = MatchingService.calculate_scores(listing_local, requirement)
    sub_distant, score_distant, _ = MatchingService.calculate_scores(listing_distant, requirement)

    assert sub_local["distance_km"] < sub_distant["distance_km"]
    assert sub_local["location_score"] > sub_distant["location_score"]
    assert score_local > score_distant


def test_excessive_price_match():
    """
    Test 5: Excessive price
    Listing asking price exceeds buyer's maximum budget.
    Price score is penalized and dampens the final match score.
    """
    requirement = {
        "min_purity": 95.0,
        "required_quantity": 500.0,
        "delivery_location": "Dahej, Gujarat",
        "max_budget": 40.0,
    }
    listing_budget = {
        "purity": 96.0,
        "quantity": 500.0,
        "location": "Dahej, Gujarat",
        "asking_price": 38.0,
    }
    listing_expensive = {
        "purity": 96.0,
        "quantity": 500.0,
        "location": "Dahej, Gujarat",
        "asking_price": 85.0,  # Over double the budget
    }

    sub_budget, score_budget, _ = MatchingService.calculate_scores(listing_budget, requirement)
    sub_expensive, score_expensive, _ = MatchingService.calculate_scores(listing_expensive, requirement)

    assert sub_budget["price_score"] > sub_expensive["price_score"]
    assert sub_expensive["price_score"] == 0.0  # Over 50% overage -> 0
    assert score_budget > score_expensive


def test_incompatible_availability_match():
    """
    Test 6: Incompatible availability
    Buyer requires delivery on a date after the listing has already expired.
    """
    requirement = {
        "min_purity": 95.0,
        "required_quantity": 500.0,
        "delivery_location": "Dahej, Gujarat",
        "required_date": "2026-12-15T00:00:00Z",
    }
    listing_aligned = {
        "purity": 95.0,
        "quantity": 500.0,
        "location": "Dahej, Gujarat",
        "availability_start": "2026-11-01T00:00:00Z",
        "availability_end": "2026-12-31T00:00:00Z",
    }
    listing_expired = {
        "purity": 95.0,
        "quantity": 500.0,
        "location": "Dahej, Gujarat",
        "availability_start": "2026-08-01T00:00:00Z",
        "availability_end": "2026-09-01T00:00:00Z",  # Expired 3+ months prior
    }

    sub_aligned, score_aligned, _ = MatchingService.calculate_scores(listing_aligned, requirement)
    sub_expired, score_expired, _ = MatchingService.calculate_scores(listing_expired, requirement)

    assert sub_aligned["availability_score"] == 100.0
    assert sub_expired["availability_score"] == 0.0
    assert score_aligned > score_expired


def test_multiple_listings_ranking_and_determinism():
    """
    Test 7: Multiple listings and ranking, plus determinism check.
    Given 3 listings with varying quality, ensure they rank high -> medium -> low,
    and running the same inputs multiple times produces the exact same score.
    """
    requirement = {
        "min_purity": 95.0,
        "required_quantity": 500.0,
        "delivery_location": "Dahej, Gujarat",
        "max_budget": 50.0,
    }

    # Best: 99% purity, full quantity, same location, cheap
    listing_best = {
        "purity": 99.0,
        "quantity": 800.0,
        "location": "Dahej, Gujarat",
        "asking_price": 40.0,
    }
    # Medium: 95% purity, full quantity, moderately distant (Vadodara ~80km), at budget
    listing_med = {
        "purity": 95.0,
        "quantity": 500.0,
        "location": "Vadodara, Gujarat",
        "asking_price": 50.0,
    }
    # Worst: 95% purity, partial quantity (150t), distant (Mundra ~300km)
    listing_low = {
        "purity": 95.0,
        "quantity": 150.0,
        "location": "Mundra, Gujarat",
        "asking_price": 50.0,
    }

    _, score_best_1, _ = MatchingService.calculate_scores(listing_best, requirement)
    _, score_med_1, _ = MatchingService.calculate_scores(listing_med, requirement)
    _, score_low_1, _ = MatchingService.calculate_scores(listing_low, requirement)

    # Ranking assertion
    assert score_best_1 > score_med_1 > score_low_1

    # Determinism assertion: same inputs produce bitwise identical outputs
    _, score_best_2, _ = MatchingService.calculate_scores(listing_best, requirement)
    assert score_best_1 == score_best_2


# ---------------------------------------------------------------------------
# API Route & Authorization Integration Tests
# ---------------------------------------------------------------------------

class MockMatchingRequirementService:
    def __init__(self):
        self.requirements = {}

    def get_requirement_by_id(self, req_id: str):
        return self.requirements.get(req_id)


class MockMatchingService:
    def __init__(self):
        self.matches_to_return = []

    def find_matches(self, requirement_id: str, persist: bool = True):
        return self.matches_to_return


@pytest.fixture
def matching_test_env():
    mock_req_service = MockMatchingRequirementService()
    mock_match_service = MockMatchingService()

    buyer_user = AuthenticatedUser(
        id="owner-buyer-id",
        email="owner@buyer.com",
        profile=ProfileResponse(id="owner-buyer-id", role=UserRole.BUYER),
        role=UserRole.BUYER,
    )

    other_buyer_user = AuthenticatedUser(
        id="other-buyer-id",
        email="other@buyer.com",
        profile=ProfileResponse(id="other-buyer-id", role=UserRole.BUYER),
        role=UserRole.BUYER,
    )

    app.dependency_overrides[get_requirement_service] = lambda: mock_req_service
    app.dependency_overrides[get_matching_service] = lambda: mock_match_service
    app.dependency_overrides[require_buyer] = lambda: buyer_user

    client = TestClient(app)

    yield {
        "client": client,
        "req_service": mock_req_service,
        "match_service": mock_match_service,
        "buyer_user": buyer_user,
        "other_buyer_user": other_buyer_user,
    }

    app.dependency_overrides.clear()


def test_api_matches_unauthenticated():
    """Unauthenticated request to /api/matches/{id} returns 401 Unauthorized."""
    app.dependency_overrides.clear()
    client = TestClient(app)
    res = client.get("/api/matches/any-id")
    assert res.status_code == 401


def test_api_matches_requirement_not_found(matching_test_env):
    """Querying matches for a non-existent requirement returns 404 Not Found."""
    client = matching_test_env["client"]
    res = client.get("/api/matches/missing-req-id")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_api_matches_wrong_buyer_forbidden(matching_test_env):
    """Buyer attempting to view matches for another buyer's requirement returns 403 Forbidden."""
    client = matching_test_env["client"]
    req_service = matching_test_env["req_service"]

    # Requirement belongs to 'someone-else'
    req_service.requirements["other-req-id"] = {
        "id": "other-req-id",
        "buyer_id": "someone-else-id",
        "required_quantity": 500.0,
        "min_purity": 95.0,
    }

    res = client.get("/api/matches/other-req-id")
    assert res.status_code == 403
    assert "another buyer's requirement" in res.json()["detail"]


def test_api_matches_owner_success(matching_test_env):
    """Authenticated owner buyer successfully retrieves matches."""
    client = matching_test_env["client"]
    req_service = matching_test_env["req_service"]
    match_service = matching_test_env["match_service"]

    # Requirement belongs to 'owner-buyer-id'
    req_service.requirements["my-req-id"] = {
        "id": "my-req-id",
        "buyer_id": "owner-buyer-id",
        "required_quantity": 800.0,
        "min_purity": 95.0,
    }

    match_service.matches_to_return = [
        {
            "id": "match-uuid-1",
            "listing_id": "listing-uuid-1",
            "requirement_id": "my-req-id",
            "listing": {
                "id": "listing-uuid-1",
                "seller_id": "seller-uuid-1",
                "quantity": 1000.0,
                "purity": 98.5,
                "location": "Dahej, Gujarat",
                "asking_price": 45.0,
                "status": "active",
                "created_at": "2026-09-12T00:00:00Z",
            },
            "match_score": 92.4,
            "purity_score": 94.0,
            "quantity_score": 92.0,
            "location_score": 100.0,
            "availability_score": 100.0,
            "price_score": 90.0,
            "distance_km": 15.0,
            "explanation": "98.5% purity satisfies the buyer's 95.0% minimum requirement.",
            "created_at": "2026-09-12T10:00:00Z",
        }
    ]

    res = client.get("/api/matches/my-req-id")
    assert res.status_code == 200
    data = res.json()
    assert data["requirement_id"] == "my-req-id"
    assert data["total_matches"] == 1
    match_item = data["matches"][0]
    assert match_item["match_score"] == 92.4
    assert match_item["purity_score"] == 94.0
    assert match_item["listing"]["id"] == "listing-uuid-1"
    assert "satisfies the buyer" in match_item["explanation"]


def test_api_matches_wrong_role_seller_forbidden():
    """SELLER role attempting to call GET /api/matches/{id} receives 403 Forbidden."""
    seller_user = AuthenticatedUser(
        id="seller-id-999",
        email="seller@carbonloop.io",
        profile=ProfileResponse(id="seller-id-999", role=UserRole.SELLER),
        role=UserRole.SELLER,
    )
    # Clear overrides and mock get_current_user returning a SELLER
    from app.api.deps import get_current_user
    app.dependency_overrides[get_current_user] = lambda: seller_user
    client = TestClient(app)

    res = client.get("/api/matches/any-req-id")
    assert res.status_code == 403
    assert "operation not permitted" in res.json()["detail"].lower()

    app.dependency_overrides.clear()
