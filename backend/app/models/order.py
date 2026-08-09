from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Order(Base):
    __tablename__ = "order"

    id: Mapped[int] = mapped_column(primary_key=True)
    orderid: Mapped[str] = mapped_column(String(100), unique=True)
    status: Mapped[str] = mapped_column(String(50), default="Order Placed")
    paymentType: Mapped[str] = mapped_column(String(50))
    userId: Mapped[int | None] = mapped_column(ForeignKey("user.id"), nullable=True, index=True)
    date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    shippingAddress: Mapped[str | None] = mapped_column(String(500), nullable=True)
    totalAmount: Mapped[float] = mapped_column(Float, default=0.0)

    items: Mapped[list["OrderedProduct"]] = relationship(  # noqa: F821
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderedProduct(Base):
    __tablename__ = "ordered_product"

    oid: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Float)
    image: Mapped[str] = mapped_column(String(255))
    productId: Mapped[int | None] = mapped_column(ForeignKey("product.pid"), nullable=True)
    orderid: Mapped[int] = mapped_column(ForeignKey("order.id"))

    order: Mapped[Order] = relationship(back_populates="items")
