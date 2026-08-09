from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CartItem(Base):
    __tablename__ = "cart"

    id: Mapped[int] = mapped_column(primary_key=True)
    uid: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)
    pid: Mapped[int] = mapped_column(ForeignKey("product.pid"), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    product: Mapped["Product"] = relationship()  # noqa: F821
