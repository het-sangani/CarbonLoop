from enum import Enum
from typing import Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


class RequestStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class RequestCreate(BaseModel):
    """Schema for a buyer creating a supply request from a matched listing."""
    match_id: str = Field(..., min_length=1, description="ID of the match recommendation")
    quantity: float = Field(..., gt=0, description="Volume requested in metric tonnes (must be > 0)")
    offered_price: float = Field(..., ge=0, description="Offered purchase price per metric tonne (must be >= 0)")
    seller_id: Optional[str] = Field(None, description="Optional seller ID (auto-resolved from matched listing if omitted)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "match_id": "b3c79a95-5fa8-4cb1-b0db-6e7e59600e12",
                "quantity": 250.0,
                "offered_price": 42.0,
            }
        }
    )


class RequestStatusUpdate(BaseModel):
    """Schema for a seller updating request status (accept or reject)."""
    status: RequestStatus = Field(..., description="Target status: ACCEPTED or REJECTED")

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v: Union[str, RequestStatus]) -> RequestStatus:
        if isinstance(v, RequestStatus):
            val = v.value
        elif isinstance(v, str):
            val = v.strip().upper()
            # Normalize common synonyms
            if val in ("ACCEPT", "ACCEPTED"):
                return RequestStatus.ACCEPTED
            if val in ("REJECT", "REJECTED", "DECLINE", "DECLINED"):
                return RequestStatus.REJECTED
        else:
            raise ValueError(f"Invalid status value: {v}")

        try:
            status_enum = RequestStatus(val)
        except ValueError:
            raise ValueError(f"Status must be ACCEPTED or REJECTED, got '{v}'")

        if status_enum not in (RequestStatus.ACCEPTED, RequestStatus.REJECTED):
            raise ValueError("Status update must transition to either ACCEPTED or REJECTED")

        return status_enum


class RequestResponse(BaseModel):
    """Schema for supply request response."""
    id: str = Field(..., description="Unique request identifier")
    match_id: str = Field(..., description="Referenced match ID")
    buyer_id: str = Field(..., description="ID of buyer who submitted the request")
    seller_id: str = Field(..., description="ID of seller to whom request was directed")
    quantity: float = Field(..., description="Requested volume in metric tonnes")
    offered_price: float = Field(..., description="Offered price per metric tonne")
    status: str = Field(..., description="Current status of the request (PENDING, ACCEPTED, REJECTED)")
    created_at: Optional[Union[str, datetime]] = Field(None, description="Timestamp of request creation")

    model_config = ConfigDict(from_attributes=True)
