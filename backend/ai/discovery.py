import asyncio
import logging
from typing import Any

from ai.agents import build_discovery_crew
from app.core.config import settings

logger = logging.getLogger(__name__)

FALLBACK_MODE = "fallback"
CREWAI_MODE = "crewai"


def _fallback_answer(query: str, products: list[dict]) -> str:
    if not products:
        return (
            f"I couldn't find any products matching \"{query}\" right now. "
            "Try different keywords, or browse the catalog."
        )
    top = products[0]
    lines = [
        f"Based on your query \"{query}\", here are the best matches from our catalog:",
        *[f"- {p['name']} — {p['price_after_discount']} (was {p['price']})" for p in products[:5]],
        f"Top pick: {top['name']} at {top['price_after_discount']}.",
        "Note: AI agents are not configured yet — set GROQ_API_KEY to enable CrewAI-powered discovery.",
    ]
    return "\n".join(lines)


def _run_crew(
    query: str, products: list[dict], user_context: dict, reviews: list[dict], coupons: list[dict]
) -> str:
    crew = build_discovery_crew(query, products, user_context, reviews, coupons)
    result = crew.kickoff()
    return str(result)


async def run_discovery(
    query: str,
    products: list[dict],
    user_context: dict | None = None,
    reviews: list[dict] | None = None,
    coupons: list[dict] | None = None,
) -> tuple[str, str]:
    """Run conversational product discovery.

    Returns (answer, mode) where mode is "crewai" when agents executed or
    "fallback" when Groq is unconfigured or the crew failed.
    """
    if not settings.groq_api_key:
        logger.info("GROQ_API_KEY not set; using fallback discovery")
        return _fallback_answer(query, products), FALLBACK_MODE
    try:
        answer = await asyncio.to_thread(
            _run_crew, query, products, user_context or {}, reviews or [], coupons or []
        )
        return answer, CREWAI_MODE
    except Exception:
        logger.exception("CrewAI discovery failed; returning fallback answer")
        return _fallback_answer(query, products), FALLBACK_MODE
