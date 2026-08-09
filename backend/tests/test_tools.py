from ai import tools
from ai.rag import ProductRetriever
from app.models import Coupon


def test_filter_by_budget():
    products = [
        {"pid": 1, "name": "Cheap", "price": 100, "price_after_discount": 80},
        {"pid": 2, "name": "Mid", "price": 500, "price_after_discount": 450},
        {"pid": 3, "name": "Expensive", "price": 1000, "price_after_discount": 900},
    ]
    import json as _json

    hits = tools.filter_by_budget(_json.dumps(products), "500")
    assert [p["pid"] for p in hits] == [1, 2]
    assert tools.filter_by_budget(_json.dumps(products), "100", "100") == []
    assert tools.filter_by_budget(_json.dumps(products), "2000", "90")[0]["pid"] == 2
    assert tools.filter_by_budget("not json", "500") == []


def test_query_chromadb_and_reviews_tools(tmp_path, monkeypatch):
    r = ProductRetriever(persist_dir=str(tmp_path), collection_name="products")
    r.upsert_products([{"pid": 10, "name": "Gaming Laptop", "description": "RTX graphics", "price": 1000, "cid": 1, "quantity": 5, "discount": 10}])
    r.upsert_reviews([{"id": 1, "productId": 10, "userId": 1, "rating": 5, "comment": "Excellent"}])
    monkeypatch.setattr(tools, "retriever", r)

    found = tools.query_chromadb_products("laptop", "1")
    assert found[0]["pid"] == 10
    assert tools.query_chromadb_products("laptop", "abc")  # non-numeric top_k tolerated

    ctx = tools.get_reviews_context("10")
    assert len(ctx) == 1 and ctx[0]["rating"] == 5
    assert tools.get_reviews_context("99") == []


def test_get_applicable_coupons_tool(tmp_path, monkeypatch):
    import asyncio

    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.db.base import Base

    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path}/coupons.db")
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _setup():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with factory() as db:
            db.add_all(
                [
                    Coupon(code="ALL", discount_type="percent", discount_value=10),
                    Coupon(code="MOB", discount_type="percent", discount_value=15, applicable_categories=[1]),
                    Coupon(code="LAP", discount_type="percent", discount_value=5, applicable_categories=[3]),
                ]
            )
            await db.commit()

    asyncio.run(_setup())
    monkeypatch.setattr(tools, "SessionLocal", factory)

    hits = tools.get_applicable_coupons("[1]")
    codes = {h["code"] for h in hits}
    assert codes == {"ALL", "MOB"}

    assert [h["code"] for h in tools.get_applicable_coupons("[3]")] == ["ALL", "LAP"]
    assert [h["code"] for h in tools.get_applicable_coupons("bad json")] == ["ALL"]
    asyncio.run(engine.dispose())
