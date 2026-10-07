"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  ShoppingCart,
  CheckCircle2,
  X,
  Zap,
  ShieldCheck,
  Server,
  Layers,
  Plus,
  Minus,
  Star,
  Tag,
  SlidersHorizontal,
  Compass
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  use_cases: string[];
}

interface CustomerIntent {
  intent: string;
  category?: string | null;
  budget?: number | null;
  use_case?: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const SAMPLE_QUERIES = [
  "Smartwatch for fitness tracking & running",
  "Full frame camera for 4K vlogging",
  "Noise cancelling headphones for travel under $400",
  "Ergonomic mouse for coding under $100",
  "4K monitor for dual desk setup under $500",
  "Portable power bank for flight travel"
];

const CATEGORIES = [
  "All",
  "Electronics",
  "Computers",
  "Monitors",
  "Accessories",
  "Home & Kitchen",
  "Fitness & Wearables",
  "Cameras & Photography",
  "Personal Care"
];

// Custom Brand Logo Component
function FinSightLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-2 text-amber-400 shadow-md flex items-center justify-center border border-stone-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tight text-stone-900 font-serif">
            FinSight <span className="text-amber-700 font-sans font-extrabold">AI</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider uppercase border border-amber-200">
            Commerce RAG
          </span>
        </div>
        <p className="text-[11px] text-stone-500 font-medium">Intelligent Market Risk & Product Discovery Engine</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);
  const [aiIntent, setAiIntent] = useState<CustomerIntent | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== "All" ? `?category=${encodeURIComponent(selectedCategory)}` : "";
      const res = await fetch(`${API_URL}/products${categoryParam}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        setProducts(fallbackCatalog);
      }
    } catch (err) {
      setProducts(fallbackCatalog);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async (searchPrompt?: string) => {
    const searchQuery = searchPrompt || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: searchQuery })
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setAiIntent(data.intent || null);
        setAiRecommendation(data.ai_recommendation || null);
      } else {
        filterCatalogLocally(searchQuery);
      }
    } catch (err) {
      filterCatalogLocally(searchQuery);
    } finally {
      setLoading(false);
    }
  };

  const filterCatalogLocally = (searchQuery: string) => {
    const q = searchQuery.toLowerCase();
    let budget: number | null = null;
    const matchBudget = q.match(/(?:under|\$|max)\s*\$?(\d+)/);
    if (matchBudget) budget = parseFloat(matchBudget[1]);

    const filtered = fallbackCatalog.filter(p => {
      if (budget && p.price > budget) return false;
      const text = `${p.name} ${p.category} ${p.description} ${p.use_cases.join(" ")}`.toLowerCase();
      return text.includes(q) || q.split(" ").some(word => word.length > 3 && text.includes(word));
    });

    setProducts(filtered.length > 0 ? filtered : fallbackCatalog);
    setAiIntent({
      intent: "product_search",
      category: selectedCategory !== "All" ? selectedCategory : null,
      budget: budget,
      use_case: "Smart Search"
    });
    setAiRecommendation(`Found ${filtered.length} products matching "${searchQuery}".`);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900 font-sans pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-stone-900 text-amber-50 px-5 py-3 rounded-xl shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#e5e2da] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <FinSightLogo />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchModal(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f0ede6] hover:bg-[#e7e3d9] text-xs font-semibold text-stone-700 border border-[#e2ddd3] transition"
            >
              <Server className="w-3.5 h-3.5 text-stone-600" />
              <span>Tech Stack & Architecture</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#ffffff] hover:bg-[#f3f0e8] border border-[#e2ddd3] text-stone-800 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-700 text-amber-50 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Hero & Conversational AI Search Box */}
        <section className="creme-card p-6 sm:p-8 rounded-2xl space-y-4">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1ede3] text-amber-900 text-xs font-semibold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AI Natural Language Product & Risk Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight">
              Search any product or intent in plain English.
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              FastAPI + ChromaDB vector engine matches keywords, categories, and numeric budget constraints instantly.
            </p>

            {/* Input Form */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAiSearch()}
                  placeholder="Try 'Smartwatch for fitness', 'Camera for 4K video', 'Headphones under $400'..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl creme-input text-stone-900 placeholder-stone-400 text-sm font-medium"
                />
              </div>
              <button
                onClick={() => handleAiSearch()}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 font-semibold text-sm text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                <span>Ask AI Agent</span>
              </button>
            </div>

            {/* Sample Queries */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Popular searches:
              </span>
              {SAMPLE_QUERIES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(sample);
                    handleAiSearch(sample);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#f3f0e8] hover:bg-[#e7e3d8] border border-[#e2ddd3] text-stone-700 transition"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AI Intent Breakdown & Recommendation Banner */}
        {(aiIntent || aiRecommendation) && (
          <section className="creme-card p-5 rounded-xl border border-stone-300 bg-[#faf8f3] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Extracted Search Intent & Constraints</span>
              </div>
              <button
                onClick={() => {
                  setAiIntent(null);
                  setAiRecommendation(null);
                  fetchProducts();
                }}
                className="text-xs text-stone-500 hover:text-stone-900 underline"
              >
                Clear AI Filter
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {aiIntent?.intent && (
                <span className="px-2.5 py-1 rounded-lg bg-[#efece4] text-stone-800 text-xs font-medium border border-stone-300">
                  Intent: <strong>{aiIntent.intent}</strong>
                </span>
              )}
              {aiIntent?.category && (
                <span className="px-2.5 py-1 rounded-lg bg-[#efece4] text-stone-800 text-xs font-medium border border-stone-300">
                  Category: <strong>{aiIntent.category}</strong>
                </span>
              )}
              {aiIntent?.budget && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                  Max Budget: <strong>${aiIntent.budget}</strong>
                </span>
              )}
              {aiIntent?.use_case && (
                <span className="px-2.5 py-1 rounded-lg bg-[#efece4] text-stone-800 text-xs font-medium border border-stone-300">
                  Use Case: <strong>{aiIntent.use_case}</strong>
                </span>
              )}
            </div>

            {aiRecommendation && (
              <p className="text-xs sm:text-sm text-stone-700 bg-white p-3 rounded-lg border border-stone-200">
                💡 <strong>AI Recommendation:</strong> {aiRecommendation}
              </p>
            )}
          </section>
        )}

        {/* Category Pills */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#e5e2da] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setAiIntent(null);
                  setAiRecommendation(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-stone-900 text-white"
                    : "bg-[#ffffff] text-stone-600 hover:text-stone-900 hover:bg-[#f0ede5] border border-[#e2ddd3]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing <span className="text-stone-900 font-bold">{products.length}</span> catalog items
          </div>
        </div>

        {/* Product Catalog Grid - Clean cards with NO unnecessary hover borders */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="creme-card p-4 rounded-xl space-y-4 animate-pulse">
                <div className="w-full h-44 bg-stone-200 rounded-lg" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
                <div className="h-8 bg-stone-200 rounded-lg w-full" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map(product => (
              <div
                key={product.id}
                className="creme-card rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-stone-900/85 backdrop-blur text-[11px] font-semibold text-stone-100">
                      {product.category}
                    </span>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200 flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-stone-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Use Cases tags */}
                  <div className="flex flex-wrap gap-1">
                    {product.use_cases?.slice(0, 3).map((uc, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#f1ede4] text-stone-600 border border-stone-200">
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-400">Price</span>
                    <p className="text-base font-bold text-stone-900">${product.price.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 font-semibold text-xs text-white flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center space-y-3">
              <Search className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-stone-700 font-semibold">No products matched your exact search query.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  fetchProducts();
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
              >
                Reset Catalog Filter
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#ffffff] border-l border-stone-200 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-stone-900" />
                  <h2 className="text-lg font-bold text-stone-900">Your Shopping Cart</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto" />
                  <p className="text-stone-500 text-sm">Your cart is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="creme-card p-3.5 rounded-xl flex items-center justify-between gap-3 border border-stone-200">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover bg-stone-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{item.product.name}</h4>
                        <p className="text-xs text-stone-600 font-semibold">${item.product.price.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="text-stone-600 hover:text-stone-900">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-stone-900 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="text-stone-600 hover:text-stone-900">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-6 border-t border-stone-200 space-y-4">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-stone-900 font-semibold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCart([]);
                    setIsCartOpen(false);
                    showToast("Order placed successfully! Thank you for testing FinSight AI Commerce.");
                  }}
                  className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-sm font-bold text-white shadow flex items-center justify-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tech Architecture Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-[#ffffff] p-6 sm:p-8 rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowArchModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-stone-900" />
              <h3 className="text-lg font-bold text-stone-900">System Architecture & Interview Guide</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-1.5">
                <h4 className="font-bold text-stone-900">⚡ Backend Stack</h4>
                <p className="text-stone-600">FastAPI, Python 3.11, Pydantic v2, ChromaDB Vector DB, Sentence-Transformers, Groq API LLM integration.</p>
              </div>

              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-1.5">
                <h4 className="font-bold text-stone-900">💻 Frontend Stack</h4>
                <p className="text-stone-600">Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, FinSight Logo & Branding.</p>
              </div>

              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-1.5">
                <h4 className="font-bold text-stone-900">🐳 DevOps & CI/CD</h4>
                <p className="text-stone-600">Multi-container Docker Compose setup, GitHub Actions pipeline (`.github/workflows/ci.yml`).</p>
              </div>

              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-1.5">
                <h4 className="font-bold text-stone-900">🎯 Key Challenge Solved</h4>
                <p className="text-stone-600">Hybrid RAG retrieval combining vector search with strict metadata constraints (budget & category limits).</p>
              </div>
            </div>

            <button
              onClick={() => setShowArchModal(false)}
              className="w-full py-3 rounded-xl bg-stone-900 text-xs font-bold text-white hover:bg-stone-800 transition"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const fallbackCatalog: Product[] = [
  {
    id: "prod_1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    category: "Electronics",
    price: 398.00,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    description: "Industry-leading active noise-canceling over-ear bluetooth headphones with 30-hour battery life.",
    use_cases: ["travel", "work", "focus", "music"]
  },
  {
    id: "prod_2",
    name: "Logitech MX Master 3S Ergonomic Mouse",
    category: "Electronics",
    price: 99.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80",
    description: "An iconic ergonomic wireless mouse featuring Quiet Clicks and 8K DPI track-on-glass sensor.",
    use_cases: ["coding", "productivity", "office"]
  },
  {
    id: "prod_3",
    name: "Apple Watch Series 9 GPS 45mm",
    category: "Fitness & Wearables",
    price: 399.00,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80",
    description: "Advanced smartwatch featuring S9 SiP chip, Double Tap gesture, ECG monitor, and heart rate tracking.",
    use_cases: ["fitness", "running", "health"]
  },
  {
    id: "prod_4",
    name: "Sony Alpha 7 IV Full-Frame Mirrorless Camera",
    category: "Cameras & Photography",
    price: 2498.00,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
    description: "33MP full-frame Exmor R CMOS sensor camera with 4K 60p video and real-time eye autofocus.",
    use_cases: ["photography", "vlogging", "video recording"]
  }
];
