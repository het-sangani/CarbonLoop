from fastapi import APIRouter, Depends, status
from app.schemas.auth import AuthenticatedUser
from app.api.deps import get_current_user

router = APIRouter()


@router.get(
    "/me",
    response_model=AuthenticatedUser,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user and profile",
)
def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """
    Returns the authenticated user details along with their profile and role.
    Requires a valid Supabase Auth Bearer token.
    """
    return current_user
