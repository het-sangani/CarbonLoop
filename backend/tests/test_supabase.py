import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.supabase import get_supabase_client, check_supabase_connection
from app.core.config import settings

client = TestClient(app)


def test_supabase_client_initialization():
    """
    Verify that get_supabase_client initializes a valid Supabase client instance.
    """
    sb_client = get_supabase_client()
    assert sb_client is not None
    assert hasattr(sb_client, "table")
    assert hasattr(sb_client, "auth")


def test_supabase_connection_probe():
    """
    Verify that check_supabase_connection successfully communicates with Supabase.
    """
    result = check_supabase_connection()
    assert result["connected"] is True
    assert result["database"] == "supabase"
    assert "co2_listings" in result.get("verified_table", "")


def test_database_health_endpoint():
    """
    Verify GET /api/health/db returns 200 OK and reports active connection.
    """
    response = client.get("/api/health/db")
    assert response.status_code == 200
    data = response.json()
    assert data["connected"] is True
    assert data["database"] == "supabase"
    assert "url" in data
