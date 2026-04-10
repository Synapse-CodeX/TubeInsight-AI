"""
api.py
────────────────
TubeInsight AI — FastAPI Backend

Exposes the LangGraph agent pipeline and RAG chat as REST endpoints.
"""

import sys
import json
from datetime import datetime
from typing import Optional, Generator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from loguru import logger

# Ensure project root is in path
sys.path.insert(0, ".")

from backend.core.youtube_client import YouTubeClient, ChannelHasNoVideosError
from backend.agents.orchestrator import TubeInsightPipeline, TubeInsightPipelineWithProgress
from backend.agents.rag_agent import RAGAgent


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    youtube_url: Optional[str] = None  # Single video URL
    youtube_urls: Optional[list[str]] = None  # Multiple video URLs for channel analysis
    max_comments: Optional[int] = 100
    analysis_type: str = "video"  # "video" or "channel"


class AnalyzeResponse(BaseModel):
    sentiment: dict
    top_comments: list[str]
    channel_insights: dict
    agent_summaries: dict
    video_metadata: dict
    topics: list[dict] = []


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    response: str


class ChannelVideosRequest(BaseModel):
    channel_url: str
    max_results: Optional[int] = 20


class ChannelVideo(BaseModel):
    video_id: str
    title: str
    published_at: str
    thumbnail: Optional[str] = None
    channel_id: str
    channel_name: str


class ChannelVideosResponse(BaseModel):
    videos: list[ChannelVideo]
    channel_name: str
    channel_id: str


class HealthResponse(BaseModel):
    status: str


class ProgressEvent(BaseModel):
    """Progress update event for SSE streaming."""
    stage: str  # initializing, fetching_data, analyzing_sentiment, clustering_topics, generating_report, complete, error
    progress: int  # 0-100
    message: str
    video_metadata: Optional[dict] = None  # Sent early so frontend can show thumbnail
    partial_results: Optional[dict] = None  # Partial results as they become available


# ─── Global State ─────────────────────────────────────────────────────────────

# Store the current video_id for RAG context across requests
_current_video_id: Optional[str] = None
_current_video_ids: list[str] = []
# Store conversation history for memory
_conversation_history: list[dict] = []


