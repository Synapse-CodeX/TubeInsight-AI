"""
backend/core/llm_client.py
───────────────────────────
LLM API wrapper supporting OpenRouter and local Ollama.
Includes retry logic, JSON parsing helpers, and streaming support.
"""
print(f"[LOADING] {__file__}")

import json
import re
import time
#from typing import Optional
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import OpenAI, RateLimitError

from config.settings import get_settings

settings = get_settings()


class LLMClient:
    """
    Unified LLM client supporting both OpenRouter (cloud) and Ollama (local).

    Uses settings.use_local_llm to determine which backend to use:
    - True: Uses local Ollama
    - False: Uses OpenRouter with the configured API key and model

    Features:
    - Automatic retry with exponential backoff for rate limits
    - Rate limiting to avoid API throttling
    - JSON response parsing with markdown fence stripping
    - Multi-turn conversation support for RAG
    """
    def __init__(self):
        self._use_ollama = settings.use_local_llm
        
        if self._use_ollama:
            # Use local Ollama
            logger.info(f"Using local Ollama at {settings.ollama_base_url}")
            self.client = OpenAI(
                base_url=f"{settings.ollama_base_url}/v1",
                api_key="ollama",  # Ollama doesn't need a real API key
            )
            self.model = settings.ollama_model
        else:
            # Use OpenRouter API with llm_api_key and llm_model
            logger.info(f"Using OpenRouter API with model: {settings.llm_model}")
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=settings.llm_api_key,
                default_headers={
                    "HTTP-Referer": "http://localhost:8504",
                    "X-Title": "TubeInsight AI",
                }
            )
            self.model = settings.llm_model

        self._last_request_time: float = 0
        self._min_delay = 0.5 if self._use_ollama else 1.0  # Faster for local Ollama

    def _rate_limit(self):
        """Ensure minimum delay between API calls."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self._min_delay:
            sleep_time = self._min_delay - elapsed
            logger.debug(f"Rate limiting: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)
        self._last_request_time = time.time()

    @retry(
        stop=stop_after_attempt(3 if settings.use_local_llm else 5),
        wait=wait_exponential(multiplier=1 if settings.use_local_llm else 2, min=2, max=30),
        retry=retry_if_exception_type(RateLimitError),
        reraise=True
    )
    def _make_request(self, messages, system_prompt, max_tokens, temperature):
        """Make API request with retry logic."""
        self._rate_limit()
        
        # Ollama doesn't need max_tokens in the same way
        kwargs = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                *messages
            ],
            "temperature": temperature,
        }
        
        # Only add max_tokens for OpenRouter (Ollama handles it differently)
        if not self._use_ollama:
            kwargs["max_tokens"] = max_tokens
        
        return self.client.chat.completions.create(**kwargs)

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
        return response.choices[0].message.content

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
        return response.choices[0].message.content
