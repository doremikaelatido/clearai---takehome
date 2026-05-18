import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, engine, SessionLocal


@pytest.fixture
def client():
    """Fixture to create test client with fresh database."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    # Clean up
    Base.metadata.drop_all(bind=engine)


def test_login_and_access(client):
    # Arrange - register a user
    register_resp = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    assert register_resp.status_code == 200
    token = register_resp.json()["access_token"]
    
    # Act - login with same credentials
    login_resp = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    
    # Assert - login should succeed
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()
