"""OCR extraction layer, backed by Tesseract (via pytesseract).

Used only by the real (non-demo) pipeline - see routers/upload.py for how
demo mode vs. the real pipeline is chosen per request. Failures here must
propagate to the caller as OCRServiceError; the router turns that into an
error response for the user rather than ever falling back to demo data.

Switched from PaddleOCR: PaddleOCR doesn't need a GPU either (this app
always ran it with use_gpu=False), but its deep-learning-framework
dependency (paddlepaddle) and multi-model pipeline made CPU inference on
a modest deploy host slow (~2 minutes per image even after tuning - see
git history). Tesseract is a much lighter, mature CPU-native OCR engine -
no model downloads, near-instant startup, and comparable accuracy on
printed pamphlet text.

Requires the `tesseract-ocr` system binary to be installed - pytesseract
is a thin wrapper that shells out to it, it does not bundle Tesseract
itself. See apps/api/Dockerfile, which installs it explicitly (Render's
native/non-Docker Python runtime has no reliable way to install system
packages, which is why this app now deploys as a container).
"""
import logging
import shutil
from io import BytesIO

logger = logging.getLogger(__name__)


class OCRServiceError(Exception):
    """Raised when OCR cannot produce usable text from the uploaded image."""


# Phone cameras commonly shoot 3000-4000px on the long side. Tesseract's
# accuracy doesn't benefit from resolutions that high on printed text, and
# downscaling keeps each request's CPU cost down on a modest deploy host.
_MAX_IMAGE_DIMENSION = 1600


def _downscale_if_needed(image, Image, max_dimension: int = _MAX_IMAGE_DIMENSION):
    longest_side = max(image.size)
    if longest_side <= max_dimension:
        return image
    scale = max_dimension / longest_side
    new_size = (round(image.width * scale), round(image.height * scale))
    return image.resize(new_size, Image.LANCZOS)


def _require_tesseract_binary() -> None:
    if shutil.which("tesseract") is None:
        raise OCRServiceError(
            "The tesseract-ocr system binary is not installed on this host. "
            "pytesseract only wraps it - it must be installed separately at "
            "the OS level (see apps/api/Dockerfile), not just pip-installed. "
            "Turn on Demo Mode to use the app without it."
        )


def warmup() -> None:
    """Best-effort: confirm Tesseract is actually reachable at startup, so a
    missing system dependency shows up in the deploy logs immediately
    instead of on a user's first real upload. Never raises - a failed
    check here just means the same error surfaces on the first real
    request instead, which is still a correct (if later) failure mode.
    """
    try:
        _require_tesseract_binary()
        import pytesseract

        pytesseract.get_tesseract_version()
    except Exception:
        logger.warning("Tesseract warmup check failed; will re-check on first real upload", exc_info=True)


def extract_text(image_bytes: bytes) -> str:
    """Run Tesseract OCR on raw pamphlet image bytes and return the raw text.

    Raises OCRServiceError if the bytes can't be decoded as an image, if
    Tesseract isn't available on this host, or if it finds no readable
    text.
    """
    try:
        from PIL import Image
    except ImportError as e:
        raise OCRServiceError(
            f"Pillow could not be imported ({e}). Install requirements.txt "
            "to use the real OCR pipeline, or turn on Demo Mode."
        ) from e

    try:
        image = Image.open(BytesIO(image_bytes))
        image.load()  # force full decode now, so a corrupt file fails here with a clear error
    except Exception as e:
        raise OCRServiceError(
            "Could not read the uploaded file as an image. Upload a JPG, PNG "
            "or WEBP photo of the pamphlet (PDF pages aren't supported yet)."
        ) from e

    image = image.convert("RGB")
    image = _downscale_if_needed(image, Image)

    _require_tesseract_binary()
    try:
        import pytesseract

        text = pytesseract.image_to_string(image)
    except OCRServiceError:
        raise
    except Exception as e:
        raise OCRServiceError(f"Tesseract failed to process the image: {e}") from e

    text = text.strip()
    if not text:
        raise OCRServiceError(
            "Tesseract could not find any readable text in this image. Try "
            "a clearer, well-lit photo of the pamphlet."
        )
    return text
