from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.cart import router as cart_router
from app.api.categories import router as categories_router
from app.api.discovery import router as discovery_router
from app.api.orders import router as orders_router
from app.api.products import router as products_router
from app.api.reviews import router as reviews_router
from app.api.search import router as search_router
from app.api.wishlist import router as wishlist_router
from app.core.config import settings
from app.db.init_db import create_db_and_tables, seed_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    await seed_admin()
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", debug=settings.debug, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(categories_router, prefix=settings.api_prefix)
app.include_router(products_router, prefix=settings.api_prefix)
app.include_router(cart_router, prefix=settings.api_prefix)
app.include_router(wishlist_router, prefix=settings.api_prefix)
app.include_router(orders_router, prefix=settings.api_prefix)
app.include_router(reviews_router, prefix=settings.api_prefix)
app.include_router(search_router, prefix=settings.api_prefix)
app.include_router(discovery_router, prefix=settings.api_prefix)
app.include_router(admin_router, prefix=settings.api_prefix)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
