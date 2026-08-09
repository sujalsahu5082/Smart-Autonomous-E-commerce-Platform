from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CouponCreate(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    discount_type: Literal["percent", "fixed"] = "percent"
    discount_value: float = Field(gt=0)
    valid_until: datetime | None = None
    applicable_categories: list[int] = Field(default_factory=list)


class CouponOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    discount_type: str
    discount_value: float
    valid_until: datetime | None
    applicable_categories: list[int]
    created_at: datetime
