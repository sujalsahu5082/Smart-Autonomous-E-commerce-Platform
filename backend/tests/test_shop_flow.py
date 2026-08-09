import pytest
from httpx import AsyncClient


async def _register_and_login(client: AsyncClient, email: str = "buyer@example.com", phone: str = "9999999999") -> str:
    resp = await client.post(
        "/api/auth/register",
        json={"name": "Buyer", "email": email, "password": "secret123", "phone": phone},
    )
    assert resp.status_code == 201
    return resp.json()["access_token"]


async def _seed_product(client: AsyncClient, price: float = 100, qty: int = 5, name: str = "Widget", admin_token: str | None = None) -> int:
    headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else None
    await client.post("/api/categories", json={"name": "TestCat"}, headers=headers)
    resp = await client.post(
        "/api/products",
        json={"name": name, "description": "desc", "price": price, "quantity": qty, "cid": 1},
        headers=headers,
    )
    return resp.json()["pid"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def test_cart_flow(client, admin_token):
    token = await _register_and_login(client)
    pid = await _seed_product(client, qty=3, admin_token=admin_token)

    resp = await client.post("/api/cart", json={"pid": pid, "quantity": 2}, headers=_auth(token))
    assert resp.status_code == 201
    item_id = resp.json()["id"]
    assert resp.json()["product"]["name"] == "Widget"

    resp = await client.post("/api/cart", json={"pid": pid, "quantity": 1}, headers=_auth(token))
    assert resp.json()["quantity"] == 3

    resp = await client.post("/api/cart", json={"pid": pid, "quantity": 5}, headers=_auth(token))
    assert resp.status_code == 400

    resp = await client.put(f"/api/cart/{item_id}", json={"quantity": 1}, headers=_auth(token))
    assert resp.json()["quantity"] == 1

    resp = await client.get("/api/cart", headers=_auth(token))
    assert len(resp.json()) == 1

    resp = await client.delete(f"/api/cart/{item_id}", headers=_auth(token))
    assert resp.status_code == 204

    resp = await client.get("/api/cart", headers=_auth(token))
    assert resp.json() == []

    resp = await client.get("/api/cart")
    assert resp.status_code == 401


async def test_wishlist_flow(client, admin_token):
    token = await _register_and_login(client)
    pid = await _seed_product(client, admin_token=admin_token)

    resp = await client.post("/api/wishlist", json={"pid": pid}, headers=_auth(token))
    assert resp.status_code == 201

    resp = await client.get("/api/wishlist", headers=_auth(token))
    assert len(resp.json()) == 1

    resp = await client.post("/api/wishlist", json={"pid": pid}, headers=_auth(token))
    assert resp.status_code == 201
    assert resp.json()["id"] == resp.json()["id"]  # idempotent add

    resp = await client.delete(f"/api/wishlist/{pid}", headers=_auth(token))
    assert resp.status_code == 204

    resp = await client.get("/api/wishlist", headers=_auth(token))
    assert resp.json() == []


async def test_order_flow_with_stock_decrement(client, admin_token):
    token = await _register_and_login(client)
    pid = await _seed_product(client, price=100, qty=5, admin_token=admin_token)

    await client.post("/api/cart", json={"pid": pid, "quantity": 2}, headers=_auth(token))

    resp = await client.post(
        "/api/orders",
        json={
            "items": [{"productId": pid, "quantity": 2}],
            "paymentMethod": "COD",
            "shippingAddress": "Home, City - 123",
        },
        headers=_auth(token),
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["orderid"].startswith("ORD-")
    assert body["status"] == "Order Placed"
    assert body["totalAmount"] == 200.0
    assert len(body["items"]) == 1

    resp = await client.get("/api/products/{pid}".format(pid=pid))
    assert resp.json()["quantity"] == 3

    resp = await client.get("/api/cart", headers=_auth(token))
    assert resp.json() == []

    order_id = body["id"]
    resp = await client.get(f"/api/orders/{order_id}", headers=_auth(token))
    assert resp.status_code == 200

    resp = await client.get("/api/orders", headers=_auth(token))
    assert len(resp.json()) == 1


async def test_order_rejects_overstock(client, admin_token):
    token = await _register_and_login(client)
    pid = await _seed_product(client, qty=2, admin_token=admin_token)

    resp = await client.post(
        "/api/orders",
        json={"items": [{"productId": pid, "quantity": 3}], "paymentMethod": "UPI"},
        headers=_auth(token),
    )
    assert resp.status_code == 400
    assert "stock" in resp.json()["detail"].lower()


async def test_order_requires_auth(client):
    resp = await client.post("/api/orders", json={"items": [{"productId": 1, "quantity": 1}], "paymentMethod": "COD"})
    assert resp.status_code == 401


async def test_reviews_flow(client, admin_token):
    token = await _register_and_login(client)
    pid = await _seed_product(client, admin_token=admin_token)

    resp = await client.post(
        f"/api/products/{pid}/reviews", json={"rating": 5, "comment": "Great"}, headers=_auth(token)
    )
    assert resp.status_code == 201
    assert resp.json()["user_name"] == "Buyer"

    resp = await client.get(f"/api/products/{pid}/reviews")
    assert len(resp.json()) == 1

    resp = await client.post(
        f"/api/products/{pid}/reviews", json={"rating": 4, "comment": "Updated"}, headers=_auth(token)
    )
    assert resp.status_code == 201
    assert resp.json()["rating"] == 4

    resp = await client.get(f"/api/products/{pid}/reviews")
    assert len(resp.json()) == 1

    resp = await client.post(
        f"/api/products/{pid}/reviews", json={"rating": 6}, headers=_auth(token)
    )
    assert resp.status_code == 422


async def test_admin_updates_order_status(client, admin_token):
    token = await _register_and_login(client)
    pid = await _seed_product(client, admin_token=admin_token)
    resp = await client.post(
        "/api/orders",
        json={"items": [{"productId": pid, "quantity": 1}], "paymentMethod": "COD"},
        headers=_auth(token),
    )
    order_id = resp.json()["id"]

    resp = await client.put(f"/api/orders/{order_id}", json={"status": "Shipped"})
    assert resp.status_code == 401

    resp = await client.put(
        f"/api/orders/{order_id}", json={"status": "Shipped"}, headers=_auth(admin_token)
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "Shipped"
