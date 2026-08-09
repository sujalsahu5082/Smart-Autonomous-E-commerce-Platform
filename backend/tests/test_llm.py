from unittest.mock import patch

from app.api import llm as llm_module


async def test_test_llm_503_without_key(client):
    with patch.object(llm_module.settings, "groq_api_key", None):
        resp = await client.get("/api/test-llm")
    assert resp.status_code == 503


async def test_test_llm_200_with_response(client):
    with (
        patch.object(llm_module.settings, "groq_api_key", "sk-test"),
        patch.object(
            llm_module,
            "call_llm",
            return_value={"content": "Online.", "usage": {"prompt_tokens": 10, "completion_tokens": 3}},
        ),
    ):
        resp = await client.get("/api/test-llm")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["response"] == "Online."


async def test_test_llm_502_on_api_error(client):
    with (
        patch.object(llm_module.settings, "groq_api_key", "sk-test"),
        patch.object(llm_module, "call_llm", side_effect=Exception("boom")),
    ):
        resp = await client.get("/api/test-llm")
    assert resp.status_code == 502
