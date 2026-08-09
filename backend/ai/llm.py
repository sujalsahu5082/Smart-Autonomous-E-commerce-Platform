from app.core.config import settings


def get_llm():
    """CrewAI-compatible LLM backed by Groq (Llama 3.3).

    Raises if GROQ_API_KEY is not configured; callers must degrade gracefully.
    """
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY not configured")
    from crewai import LLM

    return LLM(model=f"groq/{settings.groq_model}", api_key=settings.groq_api_key, temperature=0.3)
