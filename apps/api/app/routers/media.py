import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

router = APIRouter(prefix="/api/media", tags=["media"])

MEDIA_DIR = Path(__file__).parent.parent.parent / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
EXTENSION_BY_CONTENT_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.post("/images")
async def upload_product_image(request: Request, file: UploadFile = File(...)):
    """Store an uploaded product image locally and return its URL.

    Product images are optional - this only backs the seller dashboard's
    "upload an image" control on the Products page; products work fine
    without one (see image_url: Optional[str] on ProductIn/ProductUpdate).
    """
    ext = EXTENSION_BY_CONTENT_TYPE.get(file.content_type or "")
    if not ext:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, WEBP or GIF images are supported.",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image is too large (max 5MB).")

    filename = f"{uuid.uuid4().hex}{ext}"
    (MEDIA_DIR / filename).write_bytes(contents)

    return {"url": f"{str(request.base_url).rstrip('/')}/media/{filename}"}
