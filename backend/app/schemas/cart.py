from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductOut


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uid: int
    pid: int
    quantity: int
    product: ProductOut | None = None
