import logging
from typing import Any, Dict, Optional
from supabase import Client
from app.core.supabase import get_supabase_client
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole

logger = logging.getLogger(__name__)

PROFILES_TABLE = "profiles"


class AuthService:
    """
    Service layer handling Supabase Auth token validation and profile resolution.
    Strictly uses Supabase Auth as the source of truth without custom password management.
    """

    def __init__(self, client: Optional[Client] = None):
        self._client = client

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    def get_user_from_token(self, token: str) -> Optional[Any]:
        """
        Validates the JWT token against the Supabase Auth server.
        Returns the Supabase User object if valid, None if invalid or expired.
        """
        try:
            # client.auth.get_user verifies the JWT against Supabase Auth service
            response = self.client.auth.get_user(token)
            if response and response.user:
                return response.user
            return None
        except Exception as exc:
            logger.warning("Supabase token validation failed: %s", exc)
            return None

    def get_profile_by_id(self, user_id: str) -> Optional[ProfileResponse]:
        """
        Retrieves the profile corresponding to the Supabase auth user ID
        from the `profiles` table.
        """
        try:
            response = (
                self.client.table(PROFILES_TABLE)
                .select("*")
                .eq("id", user_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return ProfileResponse(**response.data[0])
            return None
        except Exception as exc:
            logger.error("Error retrieving profile for user %s: %s", user_id, exc)
            return None

    def get_authenticated_user(self, token: str) -> Optional[AuthenticatedUser]:
        """
        Validates the token, extracts the authenticated user ID and email,
        and links the associated profile and role.
        """
        user = self.get_user_from_token(token)
        if not user:
            return None

        user_id = str(user.id)
        email = getattr(user, "email", None)
        profile = self.get_profile_by_id(user_id)

        role = profile.role if profile else None

        return AuthenticatedUser(
            id=user_id,
            email=email,
            profile=profile,
            role=role,
        )
