async def test_categories_crud(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = await client.post("/api/categories", json={"name": "Electronics", "image": "electronics.png"}, headers=headers)
    assert resp.status_code == 201
    cid = resp.json()["cid"]

    resp = await client.get("/api/categories")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    resp = await client.post("/api/categories", json={"name": "Electronics"}, headers=headers)
    assert resp.status_code == 400

    resp = await client.put(f"/api/categories/{cid}", json={"name": "Gadgets"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Gadgets"

    resp = await client.delete(f"/api/categories/{cid}", headers=headers)
    assert resp.status_code == 204

    resp = await client.get(f"/api/categories/{cid}")
    assert resp.status_code == 404

    resp = await client.post("/api/categories", json={"name": "NoAuth"})
    assert resp.status_code == 401


async def test_products_crud_and_filtering(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/categories", json={"name": "Electronics"}, headers=headers)
    await client.post("/api/categories", json={"name": "Books"}, headers=headers)

    payload = {
        "name": "Laptop",
        "description": "Powerful laptop for developers",
        "price": 1000,
        "quantity": 10,
        "discount": 20,
        "image": "laptop.png",
        "cid": 1,
    }
    resp = await client.post("/api/products", json=payload, headers=headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["price_after_discount"] == 800

    await client.post(
        "/api/products",
        json={"name": "Python Book", "description": "Learn Python", "price": 30, "quantity": 5, "cid": 2},
        headers=headers,
    )

    resp = await client.get("/api/products")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    resp = await client.get("/api/products", params={"category": 2})
    assert [p["name"] for p in resp.json()] == ["Python Book"]

    resp = await client.get("/api/products", params={"search": "laptop"})
    assert len(resp.json()) == 1

    resp = await client.get("/api/products", params={"min_price": 10, "max_price": 500})
    assert [p["name"] for p in resp.json()] == ["Python Book"]

    resp = await client.get("/api/products", params={"min_price": 900})
    assert [p["name"] for p in resp.json()] == ["Laptop"]

    pid = body["pid"]
    resp = await client.get(f"/api/products/{pid}")
    assert resp.status_code == 200
    assert resp.json()["category_name"] == "Electronics"

    resp = await client.put(f"/api/products/{pid}", json={"price": 900}, headers=headers)
    assert resp.json()["price"] == 900

    resp = await client.delete(f"/api/products/{pid}", headers=headers)
    assert resp.status_code == 204

    resp = await client.post("/api/products", json={"name": "Bad", "price": 1, "cid": 999}, headers=headers)
    assert resp.status_code == 400
