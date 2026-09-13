from datetime import datetime
from typing import Optional, Set
from pydantic import BaseModel, Field, field_validator, ConfigDict

# Standard lifecycle statuses for buyer requirements
REQUIREMENT_STATUSES: Set[str] = {
    "open",
    "evaluating",
    "contracted",
    "closed",
    "pending",
}


class RequirementBase(BaseModel):
    required_quantity: float = Field(
        ..., gt=0, description="Required CO2 quantity in metric tonnes (must be > 0)"
    )
    min_purity: float = Field(
        ..., ge=0, le=100, description="Minimum acceptable CO2 purity percentage (0 to 100)"
    )
    delivery_location: str = Field(
        ..., min_length=1, description="Delivery location or facility address"
    )
    required_date: Optional[datetime] = Field(
        None, description="Date by which CO2 delivery is required"
    )
    max_budget: float = Field(
        ..., ge=0, description="Maximum budget per tonne in USD (must be >= 0)"
    )
    status: str = Field(
        default="open", description="Requirement status (default: 'open')"
    )

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> str:
        if v is not None:
            normalized = v.strip().lower()
            if normalized not in REQUIREMENT_STATUSES:
                allowed_str = ", ".join(sorted(REQUIREMENT_STATUSES))
                raise ValueError(f"status must be one of: {allowed_str}")
            return normalized
        return "open"


class RequirementCreate(RequirementBase):
    buyer_id: Optional[str] = Field(
        None,
        description="Optional buyer identifier; isolated for upcoming Supabase Auth integration",
    )


class RequirementUpdate(BaseModel):
    required_quantity: Optional[float] = Field(
        None, gt=0, description="Updated required quantity (> 0)"
    )
    min_purity: Optional[float] = Field(
        None, ge=0, le=100, description="Updated minimum purity (0-100)"
    )
    delivery_location: Optional[str] = Field(
        None, min_length=1, description="Updated delivery location"
    )
    required_date: Optional[datetime] = Field(
        None, description="Updated required date"
    )
    max_budget: Optional[float] = Field(
        None, ge=0, description="Updated max budget (>= 0)"
    )
    status: Optional[str] = Field(None, description="Updated requirement status")
    buyer_id: Optional[str] = Field(None, description="Updated buyer identifier")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            normalized = v.strip().lower()
            if normalized not in REQUIREMENT_STATUSES:
                allowed_str = ", ".join(sorted(REQUIREMENT_STATUSES))
                raise ValueError(f"status must be one of: {allowed_str}")
            return normalized
        return v


class RequirementResponse(BaseModel):
    id: str = Field(..., description="Unique requirement identifier")
    buyer_id: Optional[str] = Field(None, description="Buyer profile or auth identifier")
    required_quantity: float = Field(..., description="Required quantity in metric tonnes")
    min_purity: float = Field(..., description="Minimum CO2 purity percentage")
    delivery_location: str = Field(..., description="Delivery location")
    required_date: Optional[datetime] = Field(None, description="Required delivery date")
    max_budget: float = Field(..., description="Maximum budget per tonne")
    status: str = Field(..., description="Requirement status")
    created_at: Optional[datetime] = Field(None, description="Requirement creation timestamp")

    model_config = ConfigDict(from_attributes=True)
