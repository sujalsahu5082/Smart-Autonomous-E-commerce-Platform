from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "category"

    cid: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    image: Mapped[str] = mapped_column(String(255), default="categories.png")

    products: Mapped[list["Product"]] = relationship(back_populates="category")  # noqa: F821
