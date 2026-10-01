import os
from types import SimpleNamespace

import pytest
from groq import APITimeoutError


for name, value in {
    "YOUTUBE_API_KEY": "test-youtube-key",
    "OPENROUTER_API_KEY": "test-openrouter-key",
    "LLM_API_KEY": "test-legacy-key",
    "LLM_MODEL": "test-model",
    "CHROMA_PERSIST_DIR": "./data/vectorstore",
    "RAW_DATA_DIR": "./data/raw",
    "MAX_COMMENTS_PER_VIDEO": "100",
    "MAX_VIDEOS_PER_CHANNEL": "10",
    "APP_ENV": "test",
    "LOG_LEVEL": "INFO",
}.items():
    os.environ.setdefault(name, value)

from backend.core import llm_client
from backend.utils.preprocessing import chunk_comments_for_llm


class FakeOpenAI:
    instances = []

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=lambda **_: None))
        self.instances.append(self)


class FakeChatGroq:
    instances = []

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.instances.append(self)


def configure_settings(monkeypatch, *, use_local_llm=False, groq_key="groq-key", timeout=17.0):
    monkeypatch.setattr(llm_client.settings, "use_local_llm", use_local_llm)
    monkeypatch.setattr(llm_client.settings, "groq_api_key", groq_key)
    monkeypatch.setattr(llm_client.settings, "llm_model", "openai/gpt-oss-20b")
    monkeypatch.setattr(llm_client.settings, "ollama_base_url", "http://localhost:11434")
    monkeypatch.setattr(llm_client.settings, "ollama_model", "gemma3:1b")
    monkeypatch.setattr(llm_client.settings, "llm_request_timeout_seconds", timeout)


def test_cloud_mode_uses_groq_gpt_oss_model(monkeypatch):
    configure_settings(monkeypatch)
    FakeChatGroq.instances.clear()
    monkeypatch.setattr(llm_client, "ChatGroq", FakeChatGroq)

    client = llm_client.LLMClient()

    assert client.provider == "groq"
    assert FakeChatGroq.instances[-1].kwargs["model"] == "openai/gpt-oss-20b"
    assert FakeChatGroq.instances[-1].kwargs["api_key"] == "groq-key"
    assert FakeChatGroq.instances[-1].kwargs["timeout"] == 17.0
    assert FakeChatGroq.instances[-1].kwargs["max_retries"] == 0


def test_groq_provider_requires_api_key(monkeypatch):
    configure_settings(monkeypatch, groq_key="")

    with pytest.raises(ValueError, match="GROQ_API_KEY"):
        llm_client.LLMClient()


def test_ollama_remains_selected_for_local_development(monkeypatch):
    configure_settings(monkeypatch, use_local_llm=True, groq_key="")
    FakeOpenAI.instances.clear()
    monkeypatch.setattr(llm_client, "OpenAI", FakeOpenAI)

    client = llm_client.LLMClient()

    assert client.provider == "ollama"
    assert FakeOpenAI.instances[-1].kwargs["base_url"] == "http://localhost:11434/v1"
    assert FakeOpenAI.instances[-1].kwargs["api_key"] == "ollama"


def test_llm_timeout_is_reported_as_controlled_error(monkeypatch):
    configure_settings(monkeypatch)
    monkeypatch.setattr(llm_client, "ChatGroq", FakeChatGroq)
    client = llm_client.LLMClient()

    def raise_timeout(*_, **__):
        raise APITimeoutError(request=object())

    client.client.invoke = raise_timeout

    with pytest.raises(TimeoutError, match="timed out"):
        client._make_request([], "", 100, 0.1)


def test_empty_comment_batch_is_safe():
    assert chunk_comments_for_llm([]) == []


def test_comment_chunking_is_bounded_and_deterministic():
    comments = [{"text": f"Comment {index}"} for index in range(100)]

    chunks = chunk_comments_for_llm(comments, max_chars=4000, max_per_chunk=30)

    assert [len(chunk.splitlines()) for chunk in chunks] == [30, 30, 30, 10]
    assert chunks[0].splitlines()[0] == "[Comment 1] Comment 0"
    assert chunks[-1].splitlines()[-1] == "[Comment 100] Comment 99"
