from typing import Annotated, Any
from collections import Counter, defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from ai.rag import retriever
from app.api.deps import DbSession, get_current_admin
from app.api.serializers import product_to_out
from app.core.security import hash_password
from app.models import Admin, Category, ChatLog, Coupon, Order, Product, Review, User
from app.schemas.admin import AdminCreate, AdminOut
from app.schemas.coupon import CouponCreate, CouponOut
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def dashboard_stats(db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]):
    counts = {}
    for name, model in [
        ("categories", Category),
        ("products", Product),
        ("orders", Order),
        ("users", User),
        ("admins", Admin),
    ]:
        counts[name] = (await db.execute(select(func.count()).select_from(model))).scalar_one()
    revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Order.totalAmount), 0.0)).where(Order.status != "Cancelled")
        )
    ).scalar_one()
    counts["revenue"] = float(revenue)
    return counts


@router.get("/orders", response_model=list[dict])
async def list_all_orders(db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]):
    from app.api.orders import _order_to_dict

    result = await db.execute(
        select(Order).options(joinedload(Order.items)).order_by(Order.id.desc())
    )
    return [_order_to_dict(order) for order in result.scalars().unique().all()]


@router.post("/rag/resync")
async def resync_rag_index(db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]):
    result = await db.execute(select(Product).options(joinedload(Product.category)))
    products = [product_to_out(p) for p in result.scalars().unique().all()]
    await retriever.aupsert(products)
    return {"indexed": len(products)}


@router.get("/users", response_model=list[UserOut])
async def list_all_users(db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]):
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await db.delete(user)
    await db.commit()


@router.get("/admins", response_model=list[AdminOut])
async def list_all_admins(db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]):
    result = await db.execute(select(Admin).order_by(Admin.id))
    return result.scalars().all()


