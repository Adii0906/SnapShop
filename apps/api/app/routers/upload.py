from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.schemas import ExtractionResult
from app.services import extraction_service, ocr_service
from app.services.extraction_service import ExtractionServiceError
from app.services.ocr_service import OCRServiceError
from app.services.seed_service import all_demo_slugs, load_demo_extraction

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=ExtractionResult)
async def upload_pamphlet(
    file: Optional[UploadFile] = File(None),
    demo_business: Optional[str] = Form(None),
    demo_mode: Optional[bool] = Form(None),
):
    """Step 3/4 of the flow: upload a pamphlet, get back structured data.

    Demo Mode is an explicit, per-request choice made by the user in the
    UI via the `demo_mode` field - it is never inferred or silently
    applied. `settings.DEMO_MODE` only supplies the default when a caller
    omits `demo_mode` entirely (e.g. a manual API request).

    demo_mode=true: ignores any uploaded file and returns seeded sample
    data for `demo_business` (one of: royal-fashion, spice-corner,
    freshmart - defaults to royal-fashion).

    demo_mode=false: runs the real pipeline - PaddleOCR reads the
    uploaded file (see services/ocr_service.py), then the Mistral-backed
    extraction service (see services/extraction_service.py) turns that
    text into structured business/product data. Any failure in that
    pipeline is raised as an error response; it never falls back to demo
    data.
    """
    use_demo = settings.DEMO_MODE if demo_mode is None else demo_mode

    if use_demo:
        slug = demo_business or "royal-fashion"
        result = load_demo_extraction(slug)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown demo_business '{slug}'. Options: {all_demo_slugs()}",
            )
        return result

    if not file:
        raise HTTPException(
            status_code=400,
            detail="A pamphlet file is required when Demo Mode is off.",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        ocr_text = ocr_service.extract_text(contents)
    except OCRServiceError as e:
        raise HTTPException(status_code=422, detail=f"OCR failed: {e}") from e

    try:
        return extraction_service.extract_structured(ocr_text)
    except ExtractionServiceError as e:
        raise HTTPException(status_code=502, detail=f"AI extraction failed: {e}") from e


@router.get("/upload/demo-businesses")
async def demo_businesses():
    return {"slugs": all_demo_slugs()}
