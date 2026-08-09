from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.api.deps import DbSession, get_current_user
from app.api.serializers import product_to_out
from app.models import Product, User, WishlistItem
from app.schemas.wishlist import WishlistItemOut

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


class WishlistAdd(BaseModel):
    pid: int


def _item_to_out(item: WishlistItem, product: Product | None) -> dict:
    return {
        "id": item.id,
        "iduser": item.iduser,
        "idproduct": item.idproduct,
        "product": product_to_out(product) if product else None,
    }


@router.get("", response_model=list[WishlistItemOut])
async def get_wishlist(db: DbSession, current_user: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(
        select(WishlistItem)
        .options(joinedload(WishlistItem.product).joinedload(Product.category))
        .where(WishlistItem.iduser == current_user.id)
    )
    items = result.scalars().unique().all()
    return [_item_to_out(i, i.product) for i in items]


@router.post("", response_model=WishlistItemOut, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    payload: WishlistAdd, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    product = (
        await db.execute(select(Product).options(joinedload(Product.category)).where(Product.pid == payload.pid))
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    existing = (
        await db.execute(
            select(WishlistItem).where(WishlistItem.iduser == current_user.id, WishlistItem.idproduct == payload.pid)
        )
    ).scalar_one_or_none()
    if existing:
        return _item_to_out(existing, product)
    item = WishlistItem(iduser=current_user.id, idproduct=payload.pid)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _item_to_out(item, product)


@router.delete("/{pid}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    pid: int, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    item = (
        await db.execute(
            select(WishlistItem).where(WishlistItem.iduser == current_user.id, WishlistItem.idproduct == pid)
        )
    ).scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found")
    await db.delete(item)
    await db.commit()
