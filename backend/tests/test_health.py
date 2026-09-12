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


def test_cors_allowed_for_frontend_port_8443():
    """
    Verify that cross-origin preflight and GET requests from frontend at http://localhost:8443
    are accepted and receive appropriate Access-Control-Allow-Origin headers.
    """
    origin = "http://localhost:8443"
    response = client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin

    get_response = client.get("/api/health", headers={"Origin": origin})
    assert get_response.status_code == 200
    assert get_response.headers.get("access-control-allow-origin") == origin

