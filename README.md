<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/ChromaDB-FF6F00?style=for-the-badge&logo=databricks&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<h1 align="center">🛍️ FinSight AI Commerce</h1>

<p align="center">
  <strong>An intelligent, full-stack e-commerce platform that uses Natural Language Processing and Retrieval-Augmented Generation (RAG) to deliver context-aware product recommendations in real time.</strong>
</p>

<p align="center">
  <em>Built with FastAPI · Next.js · ChromaDB · Groq LLM · Docker · GitHub Actions</em>
</p>

---

## 📌 Overview

FinSight AI Commerce is a production-grade AI-powered shopping assistant that lets users describe what they need in **plain English** and instantly receives intelligent, filtered product recommendations.

Unlike traditional keyword-based search, this platform combines:
- **LLM-powered intent extraction** to understand budget, category, and use-case constraints from natural language
- **Vector similarity search (RAG)** via ChromaDB to semantically match products
- **Hard metadata filtering** to enforce numeric constraints like price limits

> *Example query:* `"Noise cancelling headphones for travel under $400"` → The AI parses `budget: $400`, `category: Electronics`, `use_case: travel` and returns only matching products ranked by semantic relevance.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🧠 Natural Language Intent Parsing** | Extracts structured JSON (`intent`, `category`, `budget`, `use_case`) from free-text user queries using Groq/Llama 3 LLM with a resilient regex fallback engine |
| **🔍 Hybrid RAG Retrieval** | Combines ChromaDB vector similarity search with strict metadata filtering (`price ≤ budget`, `category = X`) for precise results |
| **🛒 Interactive Shopping Cart** | Slide-out cart drawer with quantity controls, subtotal calculation, and mock checkout flow |
| **📊 Real-Time Intent Dashboard** | Visual badge chips showing extracted `Intent`, `Category`, `Budget`, and `Use Case` from each query |
| **💡 AI Recommendation Engine** | Generates a human-readable pitch explaining why the top product matches the user's needs |
| **🐳 Docker Containerization** | Multi-container `docker-compose.yml` orchestrating frontend and backend services |
| **⚙️ CI/CD Pipeline** | GitHub Actions workflow for automated syntax verification, dependency installation, and Docker build validation |
| **🎨 Clean, Minimal UI** | Warm creme-white theme with responsive grid layout, star ratings, use-case tags, and zero visual clutter |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    USER (Browser)                        │
│              http://localhost:3000                        │
└──────────────────┬───────────────────────────────────────┘
                   │  HTTP Requests (REST API)
                   ▼
┌──────────────────────────────────────────────────────────┐
│              NEXT.JS 14 FRONTEND                         │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ AI Search  │  │ Product Grid │  │ Cart Drawer     │  │
│  │ Input Box  │  │ + Filters    │  │ + Checkout      │  │
│  └────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────┬───────────────────────────────────────┘
                   │  fetch() → POST /chat, GET /products
                   ▼
┌──────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (Python 3.11)               │
│                                                          │
│  ┌─────────────────┐    ┌──────────────────────────┐     │
│  │ LLM Intent      │───▶│ Hybrid RAG Retriever     │     │
│  │ Parser (Groq)   │    │ (Vector + Metadata)      │     │
│  └─────────────────┘    └──────────┬───────────────┘     │
│                                    │                     │
│                          ┌─────────▼─────────┐           │
│                          │    ChromaDB        │           │
│                          │  (Vector Store)    │           │
│                          │  16 Products       │           │
│                          │  Indexed at Boot   │           │
│                          └───────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance async Python REST API framework |
| **Pydantic v2** | Strict request/response validation and LLM output parsing |
| **ChromaDB** | Persistent vector database for semantic product search |
| **Sentence-Transformers** | `all-MiniLM-L6-v2` model for generating product embeddings |
| **Groq API** | LLM provider (Llama 3.3 70B) for natural language intent extraction |
| **Uvicorn** | ASGI server for production-grade request handling |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router and server/client components |
| **TypeScript** | Type-safe component development |
| **Tailwind CSS v4** | Utility-first CSS with custom creme-white design system |
| **Lucide Icons** | Lightweight, consistent SVG icon library |

### DevOps
| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerized backend and frontend services |
| **Docker Compose** | Multi-container orchestration with shared networking |
| **GitHub Actions** | Automated CI pipeline for linting, testing, and build verification |

---

## 📂 Project Structure

