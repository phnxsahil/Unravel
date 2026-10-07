"""Provider failure/retry tests with a fake transport; no paid requests."""

import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import anthropic
import httpx
import pytest

from apps.ravel.ai import explain


def test_transient_retry_and_usage(monkeypatch):
    answer = {
        "summary": "A route",
        "claims": [
            {
                "text": "A function exists",
                "kind": "source",
                "citations": [{"path": "a.py", "line": 1, "end_line": 1}],
            }
        ],
        "questions": ["Where is it called?"],
        "experiment": "Follow its import",
    }
    response = SimpleNamespace(
        content=[SimpleNamespace(type="text", text=json.dumps(answer))],
        usage=SimpleNamespace(input_tokens=123, output_tokens=45),
    )
    request = httpx.Request("POST", "https://example.invalid")
    calls = AsyncMock(
        side_effect=[anthropic.APIConnectionError(request=request), response]
    )

    class Client:
        messages = SimpleNamespace(create=calls)

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setattr(anthropic, "AsyncAnthropic", lambda **kwargs: Client())
    monkeypatch.setattr("apps.ravel.ai.asyncio.sleep", AsyncMock())
    result = asyncio.run(
        explain(
            "What is this?",
            [{"path": "a.py", "start_line": 1, "end_line": 1}],
            "test-model",
        )
    )
    assert calls.await_count == 2
    assert result["usage"]["input_tokens"] == 123


def test_missing_key_never_calls_provider(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(ValueError, match="AI is not connected"):
        asyncio.run(explain("What is this?", [], "test-model"))


@pytest.mark.parametrize("kind", ["authentication", "connection"])
def test_provider_failure_is_actionable_and_does_not_expose_request(kind, monkeypatch):
    request = httpx.Request("POST", "https://example.invalid")
    error = (anthropic.AuthenticationError("private key body", response=httpx.Response(401, request=request), body={"key": "secret-value"}) if kind == "authentication" else anthropic.APIConnectionError(request=request))
    calls = AsyncMock(side_effect=error)
    class Client:
        messages = SimpleNamespace(create=calls)
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setattr(anthropic, "AsyncAnthropic", lambda **kwargs: Client())
    monkeypatch.setattr("apps.ravel.ai.asyncio.sleep", AsyncMock())
    with pytest.raises(ValueError) as caught:
        asyncio.run(explain("What is this?", [], "test-model"))
    assert "AI provider" in str(caught.value)
    assert "secret-value" not in str(caught.value) and "private key body" not in str(caught.value)
    assert calls.await_count == (1 if kind == "authentication" else 3)
