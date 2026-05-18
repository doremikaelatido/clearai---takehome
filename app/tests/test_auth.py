def test_register_and_login(client):
    payload = {"email": "user@example.com", "password": "SecretPass123"}

    register_response = client.post("/api/auth/register", json=payload)
    assert register_response.status_code == 200
    assert register_response.json()["token_type"] == "bearer"
    assert "access_token" in register_response.json()

    login_response = client.post("/api/auth/login", json=payload)
    assert login_response.status_code == 200
    assert login_response.json()["token_type"] == "bearer"

    duplicate_response = client.post("/api/auth/register", json=payload)
    assert duplicate_response.status_code == 400