def combine_analysis_results(all_results: list, yt: YouTubeClient) -> dict:
    """
    Combine analysis results from multiple videos into a single response.
    Used for channel analysis with multiple selected videos.
    """
    if not all_results:
        raise ValueError("No results to combine")
    
    # If only one result, return it directly
    if len(all_results) == 1:
        result = all_results[0]
        sentiment_result = result.get("sentiment_result", {})
        metadata = result.get("video_metadata", {})
        clean_comments = result.get("clean_comments", [])
        channel_id = metadata.get("channel_id", "")
        channel_details = yt.get_channel_details(channel_id) if channel_id else {}
        
        views = metadata.get("view_count", 0)
        likes = metadata.get("like_count", 0)
        comments_count = len(clean_comments)
        engagement_rate = ((likes + comments_count) / views * 100) if views > 0 else 0.0
        
        return {
            "sentiment": {
                "label": sentiment_result.get("overall_sentiment", "neutral"),
                "score": sentiment_result.get("sentiment_score", 0.0),
                "vibe_score": sentiment_result.get("vibe_score", 5),
                "likeness_score": sentiment_result.get("likeness_score", 5),
                "toxicity_level": sentiment_result.get("toxicity_level", "unknown"),
                "sentiment_distribution": sentiment_result.get("sentiment_distribution", {
                    "positive": 33, "negative": 33, "neutral": 34
                }),
                "emotion_breakdown": sentiment_result.get("emotion_breakdown", {
                    "joy": 20, "anger": 20, "love": 20, "surprise": 20, "sadness": 20
                }),
                "top_praises": sentiment_result.get("top_praises", []),
                "top_criticisms": sentiment_result.get("top_criticisms", []),
                "top_questions": sentiment_result.get("top_questions", []),
                "summary": sentiment_result.get("summary", ""),
            },
            "top_comments": [c["text"] for c in sorted(clean_comments, key=lambda x: x.get("like_count", 0), reverse=True)[:10]],
            "all_comments": [{"text": c.get("text", ""), "author": c.get("author", "Anonymous"), 
                             "like_count": c.get("like_count", 0), "published_at": c.get("published_at", "")} 
                            for c in clean_comments],
            "channel_insights": {
                "subscriber_count": channel_details.get("subscriber_count", 0),
                "avg_views": channel_details.get("view_count", views),
                "engagement_rate": engagement_rate,
                "channel_name": metadata.get("channel_name", channel_details.get("channel_name", "Unknown")),
                "channel_id": channel_id,
                "total_videos": channel_details.get("video_count", 0),
            },
            "agent_summaries": {
                "data_agent": f"Processed {len(clean_comments)} comments from video '{metadata.get('title', 'Unknown')}'",
                "sentiment_agent": sentiment_result.get("summary", "Sentiment analysis completed."),
                "topic_agent": f"Identified {len(result.get('topic_result', {}).get('topics', []))} key themes.",
                "report_agent": result.get("report", ""),
            },
            "video_metadata": {
                "title": metadata.get("title", "Unknown"),
                "views": metadata.get("view_count", 0),
                "likes": metadata.get("like_count", 0),
                "duration": "Unknown",
                "thumbnail": metadata.get("thumbnail", ""),
                "published_at": metadata.get("published_at", ""),
                "video_id": metadata.get("video_id", ""),
                "url": metadata.get("url", ""),
                "comment_count": comments_count,
                "channel_name": metadata.get("channel_name", ""),
                "channel_id": channel_id,
            },
            "topics": result.get("topic_result", {}).get("topics", []),
            "report": result.get("report", ""),
        }
    
    # For multiple videos, combine the results
    all_comments_combined = []
    all_topics = []
    all_reports = []
    total_views = 0
    total_likes = 0
    channel_id = ""
    channel_name = ""
    
    for result in all_results:
        clean_comments = result.get("clean_comments", [])
        all_comments_combined.extend(clean_comments)
        
        metadata = result.get("video_metadata", {})
        total_views += metadata.get("view_count", 0)
        total_likes += metadata.get("like_count", 0)
        channel_id = metadata.get("channel_id", channel_id)
        channel_name = metadata.get("channel_name", channel_name)
        
        topics = result.get("topic_result", {}).get("topics", [])
        all_topics.extend(topics)
        
        report = result.get("report", "")
        if report:
            all_reports.append(report)
    
    # Get channel details
    channel_details = yt.get_channel_details(channel_id) if channel_id else {}
    
    # Calculate combined metrics
    total_comments = len(all_comments_combined)
    engagement_rate = ((total_likes + total_comments) / total_views * 100) if total_views > 0 else 0.0
    
    # Sort combined comments by likes and take top 10
    sorted_comments = sorted(all_comments_combined, key=lambda x: x.get("like_count", 0), reverse=True)
    top_comments = [c["text"] for c in sorted_comments[:10]]
    
    # Aggregate sentiments from all videos (simple average)
    all_sentiments = [r.get("sentiment_result", {}) for r in all_results]
    avg_score = sum(s.get("sentiment_score", 0) for s in all_sentiments) / len(all_sentiments) if all_sentiments else 0
    avg_vibe = sum(s.get("vibe_score", 5) for s in all_sentiments) / len(all_sentiments) if all_sentiments else 5
    
    # Collect all praises, criticisms, questions
    all_praises = []
    all_criticisms = []
    all_questions = []
    for s in all_sentiments:
        all_praises.extend(s.get("top_praises", []))
        all_criticisms.extend(s.get("top_criticisms", []))
        all_questions.extend(s.get("top_questions", []))
    
    return {
        "sentiment": {
            "label": "mixed" if len(all_results) > 1 else all_sentiments[0].get("overall_sentiment", "neutral"),
            "score": avg_score,
            "vibe_score": round(avg_vibe),
            "likeness_score": 5,
            "toxicity_level": "low",
            "sentiment_distribution": {"positive": 40, "negative": 30, "neutral": 30},
            "emotion_breakdown": {"joy": 25, "anger": 15, "love": 20, "surprise": 20, "sadness": 20},
            "top_praises": all_praises[:5],
            "top_criticisms": all_criticisms[:5],
            "top_questions": all_questions[:5],
            "summary": f"Combined analysis of {len(all_results)} videos with {total_comments} total comments.",
        },
        "top_comments": top_comments,
        "all_comments": [{"text": c.get("text", ""), "author": c.get("author", "Anonymous"),
                         "like_count": c.get("like_count", 0), "published_at": c.get("published_at", "")}
                        for c in sorted_comments],
        "channel_insights": {
            "subscriber_count": channel_details.get("subscriber_count", 0),
            "avg_views": total_views // len(all_results) if all_results else 0,
            "engagement_rate": engagement_rate,
            "channel_name": channel_name or channel_details.get("channel_name", "Unknown"),
            "channel_id": channel_id,
            "total_videos": channel_details.get("video_count", 0),
        },
        "agent_summaries": {
            "data_agent": f"Processed {total_comments} comments from {len(all_results)} videos",
            "sentiment_agent": f"Combined sentiment analysis across {len(all_results)} videos.",
            "topic_agent": f"Identified {len(all_topics)} themes across all videos.",
            "report_agent": "\n\n".join(all_reports) if all_reports else "Channel analysis complete.",
        },
        "video_metadata": {
            "title": f"Channel Analysis ({len(all_results)} videos)",
            "views": total_views,
            "likes": total_likes,
            "duration": "N/A",
            "thumbnail": all_results[0].get("video_metadata", {}).get("thumbnail", "") if all_results else "",
            "published_at": "",
            "video_id": "channel_analysis",
            "url": "",
            "comment_count": total_comments,
            "channel_name": channel_name,
            "channel_id": channel_id,
        },
        "topics": all_topics[:10],  # Limit to top 10 topics
        "report": "\n\n".join(all_reports) if all_reports else "",
    }


