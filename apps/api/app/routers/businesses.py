import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.schemas import BusinessDetail, BusinessOut, BusinessUpdate, FinalizeRequest, OfferIn, OfferUpdate
from app.services.template_service import generate_store_config

router = APIRouter(prefix="/api/businesses", tags=["businesses"])


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "store"


def unique_slug(db: Session, base: str) -> str:
    slug = base
    i = 2
    while db.query(models.Business).filter(models.Business.slug == slug).first():
        slug = f"{base}-{i}"
        i += 1
    return slug


def get_business_by_slug(slug: str, db: Session) -> models.Business:
    business = db.query(models.Business).filter(models.Business.slug == slug).first()
    if not business:
        raise HTTPException(status_code=404, detail="Store not found")
    return business


def _to_detail(business: models.Business) -> dict:
    return {
        "id": business.id,
        "slug": business.slug,
        "name": business.name,
        "category": business.category,
        "phone": business.phone,
        "whatsapp": business.whatsapp,
        "address": business.address,
        "description": business.description,
        "logo_url": business.logo_url,
        "banner_url": business.banner_url,
        "template": business.template,
        "theme": business.theme,
        "primary_color": business.primary_color,
        "accent_color": business.accent_color,
        "hero_title": business.hero_title,
        "hero_subtitle": business.hero_subtitle,
        "is_published": business.is_published,
        "categories": [{"id": c.id, "name": c.name} for c in business.categories],
        "offers": [{"id": o.id, "title": o.title, "description": o.description} for o in business.offers],
        "products": [
            {
                "id": p.id,
                "business_id": p.business_id,
                "name": p.name,
                "price": p.price,
                "description": p.description,
                "confidence": p.confidence,
                "category_id": p.category_id,
                "category_name": p.category.name if p.category else None,
                "stock": p.stock,
                "is_published": p.is_published,
                "image_url": p.image_url,
            }
            for p in business.products
        ],
    }


@router.post("", response_model=BusinessDetail)
async def finalize_business(payload: FinalizeRequest, db: Session = Depends(get_db)):
    """Steps 6/7 of the flow: template confirmed -> generate the AI store
    config -> persist the business, its categories, products and offers.
    Everything before this point (upload -> review) lives in frontend
    state only, so nothing half-approved ever lands in the database.
    """
    store_config = generate_store_config(payload.business.category, payload.template, payload.business.name)

    business = models.Business(
        slug=unique_slug(db, slugify(payload.business.name)),
        name=payload.business.name,
        category=payload.business.category,
        phone=payload.business.phone,
        whatsapp=payload.business.whatsapp,
        address=payload.business.address,
        description=payload.business.description,
        template=payload.template,
        theme=payload.theme or store_config["theme"],
        primary_color=payload.primary_color or store_config["primaryColor"],
        accent_color=payload.accent_color or store_config["accentColor"],
        hero_title=payload.hero_title or store_config["heroTitle"],
        hero_subtitle=payload.hero_subtitle or store_config["heroSubtitle"],
        is_published=True,
    )
    db.add(business)
    db.flush()

    category_map: dict[str, models.Category] = {}
    for p in payload.products:
        if p.category not in category_map:
            cat = models.Category(business_id=business.id, name=p.category)
            db.add(cat)
            db.flush()
            category_map[p.category] = cat
        db.add(
            models.Product(
                business_id=business.id,
                category_id=category_map[p.category].id,
                name=p.name,
                price=p.price,
                description=p.description,
                confidence=p.confidence,
                stock=p.stock,
                image_url=getattr(p, "image_url", None),
                is_published=True,
            )
        )

    for o in payload.offers:
        db.add(models.Offer(business_id=business.id, title=o.title, description=o.description))

    db.commit()
    db.refresh(business)
    return _to_detail(business)


@router.get("", response_model=list[BusinessOut])
async def list_businesses(db: Session = Depends(get_db)):
    return db.query(models.Business).order_by(models.Business.created_at.desc()).all()


@router.get("/{slug}", response_model=BusinessDetail)
async def get_business(slug: str, db: Session = Depends(get_db)):
    business = get_business_by_slug(slug, db)
    return _to_detail(business)


@router.patch("/{slug}", response_model=BusinessDetail)
async def update_business(slug: str, payload: BusinessUpdate, db: Session = Depends(get_db)):
    """Step 9: seller dashboard store customization."""
    business = get_business_by_slug(slug, db)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(business, field, value)
    db.commit()
    db.refresh(business)
    return _to_detail(business)


@router.post("/{slug}/offers", response_model=BusinessDetail)
async def add_offer(slug: str, payload: OfferIn, db: Session = Depends(get_db)):
    business = get_business_by_slug(slug, db)
    db.add(models.Offer(business_id=business.id, title=payload.title, description=payload.description))
    db.commit()
    db.refresh(business)
    return _to_detail(business)


@router.patch("/{slug}/offers/{offer_id}", response_model=BusinessDetail)
async def update_offer(slug: str, offer_id: str, payload: OfferUpdate, db: Session = Depends(get_db)):
    business = get_business_by_slug(slug, db)
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id, models.Offer.business_id == business.id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(offer, field, value)
    db.commit()
    db.refresh(business)
    return _to_detail(business)


@router.delete("/{slug}/offers/{offer_id}", response_model=BusinessDetail)
async def delete_offer(slug: str, offer_id: str, db: Session = Depends(get_db)):
    business = get_business_by_slug(slug, db)
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id, models.Offer.business_id == business.id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    db.delete(offer)
    db.commit()
    db.refresh(business)
    return _to_detail(business)
