from typing import Any

from app.core.config import settings


def get_llm():
    """CrewAI-compatible LLM backed by Groq (Llama 3.3).

    Uses CrewAI's native openai provider pointed at Groq's OpenAI-compatible
    endpoint (avoids the litellm dependency). Raises if GROQ_API_KEY is not
    configured; callers must degrade gracefully.
    """
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY not configured")
    from crewai import LLM

    return LLM(
        model=f"openai/{settings.groq_model}",
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1",
        temperature=0.3,
    )


def call_llm(
    system_prompt: str,
    user_prompt: str,
    tools: list[dict[str, Any]] | None = None,
    temperature: float = 0.3,
) -> dict[str, Any]:
    """Direct Groq chat completion call (llama-3.3-70b-versatile).

    Supports OpenAI-style function/tool calling: pass ``tools`` as a list of
    tool definitions and the returned dict contains both ``content`` and
    ``tool_calls`` (already converted to plain dicts) so callers can execute
    and feed results back in a follow-up call.
    """
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY not configured")

    from groq import Groq

    client = Groq(api_key=settings.groq_api_key)
    kwargs: dict[str, Any] = {"temperature": temperature}
    if tools:
        kwargs["tools"] = tools
        kwargs["tool_choice"] = "auto"

    completion = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        **kwargs,
    )

    message = completion.choices[0].message
    tool_calls = [tc.model_dump() for tc in message.tool_calls] if message.tool_calls else None
    return {
        "content": message.content,
        "tool_calls": tool_calls,
        "usage": {
            "prompt_tokens": completion.usage.prompt_tokens if completion.usage else None,
            "completion_tokens": completion.usage.completion_tokens if completion.usage else None,
        },
    }
