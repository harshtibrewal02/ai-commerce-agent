"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Compass,
  TrendingUp,
  BadgeDollarSign,
  Crown,
  Gem,
  ArrowRight,
  Package,
  Heart,
  Info
} from "lucide-react";

/* ─────────────── Types ─────────────── */

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

/* ─────────────── Constants ─────────────── */

const SAMPLE_QUERIES = [
  "Best headphones under $100",
  "Smart watch for fitness under $400",
  "Camera for vlogging under $700",
  "Laptop for coding and video editing",
  "Kitchen gadgets under $150",
  "Budget fitness tracker under $50",
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
  "Personal Care",
];

const PRICE_TIERS = [
  { label: "All Prices", min: 0, max: Infinity, icon: Tag },
  { label: "Budget · Under $100", min: 0, max: 100, icon: BadgeDollarSign },
  { label: "Mid-Range · $100–$500", min: 100, max: 500, icon: TrendingUp },
  { label: "Premium · $500–$1,500", min: 500, max: 1500, icon: Crown },
  { label: "Luxury · $1,500+", min: 1500, max: Infinity, icon: Gem },
];

/* ─────────────── Helper Functions ─────────────── */

function getPriceTier(price: number): { label: string; class: string; icon: string } {
  if (price < 100) return { label: "Budget Pick", class: "tier-budget", icon: "💚" };
  if (price < 500) return { label: "Mid-Range", class: "tier-midrange", icon: "💙" };
  if (price < 1500) return { label: "Premium", class: "tier-premium", icon: "⭐" };
  return { label: "Luxury", class: "tier-luxury", icon: "💎" };
}

function getValueScore(product: Product): number {
  // Simple heuristic: rating weight * inverse price normalization
  const priceNorm = Math.min(product.price / 2500, 1);
  const ratingNorm = product.rating / 5;
  return Math.round((ratingNorm * 0.6 + (1 - priceNorm) * 0.4) * 100);
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─────────────── Brand Logo ─────────────── */

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
          <h1 className="text-xl font-black tracking-tight text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            FinSight <span className="text-amber-700 font-sans font-extrabold" style={{ fontFamily: "'Inter', sans-serif" }}>AI</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider uppercase border border-amber-200">
            Commerce RAG
          </span>
        </div>
        <p className="text-[11px] text-stone-500 font-medium">Intelligent Product Discovery & Investment Engine</p>
      </div>
    </div>
  );
}

/* ─────────────── Main Component ─────────────── */

export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceTier, setSelectedPriceTier] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);
  const [aiIntent, setAiIntent] = useState<CustomerIntent | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  // Apply price tier filter on top of fetched products
  const filteredProducts = useMemo(() => {
    const tier = PRICE_TIERS[selectedPriceTier];
    if (selectedPriceTier === 0) return products;
    return products.filter(p => p.price >= tier.min && p.price < tier.max);
  }, [products, selectedPriceTier]);

  // Stats for the dashboard strip
  const stats = useMemo(() => {
    const total = filteredProducts.length;
    const avgPrice = total > 0 ? filteredProducts.reduce((s, p) => s + p.price, 0) / total : 0;
    const avgRating = total > 0 ? filteredProducts.reduce((s, p) => s + p.rating, 0) / total : 0;
    const categories = new Set(filteredProducts.map(p => p.category)).size;
    return { total, avgPrice, avgRating, categories };
  }, [filteredProducts]);

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
    } catch {
      setProducts(fallbackCatalog);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async (searchPrompt?: string) => {
    const searchQuery = searchPrompt || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSelectedPriceTier(0); // Reset price filter on new AI search
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setAiIntent(data.intent || null);
        setAiRecommendation(data.ai_recommendation || null);
      } else {
        filterCatalogLocally(searchQuery);
      }
    } catch {
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

    const filtered = fallbackCatalog.filter((p) => {
      if (budget && p.price > budget) return false;
      const text = `${p.name} ${p.category} ${p.description} ${p.use_cases.join(" ")}`.toLowerCase();
      return text.includes(q) || q.split(" ").some((word) => word.length > 3 && text.includes(word));
    });

    setProducts(filtered.length > 0 ? filtered : fallbackCatalog);
    setAiIntent({
      intent: "product_search",
      category: selectedCategory !== "All" ? selectedCategory : null,
      budget: budget,
      use_case: "Smart Search",
    });
    setAiRecommendation(`Found ${filtered.length} products matching "${searchQuery}". Browse by price tier to find the perfect investment for your budget.`);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
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
    <div className="min-h-screen bg-[#f5f2eb] text-stone-900 font-sans pb-24">
      {/* ─── Toast Notification ─── */}
      {notification && (
        <div className="toast-notification fixed top-5 right-5 z-50 flex items-center gap-3 bg-stone-900 text-amber-50 px-5 py-3.5 rounded-2xl shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium text-sm">{notification}</span>
        </div>
      )}

      {/* ─── Sticky Glass Header ─── */}
      <header className="glass-header sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <FinSightLogo />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchModal(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f0ede6] hover:bg-[#e7e3d9] text-xs font-semibold text-stone-700 border border-[#e2ddd3] transition-all duration-300"
            >
              <Server className="w-3.5 h-3.5 text-stone-600" />
              <span>Architecture</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white hover:bg-[#f3f0e8] border border-[#e2ddd3] text-stone-800 transition-all duration-300 hover:shadow-md"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-700 text-amber-50 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow animate-fadeIn">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-7">
        {/* ─── Hero Search Section ─── */}
        <section className="creme-card p-6 sm:p-8 rounded-2xl space-y-5 animate-fadeInUp">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900 text-xs font-semibold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AI-Powered Product Discovery & Investment Analysis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Find the perfect product worth your investment.
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed max-w-2xl">
              Describe what you need in plain English — our AI parses intent, budget, and use-case to show products ranked by <strong>value for money</strong>. Every product includes ROI insights to help you decide.
            </p>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                  placeholder="Try 'Best headphones under $100' or 'Camera for YouTube under $700'..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl creme-input text-stone-900 placeholder-stone-400 text-sm font-medium"
                />
              </div>
              <button
                onClick={() => handleAiSearch()}
                disabled={loading}
                className="btn-primary px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Try:
              </span>
              {SAMPLE_QUERIES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(sample);
                    handleAiSearch(sample);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#f3f0e8] hover:bg-[#e7e3d8] border border-[#e2ddd3] text-stone-700 transition-all duration-200 hover:border-amber-300 hover:text-amber-800"
                >
                  &quot;{sample}&quot;
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── AI Intent + Recommendation ─── */}
        {(aiIntent || aiRecommendation) && (
          <section className="creme-card p-5 rounded-xl border-stone-300 bg-[#faf8f3] space-y-3 animate-fadeInUp">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Extracted Search Intent & Constraints</span>
              </div>
              <button
                onClick={() => {
                  setAiIntent(null);
                  setAiRecommendation(null);
                  setSelectedPriceTier(0);
                  fetchProducts();
                }}
                className="text-xs text-stone-500 hover:text-stone-900 underline transition"
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
              <p className="text-xs sm:text-sm text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200 leading-relaxed">
                💡 <strong>AI Recommendation:</strong> {aiRecommendation}
              </p>
            )}
          </section>
        )}

        {/* ─── Price Tier Filter ─── */}
        <div className="flex flex-wrap gap-2 animate-fadeInUp">
          {PRICE_TIERS.map((tier, idx) => {
            const TierIcon = tier.icon;
            return (
              <button
                key={idx}
                onClick={() => setSelectedPriceTier(idx)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedPriceTier === idx
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-white text-stone-600 hover:text-stone-900 hover:bg-[#f0ede5] border border-[#e2ddd3]"
                }`}
              >
                <TierIcon className="w-3.5 h-3.5" />
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Category Pills + Stats Strip ─── */}
        <div className="flex flex-col gap-4 border-b border-[#e5e2da] pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setAiIntent(null);
                    setAiRecommendation(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-stone-900 text-white shadow-md"
                      : "bg-white text-stone-600 hover:text-stone-900 hover:bg-[#f0ede5] border border-[#e2ddd3]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Dashboard Strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span><strong className="text-stone-900">{stats.total}</strong> products</span>
            </div>
            <div className="w-px h-3.5 bg-stone-300" />
            <div className="flex items-center gap-1.5">
              <BadgeDollarSign className="w-3.5 h-3.5" />
              <span>Avg price: <strong className="text-stone-900">${formatPrice(stats.avgPrice)}</strong></span>
            </div>
            <div className="w-px h-3.5 bg-stone-300" />
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Avg rating: <strong className="text-stone-900">{stats.avgRating.toFixed(1)}</strong></span>
            </div>
            <div className="w-px h-3.5 bg-stone-300" />
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span><strong className="text-stone-900">{stats.categories}</strong> categories</span>
            </div>
          </div>
        </div>

        {/* ─── Product Catalog Grid ─── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="creme-card p-4 rounded-2xl space-y-4">
                <div className="w-full h-44 rounded-xl animate-shimmer" />
                <div className="h-4 rounded w-3/4 animate-shimmer" />
                <div className="h-3 rounded w-1/2 animate-shimmer" />
                <div className="h-8 rounded-xl w-full animate-shimmer" />
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const tier = getPriceTier(product.price);
              const valueScore = getValueScore(product);
              const isHovered = hoveredProduct === product.id;

              return (
                <div
                  key={product.id}
                  className="product-card rounded-2xl p-4 flex flex-col justify-between"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="space-y-3 relative z-10">
                    {/* Image Container */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
                      />
                      {/* Category badge */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-sm text-[11px] font-semibold text-stone-100">
                        {product.category}
                      </span>
                      {/* Rating badge */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-sm text-amber-900 text-[11px] font-bold border border-amber-200 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{product.rating}</span>
                      </div>
                      {/* Price tier badge */}
                      <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${tier.class}`}>
                        {tier.icon} {tier.label}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Use Case Tags */}
                    <div className="flex flex-wrap gap-1">
                      {product.use_cases?.slice(0, 3).map((uc, i) => (
                        <span key={i} className="use-case-tag">
                          {uc}
                        </span>
                      ))}
                    </div>

                    {/* Value Score Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Value Score
                        </span>
                        <span className="text-[10px] font-bold text-stone-700">{valueScore}/100</span>
                      </div>
                      <div className="value-bar">
                        <div
                          className="value-bar-fill"
                          style={{
                            width: `${valueScore}%`,
                            background: valueScore >= 75 ? "#059669" : valueScore >= 50 ? "#d97706" : "#dc2626",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price + Add to Cart */}
                  <div className="pt-4 mt-3 border-t border-stone-200 flex items-center justify-between relative z-10">
                    <div>
                      <span className="text-[10px] text-stone-400 font-medium">Price</span>
                      <p className="text-lg font-extrabold text-stone-900 tracking-tight">${formatPrice(product.price)}</p>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center space-y-4 animate-fadeIn">
              <Search className="w-14 h-14 text-stone-300 mx-auto" />
              <p className="text-stone-700 font-semibold text-lg">No products matched your filters.</p>
              <p className="text-stone-500 text-sm">Try adjusting your price tier or category filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPriceTier(0);
                  fetchProducts();
                }}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ─── Shopping Cart Drawer ─── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="animate-slideInRight w-full max-w-md bg-white border-l border-stone-200 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-stone-900" />
                  <h2 className="text-lg font-bold text-stone-900">Your Cart</h2>
                  {cartCount > 0 && (
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                      {cartCount} items
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3 animate-fadeIn">
                  <ShoppingCart className="w-14 h-14 text-stone-200 mx-auto" />
                  <p className="text-stone-500 text-sm">Your cart is empty.</p>
                  <p className="text-stone-400 text-xs">Add products to start building your investment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const tier = getPriceTier(item.product.price);
                    return (
                      <div key={item.product.id} className="product-card p-3 rounded-xl flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{item.product.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-stone-700 font-semibold">${formatPrice(item.product.price)}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${tier.class}`}>
                              {tier.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 shrink-0">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="text-stone-600 hover:text-stone-900 transition">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-stone-900 w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="text-stone-600 hover:text-stone-900 transition">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-5 border-t border-stone-200 space-y-4">
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="text-stone-900 font-semibold">${formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total Investment</span>
                    <span>${formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCart([]);
                    setIsCartOpen(false);
                    showToast("Order placed! Thank you for investing in quality products with FinSight AI. 🎉");
                  }}
                  className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold shadow flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tech Architecture Modal ─── */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="animate-fadeInUp bg-white p-6 sm:p-8 rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowArchModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">System Architecture</h3>
                <p className="text-xs text-stone-500">Full-stack RAG-powered e-commerce platform</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-2 hover:border-amber-300 transition-all duration-300">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">⚡ Backend Stack</h4>
                <p className="text-stone-600 leading-relaxed">FastAPI, Python 3.11, Pydantic v2, ChromaDB Vector DB, Sentence-Transformers (all-MiniLM-L6-v2), Groq Llama 3 LLM.</p>
              </div>

              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-2 hover:border-amber-300 transition-all duration-300">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">💻 Frontend Stack</h4>
                <p className="text-stone-600 leading-relaxed">Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, Inter + Playfair Display fonts.</p>
              </div>

              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-2 hover:border-amber-300 transition-all duration-300">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">🐳 DevOps & CI/CD</h4>
                <p className="text-stone-600 leading-relaxed">Multi-container Docker Compose orchestration, GitHub Actions CI pipeline for build validation.</p>
              </div>

              <div className="bg-[#faf8f3] p-4 rounded-xl border border-stone-200 space-y-2 hover:border-amber-300 transition-all duration-300">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">🎯 Key Innovation</h4>
                <p className="text-stone-600 leading-relaxed">Hybrid RAG retrieval combining vector similarity search with strict metadata constraints (budget + category filtering).</p>
              </div>
            </div>

            <button
              onClick={() => setShowArchModal(false)}
              className="btn-primary w-full py-3 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Fallback Catalog ─────────────── */

const fallbackCatalog: Product[] = [
  {
    id: "prod_1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    category: "Electronics",
    price: 348.0,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    description: "Industry-leading noise cancellation with 30-hour battery life. A worthy investment for daily commuters and frequent flyers.",
    use_cases: ["travel", "work", "focus", "music"],
  },
  {
    id: "prod_2",
    name: "Logitech MX Master 3S Ergonomic Mouse",
    category: "Electronics",
    price: 99.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80",
    description: "Ergonomic wireless mouse with ultra-quiet clicks and MagSpeed scrolling. Pays for itself in productivity gains.",
    use_cases: ["coding", "productivity", "office"],
  },
  {
    id: "prod_3",
    name: "Apple Watch Series 9 GPS 45mm",
    category: "Fitness & Wearables",
    price: 399.0,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80",
    description: "Advanced smartwatch with ECG, blood oxygen monitoring, and crash detection. An investment in your health.",
    use_cases: ["fitness", "running", "health"],
  },
  {
    id: "prod_4",
    name: "Sony Alpha 7 IV Full-Frame Camera",
    category: "Cameras & Photography",
    price: 2498.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
    description: "33MP full-frame sensor with 4K 60p video. A professional tool that can generate income through photography.",
    use_cases: ["photography", "vlogging", "content creation"],
  },
  {
    id: "prod_5",
    name: "JBL Tune 510BT Wireless Headphones",
    category: "Electronics",
    price: 29.95,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=80",
    description: "40-hour battery and JBL Pure Bass for under $30. Unbeatable value — the perfect budget pick.",
    use_cases: ["budget", "music", "student"],
  },
  {
    id: "prod_6",
    name: "Xiaomi Mi Band 8 Fitness Tracker",
    category: "Fitness & Wearables",
    price: 34.99,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=80",
    description: "AMOLED fitness band with 16-day battery. 90% of smartwatch features at 10% of the price.",
    use_cases: ["fitness", "budget", "sleep tracking"],
  },
  {
    id: "prod_7",
    name: "Apple MacBook Air 15\" M3",
    category: "Computers",
    price: 1299.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
    description: "M3 chip, 18-hour battery, Liquid Retina display. A 5-7 year investment that holds resale value.",
    use_cases: ["work", "programming", "video editing"],
  },
  {
    id: "prod_8",
    name: "Instant Pot Duo Plus 9-in-1 Cooker",
    category: "Home & Kitchen",
    price: 89.95,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
    description: "Replaces 9 kitchen appliances. Saves $200+/month on takeout — best ROI kitchen gadget available.",
    use_cases: ["cooking", "meal prep", "kitchen"],
  },
  {
    id: "prod_9",
    name: "Anker Soundcore Life Q20 Headphones",
    category: "Electronics",
    price: 55.99,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80",
    description: "Hybrid ANC with 60-hour playtime. 85% of the Sony XM5 experience at 15% of the cost.",
    use_cases: ["budget", "noise cancellation", "travel"],
  },
  {
    id: "prod_10",
    name: "Canon EOS R50 Mirrorless Camera",
    category: "Cameras & Photography",
    price: 679.0,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop&q=80",
    description: "24.2MP with 4K video and beginner-friendly interface. The perfect entry camera that grows with you.",
    use_cases: ["beginner photography", "vlogging", "youtube"],
  },
  {
    id: "prod_11",
    name: "Dyson V15 Detect Cordless Vacuum",
    category: "Home & Kitchen",
    price: 749.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&auto=format&fit=crop&q=80",
    description: "Laser-equipped cordless vacuum with particle counting. Replaces a $300/year cleaning service.",
    use_cases: ["cleaning", "home", "pet hair"],
  },
  {
    id: "prod_12",
    name: "LG C3 55\" 4K OLED Smart TV",
    category: "Electronics",
    price: 1296.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=80",
    description: "Perfect blacks, infinite contrast, Dolby Vision + Atmos. Replaces cinema trips at $0 per movie night.",
    use_cases: ["movies", "gaming", "home theater"],
  },
];
