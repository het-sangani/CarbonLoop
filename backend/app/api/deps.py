from typing import List, Optional
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.core.supabase import get_supabase_client
from app.schemas.auth import AuthenticatedUser, UserRole

# Standard Bearer token extractor
security = HTTPBearer(auto_error=False)


def get_supabase() -> Client:
    """Dependency provider for the initialized Supabase client."""
    return get_supabase_client()


def get_auth_service(
    client: Client = Depends(get_supabase),
) -> "AuthService":
    """Dependency provider for AuthService instance."""
    from app.services.auth_service import AuthService
    return AuthService(client=client)


def get_listing_service(
    client: Client = Depends(get_supabase),
) -> "ListingService":
    """Dependency provider for ListingService instance."""
    from app.services.listing_service import ListingService
    return ListingService(client=client)


def get_requirement_service(
    client: Client = Depends(get_supabase),
) -> "RequirementService":
    """Dependency provider for RequirementService instance."""
    from app.services.requirement_service import RequirementService
    return RequirementService(client=client)


def get_matching_service(
    client: Client = Depends(get_supabase),
) -> "MatchingService":
    """Dependency provider for MatchingService instance."""
    from app.services.matching import MatchingService
    return MatchingService(client=client)


def get_distance_estimator() -> "DistanceEstimator":
    """Dependency provider for DistanceEstimator instance."""
    from app.services.logistics import DistanceEstimator
    return DistanceEstimator()


def get_logistics_service(
    distance_estimator: "DistanceEstimator" = Depends(get_distance_estimator),
) -> "LogisticsService":
    """Dependency provider for LogisticsService instance."""
    from app.services.logistics import LogisticsService
    return LogisticsService(distance_estimator=distance_estimator)


def get_request_service(
    client: Client = Depends(get_supabase),
) -> "RequestService":
    """Dependency provider for RequestService instance."""
    from app.services.request_service import RequestService
    return RequestService(client=client)


def get_transport_service(
    client: Client = Depends(get_supabase),
    logistics_service: "LogisticsService" = Depends(get_logistics_service),
) -> "TransportService":
    """Dependency provider for TransportService instance."""
    from app.services.transport_service import TransportService
    return TransportService(
        client=client,
        distance_estimator=logistics_service.distance_estimator,
        logistics_service=logistics_service,
    )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    auth_service: "AuthService" = Depends(get_auth_service),
) -> AuthenticatedUser:
    """
    FastAPI dependency that reads and validates the Supabase Auth access token
    from the HTTP Authorization header (Bearer <token>).
    
    Returns the authenticated user with their associated profile and role.
    Raises 401 Unauthorized if the token is missing, expired, or invalid.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = auth_service.get_authenticated_user(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or malformed authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


class RoleChecker:
    """
    Role-based access control dependency factory.
    Verifies that the authenticated user possesses one of the allowed roles.
    """

    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        current_user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        if not current_user.profile or not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User profile or role not configured in system",
            )

        if current_user.role not in self.allowed_roles:
            allowed_names = [r.value for r in self.allowed_roles]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{current_user.role.value}'. Allowed roles: {allowed_names}",
            )

        return current_user


# Role-specific dependency singletons
require_seller = RoleChecker([UserRole.SELLER])
require_buyer = RoleChecker([UserRole.BUYER])
require_transporter = RoleChecker([UserRole.TRANSPORTER])
require_government_agent = RoleChecker([UserRole.GOVERNMENT_AGENT])


def get_current_seller_id(
    x_seller_id: Optional[str] = Header(
        None,
        alias="X-Seller-ID",
        description="Legacy header fallback",
    )
) -> Optional[str]:
    """Legacy helper maintained for backward compatibility."""
    return x_seller_id


def get_current_buyer_id(
    x_buyer_id: Optional[str] = Header(
        None,
        alias="X-Buyer-ID",
        description="Legacy header fallback",
    )
) -> Optional[str]:
    """Legacy helper maintained for backward compatibility."""
    return x_buyer_id
