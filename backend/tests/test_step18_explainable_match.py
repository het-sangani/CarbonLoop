"""
Test suite for Step 18: Explainable Matchmaking
Verifies:
1. Overall match score
2. Purity compatibility
3. Quantity compatibility
4. Logistics / distance factor
5. Price compatibility
6. Availability compatibility
7. Concise human-readable explanation points generated from real data
"""
import pytest
from app.services.matching import MatchingService


def test_explainable_matchmaking_output_structure():
    requirement = {
        "min_purity": 95.0,
        "required_quantity": 300.0,
        "delivery_location": "Vadodara, Gujarat",
        "required_date": "2026-11-20T00:00:00Z",
        "max_budget": 50.0,
    }
    listing = {
        "purity": 96.0,
        "quantity": 500.0,
        "location": "Ahmedabad, Gujarat",
        "availability_start": "2026-11-01T00:00:00Z",
        "availability_end": "2026-12-31T23:59:59Z",
        "asking_price": 42.0,
    }

    sub_scores, match_score, explanation = MatchingService.calculate_scores(listing, requirement)

    # 1. Overall match score
    assert isinstance(match_score, float)
    assert 0.0 <= match_score <= 100.0

    # 2. Purity compatibility
    assert "purity_score" in sub_scores
    assert sub_scores["purity_score"] >= 80.0

    # 3. Quantity compatibility
    assert "quantity_score" in sub_scores
    assert sub_scores["quantity_score"] >= 90.0

    # 4. Logistics/distance factor
    assert "location_score" in sub_scores
    assert "distance_km" in sub_scores
    assert sub_scores["distance_km"] > 0

    # 5. Price compatibility
    assert "price_score" in sub_scores
    assert sub_scores["price_score"] >= 85.0

    # 6. Availability compatibility
    assert "availability_score" in sub_scores
    assert sub_scores["availability_score"] == 100.0

    # 7. Concise human-readable explanation & points
    assert "explanation_points" in sub_scores
    points = sub_scores["explanation_points"]
    assert len(points) == 5

    # Check that explanation points dynamically reflect the input data
    assert any("96.0%" in p and "95.0%" in p for p in points)
    assert any("500" in p and "300" in p for p in points)
    assert any("km away" in p for p in points)
    assert any("$42" in p and "$50" in p for p in points)
    assert any("schedule overlaps" in p or "timeline" in p for p in points)

    # Explanation text is composed of the points
    for p in points:
        assert p in explanation


def test_explainable_matchmaking_penalty_reflection():
    requirement = {
        "min_purity": 99.0,
        "required_quantity": 800.0,
        "delivery_location": "Surat, Gujarat",
        "max_budget": 40.0,
    }
    listing = {
        "purity": 94.0,  # Below minimum
        "quantity": 200.0,  # Partial quantity
        "location": "Kolkata, West Bengal",  # Far away
        "asking_price": 55.0,  # Over budget
    }

    sub_scores, match_score, explanation = MatchingService.calculate_scores(listing, requirement)

    assert match_score == 0.0
    assert sub_scores["purity_score"] == 0.0
    points = sub_scores["explanation_points"]
    assert any("fails" in p or "below" in p for p in points)
    assert any("partial capacity" in p for p in points)
    assert any("exceeds the buyer's target budget" in p for p in points)
