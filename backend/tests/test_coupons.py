from datetime import datetime, timedelta

from app.models import Coupon
from app.services.coupons import get_applicable_coupons


async def _create_coupon(client, admin_token, code, **overrides):
    payload = {
        "code": code,
        "discount_type": "percent",
        "discount_value": 10.0,
        "applicable_categories": [],
    }
    payload.update(overrides)
    return await client.post(
        "/api/admin/coupons", json=payload, headers={"Authorization": f"Bearer {admin_token}"}
    )


async def test_admin_coupon_crud(client, admin_token):
    resp = await _create_coupon(client, admin_token, "SAVE10")
    assert resp.status_code == 201
    body = resp.json()
    assert body["code"] == "SAVE10"
    assert body["discount_type"] == "percent"

    dup = await _create_coupon(client, admin_token, "SAVE10")
    assert dup.status_code == 400

    listed = await client.get("/api/admin/coupons", headers={"Authorization": f"Bearer {admin_token}"})
    assert listed.status_code == 200
    assert any(c["code"] == "SAVE10" for c in listed.json())

    deleted = await client.delete(
        f"/api/admin/coupons/{body['id']}", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert deleted.status_code == 204


async def test_admin_coupon_requires_admin(client):
    await client.post(
        "/api/auth/register",
        json={"name": "User A", "email": "a@example.com", "password": "secret123", "phone": "1111111111"},
    )
    login = await client.post("/api/auth/login", json={"email": "a@example.com", "password": "secret123"})
    user_token = login.json()["access_token"]
    resp = await client.get("/api/admin/coupons", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 401


async def test_coupon_applicability_by_category(tmp_path):
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.db.base import Base

    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path}/coupons.db")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async with factory() as db:
        db.add_all(
            [
                Coupon(code="ALL10", discount_type="percent", discount_value=10.0),
                Coupon(code="MOB5", discount_type="percent", discount_value=5.0, applicable_categories=[1]),
                Coupon(
                    code="EXP50",
                    discount_type="percent",
                    discount_value=50.0,
                    valid_until=datetime.utcnow() - timedelta(days=1),
                ),
            ]
        )
        await db.commit()

        mobile_codes = {c.code for c in await get_applicable_coupons(db, [1])}
        assert {"ALL10", "MOB5"} <= mobile_codes
        assert "EXP50" not in mobile_codes

        laptop_codes = {c.code for c in await get_applicable_coupons(db, [3])}
        assert "MOB5" not in laptop_codes
        assert "ALL10" in laptop_codes
    await engine.dispose()
