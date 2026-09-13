import logging
import math
from typing import Dict, Optional, Tuple
from app.schemas.logistics import LogisticsEstimateResponse

logger = logging.getLogger(__name__)

# Constants for Cryogenic Liquid CO2 Road Logistics Model
STANDARD_TANKER_PAYLOAD_TONNES: float = 25.0  # Standard commercial cryo-tanker capacity
BASE_DISPATCH_FEE_PER_TRIP_USD: float = 150.0  # Terminal loading, cooling & dispatch overhead
ROAD_FREIGHT_RATE_PER_KM_USD: float = 1.50   # Operating freight rate per vehicle-kilometer
TRANSIT_EMISSION_FACTOR_KG_PER_KM: float = 0.85  # Heavy-duty diesel cryo-tanker emissions (kg CO2e / km)
ROAD_CIRCUITY_FACTOR: float = 1.20           # Empirical road winding factor over great-circle distance
DEFAULT_FALLBACK_DISTANCE_KM: float = 150.0   # Standard regional fallback when text locations are unmapped
INTRA_CLUSTER_DISTANCE_KM: float = 15.0      # Local transit distance for identical facilities/hubs

# Coordinate directory for Gujarat and prominent Indian industrial hubs
KNOWN_LOCATIONS: Dict[str, Tuple[float, float]] = {
    "ahmedabad": (23.0225, 72.5714),
    "dahej": (21.7122, 72.5855),
    "surat": (21.1702, 72.8311),
    "hazira": (21.1118, 72.6517),
    "vadodara": (22.3072, 73.1812),
    "mundra": (22.8394, 69.7214),
    "bharuch": (21.7051, 72.9959),
    "jamnagar": (22.4707, 70.0577),
    "rajkot": (22.3039, 70.8022),
    "gandhidham": (23.0753, 70.1337),
    "ankleshwar": (21.6264, 73.0033),
    "mumbai": (19.0760, 72.8777),
    "pune": (18.5204, 73.8567),
    "delhi": (28.6139, 77.2090),
    "kolkata": (22.5726, 88.3639),
    "chennai": (13.0827, 80.2707),
    "jaipur": (26.9124, 75.7873),
    "nagpur": (21.1458, 79.0882),
}


