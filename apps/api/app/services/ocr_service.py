"""OCR extraction layer, backed by PaddleOCR.

Used only by the real (non-demo) pipeline - see routers/upload.py for how
demo mode vs. the real pipeline is chosen per request. Failures here must
propagate to the caller as OCRServiceError; the router turns that into an
error response for the user rather than ever falling back to demo data.
"""
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)


class OCRServiceError(Exception):
    """Raised when OCR cannot produce usable text from the uploaded image."""


_engine_lock = threading.Lock()
_engine: Optional[object] = None


def _get_engine():
    global _engine
    if _engine is not None:
        return _engine
    with _engine_lock:
        if _engine is None:
            try:
                from paddleocr import PaddleOCR
            except ImportError as e:
                raise OCRServiceError(
                    "PaddleOCR is not installed. Install requirements.txt "
                    "(paddleocr, paddlepaddle, opencv-python-headless) to use "
                    "the real OCR pipeline, or turn on Demo Mode."
                ) from e
            _engine = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    return _engine


def extract_text(image_bytes: bytes) -> str:
    """Run PaddleOCR on raw pamphlet image bytes and return the raw text.

    Raises OCRServiceError if the bytes can't be decoded as an image, or if
    PaddleOCR finds no readable text.
    """
    try:
        import cv2
        import numpy as np
    except ImportError as e:
        raise OCRServiceError(
            "opencv-python-headless is not installed. Install requirements.txt "
            "to use the real OCR pipeline, or turn on Demo Mode."
        ) from e

    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise OCRServiceError(
            "Could not read the uploaded file as an image. Upload a JPG, PNG "
            "or WEBP photo of the pamphlet (PDF pages aren't supported yet)."
        )

    engine = _get_engine()
    try:
        result = engine.ocr(img, cls=True)
    except Exception as e:
        raise OCRServiceError(f"PaddleOCR failed to process the image: {e}") from e

    lines = [line[1][0] for block in (result or []) if block for line in block]
    text = "\n".join(lines).strip()
    if not text:
        raise OCRServiceError(
            "PaddleOCR could not find any readable text in this image. Try a "
            "clearer, well-lit photo of the pamphlet."
        )
    return text
