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


async def test_discovery_chat_session_and_coupons(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/categories", json={"name": "Electronics"}, headers=auth)
    await client.post("/api/admin/coupons", json={"code": "TEST10", "discount_type": "percent", "discount_value": 10}, headers=auth)
    await client.post(
        "/api/products",
        json={"name": "Gaming Laptop", "description": "High performance laptop", "price": 1000, "quantity": 5, "cid": 1},
        headers=auth,
    )

    resp = await client.post(
        "/api/discovery/chat",
        json={"message": "laptop", "session_id": "sess-1", "cart_context": {"items": [{"name": "Gaming Laptop"}]}},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["mode"] == "fallback"
    assert body["coupons"] and body["coupons"][0]["code"] == "TEST10"

    # second message in the same session works and history is stored
    resp2 = await client.post("/api/discovery/chat", json={"message": "show me cheap ones", "session_id": "sess-1"})
    assert resp2.status_code == 200
    assert resp2.json()["mode"] == "fallback"
