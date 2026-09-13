from enum import Enum
from typing import Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


class TransportJobStatus(str, Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"


class TransportJobCreate(BaseModel):
    """Schema for creating a transport job from an accepted supply request."""
    request_id: str = Field(..., min_length=1, description="ID of the accepted request")
    transporter_id: Optional[str] = Field(None, description="Optional ID of the assigned transporter")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "request_id": "c4d80a12-6eb9-4da2-a1dc-7e8f60711f23",
                "transporter_id": "e5f91b23-7fc0-5eb3-b2ed-8f9071822a34",
            }
        }
    )


class TransportJobAssign(BaseModel):
    """Schema for assigning a transporter to a transport job."""
    transporter_id: Optional[str] = Field(None, description="Transporter ID (auto-bound to current user if omitted)")


class TransportJobStatusUpdate(BaseModel):
    """Schema for updating transport job delivery status."""
    status: TransportJobStatus = Field(..., description="Target status in delivery lifecycle")

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v: Union[str, TransportJobStatus]) -> TransportJobStatus:
        if isinstance(v, TransportJobStatus):
            return v
        if isinstance(v, str):
            clean = v.strip().upper().replace(" ", "_")
            try:
                return TransportJobStatus(clean)
            except ValueError:
                pass
        raise ValueError(f"Invalid transport status '{v}'. Allowed: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED")


class TransportJobResponse(BaseModel):
    """Schema for transport job response."""
    id: str = Field(..., description="Unique transport job ID")
    request_id: str = Field(..., description="ID of linked supply request")
    transporter_id: Optional[str] = Field(None, description="Assigned transporter profile ID")
    pickup_location: str = Field(..., description="Origin facility location from listing")
    delivery_location: str = Field(..., description="Destination facility location from requirement")
    distance_km: float = Field(..., description="Road transit distance in km")
    estimated_cost: float = Field(..., description="Estimated freight cost in USD")
    status: str = Field(..., description="Lifecycle status: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED")
    created_at: Optional[Union[str, datetime]] = Field(None, description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)
