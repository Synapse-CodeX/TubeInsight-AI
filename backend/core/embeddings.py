"""
backend/core/embeddings.py
───────────────────────────
Embedding pipeline supporting both local sentence-transformers and OpenRouter API.
"""
print(f"[LOADING] {__file__}")

import requests
from typing import List, Optional, Any
from loguru import logger
from config.settings import get_settings

settings = get_settings()


def _get_local_model() -> Any:
    """Lazy load the sentence-transformer model, using model name from settings."""
    if not hasattr(_get_local_model, "_model"):
        logger.info("Loading sentence-transformer model (first time)...")
        try:
            from sentence_transformers import SentenceTransformer
            model_name = getattr(settings, "sentence_transformer_model", "all-MiniLM-L6-v2")
            logger.info(f"Using sentence-transformer model: {model_name}")
            _get_local_model._model = SentenceTransformer(model_name)
            logger.success("Sentence-transformer model loaded successfully")
        except ImportError:
            logger.error("sentence-transformers not installed. Run: pip install sentence-transformers")
            raise
    return _get_local_model._model


class EmbeddingClient:
    """
    Embedding client supporting both local sentence-transformers and OpenRouter API.

    Uses settings.use_local_embedding_model to determine which backend to use:
    - True: Uses local sentence-transformers (all-MiniLM-L6-v2 by default)
    - False: Uses OpenRouter API with NVIDIA embedding model

    Features:
    - Lazy model loading (only loads on first use)
    - Batch processing to handle large volumes efficiently
    - Automatic backend selection based on configuration
    """

    def __init__(self) -> None:
        self.batch_size: int = 128 if settings.use_local_embedding_model else 64
        self._model: Optional[Any] = None
        self._use_local = settings.use_local_embedding_model
        
        if self._use_local:
            logger.info("EmbeddingClient initialized with LOCAL sentence-transformers")
        else:
            logger.info(f"EmbeddingClient initialized with OpenRouter API ({settings.nvidia_embedding_model})")

    def _get_local_model(self) -> Any:
        """Get or load the local embedding model."""
        if self._model is None:
            self._model = _get_local_model()
        return self._model

    def _embed_via_api(self, texts: List[str]) -> List[List[float]]:
        """Embed texts using OpenRouter API."""
        url = "https://openrouter.ai/api/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {settings.embedding_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8504",
            "X-Title": "TubeInsight AI",
        }
        payload = {
            "model": settings.nvidia_embedding_model,
            "input": texts,
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        # Extract embeddings in order
        embeddings = [item["embedding"] for item in sorted(data["data"], key=lambda x: x["index"])]
        return embeddings

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a list of texts using configured backend.

        Args:
            texts: List of strings to embed

        Returns:
            List of embedding vectors in same order as input
        """
        if not texts:
            return []

        if self._use_local:
            # Local sentence-transformers
            model = self._get_local_model()
            logger.info(f"Embedding {len(texts)} texts locally")

            all_embeddings: List[List[float]] = []
            total_batches = (len(texts) + self.batch_size - 1) // self.batch_size

            for i in range(0, len(texts), self.batch_size):
                batch = texts[i : i + self.batch_size]
                batch_num = i // self.batch_size + 1

                embeddings = model.encode(batch, convert_to_numpy=True, show_progress_bar=False)
                all_embeddings.extend(embeddings.tolist())

                logger.debug(f"Batch {batch_num}/{total_batches} done")

            logger.success(f"Embedded {len(all_embeddings)} texts locally")
            return all_embeddings
        else:
            # OpenRouter API
            logger.info(f"Embedding {len(texts)} texts via OpenRouter API")

            all_embeddings: List[List[float]] = []
            total_batches = (len(texts) + self.batch_size - 1) // self.batch_size

            for i in range(0, len(texts), self.batch_size):
                batch = texts[i : i + self.batch_size]
                batch_num = i // self.batch_size + 1

                embeddings = self._embed_via_api(batch)
                all_embeddings.extend(embeddings)

                logger.debug(f"API Batch {batch_num}/{total_batches} done")

            logger.success(f"Embedded {len(all_embeddings)} texts via API")
            return all_embeddings

    def embed_query(self, query: str) -> List[float]:
        """
        Embed a single query string for RAG retrieval.

        Args:
            query: The search query to embed

        Returns:
            Embedding vector
        """
        if self._use_local:
            model = self._get_local_model()
            embedding = model.encode([query], convert_to_numpy=True, show_progress_bar=False)
            return embedding[0].tolist()
        else:
            embeddings = self._embed_via_api([query])
            return embeddings[0]
