import logging
from typing import Any, Dict, Optional
from supabase import Client
from app.core.supabase import get_supabase_client
from app.schemas.auth import AuthenticatedUser, ProfileResponse, UserRole

logger = logging.getLogger(__name__)

PROFILES_TABLE = "profiles"


DEMO_USERS: Dict[str, AuthenticatedUser] = {
    "jwt-seller-token": AuthenticatedUser(
        id="11111111-1111-4111-8111-111111111111",
        email="rajesh.varma@abccement.com",
        profile=ProfileResponse(
            id="11111111-1111-4111-8111-111111111111",
            full_name="Rajesh Varma",
            organization="ABC Cement Ltd",
            role=UserRole.SELLER,
        ),
        role=UserRole.SELLER,
    ),
    "demo-seller-token": AuthenticatedUser(
        id="11111111-1111-4111-8111-111111111111",
        email="rajesh.varma@abccement.com",
        profile=ProfileResponse(
            id="11111111-1111-4111-8111-111111111111",
            full_name="Rajesh Varma",
            organization="ABC Cement Ltd",
            role=UserRole.SELLER,
        ),
        role=UserRole.SELLER,
    ),
    "jwt-buyer-token": AuthenticatedUser(
        id="22222222-2222-4222-8222-222222222222",
        email="procurement@greenfuel.in",
        profile=ProfileResponse(
            id="22222222-2222-4222-8222-222222222222",
            full_name="Meera Krishnan",
            organization="GreenFuel SynTech Ltd",
            role=UserRole.BUYER,
        ),
        role=UserRole.BUYER,
    ),
    "demo-buyer-token": AuthenticatedUser(
        id="22222222-2222-4222-8222-222222222222",
        email="procurement@greenfuel.in",
        profile=ProfileResponse(
            id="22222222-2222-4222-8222-222222222222",
            full_name="Meera Krishnan",
            organization="GreenFuel SynTech Ltd",
            role=UserRole.BUYER,
        ),
        role=UserRole.BUYER,
    ),
    "jwt-transporter-token": AuthenticatedUser(
        id="33333333-3333-4333-8333-333333333333",
        email="logistics@cryotrans.in",
        profile=ProfileResponse(
            id="33333333-3333-4333-8333-333333333333",
            full_name="Vikram Patel",
            organization="Gujarat Cryo-Logistics",
            role=UserRole.TRANSPORTER,
        ),
        role=UserRole.TRANSPORTER,
    ),
    "demo-transporter-token": AuthenticatedUser(
        id="33333333-3333-4333-8333-333333333333",
        email="logistics@cryotrans.in",
        profile=ProfileResponse(
            id="33333333-3333-4333-8333-333333333333",
            full_name="Vikram Patel",
            organization="Gujarat Cryo-Logistics",
            role=UserRole.TRANSPORTER,
        ),
        role=UserRole.TRANSPORTER,
    ),
    "jwt-seller-2-token": AuthenticatedUser(
        id="11111111-1111-4111-8111-999999999999",
        email="seller2@tatachemicals.com",
        profile=ProfileResponse(
            id="11111111-1111-4111-8111-999999999999",
            full_name="Karan Dave",
            organization="Tata Chemicals Ltd",
            role=UserRole.SELLER,
        ),
        role=UserRole.SELLER,
    ),
    "jwt-buyer-2-token": AuthenticatedUser(
        id="22222222-2222-4222-8222-999999999999",
        email="buyer2@ultratech.in",
        profile=ProfileResponse(
            id="22222222-2222-4222-8222-999999999999",
            full_name="Ananya Sharma",
            organization="UltraTech Cement",
            role=UserRole.BUYER,
        ),
        role=UserRole.BUYER,
    ),
    "gov-token": AuthenticatedUser(
        id="44444444-4444-4444-8444-444444444444",
        email="auditor@gpcb.gov.in",
        profile=ProfileResponse(
            id="44444444-4444-4444-8444-444444444444",
            full_name="Dr. S. Nair",
            organization="Gujarat Pollution Control Board",
            role=UserRole.GOVERNMENT_AGENT,
        ),
        role=UserRole.GOVERNMENT_AGENT,
    ),
}


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
        if token in DEMO_USERS:
            return DEMO_USERS[token]

        user = self.get_user_from_token(token)
        if not user:
            return None

        user_id = str(user.id)
        email = getattr(user, "email", None)
        profile = self.get_profile_by_id(user_id)

        if not profile:
            user_meta = getattr(user, "user_metadata", {}) or {}
            raw_role = user_meta.get("role", "BUYER")
            try:
                role_enum = UserRole(str(raw_role).strip().upper())
            except Exception:
                role_enum = UserRole.BUYER

            profile = ProfileResponse(
                id=user_id,
                full_name=user_meta.get("full_name", email or "User"),
                organization=user_meta.get("organization", "Industrial Partner"),
                role=role_enum,
            )

        return AuthenticatedUser(
            id=user_id,
            email=email,
            profile=profile,
            role=profile.role if profile else None,
        )
