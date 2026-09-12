from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status indicator", examples=["ok"])
    service: str = Field(..., description="Name of the running service", examples=["CarbonLoop API"])


class DatabaseHealthResponse(BaseModel):
    connected: bool = Field(..., description="Whether database connection is active", examples=[True])
    database: str = Field(..., description="Database identifier", examples=["supabase"])
    url: Optional[str] = Field(None, description="Supabase project URL")
    verified_table: Optional[str] = Field(None, description="Table verified during probe")
    message: str = Field(..., description="Human-readable connection message")
    error: Optional[str] = Field(None, description="Error message if connection failed")
