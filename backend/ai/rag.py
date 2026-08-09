import asyncio
import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class ProductRetriever:
    """ChromaDB-backed vector search over the product catalog (RAG retrieval).

    Two collections:
      - products: one document per product (name + description), pid in metadata
      - reviews:  one document per review (rating + comment), productId in metadata

    Deliberately decoupled from the CRUD/API layer: it only consumes plain
    dicts and returns plain dicts. ChromaDB is imported lazily so a
    missing/unhealthy vector store degrades gracefully (callers fall back).
    """

    REVIEWS_COLLECTION = "reviews"

    def __init__(self, persist_dir: str | None = None, collection_name: str | None = None) -> None:
        self.persist_dir = persist_dir or settings.chroma_persist_dir
        self.collection_name = collection_name or settings.chroma_collection
        self._client = None
        self._collection = None
        self._reviews_collection = None

    def _ensure_client(self) -> None:
        if self._client is None:
            import chromadb

            self._client = chromadb.PersistentClient(path=self.persist_dir)
            self._collection = self._client.get_or_create_collection(self.collection_name)
            self._reviews_collection = self._client.get_or_create_collection(self.REVIEWS_COLLECTION)

    # ---- products -----------------------------------------------------------

    def upsert_products(self, products: list[dict[str, Any]]) -> None:
        if not products:
            return
        self._ensure_client()
        self._collection.upsert(
            ids=[str(p["pid"]) for p in products],
            documents=[f"{p['name']}\n{p.get('description', '')}" for p in products],
            metadatas=[
                {k: v for k, v in p.items() if v is not None and k != "description"} for p in products
            ],
        )

    def delete_product(self, pid: int) -> None:
        self._ensure_client()
        self._collection.delete(ids=[str(pid)])
        self.delete_reviews_for_product(pid)

    def search(self, query: str, top_k: int = 10) -> list[dict[str, Any]]:
        self._ensure_client()
        results = self._collection.query(query_texts=[query], n_results=max(1, top_k))
        metas = (results.get("metadatas") or [[]])[0]
        return [m for m in metas if m is not None]

    # ---- reviews ------------------------------------------------------------

    def upsert_reviews(self, reviews: list[dict[str, Any]]) -> None:
        if not reviews:
            return
        self._ensure_client()
        self._reviews_collection.upsert(
            ids=[str(r["id"]) for r in reviews],
            documents=[f"Rating: {r.get('rating', 0)}/5. {r.get('comment') or ''}" for r in reviews],
            metadatas=[
                {k: v for k, v in r.items() if v is not None and k not in ("comment", "text")} for r in reviews
            ],
        )

    def delete_reviews_for_product(self, product_id: int) -> None:
        self._ensure_client()
        try:
            self._reviews_collection.delete(where={"productId": int(product_id)})
        except Exception:
            logger.warning("Failed to delete reviews for product %s from vector store", product_id)

    def get_review_summary_context(self, product_id: int, top_k: int = 5) -> list[dict[str, Any]]:
        """Retrieve the most relevant review chunks for a product."""
        self._ensure_client()
        try:
            results = self._reviews_collection.query(
                query_texts=[f"customer reviews for product {product_id}"],
                n_results=max(1, top_k),
                where={"productId": int(product_id)},
            )
        except Exception:
            logger.warning("Review context query failed for product %s", product_id, exc_info=True)
            return []
        metas = (results.get("metadatas") or [[]])[0]
        return [m for m in metas if m is not None]

    # ---- async wrappers (run sync chroma calls off the event loop) ----------

    async def asearch(self, query: str, top_k: int = 10) -> list[dict[str, Any]]:
        return await asyncio.to_thread(self.search, query, top_k)

    async def aupsert(self, products: list[dict[str, Any]]) -> None:
        await asyncio.to_thread(self.upsert_products, products)

    async def adelete(self, pid: int) -> None:
        await asyncio.to_thread(self.delete_product, pid)

    async def aupsert_reviews(self, reviews: list[dict[str, Any]]) -> None:
        await asyncio.to_thread(self.upsert_reviews, reviews)

    async def adelete_reviews_for_product(self, product_id: int) -> None:
        await asyncio.to_thread(self.delete_reviews_for_product, product_id)

    async def aget_review_summary_context(self, product_id: int, top_k: int = 5) -> list[dict[str, Any]]:
        return await asyncio.to_thread(self.get_review_summary_context, product_id, top_k)


retriever = ProductRetriever()
