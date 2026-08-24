"""OCR extraction layer, backed by PaddleOCR.

Used only by the real (non-demo) pipeline - see routers/upload.py for how
demo mode vs. the real pipeline is chosen per request. Failures here must
propagate to the caller as OCRServiceError; the router turns that into an
error response for the user rather than ever falling back to demo data.

PaddleOCR's constructor and result shape changed between the legacy 2.x
API (`use_angle_cls`, `show_log`, `.ocr()`) and the 3.x pipeline API
(`use_textline_orientation`, `.predict()`). Both are handled here so this
works regardless of which major version ends up installed.
"""
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)


class OCRServiceError(Exception):
    """Raised when OCR cannot produce usable text from the uploaded image."""


_engine_lock = threading.Lock()
_engine: Optional[object] = None

# Tried newest-to-oldest constructor signature, and with oneDNN disabled
# before enabled. `enable_mkldnn=False` matters on its own: PaddlePaddle's
# oneDNN-accelerated CPU kernels can hit "ConvertPirAttribute2RuntimeAttribute
# not support [...]" on some op/attribute combinations (a PaddlePaddle
# PIR-executor bug, not anything under this app's control) - disabling
# oneDNN runs the same model through plain CPU kernels instead and avoids
# that failure class entirely, at a small speed cost.
_CONSTRUCTOR_KWARGS = [
    {"lang": "en", "use_textline_orientation": True, "enable_mkldnn": False},
    {"lang": "en", "use_angle_cls": True, "enable_mkldnn": False},
    {"lang": "en", "enable_mkldnn": False},
    {"lang": "en", "use_textline_orientation": True},
    {"lang": "en", "use_angle_cls": True},
    {"lang": "en"},
]


def _construct_engine(PaddleOCR):
    last_error: Optional[Exception] = None
    for kwargs in _CONSTRUCTOR_KWARGS:
        try:
            return PaddleOCR(**kwargs)
        except (TypeError, ValueError) as e:
            last_error = e
            continue
    raise OCRServiceError(f"Failed to initialize PaddleOCR: {last_error}") from last_error


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
            _engine = _construct_engine(PaddleOCR)
    return _engine


def _run_ocr(engine, img) -> list[str]:
    """Return recognized text lines, supporting both the 3.x `.predict()`
    pipeline API and the legacy 2.x `.ocr()` API."""
    if hasattr(engine, "predict"):
        results = engine.predict(img)
        lines: list[str] = []
        for res in results:
            texts = res.get("rec_texts") if hasattr(res, "get") else getattr(res, "rec_texts", None)
            if texts:
                lines.extend(t for t in texts if t)
        return lines

    result = engine.ocr(img, cls=True)
    return [line[1][0] for block in (result or []) if block for line in block]


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
        lines = _run_ocr(engine, img)
    except OCRServiceError:
        raise
    except Exception as e:
        raise OCRServiceError(f"PaddleOCR failed to process the image: {e}") from e

    text = "\n".join(lines).strip()
    if not text:
        raise OCRServiceError(
            "PaddleOCR could not find any readable text in this image. Try a "
            "clearer, well-lit photo of the pamphlet."
        )
    return text
