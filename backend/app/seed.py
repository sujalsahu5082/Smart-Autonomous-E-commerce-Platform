"""Seed the database with demo categories and products (dev helper).

Usage: uv run python -m app.seed
"""
import asyncio

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Admin, Category, Coupon, Product

CATEGORIES = [
    {"name": "Mobiles", "image": "mobiles.jpeg"},
    {"name": "Appliances", "image": "appliances.png"},
    {"name": "Laptops", "image": "newlaptop.jpeg"},
    {"name": "Home & Furniture", "image": "home-furniture.png"},
    {"name": "Books", "image": "books-.png"},
    {"name": "Clothes & Fashion", "image": "cloths.png"},
    {"name": "Electronics", "image": "electronics.png"},
]

PRODUCTS = [
    {
        "name": "SAMSUNG Galaxy F14 5G",
        "description": "The Samsung Galaxy F14 smartphone uses a segment-only 5nm processor that enables easy multitasking, gaming, and a 6000 mAh battery.",
        "price": 18490, "quantity": 9, "discount": 24, "image": "phone1.jpeg", "category": "Mobiles",
        "tags": ["5g", "smartphone", "6000mah"],
    },
    {
        "name": "LG 242 L Frost Free Double Door Refrigerator",
        "description": "Smart Inverter Compressor designed to deliver energy-efficient performance with Door Cooling+ feature.",
        "price": 37099, "quantity": 50, "discount": 29, "image": "fridge1.jpeg", "category": "Appliances",
        "tags": ["refrigerator", "frost-free", "inverter"],
    },
    {
        "name": "OnePlus Y1S Pro 138 cm Ultra HD (4K) Smart TV",
        "description": "Gamma Engine smart contrast and color max display quality for an unmatched immersive experience.",
        "price": 49999, "quantity": 5, "discount": 18, "image": "tv1.jpeg", "category": "Appliances",
        "tags": ["4k", "smart-tv", "oled"],
    },
    {
        "name": "Samsung Galaxy S23 5G",
        "description": "Flagship smartphone with Snapdragon 8 Gen 2, dynamic AMOLED 2X display, and nightography camera.",
        "price": 79999, "quantity": 10, "discount": 17, "image": "Samsung_Galaxy.jpg", "category": "Mobiles",
        "tags": ["5g", "smartphone", "flagship"],
    },
    {
        "name": "ASUS TUF Gaming A15",
        "description": "15.6 inch Full HD 144Hz IPS display, AMD Ryzen 7, NVIDIA RTX graphics card.",
        "price": 71990, "quantity": 11, "discount": 20, "image": "asus_tuf.jpeg", "category": "Laptops",
        "tags": ["gaming", "laptop", "rtx"],
    },
    {
        "name": "Men Printed Casual Jacket",
        "description": "Pure Cotton hooded casual jacket with zipper closure.",
        "price": 1999, "quantity": 15, "discount": 57, "image": "men_jacket.jpeg", "category": "Clothes & Fashion",
        "tags": ["men", "jacket", "cotton"],
    },
    {
        "name": "boAt Airdopes 161 with 40 Hours Playback",
        "description": "10mm drivers, ASAP Charge, 40 hours playback time, IPX5 water resistance.",
        "price": 2400, "quantity": 27, "discount": 42, "image": "boat-airdopes.jpeg", "category": "Electronics",
        "tags": ["earbuds", "wireless", "boat"],
    },
    {
        "name": "KURLON Natural Product 5 inch Queen Mattress",
        "description": "Firm support coir mattress with PU foam layer.",
        "price": 8000, "quantity": 11, "discount": 16, "image": "mattress.jpeg", "category": "Home & Furniture",
        "tags": ["mattress", "coir", "queen"],
    },
]

COUPONS = [
    {"code": "SAVE10", "discount_type": "percent", "discount_value": 10.0, "valid_until": None, "applicable_categories": []},
    {"code": "FLAT50", "discount_type": "fixed", "discount_value": 50.0, "valid_until": None, "applicable_categories": []},
    {"code": "MOBILE15", "discount_type": "percent", "discount_value": 15.0, "valid_until": None, "applicable_categories": [1]},
    {"code": "LAPTOP5", "discount_type": "percent", "discount_value": 5.0, "valid_until": None, "applicable_categories": [3]},
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        from sqlalchemy import select

        if (await session.execute(select(Category).limit(1))).scalar_one_or_none() is not None:
            print("Categories already exist; skipping catalog seed.")
        else:
            admin = Admin(
                name="Admin User",
                email="admin@smartecommerce.com",
                password=hash_password("admin"),
                phone="0000000000",
            )
            session.add(admin)

            cat_map = {}
            for c in CATEGORIES:
                category = Category(**c)
                session.add(category)
                cat_map[c["name"]] = category

            for p in PRODUCTS:
                session.add(
                    Product(
                        name=p["name"],
                        description=p["description"],
                        price=p["price"],
                        quantity=p["quantity"],
                        discount=p["discount"],
                        image=p["image"],
                        tags=p.get("tags", []),
                        category=cat_map[p["category"]],
                    )
                )
            await session.commit()
            print(f"Seeded {len(CATEGORIES)} categories, {len(PRODUCTS)} products, and the admin account.")

        existing_codes = set((await session.execute(select(Coupon.code))).scalars().all())
        added = 0
        for c in COUPONS:
            if c["code"] not in existing_codes:
                session.add(Coupon(**c))
                added += 1
        if added:
            await session.commit()
        print(f"Seeded {added} new coupons ({len(existing_codes)} already present).")


if __name__ == "__main__":
    asyncio.run(seed())
