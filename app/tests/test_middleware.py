def test_json_validation_middleware_rejects_text_plain(client):
    response = client.post("/auth/login", data="not json", headers={"Content-Type": "text/plain"})
    assert response.status_code == 415


def test_edi_validation_middleware_rejects_invalid_payload(client):
    auth_response = client.post(
        "api/auth/register",
        json={"email": "middleware@example.com", "password": "Pass1234"},
    )
    token = auth_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    response = client.post("/api/edi/validate-edi", json={"edi": "BAD CONTENT"}, headers=headers)
    assert response.status_code == 422
