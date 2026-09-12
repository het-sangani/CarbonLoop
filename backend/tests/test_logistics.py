import math
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.logistics import (
    LogisticsEstimateRequest,
    LogisticsEstimateResponse,
)
from app.services.logistics import (
    DistanceEstimator,
    LogisticsService,
    STANDARD_TANKER_PAYLOAD_TONNES,
    BASE_DISPATCH_FEE_PER_TRIP_USD,
    ROAD_FREIGHT_RATE_PER_KM_USD,
    TRANSIT_EMISSION_FACTOR_KG_PER_KM,
    DEFAULT_FALLBACK_DISTANCE_KM,
    INTRA_CLUSTER_DISTANCE_KM,
)


client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. DistanceEstimator Tests
# ---------------------------------------------------------------------------

def test_distance_estimator_known_cities():
    """Distance between Dahej and Hazira should calculate using Haversine * 1.2 circuity."""
    estimator = DistanceEstimator()
    dist, is_fallback = estimator.estimate_distance("Dahej, Gujarat", "Hazira, Surat")
    
    assert not is_fallback
    # Dahej ~ (21.7122, 72.5855) to Hazira ~ (21.1118, 72.6517) is ~67 km Haversine * 1.2 = ~80 km
    assert 70.0 <= dist <= 100.0


def test_distance_estimator_identical_location():
    """Identical location string returns local intra-cluster distance."""
    estimator = DistanceEstimator()
    dist, is_fallback = estimator.estimate_distance("Dahej Port", "Dahej Port")
    assert not is_fallback
    assert dist == INTRA_CLUSTER_DISTANCE_KM


def test_distance_estimator_same_known_hub():
    """Different text resolving to the same city hub returns local intra-cluster distance."""
    estimator = DistanceEstimator()
    dist, is_fallback = estimator.estimate_distance("Dahej Industrial Area", "Dahej Port Terminal")
    assert not is_fallback
    assert dist == INTRA_CLUSTER_DISTANCE_KM


def test_distance_estimator_unknown_location_fallback():
    """Unrecognized or unmapped location triggers the safe deterministic 150 km fallback."""
    estimator = DistanceEstimator()
    dist, is_fallback = estimator.estimate_distance("Atlantis Underwater City", "El Dorado")
    assert is_fallback is True
    assert dist == DEFAULT_FALLBACK_DISTANCE_KM


def test_distance_estimator_partial_unknown():
    """If one location is known and one is unknown, fallback is safely applied."""
    estimator = DistanceEstimator()
    dist, is_fallback = estimator.estimate_distance("Dahej", "Somewhere Unknown Faraway")
    assert is_fallback is True
    assert dist == DEFAULT_FALLBACK_DISTANCE_KM


# ---------------------------------------------------------------------------
# 2. LogisticsService Unit Calculations
# ---------------------------------------------------------------------------

def test_calculate_trips():
    """Trip calculation ceil(quantity / 25.0)."""
    assert LogisticsService.calculate_trips(25.0) == 1
    assert LogisticsService.calculate_trips(25.1) == 2
    assert LogisticsService.calculate_trips(50.0) == 2
    assert LogisticsService.calculate_trips(300.0) == 12
    assert LogisticsService.calculate_trips(0.5) == 1

    with pytest.raises(ValueError):
        LogisticsService.calculate_trips(0.0)

    with pytest.raises(ValueError):
        LogisticsService.calculate_trips(-10.0)


def test_calculate_transport_cost():
    """
    Transport cost formula:
    trips = ceil(300 / 25) = 12
    cost per trip = 150 + (112 * 1.50) = 150 + 168 = 318.00
    total = 12 * 318 = 3,816.00
    """
    cost, trips = LogisticsService.calculate_transport_cost(distance_km=112.0, quantity_tonnes=300.0)
    assert trips == 12
    assert cost == 3816.00

    # Test error cases
    with pytest.raises(ValueError):
        LogisticsService.calculate_transport_cost(distance_km=-5.0, quantity_tonnes=100.0)
    with pytest.raises(ValueError):
        LogisticsService.calculate_transport_cost(distance_km=100.0, quantity_tonnes=0.0)


def test_calculate_purchase_cost():
    """CO2 purchase cost = quantity * price_per_tonne."""
    assert LogisticsService.calculate_purchase_cost(300.0, 42.0) == 12600.00
    assert LogisticsService.calculate_purchase_cost(100.0, 0.0) == 0.00

    with pytest.raises(ValueError):
        LogisticsService.calculate_purchase_cost(-50.0, 42.0)
    with pytest.raises(ValueError):
        LogisticsService.calculate_purchase_cost(100.0, -10.0)


def test_calculate_transit_emissions():
    """Transit emissions = trips * distance_km * 0.85 kg CO2e."""
    # 12 trips * 112 km * 0.85 = 1,142.40 kg CO2e
    emissions = LogisticsService.calculate_transit_emissions(trips=12, distance_km=112.0)
    assert emissions == 1142.40

    with pytest.raises(ValueError):
        LogisticsService.calculate_transit_emissions(trips=0, distance_km=100.0)
    with pytest.raises(ValueError):
        LogisticsService.calculate_transit_emissions(trips=5, distance_km=-10.0)


