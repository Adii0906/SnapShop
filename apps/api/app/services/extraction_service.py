"""LangChain/Mistral structured extraction layer.

Used only by the real (non-demo) pipeline - see routers/upload.py for how
demo mode vs. the real pipeline is chosen per request. Failures here must
propagate to the caller as ExtractionServiceError; the router turns that
into an error response for the user rather than ever falling back to demo
data.
"""
import json
import logging
import re

from app.schemas import ExtractionResult
from app.services.ai_service import AIServiceError, get_mistral_llm

logger = logging.getLogger(__name__)


class ExtractionServiceError(Exception):
    """Raised when the AI pipeline cannot turn OCR text into structured data."""


EXTRACTION_PROMPT = """You are reading OCR text extracted from a printed pamphlet, \
flyer or menu for a small local business. Turn it into structured JSON.

Return ONLY a single JSON object (no prose, no markdown fences) with this shape:
{{
  "business": {{
    "name": string,
    "category": string,
    "phone": string,
    "whatsapp": string,
    "address": string,
    "description": string
  }},
  "products": [
    {{
      "name": string,
      "price": number,
      "description": string,
      "confidence": number between 0 and 1,
      "category": string,
      "stock": integer
    }}
  ],
  "offers": [
    {{ "title": string, "description": string }}
  ]
}}

Rules:
- Extract every distinct product or menu item you can find, together with its price.
- If a field isn't present in the text, use "" for text fields and 100 for stock.
- Lower "confidence" (e.g. 0.5) for anything you had to guess rather than read directly.
- Prices are plain numbers, no currency symbols.
- Group products under short category names (e.g. "Starters", "Sarees", "Dairy").

OCR TEXT:
{ocr_text}
"""


def _parse_json_object(raw: str) -> dict:
    match = re.search(r"\{.*\}", raw.strip(), re.DOTALL)
    if not match:
        raise ExtractionServiceError("The AI model did not return valid JSON.")
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError as e:
        raise ExtractionServiceError(f"The AI model returned malformed JSON: {e}") from e


def extract_structured(ocr_text: str) -> ExtractionResult:
    """Turn raw OCR text into a validated ExtractionResult via Mistral."""
    try:
        llm = get_mistral_llm()
    except AIServiceError as e:
        raise ExtractionServiceError(str(e)) from e

    try:
        response = llm.invoke(EXTRACTION_PROMPT.format(ocr_text=ocr_text))
    except Exception as e:
        raise ExtractionServiceError(f"AI extraction request failed: {e}") from e

    content = getattr(response, "content", response)
    candidate = _parse_json_object(content if isinstance(content, str) else str(content))

    products = candidate.get("products") or []
    offers = candidate.get("offers") or []
    categories = sorted({p.get("category", "Uncategorized") for p in products})
    candidate["offers"] = offers
    candidate["stats"] = {
        "products": len(products),
        "categories": len(categories),
        "offers": len(offers),
        "businesses": 1,
    }

    try:
        return ExtractionResult.model_validate(candidate)
    except Exception as e:
        raise ExtractionServiceError(f"AI output didn't match the expected format: {e}") from e
