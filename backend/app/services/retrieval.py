import logging
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ai.rag import retriever
from app.api.serializers import product_to_out
from app.models import Product, Category

logger = logging.getLogger(__name__)

STOP_WORDS = {
  'a', 'an', 'the', 'under', 'below', 'above', 'for', 'with', 'and', 'or', 'in', 'to',
  'suggest', 'show', 'me', 'find', 'get', 'best', 'some', 'what', 'are', 'is', 'your', 'please'
}


async def _sql_search(db: AsyncSession, query: str, limit: int) -> list[dict]:
    query_clean = query.strip().lower()

    # 1. Exact pattern match across name and description
    pattern = f"%{query_clean}%"
    stmt = (
        select(Product)
        .options(joinedload(Product.category))
        .where(or_(func.lower(Product.name).like(pattern), func.lower(Product.description).like(pattern)))
        .limit(limit)
    )
    result = await db.execute(stmt)
    hits = [product_to_out(p) for p in result.scalars().unique().all()]
    if hits:
        return hits

    # 2. Tokenized keyword search across name, description, tags, and category name
    tokens = [w for w in query_clean.split() if len(w) > 2 and w not in STOP_WORDS]
    if tokens:
        conditions = []
        for t in tokens:
            t_pat = f"%{t}%"
            conditions.append(func.lower(Product.name).like(t_pat))
            conditions.append(func.lower(Product.description).like(t_pat))
            conditions.append(func.lower(Product.tags).like(t_pat))
            conditions.append(Product.cid.in_(
                select(Category.cid).where(func.lower(Category.name).like(t_pat))
            ))

        stmt = (
            select(Product)
            .options(joinedload(Product.category))
            .where(or_(*conditions))
            .limit(limit)
        )
        result = await db.execute(stmt)
        hits = [product_to_out(p) for p in result.scalars().unique().all()]
        if hits:
            return hits

    # 3. Fallback: Return top products ordered by discount/rating
    stmt = (
        select(Product)
        .options(joinedload(Product.category))
        .order_by(Product.discount.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return [product_to_out(p) for p in result.scalars().unique().all()]


async def retrieve_products(db: AsyncSession, query: str, top_k: int = 10) -> list[dict]:
    """RAG-based retrieval via ChromaDB with intelligent SQL search fallback."""
    try:
        hits = await retriever.asearch(query, top_k)
        if hits:
            pids = [int(h["pid"]) for h in hits if "pid" in h]
            if pids:
                result = await db.execute(
                    select(Product).options(joinedload(Product.category)).where(Product.pid.in_(pids))
                )
                by_pid = {p.pid: product_to_out(p) for p in result.scalars().unique().all()}
                found = [by_pid[pid] for pid in pids if pid in by_pid]
                if found:
                    return found
    except Exception:
        logger.warning("Vector search unavailable, falling back to SQL search", exc_info=True)

    return await _sql_search(db, query, top_k)
