from datetime import date, datetime
from enum import Enum
from typing import Any, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ListingStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    PENDING = "PENDING"
    SOLD = "SOLD"
    CANCELLED = "CANCELLED"
    ACTIVE = "ACTIVE"
    IN_NEGOTIATION = "IN_NEGOTIATION"
    FULFILLED = "FULFILLED"


class ListingBase(BaseModel):
    quantity: float = Field(
        ...,
        gt=0,
        description="Quantity of CO2 in metric tonnes, must be greater than 0",
        examples=[500.0]
    )
    purity: float = Field(
        ...,
        ge=0,
        le=100,
        description="Purity percentage between 0 and 100",
        examples=[96.0]
    )
    location: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Physical location or facility city/state",
        examples=["Ahmedabad, Gujarat"]
    )
    availability_start: Optional[date] = Field(
        None,
        description="Start date of CO2 availability",
        examples=["2026-10-01"]
    )
    availability_end: Optional[date] = Field(
        None,
        description="End date of CO2 availability",
        examples=["2026-12-31"]
    )
    asking_price: float = Field(
        ...,
        ge=0,
        description="Asking price per tonne, must be non-negative",
        examples=[42.0]
    )
    status: str = Field(
        default="AVAILABLE",
        description="Status of listing (e.g., AVAILABLE, PENDING, SOLD, ACTIVE)",
        examples=["AVAILABLE"]
    )

    @model_validator(mode="after")
    def validate_availability_dates(self) -> "ListingBase":
        if self.availability_start and self.availability_end:
            if self.availability_start > self.availability_end:
                raise ValueError("availability_start must not be after availability_end")
        return self


class ListingCreate(ListingBase):
    seller_id: Optional[str] = Field(
        None,
        description="Seller ID if provided explicitly; otherwise injected via auth dependency"
    )


class ListingUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0, description="Quantity in tonnes, must be > 0")
    purity: Optional[float] = Field(None, ge=0, le=100, description="Purity percentage between 0 and 100")
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    availability_start: Optional[date] = None
    availability_end: Optional[date] = None
    asking_price: Optional[float] = Field(None, ge=0, description="Asking price must be >= 0")
    status: Optional[str] = None

    @model_validator(mode="after")
    def validate_availability_dates(self) -> "ListingUpdate":
        if self.availability_start and self.availability_end:
            if self.availability_start > self.availability_end:
                raise ValueError("availability_start must not be after availability_end")
        return self


class ListingResponse(BaseModel):
    id: str = Field(..., description="Unique listing identifier")
    seller_id: Optional[str] = Field(None, description="Identifier of the selling organization")
    quantity: float
    purity: float
    location: str
    availability_start: Optional[Union[date, str]] = None
    availability_end: Optional[Union[date, str]] = None
    asking_price: float
    status: str
    created_at: Optional[Union[datetime, str]] = None

    model_config = ConfigDict(from_attributes=True)


class ListingListResponse(BaseModel):
    items: List[ListingResponse]
    total: int
