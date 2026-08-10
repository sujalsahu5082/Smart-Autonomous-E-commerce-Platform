from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ChatLog(Base):
    __tablename__ = "chat_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    userId: Mapped[int | None] = mapped_column(ForeignKey("user.id"), nullable=True, index=True)
    message: Mapped[str] = mapped_column(String(500))
    intent: Mapped[str] = mapped_column(String(100), default="general search", index=True)
    product_ids: Mapped[list[Any]] = mapped_column(JSON, default=list)
    product_names: Mapped[list[Any]] = mapped_column(JSON, default=list)
    mode: Mapped[str] = mapped_column(String(20), default="fallback")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
