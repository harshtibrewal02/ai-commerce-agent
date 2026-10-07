import os
import json
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(name="products")

def load_products():
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")
    if not os.path.exists(json_path):
        return

    with open(json_path, "r", encoding="utf-8") as file:
        products = json.load(file)

    for product in products:
        text = (
            f"{product['name']}. "
            f"Category: {product['category']}. "
            f"Price: ${product['price']}. "
            f"{product['description']}. "
            f"Use cases: {', '.join(product['use_cases'])}."
        )

        metadata = {
            "id": product["id"],
            "name": product["name"],
            "category": product["category"],
            "price": float(product["price"]),
            "rating": float(product["rating"]),
            "image": product["image"],
            "description": product["description"],
            "use_cases": ", ".join(product["use_cases"])
        }

        # Simplified dummy embedding for fast deterministic loading if sentence_transformers is building
        # Chroma handles embeddings internally if None provided, or we can use custom embeddings
        collection.upsert(
            ids=[product["id"]],
            documents=[text],
            metadatas=[metadata]
        )

def get_all_products_from_store():
    results = collection.get()
    if not results or not results.get("metadatas"):
        return []
    
    formatted = []
    for meta in results["metadatas"]:
        meta_copy = dict(meta)
        if isinstance(meta_copy.get("use_cases"), str):
            meta_copy["use_cases"] = [u.strip() for u in meta_copy["use_cases"].split(",")]
        formatted.append(meta_copy)
    return formatted