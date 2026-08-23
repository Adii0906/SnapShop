from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.schemas import ExtractionResult
from app.services.seed_service import all_demo_slugs, load_demo_extraction
from app.services import extraction_service, ocr_service

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=ExtractionResult)
async def upload_pamphlet(
    file: Optional[UploadFile] = File(None),
    demo_business: Optional[str] = Form(None),
):
    """Step 3/4 of the flow: upload a pamphlet, get back structured data.

    DEMO_MODE=true (default): ignores the actual file bytes and returns a
    seeded extraction result so the full flow works with zero external
    API calls. Pass demo_business as one of: royal-fashion, spice-corner,
    freshmart. Defaults to royal-fashion if omitted.

    DEMO_MODE=false: runs the real OCR + LangChain/LangGraph pipeline
    (see services/ocr_service.py and services/extraction_service.py).
    """
    if settings.DEMO_MODE:
        slug = demo_business or "royal-fashion"
        result = load_demo_extraction(slug)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown demo_business '{slug}'. Options: {all_demo_slugs()}",
            )
        return result

    if not file:
        raise HTTPException(status_code=400, detail="file is required when DEMO_MODE=false")
    contents = await file.read()
    ocr_text = ocr_service.extract_text(contents)
    return extraction_service.extract_structured(ocr_text)


@router.get("/upload/demo-businesses")
async def demo_businesses():
    return {"slugs": all_demo_slugs()}
