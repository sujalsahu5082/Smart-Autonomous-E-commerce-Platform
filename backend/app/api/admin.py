from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from ai.rag import retriever
from app.api.deps import DbSession, get_current_admin
from app.api.serializers import product_to_out
from app.core.security import hash_password
from app.models import Admin, Category, Coupon, Order, Product, User
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
