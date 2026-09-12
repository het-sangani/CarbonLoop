from typing import Optional
from fastapi import Header, Depends
from supabase import Client
from app.core.supabase import get_supabase_client


def get_current_seller_id(
    x_seller_id: Optional[str] = Header(
        None,
        alias="X-Seller-ID",
        description="Temporary interface for seller ID until Supabase Auth is implemented in a future step",
    )
) -> Optional[str]:
    """
    Temporary dependency for isolating the current seller's identity.

    IMPORTANT:
    Authentication is not yet implemented (Step 8). This interface cleanly
    separates seller identity acquisition so that when Supabase Auth is integrated
    in the authentication step, this dependency can be replaced with JWT token
    extraction and validation (returning `auth.uid()`) without altering any
    downstream route or service logic.
    """
    return x_seller_id


def get_supabase() -> Client:
    """Dependency provider for the initialized Supabase client."""
    return get_supabase_client()


def get_listing_service(
    client: Client = Depends(get_supabase),
) -> "ListingService":
    """Dependency provider for ListingService instance."""
    from app.services.listing_service import ListingService
    return ListingService(client=client)
