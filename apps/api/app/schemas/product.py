from typing import Optional
from pydantic import BaseModel


class ProductIn(BaseModel):
    name: str
    price: float
    description: str = ""
    confidence: float = 1.0
    category: str = "Uncategorized"
    stock: int = 100
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[str] = None  # category name - resolved/created server-side
    stock: Optional[int] = None
    is_published: Optional[bool] = None
    image_url: Optional[str] = None


class ProductOut(BaseModel):
    id: str
    business_id: str
    name: str
    price: float
    description: str = ""
    confidence: float = 1.0
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    stock: int = 100
    is_published: bool = True
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True