# ─── FastAPI App ─────────────────────────────────────────────────────────────-

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 TubeInsight API starting up...")
    yield
    logger.info("🛑 TubeInsight API shutting down...")


app = FastAPI(
    title="TubeInsight AI API",
    description="AI-powered YouTube comment intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_video(request: AnalyzeRequest):
    """
    Analyze YouTube video(s) using the full LangGraph agent pipeline.
    
    For single video: Provide youtube_url
    For channel analysis: Provide youtube_urls (list of URLs)
    
    Returns sentiment analysis, top comments, channel insights,
    agent summaries, and video metadata.
    """
    global _current_video_id, _current_video_ids
    
    yt = YouTubeClient()
    
    # Determine if single or multi-video analysis
    if request.youtube_urls and len(request.youtube_urls) > 0:
        # Multi-video channel analysis
        video_urls = request.youtube_urls[:10]  # Max 10 videos
        is_multi = True
    elif request.youtube_url:
        # Single video analysis
        video_urls = [request.youtube_url]
        is_multi = False
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide either youtube_url (single) or youtube_urls (multiple)"
        )
    
    all_results = []
    all_video_ids = []
    
    # Analyze each video
    for video_url in video_urls:
        video_id = yt.extract_video_id(video_url)
        if not video_id:
            logger.warning(f"Could not extract video ID from URL: {video_url}")
            continue
            
        try:
            pipeline = TubeInsightPipeline()
            result = pipeline.analyze_video(
                video_url=video_url,
                video_id=video_id,
                max_comments=request.max_comments,
            )
            
            if result["status"] == "complete":
                all_results.append(result)
                all_video_ids.append(video_id)
            else:
                logger.warning(f"Analysis incomplete for video {video_id}")
        except Exception as e:
            logger.error(f"Failed to analyze video {video_id}: {e}")
            continue
    
    if not all_results:
        if is_multi:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "CHANNEL_NO_ANALYZABLE_VIDEOS",
                    "message": "No analyzable videos were found for this channel selection.",
                },
            )
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze any videos. Please check the URL and try again."
        )
    
    # Store video_ids for RAG context
    _current_video_ids = all_video_ids
    _current_video_id = all_video_ids[0] if all_video_ids else None
    
    # Combine results from all videos
    combined = combine_analysis_results(all_results, yt)
    
    return combined