def test_estimate_logistics_full_pipeline():
    """Verify estimate_logistics generates complete breakdown and total cost."""
    service = LogisticsService()
    res = service.estimate_logistics(
        pickup_location="Dahej, Gujarat",
        delivery_location="Hazira, Surat",
        quantity_tonnes=300.0,
        price_per_tonne=42.0,
    )

    assert isinstance(res, LogisticsEstimateResponse)
    assert res.quantity_tonnes == 300.0
    assert res.price_per_tonne == 42.0
    assert res.trips_required == 12
    assert not res.is_fallback_distance
    assert res.distance_km > 0

    # Total cost should be co2_purchase_cost + transport_estimated_cost
    assert res.co2_purchase_cost == 12600.00
    assert res.total_estimated_cost == round(res.co2_purchase_cost + res.transport_estimated_cost, 2)
    assert res.cost_per_tonne == round(res.total_estimated_cost / 300.0, 2)
    assert res.transit_emissions_kg > 0
    assert "Prototype estimate" in res.disclaimer


# ---------------------------------------------------------------------------
# 3. HTTP API Route Tests: POST /api/logistics/estimate
# ---------------------------------------------------------------------------

def test_api_logistics_estimate_success():
    """POST /api/logistics/estimate returns valid 200 and schema."""
    payload = {
        "pickup_location": "Dahej, Gujarat",
        "delivery_location": "Surat, Gujarat",
        "quantity_tonnes": 100.0,
        "price_per_tonne": 50.0,
    }
    response = client.post("/api/logistics/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["quantity_tonnes"] == 100.0
    assert data["price_per_tonne"] == 50.0
    assert data["trips_required"] == 4  # 100 / 25
    assert data["co2_purchase_cost"] == 5000.0
    assert data["total_estimated_cost"] == round(5000.0 + data["transport_estimated_cost"], 2)
    assert data["transit_emissions_kg"] > 0
    assert data["disclaimer"] is not None


def test_api_logistics_estimate_fallback_location():
    """POST /api/logistics/estimate flags is_fallback_distance when locations are unmapped."""
    payload = {
        "pickup_location": "Custom Remote Facility Alpha",
        "delivery_location": "Custom Remote Facility Beta",
        "quantity_tonnes": 50.0,
        "price_per_tonne": 40.0,
    }
    response = client.post("/api/logistics/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_fallback_distance"] is True
    assert data["distance_km"] == 150.0
    assert data["trips_required"] == 2


def test_api_logistics_estimate_invalid_quantity():
    """POST /api/logistics/estimate rejects zero or negative quantity with 422."""
    payload = {
        "pickup_location": "Dahej",
        "delivery_location": "Hazira",
        "quantity_tonnes": 0.0,
        "price_per_tonne": 40.0,
    }
    response = client.post("/api/logistics/estimate", json=payload)
    assert response.status_code == 422

    payload["quantity_tonnes"] = -10.0
    response = client.post("/api/logistics/estimate", json=payload)
    assert response.status_code == 422


def test_api_logistics_estimate_negative_price():
    """POST /api/logistics/estimate rejects negative price with 422."""
    payload = {
        "pickup_location": "Dahej",
        "delivery_location": "Hazira",
        "quantity_tonnes": 50.0,
        "price_per_tonne": -5.0,
    }
    response = client.post("/api/logistics/estimate", json=payload)
    assert response.status_code == 422


def test_api_logistics_estimate_empty_locations():
    """POST /api/logistics/estimate rejects blank or whitespace-only location strings."""
    payload = {
        "pickup_location": "   ",
        "delivery_location": "Hazira",
        "quantity_tonnes": 50.0,
        "price_per_tonne": 40.0,
    }
    response = client.post("/api/logistics/estimate", json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# 4. Matchmaking Integration with Logistics
# ---------------------------------------------------------------------------

def test_matchmaking_service_includes_logistics_estimate():
    """Verify that find_matches populates the logistics breakdown on match results."""
    from unittest.mock import MagicMock
    from app.services.matching import MatchingService

    mock_client = MagicMock()
    service = MatchingService(client=mock_client)

    sample_requirement = {
        "id": "req-logistics-1",
        "buyer_id": "buyer-user-1",
        "required_quantity": 250.0,
        "min_purity": 95.0,
        "delivery_location": "Hazira, Gujarat",
        "required_date": "2026-12-01T00:00:00Z",
        "max_budget": 60.0,
        "status": "OPEN",
    }
    sample_listing = {
        "id": "list-logistics-1",
        "seller_id": "seller-user-1",
        "purity": 99.0,
        "quantity": 500.0,
        "location": "Dahej, Gujarat",
        "availability_start": "2026-10-01T00:00:00Z",
        "availability_end": "2026-12-31T23:59:59Z",
        "asking_price": 45.0,
        "status": "active",
    }

    # Explicitly mock retrieval methods on the service
    service.get_requirement_by_id = MagicMock(return_value=sample_requirement)
    service.get_active_listings = MagicMock(return_value=[sample_listing])

    matches = service.find_matches("req-logistics-1", persist=False)

    assert len(matches) == 1
    match = matches[0]
    assert "logistics" in match
    assert match["logistics"] is not None

    logistics = match["logistics"]
    assert isinstance(logistics, LogisticsEstimateResponse)
    assert logistics.quantity_tonnes == 250.0
    assert logistics.trips_required == 10  # 250 / 25
    assert logistics.price_per_tonne == 45.0
    assert logistics.co2_purchase_cost == 250.0 * 45.0
    assert logistics.total_estimated_cost > logistics.co2_purchase_cost
    assert logistics.transit_emissions_kg > 0
