from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductOut


class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    iduser: int
    idproduct: int
    product: ProductOut | None = None