@router.post("/admins", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
async def create_admin(
    payload: AdminCreate, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    existing = await db.execute(select(Admin).where(Admin.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin already exists")
    admin = Admin(**payload.model_dump(exclude={"password"}), password=hash_password(payload.password))
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


@router.delete("/admins/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: int, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    if admin_id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")
    admin = await db.get(Admin, admin_id)
    if admin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    await db.delete(admin)
    await db.commit()


@router.get("/coupons", response_model=list[CouponOut])
async def list_coupons(db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]):
    result = await db.execute(select(Coupon).order_by(Coupon.id))
    return result.scalars().all()


@router.post("/coupons", response_model=CouponOut, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    payload: CouponCreate, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    existing = await db.execute(select(Coupon).where(Coupon.code == payload.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon code already exists")
    coupon = Coupon(**payload.model_dump())
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.delete("/coupons/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon(
    coupon_id: int, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    coupon = await db.get(Coupon, coupon_id)
    if coupon is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    await db.delete(coupon)
    await db.commit()


def _sentiment_label(avg_rating: float) -> str:
    if avg_rating >= 4.0:
        return "positive"
    if avg_rating >= 2.5:
        return "mixed"
    return "negative"


@router.get("/analytics/trending")
async def analytics_trending(
    db: DbSession,
    current_admin: Annotated[Admin, Depends(get_current_admin)],
    limit: int = Query(default=10, ge=1, le=100),
):
    """Most-searched products and categories, aggregated from chat logs."""
    result = await db.execute(select(ChatLog).order_by(ChatLog.id.desc()).limit(5000))
    logs = result.scalars().all()

    product_counts: Counter[int] = Counter()
    category_counts: Counter[str] = Counter()
    for log in logs:
        category_counts[log.intent or "general search"] += 1
        product_counts.update(log.product_ids or [])

    top_products = []
    if product_counts:
        rows = await db.execute(select(Product).where(Product.pid.in_(list(product_counts))))
        names = {p.pid: p.name for p in rows.scalars().all()}
        for pid, count in product_counts.most_common(limit):
            top_products.append({"pid": pid, "name": names.get(pid), "searches": count})

    return {
        "total_queries": len(logs),
        "top_products": top_products,
        "top_categories": [
            {"category": name, "queries": count}
            for name, count in category_counts.most_common(limit)
        ],
    }


@router.get("/analytics/sentiment")
async def analytics_sentiment(
    db: DbSession,
    current_admin: Annotated[Admin, Depends(get_current_admin)],
    category_id: int | None = Query(default=None),
):
    """Aggregate review sentiment per product and per category."""
    product_stmt = (
        select(Product, func.count(Review.id), func.coalesce(func.avg(Review.rating), 0.0))
        .outerjoin(Review, Review.productId == Product.pid)
        .group_by(Product.pid)
        .order_by(Product.pid)
    )
    if category_id is not None:
        product_stmt = product_stmt.where(Product.cid == category_id)
    product_rows = (await db.execute(product_stmt)).all()

    category_stmt = (
        select(Category, func.count(Review.id), func.coalesce(func.avg(Review.rating), 0.0))
        .outerjoin(Product, Product.cid == Category.cid)
        .outerjoin(Review, Review.productId == Product.pid)
        .group_by(Category.cid)
        .order_by(Category.name)
    )
    category_rows = (await db.execute(category_stmt)).all()

    per_product = []
    for product, count, avg in product_rows:
        dist_stmt = select(Review.rating, func.count(Review.id)).where(Review.productId == product.pid)
        if count:
            dist_stmt = dist_stmt.group_by(Review.rating)
        distribution = {str(rating): n for rating, n in (await db.execute(dist_stmt)).all()}
        per_product.append(
            {
                "product_id": product.pid,
                "name": product.name,
                "category": product.category.name if product.category else None,
                "review_count": count,
                "avg_rating": round(float(avg), 2),
                "sentiment": _sentiment_label(float(avg)),
                "rating_distribution": distribution,
            }
        )

    return {
        "per_category": [
            {
                "category": category.name,
                "review_count": count,
                "avg_rating": round(float(avg), 2),
                "sentiment": _sentiment_label(float(avg)),
            }
            for category, count, avg in category_rows
        ],
        "per_product": per_product,
    }


@router.get("/analytics/pricing-insights")
async def analytics_pricing_insights(
    db: DbSession,
    current_admin: Annotated[Admin, Depends(get_current_admin)],
    deviation_threshold: float = Query(default=0.30, ge=0.0, le=5.0),
    min_products: int = Query(default=2, ge=1, le=100),
    limit: int = Query(default=20, ge=1, le=200),
):
    """Flag products priced far from their category average."""
    rows = (
        await db.execute(select(Product).options(joinedload(Product.category)))
    ).scalars().all()

    by_category: dict[int, dict[str, Any]] = defaultdict(
        lambda: {"name": None, "prices": [], "products": []}
    )
    for product in rows:
        bucket = by_category[product.cid]
        bucket["name"] = product.category.name if product.category else None
        effective = product.price_after_discount
        bucket["prices"].append(effective)
        bucket["products"].append((product, effective))

    insights = []
    for bucket in by_category.values():
        if bucket["name"] is None or len(bucket["prices"]) < min_products:
            continue
        average = sum(bucket["prices"]) / len(bucket["prices"])
        for product, effective in bucket["products"]:
            if average == 0:
                continue
            deviation = (effective - average) / average
            if abs(deviation) >= deviation_threshold:
                insights.append(
                    {
                        "product_id": product.pid,
                        "name": product.name,
                        "category": bucket["name"],
                        "price": product.price,
                        "price_after_discount": effective,
                        "category_average_price": round(average, 2),
                        "deviation_pct": round(deviation * 100, 1),
                        "flag": "overpriced" if deviation > 0 else "underpriced",
                    }
                )

    insights.sort(key=lambda i: abs(i["deviation_pct"]), reverse=True)
    return {
        "insights": insights[:limit],
        "params": {
            "deviation_threshold": deviation_threshold,
            "min_products": min_products,
            "count": min(len(insights), limit),
        },
    }
