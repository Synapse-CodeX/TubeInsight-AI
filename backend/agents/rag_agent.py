"""
backend/agents/rag_agent.py
─────────────────────────────
RAG Chat Agent.
Retrieves relevant comments via semantic search,
then generates grounded answers using Claude.
Uses single-turn context to stay fully grounded.
"""
print(f"[LOADING] {__file__}")

from loguru import logger

from backend.core.vectorstore import VectorStore
from backend.core.embeddings import EmbeddingClient
from backend.core.llm_client import LLMClient
from config.prompts import (
    RAG_SYSTEM,
    RAG_USER,
)


class RAGAgent:
    REFUSAL_MESSAGE = (
        "I can only answer from your analyzed video comments. "
        "Ask about viewer feedback, sentiment, complaints, praise, or recurring questions."
    )
    

    def __init__(self):
        self.vs = VectorStore()
        self.embedder = EmbeddingClient()
        self.llm = LLMClient()

    def _is_refusal(self, text: str) -> bool:
        if not text:
            return False
        normalized = " ".join(text.strip().split()).lower()
        return normalized.startswith(self.REFUSAL_MESSAGE.lower())

    def _build_context(self, retrieved: list[dict]) -> str:
        """Format retrieved comments into LLM context block."""
        lines = []
        for i, item in enumerate(retrieved, 1):
            like_info = f" [{item['like_count']} likes]" if item.get("like_count", 0) > 0 else ""
            lines.append(f"{i}. {item['text']}{like_info}")
        return "\n".join(lines)

    def chat(
        self,
        question: str,
        video_ids: list[str],
        n_results: int = 15,
        conversation_history: list = None,
    ) -> str:
        """
        Answer a creator's question using RAG over their comment data.

        Args:
            question: The creator's question
            video_ids: List of video IDs to search (1 = single video, many = channel)
            n_results: Number of comments to retrieve per query
            conversation_history: Previous messages for context memory
        """
        if not video_ids:
            return self.REFUSAL_MESSAGE

        logger.info(f"RAGAgent: Answering '{question[:80]}...' across {len(video_ids)} video(s)")
        logger.info(f"RAGAgent: Video IDs = {video_ids}")

        # 1. Embed the question
        query_embedding = self.embedder.embed_query(question)
        logger.info(f"RAGAgent: Query embedding length = {len(query_embedding)}")

        # 2. Retrieve relevant comments with sentiment filter if detected
        if len(video_ids) == 1:
            logger.info(f"RAGAgent: Querying single video {video_ids[0]}")
            retrieved = self.vs.query(
                video_id=video_ids[0],
                query_embedding=query_embedding,
                n_results=n_results,
            )
        else:
            logger.info(f"RAGAgent: Querying channel with {len(video_ids)} videos")
            per_video_results = max(1, n_results // len(video_ids))
            retrieved = self.vs.query_channel(
                video_ids=video_ids,
                query_embedding=query_embedding,
                n_results_per_video=per_video_results,
                max_results=n_results,
            )

        # Recovery path: if selected scope has no retrievable comments,
        # fall back to all indexed videos so chat still works off fetched data.
        if not retrieved:
            indexed_video_ids = self.vs.list_indexed_video_ids()
            fallback_ids = [vid for vid in indexed_video_ids if vid not in video_ids]
            if fallback_ids:
                logger.warning(
                    "RAGAgent: Selected video_ids had no results, falling back to indexed videos "
                    f"{fallback_ids[:10]}"
                )
                per_video_results = max(1, n_results // len(fallback_ids))
                retrieved = self.vs.query_channel(
                    video_ids=fallback_ids,
                    query_embedding=query_embedding,
                    n_results_per_video=per_video_results,
                    max_results=n_results,
                )

        logger.info(f"RAGAgent: Retrieved {len(retrieved)} comments")
        if not retrieved:
            logger.warning(f"RAGAgent: No comments found for video_ids={video_ids}")
            return self.REFUSAL_MESSAGE

        # 3. Build context
        context = self._build_context(retrieved)

        # 4. Build conversation context from history
        messages = []
        
        # Add conversation history if provided (last 5 exchanges for context)
        if conversation_history and len(conversation_history) > 0:
            # Add system context about previous conversation
            history_context = "\n".join([
                f"{msg['role']}: {msg['content'][:100]}..." 
                for msg in conversation_history[-6:]
            ])
            messages.append({
                "role": "system",
                "content": f"Previous conversation context:\n{history_context}"
            })
        
        # Add current question with retrieved comments
        messages.append({
            "role": "user",
            "content": RAG_USER.format(context=context, question=question),
        })

        # 5. Generate answer
        answer = self.llm.complete_with_history(
            messages=messages,
            system_prompt=RAG_SYSTEM,
            max_tokens=1000,
        )

        # Some models over-refuse even with valid retrieved context.
        # Force one retry for in-scope summarization when that happens.
        if retrieved and self._is_refusal(answer):
            logger.warning(
                "RAGAgent: Model refused despite retrieved context, forcing grounded retry"
            )
            forced_user = (
                "Use only the comments below to answer the creator question. "
                "Do not refuse. If evidence is limited, say that briefly and then summarize what viewers are saying.\n\n"
                f"Comments:\n{context}\n\n"
                f"Question: {question}\n\n"
                "Return a concise, practical answer for a creator."
            )
            answer = self.llm.complete(
                user_prompt=forced_user,
                system_prompt="You are a comment-analysis assistant. Use only provided comments for context.",
                max_tokens=700,
                temperature=0.8,
            )

        if not answer or not answer.strip():
            return self.REFUSAL_MESSAGE

        logger.success("RAGAgent: Answer generated")
        return answer
