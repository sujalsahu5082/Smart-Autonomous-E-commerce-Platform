import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ai.discovery import run_discovery
from app.api.deps import DbSession, get_optional_current_user
from app.models import Order, Review, User, WishlistItem
from app.schemas.product import ProductOut
from app.services.analytics import log_chat
from app.services.chat_sessions import add_exchange, session_context
from app.services.retrieval import retrieve_products

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/discovery", tags=["discovery"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    session_id: str | None = Field(default=None, max_length=100)
    cart_context: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    answer: str
    products: list[ProductOut]
    coupons: list[dict] = Field(default_factory=list)
    mode: str


async def _user_context(db: DbSession, user: User) -> dict:
    orders = (await db.execute(select(Order).where(Order.userId == user.id))).scalars().all()
    order_names = [item.name for order in orders for item in order.items]
    wishlist = (
        await db.execute(
            select(WishlistItem)
            .options(joinedload(WishlistItem.product))
            .where(WishlistItem.iduser == user.id)
        )
    ).scalars().all()
    return {
        "name": user.name,
        "orders": order_names[:20],
        "wishlist": [item.product.name for item in wishlist if item.product][:20],
    }


async def _reviews_for(db: DbSession, products: list[dict]) -> list[dict]:
    if not products:
        return []
    pids = [p["pid"] for p in products[:3]]
    result = await db.execute(select(Review).where(Review.productId.in_(pids)).limit(10))
    return [
        {"productId": r.productId, "rating": r.rating, "comment": r.comment}
        for r in result.scalars().all()
    ]


@router.post("/chat", response_model=ChatResponse)
async def discovery_chat(
    payload: ChatRequest,
    db: DbSession,
    current_user: Annotated[User | None, Depends(get_optional_current_user)] = None,
):
    products = await retrieve_products(db, payload.message, top_k=10)
    context = await _user_context(db, current_user) if current_user else {}
    context.update(session_context(payload.session_id, payload.cart_context))
    reviews = await _reviews_for(db, products)
    from app.services.coupons import coupon_to_dict, get_applicable_coupons

    coupons = await get_applicable_coupons(db, [p["cid"] for p in products])
    answer, mode = await run_discovery(payload.message, products, context, reviews, coupons)
    add_exchange(payload.session_id, payload.message, answer)
    try:
        await log_chat(
            db,
            message=payload.message,
            products=products,
            mode=mode,
            session_id=payload.session_id,
            userId=current_user.id if current_user else None,
        )
    except Exception:
        logger.exception("Failed to persist chat log entry")
    return ChatResponse(
        answer=answer, products=products, coupons=[coupon_to_dict(c) for c in coupons], mode=mode
    )
