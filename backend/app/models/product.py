from typing import Any

from sqlalchemy import JSON, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "product"

    pid: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    description: Mapped[str] = mapped_column(String(500), default="")
    price: Mapped[float] = mapped_column(Float)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    discount: Mapped[int] = mapped_column(Integer, default=0)
    image: Mapped[str] = mapped_column(String(255), default="product.png")
    tags: Mapped[list[Any]] = mapped_column(JSON, default=list)
    cid: Mapped[int] = mapped_column(ForeignKey("category.cid"), index=True)

    category: Mapped["Category"] = relationship(back_populates="products")  # noqa: F821
    reviews: Mapped[list["Review"]] = relationship(back_populates="product", cascade="all, delete-orphan")  # noqa: F821

    @property
    def price_after_discount(self) -> int:
        return max(0, round(self.price * (1 - self.discount / 100)))
