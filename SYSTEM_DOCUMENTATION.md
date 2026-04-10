# 🎯 TubeInsight AI — Complete System Documentation

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture & Components](#2-architecture--components)
3. [Technology Stack (What, Why, Where, When, How)](#3-technology-stack)
4. [Complete Data Flow & Pipeline](#4-complete-data-flow--pipeline)
5. [Component Deep-Dive](#5-component-deep-dive)
6. [Code Walkthrough](#6-code-walkthrough)
7. [Execution Sequence](#7-execution-sequence)

---

## 1. System Overview

### What is TubeInsight AI?

**TubeInsight AI** is an intelligent YouTube comment analysis platform that automatically:
- **Fetches** comments and metadata from YouTube videos
- **Analyzes** audience **sentiment**, emotions, and opinions
- **Clusters** comments into meaningful discussion topics
- **Generates** AI-written insights and recommendations
- **Enables** natural-language Q&A over comment data

### Who is it for?

- **YouTube Content Creators** wanting to understand audience reactions
- **Content Strategists** planning future video topics
- **Marketing Teams** analyzing viewer **sentiment** trends

### Core Capabilities

1. **Single Video Analysis** (30-60 seconds)
   - Sentiment breakdown (positive/negative/neutral/mixed)
   - Emotion distribution (joy, anger, sadness, surprise, love)
   - Topic clustering (6 automatically discovered themes)
   - Praise/Criticism/Questions extraction
   - AI-generated insight report

2. **Channel Analysis** (5-10 minutes for 10 videos)
   - Sentiment trends over time
   - Aggregate emotion insights
   - Cross-video topic comparison
   - Performance recommendations

3. **AI Chat Interface**
   - Query comment database naturally
   - Get grounded answers from actual viewer feedback
   - Example: "What do people want to see next?"

---

## 2. Architecture & Components

### 2.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   USER INTERFACE LAYER                      │
│  ┌─────────────┬──────────────┬────────────────────────┐   │
│  │ Streamlit   │ Interactive  │ Real-time Progress     │   │
│  │ Dashboard   │ Charts       │ & Status Updates       │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  ORCHESTRATION LAYER          │
        │  LangGraph State Machine      │
        │  (Sequential Pipeline)        │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │    AGENT LAYER (5 Agents)     │
        │  ┌──────────┐  ┌──────────┐   │
        │  │ Data     │  │Sentiment │   │
        │  │ Agent    │  │ Agent    │   │
        │  └──────────┘  └──────────┘   │
        │  ┌──────────┐  ┌──────────┐   │
        │  │ Topic    │  │Report    │   │
        │  │ Agent    │  │Agent     │   │
        │  └──────────┘  └──────────┘   │
        │  ┌──────────┐                 │
        │  │ RAG      │ (On-demand)     │
        │  │ Agent    │                 │
        │  └──────────┘                 │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼────────────────────┐
        │      CORE SERVICES LAYER            │
        │  ┌─────────────────────────────┐   │
        │  │ YouTube Client              │   │
        │  │ (Fetch videos, comments)    │   │
        │  └─────────────────────────────┘   │
        │  ┌─────────────────────────────┐   │
        │  │ LLM Client                  │   │
        │  │ (OpenRouter/Ollama)         │   │
        │  └─────────────────────────────┘   │
        │  ┌─────────────────────────────┐   │
        │  │ Embedding Client            │   │
        │  │ (sentence-transformers)     │   │
        │  └─────────────────────────────┘   │
        │  ┌─────────────────────────────┐   │
        │  │ VectorStore                 │   │
        │  │ (ChromaDB)                  │   │
        │  └─────────────────────────────┘   │
        └───────────────┬────────────────────┘
                        │
┌───────────────────────▼──────────────────────────┐
│           EXTERNAL SERVICES & DATA               │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │YouTube API   │  │Local Ollama / OpenRouter │ │
│  │(Comments,    │  │(LLM Models)              │ │
│  │Metadata)     │  │                          │ │
│  └──────────────┘  └──────────────────────────┘ │
│  ┌──────────────┐                               │
│  │ChromaDB      │  (Vector Storage)             │
│  │DiskCache     │  (File-based Cache)           │
│  └──────────────┘                               │
└────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Map

```
User Input
    │
    ▼
┌─────────────────┐
│ Frontend (app.py)│ ◄─── Calls orchestrator.analyze_video()
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│ orchestrator.py                  │
│ ├─ Initializes pipeline          │
│ ├─ Manages state (TypedDict)     │
│ └─ Runs: Data → Sentiment →      │
│    Topic → Report agents         │
└────────┬────────────────────────┘
         │
    ┌────┴───────┬────────────┬──────────┬──────────┐
    │            │            │          │          │
    ▼            ▼            ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Data    │ │Sentiment│ │ Topic  │ │Report  │ │  RAG   │
│ Agent   │ │ Agent   │ │ Agent  │ │ Agent  │ │ Agent  │
└────┬────┘ └────┬────┘ └───┬────┘ └────┬───┘ └────┬───┘
     │           │          │          │          │
     ▼           ▼          ▼          ▼          ▼
┌──────────────────────────────────────────────────────┐
│           Core Services (Shared)                     │
│  ┌──────────────┬──────────────────────────────────┐│
│  │YouTube Client│LLM Client│Embeddings│VectorStore││
│  └──────────────┴──────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
     │                  │              │         │
     ▼                  ▼              ▼         ▼
  YouTube API      Ollama/OpenRouter  ST Model  ChromaDB
```

---

## 3. Technology Stack (What, Why, Where, When, How)

### 3.1 Frontend Layer

#### **Streamlit** (Web Framework)
- **What**: Python framework for building web dashboards without HTML/CSS/JS
- **Why**: Rapid prototyping, works with Python directly, auto-reruns on code changes
- **Where**: `frontend/app.py` (home page), `frontend/pages/*.py` (sub-pages)
- **When**: Triggered when user accesses `http://localhost:8501`
- **How**:
  - Renders pages with `st.title()`, `st.metric()`, `st.plotly_chart()`, etc.
  - Manages session state with `st.session_state`
  - Calls backend pipeline from UI buttons

#### **Plotly** (Interactive Charts)
- **What**: JavaScript charting library with Python API
- **Why**: Beautiful, interactive visualizations (hover, zoom, download)
- **Where**: `frontend/pages/*.py` for sentiment trends, emotion pie charts
- **When**: Rendered when page loads with historical sentiment data
- **How**: `st.plotly_chart(fig)` displays interactive graphs

#### **Wordcloud** (Text Visualization)
- **What**: Generates word clouds from text
- **Why**: Quick visual representation of topic keywords
- **Where**: `frontend/pages/02_video_analysis.py` to show topic keywords
- **When**: Generated from topic cluster text after analysis
- **How**: Uses top words from cluster representative comments

---

### 3.2 Agent Orchestration & LLM

#### **LangGraph** (State Machine)
- **What**: Orchestration framework for multi-agent systems
- **Why**:
  - Each agent outputs to a shared `PipelineState` (TypedDict)
  - Type-safe (catches mistakes early)
  - Replaces older `LLMChain` with explicit state flow
- **Where**: `backend/agents/orchestrator.py`
- **When**: Initialized at app startup, runs when user submits video URL
- **How**:
  ```python
  graph = StateGraph(PipelineState)  # Define state schema
  graph.add_node("sentiment_agent", run_sentiment_agent)  # Add nodes
  graph.add_edge(START, "data_agent")  # Connect in order
  pipeline = graph.compile()  # Compile to executable form
  final_state = pipeline.invoke(initial_state)  # Execute
  ```

#### **LLM Client** (OpenAI-compatible)
- **What**: Abstraction layer for LLM API calls
- **Why**:
  - Swappable: Works with OpenRouter (cloud) or Ollama (local)
  - Built-in retry logic (Tenacity library)
  - Rate limiting to avoid API errors
- **Where**: `backend/core/llm_client.py`
- **When**: Called by SentimentAgent, TopicAgent, ReportAgent, RAGAgent
- **How**:
  ```python
  client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key="...")
  response = client.chat.completions.create(
      model="anthropic/claude-3.5-sonnet",
      messages=[{"role": "system", "content": "..."}, ...],
      temperature=0.1
  )
  ```

#### **Tenacity** (Retry Logic)
- **What**: Python library for automatic retries with exponential backoff
- **Why**: Network/API calls fail sometimes; retry intelligently
- **Where**: Decorates `llm_client._make_request()` method
- **When**: LLM call fails (timeout, rate limit, etc.)
- **How**:
  ```python
  @retry(
      stop=stop_after_attempt(5),  # Max 5 attempts
      wait=wait_exponential(multiplier=2, min=2, max=30),  # 2, 4, 8, 16, 30s
      retry=retry_if_exception_type(RateLimitError)  # Only retry rate limits
  )
  def _make_request(...): ...
  ```

---

### 3.3 NLP & Embeddings

#### **sentence-transformers** (Embedding Model)
- **What**: Pre-trained model that converts text to dense vectors
- **Why**:
  - Free (no API cost)
  - Fast (runs locally)
  - 384-dimensional vectors capture semantic meaning
  - Used for similarity search and clustering
- **Where**: `backend/core/embeddings.py`
- **When**: After comments are fetched, DataAgent embeds all comments
- **How**:
  ```python
  from sentence_transformers import SentenceTransformer
  model = SentenceTransformer('all-MiniLM-L6-v2')
  embeddings = model.encode(['comment1', 'comment2', ...])  # → (N, 384)
  ```

#### **scikit-learn KMeans** (Clustering)
- **What**: Machine learning algorithm for clustering similar items
- **Why**:
  - Discover topics without pre-defined labels
  - Fast, deterministic, works well with ~300 comments
- **Where**: `backend/agents/topic_agent.py`
- **When**: After comments are embedded, TopicAgent clusters them
- **How**:
  ```python
  embeddings_normalized = normalize(embeddings)  # L2 norm for cosine similarity
  km = KMeans(n_clusters=6, random_state=42)
  labels = km.fit_predict(embeddings_normalized)  # → [0,1,2,1,0,3,...]
  # Group comments by cluster label
  ```

#### **NLTK** (Not actively used)
- **What**: Natural Language Toolkit library
- **Why**: Installed for potential future sentiment baselines
- **Where**: Imported in project but LLM does sentiment now (more accurate)
- **When**: Historically used VADER, now replaced by LLM analysis

---

### 3.4 Data & Persistence

#### **YouTube Data API v3**
- **What**: Official Google API for YouTube data
- **Why**: Only way to get comment data from YouTube videos
- **Where**: `backend/core/youtube_client.py` wraps API calls
- **When**: DataAgent calls it at the start of pipeline
- **How**:
  ```python
  youtube = build('youtube', 'v3', developerKey=API_KEY)
  request = youtube.videos().list(part='statistics', id=video_id)
  response = request.execute()  # Get metadata

  comments_list = youtube.commentThreads().list(
      part='snippet', videoId=video_id, textFormat='plainText',
      maxResults=100, pageToken=page_token
  )
  ```

#### **ChromaDB** (Vector Database)
- **What**: Persistent vector store that indexes embeddings for fast retrieval
- **Why**:
  - Query similar comments in milliseconds
  - Store metadata alongside vectors
  - Persist to disk for reuse
- **Where**: `backend/core/vectorstore.py` wraps ChromaDB operations
- **When**:
  - DataAgent stores embeddings after fetching comments
  - RAGAgent queries it when user asks questions
  - TopicAgent retrieves embeddings for clustering
- **How**:
  ```python
  # Create per-video collection
  collection = client.get_or_create_collection(name=f"video_{video_id}")

  # Store embeddings + metadata
  collection.upsert(
      ids=comment_ids,
      embeddings=embedding_vectors,
      documents=comment_texts,
      metadatas=[{"author": "...", "likes": 10}, ...]
  )

  # Query similar comments
  results = collection.query(
      query_embeddings=[question_embedding],
      n_results=5
  )
  ```

#### **DiskCache** (File-based Caching)
- **What**: Simple key-value store on disk
- **Why**: Cache YouTube API responses, processed comments to avoid re-fetching
- **Where**: Used in `data_agent.py` for caching
- **When**: DataAgent checks cache before calling YouTube API
- **How**:
  ```python
  cache = diskcache.Cache('./data/cache')
  if "comments_123" in cache:
      comments = cache["comments_123"]  # ✓ Use cached
  else:
      comments = yt.get_comments(...)  # Fetch from API
      cache["comments_123"] = comments  # Store for next time
  ```

#### **Pydantic Settings** (Configuration)
- **What**: Type-safe configuration management from environment variables
- **Why**: Centralized settings, validation, fallbacks
- **Where**: `config/settings.py` loads from `.env`
- **When**: App startup, imported by all modules
- **How**:
  ```python
  class Settings(BaseSettings):
      youtube_api_key: str = Field(..., env="YOUTUBE_API_KEY")  # Required
      ollama_base_url: str = Field("", env="OLLAMA_BASE_URL")  # Optional

  settings = get_settings()  # Validates & loads from .env
  api_key = settings.youtube_api_key  # Type-safe access
  ```

---

### 3.5 Infrastructure & Utilities

#### **FastAPI** (REST API framework)
- **What**: Modern web framework for building APIs
- **Why**: Optional REST layer (currently minimal use in UI)
- **Where**: Not heavily used; Streamlit is primary interface
- **When**: Could be used for mobile apps or third-party integrations
- **How**: Define routes with decorators: `@app.post("/analyze-video")`

#### **loguru** (Structured Logging)
- **What**: Enhanced logging with colors, structured output
- **Why**: Better visibility into what's happening at each step
- **Where**: Every file imports `from loguru import logger`
- **When**: Logs printed throughout execution (console + file)
- **How**:
  ```python
  logger.info("Processing video 123")  # Blue info
  logger.success("✓ Stored embeddings")  # Green success
  logger.error("Failed to fetch comments")  # Red error
  logger.debug("Comment text: ...") # Gray debug (when LOG_LEVEL=DEBUG)
  ```

#### **Ollama Auto-startup** (Custom)
- **What**: Auto-detect and start local LLM service
- **Why**: Seamless experience; users don't need to manually start Ollama
- **Where**: `backend/core/ollama_startup.py` (newly created)
- **When**: App startup, before orchestrator imports
- **How**:
  ```python
  # Check if Ollama running
  response = requests.get("http://localhost:11434/api/tags")
  if response.ok: return True  # Already running

  # Start Ollama
  subprocess.Popen(["ollama", "serve"])  # Background process

  # Wait for startup with retries
  for i in range(15):
      try: response = requests.get("http://localhost:11434/api/tags")
      except: time.sleep(1)
  ```

---

## 4. Complete Data Flow & Pipeline

### 4.1 Step-by-Step Execution Flow

```
STEP 0: USER INITIATES ANALYSIS
────────────────────────────────
User opens http://localhost:8501
  ├─ frontend/app.py loads
  ├─ ensure_ollama_ready() ← Auto-starts Ollama
  ├─ Renders Streamlit UI
  └─ Waits for user input

STEP 1: USER PROVIDES VIDEO URL
────────────────────────────────
User enters: https://www.youtube.com/watch?v=VIDEO_ID
User clicks: "Analyze Video" button
  └─ Streamlit calls: TubeInsightPipeline.analyze_video(video_id="VIDEO_ID")

STEP 2: LANGGRAPH INITIALIZES PIPELINE
───────────────────────────────────────
orchestrator.py: build_pipeline()
  ├─ Creates StateGraph(PipelineState)
  ├─ Registers 5 agent nodes
  ├─ Defines edges: START → data → sentiment → topic → report → END
  └─ Compiles to executable form

STEP 3: DATA AGENT EXECUTES (First Node)
──────────────────────────────────────────
backend/agents/data_agent.py: run(video_id, max_comments=500)

  STEP 3.1: Extract Video ID
  ───────────────────────────
  Input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  Output: video_id = "dQw4w9WgXcQ"
  Code: re.search(r"v=([^&]+)", url)

  STEP 3.2: Check Cache
  ─────────────────────
  Cache key: f"video_metadata_{video_id}"
  If exists: Skip to step 3.3
  If not: Call YouTube API

  STEP 3.3: Fetch Video Metadata from YouTube
  ────────────────────────────────────────────
  File: backend/core/youtube_client.py

    youtube = build('youtube', 'v3', developerKey=API_KEY)

    request = youtube.videos().list(
        part='statistics,snippet',
        id=video_id
    )
    response = request.execute()

  Returns: {
    'title': 'Video Title',
    'views': 1000000,
    'likes': 50000,
    'comment_count': 5000,
    'published_at': '2024-01-15',
    'description': '...'
  }

  STEP 3.4: Fetch Comments from YouTube
  ──────────────────────────────────────
  File: backend/core/youtube_client.py

    # YouTube API pagination (returns ~100 comments per request)
    comments_list = youtube.commentThreads().list(
        part='snippet',
        videoId=video_id,
        maxResults=100,
        textFormat='plainText'
    )

    # Keep requesting until max_comments reached or no more pages
    raw_comments = []
    while len(raw_comments) < max_comments and nextPageToken:
        response = comments_list.execute()
        for item in response['items']:
            raw_comments.append({
                'author': snippet['authorDisplayName'],
                'text': snippet['textDisplay'],
                'like_count': snippet['likeCount'],
                'reply_count': snippet['replyCount'],
                'published_at': snippet['publishedAt']
            })
        if 'nextPageToken' in response:
            nextPageToken = response['nextPageToken']

  Returns: List of 100-500 comment dicts

  STEP 3.5: Preprocess Comments
  ──────────────────────────────
  File: backend/utils/preprocessing.py

    For each comment:
      ├─ Remove markup/HTML: `<b>text</b>` → `text`
      ├─ Remove URLs: `http://example.com` → removed
      ├─ Remove special chars: `@@@` → removed
      ├─ Lowercase: `HELLO` → `hello`
      ├─ Dedupe: remove identical comments
      ├─ Filter spam: Remove very short (<3 chars) or junk
      └─ Keep metadata: (author, likes, replies)

  Returns: Cleaned list of comments

  STEP 3.6: Embed Comments
  ────────────────────────
  File: backend/core/embeddings.py

    model = SentenceTransformer('all-MiniLM-L6-v2')
    texts = [c['text'] for c in clean_comments]

    embeddings = model.encode(texts)  # Shape: (300, 384)
    # Each comment now has a 384-dimensional vector

  Returns: List[List[float]] with shape (num_comments, 384)

  STEP 3.7: Store in ChromaDB
  ────────────────────────────
  File: backend/core/vectorstore.py

    collection = chromadb_client.get_or_create_collection(
        name=f"video_{video_id}"  # Separate collection per video
    )

    collection.upsert(
        ids=[f"comment_{i}" for i in range(len(comments))],
        embeddings=embeddings,  # Shape: (300, 384)
        documents=clean_texts,  # Original text
        metadatas=[
            {"author": c['author'], "likes": c['likes']}
            for c in clean_comments
        ]
    )

  Returns: Collection ready for queries

  STEP 3.8: Return State Update
  ──────────────────────────────
  Data Agent returns to orchestrator:
  {
      "video_metadata": {...metadata...},
      "raw_comments": [...raw comments...],
      "clean_comments": [...cleaned comments...],
      "status": "data_complete"
  }

STEP 4: SENTIMENT AGENT EXECUTES (Second Node)
───────────────────────────────────────────────
backend/agents/sentiment_agent.py: run(clean_comments, video_title)

  STEP 4.1: Sample Top Comments
  ─────────────────────────────
  # Cost optimization: Don't analyze all 300 comments
  # Select top 100 by like count (most engaged)

    top_comments = sorted(
        clean_comments,
        key=lambda c: c['like_count'],
        reverse=True
    )[:100]

  STEP 4.2: Chunk Comments
  ────────────────────────
  # LLM has token limit (~4000 input tokens)
  # ~40 comments per chunk (~6000 chars)

    chunks = []
    for i in range(0, len(top_comments), 40):
        chunk = top_comments[i:i+40]
        chunks.append(chunk)

  # Result: 3 chunks (100/40 = 2.5 → 3 chunks)

  STEP 4.3: LLM Sentiment Analysis (Per Chunk)
  ──────────────────────────────────────────────
  File: backend/core/llm_client.py

    For each chunk:
      system_prompt: "You are a sentiment analyst..."
      user_prompt: "Analyze these comments:\n{formatted_comments}"

      # With retry logic (Tenacity)
      response = client.chat.completions.create(
          model="anthropic/claude-3.5-sonnet",
          messages=[
              {"role": "system", "content": system_prompt},
              {"role": "user", "content": user_prompt}
          ],
          temperature=0.1  # Deterministic (not creative)
      )

      raw_json = response.choices[0].message.content
      # Strip markdown: ```json {...} ``` → {...}
      sentiment_result = json.loads(raw_json)

  STEP 4.4: Expected LLM Response Format
  ───────────────────────────────────────
  ```json
  {
    "overall_sentiment": "positive",
    "sentiment_distribution": {
      "positive": 75,
      "negative": 15,
      "neutral": 10
    },
    "vibe_score": 8,  // 1-10 energy level
    "emotion_breakdown": {
      "joy": 40,
      "anger": 5,
      "sadness": 10,
      "surprise": 20,
      "love": 25,
      "neutral": 0
    },
    "top_praises": ["Great quality!", "Love this content!"],
    "top_criticisms": ["Audio quality bad"],
    "top_questions": ["When's next upload?"],
    "summary": "Overall very positive...",
    "comments_analyzed": 40
  }
  ```

  STEP 4.5: Merge Chunk Results
  ──────────────────────────────
  # Average scores across chunks

    final_sentiment = {
        "overall_sentiment": mode([chunk1.sentiment, chunk2.sentiment, ...]),
        "sentiment_distribution": average_percentages,
        "emotion_breakdown": average_emotions,
        "top_praises": top_3_praises_across_chunks,
        "top_criticisms": top_3_criticisms_across_chunks,
        "comments_analyzed": 100
    }

  STEP 4.6: Return State Update
  ──────────────────────────────
  Sentiment Agent returns:
  {
      "sentiment_result": {...merged sentiment...},
      "status": "sentiment_complete"
  }

STEP 5: TOPIC AGENT EXECUTES (Third Node)
───────────────────────────────────────────
backend/agents/topic_agent.py: run(video_id, clean_comments, video_title)

  STEP 5.1: Retrieve Embeddings from ChromaDB
  ────────────────────────────────────────────
    collection = vectorstore.collection(f"video_{video_id}")

    # Get all stored embeddings
    all_embeddings = collection.get(include=['embeddings', 'documents'])
    embeddings = np.array(all_embeddings['embeddings'])  # Shape: (300, 384)

  STEP 5.2: Normalize Embeddings
  ──────────────────────────────
  # Normalize for cosine similarity (standard practice)

    from sklearn.preprocessing import normalize
    embeddings_norm = normalize(embeddings)  # L2 norm per row

  STEP 5.3: KMeans Clustering
  ────────────────────────────
    km = KMeans(n_clusters=6, random_state=42, n_init='auto')
    labels = km.fit_predict(embeddings_norm)

    # Result: array [0,1,2,1,0,3,0,5,...]
    # (300 comments assigned to 6 clusters)

  STEP 5.4: Group Comments by Cluster
  ────────────────────────────────────
    clusters = {}
    for comment, label in zip(clean_comments, labels):
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(comment)

    Result:
    clusters[0] = [comment1, comment5, ...]  # 50 comments
    clusters[1] = [comment3, comment7, ...]  # 60 comments
    ...

  STEP 5.5: Select Representative Comments
  ─────────────────────────────────────────
  # Pick 3 most-liked comments from each cluster

    for cluster_id, comments in clusters.items():
        sorted_comments = sorted(
            comments,
            key=lambda c: c['like_count'],
            reverse=True
        )
        representatives = [c['text'] for c in sorted_comments[:3]]

        cluster_data = {
            "id": cluster_id,
            "size": len(comments),
            "representative_comments": representatives
        }

  STEP 5.6: LLM Cluster Labeling
  ──────────────────────────────
  # Send representative comments to LLM for human-readable label

    For each cluster:
      system_prompt: "You are a topic analyst. Label this cluster of comments..."
      user_prompt: f"Here are the representative comments:\n{representatives}"

      response = llm.complete_json(user_prompt, system_prompt)

      Expected response:
      {
        "label": "Production Quality",
        "description": "Viewers praising high video/audio quality",
        "sentiment": "positive",
        "keywords": ["quality", "crisp", "clear"]
      }

  STEP 5.7: Build Final Topic Results
  ────────────────────────────────────
    topics = [
        {
            "id": 0,
            "label": "Production Quality Praise",
            "description": "...",
            "sentiment": "positive",
            "size": 50,
            "keywords": [...],
            "representative_comments": [...]
        },
        ...
    ]

    # Sort by size descending (largest clusters first)
    topics.sort(key=lambda t: t['size'], reverse=True)

  STEP 5.8: Return State Update
  ──────────────────────────────
  Topic Agent returns:
  {
      "topic_result": {"topics": [...]},
      "status": "topics_complete"
  }

STEP 6: REPORT AGENT EXECUTES (Fourth Node)
──────────────────────────────────────────
backend/agents/report_agent.py: run(metadata, sentiment, topics, total_comments)

  STEP 6.1: Synthesize All Results
  ────────────────────────────────
    Inputs aggregated:
    - Video title, views, likes
    - Overall sentiment, emotion breakdown
    - Topic clusters with sizes and sentiments
    - Total comment count

  STEP 6.2: LLM Report Generation
  ───────────────────────────────
    system_prompt: "You are a content strategist. Write a concise report..."
    user_prompt: "Here's the analysis:\n{json_dump_of_all_data}"

    response = llm.complete(user_prompt, system_prompt)

    Expected: Markdown report with:
    - Executive summary
    - Sentiment insights
    - Key topics & engagement drivers
    - Recommendations for next content
    - Call-to-action insights

  STEP 6.3: Return State Update
  ──────────────────────────────
  Report Agent returns:
  {
      "report": "## Insight Report\n\n...",
      "status": "complete"
  }

STEP 7: DISPLAY RESULTS IN FRONTEND
────────────────────────────────────
frontend/pages/02_video_analysis.py:

  final_state = pipeline.invoke(initial_state)

  if final_state['status'] == 'complete':
      st.metric("Overall Sentiment", sentiment_result['overall_sentiment'])
      st.plotly_chart(sentiment_distribution_chart)
      st.metric("Vibe Score", sentiment_result['vibe_score'])

      # Display topics
      for topic in topic_result['topics']:
          st.subheader(topic['label'])
          st.write(topic['description'])
          st.metric("Size", topic['size'])

      # Display report
      st.markdown(report)
  else:
      st.error(f"Pipeline failed: {final_state['errors']}")
```

---

### 4.2 RAG (Q&A) Data Flow

```
USER ASKS QUESTION
──────────────────
User (in sidebar): "What do people want to see next?"
Click: "Ask AI"

RETRIEVE RELEVANT COMMENTS
──────────────────────────
RAGAgent.run(question, video_id):

  STEP 1: Embed Question
  ──────────────────────
    model = SentenceTransformer('all-MiniLM-L6-v2')
    question_embedding = model.encode(question)  # (384,)

  STEP 2: Query ChromaDB
  ──────────────────────
    collection = vectorstore.collection(f"video_{video_id}")

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=5  # Top 5 most similar comments
    )

    Returns:
    {
        "ids": ["comment_12", "comment_45", ...],
        "documents": ["I want longer videos", "Please make tutorial series", ...],
        "distances": [0.15, 0.22, ...]  # Lower = more similar
    }

GENERATE GROUNDED ANSWER
────────────────────────
  system_prompt: "Answer based ONLY on the provided comments..."
  user_prompt: f"""
  Question: {question}

  Relevant comments from viewers:
  1. "{comments[0]}"
  2. "{comments[1]}"
  ...

  Answer:"""

  response = llm.complete(user_prompt, system_prompt)

  Output: "Based on viewer feedback, people want:\n
           1. Longer videos (mentioned by X viewers)\n
           2. Tutorial series (mentioned by Y viewers)..."

DISPLAY IN UI
──────────────
frontend/pages/03_ai_chat.py:
  st.chat_message("assistant").write(response)

  # Show source comments
  st.caption("Sourced from viewer comments")
  for comment in source_comments:
      st.text(comment)
```

---

## 5. Component Deep-Dive

### 5.1 Frontend Components

#### **frontend/app.py** (Home Page)
```python
"""Main entry point. Shows navigation to sub-pages."""

# STEP 1: Auto-startup Ollama
from backend.core.ollama_startup import ensure_ollama_ready
ensure_ollama_ready()  # ← Starts Ollama if not running

# STEP 2: Configure Streamlit
st.set_page_config(
    page_title="TubeInsight AI",
    layout="wide",
    initial_sidebar_state="expanded"
)

# STEP 3: Sidebar Navigation
with st.sidebar:
    st.page_link("app.py", label="🏠 Home")
    st.page_link("pages/01_channel_view.py", label="📺 Channel")
    st.page_link("pages/02_video_analysis.py", label="🎬 Video")
    st.page_link("pages/03_ai_chat.py", label="🤖 Chat")

    # Settings
    max_comments = st.slider("Max comments", 100, 500, 300)
    st.session_state["max_comments"] = max_comments

# STEP 4: Home Page Content
st.title("🎯 TubeInsight AI")
st.markdown("AI-powered audience intelligence for YouTube creators")

# Three columns with feature cards
col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("#### 📺 Channel Analysis")
    if st.button("Analyze Channel →"):
        st.switch_page("pages/01_channel_view.py")

with col2:
    st.markdown("#### 🎬 Video Analysis")
    if st.button("Analyze Video →"):
        st.switch_page("pages/02_video_analysis.py")

with col3:
    st.markdown("#### 🤖 AI Chat")
    if st.button("Start Chatting →"):
        st.switch_page("pages/03_ai_chat.py")
```

#### **frontend/pages/02_video_analysis.py** (Main Analysis Page)
```python
"""Single video deep-dive analysis."""

import streamlit as st
from backend.agents.orchestrator import TubeInsightPipeline

st.title("🎬 Video Analysis")

# INPUT: Get video URL from user
url_input = st.text_input("YouTube Video URL", placeholder="https://www.youtube.com/watch?v=...")

if st.button("Analyze Video", type="primary"):
    # Extract video ID from URL
    import re
    match = re.search(r"v=([^&]+)", url_input)
    if not match:
        st.error("Invalid URL")
        st.stop()

    video_id = match.group(1)
    st.session_state["current_video_id"] = video_id  # Store for RAG chat

    # PROCESS: Run full pipeline
    with st.spinner("Analyzing video..."):
        pipeline = TubeInsightPipeline()

        max_comments = st.session_state.get("max_comments", 300)

        final_state = pipeline.analyze_video(
            video_url=url_input,
            video_id=video_id,
            max_comments=max_comments
        )

    # DISPLAY: Show results
    if final_state["status"] == "complete":
        # Sentiment Overview
        st.subheader("📊 Sentiment Overview")
        col1, col2, col3, col4 = st.columns(4)

        sentiment = final_state["sentiment_result"]
        with col1:
            st.metric(
                "Overall Sentiment",
                sentiment["overall_sentiment"].capitalize(),
                help="Predominant audience emotion"
            )
        with col2:
            st.metric("Vibe Score", f"{sentiment['vibe_score']}/10")
        with col3:
            st.metric("Likeness", f"{sentiment['likeness_score']}/10")
        with col4:
            st.metric("Toxicity", sentiment['toxicity_level'].capitalize())

        # Emotion Breakdown (Pie Chart)
        st.subheader("😊 Emotion Breakdown")
        emotion_data = sentiment['emotion_breakdown']

        import plotly.graph_objects as go
        fig = go.Figure(data=[go.Pie(
            labels=list(emotion_data.keys()),
            values=list(emotion_data.values()),
            marker=dict(colors=[
                '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#95E1D3'
            ])
        )])
        st.plotly_chart(fig, use_container_width=True)

        # Praise/Criticism
        st.subheader("🎯 Top Praises")
        for praise in sentiment['top_praises']:
            st.success(f"✓ {praise}")

        st.subheader("⚠️ Top Criticisms")
        for criticism in sentiment['top_criticisms']:
            st.warning(f"✗ {criticism}")

        # Topic Clusters
        st.subheader("📌 Discovered Topics")
        topics = final_state["topic_result"]["topics"]

        for topic in topics:
            with st.expander(f"{topic['label']} ({topic['size']} comments)"):
                st.write(topic['description'])
                st.metric("Sentiment", topic['sentiment'].capitalize())

                st.write("**Representative Comments:**")
                for comment in topic['representative_comments']:
                    st.text(f"• {comment[:100]}...")

        # Insight Report
        st.subheader("📈 AI Insight Report")
        st.markdown(final_state["report"])

    else:
        st.error(f"Pipeline failed: {final_state['errors']}")
```

#### **frontend/pages/03_ai_chat.py** (RAG Chatbot)
```python
"""RAG-powered Q&A over comment data."""

import streamlit as st
from backend.agents.rag_agent import RAGAgent

st.title("🤖 AI Chat")

# Check if video analyzed
video_id = st.session_state.get("current_video_id")

if not video_id:
    st.warning("Please analyze a video first")
    st.stop()

st.info(f"Chatting about video: {video_id}")

# Chat interface
for message in st.session_state.get("chat_history", []):
    with st.chat_message(message["role"]):
        st.write(message["content"])

# Input
user_question = st.chat_input("Ask about viewer feedback...")

if user_question:
    # Display user message
    with st.chat_message("user"):
        st.write(user_question)

    # Generate answer
    with st.spinner("Searching viewer comments..."):
        rag_agent = RAGAgent()

        answer, sources = rag_agent.run(
            question=user_question,
            video_id=video_id
        )

    # Display assistant response
    with st.chat_message("assistant"):
        st.write(answer)

        # Show sources
        with st.expander("📌 Source Comments"):
            for source in sources:
                st.text(source)

    # Store in history
    if "chat_history" not in st.session_state:
        st.session_state["chat_history"] = []

    st.session_state["chat_history"].append({"role": "user", "content": user_question})
    st.session_state["chat_history"].append({"role": "assistant", "content": answer})

    st.rerun()
```

---

### 5.2 Backend Agents

#### **backend/agents/orchestrator.py** (Pipeline Orchestration)
```python
"""LangGraph state machine orchestrator."""

from langgraph.graph import StateGraph, END, START
from typing import TypedDict

# DEFINE STATE SCHEMA
class PipelineState(TypedDict):
    """Shared state passed between agents."""
    video_id: str
    video_url: str
    max_comments: Optional[int]

    # Outputs
    video_metadata: Optional[dict]
    raw_comments: Optional[list]
    clean_comments: Optional[list]
    sentiment_result: Optional[dict]
    topic_result: Optional[dict]
    report: Optional[str]

    errors: Annotated[list[str], operator.add]  # Append-only
    status: str  # "running" | "complete" | "failed"

# DEFINE AGENT NODES
def run_data_agent(state: PipelineState) -> dict:
    """Node 1: Fetch and embed comment data."""
    agent = DataAgent()
    result = agent.run(state["video_id"], max_comments=state["max_comments"])
    return {
        "video_metadata": result["metadata"],
        "clean_comments": result["clean_comments"],
        "status": "data_complete"
    }

def run_sentiment_agent(state: PipelineState) -> dict:
    """Node 2: Analyze sentiment."""
    if state["status"] == "failed": return {}

    agent = SentimentAgent()
    result = agent.run(state["clean_comments"], state["video_metadata"]["title"])
    return {
        "sentiment_result": result,
        "status": "sentiment_complete"
    }

def run_topic_agent(state: PipelineState) -> dict:
    """Node 3: Cluster into topics."""
    if state["status"] == "failed": return {}

    agent = TopicAgent()
    result = agent.run(state["video_id"], state["clean_comments"])
    return {
        "topic_result": result,
        "status": "topics_complete"
    }

def run_report_agent(state: PipelineState) -> dict:
    """Node 4: Generate insight report."""
    if state["status"] == "failed": return {}

    agent = ReportAgent()
    report = agent.run(
        state["video_metadata"],
        state["sentiment_result"],
        state["topic_result"]
    )
    return {
        "report": report,
        "status": "complete"
    }

# BUILD GRAPH
def build_pipeline() -> StateGraph:
    """Build LangGraph pipeline."""
    graph = StateGraph(PipelineState)

    # Register nodes
    graph.add_node("data_agent", run_data_agent)
    graph.add_node("sentiment_agent", run_sentiment_agent)
    graph.add_node("topic_agent", run_topic_agent)
    graph.add_node("report_agent", run_report_agent)

    # Connect nodes in sequence
    graph.add_edge(START, "data_agent")
    graph.add_edge("data_agent", "sentiment_agent")
    graph.add_edge("sentiment_agent", "topic_agent")
    graph.add_edge("topic_agent", "report_agent")
    graph.add_edge("report_agent", END)

    return graph.compile()

# PUBLIC INTERFACE
class TubeInsightPipeline:
    def __init__(self):
        self.pipeline = build_pipeline()

    def analyze_video(self, video_url: str, video_id: str, max_comments: int = None):
        """Execute full analysis pipeline."""
        logger.info(f"Starting pipeline for {video_id}")

        initial_state = {
            "video_id": video_id,
            "video_url": video_url,
            "max_comments": max_comments,
            "video_metadata": None,
            "clean_comments": None,
            "sentiment_result": None,
            "topic_result": None,
            "report": None,
            "errors": [],
            "status": "running"
        }

        final_state = self.pipeline.invoke(initial_state)

        if final_state["status"] == "complete":
            logger.success("✅ Pipeline complete")
        else:
            logger.error(f"❌ Pipeline failed: {final_state['errors']}")

        return final_state
```

---

### 5.3 Core Services

#### **backend/core/youtube_client.py** (YouTube API Integration)
```python
"""YouTube API wrapper for fetching video data and comments."""

from googleapiclient.discovery import build
from config.settings import get_settings

class YouTubeClient:
    def __init__(self):
        settings = get_settings()
        self.youtube = build(
            'youtube',
            'v3',
            developerKey=settings.youtube_api_key
        )

    def get_video_metadata(self, video_id: str) -> dict:
        """Fetch video statistics and info."""
        request = self.youtube.videos().list(
            part='statistics,snippet',
            id=video_id
        )
        response = request.execute()

        if not response['items']:
            raise ValueError(f"Video {video_id} not found")

        item = response['items'][0]
        stats = item['statistics']
        snippet = item['snippet']

        return {
            'title': snippet['title'],
            'description': snippet['description'],
            'views': int(stats.get('viewCount', 0)),
            'likes': int(stats.get('likeCount', 0)),
            'comment_count': int(stats.get('commentCount', 0)),
            'published_at': snippet['publishedAt']
        }

    def get_video_comments(self, video_id: str, max_comments: int = 500) -> list:
        """Fetch all comments for a video."""
        comments = []
        request = self.youtube.commentThreads().list(
            part='snippet',
            videoId=video_id,
            textFormat='plainText',
            maxResults=100
        )

        while request and len(comments) < max_comments:
            response = request.execute()

            for item in response['items']:
                snippet = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    'author': snippet['authorDisplayName'],
                    'text': snippet['textDisplay'],
                    'like_count': snippet['likeCount'],
                    'reply_count': snippet['replyCount'],
                    'published_at': snippet['publishedAt']
                })

            # Check for next page
            if 'nextPageToken' in response and len(comments) < max_comments:
                request = self.youtube.commentThreads().list(
                    part='snippet',
                    videoId=video_id,
                    textFormat='plainText',
                    maxResults=100,
                    pageToken=response['nextPageToken']
                )
            else:
                request = None

        return comments[:max_comments]
```

#### **backend/core/llm_client.py** (LLM Interface with Retry Logic)
```python
"""OpenAI-compatible client supporting OpenRouter and Ollama."""

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from config.settings import get_settings

class LLMClient:
    def __init__(self):
        settings = get_settings()

        # Choose backend
        if settings.ollama_base_url:
            self.client = OpenAI(
                base_url=f"{settings.ollama_base_url}/v1",
                api_key="ollama"
            )
            self.model = settings.ollama_model
        else:
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=settings.openrouter_api_key
            )
            self.model = settings.llm_model

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=2, min=2, max=30)
    )
    def _make_request(self, messages, system_prompt, max_tokens):
        """Make API request with automatic retries."""
        return self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ],
            max_tokens=max_tokens,
            temperature=0.3
        )

    def complete(self, user_prompt: str, system_prompt: str = "", max_tokens: int = 2000) -> str:
        """Get text response from LLM."""
        messages = [{"role": "user", "content": user_prompt}]
        response = self._make_request(messages, system_prompt, max_tokens)
        return response.choices[0].message.content

    def complete_json(self, user_prompt: str, system_prompt: str = "", max_tokens: int = 2000) -> dict:
        """Get JSON response from LLM."""
        raw = self.complete(user_prompt, system_prompt, max_tokens)

        # Strip markdown fences
        import re
        clean = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()

        import json
        return json.loads(clean)