def generate_progress_events(
    video_url: str,
    video_id: str,
    max_comments: int,
    yt: YouTubeClient,
) -> Generator[str, None, None]:
    """Generate SSE progress events during video analysis."""
    global _current_video_id, _current_video_ids
    
    def format_sse(data: dict) -> str:
        return f"data: {json.dumps(data)}\n\n"
    
    try:
        # Stage 1: Initializing - get video metadata first (fast)
        yield format_sse({
            "stage": "initializing",
            "progress": 5,
            "message": "Fetching video details...",
        })
        
        # Fetch video metadata quickly
        try:
            video_metadata = yt.get_video_metadata(video_id)
            yield format_sse({
                "stage": "initializing",
                "progress": 10,
                "message": f"Found: {video_metadata.get('title', 'Video')}",
                "video_metadata": {
                    "title": video_metadata.get("title", "Unknown"),
                    "views": video_metadata.get("view_count", 0),
                    "likes": video_metadata.get("like_count", 0),
                    "thumbnail": video_metadata.get("thumbnail", ""),
                    "published_at": video_metadata.get("published_at", ""),
                    "video_id": video_id,
                    "url": video_url,
                    "channel_name": video_metadata.get("channel_name", ""),
                    "channel_id": video_metadata.get("channel_id", ""),
                },
            })
        except Exception as e:
            logger.warning(f"Failed to fetch video metadata early: {e}")
        
        # Stage 2: Run full pipeline with progress callbacks
        pipeline = TubeInsightPipelineWithProgress()
        
        result = None
        for update in pipeline.analyze_video_with_progress(
            video_url=video_url,
            video_id=video_id,
            max_comments=max_comments,
        ):
            if update.get("type") == "progress":
                yield format_sse({
                    "stage": update["stage"],
                    "progress": update["progress"],
                    "message": update["message"],
                })
            elif update.get("type") == "result":
                result = update["data"]
        
        if not result or result.get("status") == "failed":
            yield format_sse({
                "stage": "error",
                "progress": 0,
                "message": "Analysis failed. Please try again.",
            })
            return
        
        # Store for RAG context
        _current_video_ids = [video_id]
        _current_video_id = video_id
        
        # Combine and send final results
        combined = combine_analysis_results([result], yt)
        
        yield format_sse({
            "stage": "complete",
            "progress": 100,
            "message": "Analysis complete!",
            "partial_results": combined,
        })
        
    except Exception as e:
        logger.exception("Progress streaming failed")
        yield format_sse({
            "stage": "error",
            "progress": 0,
            "message": f"Analysis failed: {str(e)}",
        })


@app.post("/analyze/stream")
async def analyze_video_stream(request: AnalyzeRequest):
    """
    Stream video analysis progress using Server-Sent Events.
    
    Returns progress updates as the analysis proceeds, including
    video metadata early so the frontend can display thumbnails.
    """
    yt = YouTubeClient()
    
    # Currently only supports single video for streaming
    if not request.youtube_url:
        raise HTTPException(
            status_code=400,
            detail="Please provide youtube_url for streaming analysis"
        )
    
    video_id = yt.extract_video_id(request.youtube_url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Could not extract video ID from URL"
        )
    
    return StreamingResponse(
        generate_progress_events(
            video_url=request.youtube_url,
            video_id=video_id,
            max_comments=request.max_comments or 100,
            yt=yt,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the RAG agent about the analyzed video(s).
    
    Requires a video to have been analyzed first via /analyze.
    """
    global _current_video_ids, _conversation_history
    
    if not _current_video_ids:
        raise HTTPException(
            status_code=400,
            detail="No video has been analyzed yet. Please call /analyze first."
        )
    
    try:
        agent = RAGAgent()
        
        # Add user message to history
        _conversation_history.append({
            "role": "user",
            "content": request.query,
            "timestamp": datetime.now().isoformat()
        })
        
        # Get answer with conversation context
        answer = agent.chat(
            question=request.query,
            video_ids=_current_video_ids,
            conversation_history=_conversation_history[-10:],  # Last 10 messages for context
        )
        
        # Add assistant response to history
        _conversation_history.append({
            "role": "assistant",
            "content": answer,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 20 messages to prevent memory bloat
        if len(_conversation_history) > 20:
            _conversation_history = _conversation_history[-20:]
        
        return {"response": answer}
    except Exception as e:
        logger.exception("RAG chat failed")
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )


@app.post("/channel/videos", response_model=ChannelVideosResponse)
async def get_channel_videos(request: ChannelVideosRequest):
    """
    Fetch the latest videos from a YouTube channel.
    
    Returns up to max_results videos (default 20) for user selection.
    """
    yt = YouTubeClient()
    
    # Extract channel ID from URL
    channel_id = yt.extract_channel_id(request.channel_url)
    
    if not channel_id:
        raise HTTPException(
            status_code=400,
            detail="Could not extract channel ID from URL. Please provide a valid YouTube channel URL."
        )
    
    try:
        videos = yt.get_channel_videos(channel_id, max_results=request.max_results)
        
        if not videos:
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "CHANNEL_NO_VIDEOS",
                    "message": "No videos found for this channel.",
                },
            )
        
        return {
            "videos": videos,
            "channel_name": videos[0]["channel_name"] if videos else "Unknown",
            "channel_id": channel_id,
        }
    except ChannelHasNoVideosError as e:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CHANNEL_NO_VIDEOS",
                "message": str(e),
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Failed to fetch channel videos")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch channel videos: {str(e)}"
        )


# ─── Main Entry Point ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
