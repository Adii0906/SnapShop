from typing import List, Optional
from pydantic import BaseModel

from app.schemas.product import ProductOut


class AssistantAction(BaseModel):
    tool: str
    params: dict
    summary: str


class AssistantChatRequest(BaseModel):
    message: Optional[str] = None
    confirm: Optional[AssistantAction] = None


class AssistantChatResponse(BaseModel):
    reply: str
    pending: Optional[AssistantAction] = None
    products: List[ProductOut] = []
