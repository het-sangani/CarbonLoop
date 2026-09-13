import math
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.logistics import (
    DistanceEstimator,
    LogisticsService,
    STANDARD_TANKER_PAYLOAD_TONNES,
    BASE_DISPATCH_FEE_PER_TRIP_USD,
    ROAD_FREIGHT_RATE_PER_KM_USD,
    DEFAULT_FALLBACK_DISTANCE_KM,
    INTRA_CLUSTER_DISTANCE_KM,
)
from app.schemas.logistics import LogisticsEstimateResponse

client = TestClient(app)


# ---------------------------------------------------------------------------
# TEST 7.1 — DISTANCE
# ---------------------------------------------------------------------------
def test_7_1_distance_known_coordinates():
    """Verify distance_km between two known different locations is > 0, deterministic, and reasonable."""
    estimator = DistanceEstimator()
    dist1, is_fallback1 = estimator.estimate_distance("Dahej, Gujarat", "Hazira, Surat")
    dist2, is_fallback2 = estimator.estimate_distance("Dahej, Gujarat", "Hazira, Surat")

    assert not is_fallback1
    assert not is_fallback2
    assert dist1 > 0
    assert dist1 == dist2  # Deterministic
    # Haversine between Dahej and Hazira is ~67 km, with 1.2 road circuity ~80.5 km
    assert 70.0 <= dist1 <= 95.0


# ---------------------------------------------------------------------------
# TEST 7.2 — SAME LOCATION
# ---------------------------------------------------------------------------
def test_7_2_same_location_intra_cluster():
    """Verify identical supplier and buyer coordinates return intra-cluster distance."""
    estimator = DistanceEstimator()
    dist, is_fallback = estimator.estimate_distance("Dahej Port Terminal", "Dahej Port Terminal")
    assert not is_fallback
    assert dist == INTRA_CLUSTER_DISTANCE_KM
    assert dist <= 20.0  # Appropriate tolerance for intra-facility/local cluster transit


# ---------------------------------------------------------------------------
# TEST 7.3 — QUANTITY COST
# ---------------------------------------------------------------------------
def test_7_3_quantity_cost():
    """Verify 300 tonnes x $42/tonne = $12,600."""
    qty = 300.0
    price = 42.0
    purchase_cost = LogisticsService.calculate_purchase_cost(qty, price)
    assert purchase_cost == 12600.00


# ---------------------------------------------------------------------------
# TEST 7.4 — TRANSPORT COST
# ---------------------------------------------------------------------------
def test_7_4_transport_cost_manual_comparison():
    """
    Compare manually calculated expected cost vs backend transport cost.
    Input: distance_km = 112.0, quantity = 300.0 tonnes
    Formula:
      trips = ceil(300 / 25) = 12
      cost_per_trip = $150.00 + (112.0 * $1.50) = 150 + 168 = $318.00
      total_transport_cost = 12 * $318.00 = $3,816.00
    """
    distance_km = 112.0
    quantity = 300.0
    trips_expected = math.ceil(quantity / STANDARD_TANKER_PAYLOAD_TONNES)
    expected_cost = round(trips_expected * (BASE_DISPATCH_FEE_PER_TRIP_USD + (distance_km * ROAD_FREIGHT_RATE_PER_KM_USD)), 2)

    actual_cost, actual_trips = LogisticsService.calculate_transport_cost(distance_km, quantity)

    assert actual_trips == trips_expected == 12
    assert actual_cost == expected_cost == 3816.00


# ---------------------------------------------------------------------------
# TEST 7.5 — TOTAL COST
# ---------------------------------------------------------------------------
def test_7_5_total_cost_consistency():
    """Verify total cost = purchase cost + transport cost with consistent rounding."""
    service = LogisticsService()
    res = service.estimate_logistics(
        pickup_location="Dahej, Gujarat",
        delivery_location="Hazira, Surat",
        quantity_tonnes=300.0,
        price_per_tonne=42.0,
    )

    assert res.co2_purchase_cost == 12600.00
    assert res.total_estimated_cost == round(res.co2_purchase_cost + res.transport_estimated_cost, 2)
    assert res.cost_per_tonne == round(res.total_estimated_cost / 300.0, 2)


