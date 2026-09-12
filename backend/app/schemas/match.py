from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.listing import ListingResponse
from app.schemas.logistics import LogisticsEstimateResponse


class MatchBreakdown(BaseModel):
    """Sub-scores and metrics calculated for a listing-requirement pairing."""
    purity_score: float
    quantity_score: float
    location_score: float
    availability_score: float
    price_score: float
    distance_km: Optional[float] = None
    match_score: float

    model_config = ConfigDict(from_attributes=True)


class MatchItemResponse(BaseModel):
    """Ranked match item including listing details, scores, logistics, and human-readable explanation."""
    id: Optional[str] = None
    listing_id: str
    requirement_id: str
    listing: ListingResponse
    match_score: float
    purity_score: float
    quantity_score: float
    location_score: float
    availability_score: float
    price_score: float
    distance_km: Optional[float] = None
    explanation: str
    logistics: Optional[LogisticsEstimateResponse] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MatchListResponse(BaseModel):
    """Response envelope for requirement matches."""
    requirement_id: str
    total_matches: int
    matches: List[MatchItemResponse]

    model_config = ConfigDict(from_attributes=True)
