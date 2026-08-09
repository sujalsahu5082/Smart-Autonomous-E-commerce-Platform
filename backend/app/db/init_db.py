import app.models  # noqa: F401  (register all models on Base.metadata)
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Admin


async def create_db_and_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_admin() -> None:
    async with SessionLocal() as session:
        from sqlalchemy import select

        existing = await session.execute(
            select(Admin).where(Admin.email == "admin@smartecommerce.com")
        )
        if existing.scalar_one_or_none() is not None:
            return
        session.add(
            Admin(
                name="Admin User",
                email="admin@smartecommerce.com",
                password=hash_password("admin"),
                phone="0000000000",
            )
        )
        await session.commit()