```
ai-commerce-agent/
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   └── products.json          # 16-item product catalog
│   │   ├── llm/
│   │   │   └── client.py              # LLM intent parser + fallback engine
│   │   ├── rag/
│   │   │   ├── embeddings.py          # Sentence-Transformer embedding model
│   │   │   ├── retriever.py           # Hybrid vector + metadata search
│   │   │   └── vector_store.py        # ChromaDB indexing & startup loader
│   │   ├── schemas/
│   │   │   └── intent.py              # Pydantic response models
│   │   └── main.py                    # FastAPI application & API routes
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── globals.css                # Creme-white design system
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Main UI (search, grid, cart, modals)
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI/CD pipeline
├── docker-compose.yml                 # Multi-container orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+** and **Node.js 18+** installed
- (Optional) **Docker** for containerized deployment
- (Optional) **Groq API Key** for LLM-powered intent parsing — the app works without it using the built-in fallback parser

### Option 1: Docker Compose (Recommended)

```bash
git clone https://github.com/<your-username>/ai-commerce-agent.git
cd ai-commerce-agent
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API Docs | http://localhost:8000/docs |

### Option 2: Manual Development Setup

**Terminal 1 — Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install fastapi uvicorn pydantic chromadb groq python-dotenv
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (Optional)

Create a `backend/.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```

> **Note:** The application is fully functional without a Groq API key. The built-in fallback parser handles intent extraction using regex and keyword matching.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check & service status |
| `GET` | `/products` | List all catalog products (optional `?category=` filter) |
| `GET` | `/products/search?query=` | Keyword-based product search |
| `POST` | `/chat` | **AI-powered search** — accepts `{ "message": "..." }`, returns parsed intent + matched products + AI recommendation |

### Example Request

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Ergonomic mouse for coding under $100"}'
```

### Example Response

```json
{
  "query": "Ergonomic mouse for coding under $100",
  "intent": {
    "intent": "product_search",
    "category": "Electronics",
    "budget": 100.0,
    "use_case": "work & productivity"
  },
  "products": [
    {
      "id": "prod_2",
      "name": "Logitech MX Master 3S Ergonomic Mouse",
      "category": "Electronics",
      "price": 99.99,
      "rating": 4.9,
      "description": "An iconic ergonomic wireless mouse...",
      "use_cases": ["coding", "productivity", "office"]
    }
  ],
  "ai_recommendation": "Based on your query, I recommend the **Logitech MX Master 3S**..."
}
```

---

## 🧪 How It Works — The RAG Pipeline

```
User Query: "Noise cancelling headphones for travel under $400"
                           │
                           ▼
              ┌─────────────────────────┐
              │  1. LLM Intent Parser   │
              │  (Groq / Fallback)      │
              │                         │
              │  Output:                │
              │  category: Electronics  │
              │  budget: 400            │
              │  use_case: travel       │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  2. ChromaDB Vector     │
              │     Similarity Search   │
              │  + Metadata Filters:    │
              │    price <= $400        │
              │    category = Elec...   │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  3. Ranked Results      │
              │  + AI Recommendation    │
              │  Pitch Generated        │
              └─────────────────────────┘
```

---

## 🎤 Engineering Challenges & Solutions

### Challenge 1: Hybrid Retrieval (Vector Search + Hard Constraints)
- **Problem:** Pure vector similarity search ignores explicit numeric constraints like *"under $100"*. Semantically similar expensive products would still rank high.
- **Solution:** Built a 2-stage retrieval pipeline. First, the LLM parses user text into structured constraints. Then, ChromaDB executes vector search with `$lte` / `$eq` metadata filters applied simultaneously.

### Challenge 2: Idempotent Vector DB Startup Seeding
- **Problem:** Every server restart would duplicate product embeddings in ChromaDB, leading to redundant search results.
- **Solution:** Implemented an `upsert`-based indexing pipeline in `vector_store.py`, triggered on FastAPI's `@app.on_event("startup")` hook, ensuring exactly-once product indexing regardless of restart count.

### Challenge 3: Resilient Fallback Engine for 100% Uptime
- **Problem:** LLM API rate limits, network failures, or missing API keys would cause the entire search feature to break.
- **Solution:** Engineered a regex + keyword-based fallback parser in `client.py` that activates automatically when the LLM is unavailable. The frontend also includes a client-side catalog filter as a tertiary fallback, ensuring the app never shows an error state to users.

---

## 📦 Product Catalog

The platform ships with **16 curated products** across **9 categories**, each tagged with multiple use-case keywords for maximum search coverage:

| Category | Products |
|----------|----------|
| Electronics | Sony WH-1000XM5, Logitech MX Master 3S, Keychron K2 Pro, Kindle Paperwhite, Bose SoundLink Flex |
| Computers | MacBook Air M3, Samsung Galaxy Tab S9 Ultra |
| Monitors | Dell UltraSharp 27 4K |
| Accessories | Anker 737 Power Bank, BenQ ScreenBar Halo |
| Home & Kitchen | Nespresso VertuoPlus, Instant Pot Duo Plus |
| Fitness & Wearables | Apple Watch Series 9, Theragun Prime |
| Cameras & Photography | Sony Alpha 7 IV |
| Personal Care | Philips Sonicare 6100 |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ using FastAPI, Next.js, and ChromaDB</strong>
</p>
