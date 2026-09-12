from typing import Any, Dict, List, Optional
from functools import lru_cache
from supabase import create_client, Client
from app.core.config import settings

# Global client cache
_supabase_client: Optional[Client] = None

# Known tables defined in the schema
SCHEMA_TABLES: List[str] = [
    "profiles",
    "co2_listings",
    "requirements",
    "matches",
    "requests",
    "transport_jobs",
]


def get_supabase_client() -> Client:
    """
    Dependency / Provider that returns an initialized Supabase client.
    Reuses an existing client instance to optimize HTTP connection pooling.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError(
            "Supabase credentials are not configured. "
            "Please ensure SUPABASE_URL and SUPABASE_KEY are defined in your environment."
        )

    _supabase_client = create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_KEY,
    )
    return _supabase_client


def check_supabase_connection() -> Dict[str, Any]:
    """
    Diagnostic function to test connectivity to the Supabase PostgreSQL database
    by performing a lightweight read probe against schema tables.
    """
    try:
        client = get_supabase_client()
        verified_tables: List[str] = []

        # Probe the primary listings table with a lightweight query
        probe_result = client.table("co2_listings").select("id").limit(1).execute()
        verified_tables.append("co2_listings")

        return {
            "connected": True,
            "database": "supabase",
            "url": settings.SUPABASE_URL,
            "verified_table": "co2_listings",
            "message": "Successfully connected to Supabase database",
        }
    except Exception as exc:
        return {
            "connected": False,
            "database": "supabase",
            "url": settings.SUPABASE_URL,
            "error": str(exc),
            "message": f"Failed to connect to Supabase: {str(exc)}",
        }
