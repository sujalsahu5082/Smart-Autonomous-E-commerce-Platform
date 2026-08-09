from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.product import ProductOut

PAYMENT_METHODS = {"COD", "Credit/Debit Card", "UPI"}
ORDER_STATUSES = {"Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"}


class OrderItemCreate(BaseModel):
    productId: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(min_length=1)
    paymentMethod: str
    shippingAddress: str | None = None


class OrderUpdate(BaseModel):
    status: str


class OrderedProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    oid: int
    name: str
    quantity: int
    price: float
    image: str
    productId: int | None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    orderid: str
    status: str
    paymentType: str
    userId: int | None
    date: datetime
    shippingAddress: str | None
    totalAmount: float
    items: list[OrderedProductOut]
