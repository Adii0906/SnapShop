import json
from pathlib import Path

SEED_DIR = Path(__file__).parent.parent / "seed_data"

DEMO_SLUGS = {
    "royal-fashion": "royal_fashion.json",
    "spice-corner": "spice_corner.json",
    "freshmart": "freshmart.json",
}


def _load_raw(slug: str) -> dict | None:
    filename = DEMO_SLUGS.get(slug)
    if not filename:
        return None
    path = SEED_DIR / filename
    if not path.exists():
        return None
    return json.loads(path.read_text())


def load_demo_extraction(slug: str) -> dict | None:
    """Shape a seed_data JSON file into the ExtractionResult contract
    (business / products / offers / stats) returned by POST /upload.
    """
    raw = _load_raw(slug)
    if not raw:
        return None
    products = raw["products"]
    categories = sorted({p["category"] for p in products})
    return {
        "business": raw["business"],
        "products": products,
        "offers": raw.get("offers", []),
        "stats": {
            "products": len(products),
            "categories": len(categories),
            "offers": len(raw.get("offers", [])),
            "businesses": 1,
        },
    }


def all_demo_slugs() -> list[str]:
    return list(DEMO_SLUGS.keys())
