"""Chat-log analytics helpers (Phase 7).

resolve_intent() is a lightweight, deterministic heuristic used to tag every
chat query with a category intent so the admin analytics endpoints have real
data to aggregate. log_chat() persists the query to the ChatLog table.
"""
import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ChatLog

logger = logging.getLogger(__name__)

DEAL_KEYWORDS = ("best", "deal", "cheap", "discount", "budget", "under", "offer", "coupon", "sale")
RECOMMENDATION_KEYWORDS = ("recommend", "suggest", "similar", "related", "complementary", "what else")


def resolve_intent(message: str, products: list[dict]) -> str:
    """Best-effort category intent for a chat query, derived without an LLM.

    Priority: an explicit category name mentioned in the message, then a
    category inferred from the products the retrieval step returned, then a
    generic intent bucket.
    """
    query = message.strip().lower()
    if not products:
        return "general search"

    for product in products:
        category_name = (product.get("category_name") or "").lower()
        if category_name and category_name in query:
            return product["category_name"]

    if any(k in query for k in RECOMMENDATION_KEYWORDS):
        return "recommendations"
    if any(k in query for k in DEAL_KEYWORDS):
        return "deals and pricing"

    if products:
        return products[0].get("category_name") or "general search"
    return "general search"


async def log_chat(
    db: AsyncSession,
    *,
    message: str,
    products: list[dict],
    mode: str,
    session_id: str | None = None,
    userId: int | None = None,
) -> None:
    """Persist one chat query to the ChatLog table."""
    entry = ChatLog(
        session_id=session_id,
        userId=userId,
        message=message[:500],
        intent=resolve_intent(message, products)[:100],
        product_ids=[p.get("pid") for p in products if p.get("pid") is not None],
        product_names=[p.get("name") for p in products if p.get("name")],
        mode=mode or "fallback",
    )
    db.add(entry)
    await db.commit()
    logger.debug("Logged chat query (session=%s intent=%s)", session_id, entry.intent)
