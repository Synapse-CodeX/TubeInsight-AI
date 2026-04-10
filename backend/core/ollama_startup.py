"""
backend/core/ollama_startup.py
──────────────────────────────
Automatically start Ollama if configured and verify connection.
Ensures LLM service is available before app runs.
"""
import subprocess
import time
import requests
from loguru import logger
from config.settings import get_settings


def verify_ollama_connection(max_retries, retry_delay) -> bool:
    """
    Verify Ollama is accessible at configured URL.
    Returns True if successful, False otherwise.
    """
    settings = get_settings()

    if not settings.ollama_base_url:
        logger.info("Ollama not configured, skipping startup")
        return True

    for attempt in range(max_retries):
        try:
            response = requests.get(
                f"{settings.ollama_base_url}/api/tags",
                timeout=5
            )
            if response.status_code == 200:
                logger.success(f"✓ Ollama is running at {settings.ollama_base_url}")
                try:
                    models = response.json().get("models", [])
                    if models:
                        model_names = [m.get("name", "unknown") for m in models]
                        logger.info(f"  Available models: {', '.join(model_names)}")
                except Exception:
                    pass
                return True
        except (requests.ConnectionError, requests.Timeout):
            logger.debug(f"Ollama not responding (attempt {attempt + 1}/{max_retries})")

        if attempt < max_retries - 1:
            time.sleep(retry_delay)

    return False


def start_ollama():
    """
    Start Ollama server process if it's not already running.
    """
    settings = get_settings()

    if not settings.ollama_base_url:
        logger.info("Ollama not configured, skipping startup")
        return True

    logger.info(f"🚀 Starting Ollama at {settings.ollama_base_url}...")

    # First check if Ollama is already running
    if verify_ollama_connection(max_retries=2, retry_delay=1):
        return True

    # Try to start Ollama
    try:
        logger.info("Attempting to start 'ollama serve'...")
        # Start ollama serve in the background
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NEW_CONSOLE if subprocess.os.name == 'nt' else 0
        )

        # Wait for Ollama to start
        logger.info("⏳ Waiting for Ollama to start...")
        if verify_ollama_connection(max_retries=15, retry_delay=1):
            return True
        else:
            logger.error("⚠️  Ollama failed to start or respond after 15 seconds")
            logger.error("Please start Ollama manually with: ollama serve")
            return False

    except FileNotFoundError:
        logger.error("❌ 'ollama' command not found. Is Ollama installed?")
        logger.error("Install from: https://ollama.ai/download")
        return False
    except Exception as e:
        logger.error(f"❌ Failed to start Ollama: {e}")
        return False

def ensure_ollama_ready():
    """
    Main startup function: start Ollama and verify it's ready.
    Call this at app startup.
    """
    settings = get_settings()

    if not settings.ollama_base_url:
        logger.info("(Ollama not configured) to start")
        return True

    logger.info("=" * 60)
    logger.info("OLLAMA STARTUP CHECK")
    logger.info("=" * 60)

    success = start_ollama()

    if not success:
        logger.warning("⚠️ | Could not verify Ollama connection")
        logger.warning("The app will attempt to continue, but LLM features may fail")

    return success
