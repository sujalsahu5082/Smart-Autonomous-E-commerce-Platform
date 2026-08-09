from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.deps import DbSession, get_current_admin, get_current_user
from app.models import Admin, Order, OrderedProduct, Product, User
from app.schemas.order import OrderCreate, OrderOut, OrderUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


def _ordered_product_to_dict(op: OrderedProduct) -> dict:
    return {
        "oid": op.oid,
        "name": op.name,
        "quantity": op.quantity,
        "price": op.price,
        "image": op.image,
        "productId": op.productId,
    }


def _order_to_dict(order: Order) -> dict:
    return {
        "id": order.id,
        "orderid": order.orderid,
        "status": order.status,
        "paymentType": order.paymentType,
        "userId": order.userId,
        "date": order.date,
        "shippingAddress": order.shippingAddress,
        "totalAmount": order.totalAmount,
        "items": [_ordered_product_to_dict(item) for item in order.items],
    }


def _generate_order_id() -> str:
    return "ORD-" + datetime.now().strftime("%Y%m%d%H%M%S%f")


def _load_order_query():
    return select(Order).options(joinedload(Order.items))


async def _fetch_product(db: AsyncSession, pid: int) -> Product:
    product = (await db.execute(select(Product).where(Product.pid == pid))).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {pid} not found")
    return product


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def place_order(
    payload: OrderCreate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
):
    if payload.paymentMethod not in {"COD", "Credit/Debit Card", "UPI"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment method")

    total = 0.0
    ordered_products: list[OrderedProduct] = []
    cart_ids: list[int] = []
    from app.models import CartItem

    for item in payload.items:
        product = await _fetch_product(db, item.productId)
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}' (available: {product.quantity})",
            )
        product.quantity -= item.quantity
        unit_price = float(product.price_after_discount)
        total += unit_price * item.quantity
        ordered_products.append(
            OrderedProduct(
                name=product.name,
                quantity=item.quantity,
                price=unit_price,
                image=product.image,
                productId=product.pid,
            )
        )
        cart_ids.append(item.productId)

    order = Order(
        orderid=_generate_order_id(),
        paymentType=payload.paymentMethod,
        userId=current_user.id,
        shippingAddress=payload.shippingAddress,
        totalAmount=total,
        items=ordered_products,
    )
    db.add(order)

    cart_result = await db.execute(
        select(CartItem).where(CartItem.uid == current_user.id, CartItem.pid.in_(cart_ids))
    )
    for cart_item in cart_result.scalars().all():
        await db.delete(cart_item)

    await db.commit()
    order = (await db.execute(_load_order_query().where(Order.id == order.id))).scalars().unique().one()
    return _order_to_dict(order)


@router.get("", response_model=list[OrderOut])
async def list_my_orders(
    db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    result = await db.execute(
        _load_order_query().where(Order.userId == current_user.id).order_by(Order.id.desc())
    )
    return [_order_to_dict(order) for order in result.scalars().unique().all()]


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int, db: DbSession, current_user: Annotated[User, Depends(get_current_user)]
):
    order = (
        await db.execute(_load_order_query().where(Order.id == order_id))
    ).scalars().unique().one_or_none()
    if order is None or order.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _order_to_dict(order)


@router.put("/{order_id}", response_model=OrderOut)
async def update_order_status(
    order_id: int, payload: OrderUpdate, db: DbSession, current_admin: Annotated[Admin, Depends(get_current_admin)]
):
    valid_statuses = {"Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order status")
    order = (
        await db.execute(_load_order_query().where(Order.id == order_id))
    ).scalars().unique().one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = payload.status
    await db.commit()
    order = (await db.execute(_load_order_query().where(Order.id == order_id))).scalars().unique().one()
    return _order_to_dict(order)
