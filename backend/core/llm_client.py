"""
backend/core/llm_client.py
───────────────────────────
LLM API wrapper supporting Groq and local Ollama.
Includes retry logic, JSON parsing helpers, and streaming support.
"""
print(f"[LOADING] {__file__}")

import json
import re
import time
#from typing import Optional
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from langchain_groq import ChatGroq
from openai import APITimeoutError, OpenAI
from groq import APITimeoutError as GroqAPITimeoutError
from groq import RateLimitError as GroqRateLimitError

from config.settings import get_settings

settings = get_settings()


class LLMClient:
    """
    Unified LLM client supporting Groq and local Ollama.

    USE_LOCAL_LLM=true selects Ollama for local development. When it is false,
    ChatGroq is used with the configured Groq API key and model.

    Features:
    - Automatic retry with exponential backoff for rate limits
    - Rate limiting to avoid API throttling
    - JSON response parsing with markdown fence stripping
    - Multi-turn conversation support for RAG
    """
    def __init__(self):
        self.provider = "ollama" if settings.use_local_llm else "groq"
        self._use_ollama = settings.use_local_llm

        if self._use_ollama:
            logger.info(f"Using local Ollama at {settings.ollama_base_url}")
            self.client = OpenAI(
                base_url=f"{settings.ollama_base_url}/v1",
                api_key="ollama",  # Ollama doesn't need a real API key
                timeout=settings.llm_request_timeout_seconds,
                max_retries=0,
            )
            self.model = settings.ollama_model
        else:
            if not settings.groq_api_key:
                raise ValueError("GROQ_API_KEY is required when USE_LOCAL_LLM=false")

            logger.info(f"Using Groq API with model: {settings.llm_model}")
            self.client = ChatGroq(
                model=settings.llm_model,
                api_key=settings.groq_api_key,
                timeout=settings.llm_request_timeout_seconds,
                max_retries=0,
            )
            self.model = settings.llm_model

        self._last_request_time: float = 0
        self._min_delay = 0.5 if self._use_ollama else 0.1
        self._max_completion_tokens = 8192 if not self._use_ollama else None

    def _rate_limit(self):
        """Ensure minimum delay between API calls."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self._min_delay:
            sleep_time = self._min_delay - elapsed
            logger.debug(f"Rate limiting: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)
        self._last_request_time = time.time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type(GroqRateLimitError),
        reraise=True
    )
    def _make_request(self, messages, system_prompt, max_tokens, temperature):
        """Make API request with retry logic."""
        self._rate_limit()
        
        try:
            if self._use_ollama:
                kwargs = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        *messages
                    ],
                    "temperature": temperature,
                }
                return self.client.chat.completions.create(**kwargs)

            groq_messages = [("system", system_prompt)] + [
                (message["role"], message["content"])
                for message in messages
            ]
            return self.client.invoke(
                groq_messages,
                max_tokens=min(max_tokens, self._max_completion_tokens),
                temperature=temperature,
            )
        except (APITimeoutError, GroqAPITimeoutError) as exc:
            raise TimeoutError(
                f"{self.provider} LLM request timed out after "
                f"{settings.llm_request_timeout_seconds} seconds"
            ) from exc

    @staticmethod
    def _response_content(response) -> str:
        """Extract text from either an Ollama response or a LangChain message."""
        if hasattr(response, "content"):
            content = response.content
            if isinstance(content, str):
                return content
            return "".join(
                block.get("text", "") if isinstance(block, dict) else str(block)
                for block in content
            )
        return response.choices[0].message.content

    def complete(
        self,
        user_prompt: str,
        system_prompt: str = "",
        max_tokens: int = 2000,
        temperature: float = 0.3,
    ) -> str:
        """Standard completion — returns raw text."""
        messages = [{"role": "user", "content": user_prompt}]

        response = self._make_request(messages, system_prompt, max_tokens, temperature)
        return self._response_content(response)

    def complete_json(
        self,
        user_prompt: str,
        system_prompt: str = "",
        max_tokens: int = 2000,
    ) -> dict:
        """
        Completion that expects JSON back.
        Strips markdown fences and parses safely.
        """
        raw = self.complete(user_prompt, system_prompt, max_tokens, temperature=0.1)

        # Strip markdown code fences if present
        clean = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()

        try:
            return json.loads(clean)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse failed: {e}\nRaw response:\n{raw[:1000]}")
            raise ValueError(f"LLM returned invalid JSON: {e}")

    def complete_with_history(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 1500,
    ) -> str:
        """
        Multi-turn completion for RAG chat.
        Messages format: [{"role": "user"|"assistant", "content": "..."}]
        """
        response = self._make_request(messages, system_prompt, max_tokens, temperature=0.3)
        return self._response_content(response)
