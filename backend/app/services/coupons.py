from datetime import datetime

from sqlalchemy import select

from app.api.deps import DbSession
from app.models import Coupon


async def get_applicable_coupons(
    db: DbSession, category_ids: list[int], now: datetime | None = None
) -> list[Coupon]:
    """Return active coupons valid for the given set of category ids.

    A coupon applies when it is not expired and its applicable_categories is
    empty (all categories) or overlaps with the given category ids.
    """
    if now is None:
        now = datetime.utcnow()
    result = await db.execute(
        select(Coupon).where(
            (Coupon.valid_until.is_(None)) | (Coupon.valid_until >= now)
        )
    )
    coupons = result.scalars().all()
    category_set = set(category_ids)
    return [
        c
        for c in coupons
        if not c.applicable_categories or category_set.intersection(c.applicable_categories)
    ]


def coupon_to_dict(coupon: Coupon) -> dict:
    return {
        "id": coupon.id,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value,
        "valid_until": coupon.valid_until.isoformat() if coupon.valid_until else None,
        "applicable_categories": coupon.applicable_categories or [],
    }
