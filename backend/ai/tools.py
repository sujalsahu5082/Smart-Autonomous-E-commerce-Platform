"""CrewAI tools for the discovery agents.

Each tool wraps an existing, tested capability (ChromaDB retrieval, review
context, category/tags queries, budget filtering, coupon lookup) so agents
can call them during a crew run instead of relying only on pre-passed
context. DB-backed tools open their own short-lived session, keeping them
independent of the request's session.

All parameters are plain strings: Groq's server-side tool-call validation
rejects type mismatches (e.g. an LLM emitting "3" for an int field), so we
parse everything inside the tool.
"""
import asyncio
import json
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from ai.rag import retriever
from app.api.serializers import product_to_out
from app.db.session import SessionLocal
from app.models import Category, Product


def _to_int(value: Any, default: int) -> int:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return default


def query_chromadb_products(query: str, top_k: str = "8") -> list[dict]:
    """Semantic search over the product catalog via ChromaDB.

    Args:
        query: the search phrase (e.g. "gaming laptop").
        top_k: how many results to return, as a number like "8".

    Returns products ranked by embedding similarity; each has pid, name,
    price, discount, image, cid and tags.
    """
    return retriever.search(query, top_k=_to_int(top_k, 8))


def get_reviews_context(product_id: str, top_k: str = "5") -> list[dict]:
    """Retrieve customer review chunks for one product from the reviews collection.

    Args:
        product_id: the product's pid, as a number like "5".
        top_k: how many review chunks to return, as a number like "5".
    """
    return retriever.get_review_summary_context(_to_int(product_id, 0), top_k=_to_int(top_k, 5))


def query_products_by_category(category_name: str = "", tags: str = "", top_k: str = "10") -> list[dict]:
    """Query the product database by category name and/or comma-separated tags.

    Args:
        category_name: e.g. "Laptops" (empty string to skip).
        tags: comma-separated, e.g. "gaming, rtx" (empty string to skip).
        top_k: max results, as a number like "10".

    If both are given they are combined with AND. Returns full product objects.
    """

    def _run() -> list[dict]:
        stmt = select(Product).join(Category).options(joinedload(Product.category))
        if category_name:
            stmt = stmt.where(func.lower(Category.name).like(f"%{category_name.lower()}%"))
        if tags:
            for t in [t.strip() for t in tags.split(",") if t.strip()]:
                stmt = stmt.where(func.lower(Product.tags).like(f"%{t.lower()}%"))
        stmt = stmt.limit(_to_int(top_k, 10))

        async def _execute():
            async with SessionLocal() as db:
                result = await db.execute(stmt)
                return [product_to_out(p) for p in result.scalars().unique().all()]

        return asyncio.run(_execute())

    return _run()


def filter_by_budget(products_json: str, max_price: str, min_price: str = "0") -> list[dict]:
    """Filter a JSON list of products by price-after-discount within a range.

    Args:
        products_json: JSON array of product objects (pass the catalog as-is).
        max_price: maximum price, as a number like "50000".
        min_price: minimum price, as a number like "0".

    Returns matching products sorted cheapest-first.
    """
    try:
        products = json.loads(products_json) if isinstance(products_json, str) else products_json
        if not isinstance(products, list):
            return []
    except (ValueError, TypeError):
        return []
    lo = _to_int(min_price, 0)
    hi = _to_int(max_price, 0)
    return sorted(
        [p for p in products if lo <= p.get("price_after_discount", p.get("price", 0)) <= hi],
        key=lambda p: p.get("price_after_discount", p.get("price", 0)),
    )


def get_applicable_coupons(category_ids: str = "[]") -> list[dict]:
    """Look up active coupons from the Coupon table.

    Args:
        category_ids: JSON array of category ids, e.g. "[1, 3]".

    Coupons whose applicable_categories is empty (all categories) or
    overlaps are returned.
    """
    from app.services.coupons import get_applicable_coupons

    try:
        ids = json.loads(category_ids) if isinstance(category_ids, str) else category_ids
        ids = [int(i) for i in ids] if isinstance(ids, list) else []
    except (ValueError, TypeError):
        ids = []

    async def _run() -> list[dict]:
        async with SessionLocal() as db:
            coupons = await get_applicable_coupons(db, ids)
            return [
                {"code": c.code, "discount_type": c.discount_type, "discount_value": c.discount_value}
                for c in coupons
            ]

    return asyncio.run(_run())
