"""
backend/agents/orchestrator.py
────────────────────────────────
LangGraph StateGraph orchestrator.
Defines the full pipeline as a graph of agent nodes.

Flow:
  START → data_agent → sentiment_agent → topic_agent → report_agent → END

RAG agent is invoked on-demand separately (not part of ingestion pipeline).
"""
print(f"[LOADING] {__file__}")

from typing import TypedDict, Annotated, Optional
import operator
from loguru import logger

from langgraph.graph import StateGraph, END, START

from backend.agents.data_agent import DataAgent
from backend.agents.sentiment_agent import SentimentAgent
from backend.agents.topic_agent import TopicAgent
from backend.agents.report_agent import ReportAgent


# ─── State Schema ─────────────────────────────────────────────────────────────

class PipelineState(TypedDict):
    """Shared state passed between all agent nodes."""
    # Input
    video_id: str
    video_url: str
    max_comments: Optional[int]

    # Data Agent output
    video_metadata: Optional[dict]
    raw_comments: Optional[list[dict]]
    clean_comments: Optional[list[dict]]

    # Sentiment Agent output
    sentiment_result: Optional[dict]

    # Topic Agent output
    topic_result: Optional[dict]

    # Report Agent output
    report: Optional[str]

    # Error tracking
    errors: Annotated[list[str], operator.add]
    status: str  # "running" | "complete" | "failed"


# ─── Agent Node Wrappers ───────────────────────────────────────────────────────

def run_data_agent(state: PipelineState) -> dict:
    logger.info("▶ DataAgent: Fetching video data...")
    try:
        agent = DataAgent()
        # Always force refresh to ensure data is stored for RAG
        result = agent.run(
            video_id=state["video_id"],
            force_refresh=True,
            max_comments=state.get("max_comments"),
        )
        # Ensure clean_comments is always a list
        clean_comments = result.get("clean_comments", [])
        if not isinstance(clean_comments, list):
            clean_comments = []
        return {
            "video_metadata": result.get("metadata"),
            "raw_comments": result.get("raw_comments", []),
            "clean_comments": clean_comments,
            "status": "data_complete",
        }
    except Exception as e:
        logger.exception("DataAgent failed")
        return {"errors": [f"DataAgent: {str(e)}"], "status": "failed"}


def run_sentiment_agent(state: PipelineState) -> dict:
    logger.info("▶ SentimentAgent: Analyzing sentiment...")
    if state.get("status") == "failed":
        return {}

    # Handle empty comments gracefully
    clean_comments = state.get("clean_comments", [])
    if not clean_comments:
        logger.warning("No comments available for sentiment analysis, skipping...")
        return {
            "sentiment_result": {
                "overall_sentiment": "unknown",
                "sentiment_score": 0.0,
                "sentiment_distribution": {"positive": 0, "negative": 0, "neutral": 100},
                "vibe_score": 0,
                "likeness_score": 0,
                "comments_analyzed": 0,
                "summary": "No comments available for analysis.",
            },
            "status": "sentiment_complete",
        }

    try:
        agent = SentimentAgent()
        result = agent.run(
            comments=clean_comments,
            video_title=state["video_metadata"]["title"],
        )
        return {"sentiment_result": result, "status": "sentiment_complete"}
    except Exception as e:
        logger.exception("SentimentAgent failed")
        return {"errors": [f"SentimentAgent: {str(e)}"], "status": "failed"}


def run_topic_agent(state: PipelineState) -> dict:
    logger.info("▶ TopicAgent: Clustering topics...")
    if state.get("status") == "failed":
        return {}

    # Handle empty comments gracefully
    clean_comments = state.get("clean_comments", [])
    if not clean_comments:
        logger.warning("No comments available for topic clustering, skipping...")
        return {
            "topic_result": {
                "topics": [],
                "total_comments": 0,
            },
            "status": "topics_complete",
        }

    try:
        agent = TopicAgent()
        result = agent.run(
            video_id=state["video_id"],
            comments=clean_comments,
            video_title=state["video_metadata"]["title"],
        )
        return {"topic_result": result, "status": "topics_complete"}
    except Exception as e:
        logger.exception("TopicAgent failed")
        return {"errors": [f"TopicAgent: {str(e)}"], "status": "failed"}


def run_report_agent(state: PipelineState) -> dict:
    logger.info("▶ ReportAgent: Generating insight report...")
    if state.get("status") == "failed":
        return {}

    # Handle empty comments gracefully
    clean_comments = state.get("clean_comments", [])
    total_comments = len(clean_comments) if clean_comments else 0

    try:
        agent = ReportAgent()
        report = agent.run(
            video_metadata=state["video_metadata"],
            sentiment=state["sentiment_result"],
            topics=state["topic_result"],
            total_comments=total_comments,
        )
        return {"report": report, "status": "complete"}
    except Exception as e:
        logger.exception("ReportAgent failed")
        return {"errors": [f"ReportAgent: {str(e)}"], "status": "failed"}


# ─── Graph Construction ───────────────────────────────────────────────────────

