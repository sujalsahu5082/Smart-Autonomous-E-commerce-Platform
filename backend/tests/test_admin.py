async def test_admin_stats_and_users(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}

    resp = await client.get("/api/admin/stats")
    assert resp.status_code == 401
    resp = await client.get("/api/admin/stats", headers=auth)
    assert resp.status_code == 200
    body = resp.json()
    assert body["categories"] == 0
    assert body["admins"] == 1

    await client.post(
        "/api/auth/register",
        json={"name": "User A", "email": "a@example.com", "password": "secret123", "phone": "1111111111"},
    )
    await client.post(
        "/api/auth/register",
        json={"name": "User B", "email": "b@example.com", "password": "secret123", "phone": "2222222222"},
    )

    resp = await client.get("/api/admin/users", headers=auth)
    assert len(resp.json()) == 2
    user_id = resp.json()[0]["id"]

    resp = await client.delete(f"/api/admin/users/{user_id}", headers=auth)
    assert resp.status_code == 204

    resp = await client.get("/api/admin/users", headers=auth)
    assert len(resp.json()) == 1


async def test_admin_management(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}

    resp = await client.post(
        "/api/admin/admins",
        json={"name": "Admin 2", "email": "admin2@example.com", "password": "secret123", "phone": "1234567890"},
        headers=auth,
    )
    assert resp.status_code == 201
    admin2_id = resp.json()["id"]

    resp = await client.post(
        "/api/admin/admins",
        json={"name": "Admin 2 dup", "email": "admin2@example.com", "password": "secret123", "phone": "0000000001"},
        headers=auth,
    )
    assert resp.status_code == 400

    resp = await client.get("/api/admin/admins", headers=auth)
    assert len(resp.json()) == 2

    resp = await client.delete(f"/api/admin/admins/{admin2_id}", headers=auth)
    assert resp.status_code == 204

    me_id = 1
    resp = await client.delete(f"/api/admin/admins/{me_id}", headers=auth)
    assert resp.status_code == 400


async def test_admin_orders_listing(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}
    user_reg = await client.post(
        "/api/auth/register",
        json={"name": "Buyer", "email": "buyer@example.com", "password": "secret123", "phone": "9999999999"},
    )
    user_token = user_reg.json()["access_token"]

    await client.post("/api/categories", json={"name": "Cat"}, headers=auth)
    product = await client.post(
        "/api/products", json={"name": "P1", "price": 50, "quantity": 10, "cid": 1}, headers=auth
    )
    pid = product.json()["pid"]

    await client.post(
        "/api/orders",
        json={"items": [{"productId": pid, "quantity": 1}], "paymentMethod": "COD"},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    resp = await client.get("/api/admin/orders", headers=auth)
    assert len(resp.json()) == 1
    assert resp.json()[0]["items"][0]["name"] == "P1"

    resp = await client.get("/api/admin/stats", headers=auth)
    assert resp.json()["orders"] == 1
    assert resp.json()["revenue"] == 50.0