# ---------------------------------------------------------------------------
# TEST 7.6 — INVALID QUANTITY
# ---------------------------------------------------------------------------
def test_7_6_invalid_quantity_rejected():
    """Verify negative and zero quantities return 422 validation error."""
    # Negative quantity
    res = client.post("/api/logistics/estimate", json={
        "pickup_location": "Dahej",
        "delivery_location": "Hazira",
        "quantity_tonnes": -100.0,
        "price_per_tonne": 42.0,
    })
    assert res.status_code == 422

    # Zero quantity
    res = client.post("/api/logistics/estimate", json={
        "pickup_location": "Dahej",
        "delivery_location": "Hazira",
        "quantity_tonnes": 0.0,
        "price_per_tonne": 42.0,
    })
    assert res.status_code == 422


# ---------------------------------------------------------------------------
# TEST 7.7 — INVALID LOCATION / FALLBACK
# ---------------------------------------------------------------------------
def test_7_7_invalid_location_explicit_fallback():
    """
    Verify invalid or unmapped locations explicitly indicate fallback (is_fallback_distance=True),
    and do NOT silently return a believable fake distance.
    """
    estimator = DistanceEstimator()
    dist, is_fallback = estimator.estimate_distance("Underwater Atlantis Facility", "Fictional Valley 99")

    assert is_fallback is True
    assert dist == DEFAULT_FALLBACK_DISTANCE_KM

    # Also test through API
    res = client.post("/api/logistics/estimate", json={
        "pickup_location": "Unknown Faraway Location Alpha",
        "delivery_location": "Unknown Faraway Location Beta",
        "quantity_tonnes": 100.0,
        "price_per_tonne": 40.0,
    })
    assert res.status_code == 200
    data = res.json()
    assert data["is_fallback_distance"] is True
    assert data["distance_km"] == DEFAULT_FALLBACK_DISTANCE_KM


# ---------------------------------------------------------------------------
# TEST 7.8 — MATCH + LOGISTICS INTEGRATION
# ---------------------------------------------------------------------------
def test_7_8_match_logistics_integration():
    """Verify matchmaking results embed internally consistent logistics breakdown."""
    from unittest.mock import MagicMock
    from app.services.matching import MatchingService

    mock_client = MagicMock()
    service = MatchingService(client=mock_client)

    sample_req = {
        "id": "req-chk7-1",
        "buyer_id": "buyer-chk7",
        "required_quantity": 200.0,
        "min_purity": 95.0,
        "delivery_location": "Hazira, Gujarat",
        "required_date": "2026-12-01T00:00:00Z",
        "max_budget": 50.0,
        "status": "OPEN",
    }
    sample_listing = {
        "id": "list-chk7-1",
        "seller_id": "seller-chk7",
        "purity": 98.5,
        "quantity": 400.0,
        "location": "Dahej, Gujarat",
        "availability_start": "2026-10-01T00:00:00Z",
        "availability_end": "2026-12-31T23:59:59Z",
        "asking_price": 40.0,
        "status": "active",
    }

    service.get_requirement_by_id = MagicMock(return_value=sample_req)
    service.get_active_listings = MagicMock(return_value=[sample_listing])

    matches = service.find_matches("req-chk7-1", persist=False)
    assert len(matches) == 1
    m = matches[0]

    assert m["match_score"] > 0
    assert m["distance_km"] > 0
    assert "logistics" in m
    log = m["logistics"]
    assert isinstance(log, LogisticsEstimateResponse)

    # 1. Distance corresponds to Dahej -> Hazira
    assert 70.0 <= log.distance_km <= 95.0
    # 2. Transport cost matches formula: 8 trips * (150 + distance * 1.5)
    trips = math.ceil(200.0 / 25.0)  # 8
    expected_freight = round(trips * (150.0 + log.distance_km * 1.50), 2)
    assert log.transport_estimated_cost == expected_freight
    # 3. Total cost = purchase + transport
    assert log.total_estimated_cost == round(log.co2_purchase_cost + log.transport_estimated_cost, 2)
    # 4. Values internally consistent
    assert log.cost_per_tonne == round(log.total_estimated_cost / 200.0, 2)
