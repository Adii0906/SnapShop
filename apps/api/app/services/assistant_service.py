"""AI Store Assistant service.

Handles intent parsing and action execution for business stores.
In Phase 2, integrates with Mistral AI via app.services.ai_service.
In DEMO_MODE, uses a lightweight deterministic parser.
"""
import re
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy.orm import Session

from app.db import models
from app.routers.products import _get_or_create_category
from app.services.ai_service import get_mistral_llm, AIServiceError


@dataclass
class ParsedAction:
    tool: str
    params: dict
    summary: str
    needs_confirmation: bool
    matched_products: list = field(default_factory=list)


NUMBER = r"(\d+(?:\.\d+)?)"
PRICE = r"(?:rs\.?|inr|₹)?\s*" + NUMBER


def _find_products(business: models.Business, query: str) -> list[models.Product]:
    """Fuzzy match: an existing category name mentioned anywhere in the query
    wins as a bulk scope; otherwise score products by how many query words their
    name contains."""
    query = query.strip().lower()
    if not query or query in ("all", "everything"):
        return list(business.products)

    for c in business.categories:
        if re.search(r"\b" + re.escape(c.name.lower()) + r"\b", query):
            return [p for p in business.products if p.category_id == c.id]

    stopwords = {"the", "a", "an", "all", "of", "in", "my", "products", "items"}
    words = [w for w in re.findall(r"[a-z0-9]+", query) if w not in stopwords]
    if not words:
        return []

    scored = []
    for p in business.products:
        name = p.name.lower()
        score = sum(1 for w in words if w in name)
        if score > 0:
            scored.append((score, p))
    if not scored:
        return []
    top_score = max(s for s, _ in scored)
    return [p for s, p in scored if s == top_score]


def parse_intent(business: models.Business, message: str) -> Optional[ParsedAction]:
    text = message.strip().lower()

    m = re.search(r"(?:change|set|update)\s+(?:the\s+)?(.+?)\s+price\s+to\s+" + PRICE, text)
    if not m:
        m = re.search(r"price\s+of\s+(.+?)\s+to\s+" + PRICE, text)
    if m:
        query, price = m.group(1), float(m.group(2))
        matches = _find_products(business, query)
        if not matches:
            return None
        if len(matches) == 1:
            p = matches[0]
            return ParsedAction(
                "update_price", {"product_id": p.id, "new_price": price},
                f"Set {p.name} to Rs.{price:.0f}", needs_confirmation=False, matched_products=matches,
            )
        return ParsedAction(
            "bulk_set_price", {"product_ids": [p.id for p in matches], "new_price": price},
            f"Set {len(matches)} products matching \"{query}\" to Rs.{price:.0f}",
            needs_confirmation=True, matched_products=matches,
        )

    m = re.search(r"(?:give|apply)\s+(?:all\s+)?(.+?)\s+(?:a\s+)?" + NUMBER + r"\s*%\s*(?:discount|off)", text)
    if m:
        query, percent = m.group(1), float(m.group(2))
    else:
        m = re.search(NUMBER + r"\s*%\s*(?:discount|off)\s+(?:on|for|to)\s+(?:all\s+)?(.+)", text)
        query, percent = (m.group(2), float(m.group(1))) if m else (None, None)
    if query is not None:
        matches = _find_products(business, query)
        if not matches:
            return None
        return ParsedAction(
            "apply_discount", {"product_ids": [p.id for p in matches], "percent": percent},
            f"Apply {percent:.0f}% off to {len(matches)} product(s) matching \"{query.strip()}\"",
            needs_confirmation=True, matched_products=matches,
        )

    m = re.search(r"(?:set|update|change)\s+stock\s+(?:of|for)\s+(.+?)\s+to\s+" + NUMBER, text)
    if not m:
        m = re.search(r"add\s+" + NUMBER + r"\s+stock\s+to\s+(.+)", text)
        if m:
            qty, query = int(m.group(1)), m.group(2)
            matches = _find_products(business, query)
            if len(matches) == 1:
                p = matches[0]
                return ParsedAction(
                    "update_stock", {"product_id": p.id, "new_stock": p.stock + qty},
                    f"Add {qty} to {p.name}'s stock (now {p.stock + qty})",
                    needs_confirmation=False, matched_products=matches,
                )
            return None
    if m:
        query, stock = m.group(1), int(float(m.group(2)))
        matches = _find_products(business, query)
        if len(matches) == 1:
            p = matches[0]
            return ParsedAction(
                "update_stock", {"product_id": p.id, "new_stock": stock},
                f"Set {p.name} stock to {stock}", needs_confirmation=False, matched_products=matches,
            )
        if len(matches) > 1:
            return ParsedAction(
                "bulk_set_stock", {"product_ids": [p.id for p in matches], "new_stock": stock},
                f"Set stock to {stock} for {len(matches)} products matching \"{query}\"",
                needs_confirmation=True, matched_products=matches,
            )
        return None

    m = re.search(r"(?:delete|remove)\s+(.+)", text)
    if m:
        matches = _find_products(business, m.group(1))
        if not matches:
            return None
        return ParsedAction(
            "delete_products", {"product_ids": [p.id for p in matches]},
            f"Delete {len(matches)} product(s): {', '.join(p.name for p in matches[:5])}"
            + (f" and {len(matches) - 5} more" if len(matches) > 5 else ""),
            needs_confirmation=True, matched_products=matches,
        )

    if re.search(r"^(list|show)\b.*products|^what.*products", text):
        cm = re.search(r"in\s+(.+)", text)
        products = business.products
        if cm:
            products = _find_products(business, cm.group(1)) or products
        names = ", ".join(p.name for p in products[:10])
        return ParsedAction(
            "list_products", {}, f"{len(products)} products: {names}" + (" ..." if len(products) > 10 else ""),
            needs_confirmation=False, matched_products=list(products),
        )

    m = re.search(r"(?:hide|unpublish)\s+(.+)", text)
    if m:
        matches = _find_products(business, m.group(1))
        if not matches:
            return None
        return ParsedAction(
            "bulk_publish", {"product_ids": [p.id for p in matches], "is_published": False},
            f"Hide {len(matches)} product(s) from the storefront", needs_confirmation=len(matches) > 1,
            matched_products=matches,
        )

    m = re.search(r"(?:show|publish)\s+(.+)", text)
    if m:
        matches = _find_products(business, m.group(1))
        if not matches:
            return None
        return ParsedAction(
            "bulk_publish", {"product_ids": [p.id for p in matches], "is_published": True},
            f"Publish {len(matches)} product(s) to the storefront", needs_confirmation=len(matches) > 1,
            matched_products=matches,
        )

    return None


