"""Standalone RAG ingestion script.

Re-indexes all products and reviews from the database into ChromaDB so the
vector store matches the current catalog. Safe to re-run at any time
(upserts overwrite by id).

Usage (from backend/):
    uv run python ingest.py
"""
import asyncio

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ai.rag import retriever
from app.api.serializers import product_to_out
from app.db.session import SessionLocal
from app.models import Product, Review


async def ingest() -> None:
    async with SessionLocal() as session:
        products = (
            await session.execute(select(Product).options(joinedload(Product.category)))
        ).scalars().unique().all()
        reviews = (
            await session.execute(select(Review).options(joinedload(Review.user)))
        ).scalars().all()

    product_dicts = [product_to_out(p) for p in products]
    review_dicts = [
        {
            "id": r.id,
            "productId": r.productId,
            "userId": r.userId,
            "rating": r.rating,
            "comment": r.comment or "",
            "user_name": r.user.name if r.user else None,
        }
        for r in reviews
    ]

    await retriever.aupsert(product_dicts)
    await retriever.aupsert_reviews(review_dicts)
    print(f"Indexed {len(product_dicts)} products and {len(review_dicts)} reviews into ChromaDB.")


if __name__ == "__main__":
    asyncio.run(ingest())
