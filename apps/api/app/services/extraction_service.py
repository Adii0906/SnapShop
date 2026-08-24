"""LangChain/Mistral structured extraction layer.

Used only by the real (non-demo) pipeline - see routers/upload.py for how
demo mode vs. the real pipeline is chosen per request. Failures here must
propagate to the caller as ExtractionServiceError; the router turns that
into an error response for the user rather than ever falling back to demo
data.
"""
import logging

from app.schemas import ExtractionCandidate, ExtractionResult, ExtractionStats
from app.services.ai_service import AIServiceError, get_mistral_llm

logger = logging.getLogger(__name__)


class ExtractionServiceError(Exception):
    """Raised when the AI pipeline cannot turn OCR text into structured data."""


EXTRACTION_PROMPT = """You are reading OCR text extracted from a printed pamphlet, \
flyer or menu for a small local business. Identify the business and every \
product/menu item it lists, and call the given function with that data.

Rules:
- Extract every distinct product or menu item you can find, together with its price.
- If a field isn't present in the text, use "" for text fields and 100 for stock.
- Lower "confidence" (e.g. 0.5) for anything you had to guess rather than read directly.
- Prices are plain numbers, no currency symbols.
- Group products under short category names (e.g. "Starters", "Sarees", "Dairy").

OCR TEXT:
{ocr_text}
"""


def extract_structured(ocr_text: str) -> ExtractionResult:
    """Turn raw OCR text into a validated ExtractionResult via Mistral.

    Uses the model's structured-output / tool-calling mode (bound to
    ExtractionCandidate) rather than asking for free-form JSON and
    regex-parsing the response - the provider enforces the schema shape,
    and whatever comes back is still pydantic-validated again here before
    use.
    """
    try:
        llm = get_mistral_llm()
    except AIServiceError as e:
        raise ExtractionServiceError(str(e)) from e

    try:
        structured_llm = llm.with_structured_output(ExtractionCandidate)
        candidate = structured_llm.invoke(EXTRACTION_PROMPT.format(ocr_text=ocr_text))
    except Exception as e:
        raise ExtractionServiceError(f"AI extraction request failed: {e}") from e

    if not isinstance(candidate, ExtractionCandidate):
        try:
            candidate = ExtractionCandidate.model_validate(candidate)
        except Exception as e:
            raise ExtractionServiceError(f"AI output didn't match the expected format: {e}") from e

    # Stats are always recomputed here rather than trusted from the model.
    categories = sorted({p.category for p in candidate.products})
    stats = ExtractionStats(
        products=len(candidate.products),
        categories=len(categories),
        offers=len(candidate.offers),
        businesses=1,
    )

    return ExtractionResult(
        business=candidate.business,
        products=candidate.products,
        offers=candidate.offers,
        stats=stats,
    )