class DistanceEstimator:
    """
    Dedicated service for resolving text locations into estimated road transit distances.
    Isolates geocoding, Haversine trigonometry, road circuity scaling, and safe fallback logic.
    """

    @staticmethod
    def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates great-circle distance in kilometers using the Haversine formula."""
        r_earth = 6371.0  # Earth's mean radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return r_earth * c

    @classmethod
    def estimate_distance(
        cls,
        pickup_location: Optional[str],
        delivery_location: Optional[str],
    ) -> Tuple[float, bool]:
        """
        Estimates highway distance between two text locations.
        Returns a tuple: (estimated_distance_km, is_fallback_distance).
        
        - If locations are identical: returns 15.0 km (intra-cluster transit).
        - If both resolve to known coordinate hubs: returns Haversine * 1.2 road circuity factor.
        - If either location cannot be resolved: returns safe fallback 150.0 km with is_fallback=True.
        """
        if not pickup_location or not delivery_location:
            return DEFAULT_FALLBACK_DISTANCE_KM, True

        clean_origin = pickup_location.strip().lower()
        clean_dest = delivery_location.strip().lower()

        if not clean_origin or not clean_dest:
            return DEFAULT_FALLBACK_DISTANCE_KM, True

        if clean_origin == clean_dest:
            return INTRA_CLUSTER_DISTANCE_KM, False

        coord_origin = None
        coord_dest = None

        for city, coords in KNOWN_LOCATIONS.items():
            if city in clean_origin:
                coord_origin = coords
                break

        for city, coords in KNOWN_LOCATIONS.items():
            if city in clean_dest:
                coord_dest = coords
                break

        if coord_origin and coord_dest:
            if coord_origin == coord_dest:
                return INTRA_CLUSTER_DISTANCE_KM, False
            gc_dist = cls.haversine_km(
                coord_origin[0], coord_origin[1], coord_dest[0], coord_dest[1]
            )
            road_dist = round(gc_dist * ROAD_CIRCUITY_FACTOR, 1)
            return max(5.0, road_dist), False

        logger.info(
            "Could not resolve exact coordinates for '%s' -> '%s'. Using regional fallback.",
            pickup_location,
            delivery_location,
        )
        return DEFAULT_FALLBACK_DISTANCE_KM, True


class LogisticsService:
    """
    Transparent rule-based logistics and landed cost estimation service for CarbonLoop.
    Produces prototype estimations for transportation freight, commodity purchase costs,
    total landed costs, and road transit emissions.
    """

    def __init__(self, distance_estimator: Optional[DistanceEstimator] = None):
        self.distance_estimator = distance_estimator or DistanceEstimator()

    @staticmethod
    def calculate_trips(quantity_tonnes: float) -> int:
        """
        Determines the integer number of cryo-tanker truckloads required,
        assuming a standard 25-tonne payload capacity per vehicle.
        """
        if quantity_tonnes <= 0:
            raise ValueError(f"Quantity must be greater than 0, got {quantity_tonnes}")
        return math.ceil(quantity_tonnes / STANDARD_TANKER_PAYLOAD_TONNES)

    @classmethod
    def calculate_transport_cost(
        cls,
        distance_km: float,
        quantity_tonnes: float,
    ) -> Tuple[float, int]:
        """
        Calculates prototype transportation freight cost using the formula:
          trips = ceil(quantity / 25.0)
          freight_per_trip = $150 base fee + (distance_km * $1.50/km)
          total_transport_cost = trips * freight_per_trip
        """
        if distance_km < 0:
            raise ValueError(f"Distance cannot be negative, got {distance_km}")
        if quantity_tonnes <= 0:
            raise ValueError(f"Quantity must be greater than 0, got {quantity_tonnes}")

        trips = cls.calculate_trips(quantity_tonnes)
        freight_per_trip = BASE_DISPATCH_FEE_PER_TRIP_USD + (
            distance_km * ROAD_FREIGHT_RATE_PER_KM_USD
        )
        total_transport_cost = round(trips * freight_per_trip, 2)
        return total_transport_cost, trips

    @staticmethod
    def calculate_purchase_cost(
        quantity_tonnes: float,
        price_per_tonne: float,
    ) -> float:
        """
        Calculates base commodity cost:
          purchase_cost = quantity_tonnes * price_per_tonne
        """
        if quantity_tonnes <= 0:
            raise ValueError(f"Quantity must be greater than 0, got {quantity_tonnes}")
        if price_per_tonne < 0:
            raise ValueError(f"Price per tonne cannot be negative, got {price_per_tonne}")

        return round(quantity_tonnes * price_per_tonne, 2)

    @staticmethod
    def calculate_transit_emissions(
        distance_km: float,
        trips: int,
    ) -> float:
        """
        Calculates estimated transportation greenhouse gas emissions:
          emissions = trips * distance_km * 0.85 kg CO2e/km
        """
        if distance_km < 0:
            raise ValueError(f"Distance cannot be negative, got {distance_km}")
        if trips <= 0:
            raise ValueError(f"Trips must be at least 1, got {trips}")

        return round(trips * distance_km * TRANSIT_EMISSION_FACTOR_KG_PER_KM, 2)

    def estimate_logistics(
        self,
        pickup_location: str,
        delivery_location: str,
        quantity_tonnes: float,
        price_per_tonne: float,
    ) -> LogisticsEstimateResponse:
        """
        Computes a complete landed logistics and cost estimation report.
        """
        if quantity_tonnes <= 0:
            raise ValueError(f"Quantity must be greater than 0, got {quantity_tonnes}")
        if price_per_tonne < 0:
            raise ValueError(f"Price per tonne cannot be negative, got {price_per_tonne}")

        distance_km, is_fallback = self.distance_estimator.estimate_distance(
            pickup_location, delivery_location
        )

        transport_cost, trips = self.calculate_transport_cost(distance_km, quantity_tonnes)
        purchase_cost = self.calculate_purchase_cost(quantity_tonnes, price_per_tonne)
        total_cost = round(purchase_cost + transport_cost, 2)
        cost_per_tonne = round(total_cost / quantity_tonnes, 2)
        emissions_kg = self.calculate_transit_emissions(distance_km, trips)

        return LogisticsEstimateResponse(
            distance_km=distance_km,
            is_fallback_distance=is_fallback,
            quantity_tonnes=quantity_tonnes,
            price_per_tonne=price_per_tonne,
            trips_required=trips,
            co2_purchase_cost=purchase_cost,
            transport_estimated_cost=transport_cost,
            total_estimated_cost=total_cost,
            cost_per_tonne=cost_per_tonne,
            transit_emissions_kg=emissions_kg,
            disclaimer="Prototype estimate for planning purposes; not a binding commercial logistics quote.",
        )
