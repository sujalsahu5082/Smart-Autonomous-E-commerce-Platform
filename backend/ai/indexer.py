import logging
from typing import Any

from ai.rag import retriever

logger = logging.getLogger(__name__)


async def index_product(product: dict[str, Any]) -> None:
    try:
        await retriever.aupsert([product])
    except Exception:
        logger.exception("Failed to index product %s in vector store", product.get("pid"))


async def remove_product(pid: int) -> None:
    try:
        await retriever.adelete(pid)
    except Exception:
        logger.exception("Failed to remove product %s from vector store", pid)
