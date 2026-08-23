import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Business(Base):
    __tablename__ = "businesses"

    id = Column(String, primary_key=True, default=gen_uuid)
    slug = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # fashion | restaurant | grocery | electronics | general
    phone = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    address = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    template = Column(String, default="general")
    theme = Column(String, default="modern")
    primary_color = Column(String, default="#16151A")
    accent_color = Column(String, default="#D6922E")
    hero_title = Column(String, nullable=True)
    hero_subtitle = Column(String, nullable=True)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    categories = relationship("Category", back_populates="business", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="business", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="business", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=gen_uuid)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)

    business = relationship("Business", back_populates="categories")
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=gen_uuid)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, default="")
    confidence = Column(Float, default=1.0)
    image_url = Column(String, nullable=True)
    stock = Column(Integer, default=100)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="products")
    category = relationship("Category", back_populates="products")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(String, primary_key=True, default=gen_uuid)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, default="")

    business = relationship("Business", back_populates="offers")
