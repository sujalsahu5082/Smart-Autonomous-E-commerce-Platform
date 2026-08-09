import asyncio
import json
import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

FALLBACK_MODE = "fallback"
CREWAI_MODE = "crewai"
GROQ_MODE = "groq_llama"


def _json(data: Any) -> str:
    return json.dumps(data, indent=2, default=str)[:6000]


def _fallback_answer(query: str, products: list[dict]) -> str:
    if not products:
        return (
            f'I couldn\'t find any products matching "{query}" right now. '
            'Try searching for electronics, mobiles, laptops, fashion, or appliances!'
        )
    top = products[0]
    discount_price = top.get('price_after_discount', top.get('price'))
    lines = [
        f'Based on your request for "{query}", here are our top recommendations:',
        *[
            f"• {p['name']} — ₹{p.get('price_after_discount', p.get('price')):,} ({p.get('discount', 0)}% OFF)"
            for p in products[:5]
        ],
        f"\n⭐ Top Highlight: {top['name']} at ₹{discount_price:,}!",
    ]
    return "\n".join(lines)


def _run_crew(
    query: str, products: list[dict], user_context: dict, reviews: list[dict], coupons: list[dict]
) -> str:
    from ai.agents import build_discovery_crew

    crew = build_discovery_crew(query, products, user_context, reviews, coupons)
    result = crew.kickoff()
    return str(result)


def _groq_direct(query: str, products: list[dict], user_context: dict, reviews: list[dict], coupons: list[dict]) -> str:
    """Direct Groq Llama 3.3 call (fallback when the crew is unavailable)."""
    from ai.llm import call_llm

    system_prompt = (
        "You are Smart E-Commerce's official AI Shopping Assistant powered by Groq & Llama 3.3. "
        "Your goal is to provide concise, friendly, helpful, and accurate recommendations to customers.\n\n"
        "Rules:\n"
        "1. Reference specific products, prices, and discounts from the Catalog provided below.\n"
        "2. Highlight active coupons or discounts if applicable.\n"
        "3. Keep your tone enthusiastic, polite, professional, and conversational.\n\n"
        f"Catalog Products:\n{_json(products)}\n\n"
        f"Active Coupons:\n{_json(coupons or [])}\n\n"
        f"Customer Reviews:\n{_json(reviews or [])}\n\n"
        f"Customer Profile:\n{_json(user_context or {})}"
    )
    res = call_llm(system_prompt, query)
    return res.get("content") or ""


def run_shopping_crew(
    query: str,
    products: list[dict],
    session_context: dict | None = None,
    reviews: list[dict] | None = None,
    coupons: list[dict] | None = None,
) -> dict[str, Any]:
    """Run the CrewAI discovery crew (Phase 5).

    Returns a structured response: {"message", "products", "coupons"}. The
    message comes from the crew; products and coupons are the deterministic
    inputs (crew-composed output is not parsed for structure, keeping the
    API contract stable even when the model is flaky).
    """
    context = session_context or {}
    message = _run_crew(query, products, context, reviews or [], coupons or [])
    return {"message": message, "products": products, "coupons": coupons or []}


async def run_discovery(
    query: str,
    products: list[dict],
    user_context: dict | None = None,
    reviews: list[dict] | None = None,
    coupons: list[dict] | None = None,
) -> tuple[str, str]:
    """Run conversational product discovery.

    Strategy (crew primary, Groq fallback):
      1. CrewAI hierarchical crew  -> mode "crewai"
      2. Direct Groq Llama 3.3     -> mode "groq_llama"
      3. Deterministic catalog     -> mode "fallback"

    Returns (answer, mode).
    """
    user_context = user_context or {}
    reviews = reviews or []
    coupons = coupons or []

    if not settings.groq_api_key:
        logger.info("GROQ_API_KEY not set; using catalog fallback response")
        return _fallback_answer(query, products), FALLBACK_MODE

    try:
        answer = await asyncio.to_thread(_run_crew, query, products, user_context, reviews, coupons)
        return answer, CREWAI_MODE
    except Exception:
        logger.exception("CrewAI discovery failed; falling back to direct Groq call")

    try:
        answer = await asyncio.to_thread(_groq_direct, query, products, user_context, reviews, coupons)
        if answer:
            return answer, GROQ_MODE
    except Exception:
        logger.exception("Direct Groq discovery failed; returning catalog fallback")

    return _fallback_answer(query, products), FALLBACK_MODE
