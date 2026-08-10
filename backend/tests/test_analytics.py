from app.services.analytics import resolve_intent


async def _seed_shop(client, auth):
    await client.post("/api/categories", json={"name": "Electronics"}, headers=auth)
    await client.post("/api/categories", json={"name": "Clothing"}, headers=auth)
    await client.post(
        "/api/products",
        json={"name": "Gaming Laptop", "description": "High performance laptop", "price": 1000, "quantity": 5, "cid": 1},
        headers=auth,
    )
    await client.post(
        "/api/products",
        json={"name": "T-Shirt", "description": "Soft cotton tee", "price": 20, "quantity": 10, "cid": 2},
        headers=auth,
    )


def test_resolve_intent_heuristic():
    laptop = {"pid": 1, "name": "Gaming Laptop", "category_name": "Electronics"}
    tshirt = {"pid": 2, "name": "T-Shirt", "category_name": "Clothing"}

    assert resolve_intent("show me gaming laptops please", [laptop]) == "Electronics"
    assert resolve_intent("cheap stuff under 100", [laptop, tshirt]) == "deals and pricing"
    assert resolve_intent("suggest something similar", [laptop, tshirt]) == "recommendations"
    assert resolve_intent("whats available", [tshirt]) == "Clothing"
    assert resolve_intent("hello", []) == "general search"


async def test_analytics_trending_from_chat_logs(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}
    await _seed_shop(client, auth)

    await client.post("/api/discovery/chat", json={"message": "show me gaming laptops"})
    await client.post("/api/discovery/chat", json={"message": "laptop deals"})
    await client.post("/api/discovery/chat", json={"message": "cotton tshirt"})

    resp = await client.get("/api/admin/analytics/trending")
    assert resp.status_code == 401

    resp = await client.get("/api/admin/analytics/trending", headers=auth)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_queries"] == 3

    top_products = {p["name"]: p["searches"] for p in body["top_products"]}
    assert top_products["Gaming Laptop"] == 2
    assert top_products["T-Shirt"] == 1

    top_categories = {c["category"]: c["queries"] for c in body["top_categories"]}
    assert top_categories["Electronics"] == 1
    assert top_categories["deals and pricing"] == 1
    assert top_categories["Clothing"] == 1


async def test_analytics_sentiment(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}
    await _seed_shop(client, auth)

    u1 = await client.post(
        "/api/auth/register",
        json={"name": "User 1", "email": "u1@example.com", "password": "secret123", "phone": "1111111111"},
    )
    u2 = await client.post(
        "/api/auth/register",
        json={"name": "User 2", "email": "u2@example.com", "password": "secret123", "phone": "2222222222"},
    )
    t1 = u1.json()["access_token"]
    t2 = u2.json()["access_token"]
    await client.post("/api/products/1/reviews", json={"rating": 5, "comment": "Great"}, headers={"Authorization": f"Bearer {t1}"})
    await client.post("/api/products/1/reviews", json={"rating": 3, "comment": "Okay"}, headers={"Authorization": f"Bearer {t2}"})

    resp = await client.get("/api/admin/analytics/sentiment", headers=auth)
    assert resp.status_code == 200
    body = resp.json()

    laptop = next(p for p in body["per_product"] if p["name"] == "Gaming Laptop")
    assert laptop["review_count"] == 2
    assert laptop["avg_rating"] == 4.0
    assert laptop["sentiment"] == "positive"
    assert laptop["rating_distribution"] == {"3": 1, "5": 1}
    assert laptop["category"] == "Electronics"

    electronics = next(c for c in body["per_category"] if c["category"] == "Electronics")
    assert electronics["review_count"] == 2
    assert electronics["sentiment"] == "positive"


async def test_analytics_pricing_insights(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/categories", json={"name": "Electronics"}, headers=auth)
    await client.post("/api/categories", json={"name": "Clothing"}, headers=auth)
    for price in (100, 110, 500):
        await client.post(
            "/api/products", json={"name": f"Gadget {price}", "price": price, "quantity": 5, "cid": 1}, headers=auth
        )
    await client.post(
        "/api/products", json={"name": "T-Shirt", "price": 20, "quantity": 5, "cid": 2}, headers=auth
    )

    resp = await client.get("/api/admin/analytics/pricing-insights", headers=auth)
    assert resp.status_code == 200
    body = resp.json()

    insights = {i["name"]: i for i in body["insights"]}
    assert insights["Gadget 500"]["flag"] == "overpriced"
    assert insights["Gadget 100"]["flag"] == "underpriced"
    assert "T-Shirt" not in insights  # category with a single product is skipped
    assert body["params"]["deviation_threshold"] == 0.30
    assert body["params"]["count"] == 3

    resp = await client.get("/api/admin/analytics/pricing-insights?deviation_threshold=1.2", headers=auth)
    assert resp.json()["params"]["count"] == 0
