from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Coupon(Base):
    __tablename__ = "coupon"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    discount_type: Mapped[str] = mapped_column(String(10), default="percent")  # "percent" | "fixed"
    discount_value: Mapped[float] = mapped_column(Float)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    applicable_categories: Mapped[list[Any]] = mapped_column(JSON, default=list)  # empty = all categories
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
