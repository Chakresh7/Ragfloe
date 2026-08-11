from fastapi.testclient import TestClient

from tests.conftest import TEST_USER_B_ID, TEST_USER_ID, auth_header, make_token


def test_create_and_list_organizations(client: TestClient) -> None:
    create = client.post(
        "/api/v1/organizations",
        headers=auth_header(),
        json={"name": "Acme AI", "plan": "pro"},
    )
    assert create.status_code == 201
    org = create.json()
    assert org["name"] == "Acme AI"
    assert org["plan"] == "pro"
    assert org["slug"]
    assert org["project_count"] == 0

    listed = client.get("/api/v1/organizations", headers=auth_header())
    assert listed.status_code == 200
    body = listed.json()
    assert len(body) == 1
    assert body[0]["id"] == org["id"]


def test_organization_isolation(client: TestClient) -> None:
    created = client.post(
        "/api/v1/organizations",
        headers=auth_header(),
        json={"name": "Private Org"},
    )
    assert created.status_code == 201
    org_id = created.json()["id"]

    other = client.get(
        f"/api/v1/organizations/{org_id}",
        headers=auth_header(make_token(sub=TEST_USER_B_ID, email="other@example.com")),
    )
    assert other.status_code == 403


def test_creator_is_owner_member(client: TestClient) -> None:
    created = client.post(
        "/api/v1/organizations",
        headers=auth_header(),
        json={"name": "Owner Org"},
    )
    org_id = created.json()["id"]

    members = client.get(
        f"/api/v1/organizations/{org_id}/members",
        headers=auth_header(),
    )
    assert members.status_code == 200
    body = members.json()
    assert len(body) == 1
    assert body[0]["user_id"] == TEST_USER_ID
    assert body[0]["role"] == "owner"


def test_unauthorized_org_list(client: TestClient) -> None:
    response = client.get("/api/v1/organizations")
    assert response.status_code == 401
