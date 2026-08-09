import asyncio
import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class ProductRetriever:
    """ChromaDB-backed vector search over the product catalog (RAG retrieval).

    Deliberately decoupled from the CRUD/API layer: it only consumes plain
    product dicts and returns plain dicts. ChromaDB is imported lazily so a
    missing/unhealthy vector store degrades gracefully (callers fall back).
    """

    def __init__(self, persist_dir: str | None = None, collection_name: str | None = None) -> None:
        self.persist_dir = persist_dir or settings.chroma_persist_dir
        self.collection_name = collection_name or settings.chroma_collection
        self._client = None
        self._collection = None

    def _ensure_client(self) -> None:
        if self._client is None:
            import chromadb

            self._client = chromadb.PersistentClient(path=self.persist_dir)
            self._collection = self._client.get_or_create_collection(self.collection_name)

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

    def search(self, query: str, top_k: int = 10) -> list[dict[str, Any]]:
        self._ensure_client()
        results = self._collection.query(query_texts=[query], n_results=max(1, top_k))
        metas = (results.get("metadatas") or [[]])[0]
        return [m for m in metas if m is not None]

    async def asearch(self, query: str, top_k: int = 10) -> list[dict[str, Any]]:
        return await asyncio.to_thread(self.search, query, top_k)

    async def aupsert(self, products: list[dict[str, Any]]) -> None:
        await asyncio.to_thread(self.upsert_products, products)

    async def adelete(self, pid: int) -> None:
        await asyncio.to_thread(self.delete_product, pid)


retriever = ProductRetriever()
