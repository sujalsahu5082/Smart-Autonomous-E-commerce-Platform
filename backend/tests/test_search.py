from unittest.mock import AsyncMock, patch


async def _seed_catalog(client, admin_token):
    auth = {"Authorization": f"Bearer {admin_token}"}
    await client.post("/api/categories", json={"name": "Electronics"}, headers=auth)
    await client.post("/api/categories", json={"name": "Books"}, headers=auth)
    for i, (name, desc, cid) in enumerate(
        [
            ("Gaming Laptop", "High performance laptop for gaming", 1),
            ("Python Programming Book", "Learn Python from scratch", 2),
            ("Wireless Headphones", "Noise cancelling headphones for music", 1),
        ],
        start=1,
    ):
        await client.post(
            "/api/products",
            json={"name": name, "description": desc, "price": 100 * i, "quantity": 5, "cid": cid},
            headers=auth,
        )


async def test_search_sql_fallback(client, admin_token):
    await _seed_catalog(client, admin_token)

    with patch(
        "app.services.retrieval.retriever.asearch",
        new_callable=AsyncMock,
        side_effect=RuntimeError("no chroma"),
    ):
        resp = await client.get("/api/search", params={"q": "laptop"})
    assert resp.status_code == 200
    names = [p["name"] for p in resp.json()]
    assert "Gaming Laptop" in names


async def test_search_rag_ordering(client, admin_token):
    await _seed_catalog(client, admin_token)
    # RAG returns product 2 first even though it's not the SQL match
    hits = [
        {"pid": 3, "name": "Wireless Headphones"},
        {"pid": 1, "name": "Gaming Laptop"},
    ]
    with patch(
        "app.services.retrieval.retriever.asearch", new_callable=AsyncMock, return_value=hits
    ):
        resp = await client.get("/api/search", params={"q": "headphones"})
    assert resp.status_code == 200
    assert [p["pid"] for p in resp.json()] == [3, 1]


async def test_search_requires_query(client):
    resp = await client.get("/api/search")
    assert resp.status_code == 422
