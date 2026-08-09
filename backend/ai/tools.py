"""CrewAI tools for the discovery agents.

Each tool wraps an existing, tested capability (ChromaDB retrieval, review
context, category/tags queries, budget filtering, coupon lookup) so agents
can call them during a crew run instead of relying only on pre-passed
context. DB-backed tools open their own short-lived session, keeping them
independent of the request's session.
"""
import asyncio
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from ai.rag import retriever
from app.api.serializers import product_to_out
from app.db.session import SessionLocal
from app.models import Category, Product


def query_chromadb_products(query: str, top_k: int = 8) -> list[dict]:
    """Semantic search over the product catalog via ChromaDB.

    Returns products whose name/description match the query, ranked by
    embedding similarity. Metadata includes pid, name, price, discount,
    image, cid and tags.
    """
    return retriever.search(query, top_k=top_k)


def get_reviews_context(product_id: int, top_k: int = 5) -> list[dict]:
    """Retrieve customer review chunks for a product from the reviews collection."""
    return retriever.get_review_summary_context(product_id, top_k=top_k)


def query_products_by_category(category_name: str | None = None, tags: str | None = None, top_k: int = 10) -> list[dict]:
    """Query the product database by category name and/or comma-separated tags.

    Returns full product objects. At least one of category_name or tags
    should be provided; if both are given they are combined with AND.
    """

    def _run() -> list[dict]:
        stmt = (
            select(Product)
            .join(Category)
            .options(joinedload(Product.category))
        )
        if category_name:
            stmt = stmt.where(func.lower(Category.name).like(f"%{category_name.lower()}%"))
        if tags:
            for t in [t.strip() for t in tags.split(",") if t.strip()]:
                stmt = stmt.where(func.lower(Product.tags).like(f"%{t.lower()}%"))
        stmt = stmt.limit(top_k)

        async def _execute():
            async with SessionLocal() as db:
                result = await db.execute(stmt)
                return [product_to_out(p) for p in result.scalars().unique().all()]

        return asyncio.run(_execute())

    return _run()


def filter_by_budget(products: list[dict[str, Any]], max_price: float, min_price: float = 0.0) -> list[dict[str, Any]]:
    """Filter products by price-after-discount within [min_price, max_price].

    Returns the matching products sorted cheapest-first.
    """
    return sorted(
        [p for p in products if min_price <= p.get("price_after_discount", p.get("price", 0)) <= max_price],
        key=lambda p: p.get("price_after_discount", p.get("price", 0)),
    )


def get_applicable_coupons(category_ids: list[int]) -> list[dict]:
    """Look up active coupons from the Coupon table.

    Pass the category ids (cids) of the customer's products; coupons whose
    applicable_categories is empty (all categories) or overlaps are returned.
    """
    from app.services.coupons import get_applicable_coupons

    async def _run() -> list[dict]:
        async with SessionLocal() as db:
            coupons = await get_applicable_coupons(db, category_ids)
            return [{"code": c.code, "discount_type": c.discount_type, "discount_value": c.discount_value} for c in coupons]

    return asyncio.run(_run())
