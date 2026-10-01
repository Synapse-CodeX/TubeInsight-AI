"""
config/settings.py
─────────────────
Central configuration using Pydantic Settings.
All env vars are validated and typed here.
"""
print(f"[LOADING] {__file__}")

from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    # ── Local/API Toggle ─────────────────────────────────────────────────────
    use_local_llm: bool = Field(True, env="use_local_llm")
    use_local_embedding_model: bool = Field(True, env="use_local_embedding_model")
    
    # ── Embedding Model ─────────────────────────────────────────────────────
    sentence_transformer_model: str = Field("all-MiniLM-L6-v2", env="SENTENCE_TRANSFORMER_MODEL")
    nvidia_embedding_model: str = Field("nvidia/llama-nemotron-embed-vl-1b-v2:free", env="NVIDIA_EMBEDDING_MODEL")
    embedding_api_key: str = Field("", env="embedding_api_key")
    
    # ── API Keys ──────────────────────────────────────────────────────────────
    youtube_api_key: str = Field(env="YOUTUBE_API_KEY")
    groq_api_key: str = Field("", env="GROQ_API_KEY")

    # ── Model Config ──────────────────────────────────────────────────────────
    llm_request_timeout_seconds: float = Field(60.0, env="LLM_REQUEST_TIMEOUT_SECONDS")
    # Set USE_LOCAL_LLM=true to use local Ollama instead of Groq
    # Example: OLLAMA_BASE_URL=http://localhost:11434
    ollama_base_url: str = Field("", env="OLLAMA_BASE_URL")
    ollama_model: str = Field("", env="OLLAMA_MODEL")
    llm_model: str = Field("openai/gpt-oss-20b", env="LLM_MODEL")

    # ── Storage ───────────────────────────────────────────────────────────────
    chroma_persist_dir: str = Field(env="CHROMA_PERSIST_DIR")
    raw_data_dir: str = Field(env="RAW_DATA_DIR")

    # ── Ingestion Limits ──────────────────────────────────────────────────────
    max_comments_per_video: int = Field(env="MAX_COMMENTS_PER_VIDEO")
    max_videos_per_channel: int = Field(env="MAX_VIDEOS_PER_CHANNEL")

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = Field(env="APP_ENV")
    log_level: str = Field(env="LOG_LEVEL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
