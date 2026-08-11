from fastapi.testclient import TestClient

from tests.conftest import TEST_EMAIL, TEST_USER_ID, auth_header, make_token


def test_me_no_token(client: TestClient) -> None:
    response = client.get("/api/v1/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Unauthorized"


def test_me_invalid_token(client: TestClient) -> None:
    response = client.get(
        "/api/v1/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Unauthorized"


def test_me_expired_token(client: TestClient) -> None:
    token = make_token(expired=True)
    response = client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Unauthorized"


def test_me_valid_token(client: TestClient) -> None:
    response = client.get("/api/v1/me", headers=auth_header())
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == TEST_USER_ID
    assert body["email"] == TEST_EMAIL


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cors_preflight(client: TestClient) -> None:
    response = client.options(
        "/api/v1/me",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )
    assert response.status_code in {200, 204}
    assert (
        response.headers.get("access-control-allow-origin")
        == "http://localhost:3000"
    )
