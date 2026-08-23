from fastapi import APIRouter

from app.schemas import TemplateOut
from app.services.template_service import TEMPLATES, recommend_template

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[TemplateOut])
async def list_templates():
    return TEMPLATES


@router.get("/recommend")
async def recommend(category: str):
    template_id = recommend_template(category)
    match = next(t for t in TEMPLATES if t["id"] == template_id)
    return {"recommended": template_id, "template": match}
