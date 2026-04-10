"""
backend/core/vectorstore.py
────────────────────────────
ChromaDB interface for storing and querying comment embeddings.
Each video gets its own collection for isolated retrieval.
"""
print(f"[LOADING] {__file__}")

from pathlib import Path
from loguru import logger
import os
import numpy as np

# Set environment variable to avoid Rust bindings issues
os.environ["CHROMADB_TELEMETRY"] = "false"
os.environ["ANONYMIZED_TELEMETRY"] = "false"

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    logger.warning("ChromaDB not available, vector storage disabled")

from config.settings import get_settings

settings = get_settings()

# Process-level fallback cache so ingestion and chat instances can share data
# when ChromaDB storage fails for a specific video.
_PROCESS_FALLBACK: dict[str, dict] = {}


class VectorStore:
    """
    ChromaDB-backed vector store for comment embeddings.

    Each video gets its own collection for isolated retrieval.
    Includes in-memory fallback when ChromaDB is unavailable or fails.

    Features:
    - Lazy client initialization with error handling
    - Automatic fallback to in-memory storage
    - Cosine similarity search for semantic retrieval
    - Channel-level queries across multiple videos
    """
    def __init__(self):
        self.persist_dir = Path(settings.chroma_persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self._client = None
        self._in_memory_fallback = _PROCESS_FALLBACK

    @property
    def client(self):
        """Lazy initialization of ChromaDB client with error handling."""
        if self._client is None and CHROMADB_AVAILABLE:
            try:
                self._client = chromadb.PersistentClient(
                    path=str(self.persist_dir),
                    settings=ChromaSettings(
                        anonymized_telemetry=False,
                        is_persistent=True,
                    ),
                )
                logger.info("ChromaDB client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB: {e}")
                self._client = None
        return self._client

    def _collection_name(self, video_id: str) -> str:
        return f"video_{video_id}"

    def upsert_comments(
        self,
        video_id: str,
        comments: list[dict],
        embeddings: list[list[float]],
        sentiments: list[str] = None,
    ) -> None:
        """
        Store comments + their embeddings for a video.
        Creates or replaces the collection for that video.
        """
        logger.info(f"upsert_comments called for video {video_id}, client available: {self.client is not None}")
        
        if not self.client:
            # Fallback: store in memory
            logger.warning(f"ChromaDB not available, storing video {video_id} in memory fallback")
            self._in_memory_fallback[video_id] = {
                "comments": comments,
                "embeddings": embeddings,
            }
            logger.info(f"Stored {len(comments)} comments in memory for video {video_id}")
            logger.info(f"Memory fallback now has keys: {list(self._in_memory_fallback.keys())}")
            return

        collection_name = self._collection_name(video_id)
        logger.info(f"Storing to ChromaDB collection: {collection_name}")

        try:
            # Delete existing collection if it exists (fresh ingest)
            try:
                self.client.delete_collection(collection_name)
                logger.debug(f"Deleted existing collection {collection_name}")
            except Exception as e:
                # Collection doesn't exist yet, which is expected for new videos
                logger.debug(f"No existing collection to delete for {collection_name}: {type(e).__name__}")

            collection = self.client.create_collection(
                name=collection_name,
                metadata={"video_id": video_id},
            )
            logger.info(f"Created collection {collection_name}")

            ids = [c["comment_id"] for c in comments]
            documents = [c["text"] for c in comments]
            metadatas = [
                {
                    "author": c["author"],
                    "like_count": c["like_count"],
                    "published_at": c["published_at"],
                    "sentiment": sentiments[i] if sentiments and i < len(sentiments) else "unknown",
                }
                for i, c in enumerate(comments)
            ]

            collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
            )

            logger.success(f"Stored {len(comments)} comments in ChromaDB collection {collection_name}")
        except Exception as e:
            logger.error(f"Failed to store comments in ChromaDB: {e}")
            import traceback
            logger.error(traceback.format_exc())
            # Fallback to memory
            logger.warning(f"Falling back to memory storage for video {video_id}")
            self._in_memory_fallback[video_id] = {
                "comments": comments,
                "embeddings": embeddings,
            }
            logger.info(f"Stored {len(comments)} comments in memory fallback for video {video_id}")

    def query(
        self,
        video_id: str,
        query_embedding: list[float],
        n_results: int = 15,
    ) -> list[dict]:
        """
        Retrieve the most relevant comments for a query.
        Returns list of {text, author, like_count, distance}.
        """
        # Debug: log what's available
        logger.info(f"Query for video {video_id}. In-memory keys: {list(self._in_memory_fallback.keys())}")
        
        # Check in-memory fallback first
        if video_id in self._in_memory_fallback:
            logger.info(f"Using in-memory fallback for query on video {video_id}")
            comments = self._in_memory_fallback[video_id]["comments"]
            embeddings = self._in_memory_fallback[video_id].get("embeddings", [])
            logger.info(f"Found {len(comments)} comments in memory for video {video_id}")

            if not comments:
                return []

            # Semantic fallback: rank comments by cosine similarity.
            if not embeddings or len(embeddings) != len(comments):
                logger.warning("Fallback embeddings missing/mismatched, returning first comments")
                return [
                    {
                        "text": c["text"],
                        "author": c["author"],
                        "like_count": c.get("like_count", 0),
                        "relevance_score": 0.0,
                    }
                    for c in comments[:n_results]
                ]

            query_vec = np.array(query_embedding, dtype=float)
            query_norm = np.linalg.norm(query_vec)
            if query_norm == 0:
                return [
                    {
                        "text": c["text"],
                        "author": c["author"],
                        "like_count": c.get("like_count", 0),
                        "relevance_score": 0.0,
                    }
                    for c in comments[:n_results]
                ]

            scored = []
            for comment, emb in zip(comments, embeddings):
                emb_vec = np.array(emb, dtype=float)
                denom = query_norm * np.linalg.norm(emb_vec)
                similarity = float(np.dot(query_vec, emb_vec) / denom) if denom else 0.0
                scored.append((similarity, comment))

            scored.sort(key=lambda x: x[0], reverse=True)
            return [
                {
                    "text": c["text"],
                    "author": c["author"],
                    "like_count": c.get("like_count", 0),
                    "sentiment": c.get("sentiment", "unknown"),
                    "relevance_score": round(score, 3),
                }
                for score, c in scored[:n_results]
            ]

        if not self.client:
            logger.error(f"No ChromaDB client available and no in-memory data for video {video_id}")
            return []

        collection_name = self._collection_name(video_id)
        logger.info(f"Querying ChromaDB collection: {collection_name}")

        try:
            collection = self.client.get_collection(collection_name)
            logger.info(f"Found collection {collection_name}, count={collection.count()}")
        except Exception as e:
            logger.warning(f"No collection found for video {video_id}: {e}")
            return []

        try:
            count = collection.count()
            if count == 0:
                logger.warning(f"Collection {collection_name} exists but is empty")
                return []
                
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, count),
                include=["documents", "metadatas", "distances"],
            )
            logger.info(f"ChromaDB query returned {len(results.get('documents', [[]])[0])} results")

            output = []
            documents = results["documents"][0] if results["documents"] else []
            metadatas = results["metadatas"][0] if results["metadatas"] else []
            distances = results["distances"][0] if results["distances"] else []

            for doc, meta, dist in zip(documents, metadatas, distances):
                sentiment = meta.get("sentiment", "unknown") if meta else "unknown"
                output.append(
                    {
                        "text": doc,
                        "author": meta.get("author") if meta else None,
                        "like_count": meta.get("like_count", 0) if meta else 0,
                        "sentiment": sentiment,
                        "relevance_score": round(1 - dist, 3),
                    }
                )
            return output[:n_results]
        except Exception as e:
            logger.error(f"Query failed for video {video_id}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return []

    def query_channel(
        self,
        video_ids: list[str],
        query_embedding: list[float],
        n_results_per_video: int = 5,
        max_results: int | None = None,
    ) -> list[dict]:
        """Query across multiple videos (channel-level RAG)."""
        all_results = []
        for vid in video_ids:
            results = self.query(vid, query_embedding, n_results=n_results_per_video)
            for r in results:
                r["video_id"] = vid
            all_results.extend(results)

        # Sort by relevance
        all_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        if max_results is not None:
            return all_results[:max_results]
        return all_results

    def list_indexed_video_ids(self) -> list[str]:
        """Return all video IDs currently available in memory or ChromaDB."""
        video_ids = set(self._in_memory_fallback.keys())

        if self.client:
            try:
                for collection in self.client.list_collections():
                    name = getattr(collection, "name", "")
                    if name.startswith("video_"):
                        video_ids.add(name.replace("video_", "", 1))
            except Exception as e:
                logger.warning(f"Unable to list Chroma collections: {e}")

        return sorted(video_ids)

    def collection_exists(self, video_id: str) -> bool:
        """Check if a video has already been indexed."""
        if video_id in self._in_memory_fallback:
            return True

        if not self.client:
            return False

        try:
            self.client.get_collection(self._collection_name(video_id))
            return True
        except Exception as e:
            logger.debug(f"Collection for video {video_id} not found: {type(e).__name__}")
            return False

    def get_all_comments(self, video_id: str) -> list[str]:
        """Return all raw comment texts for a video (for topic modeling)."""
        # Check in-memory fallback first
        if video_id in self._in_memory_fallback:
            return [c["text"] for c in self._in_memory_fallback[video_id]["comments"]]

        if not self.client:
            return []

        collection_name = self._collection_name(video_id)
        try:
            collection = self.client.get_collection(collection_name)
            results = collection.get(include=["documents"])
            return results["documents"]
        except Exception as e:
            logger.debug(f"Could not get comments for video {video_id}: {type(e).__name__}")
            return []
