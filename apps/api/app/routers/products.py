from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import get_db
from app.routers.businesses import get_business_by_slug
from app.schemas import ProductIn, ProductOut, ProductUpdate

router = APIRouter(prefix="/api/businesses/{slug}/products", tags=["products"])


def _to_out(p: models.Product) -> dict:
    return {
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


def _get_or_create_category(business: models.Business, name: str, db: Session) -> models.Category:
    existing = db.query(models.Category).filter(
        models.Category.business_id == business.id, models.Category.name == name
    ).first()
    if existing:
        return existing
    cat = models.Category(business_id=business.id, name=name)
    db.add(cat)
    db.flush()
    return cat


def _get_product(business: models.Business, product_id: str, db: Session) -> models.Product:
    product = db.query(models.Product).filter(
        models.Product.id == product_id, models.Product.business_id == business.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductOut)
async def create_product(slug: str, payload: ProductIn, db: Session = Depends(get_db)):
    business = get_business_by_slug(slug, db)
    category = _get_or_create_category(business, payload.category or "Uncategorized", db)
    product = models.Product(
        business_id=business.id,
        category_id=category.id,
        name=payload.name,
        price=payload.price,
        description=payload.description,
        confidence=payload.confidence,
        stock=payload.stock,
        image_url=payload.image_url,
        is_published=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _to_out(product)


@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(slug: str, product_id: str, payload: ProductUpdate, db: Session = Depends(get_db)):
    """Backs the seller dashboard Products page AND the AI store assistant's
    update_price / update_stock / publish_product tools (same mutation path,
    so validation only has to live in one place)."""
    business = get_business_by_slug(slug, db)
    product = _get_product(business, product_id, db)

    data = payload.model_dump(exclude_unset=True)
    category_name = data.pop("category", None)
    data.pop("category_id", None)  # category is resolved by name below, not taken raw from the client

    for field, value in data.items():
        setattr(product, field, value)

    if "image_url" in data:
        product.image_url = data["image_url"]

    if category_name:
        category = _get_or_create_category(business, category_name, db)
        product.category_id = category.id

    db.commit()
    db.refresh(product)
    return _to_out(product)


@router.delete("/{product_id}")
async def delete_product(slug: str, product_id: str, db: Session = Depends(get_db)):
    business = get_business_by_slug(slug, db)
    product = _get_product(business, product_id, db)
    db.delete(product)
    db.commit()
    return {"deleted": True}
