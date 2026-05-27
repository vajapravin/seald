from app.repositories.sites import _memory_repo
from tests.conftest import TEST_USER_ID

PAYLOAD = {
    "site": "github.com",
    "username": "dev@seald.app",
    "password": "Temp123!",
    "note": "work account",
    "backup_code": "A3F9-K2M7",
}


def test_list_empty(client):
    response = client.get("/api/v1/sites")
    assert response.status_code == 200
    assert response.json() == []


def test_create_and_get(client):
    created = client.post("/api/v1/sites", json=PAYLOAD).json()
    assert created["site"] == "github.com"
    fetched = client.get(f"/api/v1/sites/{created['id']}").json()
    assert fetched["password"] == "Temp123!"


def test_stored_secrets_are_encrypted(client):
    created = client.post("/api/v1/sites", json=PAYLOAD).json()
    stored = _memory_repo.get(created["id"], TEST_USER_ID)
    assert stored["password"] != "Temp123!"  # ciphertext at rest
    assert stored["backup_code"] != "A3F9-K2M7"
    assert created["password"] == "Temp123!"  # plaintext in API response


def test_update(client):
    site_id = client.post("/api/v1/sites", json=PAYLOAD).json()["id"]
    updated = client.put(
        f"/api/v1/sites/{site_id}", json={**PAYLOAD, "password": "NewPass456!"}
    ).json()
    assert updated["password"] == "NewPass456!"


def test_delete(client):
    site_id = client.post("/api/v1/sites", json=PAYLOAD).json()["id"]
    assert client.delete(f"/api/v1/sites/{site_id}").status_code == 204
    assert client.get(f"/api/v1/sites/{site_id}").status_code == 404


def test_get_unknown_id_returns_404(client):
    assert client.get("/api/v1/sites/nope").status_code == 404


def test_missing_required_field_returns_422(client):
    payload = {k: v for k, v in PAYLOAD.items() if k != "password"}
    assert client.post("/api/v1/sites", json=payload).status_code == 422
