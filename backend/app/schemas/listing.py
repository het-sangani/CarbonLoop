from datetime import datetime
from typing import Optional, Set
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict

# Standard lifecycle statuses for CO2 supply listings
ALLOWED_STATUSES: Set[str] = {
    "active",
    "in-negotiation",
    "fulfilled",
    "closed",
    "pending",
}


class ListingBase(BaseModel):
    quantity: float = Field(..., gt=0, description="Quantity of CO2 in metric tonnes (must be > 0)")
    purity: float = Field(..., ge=0, le=100, description="CO2 purity percentage (0 to 100)")
    location: str = Field(..., min_length=1, description="Physical location or facility address")
    availability_start: Optional[datetime] = Field(None, description="Availability start timestamp")
    availability_end: Optional[datetime] = Field(None, description="Availability end timestamp")
    asking_price: float = Field(..., ge=0, description="Asking price per tonne (must be >= 0)")
    status: str = Field(default="active", description="Listing status convention (default: 'active')")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> str:
        if v is not None:
            normalized = v.strip().lower()
            if normalized not in ALLOWED_STATUSES:
                allowed_str = ", ".join(sorted(ALLOWED_STATUSES))
                raise ValueError(f"status must be one of: {allowed_str}")
            return normalized
        return "active"


class ListingCreate(ListingBase):
    seller_id: Optional[str] = Field(
        None,
        description="Optional seller identifier; isolated for upcoming Supabase Auth integration",
    )

    @model_validator(mode="after")
    def validate_availability_window(self) -> "ListingCreate":
        if self.availability_start and self.availability_end:
            if self.availability_start > self.availability_end:
                raise ValueError("availability_start must not be after availability_end")
        return self


class ListingUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0, description="Updated quantity (> 0)")
    purity: Optional[float] = Field(None, ge=0, le=100, description="Updated purity percentage (0-100)")
    location: Optional[str] = Field(None, min_length=1, description="Updated location")
    availability_start: Optional[datetime] = Field(None, description="Updated start timestamp")
    availability_end: Optional[datetime] = Field(None, description="Updated end timestamp")
    asking_price: Optional[float] = Field(None, ge=0, description="Updated asking price (>= 0)")
    status: Optional[str] = Field(None, description="Updated listing status")
    seller_id: Optional[str] = Field(None, description="Updated seller identifier")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            normalized = v.strip().lower()
            if normalized not in ALLOWED_STATUSES:
                allowed_str = ", ".join(sorted(ALLOWED_STATUSES))
                raise ValueError(f"status must be one of: {allowed_str}")
            return normalized
        return v

    @model_validator(mode="after")
    def validate_availability_window(self) -> "ListingUpdate":
        if self.availability_start and self.availability_end:
            if self.availability_start > self.availability_end:
                raise ValueError("availability_start must not be after availability_end")
        return self


class ListingResponse(BaseModel):
    id: str = Field(..., description="Unique listing identifier")
    seller_id: Optional[str] = Field(None, description="Seller profile or auth identifier")
    quantity: float = Field(..., description="Quantity in metric tonnes")
    purity: float = Field(..., description="CO2 purity percentage")
    location: str = Field(..., description="Facility or supply location")
    availability_start: Optional[datetime] = Field(None, description="Availability start timestamp")
    availability_end: Optional[datetime] = Field(None, description="Availability end timestamp")
    asking_price: float = Field(..., description="Asking price per tonne")
    status: str = Field(..., description="Listing status")
    created_at: Optional[datetime] = Field(None, description="Listing creation timestamp")

    model_config = ConfigDict(from_attributes=True)
