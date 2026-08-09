from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=500)
    price: float = Field(ge=0)
    quantity: int = Field(default=0, ge=0)
    discount: int = Field(default=0, ge=0, le=100)
    image: str = "product.png"
    tags: list[str] = Field(default_factory=list)
    cid: int


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    price: float | None = Field(default=None, ge=0)
    quantity: int | None = Field(default=None, ge=0)
    discount: int | None = Field(default=None, ge=0, le=100)
    image: str | None = None
    tags: list[str] | None = None
    cid: int | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    pid: int
    name: str
    description: str
    price: float
    quantity: int
    discount: int
    image: str
    tags: list[str] = Field(default_factory=list)
    cid: int
    category_name: str | None = None
    price_after_discount: int
