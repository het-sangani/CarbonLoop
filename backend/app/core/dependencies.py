from typing import Optional
from fastapi import Header


def get_current_seller_id(
    x_seller_id: Optional[str] = Header(
        None,
        alias="X-Seller-ID",
        description="Temporary header to provide seller_id until Supabase Auth is integrated."
    )
) -> Optional[str]:
    """
    Temporary dependency for seller_id.
    Cleanly isolates the authentication interface so that in the subsequent
    Supabase Auth step, this dependency can be substituted with token verification
    (e.g., extracting user_id from Supabase JWT) without modifying business logic or routes.
    """
    return x_seller_id
