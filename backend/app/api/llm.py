from fastapi import APIRouter, HTTPException

from ai.llm import call_llm
from app.core.config import settings

router = APIRouter(tags=["llm"])


@router.get("/test-llm")
async def test_llm():
    """Smoke test for the Groq API key and connection.

    Sends a hardcoded prompt and returns the model's reply.
    """
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured. Add it to backend/.env and restart.",
        )
    try:
        result = call_llm(
            "You are a concise assistant.",
            "Reply with exactly one sentence confirming you are online, "
            "mentioning the model name.",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {e}")
    return {
        "status": "ok",
        "model": settings.groq_model,
        "response": result["content"],
        "usage": result["usage"],
    }
