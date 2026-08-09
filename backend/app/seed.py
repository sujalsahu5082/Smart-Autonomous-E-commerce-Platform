"""Seed the database with demo categories and products (dev helper).

Usage: uv run python -m app.seed
"""
import asyncio

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Admin, Category, Coupon, Product, Review, User

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
        "image": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80",
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
        "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
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
    # ---- Laptops & Mobiles ----
    {
        "name": "MacBook Air 13 M3",
        "description": "Apple M3 chip, 8-core CPU, 10-core GPU, 18 hours battery life, Liquid Retina display.",
        "price": 114900, "quantity": 7, "discount": 5,
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
        "category": "Laptops", "tags": ["apple", "laptop", "m3", "macbook"],
    },
    {
        "name": "Dell XPS 13 9340",
        "description": "13.4 inch InfinityEdge touch display, Intel Core Ultra 7, 32GB RAM, premium aluminium body.",
        "price": 129990, "quantity": 4, "discount": 8,
        "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
        "category": "Laptops", "tags": ["dell", "laptop", "ultrabook"],
    },
    {
        "name": "HP Pavilion 15 Core i5",
        "description": "11th Gen Intel Core i5, 8GB RAM, 512GB SSD, FHD IPS display with micro-edge bezel.",
        "price": 52990, "quantity": 14, "discount": 12,
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
        "category": "Laptops", "tags": ["hp", "laptop", "i5"],
    },
    {
        "name": "OnePlus 12 5G",
        "description": "Snapdragon 8 Gen 3, Hasselblad triple camera, 2K 120Hz ProXDR display, 5400 mAh battery.",
        "price": 64999, "quantity": 12, "discount": 10,
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
        "category": "Mobiles", "tags": ["oneplus", "smartphone", "5g"],
    },
    {
        "name": "iPhone 15 Pro Max",
        "description": "A17 Pro chip, titanium design, 48MP pro camera system, Dynamic Island.",
        "price": 144900, "quantity": 6, "discount": 6,
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
        "category": "Mobiles", "tags": ["apple", "iphone", "smartphone"],
    },
    # ---- Appliances & Home ----
    {
        "name": "IFB 6 Kg Front Load Washing Machine",
        "description": "Steam wash technology, 6 kg capacity, 1400 RPM, 5-star energy rating with inbuilt heater.",
        "price": 28990, "quantity": 9, "discount": 22,
        "image": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80",
        "category": "Appliances", "tags": ["washing-machine", "ifb", "front-load"],
    },
    {
        "name": "Philips Air Fryer HD9252",
        "description": "Rapid Air technology, 90% less fat, digital touchscreen, 4.5L capacity for family meals.",
        "price": 8999, "quantity": 20, "discount": 28,
        "image": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80",
        "category": "Appliances", "tags": ["air-fryer", "philips", "kitchen"],
    },
    {
        "name": "Urban Ladder Wooden Bookshelf",
        "description": "Solid sheesham wood 5-tier bookshelf with honey finish, sturdy frame and easy assembly.",
        "price": 14500, "quantity": 8, "discount": 18,
        "image": "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&auto=format&fit=crop&q=80",
        "category": "Home & Furniture", "tags": ["bookshelf", "wooden", "furniture"],
    },
    {
        "name": "Duroflex Orthopaedic Memory Foam Pillow",
        "description": "Contoured memory foam pillow with cooling gel layer, ideal for neck and back support.",
        "price": 1499, "quantity": 40, "discount": 25,
        "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
        "category": "Home & Furniture", "tags": ["pillow", "memory-foam", "sleep"],
    },
    # ---- Books ----
    {
        "name": "Atomic Habits by James Clear",
        "description": "Proven framework for improving every day with small changes that compound into remarkable results.",
        "price": 799, "quantity": 60, "discount": 30,
        "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
        "category": "Books", "tags": ["self-help", "habits", "bestseller"],
    },
    {
        "name": "The Psychology of Money",
        "description": "Timeless lessons on wealth, greed, and happiness told through 19 short stories.",
        "price": 599, "quantity": 55, "discount": 25,
        "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80",
        "category": "Books", "tags": ["finance", "money", "bestseller"],
    },
    {
        "name": "Rich Dad Poor Dad",
        "description": "What the rich teach their kids about money that the poor and middle class do not.",
        "price": 449, "quantity": 70, "discount": 35,
        "image": "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=600&auto=format&fit=crop&q=80",
        "category": "Books", "tags": ["finance", "investing", "classic"],
    },
    # ---- More Electronics ----
    {
        "name": "Logitech MX Master 3S Mouse",
        "description": "8K DPI laser sensor, silent clicks, 70-day battery, MagSpeed electromagnetic scrolling.",
        "price": 8995, "quantity": 25, "discount": 15,
        "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["mouse", "logitech", "wireless"],
    },
    {
        "name": "Samsung 1TB Portable SSD T7",
        "description": "USB 3.2 Gen 2 speeds up to 1050 MB/s, shock-resistant aluminium body, pocket-size storage.",
        "price": 10500, "quantity": 16, "discount": 20,
        "image": "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["ssd", "samsung", "storage"],
    },
    {
        "name": "Anker 20W USB-C Power Adapter",
        "description": "Compact fast charger with GaN technology, universal compatibility with USB-C devices.",
        "price": 1499, "quantity": 80, "discount": 10,
        "image": "https://images.unsplash.com/photo-1609592806595-81a1dccd4871?w=600&auto=format&fit=crop&q=80",
        "category": "Electronics", "tags": ["charger", "anker", "usb-c"],
    },
]

REVIEWS = [
    "Excellent product, exactly as described. Very happy with the purchase!",
    "Good quality for the price. Delivery was fast and packaging was neat.",
    "Works perfectly, though the setup took a little longer than expected.",
    "Amazing value for money. Would definitely recommend to friends.",
    "Solid build quality. Battery life is great, using it daily since a month.",
    "Decent product but the color looked slightly different in person.",
    "Five stars! Exceeded my expectations in every way.",
    "Average experience. Does the job but nothing exceptional.",
    "Really impressed with the performance and build quality.",
    "Great features for the price point. Highly satisfied.",
    "Been using it for two weeks now, no complaints at all.",
    "The quality is top notch and customer service was responsive.",
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

        # Seed fake reviews (idempotent: only for products that have none)
        demo_email = "demo@smartecommerce.com"
        demo_user = (await session.execute(select(User).where(User.email == demo_email))).scalar_one_or_none()
        if demo_user is None:
            demo_user = User(
                name="Demo Shopper",
                email=demo_email,
                password=hash_password("demo123"),
                phone="9999999999",
            )
            session.add(demo_user)
            await session.flush()

        products = (await session.execute(select(Product).order_by(Product.pid))).scalars().all()
        added_reviews = 0
        for product in products:
            has_reviews = (
                await session.execute(select(Review.id).where(Review.productId == product.pid).limit(1))
            ).scalar_one_or_none()
            if has_reviews is not None:
                continue
            import random

            rng = random.Random(product.pid)
            count = rng.randint(2, 4)
            for i in range(count):
                rating = rng.choices([5, 4, 3, 2], weights=[50, 30, 12, 8])[0]
                comment = rng.choice(REVIEWS)
                session.add(
                    Review(
                        productId=product.pid,
                        userId=demo_user.id,
                        rating=rating,
                        comment=comment,
                    )
                )
                added_reviews += 1
        if added_reviews:
            await session.commit()
        print(f"Seeded {added_reviews} fake reviews across {len(products)} products.")


if __name__ == "__main__":
    asyncio.run(seed())
