from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    image: str = "categories.png"


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    image: str | None = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cid: int
    name: str
    image: str
