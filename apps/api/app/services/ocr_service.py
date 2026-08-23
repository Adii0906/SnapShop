"""OCR extraction layer.

DEMO_MODE short-circuits this entirely (see routers/upload.py).
Phase 2 integration point: swap in PaddleOCR once requirements.txt is installed.
"""
from app.core.config import settings


def extract_text(image_bytes: bytes) -> str:
    """Run OCR on raw pamphlet image bytes and return raw text.

    Real implementation (Phase 2):

        from paddleocr import PaddleOCR
        import cv2, numpy as np

        _ocr = PaddleOCR(use_angle_cls=True, lang="en")

        def extract_text(image_bytes: bytes) -> str:
            arr = np.frombuffer(image_bytes, dtype=np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            result = _ocr.ocr(img, cls=True)
            lines = [line[1][0] for block in result for line in block]
            return "\n".join(lines)
    """
    if settings.DEMO_MODE:
        raise RuntimeError("ocr_service.extract_text called while DEMO_MODE=true")
    raise NotImplementedError(
        "Real OCR pipeline not wired up yet. Install requirements.txt, "
        "set DEMO_MODE=false, and implement PaddleOCR here."
    )
