from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.api.deps import DbSession, get_current_user
from app.api.serializers import product_to_out
from app.models import CartItem, Product, User
from app.schemas.cart import CartItemOut

router = APIRouter(prefix="/cart", tags=["cart"])


class CartAdd(BaseModel):
    pid: int
    quantity: int = Field(default=1, ge=1)


class CartUpdate(BaseModel):
    quantity: int = Field(ge=1)


def _cart_item_to_out(item: CartItem, product: Product | None) -> dict:
    return {
        "id": item.id,
        "uid": item.uid,
        "pid": item.pid,
        "quantity": item.quantity,
        "product": product_to_out(product) if product else None,
    }


async def _get_product(db: DbSession, pid: int) -> Product:
    product = (
        await db.execute(select(Product).options(joinedload(Product.category)).where(Product.pid == pid))
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("", response_model=list[CartItemOut])
async def get_cart(db: DbSession, current_user: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(
        select(CartItem).options(joinedload(CartItem.product).joinedload(Product.category)).where(CartItem.uid == current_user.id)
    )
    items = result.scalars().unique().all()
    return [
        {"id": i.id, "uid": i.uid, "pid": i.pid, "quantity": i.quantity, "product": product_to_out(i.product) if i.product else None}
        for i in items
    ]


@router.post("", response_model=CartItemOut, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    payload: CartAdd, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    product = await _get_product(db, payload.pid)
    existing = (
        await db.execute(select(CartItem).where(CartItem.uid == current_user.id, CartItem.pid == payload.pid))
    ).scalar_one_or_none()
    if existing:
        existing.quantity += payload.quantity
        if existing.quantity > product.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.quantity} units in stock",
            )
        await db.commit()
        return _cart_item_to_out(existing, product)
    if payload.quantity > product.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Only {product.quantity} units in stock"
        )
    item = CartItem(uid=current_user.id, pid=payload.pid, quantity=payload.quantity)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _cart_item_to_out(item, product)


@router.put("/{item_id}", response_model=CartItemOut)
async def update_cart_item(
    item_id: int, payload: CartUpdate, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    item = await db.get(CartItem, item_id)
    if item is None or item.uid != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    product = await _get_product(db, item.pid)
    if payload.quantity > product.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Only {product.quantity} units in stock"
        )
    item.quantity = payload.quantity
    await db.commit()
    return _cart_item_to_out(item, product)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: int, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    item = await db.get(CartItem, item_id)
    if item is None or item.uid != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    await db.delete(item)
    await db.commit()
