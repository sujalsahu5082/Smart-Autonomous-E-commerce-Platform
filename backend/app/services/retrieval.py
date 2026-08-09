import logging

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ai.rag import retriever
from app.api.serializers import product_to_out
from app.models import Product

logger = logging.getLogger(__name__)


async def _sql_search(db: AsyncSession, query: str, limit: int) -> list[dict]:
    pattern = f"%{query.lower()}%"
    stmt = (
        select(Product)
        .options(joinedload(Product.category))
        .where(or_(func.lower(Product.name).like(pattern), func.lower(Product.description).like(pattern)))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return [product_to_out(p) for p in result.scalars().unique().all()]


async def retrieve_products(db: AsyncSession, query: str, top_k: int = 10) -> list[dict]:
    """RAG-based retrieval via ChromaDB with SQL LIKE fallback."""
    try:
        hits = await retriever.asearch(query, top_k)
    except Exception:
        logger.warning("Vector search unavailable, falling back to SQL search", exc_info=True)
        return await _sql_search(db, query, top_k)

    if not hits:
        return await _sql_search(db, query, top_k)

    pids = [int(h["pid"]) for h in hits]
    result = await db.execute(
        select(Product).options(joinedload(Product.category)).where(Product.pid.in_(pids))
    )
    by_pid = {p.pid: product_to_out(p) for p in result.scalars().unique().all()}
    return [by_pid[pid] for pid in pids if pid in by_pid]
