from pydantic import BaseModel
from typing import Optional


class CustomerIntent(BaseModel):
    intent: str
    category: Optional[str] = None
    budget: Optional[float] = None
    use_case: Optional[str] = None