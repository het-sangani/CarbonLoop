from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """
    Test GET /api/health returns 200 OK and expected status JSON.
    """
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "CarbonLoop API"
    }


def test_root_endpoint():
    """
    Test GET / returns 200 OK and valid entry links.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["health"] == "/api/health"
    assert data["service"] if "service" in data else True
