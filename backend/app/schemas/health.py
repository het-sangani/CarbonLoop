from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status indicator", examples=["ok"])
    service: str = Field(..., description="Name of the running service", examples=["CarbonLoop API"])