def build_pipeline() -> StateGraph:
    """Build and return the compiled LangGraph pipeline."""
    graph = StateGraph(PipelineState)

    # Register nodes
    graph.add_node("data_agent", run_data_agent)
    graph.add_node("sentiment_agent", run_sentiment_agent)
    graph.add_node("topic_agent", run_topic_agent)
    graph.add_node("report_agent", run_report_agent)

    # Define edges (sequential pipeline)
    graph.add_edge(START, "data_agent")
    graph.add_edge("data_agent", "sentiment_agent")
    graph.add_edge("sentiment_agent", "topic_agent")
    graph.add_edge("topic_agent", "report_agent")
    graph.add_edge("report_agent", END)

    return graph.compile()


# ─── Public Interface ─────────────────────────────────────────────────────────

class TubeInsightPipeline:
    def __init__(self):
        self.pipeline = build_pipeline()

    def analyze_video(
        self,
        video_url: str,
        video_id: str,
        max_comments: int | None = None,
    ) -> PipelineState:
        """Run the full analysis pipeline for a single video."""
        logger.info(f"🚀 Starting TubeInsight pipeline for {video_id}")

        initial_state: PipelineState = {
            "video_id": video_id,
            "video_url": video_url,
            "max_comments": max_comments,
            "video_metadata": None,
            "raw_comments": None,
            "clean_comments": None,
            "sentiment_result": None,
            "topic_result": None,
            "report": None,
            "errors": [],
            "status": "running",
        }

        final_state = self.pipeline.invoke(initial_state)

        if final_state["status"] == "complete":
            logger.success(f"✅ Pipeline complete for {video_id}")
        else:
            logger.error(f"❌ Pipeline failed: {final_state['errors']}")

        return final_state


class TubeInsightPipelineWithProgress:
    """Pipeline that yields progress updates for streaming."""
    
    def analyze_video_with_progress(
        self,
        video_url: str,
        video_id: str,
        max_comments: int | None = None,
    ):
        """
        Generator that yields progress updates during analysis.
        
        Yields dicts with:
        - type: "progress" or "result"
        - For progress: stage, progress (0-100), message
        - For result: data (final state)
        """
        logger.info(f"🚀 Starting TubeInsight pipeline with progress for {video_id}")
        
        state: PipelineState = {
            "video_id": video_id,
            "video_url": video_url,
            "max_comments": max_comments,
            "video_metadata": None,
            "raw_comments": None,
            "clean_comments": None,
            "sentiment_result": None,
            "topic_result": None,
            "report": None,
            "errors": [],
            "status": "running",
        }
        
        # Stage 1: Data Agent (15-35%)
        yield {"type": "progress", "stage": "fetching_data", "progress": 15, "message": "Fetching comments..."}
        
        data_result = run_data_agent(state)
        state.update(data_result)
        
        if state.get("status") == "failed":
            yield {"type": "progress", "stage": "error", "progress": 0, "message": "Failed to fetch video data"}
            yield {"type": "result", "data": state}
            return
        
        comment_count = len(state.get("clean_comments", []))
        yield {"type": "progress", "stage": "fetching_data", "progress": 35, "message": f"Fetched {comment_count} comments"}
        
        # Stage 2: Sentiment Agent (35-60%)
        yield {"type": "progress", "stage": "analyzing_sentiment", "progress": 40, "message": "Analyzing sentiment..."}
        
        sentiment_result = run_sentiment_agent(state)
        state.update(sentiment_result)
        
        if state.get("status") == "failed":
            yield {"type": "progress", "stage": "error", "progress": 0, "message": "Sentiment analysis failed"}
            yield {"type": "result", "data": state}
            return
        
        yield {"type": "progress", "stage": "analyzing_sentiment", "progress": 60, "message": "Sentiment analysis complete"}
        
        # Stage 3: Topic Agent (60-80%)
        yield {"type": "progress", "stage": "clustering_topics", "progress": 65, "message": "Discovering topics..."}
        
        topic_result = run_topic_agent(state)
        state.update(topic_result)
        
        if state.get("status") == "failed":
            yield {"type": "progress", "stage": "error", "progress": 0, "message": "Topic clustering failed"}
            yield {"type": "result", "data": state}
            return
        
        topic_count = len(state.get("topic_result", {}).get("topics", []))
        yield {"type": "progress", "stage": "clustering_topics", "progress": 80, "message": f"Found {topic_count} topics"}
        
        # Stage 4: Report Agent (80-95%)
        yield {"type": "progress", "stage": "generating_report", "progress": 85, "message": "Generating insights..."}
        
        report_result = run_report_agent(state)
        state.update(report_result)
        
        if state.get("status") == "failed":
            yield {"type": "progress", "stage": "error", "progress": 0, "message": "Report generation failed"}
            yield {"type": "result", "data": state}
            return
        
        yield {"type": "progress", "stage": "generating_report", "progress": 95, "message": "Finalizing report..."}
        
        # Done!
        logger.success(f"✅ Pipeline with progress complete for {video_id}")
        yield {"type": "result", "data": state}
