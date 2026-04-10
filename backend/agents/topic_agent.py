"""
backend/agents/topic_agent.py
───────────────────────────────
Topic Clustering Agent.
Uses KMeans on comment embeddings to discover themes,
then uses LLM to label each cluster meaningfully.
"""
print(f"[LOADING] {__file__}")

import json
from typing import List, Dict
import numpy as np
from loguru import logger
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize

from backend.core.vectorstore import VectorStore
from backend.core.embeddings import EmbeddingClient
from backend.core.llm_client import LLMClient
from config.prompts import TOPIC_SYSTEM, TOPIC_USER


class TopicAgent:
    """
    Topic discovery agent using embedding-based clustering.

    Discovers themes in YouTube comments by:
    1. Computing embeddings for all comments
    2. Clustering using KMeans on normalized embeddings
    3. Labeling clusters with LLM for human-readable topics

    Falls back to generic labels if LLM labeling fails.
    """

    def __init__(self) -> None:
        self.vs = VectorStore()
        self.embedder = EmbeddingClient()
        self.llm = LLMClient()

    def _cluster_comments(
        self,
        comments: List[Dict],
        n_clusters: int = 6,
    ) -> List[Dict]:
        """
        KMeans clustering on comment embeddings.

        Args:
            comments: List of comment dicts with 'text' key
            n_clusters: Target number of clusters

        Returns:
            List of cluster dicts with id, size, representative_comments
        """
        texts = [c["text"] for c in comments]

        # Get embeddings
        embeddings = self.embedder.embed_texts(texts)
        X = np.array(embeddings)
        X = normalize(X)  # Normalize for cosine similarity

        # Fit KMeans
        n_clusters = min(n_clusters, len(comments))
        km = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
        labels = km.fit_predict(X)

        # Group comments by cluster
        clusters: Dict[int, List[Dict]] = {}
        for comment, label in zip(comments, labels):
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(comment)

        # Build cluster objects with representative samples
        cluster_list: List[Dict] = []
        for cluster_id, cluster_comments in clusters.items():
            # Sort by like count to pick best representatives
            sorted_c = sorted(cluster_comments, key=lambda x: x.get("like_count", 0), reverse=True)
            representatives = [c["text"] for c in sorted_c[:3]]

            cluster_list.append({
                "id": int(cluster_id),
                "size": len(cluster_comments),
                "representative_comments": representatives,
            })

        # Sort by size descending
        cluster_list.sort(key=lambda x: x["size"], reverse=True)
        return cluster_list

    def run(
        self,
        video_id: str,
        comments: List[Dict],
        video_title: str,
        n_clusters: int = 6,
    ) -> Dict:
        """
        Cluster comments and label them with LLM.

        Args:
            video_id: YouTube video ID
            comments: List of comment dicts
            video_title: Title for context in labeling
            n_clusters: Target number of topic clusters

        Returns:
            Dict with 'topics' key containing labeled cluster list
        """
        logger.info(f"TopicAgent: Clustering {len(comments)} comments into {n_clusters} topics video id {video_id}")

        if len(comments) < n_clusters:
            n_clusters = max(2, len(comments) // 2)

        # Cluster
        raw_clusters = self._cluster_comments(comments, n_clusters=n_clusters)
        logger.debug(f"Formed {len(raw_clusters)} clusters")

        # Label with LLM
        try:
            clusters_text = json.dumps(raw_clusters, indent=2)
            result = self.llm.complete_json(
                user_prompt=TOPIC_USER.format(
                    video_title=video_title,
                    clusters=clusters_text,
                ),
                system_prompt=TOPIC_SYSTEM,
                max_tokens=100000,  # Large buffer to prevent truncation
            )
            logger.success(f"TopicAgent: Identified {len(result.get('topics', []))} topics")
            return result
        except Exception as e:
            logger.exception("LLM topic labeling failed, using fallback")
            # Fallback: return clusters without LLM labels
            fallback_topics: List[Dict] = []
            for i, cluster in enumerate(raw_clusters[:6]):
                fallback_topics.append({
                    "id": cluster["id"],
                    "label": f"Theme {i+1}",
                    "description": f"Cluster of {cluster['size']} similar comments",
                    "sentiment": "neutral",
                    "size": cluster["size"],
                    "representative_comments": cluster["representative_comments"][:3],
                })
            return {"topics": fallback_topics}
