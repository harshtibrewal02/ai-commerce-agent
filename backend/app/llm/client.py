import os
import json
import re
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        client = None

def ask_llm(message: str) -> str:
    """
    Analyzes customer input to extract intent, category, budget, and use case.
    """
    if client:
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": """
                        You are an AI e-commerce intent parser.
                        Analyze the customer request and output ONLY valid JSON matching:
                        {
                            "intent": "product_search" | "general_inquiry" | "budget_recommendation",
                            "category": "Electronics" | "Computers" | "Monitors" | "Accessories" | "Home & Kitchen" | "Fitness & Wearables" | "Cameras & Photography" | "Personal Care" | null,
                            "budget": float or null,
                            "use_case": string or null
                        }
                        """
                    },
                    {"role": "user", "content": message}
                ],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
        except Exception:
            pass

    # Resilient fallback parser if LLM key is not provided or fails
    budget_match = re.search(r'(?:under|\$|less than|max|budget|around)\s*\$?(\d+(?:\.\d+)?)', message, re.IGNORECASE)
    budget = float(budget_match.group(1)) if budget_match else None

    category = None
    msg_lower = message.lower()
    if any(w in msg_lower for w in ["headphone", "audio", "mouse", "keyboard", "speaker"]):
        category = "Electronics"
    elif any(w in msg_lower for w in ["laptop", "macbook", "computer", "pc", "tablet", "ipad"]):
        category = "Computers"
    elif any(w in msg_lower for w in ["monitor", "display", "screen"]):
        category = "Monitors"
    elif any(w in msg_lower for w in ["power bank", "charger", "power", "light bar", "lamp"]):
        category = "Accessories"
    elif any(w in msg_lower for w in ["coffee", "espresso", "kitchen", "cooker", "instant pot"]):
        category = "Home & Kitchen"
    elif any(w in msg_lower for w in ["watch", "fitness", "workout", "massage", "theragun"]):
        category = "Fitness & Wearables"
    elif any(w in msg_lower for w in ["camera", "photo", "vlog", "sony alpha", "lens"]):
        category = "Cameras & Photography"
    elif any(w in msg_lower for w in ["toothbrush", "sonicare", "dental", "hygiene"]):
        category = "Personal Care"

    use_case = None
    if "code" in msg_lower or "program" in msg_lower or "work" in msg_lower:
        use_case = "work & productivity"
    elif "travel" in msg_lower or "flight" in msg_lower:
        use_case = "travel"
    elif "gift" in msg_lower:
        use_case = "gifts"
    elif "fit" in msg_lower or "health" in msg_lower:
        use_case = "fitness"

    return json.dumps({
        "intent": "product_search",
        "category": category,
        "budget": budget,
        "use_case": use_case
    })


def generate_recommendation_summary(query: str, products: list) -> str:
    """Generates a human-friendly AI recommendation pitch for the matched products."""
    if not products:
        return f"I couldn't find any products matching '{query}'. Try adjusting your search query or budget."
    
    first_prod = products[0]
    return f"Based on your query '{query}', I recommend the **{first_prod.get('name')}** (${first_prod.get('price')}). It matches your primary use case with a high customer rating of {first_prod.get('rating')}/5.0."