```

#### **backend/core/embeddings.py** (Text Vectorization)
```python
"""Embedding client using sentence-transformers."""

from sentence_transformers import SentenceTransformer
import numpy as np

class EmbeddingClient:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        # Download and cache model
        self.model = SentenceTransformer(model_name)

    def embed_text(self, text: str) -> list[float]:
        """Embed single text to 384-dim vector."""
        return self.model.encode(text, convert_to_tensor=False).tolist()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embed multiple texts (vectorized)."""
        embeddings = self.model.encode(texts, convert_to_tensor=False)
        return embeddings.tolist()
```

#### **backend/core/vectorstore.py** (ChromaDB Wrapper)
```python
"""Vector database operations using ChromaDB."""

import chromadb
from config.settings import get_settings

class VectorStore:
    def __init__(self):
        settings = get_settings()
        self.client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir
        )

    def collection_exists(self, video_id: str) -> bool:
        """Check if collection already exists."""
        try:
            self.client.get_collection(name=f"video_{video_id}")
            return True
        except:
            return False

    def upsert_comments(self, video_id: str, comments: list[dict], embeddings: list):
        """Store comments and embeddings."""
        collection = self.client.get_or_create_collection(
            name=f"video_{video_id}",
            metadata={"hnsw:space": "cosine"}
        )

        collection.upsert(
            ids=[f"comment_{i}" for i in range(len(comments))],
            embeddings=embeddings,
            documents=[c['text'] for c in comments],
            metadatas=[
                {
                    "author": c['author'],
                    "likes": c['like_count'],
                    "replies": c['reply_count']
                }
                for c in comments
            ]
        )

    def query(self, video_id: str, embedding: list, n_results: int = 5) -> dict:
        """Find most similar comments."""
        collection = self.client.get_collection(name=f"video_{video_id}")

        results = collection.query(
            query_embeddings=[embedding],
            n_results=n_results
        )

        return results
```

---

## 6. Code Walkthrough

### 6.1 Example: Single Video Analysis End-to-End

**User Action**: Clicks "Analyze Video" with URL `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

**Code Execution**:

```python
# frontend/pages/02_video_analysis.py
video_id = "dQw4w9WgXcQ"  # Extracted from URL
pipeline = TubeInsightPipeline()  # Creates orchestrator
final_state = pipeline.analyze_video(
    video_url="https://...",
    video_id="dQw4w9WgXcQ",
    max_comments=300
)

# This triggers orchestrator.py
# ├─ graph.invoke(initial_state)
# ├─ EXECUTES: run_data_agent
# │  ├─ Calls: YouTubeClient.get_video_metadata(video_id)
# │  ├─ Calls: YouTubeClient.get_video_comments(video_id, max_comments=300)
# │  ├─ Calls: preprocess_comments(raw_comments)
# │  ├─ Calls: EmbeddingClient.embed_texts(comment_texts)
# │  └─ Calls: VectorStore.upsert_comments(video_id, clean_comments, embeddings)
# │
# ├─ EXECUTES: run_sentiment_agent
# │  ├─ State has: clean_comments (list of 300)
# │  ├─ Sample top 100 by likes
# │  ├─ Chunk into 3 chunks of ~40 comments each
# │  ├─ For each chunk:
# │  │  ├─ Format comments for LLM
# │  │  ├─ Calls: LLMClient.complete_json(user_prompt, system_prompt)
# │  │  └─ Gets JSON with sentiment scores
# │  └─ Merges results across chunks
# │
# ├─ EXECUTES: run_topic_agent
# │  ├─ Calls: VectorStore.query() to get all embeddings
# │  ├─ Calls: KMeans.fit_predict(embeddings)
# │  ├─ Groups comments by cluster
# │  ├─ For each cluster:
# │  │  ├─ Gets top-3 representative comments
# │  │  ├─ Calls: LLMClient.complete_json() for label
# │  │  └─ Stores cluster info
# │  └─ Returns topic_result with 6 clusters
# │
# └─ EXECUTES: run_report_agent
#    ├─ Aggregates all sentiment + topic data
#    ├─ Calls: LLMClient.complete() with system prompt
#    └─ Returns markdown report

# Final state contains:
{
    "status": "complete",
    "sentiment_result": {...},
    "topic_result": {...},
    "report": "## Insight Report\n\n...",
    "errors": []
}

# Display in frontend
st.metric("Sentiment", sentiment_result["overall_sentiment"])
st.plotly_chart(emotion_pie_chart)
st.markdown(report)
```

---

### 6.2 Key Code Patterns

#### **Pattern 1: Agent State Management**
```python
# Each agent takes PipelineState, returns dict with updates

def run_sentiment_agent(state: PipelineState) -> dict:
    # ✓ Receive shared state
    comments = state["clean_comments"]
    title = state["video_metadata"]["title"]

    # Process
    result = process_sentiment(comments, title)

    # ✓ Return only what changed (dict is merged into state)
    return {
        "sentiment_result": result,
        "status": "sentiment_complete"
    }
    # State automatically merged by LangGraph
```

#### **Pattern 2: Error Handling**
```python
# Graceful degradation

try:
    result = agent.run(...)
    return {"result": result, "status": "complete"}
except Exception as e:
    logger.error(f"Agent failed: {e}")
    return {
        "errors": [f"AgentName: {str(e)}"],
        "status": "failed"
    }

# Downstream agents check status
if state["status"] == "failed":
    return {}  # Skip processing
```

#### **Pattern 3: LLM Prompting**
```python
# Centralized prompts in config/prompts.py

from config.prompts import SENTIMENT_SYSTEM, SENTIMENT_USER

system_prompt = SENTIMENT_SYSTEM  # Template with instructions
user_prompt = SENTIMENT_USER.format(
    video_title=title,
    comments=formatted_comments,
    comment_count=100
)

result = llm.complete_json(user_prompt, system_prompt)
```

#### **Pattern 4: Batch Processing with Chunking**
```python
# Process large datasets in chunks for cost/token efficiency

def chunk_list(items, chunk_size=40):
    return [items[i:i+chunk_size] for i in range(0, len(items), chunk_size)]

comments = [100 comments]
chunks = chunk_list(comments, 40)  # → 3 chunks

for chunk in chunks:
    result = llm.complete_json(format_chunk(chunk), ...)
    # Merge results
```

---

## 7. Execution Sequence

### 7.1 Complete Execution Timeline

```
TIME     EVENT                           FILE(S)                    STATE
─────────────────────────────────────────────────────────────────────────────
0:00s    User opens http://localhost:8501
         ├─ Streamlit loads frontend/app.py
         │  ├─ ensure_ollama_ready() checks Ollama
         │  ├─ If not running: starts with subprocess
         │  └─ Waits up to 15s for Ollama to respond
         ├─ Renders home page with 3 buttons
         └─ Ready for input

0:05s    User clicks "Analyze Video" button
         └─ Navigates to pages/02_video_analysis.py

0:10s    User pastes: https://www.youtube.com/watch?v=VIDEO_ID
         └─ Stored in session_state

0:15s    User clicks "Analyze Video" button
         ├─ Extract video_id = "VIDEO_ID"
         └─ Call: pipeline.analyze_video(video_id, ...)
             └─ orchestrator.py initializes

0:20s    DATA AGENT EXECUTES
         ├─ Check cache: f"metadata_VIDEO_ID"
         ├─ Call: YouTubeClient.get_video_metadata(video_id)
         │  └─ YouTube API returns metadata
         ├─ Call: YouTubeClient.get_video_comments(video_id, max=300)
         │  └─ YouTube API pagination (100 comments per request)
         │  └─ Returns ~300 comments (takes ~3-5 seconds)
         └─ State updated: video_metadata, raw_comments

0:30s    └─ Call: preprocess_comments(raw_comments)
            └─ Returns clean_comments (300 items)

0:32s    └─ Call: EmbeddingClient.embed_texts(comments)
            └─ sentence-transformers encodes locally (takes 2-3s)

0:35s    └─ Call: VectorStore.upsert_comments()
            └─ ChromaDB stores locally

0:37s    SENTIMENT AGENT EXECUTES
         ├─ Sample top 100 comments by likes
         ├─ Chunk into 3 chunks (~40 each)
         │
         ├─ CHUNK 1 (40 comments)
         │  ├─ Format: "Comment: X\nAuthor: Y\nLikes: Z"
         │  ├─ Call: LLMClient.complete_json()
         │  │  ├─ Retry decorator active (max 5 attempts)
         │  │  ├─ Rate limiter: wait 1s before request
         │  │  ├─ Send to OpenRouter/Ollama
         │  │  └─ LLM processes: 800 input tokens~0.2s
         │  └─ Returns sentiment JSON
         │
         ├─ CHUNK 2 (40 comments)
         │  └─ Same as CHUNK 1
         │
         ├─ CHUNK 3 (20 comments)
         │  └─ Same as CHUNK 1
         │
         └─ Merge results: average percentages
            └─ State updated: sentiment_result

0:50s    TOPIC AGENT EXECUTES
         ├─ Call: VectorStore.query() to fetch embeddings
         │  └─ Returns all 300 embeddings from ChromaDB
         ├─ Call: KMeans.fit_predict()
         │  └─ Clustering completes locally (~0.5s)
         ├─ Group by cluster label
         ├─ For each of 6 clusters:
         │  ├─ Select top-3 comments by likes
         │  ├─ Format cluster description
         │  ├─ Call: LLMClient.complete_json() for label
         │  │  └─ LLM returns: {"label": "...", "description": "..."}
         │  └─ Build cluster dict
         └─ State updated: topic_result (6 clusters)

1:05s    REPORT AGENT EXECUTES
         ├─ Aggregate all data:
         │  ├─ Metadata: title, views, likes
         │  ├─ Sentiment: overall, emotion breakdown
         │  ├─ Topics: 6 clusters with sentiments
         │  └─ Comment count
         ├─ Build LLM prompt with all data
         ├─ Call: LLMClient.complete()
         │  └─ LLM generates markdown report (~2-3s)
         └─ State updated: report

1:15s    PIPELINE COMPLETES
         ├─ final_state["status"] = "complete"
         ├─ Return to frontend
         └─ Display results

1:20s    FRONTEND DISPLAYS RESULTS
         ├─ Show metrics: sentiment, vibe score
         ├─ Render emotion pie chart (Plotly)
         ├─ Show top praises/criticisms
         ├─ Expandable topic clusters
         └─ Display insight report (markdown)

1:25s    USER INTERACTS
         ├─ Can expand topics
         ├─ Can navigate to AI Chat
         └─ Can analyze another video

2:00s    USER CLICKS: AI CHAT
         ├─ Navigate to pages/03_ai_chat.py
         ├─ Video ID stored in session_state
         └─ Ready for questions

2:10s    USER ASKS: "What do people want to see next?"
         ├─ Question stored in chat
         ├─ Call: RAGAgent.run(question, video_id)
         │  ├─ Call: EmbeddingClient.embed_text(question)
         │  │  └─ Question → 384-dim vector
         │  ├─ Call: VectorStore.query(embedding, n_results=5)
         │  │  └─ ChromaDB finds top-5 similar comments
         │  ├─ Retrieves: ["I want longer videos", "Tutorial series please", ...]
         │  ├─ Build LLM prompt with question + context
         │  ├─ Call: LLMClient.complete()
         │  │  └─ LLM generates grounded answer
         │  └─ Returns: (answer_text, source_comments)
         │
         ├─ Display assistant response
         ├─ Show "Source Comments" expander
         └─ Store in chat history

2:25s    USER CONTINUES CHATTING
         ├─ Each question follows same RAG flow
         ├─ Chat history maintained in session
         └─ Multiple Q&A turns possible
```

### 7.2 Performance Characteristics

| Component | Time | Bottleneck |
|-----------|------|-----------|
| YouTube API (metadata) | 1-2s | Network |
| YouTube API (300 comments) | 3-5s | API pagination |
| Comment preprocessing | 0.5s | Local |
| Embeddings (300 comments) | 2-3s | CPU (sentence-transformers) |
| ChromaDB storage | 0.5s | Disk I/O |
| **Sentiment analysis (3 chunks)** | **10-15s** | **LLM latency** |
| **Topic clustering** | **3-5s** | **KMeans + 6 LLM calls** |
| **Report generation** | **2-3s** | **LLM latency** |
| **TOTAL PIPELINE** | **25-40s** | **LLM inference** |

**Optimization opportunities**:
- Parallel sentiment chunks (currently sequential due to Tenacity)
- Batch topic LLM calls (combine into single request)
- Cache metadata aggressively

---

## 8. Deployment Considerations

### 8.1 Local Development
```bash
# Terminal 1: Start Ollama
ollama serve  # Runs on :11434

# Terminal 2: Start app
streamlit run frontend/app.py  # Runs on :8501
```

### 8.2 Production Deployment
```bash
# Use OpenRouter instead of Ollama
OLLAMA_BASE_URL=""  # Empty = use OpenRouter
OPENROUTER_API_KEY="sk-or-v1-..."

streamlit run frontend/app.py \
    --server.port 80 \
    --logger.level=warning
```

### 8.3 Scaling Considerations
- **Concurrent users**: Add session isolation in Streamlit
- **Large comment volumes**: Implement pagination, batch processing
- **API rate limits**: Use Tenacity + queue system
- **Storage**: Archive old data to cold storage

---

## 9. Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| "Connection refused" on port 11434 | Ollama not running | `ollama serve` in terminal |
| "YouTube API error 403" | Invalid API key | Check `.env` YOUTUBE_API_KEY |
| "LLM call timeout" | Network slow | Increase Tenacity wait_max |
| "ChromaDB locked" | Previous session didn't close | Clear `./data/vectorstore/__pycache__` |
| "Memory error on embedding" | Too many comments | Reduce MAX_COMMENTS_PER_VIDEO |

---

## 10. Summary: What Happens When You Click "Analyze"

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CLICKS "ANALYZE VIDEO"                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ ORCHESTRATOR INITIALIZES │
                │ (LangGraph compiled)    │
                └────────────┬────────────┘
                             │
                ┌────────────▼────────────┐
                │ RUN SEQUENTIAL AGENTS:  │
                │                        │
                │ 1️⃣  DATA AGENT        │ ──→ Fetch YouTube + Embed
                │      ↓                │
                │ 2️⃣  SENTIMENT AGENT   │ ──→ LLM analyzes emotions
                │      ↓                │
                │ 3️⃣  TOPIC AGENT       │ ──→ KMeans + LLM labels
                │      ↓                │
                │ 4️⃣  REPORT AGENT      │ ──→ LLM synthesizes insights
                │                        │
                └────────────┬────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │ RESULTS IN STATE:    │
                   │ - Sentiment scores   │
                   │ - Topic clusters     │
                   │ - Insight report     │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ DISPLAY IN FRONTEND: │
                   │ - Metrics            │
                   │ - Charts             │
                   │ - Text content       │
                   └──────────────────────┘
```

---

**This documentation explains the complete system. For any presentation, refer to the corresponding section and explain the flow with reference to the code.**

👉 **Pro Tips for Presentation**:
1. Start with the system overview (Section 2)
2. Explain a single video analysis (Section 4.1)
3. Show the code structure (Section 5)
4. Demo the actual UI and show the results
5. Answer deep questions using the code walkthroughs (Section 6)

Good luck! 🚀
