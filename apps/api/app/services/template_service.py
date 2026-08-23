TEMPLATES = [
    {"id": "fashion", "name": "Modern Fashion", "description": "Editorial grid with bold imagery, built for apparel and accessories."},
    {"id": "restaurant", "name": "Restaurant", "description": "Menu-first layout organised by course, built for food and drink."},
    {"id": "grocery", "name": "Grocery", "description": "Dense scannable grid for high SKU counts and repeat orders."},
    {"id": "electronics", "name": "Electronics", "description": "Spec-forward cards suited to comparison shopping."},
    {"id": "general", "name": "General Store", "description": "Flexible catalog layout that fits any category mix."},
]

_RECOMMEND_MAP = {
    "fashion": "fashion",
    "restaurant": "restaurant",
    "grocery": "grocery",
    "electronics": "electronics",
}

_THEME_MAP = {
    "fashion": {"heroTitle": "Premium Men's Fashion", "heroSubtitle": "New Collection Available", "primaryColor": "#16151A", "accentColor": "#D6922E"},
    "restaurant": {"heroTitle": "Authentic Flavours, Made Fresh", "heroSubtitle": "Order online for pickup or delivery", "primaryColor": "#241A14", "accentColor": "#C2571F"},
    "grocery": {"heroTitle": "Daily Essentials, Delivered Fresh", "heroSubtitle": "Everything your kitchen needs", "primaryColor": "#14201B", "accentColor": "#3E8B5C"},
    "electronics": {"heroTitle": "Tech That Just Works", "heroSubtitle": "Latest gadgets at honest prices", "primaryColor": "#12141C", "accentColor": "#3B6FD6"},
    "general": {"heroTitle": "Everything You Need, In One Store", "heroSubtitle": "Shop the full catalog online", "primaryColor": "#16151A", "accentColor": "#D6922E"},
}


def recommend_template(category: str) -> str:
    return _RECOMMEND_MAP.get(category, "general")


def get_template(template_id: str) -> dict | None:
    return next((t for t in TEMPLATES if t["id"] == template_id), None)


def generate_store_config(business_category: str, template_id: str, business_name: str) -> dict:
    """AI Store Configuration (spec Step 7). In DEMO_MODE this is a lookup;
    Phase 2 can route this through an LLM call for copy that's tailored to
    the actual extracted business name/category instead of a static map.
    """
    base = _THEME_MAP.get(template_id, _THEME_MAP["general"]).copy()
    return {
        "template": template_id,
        "theme": "modern",
        "primaryColor": base["primaryColor"],
        "accentColor": base["accentColor"],
        "heroTitle": base["heroTitle"],
        "heroSubtitle": base["heroSubtitle"],
    }
