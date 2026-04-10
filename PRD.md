# 📋 TubeInsight AI — Product Requirements Document

## Executive Summary

**TubeInsight AI** is an AI-powered YouTube creator intelligence platform that transforms raw comment data into structured, actionable insights. It combines multi-agent AI orchestration, vector embeddings, and large language models to help creators understand audience sentiment, discover discussion themes, and make data-driven content decisions.

---

## 1. Product Overview

### Vision
Empower YouTube creators with AI-driven audience intelligence — turning thousands of comments into clear, quantified insights about viewer sentiment, engagement, and interests.

### Core Value Proposition
- **Quantify Audience Sentiment**: Get percentage breakdowns of positive/negative/neutral reactions with emotion-level detail (joy, anger, love, surprise, etc.)
- **Discover Hidden Themes**: Automatically cluster comments into meaningful topics via embeddings + KMeans + LLM labeling
- **Generate Insights Automatically**: Get AI-written strategic report per video analyzing strengths, criticisms, questions
- **Ask Questions**: RAG chatbot lets creators query their audience data naturally ("What do viewers want to see next?")

---

## 2. Key Features

| Feature | Description | Use Case |
|---------|-------------|----------|
| **Channel Analysis** | Dashboard showing sentiment trends across latest 10 videos | Track sentiment trajectory over time |
| **Video Deep-Dive** | Single-video analysis with detailed sentiment breakdown, topic clusters, insight report | Understand specific video reception |
| **AI Sentiment Scoring** | Per-video: overall sentiment, vibe score (1-10 energy), likeness score, toxicity level | Quick audience reaction snapshot |
| **Emotion Breakdown** | Percentage distribution: joy, anger, sadness, surprise, love, neutral | Nuanced emotion understanding |
| **Top Praises/Criticisms** | Extracted from comments what viewers praised and complained about | Content optimization |
| **Topic Clustering** | 6+ automatically labeled clusters of discussion themes | Understand what viewers discuss |
| **Insight Reports** | Auto-generated strategic summary with recommendations | Actionable creator guidance |
| **Q&A Chatbot (RAG)** | Natural language queries against comment database | "What do people want next?", "Why did they like this?" |

---

## 3. Technical Architecture

### 3.1 System Diagram
```
┌──────────────────────────────────────┐
│      STREAMLIT FRONTEND              │
│  - Home, Channel View, Video Analysis│
│  - AI Chat Interface                 │
└────────────┬─────────────────────────┘
             │
┌────────────▼─────────────────────────┐
│   LANGGRAPH ORCHESTRATOR             │
│   Sequential State Machine Pipeline  │
└────────────┬────────────┬────────────┘
             │            │
    ┌────────▼──┐  ┌──────▼──────┐
    │ Data Agent│  │RAG Agent    │
    │ (YouTube) │  │(on-demand)  │
    └────────────┘  └─────────────┘
             │
    ┌────────▼──────────────┐
    │ Sentiment Agent       │
    │ (LLM emotion analysis)│
    └────────┬──────────────┘
    ┌────────▼──────────────┐
    │ Topic Agent           │
    │ (KMeans + LLM label)  │
    └────────┬──────────────┘
    ┌────────▼──────────────┐
    │ Report Agent          │
    │ (Final synthesis)     │
    └──────────────────────┘
             │
┌────────────▼─────────────────────────┐
│         CORE SERVICES                │
│  - YouTube Client (API v3)           │
│  - LLM Client (OpenRouter/Ollama)    │
│  - Embedding Client (sentence-transformers)
│  - VectorStore (ChromaDB)            │
└──────────────────────────────────────┘
```

### 3.2 Data Flow: Single Video Analysis

1. **User Input**: YouTube video URL
2. **DataAgent**:
   - Extract video ID from URL
   - Fetch metadata: title, views, likes, comment count
   - Fetch up to 500 raw comments (configurable)
   - Preprocess: filter spam, clean text
   - Embed each comment (sentence-transformers)
   - Store vectors + text in ChromaDB (per-video collection)

