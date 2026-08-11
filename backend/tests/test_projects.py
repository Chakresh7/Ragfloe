from fastapi.testclient import TestClient

from tests.conftest import TEST_USER_B_ID, auth_header, make_token


def _create_org(client: TestClient) -> str:
    response = client.post(
        "/api/v1/organizations",
        headers=auth_header(),
        json={"name": "Build Org"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_project_crud(client: TestClient) -> None:
    org_id = _create_org(client)

    created = client.post(
        f"/api/v1/organizations/{org_id}/projects",
        headers=auth_header(),
        json={
            "name": "Legal AI",
            "description": "Contract Q&A",
            "status": "active",
        },
    )
    assert created.status_code == 201
    project = created.json()
    assert project["name"] == "Legal AI"
    assert project["organization_id"] == org_id
    assert project["slug"]

    listed = client.get(
        f"/api/v1/organizations/{org_id}/projects",
        headers=auth_header(),
    )
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = client.get(
        f"/api/v1/projects/{project['id']}",
        headers=auth_header(),
    )
    assert fetched.status_code == 200
    assert fetched.json()["id"] == project["id"]

    updated = client.patch(
        f"/api/v1/projects/{project['id']}",
        headers=auth_header(),
        json={"status": "paused"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "paused"

    deleted = client.delete(
        f"/api/v1/projects/{project['id']}",
        headers=auth_header(),
    )
    assert deleted.status_code == 204


def test_project_cross_org_denied(client: TestClient) -> None:
    org_id = _create_org(client)
    created = client.post(
        f"/api/v1/organizations/{org_id}/projects",
        headers=auth_header(),
        json={"name": "Secret"},
    )
    project_id = created.json()["id"]

    denied = client.get(
        f"/api/v1/projects/{project_id}",
        headers=auth_header(make_token(sub=TEST_USER_B_ID, email="other@example.com")),
    )
    assert denied.status_code == 403
