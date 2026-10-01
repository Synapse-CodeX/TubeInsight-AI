# 🎯 TubeInsight AI

> **AI-powered YouTube Comment Intelligence Platform** — transform raw audience comments into actionable insights about sentiment, topics, audience behavior, and content performance.

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF.svg)](https://vitejs.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent%20Orchestration-green.svg)](https://github.com/langchain-ai/langgraph)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Store-purple.svg)](https://www.trychroma.com/)
[![Groq](https://img.shields.io/badge/LLM-Groq-orange.svg)](https://groq.com/)
[![YouTube API](https://img.shields.io/badge/YouTube-Data%20API%20v3-red.svg)](https://developers.google.com/youtube/v3)

---

## 🧠 What Is TubeInsight AI?

**TubeInsight AI** is an AI-powered YouTube audience intelligence platform designed to help creators understand what their viewers are actually saying.

Instead of manually reading hundreds of comments, TubeInsight AI processes YouTube comment data through a multi-agent AI pipeline and converts it into structured intelligence.

The platform combines:

- 🤖 **Multi-agent AI orchestration**
- 💬 **YouTube comment analysis**
- ❤️ **Sentiment and audience-vibe analysis**
- 🧠 **Topic discovery and clustering**
- 🔎 **RAG-powered conversational analysis**
- 📊 **AI-generated insight reports**
- ⚡ **Streaming analysis progress**
- 🔐 **Local demo authentication**
- 📎 **File attachment support in the frontend**

---

# ✨ Core Features

## 🤖 Multi-Agent AI Analysis

TubeInsight AI uses a LangGraph-based orchestration layer to coordinate specialized agents.

Instead of asking a single LLM to perform the entire analysis, the workload is divided into focused components.

### Agents

| Agent | Responsibility |
|---|---|
| `OrchestratorAgent` | Coordinates the complete analysis workflow |
| `DataAgent` | Fetches and prepares YouTube video/comment data |
| `SentimentAgent` | Analyzes sentiment, emotion, and audience response |
| `TopicAgent` | Identifies recurring themes and discussion topics |
| `RAGAgent` | Provides conversational retrieval over analyzed data |
| `ReportAgent` | Produces the final AI-generated insight report |

---

# 📊 What TubeInsight AI Can Extract

Given a YouTube video, the system can transform raw comments into structured insights such as:

### ❤️ Audience Sentiment

Understand whether viewers are responding positively, negatively, or neutrally.

### 🔥 Audience Vibe

Identify the overall emotional tone and energy surrounding the discussion.

### 🧠 Topic Discovery

Surface recurring themes and discussion clusters appearing throughout the comments.

### 💬 Audience Questions

Identify what viewers are asking, discussing, or struggling with.

### 📈 Content Insights

Generate higher-level observations from the combined comment analysis.

### 🤖 AI Report

Generate a natural-language report summarizing the most important audience signals.

---

# 🔎 RAG-Powered Audience Chat

TubeInsight AI includes a retrieval-augmented generation pipeline that allows creators to ask questions about their analyzed audience.

Instead of manually searching through comments, users can interact with the analysis conversationally.

Example questions:

```text
What are viewers complaining about the most?

What topics are people most interested in?

What did viewers like about this video?

What questions are repeatedly being asked?

What should I improve in my next video?
````

The RAG layer uses vector embeddings and ChromaDB to retrieve relevant information before sending context to the LLM.

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────────┐
                         │       React Frontend      │
                         │    Vite + TypeScript      │
                         │                           │
                         │  Dashboard / Auth / Chat  │
                         └─────────────┬─────────────┘
                                       │
                              REST API / SSE
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       FastAPI API         │
                         │                           │
                         │       api.py              │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │   LangGraph Orchestrator  │
                         └─────────────┬─────────────┘
                                       │
                ┌──────────────┬───────┼───────┬──────────────┐
                │              │       │       │              │
                ▼              ▼       ▼       ▼              ▼
          ┌──────────┐   ┌──────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
          │   Data   │   │Sentiment │ │Topic │ │   RAG    │ │ Report   │
          │  Agent   │   │  Agent   │ │Agent │ │  Agent   │ │  Agent   │
          └────┬─────┘   └────┬─────┘ └──┬───┘ └────┬─────┘ └────┬─────┘
               │              │          │           │            │
               ▼              ▼          ▼           ▼            ▼
        YouTube Data       NLP/LLM   Embeddings   ChromaDB      LLM
             API
```

---

# 🔄 Analysis Pipeline

```text
                    YouTube Video URL
                           │
                           ▼
                  ┌─────────────────┐
                  │   Data Agent    │
                  │                 │
                  │ Fetch metadata  │
                  │ Fetch comments  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Preprocessing   │
                  │                 │
                  │ Clean comments  │
                  │ Normalize data  │
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        Sentiment       Topic        Embedding
         Analysis      Analysis       Pipeline
              │            │            │
              │            │            ▼
              │            │        ChromaDB
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  RAG / Report   │
                  │     Agents      │
                  └────────┬────────┘
                           │
                           ▼
                  AI Audience Report
```

---

# 🧩 Project Structure

```text
tubeinsight-ai/
│
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── data_agent.py
│   │   ├── sentiment_agent.py
│   │   ├── topic_agent.py
│   │   ├── rag_agent.py
│   │   └── report_agent.py
│   │
│   ├── core/
│   │   ├── youtube_client.py
│   │   ├── embeddings.py
│   │   ├── vectorstore.py
│   │   └── llm_client.py
│   │
│   └── utils/
│       └── preprocessing.py
│
├── config/
│   ├── settings.py
│   └── prompts.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SignIn.tsx
│   │   │   └── SignUp.tsx
│   │   │
│   │   ├── App.tsx
│   │   └── ...
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── data/
│   ├── raw/
│   └── vectorstore/
│
├── api.py
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

# 🛠️ Tech Stack

| Layer               | Technology                          |
| ------------------- | ----------------------------------- |
| Frontend            | React + TypeScript                  |
| Frontend Build Tool | Vite                                |
| UI                  | Tailwind CSS + component primitives |
| Backend             | FastAPI                             |
| API Server          | Uvicorn                             |
| Agent Orchestration | LangGraph                           |
| LLM Gateway         | LangChain ChatGroq                  |
| LLM Provider        | Groq (`openai/gpt-oss-20b`)         |
| YouTube Data        | YouTube Data API v3                 |
| Embeddings          | Sentence Transformers               |
| Embedding Model     | `all-MiniLM-L6-v2`                  |
| Vector Database     | ChromaDB                            |
| Topic Modeling      | BERTopic / clustering pipeline      |
| NLP                 | NLTK + scikit-learn                 |
| Caching             | DiskCache                           |
| Configuration       | Pydantic Settings                   |
| Validation          | Pydantic                            |
| Testing             | Pytest                              |
| Retry Handling      | Tenacity                            |
| Logging             | Loguru                              |

---

# 🤖 LLM Architecture

The project uses a stable `LLMClient` abstraction so the agent layer does not depend on a provider SDK. Production uses Groq through LangChain `ChatGroq`; local development can use Ollama through its OpenAI-compatible API.

Current development configuration:

```text
TubeInsight AI
       │
       ▼
   LLMClient
       │
       ▼
 Groq API
       │
       ▼
 Configured LLM Model
```

The LLM client is responsible for:

* API communication
* Retry handling
* Rate limiting
* Standard completions
* JSON responses
* Multi-turn conversation history
* Provider abstraction

---

# 📡 API

The backend is powered by FastAPI.

## Health Check

```http
GET /health
```

Example:

```json
{
  "status": "ok"
}
```

---

## Analyze Video

```http
POST /analyze
```

Example request:

```json
{
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

The endpoint starts the YouTube intelligence pipeline and returns the generated analysis.

---

## Streaming Analysis

```http
POST /analyze/stream
```

The frontend can consume analysis progress through Server-Sent Events (SSE).

Conceptually:

```text
Frontend
   │
   │ POST /analyze/stream
   ▼
FastAPI
   │
   ├── Data collection
   ├── Sentiment analysis
   ├── Topic analysis
   ├── Embeddings
   ├── RAG preparation
   └── Report generation
   │
   ▼
SSE progress events
   │
   ▼
Frontend progress UI
```

---

## Channel Videos

```http
POST /channel/videos
```

Used to retrieve videos associated with a YouTube channel.

---

## RAG Chat

```http
POST /chat
```

Example:

```json
{
  "query": "What are viewers complaining about the most?"
}
```

The RAG agent retrieves relevant context from the vector store before generating the response.

---

# 🔐 Authentication

TubeInsight AI currently includes a **local demo authentication system**.

The frontend provides:

```text
Sign Up
   │
   ▼
Create Demo Account
   │
   ▼
Persist Session
   │
   ▼
Dashboard
```

And:

```text
Sign In
   │
   ▼
Validate Demo Credentials
   │
   ▼
Create Session
   │
   ▼
Dashboard
```

Authentication currently uses browser `localStorage` for development/demo purposes.

Stored data includes:

```text
tubeinsight_demo_users
tubeinsight_demo_session
```

### Important

This authentication system is intended for **development/demo use**.

It is **not a production authentication system** and should be replaced with a proper authentication provider/backend implementation before handling real user accounts or sensitive information.

---

# 📎 File Attachment

The dashboard includes an attachment control that opens the browser's native file picker.

Currently supported frontend file types include:

```text
.txt
.csv
.json
.md
.pdf
.png
.jpg
.jpeg
.webp
```

The current implementation displays the selected filename in the UI.

The attachment control is currently a **frontend interaction**; it does not represent a backend file-upload pipeline.

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

Example:

```env
# ─────────────────────────────────────────────
# YouTube
# ─────────────────────────────────────────────

YOUTUBE_API_KEY=your_youtube_api_key


# ─────────────────────────────────────────────
# LLM
# ─────────────────────────────────────────────

GROQ_API_KEY=your_groq_api_key

USE_LOCAL_LLM=false

LLM_MODEL=openai/gpt-oss-20b


# ─────────────────────────────────────────────
# Optional Local Ollama Configuration
# ─────────────────────────────────────────────

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:1b


# ─────────────────────────────────────────────
# Embeddings
# ─────────────────────────────────────────────

SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2


# ─────────────────────────────────────────────
# Storage
# ─────────────────────────────────────────────

CHROMA_PERSIST_DIR=./data/vectorstore
RAW_DATA_DIR=./data/raw


# ─────────────────────────────────────────────
# Ingestion
# ─────────────────────────────────────────────

MAX_COMMENTS_PER_VIDEO=100
MAX_VIDEOS_PER_CHANNEL=10


# ─────────────────────────────────────────────
# Application
# ─────────────────────────────────────────────

APP_ENV=development
LOG_LEVEL=INFO
```

> **Never commit `.env` or API keys to GitHub.**

---

# 🔑 Getting API Keys

## YouTube Data API

TubeInsight AI uses the **YouTube Data API v3** to retrieve video and comment information.

Create a Google Cloud project, enable the YouTube Data API v3, and generate an API key.

---

## Groq

TubeInsight AI uses Groq with `openai/gpt-oss-20b` for cloud-based LLM inference.

Add your Groq API key to:

```env
GROQ_API_KEY=your_groq_api_key
```

The configured model is controlled through:

```env
LLM_MODEL=openai/gpt-oss-20b
```

---

# 🚀 Local Development

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/tubeinsight-ai.git

cd tubeinsight-ai
```

---

# 🐍 2. Create Python Environment

Recommended:

```bash
py -3.12 -m venv .venv
```

Activate on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Verify:

```bash
python --version
```

---

# 📦 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

# 🔐 4. Configure Environment

Create:

```text
.env
```

from:

```text
.env.example
```

Then configure:

```env
YOUTUBE_API_KEY=...
GROQ_API_KEY=...
```

---

# 🖥️ 5. Start Backend

From the project root:

```bash
python -m uvicorn api:app --reload
```

Backend:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

# 🌐 6. Install Frontend Dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

---

# ▶️ 7. Start Frontend

```bash
npm run dev
```

The Vite development server will start at:

```text
http://localhost:3000
```

---

# 🏭 Production Frontend Build

To generate a production build:

```bash
cd frontend
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

# 🧪 Testing & Validation

Backend tests:

```bash
pytest
```

Frontend TypeScript validation:

```bash
cd frontend
npx tsc --noEmit
```

Frontend production build:

```bash
npm run build
```

Git whitespace validation:

```bash
git diff --check
```

---

# 🔒 Security Notes

The following files/directories should remain local:

```text
.env
.venv/
venv/
data/raw/
data/vectorstore/
frontend/dist/
```

They are excluded through `.gitignore`.

Never expose:

```text
YOUTUBE_API_KEY
GROQ_API_KEY
```

in frontend code or commit them to the repository.

API keys should only be accessed by the backend.

---

# 📈 Future Improvements

Planned improvements include:

* [ ] Production-grade authentication
* [ ] Persistent user accounts
* [ ] Cloud database integration
* [ ] Production vector-store infrastructure
* [ ] Advanced creator analytics
* [ ] Historical channel-level analysis
* [ ] Video-to-video comparison
* [ ] Audience trend tracking
* [ ] Exportable PDF reports
* [ ] Advanced recommendation engine
* [ ] Production file-upload pipeline
* [ ] Background analysis jobs
* [ ] Deployment monitoring
* [ ] Improved API rate-limit handling
* [ ] Production observability

---

# 🚀 Deployment Architecture

The intended deployment architecture separates the frontend and backend.

```text
                    Internet
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        ┌───────────┐     ┌────────────┐
        │  Vercel   │     │   Render   │
        │           │     │            │
        │ React     │────▶│ FastAPI    │
        │ Frontend  │ API │ Backend    │
        └───────────┘     └─────┬──────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
                YouTube       Groq       ChromaDB
                   API          API
```

### Frontend

Planned platform:

**Vercel**

The Vite React frontend will be deployed as a production static application.

### Backend

Planned platform:

**Render**

The FastAPI backend will run as a web service.

Environment variables such as:

```text
YOUTUBE_API_KEY
GROQ_API_KEY
LLM_MODEL
CHROMA_PERSIST_DIR
```

will be configured through the deployment platform rather than committed to GitHub.

---

# 🌟 Why TubeInsight AI?

YouTube generates enormous amounts of audience feedback.

The challenge isn't collecting comments.

The challenge is **understanding them at scale**.

TubeInsight AI transforms:

```text
Raw YouTube Comments
        │
        ▼
Data Collection
        │
        ▼
Preprocessing
        │
        ▼
Multi-Agent AI Analysis
        │
        ├── Sentiment
        ├── Topics
        ├── Audience Vibe
        ├── Questions
        └── Behavioral Signals
        │
        ▼
Vector Knowledge Base
        │
        ▼
RAG + AI Reasoning
        │
        ▼
Actionable Creator Intelligence
```

The goal is to move creators from:

> **"I have thousands of comments."**

to:

> **"I understand what my audience is telling me."**

---

# 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---



