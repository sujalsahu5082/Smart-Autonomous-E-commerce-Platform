import asyncio
import json
import logging
from typing import Any

from ai.llm import call_llm
from app.core.config import settings

logger = logging.getLogger(__name__)

FALLBACK_MODE = "fallback"
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


async def run_discovery(
    query: str,
    products: list[dict],
    user_context: dict | None = None,
    reviews: list[dict] | None = None,
    coupons: list[dict] | None = None,
) -> tuple[str, str]:
    """Run conversational product discovery powered by Groq Llama 3.3.

    Returns (answer, mode) where mode is "groq_llama" when Groq executed or
    "fallback" when Groq is unconfigured or unavailable.
    """
    if not settings.groq_api_key:
        logger.info("GROQ_API_KEY not set; using catalog fallback response")
        return _fallback_answer(query, products), FALLBACK_MODE

    try:
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

        res = await asyncio.to_thread(call_llm, system_prompt, query)
        answer = res.get("content")
        if answer:
            return answer, GROQ_MODE
    except Exception as e:
        logger.exception("Groq discovery call failed; returning fallback answer")

    return _fallback_answer(query, products), FALLBACK_MODE
