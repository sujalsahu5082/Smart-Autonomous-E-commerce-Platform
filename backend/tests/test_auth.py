async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


async def test_register_login_me(client):
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "secret123",
        "phone": "9876543210",
    }
    resp = await client.post("/api/auth/register", json=payload)
    assert resp.status_code == 201
    body = resp.json()
    assert body["access_token"]
    assert body["user"]["email"] == "test@example.com"

    token = body["access_token"]
    resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test User"

    resp = await client.post("/api/auth/login", json={"email": "test@example.com", "password": "secret123"})
    assert resp.status_code == 200
    assert resp.json()["access_token"]

    resp = await client.post("/api/auth/login", json={"email": "test@example.com", "password": "wrong"})
    assert resp.status_code == 401


async def test_register_duplicate_email(client):
    payload = {
        "name": "User A",
        "email": "dup@example.com",
        "password": "secret123",
        "phone": "1111111111",
    }
    assert (await client.post("/api/auth/register", json=payload)).status_code == 201
    resp = await client.post("/api/auth/register", json=payload)
    assert resp.status_code == 400


async def test_me_requires_token(client):
    resp = await client.get("/api/auth/me")
    assert resp.status_code == 401


async def test_update_me(client):
    resp = await client.post(
        "/api/auth/register",
        json={"name": "User A", "email": "u@example.com", "password": "secret123", "phone": "1112223333"},
    )
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.put("/api/auth/me", json={"name": "Renamed", "address": "Street 1"}, headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Renamed"
    assert body["address"] == "Street 1"

    resp = await client.put(
        "/api/auth/me", json={"email": "u@example.com"}, headers=headers
    )
    assert resp.status_code == 200

    await client.post(
        "/api/auth/register",
        json={"name": "Other", "email": "other@example.com", "password": "secret123", "phone": "4445556666"},
    )
    resp = await client.put("/api/auth/me", json={"email": "other@example.com"}, headers=headers)
    assert resp.status_code == 400
