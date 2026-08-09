async def test_discovery_chat_fallback_mode(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/categories", json={"name": "Electronics"}, headers=auth)
    await client.post(
        "/api/products",
        json={"name": "Gaming Laptop", "description": "High performance laptop", "price": 1000, "quantity": 5, "cid": 1},
        headers=auth,
    )

    resp = await client.post("/api/discovery/chat", json={"message": "laptop"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["mode"] == "fallback"  # no GROQ_API_KEY in test env
    assert body["products"]
    assert body["products"][0]["name"] == "Gaming Laptop"
    assert "Gaming Laptop" in body["answer"]


async def test_discovery_chat_works_with_auth_and_without(client, admin_token):
    resp = await client.post("/api/discovery/chat", json={"message": "phones"})
    assert resp.status_code == 200

    reg = await client.post(
        "/api/auth/register",
        json={"name": "User", "email": "chat@example.com", "password": "secret123", "phone": "8888888888"},
    )
    token = reg.json()["access_token"]
    resp = await client.post(
        "/api/discovery/chat",
        json={"message": "phones"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["mode"] == "fallback"
