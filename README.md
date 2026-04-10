# 🎯 TubeInsight AI

> **AI-powered YouTube comment intelligence platform** — built for creators who want to truly understand their audience.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/orchestration-LangGraph-green)](https://github.com/langchain-ai/langgraph)
[![LLM](https://img.shields.io/badge/LLM-OpenRouter%20%7C%20Ollama-orange)](https://openrouter.ai/)
[![Next.js](https://img.shields.io/badge/frontend-Next.js-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-teal)](https://fastapi.tiangolo.com/)

---

## 🧠 What Is This?

TubeInsight AI is a creator intelligence dashboard that transforms raw YouTube comment data into structured, actionable insight using:

- **Multi-agent AI orchestration** via LangGraph
- **RAG-powered chatbot** — ask natural questions about your audience
- **Sentiment + vibe analysis** per video and across your channel
- **Topic clustering** to surface what viewers actually care about
- **AI-generated insight reports** per video

---

## 🗂️ Project Structure

```
tubeinsight-ai/
├── frontend/                   # Next.js + shadcn/ui frontend
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Home page (URL input)
│   │   ├── layout.tsx          # Root layout
│   │   └── dashboard/          # Dashboard page
│   │       └── page.tsx
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── backend/
│   ├── agents/                 # LangGraph agents
│   │   ├── orchestrator.py     # Master agent router
│   │   ├── data_agent.py       # YouTube data ingestion
│   │   ├── sentiment_agent.py  # Emotion + vibe scoring
│   │   ├── topic_agent.py      # Comment clustering
│   │   ├── rag_agent.py        # RAG chat interface
│   │   └── report_agent.py     # Insight report generation
│   │
│   └── core/                   # Core business logic
│       ├── youtube_client.py   # YouTube API wrapper
│       ├── embeddings.py       # Embedding pipeline
│       ├── vectorstore.py      # ChromaDB interface
│       └── llm_client.py       # OpenRouter / Ollama wrapper
│
├── api.py                      # FastAPI backend entry point
├── data/
│   └── vectorstore/            # ChromaDB persistent storage
│
├── config/
│   ├── settings.py             # Pydantic settings
│   └── prompts.py              # All LLM prompt templates
│
├── .env.example
├── requirements.txt
└── README.md
```

---

## ⚡ Quickstart

```bash
# 1. Clone and setup
git clone https://github.com/yourname/tubeinsight-ai
cd tubeinsight-ai

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Configure environment
cp .env.example .env
# Fill in: YOUTUBE_API_KEY and OPENROUTER_API_KEY
# Or set OLLAMA_BASE_URL to use a local model instead

# 5. Run the backend (in one terminal)
uvicorn api:app --reload

# 6. Run the frontend (in another terminal)
cd frontend && npm run dev

# 7. Open http://localhost:3000 in your browser
```

---

## 🤖 Agent Architecture

```
User Input (video URL)
        │
        ▼
  Orchestrator Agent  (LangGraph StateGraph)
        │
   ┌────┼────┬────────┬──────────┐
   ▼    ▼    ▼        ▼          ▼
 Data  Sent Topic    RAG       Report
Agent  Agent Agent   Agent     Agent
```

| Agent | Responsibility |
|---|---|
| `DataAgent` | Fetch comments + metadata via YouTube API |
| `SentimentAgent` | Score emotion, toxicity, hype, likeness |
| `TopicAgent` | Cluster comments into themes via embeddings |
| `RAGAgent` | Answer creator questions about their content |
| `ReportAgent` | Generate the final written insight summary |

---

## 🔑 Environment Variables

```env
YOUTUBE_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
OLLAMA_BASE_URL=http://localhost:11434  # Optional alternative to OpenRouter
CHROMA_PERSIST_DIR=./data/vectorstore
CACHE_DIR=./data/processed
MAX_COMMENTS_PER_VIDEO=500
```

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + shadcn/ui + Tailwind CSS |
| Backend API | FastAPI + uvicorn |
| Agent Orchestration | LangGraph |
| LLM | OpenRouter or local Ollama |
| Embeddings | sentence-transformers `all-MiniLM-L6-v2` |
| Vector DB | ChromaDB |
| YouTube Data | YouTube Data API v3 |
| Sentiment Baseline | VADER + LLM refinement |
| Topic Modeling | BERTopic / KMeans |
| Caching | diskcache |
| Config | Pydantic Settings |

---

## 🚀 Run Instructions

### Backend
```bash
uvicorn api:app --reload
```
The API will be available at `http://localhost:8000`

### Frontend
```bash
cd frontend && npm run dev
```
The app will be available at `http://localhost:3000`

### API Endpoints

- `GET /health` - Health check
- `POST /analyze` - Analyze a YouTube video (accepts `{ "youtube_url": "..." }`)
- `POST /chat` - Chat with RAG (accepts `{ "query": "..." }`)

---

## 📄 License

MIT License - feel free to use this for your own projects!
