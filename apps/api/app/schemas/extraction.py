from typing import List
from pydantic import BaseModel

from app.schemas.product import ProductIn


class OfferIn(BaseModel):
    title: str
    description: str = ""


class ExtractionStats(BaseModel):
    products: int
    categories: int
    offers: int
    businesses: int = 1


class ExtractionBusiness(BaseModel):
    name: str
    category: str
    phone: str = ""
    whatsapp: str = ""
    address: str = ""
    description: str = ""


class ExtractionResult(BaseModel):
    business: ExtractionBusiness
    products: List[ProductIn]
    offers: List[OfferIn] = []
    stats: ExtractionStats
