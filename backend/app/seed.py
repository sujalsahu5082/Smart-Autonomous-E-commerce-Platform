"""Seed the database with demo categories and products (dev helper).

Usage: uv run python -m app.seed
"""
import asyncio

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Admin, Category, Coupon, Product

CATEGORIES = [
    {"name": "Mobiles", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80"},
    {"name": "Appliances", "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80"},
    {"name": "Laptops", "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80"},
    {"name": "Home & Furniture", "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80"},
    {"name": "Books", "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80"},
    {"name": "Clothes & Fashion", "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80"},
    {"name": "Electronics", "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&auto=format&fit=crop&q=80"},
]

PRODUCTS = [
    {
        "name": "SAMSUNG Galaxy F14 5G",
        "description": "The Samsung Galaxy F14 smartphone uses a segment-only 5nm processor that enables easy multitasking, gaming, and a 6000 mAh battery.",
        "price": 18490, "quantity": 9, "discount": 24,
        "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
        "category": "Mobiles", "tags": ["5g", "smartphone", "6000mah"],
    },
    {
        "name": "LG 242 L Frost Free Double Door Refrigerator",
        "description": "Smart Inverter Compressor designed to deliver energy-efficient performance with Door Cooling+ feature.",
        "price": 37099, "quantity": 50, "discount": 29,
        "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
        "category": "Appliances", "tags": ["refrigerator", "frost-free", "inverter"],
    },
    {
        "name": "OnePlus Y1S Pro 138 cm Ultra HD (4K) Smart TV",
        "description": "Gamma Engine smart contrast and color max display quality for an unmatched immersive experience.",
        "price": 49999, "quantity": 5, "discount": 18,
        "image": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80",
        "category": "Appliances", "tags": ["4k", "smart-tv", "oled"],
    },
    {
        "name": "Samsung Galaxy S23 5G",
        "description": "Flagship smartphone with Snapdragon 8 Gen 2, dynamic AMOLED 2X display, and nightography camera.",
        "price": 79999, "quantity": 10, "discount": 17,
        "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
        "category": "Mobiles", "tags": ["5g", "smartphone", "flagship"],
    },
    {
        "name": "ASUS TUF Gaming A15",
        "description": "15.6 inch Full HD 144Hz IPS display, AMD Ryzen 7, NVIDIA RTX graphics card.",
        "price": 71990, "quantity": 11, "discount": 20,
        "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
        "category": "Laptops", "tags": ["gaming", "laptop", "rtx"],
    },
    {
        "name": "Men Printed Casual Jacket",
        "description": "Pure Cotton hooded casual jacket with zipper closure.",
        "price": 1999, "quantity": 15, "discount": 57,
        "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
        "category": "Clothes & Fashion", "tags": ["men", "jacket", "cotton"],
    },
    {
        "name": "boAt Airdopes 161 with 40 Hours Playback",
        "description": "10mm drivers, ASAP Charge, 40 hours playback time, IPX5 water resistance.",
        "price": 2400, "quantity": 27, "discount": 42,
        "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["earbuds", "wireless", "boat"],
    },
    {
        "name": "KURLON Natural Product 5 inch Queen Mattress",
        "description": "Firm support coir mattress with PU foam layer.",
        "price": 8000, "quantity": 11, "discount": 16,
        "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=80",
        "category": "Home & Furniture", "tags": ["mattress", "coir", "queen"],
    },
    # ---- Additional Electronics ----
    {
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "description": "Industry-leading noise cancellation with two processors and 8 microphones for unparalleled sound quality and crystal clear hands-free calling.",
        "price": 29990, "quantity": 15, "discount": 15,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["headphones", "sony", "noise-canceling", "bluetooth"],
    },
    {
        "name": "Apple Watch Series 9 GPS 45mm",
        "description": "Advanced health sensors, Double Tap gesture control, brighter Always-On Retina display, and powerful S9 SiP chip.",
        "price": 41900, "quantity": 20, "discount": 12,
        "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["apple", "smartwatch", "fitness", "oled"],
    },
    {
        "name": "Canon EOS R50 Mirrorless Camera",
        "description": "Compact 24.2 MP APS-C sensor camera featuring Dual Pixel CMOS AF II, 4K 30p uncropped video recording, and high-speed shooting.",
        "price": 64995, "quantity": 8, "discount": 10,
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["camera", "canon", "mirrorless", "4k"],
    },
    {
        "name": "JBL Flip 6 Portable Bluetooth Speaker",
        "description": "Bold sound with 2-way speaker system, IP67 waterproof and dustproof rating, 12 hours of playtime, and PartyBoost pairing.",
        "price": 11999, "quantity": 35, "discount": 25,
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["speaker", "jbl", "bluetooth", "waterproof"],
    },
    # ---- Additional Clothes & Fashion ----
    {
        "name": "Women Floral Print A-Line Maxi Dress",
        "description": "Elegant breathable rayon fabric maxi dress featuring stylish flutter sleeves and a tiered flared hemline.",
        "price": 2499, "quantity": 25, "discount": 40,
        "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
        "category": "Clothes & Fashion", "tags": ["women", "dress", "fashion", "floral"],
    },
    {
        "name": "Men Slim Fit Stretchable Denim Jeans",
        "description": "Premium cotton-stretch dark indigo denim jeans with classic 5-pocket styling and comfortable slim fit.",
        "price": 2999, "quantity": 30, "discount": 45,
        "image": "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80",
        "category": "Clothes & Fashion", "tags": ["men", "jeans", "denim", "fashion"],
    },
    {
        "name": "Unisex Heavyweight Oversized Hoodie",
        "description": "Ultra-soft 380 GSM fleece lined cotton hoodie featuring dropped shoulders and a kangaroo front pocket.",
        "price": 3499, "quantity": 22, "discount": 35,
        "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
        "category": "Clothes & Fashion", "tags": ["unisex", "hoodie", "streetwear", "cotton"],
    },
    {
        "name": "Women Genuine Leather Crossbody Sling Bag",
        "description": "Crafted from 100% genuine top-grain leather with adjustable strap, gold-tone hardware, and multi-compartment storage.",
        "price": 4299, "quantity": 18, "discount": 30,
        "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
        "category": "Clothes & Fashion", "tags": ["women", "bag", "handbag", "leather"],
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
        from sqlalchemy import select, update

        # Seed admin if missing
        admin_stmt = select(Admin).where(Admin.email == "admin@smartecommerce.com")
        if (await session.execute(admin_stmt)).scalar_one_or_none() is None:
            admin = Admin(
                name="Admin User",
                email="admin@smartecommerce.com",
                password=hash_password("admin"),
                phone="0000000000",
            )
            session.add(admin)

        # Seed or update categories
        cat_map = {}
        for c in CATEGORIES:
            stmt = select(Category).where(Category.name == c["name"])
            existing_cat = (await session.execute(stmt)).scalar_one_or_none()
            if existing_cat is None:
                category = Category(**c)
                session.add(category)
                cat_map[c["name"]] = category
            else:
                existing_cat.image = c["image"]
                cat_map[c["name"]] = existing_cat

        await session.flush()

        # Seed or update products with real image URLs
        updated_products = 0
        added_products = 0
        for p in PRODUCTS:
            stmt = select(Product).where(Product.name == p["name"])
            existing_prod = (await session.execute(stmt)).scalar_one_or_none()
            category_obj = cat_map.get(p["category"])
            if existing_prod is None:
                if category_obj:
                    session.add(
                        Product(
                            name=p["name"],
                            description=p["description"],
                            price=p["price"],
                            quantity=p["quantity"],
                            discount=p["discount"],
                            image=p["image"],
                            tags=p.get("tags", []),
                            category=category_obj,
                        )
                    )
                    added_products += 1
            else:
                existing_prod.image = p["image"]
                if category_obj:
                    existing_prod.category = category_obj
                updated_products += 1

        await session.commit()
        print(f"Catalog sync: added {added_products} new products, updated {updated_products} existing product images.")

        # Seed coupons
        existing_codes = set((await session.execute(select(Coupon.code))).scalars().all())
        added_coupons = 0
        for c in COUPONS:
            if c["code"] not in existing_codes:
                session.add(Coupon(**c))
                added_coupons += 1
        if added_coupons:
            await session.commit()
        print(f"Seeded {added_coupons} new coupons ({len(existing_codes)} already present).")


if __name__ == "__main__":
    asyncio.run(seed())
