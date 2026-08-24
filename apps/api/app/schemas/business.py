from typing import List, Optional
from pydantic import BaseModel

from app.schemas.offer import OfferIn
from app.schemas.product import CategoryOut, ProductIn, ProductOut


class OfferOut(OfferIn):
    id: str

    class Config:
        from_attributes = True


class OfferUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class BusinessOut(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    template: str
    theme: str
    primary_color: str
    accent_color: str
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    is_published: bool

    class Config:
        from_attributes = True


class BusinessDetail(BusinessOut):
    categories: List[CategoryOut] = []
    products: List[ProductOut] = []
    offers: List[OfferOut] = []


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    template: Optional[str] = None
    is_published: Optional[bool] = None


class FinalizeRequest(BaseModel):
    business: "ExtractionBusiness"
    products: List[ProductIn]
    offers: List[OfferIn] = []
    template: str
    theme: str = "modern"
    primary_color: str = "#16151A"
    accent_color: str = "#D6922E"
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None


from app.schemas.extraction import ExtractionBusiness  # noqa: E402
FinalizeRequest.model_rebuild()
