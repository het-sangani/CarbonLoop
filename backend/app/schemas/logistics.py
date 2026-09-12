from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class LogisticsEstimateRequest(BaseModel):
    """Request model for standalone logistics and cost estimation."""
    pickup_location: str = Field(..., min_length=1, description="Origin/supplier facility location")
    delivery_location: str = Field(..., min_length=1, description="Destination/buyer facility location")
    quantity_tonnes: float = Field(..., gt=0, description="Volume of CO2 in metric tonnes (must be > 0)")
    price_per_tonne: float = Field(..., ge=0, description="Base purchase price per metric tonne (must be >= 0)")

    @field_validator("pickup_location", "delivery_location")
    @classmethod
    def validate_non_empty_location(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Location cannot be empty or blank")
        return v.strip()

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "pickup_location": "Dahej, Gujarat",
                "delivery_location": "Hazira, Gujarat",
                "quantity_tonnes": 300.0,
                "price_per_tonne": 42.0,
            }
        }
    )


class LogisticsEstimateResponse(BaseModel):
    """Transparent prototype cost, logistics, and transit emissions estimate."""
    distance_km: float = Field(..., description="Estimated road transit distance in kilometers")
    is_fallback_distance: bool = Field(False, description="True if distance was approximated via regional fallback")
    quantity_tonnes: float = Field(..., description="CO2 quantity in metric tonnes")
    price_per_tonne: float = Field(..., description="CO2 price per metric tonne ($/t)")
    trips_required: int = Field(..., description="Number of cryogenic tanker trips required (25t payload/trip)")
    co2_purchase_cost: float = Field(..., description="Base commodity cost (Quantity * Price)")
    transport_estimated_cost: float = Field(..., description="Estimated freight cost for cryo-road transit")
    total_estimated_cost: float = Field(..., description="Total estimated landed cost (Purchase + Transport)")
    cost_per_tonne: float = Field(..., description="Effective landed cost per tonne")
    transit_emissions_kg: float = Field(..., description="Estimated well-to-wheel transport emissions in kg CO2e")
    disclaimer: str = Field(
        "Prototype estimate for planning purposes; not a binding commercial logistics quote.",
        description="Disclaimer note on prototype estimation",
    )

    model_config = ConfigDict(from_attributes=True)
