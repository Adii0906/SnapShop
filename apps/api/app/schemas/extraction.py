from typing import List
from pydantic import BaseModel

from app.schemas.offer import OfferIn
from app.schemas.product import ProductIn


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


class ExtractionCandidate(BaseModel):
    """What the AI is actually asked to produce - no `stats`, since those
    are always recomputed server-side from `products`/`offers` rather than
    trusted from the model (see extraction_service.extract_structured)."""

    business: ExtractionBusiness
    products: List[ProductIn]
    offers: List[OfferIn] = []
