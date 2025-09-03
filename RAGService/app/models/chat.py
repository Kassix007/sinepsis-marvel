from typing import Optional, List
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    query: str = Field(..., description="User question / prompt")
    document_id: Optional[str] = None

class Source(BaseModel):
    title: Optional[str] = None
    id: Optional[str] = None
    url: Optional[str] = None
    score: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = []
