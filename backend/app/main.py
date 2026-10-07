import json
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from app.llm.client import ask_llm, generate_recommendation_summary
from app.schemas.intent import CustomerIntent, RAGSearchResponse
from app.rag.vector_store import load_products, get_all_products_from_store
from app.rag.retriever import search_products

app = FastAPI(
    title="AI Commerce Agent API",
    description="Intelligent Financial & Retail Commerce Analytics and RAG Search Engine",
    version="1.0.0"
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load catalog data into ChromaDB at startup
@app.on_event("startup")
def startup_event():
    load_products()

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI Commerce Agent Backend",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/products")
def list_products(category: Optional[str] = None):
    all_prods = get_all_products_from_store()
    if category and category != "All":
        return [p for p in all_prods if p.get("category").lower() == category.lower()]
    return all_prods

@app.get("/products/search")
def product_search(query: str, category: Optional[str] = None, max_budget: Optional[float] = None):
    return search_products(query=query, category=category, max_budget=max_budget)

@app.post("/chat", response_model=RAGSearchResponse)
def chat(request: ChatRequest):
    # Step 1: Extract intent via LLM
    raw_llm_json = ask_llm(request.message)
    try:
        parsed_intent = json.loads(raw_llm_json)
        intent_obj = CustomerIntent(**parsed_intent)
    except Exception:
        intent_obj = CustomerIntent(intent="product_search")

    # Step 2: Hybrid RAG Retrieval (Vector + Metadata filtering)
    matched_products = search_products(
        query=request.message,
        category=intent_obj.category,
        max_budget=intent_obj.budget,
        top_k=4
    )

    # Step 3: Generate AI Recommendation Pitch
    ai_summary = generate_recommendation_summary(request.message, matched_products)

    return RAGSearchResponse(
        query=request.message,
        intent=intent_obj,
        products=matched_products,
        ai_recommendation=ai_summary
    )