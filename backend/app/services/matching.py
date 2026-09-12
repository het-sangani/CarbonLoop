import logging
import math
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from supabase import Client

from app.core.supabase import get_supabase_client
from app.schemas.listing import ListingResponse

logger = logging.getLogger(__name__)

MATCHES_TABLE = "matches"
LISTINGS_TABLE = "co2_listings"
REQUIREMENTS_TABLE = "requirements"
_LOCAL_MATCHES: Dict[str, Dict[str, Any]] = {}

# Coordinate directory for Gujarat and prominent Indian industrial zones
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


def calculate_distance_km(loc_a: Optional[str], loc_b: Optional[str]) -> float:
    """
    Calculates estimated road/transit distance between two locations.
    Uses Haversine formula when locations map to known industrial coordinates,
    falling back to standardized regional estimates.
    """
    if not loc_a or not loc_b:
        return 120.0

    clean_a = loc_a.strip().lower()
    clean_b = loc_b.strip().lower()

    if clean_a == clean_b:
        return 15.0  # Local intra-cluster transit

    coord_a = None
    coord_b = None

    for city, coords in KNOWN_LOCATIONS.items():
        if city in clean_a:
            coord_a = coords
            break

    for city, coords in KNOWN_LOCATIONS.items():
        if city in clean_b:
            coord_b = coords
            break

    if coord_a and coord_b:
        lat1, lon1 = coord_a
        lat2, lon2 = coord_b
        r_earth = 6371.0  # km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(r_earth * c, 1)

    return 180.0  # Default inter-city transit distance


def parse_datetime_safe(dt_val: Any) -> Optional[datetime]:
    """Safely converts ISO strings or datetimes to timezone-aware UTC datetime."""
    if dt_val is None:
        return None
    if isinstance(dt_val, datetime):
        if dt_val.tzinfo is None:
            return dt_val.replace(tzinfo=timezone.utc)
        return dt_val
    if isinstance(dt_val, str):
        try:
            cleaned = dt_val.replace("Z", "+00:00")
            parsed = datetime.fromisoformat(cleaned)
            if parsed.tzinfo is None:
                return parsed.replace(tzinfo=timezone.utc)
            return parsed
        except Exception:
            return None
    return None


