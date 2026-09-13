from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class UserRole(str, Enum):
    """
    Database user roles corresponding to the Supabase user_role PostgreSQL enum:
    - BUYER
    - SELLER
    - TRANSPORTER
    - GOVERNMENT_AGENT
    """
    BUYER = "BUYER"
    SELLER = "SELLER"
    TRANSPORTER = "TRANSPORTER"
    GOVERNMENT_AGENT = "GOVERNMENT_AGENT"


class ProfileBase(BaseModel):
    """Base fields for user profile."""
    full_name: Optional[str] = None
    organization: Optional[str] = None
    role: UserRole

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value):
        if isinstance(value, str):
            return value.strip().upper()
        return value


class ProfileResponse(ProfileBase):
    """Representation of the user's profile from the `profiles` table."""
    id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AuthenticatedUser(BaseModel):
    """
    Represents an authenticated Supabase user with their resolved profile and role.
    """
    id: str
    email: Optional[str] = None
    profile: Optional[ProfileResponse] = None
    role: Optional[UserRole] = None

    model_config = ConfigDict(from_attributes=True)
