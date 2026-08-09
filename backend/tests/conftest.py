import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Admin

TEST_DB_URL = "sqlite+aiosqlite:///./test_ecommerce.db"


@pytest.fixture
async def client():
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with session_factory() as session:
            yield session

    async with session_factory() as session:
        existing = await session.execute(
            select(Admin).where(Admin.email == "admin@smartecommerce.com")
        )
        if existing.scalar_one_or_none() is None:
            session.add(
                Admin(
                    name="Admin User",
                    email="admin@smartecommerce.com",
                    password=hash_password("admin"),
                    phone="0000000000",
                )
            )
            await session.commit()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.fixture
async def admin_token(client) -> str:
    resp = await client.post(
        "/api/auth/admin-login", json={"email": "admin@smartecommerce.com", "password": "admin"}
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]
