from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.schemas.product import ProductOut
from app.services.retrieval import retrieve_products

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[ProductOut])
async def search_products(
    db: DbSession,
    q: str = Query(min_length=1, max_length=200),
    top_k: int = Query(default=10, ge=1, le=100),
):
    """RAG-based product retrieval via ChromaDB, falling back to SQL LIKE search."""
    return await retrieve_products(db, q, top_k)