class MatchingService:
    """
    Transparent, deterministic rule-based matchmaking engine.
    
    Architecture:
    1. Chemical Assay & Purity Fit: 40%
    2. Logistical Distance & Proximity Fit: 30%
    3. Volume Off-Take & Capacity Fit: 30%
    
    Additional compatibility factors:
    - Availability timing alignment
    - Budget / pricing tolerance
    """

    def __init__(self, client: Optional[Client] = None):
        self._client = client

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    @staticmethod
    def calculate_scores(
        listing: Dict[str, Any],
        requirement: Dict[str, Any],
    ) -> Tuple[Dict[str, float], float, str]:
        """
        Calculates sub-scores (0-100), composite match_score (0-100),
        and a human-readable explanation for a given listing & requirement pair.
        """
        # 1. Purity Score (40% weight component)
        min_purity = float(requirement.get("min_purity", 0.0))
        purity = float(listing.get("purity", 0.0))

        if purity < min_purity:
            purity_score = 0.0
        else:
            margin = purity - min_purity
            potential = max(1.0, 100.0 - min_purity)
            purity_score = min(100.0, 80.0 + 20.0 * (margin / potential))

        # 2. Volume Score (30% weight component)
        req_qty = float(requirement.get("required_quantity", 1.0))
        supply_qty = float(listing.get("quantity", 0.0))

        if req_qty <= 0:
            quantity_score = 100.0
        elif supply_qty >= req_qty:
            surplus = min(1.0, (supply_qty - req_qty) / req_qty)
            quantity_score = min(100.0, 90.0 + 10.0 * surplus)
        else:
            ratio = supply_qty / req_qty
            if ratio < 0.25:
                quantity_score = round(ratio * 40.0, 2)
            else:
                quantity_score = round(ratio * 80.0, 2)

        # 3. Location / Distance Score (30% weight component)
        loc_listing = listing.get("location")
        loc_req = requirement.get("delivery_location")
        distance_km = calculate_distance_km(loc_listing, loc_req)

        if distance_km <= 50.0:
            location_score = 100.0
        elif distance_km <= 500.0:
            location_score = max(20.0, 100.0 - (distance_km - 50.0) * (75.0 / 450.0))
        else:
            location_score = max(5.0, 25.0 - (distance_km - 500.0) * (20.0 / 500.0))

        location_score = round(location_score, 2)

        # 4. Availability Score
        req_date = parse_datetime_safe(requirement.get("required_date"))
        avail_start = parse_datetime_safe(listing.get("availability_start"))
        avail_end = parse_datetime_safe(listing.get("availability_end"))

        if req_date and (avail_start or avail_end):
            if avail_start and avail_end:
                if avail_start <= req_date <= avail_end:
                    availability_score = 100.0
                elif req_date < avail_start:
                    days_ahead = (avail_start - req_date).days
                    availability_score = max(10.0, 85.0 - days_ahead * 3.0)
                else:
                    days_expired = (req_date - avail_end).days
                    availability_score = max(0.0, 40.0 - days_expired * 8.0)
            elif avail_start:
                if req_date >= avail_start:
                    availability_score = 100.0
                else:
                    days_ahead = (avail_start - req_date).days
                    availability_score = max(15.0, 85.0 - days_ahead * 3.0)
            else:  # avail_end only
                if req_date <= avail_end:
                    availability_score = 100.0
                else:
                    days_expired = (req_date - avail_end).days
                    availability_score = max(0.0, 40.0 - days_expired * 8.0)
        else:
            availability_score = 100.0

        availability_score = round(availability_score, 2)

        # 5. Price Score
        max_budget = requirement.get("max_budget")
        asking_price = float(listing.get("asking_price") or 0.0)

        if max_budget is not None and float(max_budget) > 0.0:
            max_b = float(max_budget)
            if asking_price <= max_b:
                savings_ratio = (max_b - asking_price) / max_b
                price_score = min(100.0, 85.0 + 15.0 * savings_ratio)
            else:
                overage_ratio = (asking_price - max_b) / max_b
                price_score = max(0.0, 75.0 - overage_ratio * 150.0)
        else:
            price_score = 100.0

        price_score = round(price_score, 2)

        # 6. Composite Match Score
        # Core Architecture: 40% Purity + 30% Location + 30% Volume
        core_weighted = (
            (purity_score * 0.40)
            + (location_score * 0.30)
            + (quantity_score * 0.30)
        )

        if purity_score == 0.0:
            match_score = 0.0
        else:
            # Timing and price compatibility multipliers
            timing_factor = 0.5 + 0.5 * (availability_score / 100.0)
            price_factor = 0.5 + 0.5 * (price_score / 100.0)
            capacity_factor = 0.85 if (supply_qty < req_qty * 0.25) else 1.0
            composite = core_weighted * timing_factor * price_factor * capacity_factor
            match_score = round(min(100.0, max(0.0, composite)), 2)

        sub_scores = {
            "purity_score": round(purity_score, 2),
            "quantity_score": round(quantity_score, 2),
            "location_score": round(location_score, 2),
            "availability_score": round(availability_score, 2),
            "price_score": round(price_score, 2),
            "distance_km": distance_km,
        }

        # 7. Human-readable explanation points & composite summary
        points = []
        if purity >= min_purity:
            points.append(f"{purity:.1f}% CO₂ purity satisfies the buyer's {min_purity:.1f}% minimum requirement.")
        else:
            points.append(f"{purity:.1f}% CO₂ purity fails the buyer's {min_purity:.1f}% minimum requirement.")

        if supply_qty >= req_qty:
            points.append(f"The supplier can provide {supply_qty:.1f} tonnes against {req_qty:.1f} tonnes required.")
        else:
            points.append(f"{supply_qty:.1f} tonnes available provides partial capacity against {req_qty:.1f} tonnes required.")

        if distance_km > 0:
            points.append(f"Supplier is approximately {distance_km:g} km away via regional freight corridor.")
        else:
            points.append("Supplier facility located in the immediate industrial cluster.")

        if max_budget is not None and float(max_budget) > 0:
            max_b = float(max_budget)
            if asking_price <= max_b:
                points.append(f"Asking price of ${asking_price:g}/t is within the buyer's budget (${max_b:g}/t).")
            else:
                points.append(f"Asking price of ${asking_price:g}/t exceeds the buyer's target budget of ${max_b:g}/t.")
        else:
            points.append(f"Asking price is competitive at ${asking_price:g} / tonne.")

        if req_date and (avail_start or avail_end):
            if availability_score >= 70:
                points.append("Availability schedule overlaps the requested off-take timeline.")
            else:
                points.append("Availability schedule requires off-take alignment.")
        else:
            points.append("Continuous capture stream ready for immediate off-take.")

        explanation = " ".join(points)
        sub_scores["explanation_points"] = points

        return sub_scores, match_score, explanation


    def get_requirement_by_id(self, requirement_id: str) -> Optional[Dict[str, Any]]:
        """Fetch requirement from database or local store."""
        from app.services.requirement_service import _LOCAL_REQUIREMENTS
        if requirement_id in _LOCAL_REQUIREMENTS:
            return _LOCAL_REQUIREMENTS[requirement_id]
        try:
            res = (
                self.client.table(REQUIREMENTS_TABLE)
                .select("*")
                .eq("id", requirement_id)
                .execute()
            )
            if res.data and len(res.data) > 0:
                return res.data[0]
            return _LOCAL_REQUIREMENTS.get(requirement_id)
        except Exception as exc:
            logger.error("Error fetching requirement %s: %s", requirement_id, exc)
            return _LOCAL_REQUIREMENTS.get(requirement_id)

    def get_active_listings(self) -> List[Dict[str, Any]]:
        """Fetch available active listings for matching."""
        from app.services.listing_service import _LOCAL_LISTINGS
        try:
            res = (
                self.client.table(LISTINGS_TABLE)
                .select("*")
                .eq("status", "active")
                .execute()
            )
            db_records = res.data or []
            db_ids = {r["id"] for r in db_records}
            local_records = [
                r for r in _LOCAL_LISTINGS.values()
                if r["id"] not in db_ids and r.get("status", "active") == "active"
            ]
            return db_records + local_records
        except Exception as exc:
            logger.error("Error fetching active listings: %s", exc)
            return list(_LOCAL_LISTINGS.values())

    def find_matches(
        self,
        requirement_id: str,
        persist: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Executes matchmaking for a buyer requirement:
        1. Loads requirement
        2. Retrieves candidate listings
        3. Filters obviously incompatible listings (status != active, or purity < min_purity)
        4. Calculates transparent scores & explanations
        5. Persists matches in `matches` table
        6. Returns ranked matches (descending by match_score)
        """
        requirement = self.get_requirement_by_id(requirement_id)
        if not requirement:
            return []

        candidates = self.get_active_listings()
        min_purity = float(requirement.get("min_purity", 0.0))

        matches: List[Dict[str, Any]] = []
        to_persist: List[Dict[str, Any]] = []

        for listing in candidates:
            # Filter out obviously incompatible listings (e.g. chemical assay failure)
            purity = float(listing.get("purity", 0.0))
            if purity < min_purity:
                continue

            sub_scores, match_score, explanation = self.calculate_scores(listing, requirement)

            # Omit matches with 0 match score
            if match_score <= 0.0:
                continue

            # Calculate prototype logistics and landed cost estimate for this pairing
            logistics_est = None
            try:
                from app.services.logistics import LogisticsService
                req_qty_val = float(requirement.get("required_quantity") or 0.0)
                list_qty_val = float(listing.get("quantity") or 0.0)
                if req_qty_val > 0 and list_qty_val > 0:
                    qty_for_est = min(req_qty_val, list_qty_val)
                else:
                    qty_for_est = req_qty_val or list_qty_val or 100.0

                price_for_est = float(listing.get("asking_price") or 0.0)
                if qty_for_est > 0 and price_for_est >= 0:
                    logistics_service = LogisticsService()
                    logistics_est = logistics_service.estimate_logistics(
                        pickup_location=listing.get("location") or "",
                        delivery_location=requirement.get("delivery_location") or "",
                        quantity_tonnes=qty_for_est,
                        price_per_tonne=price_for_est,
                    )
            except Exception as log_exc:
                logger.debug("Could not compute logistics estimate for match: %s", log_exc)

            match_id = str(uuid.uuid4())
            match_record = {
                "id": match_id,
                "listing_id": listing["id"],
                "requirement_id": requirement_id,
                "listing": listing,
                "match_score": match_score,
                "purity_score": sub_scores["purity_score"],
                "quantity_score": sub_scores["quantity_score"],
                "location_score": sub_scores["location_score"],
                "availability_score": sub_scores["availability_score"],
                "price_score": sub_scores["price_score"],
                "distance_km": sub_scores["distance_km"],
                "explanation": explanation,
                "explanation_points": sub_scores.get("explanation_points", []),
                "logistics": logistics_est,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            matches.append(match_record)

            to_persist.append({
                "id": match_id,
                "listing_id": listing["id"],
                "requirement_id": requirement_id,
                "match_score": match_score,
                "purity_score": sub_scores["purity_score"],
                "quantity_score": sub_scores["quantity_score"],
                "location_score": sub_scores["location_score"],
                "availability_score": sub_scores["availability_score"],
                "price_score": sub_scores["price_score"],
                "created_at": match_record["created_at"],
            })

        # Sort matches by match_score descending
        matches.sort(key=lambda m: m["match_score"], reverse=True)

        # Cache matches locally
        for m in matches:
            if m.get("id"):
                _LOCAL_MATCHES[m["id"]] = m

        # Persist to database where appropriate
        if persist and to_persist:
            try:
                # Optionally delete previous matches for this requirement before inserting fresh ones
                self.client.table(MATCHES_TABLE).delete().eq("requirement_id", requirement_id).execute()
                insert_res = self.client.table(MATCHES_TABLE).insert(to_persist).execute()
                if insert_res.data:
                    for i, db_rec in enumerate(insert_res.data):
                        if i < len(matches) and db_rec.get("id"):
                            matches[i]["id"] = db_rec.get("id")
                            _LOCAL_MATCHES[db_rec["id"]] = matches[i]
            except Exception as exc:
                logger.warning("Could not persist matches to database: %s", exc)

        return matches
