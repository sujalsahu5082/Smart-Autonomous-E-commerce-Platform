"""In-memory chat session store (Phase 6).

Simple bounded dict keyed by session_id; keeps the last N messages per
session so conversational context persists across requests. Replace with
Redis later if needed.
"""
from collections import OrderedDict
from typing import Any

MAX_SESSIONS = 200
MAX_MESSAGES = 8

_sessions: OrderedDict[str, list[dict[str, str]]] = OrderedDict()


def get_history(session_id: str | None) -> list[dict[str, str]]:
    if not session_id:
        return []
    return list(_sessions.get(session_id, []))


def add_exchange(session_id: str | None, user_message: str, assistant_answer: str) -> None:
    if not session_id:
        return
    if session_id not in _sessions:
        if len(_sessions) >= MAX_SESSIONS:
            _sessions.popitem(last=False)
        _sessions[session_id] = []
    _sessions[session_id].append({"role": "user", "content": user_message})
    _sessions[session_id].append({"role": "assistant", "content": assistant_answer})
    if len(_sessions[session_id]) > MAX_MESSAGES * 2:
        _sessions[session_id] = _sessions[session_id][-MAX_MESSAGES * 2 :]


def format_history(history: list[dict[str, str]]) -> list[dict[str, str]]:
    """Trim message contents so prompts stay small."""
    return [{"role": m["role"], "content": m["content"][:400]} for m in history]


def session_context(session_id: str | None, cart_context: dict[str, Any] | None) -> dict[str, Any]:
    """Build the user-context dict handed to the crew/Groq call."""
    context: dict[str, Any] = {}
    history = get_history(session_id)
    if history:
        context["history"] = format_history(history)
    if cart_context:
        context["cart"] = cart_context
    return context