3. **SentimentAgent**:
   - Sample top 100 comments by likes (cost-conscious)
   - Send to LLM in chunks (~6000 chars, ~40 comments/chunk)
   - LLM returns JSON: sentiment%, vibe score, emotions, praise/criticism/questions
   - Merge chunk results
   - Fallback: If all chunks fail, raise error (not silent)

4. **TopicAgent**:
   - Retrieve all comment embeddings from ChromaDB
   - Run KMeans clustering (k=6, normalized cosine distance)
   - Select 3 representative comments per cluster (highest likes)
   - Send cluster summaries to LLM for human-readable label + description
   - LLM returns: topic name, description, sentiment, size, examples

5. **ReportAgent**:
   - Takes all upstream results (sentiment, topics, metadata)
   - LLM synthesizes final insight report
   - Conversational tone, actionable recommendations

6. **Store Results**: Cache in session, displayable in UI

### 3.3 Data Flow: Channel Analysis

- User provides channel URL
- Fetch latest 10 videos
- Run single-video pipeline on each
- Aggregate sentiment scores over time
- Show trends, averages, breakdowns

### 3.4 Data Flow: RAG Chat

1. User asks question (e.g., "What do people want to see next?")
2. Embed question using same embedding model
3. Query ChromaDB collection(s) for top-K relevant comments (5-10 results)
4. Send user question + retrieved comments to LLM
5. LLM generates grounded answer referencing comment data
6. Display response to user

---

## 4. Technology Stack

### Frontend & UI
- **Streamlit** 1.39+ — web dashboard framework
- **Plotly** 5.24 — interactive charts (sentiment timelines, emotion wheels, etc.)
- **Wordcloud** 1.9 — visual topic representation
- **Pandas** 2.2 — data manipulation
- **Matplotlib** 3.9 — static plots

### Agent Orchestration & LLM
- **LangGraph** 0.2+ — state machine orchestration (replaces chains)
- **LangChain** 0.3+ — core abstractions
- **OpenAI Python Client** 1.51+ — compatible with both OpenRouter and Ollama
- **Tenacity** 9.0+ — automatic retries with exponential backoff

### NLP & Embeddings
- **sentence-transformers** 3.1+ — `all-MiniLM-L6-v2` model (384-dim vectors, local)
- **VADER** (via NLTK) — baseline sentiment scoring (not used in final pipeline, kept for reference)
- **scikit-learn** 1.5+ — KMeans clustering, vector normalization
- **BERTopic** 0.16+ — installed but not currently used (could replace KMeans)

### Data & Persistence
- **ChromaDB** 0.5+ — vector database, stores embeddings + metadata per-video collection
- **diskcache** 5.6+ — file-based caching for API responses, processed comments
- **YouTube Data API v3** — via `google-api-python-client`, `google-auth`

### Infrastructure
- **FastAPI** 0.115+ — optional REST API layer (currently used minimally in UI)
- **Uvicorn** 0.31+ — ASGI server for FastAPI
- **Pydantic** 2.9+ — settings management, request validation
- **pydantic-settings** 2.5+ — `.env` file loading with type checking
- **python-dotenv** 1.0+ — environment variable loading

### Utilities
- **loguru** 0.7+ — structured logging (replaces Python stdlib logging)
- **httpx** 0.27+ — async HTTP client (used by OpenAI client internally)
- **rich** 13.8+ — pretty CLI output

### Development & Testing
- **pytest** 8.3+
- **pytest-asyncio** 0.24+

---

## 5. Configuration & Environment Variables

```env
# YouTube API
YOUTUBE_API_KEY=<required>

# LLM Backend (choose one)
OPENROUTER_API_KEY=<if using OpenRouter>
OLLAMA_BASE_URL=http://localhost:11434  # if using local Ollama
OLLAMA_MODEL=qwen3.5:0.8b  # or gemma3:1b, etc.

# Optional: override default model
LLM_MODEL=anthropic/claude-3.5-sonnet:beta  # OpenRouter model ID

# Storage Paths
CHROMA_PERSIST_DIR=./data/vectorstore
CACHE_DIR=./data/processed
RAW_DATA_DIR=./data/raw

# Ingestion Limits
MAX_COMMENTS_PER_VIDEO=500
MAX_VIDEOS_PER_CHANNEL=10

# Logging
APP_ENV=development | production
LOG_LEVEL=DEBUG | INFO | WARNING | ERROR
```