def execute_action(db: Session, business: models.Business, tool: str, params: dict) -> list[models.Product]:
    """Single place for store mutations called by the assistant."""
    touched: list[models.Product] = []

    def _get(pid: str) -> Optional[models.Product]:
        return db.query(models.Product).filter(
            models.Product.id == pid, models.Product.business_id == business.id
        ).first()

    if tool == "update_price":
        p = _get(params["product_id"])
        if p:
            p.price = params["new_price"]
            touched.append(p)
    elif tool == "bulk_set_price":
        for pid in params["product_ids"]:
            p = _get(pid)
            if p:
                p.price = params["new_price"]
                touched.append(p)
    elif tool == "apply_discount":
        pct = params["percent"]
        for pid in params["product_ids"]:
            p = _get(pid)
            if p:
                p.price = round(p.price * (1 - pct / 100), 2)
                touched.append(p)
    elif tool == "update_stock":
        p = _get(params["product_id"])
        if p:
            p.stock = params["new_stock"]
            touched.append(p)
    elif tool == "bulk_set_stock":
        for pid in params["product_ids"]:
            p = _get(pid)
            if p:
                p.stock = params["new_stock"]
                touched.append(p)
    elif tool == "delete_products":
        for pid in params["product_ids"]:
            p = _get(pid)
            if p:
                db.delete(p)
    elif tool == "bulk_publish":
        for pid in params["product_ids"]:
            p = _get(pid)
            if p:
                p.is_published = params["is_published"]
                touched.append(p)
    elif tool == "create_product":
        category = _get_or_create_category(business, params.get("category", "Uncategorized"), db)
        p = models.Product(
            business_id=business.id, category_id=category.id, name=params["name"],
            price=params["price"], stock=params.get("stock", 0), is_published=True,
        )
        db.add(p)
        db.flush()
        touched.append(p)

    db.commit()
    return touched
