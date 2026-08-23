"""LangChain/LangGraph structured extraction layer.

DEMO_MODE short-circuits this entirely (see routers/upload.py).
The real implementation uses app.services.ai_service to initialize Mistral
(configured via MISTRAL_MODEL, defaulting to mistral-medium-latest).
"""
from app.core.config import settings
from app.schemas import ExtractionResult
from app.services.ai_service import get_mistral_llm, AIServiceError


def extract_structured(ocr_text: str) -> ExtractionResult:
    """Turn raw OCR text into a validated ExtractionResult.

    Real implementation (Phase 2) sketch:

        llm = get_mistral_llm()
        raw = llm.invoke(EXTRACTION_PROMPT.format(ocr_text=ocr_text))
        candidate = json.loads(raw.content)
        return ExtractionResult.model_validate(candidate)
    """
    if settings.DEMO_MODE:
        raise RuntimeError("extraction_service.extract_structured called while DEMO_MODE=true")
    
    try:
        llm = get_mistral_llm()
    except AIServiceError as e:
        raise NotImplementedError(
            f"Real extraction pipeline not available: {str(e)}"
        )

    raise NotImplementedError(
        "Real extraction pipeline prompt not wired up yet. Set DEMO_MODE=true or implement pipeline."
    )