---

## 6. Directory Structure

```
tubeinsight-ai/
├── frontend/
│   ├── app.py                          # Home page, navigation
│   └── pages/
│       ├── 01_channel_view.py          # Multi-video dashboard
│       ├── 02_video_analysis.py        # Single video deep-dive
│       └── 03_ai_chat.py               # RAG chatbot interface
│
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py             # LangGraph StateGraph + TubeInsightPipeline class
│   │   ├── data_agent.py               # YouTube fetch + preprocess + embed + store
│   │   ├── sentiment_agent.py          # LLM sentiment analysis
│   │   ├── topic_agent.py              # KMeans clustering + LLM labeling
│   │   ├── report_agent.py             # Final report synthesis
│   │   └── rag_agent.py                # Q&A chatbot agent
│   │
│   ├── core/
│   │   ├── youtube_client.py           # YouTube API wrapper (fetch metadata, comments)
│   │   ├── llm_client.py               # OpenAI-compatible client (OpenRouter/Ollama)
│   │   ├── embeddings.py               # sentence-transformers wrapper
│   │   ├── vectorstore.py              # ChromaDB wrapper (upsert, query, delete)
│   │   └── ollama_startup.py           # Auto-start Ollama service
│   │
│   └── utils/
│       └── preprocessing.py            # Comment cleaning, chunking, deduplication
│
├── config/
│   ├── settings.py                     # Pydantic Settings (loads from .env)
│   └── prompts.py                      # All LLM prompt templates (centralized)
│
├── data/
│   ├── raw/                            # Downloaded JSON from YouTube API
│   ├── processed/                      # Cleaned comment CSVs
│   └── vectorstore/                    # ChromaDB persistent directory
│
├── docs/
│   └── architecture.md                 # Architecture details
│
├── .env                                # Environment configuration
├── requirements.txt                    # Python dependencies
├── README.md                           # Quick-start guide
├── PRD.md                              # This file
└── [test files]
```

---

## 7. Data Models

### Comment Object (Post-Processing)
```python
{
    "author": str,
    "text": str,
    "like_count": int,
    "reply_count": int,
    "published_at": datetime,
    "video_id": str,
}
```

### Sentiment Result (SentimentAgent output)
```json
{
  "overall_sentiment": "positive|negative|neutral|mixed",
  "sentiment_score": -1.0 to 1.0,
  "sentiment_distribution": {
    "positive": 0-100,
    "negative": 0-100,
    "neutral": 0-100
  },
  "vibe_score": 1-10,
  "likeness_score": 1-10,
  "emotion_breakdown": {
    "joy": 0-100,
    "anger": 0-100,
    "sadness": 0-100,
    "surprise": 0-100,
    "love": 0-100,
    "neutral": 0-100
  },
  "top_praises": ["...", "..."],
  "top_criticisms": ["...", "..."],
  "top_questions": ["...", "..."],
  "toxicity_level": "low|medium|high",
  "summary": "...",
  "comments_analyzed": 100
}
```

### Topic Result (TopicAgent output)
```json
{
  "topics": [
    {
      "id": 0,
      "label": "Production Quality Praise",
      "description": "Viewers commenting positively on video/audio quality",
      "sentiment": "positive|negative|neutral",
      "size": 45,
      "representative_comments": ["comment1", "comment2", "comment3"]
    }
  ]
}
```

---

