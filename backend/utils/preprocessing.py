"""
backend/utils/preprocessing.py
────────────────────────────────
Comment cleaning and preprocessing utilities.
Removes spam, URLs, and prepares text for embedding + analysis.
"""
print(f"[LOADING] {__file__}")

import re
import html
from typing import List, Dict
from loguru import logger


# ─── Filters ──────────────────────────────────────────────────────────────────

MIN_COMMENT_LENGTH = 3    # Skip very short comments like "nice", "👍"
MAX_COMMENT_LENGTH = 1000  # Truncate very long comments

SPAM_PATTERNS = [
    r"check out my channel",
    r"subscribe to me",
    r"follow me",
    r"first!+$",
    r"^\d+$",                  # Pure numbers
]

# Common emoji Unicode ranges (covers most standard emojis)
# This is more targeted than removing all non-word characters
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # Emoticons
    "\U0001F300-\U0001F5FF"  # Misc Symbols and Pictographs
    "\U0001F680-\U0001F6FF"  # Transport and Map
    "\U0001F700-\U0001F77F"  # Alchemical Symbols
    "\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
    "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA00-\U0001FA6F"  # Chess Symbols
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
    "\U00002702-\U000027B0"  # Dingbats
    "\U00002600-\U000026FF"  # Misc symbols (★, ☀, etc.)
    "\U0001F1E0-\U0001F1FF"  # Flags (iOS)
    "]+",
    flags=re.UNICODE
)


def clean_text(text: str) -> str:
    """
    Clean a single comment text.

    - Decodes HTML entities
    - Removes URLs
    - Normalizes excessive newlines
    - Truncates to max length
    """
    # Decode HTML entities
    text = html.unescape(text)

    # Remove URLs
    text = re.sub(r"https?://\S+", "", text)

    # Remove excessive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Strip and truncate
    text = text.strip()[:MAX_COMMENT_LENGTH]

    return text


def is_valid_comment(text: str) -> bool:
    """
    Return True if comment is worth keeping for analysis.

    Filters out:
    - Very short comments
    - Spam patterns (self-promotion, "first!", etc.)
    - Pure emoji comments (no meaningful text content)
    """
    if len(text) < MIN_COMMENT_LENGTH:
        return False

    # Check spam patterns
    lower = text.lower()
    for pattern in SPAM_PATTERNS:
        if re.search(pattern, lower):
            return False

    # Skip pure emoji comments by removing emojis and checking remaining content
    # Use dedicated emoji pattern instead of removing all punctuation
    text_without_emojis = EMOJI_PATTERN.sub("", text)
    # Also remove common repeated symbols that aren't meaningful (e.g., "!!!", "...")
    text_clean = re.sub(r"[!?.,;:'\"\-_=+*#@&^%$<>(){}[\]\\|`~]+", "", text_without_emojis)
    text_clean = text_clean.strip()

    # If after removing emojis and punctuation, there's very little text, skip it
    if len(text_clean) < 3:
        return False

    return True


def preprocess_comments(comments: List[Dict]) -> List[Dict]:
    """
    Clean and filter a list of raw comment objects.

    Args:
        comments: List of comment dicts with at least a "text" key

    Returns:
        Filtered and cleaned list ready for embedding
    """
    cleaned = []
    skipped = 0

    for comment in comments:
        raw_text = comment.get("text", "")
        clean = clean_text(raw_text)

        if not is_valid_comment(clean):
            skipped += 1
            continue

        cleaned.append({**comment, "text": clean})

    logger.info(
        f"Preprocessing: {len(comments)} raw → {len(cleaned)} clean "
        f"({skipped} filtered out)"
    )
    return cleaned


def chunk_comments_for_llm(
    comments: List[Dict],
    max_chars: int = 8000,
    max_per_chunk: int = 50,
) -> List[str]:
    """
    Batch comments into chunks that fit in an LLM context window.

    Args:
        comments: List of comment dicts with "text" key
        max_chars: Maximum characters per chunk
        max_per_chunk: Maximum comments per chunk

    Returns:
        List of formatted text blocks ready for LLM processing
    """
    chunks = []
    current_chunk = []
    current_len = 0

    for i, comment in enumerate(comments):
        text = comment.get("text", "")
        formatted = f"[Comment {i+1}] {text}"
        text_len = len(formatted)

        if (current_len + text_len > max_chars or len(current_chunk) >= max_per_chunk) and current_chunk:
            chunks.append("\n".join(current_chunk))
            current_chunk = []
            current_len = 0

        current_chunk.append(formatted)
        current_len += text_len

    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks
