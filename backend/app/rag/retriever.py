from typing import Optional, List, Dict, Any
from app.rag.vector_store import collection, get_all_products_from_store

def search_products(
    query: str, 
    category: Optional[str] = None, 
    max_budget: Optional[float] = None, 
    top_k: int = 6
) -> List[Dict[str, Any]]:
    """
    Performs hybrid retrieval: ChromaDB vector search + hard metadata filtering (category, budget).
    Returns up to top_k relevant items.
    """
    where_filter = {}
    filters = []

    if category:
        filters.append({"category": {"$eq": category}})
    if max_budget and max_budget > 0:
        filters.append({"price": {"$lte": max_budget}})

    if len(filters) == 1:
        where_filter = filters[0]
    elif len(filters) > 1:
        where_filter = {"$and": filters}

    try:
        query_args = {
            "query_texts": [query],
            "n_results": top_k
        }
        if where_filter:
            query_args["where"] = where_filter

        results = collection.query(**query_args)
        
        if results and results.get("metadatas") and len(results["metadatas"][0]) > 0:
            formatted = []
            for meta in results["metadatas"][0]:
                meta_copy = dict(meta)
                if isinstance(meta_copy.get("use_cases"), str):
                    meta_copy["use_cases"] = [u.strip() for u in meta_copy["use_cases"].split(",")]
                formatted.append(meta_copy)
            return formatted
    except Exception as e:
        print(f"Vector search warning: {e}")

    # Comprehensive fallback search across all product fields
    all_prods = get_all_products_from_store()
    matched = []
    query_lower = query.lower().strip()
    q_words = [w for w in query_lower.split() if len(w) > 2]

    for prod in all_prods:
        if category and prod["category"].lower() != category.lower():
            continue
        if max_budget and prod["price"] > max_budget:
            continue

        prod_text = f"{prod['name']} {prod['category']} {prod['description']} {' '.join(prod['use_cases'])}".lower()
        
        # Check direct substring or word overlap
        if not query_lower or query_lower in prod_text or any(w in prod_text for w in q_words):
            matched.append(prod)

    return matched[:top_k] if matched else all_prods[:top_k]