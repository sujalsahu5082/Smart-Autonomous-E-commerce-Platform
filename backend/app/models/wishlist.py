from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WishlistItem(Base):
    __tablename__ = "wishlist"

    id: Mapped[int] = mapped_column(primary_key=True)
    iduser: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)
    idproduct: Mapped[int] = mapped_column(ForeignKey("product.pid"), index=True)

    product: Mapped["Product"] = relationship()  # noqa: F821
