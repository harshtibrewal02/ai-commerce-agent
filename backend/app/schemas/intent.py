from pydantic import BaseModel
from typing import Optional, List, Any

class CustomerIntent(BaseModel):
    intent: str
    category: Optional[str] = None
    budget: Optional[float] = None
    use_case: Optional[str] = None

class ProductItem(BaseModel):
    id: str
    name: str
    category: str
    price: float
    rating: float
    image: str
    description: str
    use_cases: List[str]

class RAGSearchResponse(BaseModel):
    query: str
    intent: CustomerIntent
    products: List[ProductItem]
    ai_recommendation: Optional[str] = None