## 8. Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| **LangGraph over LLMChain** | State machines guarantee reliability; each agent's output is type-checked via TypedDict |
| **KMeans over BERTopic** | Faster, simpler to tune; gives excellent results with 6 clusters; lower complexity |
| **VADER + LLM (comment filtering)** | VADER runs free on all comments; LLM analysis limited to top 100 by likes → cost efficiency |
| **Per-video ChromaDB collections** | Isolated collections allow fast single-video queries; easy cache invalidation; channel queries merge collections |
| **Local embeddings (sentence-transformers)** | No API cost, low latency, 384-dim vectors sufficient for clustering |
| **Ollama auto-start** | Users get seamless experience; app launches Ollama if not already running |
| **Prompt templating centralized** | All LLM prompts in `config/prompts.py` — easy versioning and A/B testing without touching agent logic |

---

## 9. Cost Estimates (per video, ~300 comments)

| Component | Cost |
|-----------|------|
| **Embeddings** (300 local vectors) | $0 |
| **Sentiment Analysis** (100 comments, 3 chunks, 800 tokens each) | ~$0.02-0.10 (depends on LLM) |
| **Topic Labeling** (6 clusters × 100 tokens) | ~$0.01-0.05 |
| **Report Synthesis** (1000 tokens) | ~$0.01-0.05 |
| **Total per video (OpenRouter/Claude)** | ~$0.04-0.20 |
| **Total per video (local Ollama)** | $0 |

Full channel (10 videos): ~$0.40-2.00 with OpenRouter; $0 with Ollama.

---

## 10. User Workflows

### Workflow A: Analyze Single Video
1. User navigates to "Video Analysis" page
2. Pastes YouTube URL
3. Clicks "Analyze Video"
4. Sees loading spinner while pipeline runs (~30-60s)
5. Views sentiment scores, emotion breakdown, top praise/criticism/questions
6. Sees topic clusters with representative comments
7. Reads AI-generated insight report
8. Saves video ID to session for use in AI Chat tab

### Workflow B: Analyze Channel
1. User navigates to "Channel Analysis" page
2. Pastes channel URL
3. Clicks "Analyze Channel"
4. App fetches latest 10 videos
5. Runs pipeline on each (takes 5-10 minutes)
6. Shows dashboard with sentiment trends, average scores, top topics across all videos
7. Lets user drill into individual video for detail

### Workflow C: Ask AI Questions
1. Previous video analyzed (stored in session)
2. User goes to "AI Chat" tab
3. Types natural question: "What do people want to see next?"
4. App embeds question, retrieves top-5 comments from ChromaDB
5. Sends question + context to LLM
6. Shows grounded answer with source comments

---

## 11. Future Enhancements

- **Multi-language support**: Translate comments before embedding
- **Sentiment trends over time**: Week-by-week sentiment evolution
- **Viewer persona clustering**: Group audience by engagement patterns
- **Competitor analysis**: Compare sentiment across similar channels
- **Notification system**: Alert creators to spike in negative sentiment
- **Export reports**: PDF, email delivery of weekly insights
- **Mobile app**: Streamlit + React Native
- **Custom models**: Fine-tune sentiment classifier on creator's own data

---

## 12. Success Metrics

- **Performance**: Single video analysis < 60 seconds, channel analysis < 10 minutes
- **Accuracy**: LLM-generated topics align with comment themes (manual validation)
- **Usability**: Creators can interpret insights without AI background
- **Cost**: Per-video cost < $0.20 with OpenRouter; $0 with Ollama
- **Reliability**: 99% uptime for ChromaDB queries, <1% API failure rate

---

## 13. Getting Started

### Prerequisites
- Python 3.11+
- YouTube Data API key
- Either: OpenRouter API key OR local Ollama instance

### Installation

```bash
# Clone the repo
git clone https://github.com/yourname/tubeinsight-ai
cd tubeinsight-ai

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and preferences
```

### Running the App

```bash
# Start with Streamlit (Ollama auto-starts if configured)
streamlit run frontend/app.py

# Or manually start Ollama in another terminal
ollama serve
```

The app will be available at `http://localhost:8501`

---

**Built with**: LangGraph · LLM API · ChromaDB · Streamlit · Python 🚀
