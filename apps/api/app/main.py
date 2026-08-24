import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.tracing import setup_tracing
from app.db import models  # Ensures models are imported before create_all
from app.db.database import Base, engine
from app.routers import assistant, businesses, media, products, templates, upload
from app.routers.media import MEDIA_DIR

logger = logging.getLogger(__name__)

# Initialize tracing conditionally if configured
setup_tracing()

app = FastAPI(
    title="SnapShop",
    version="0.1.0",
    description="SnapShop backend service",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """FastAPI's default 422 body is a list of {loc, msg, type} dicts -
    useful in logs, but opaque if shown to a user directly. Log the raw
    detail server-side and respond with one readable string instead, so
    the frontend's generic `detail` string handling works for this case
    the same way it does for every other error in the app."""
    logger.warning(
        "Request validation failed for %s %s: %s",
        request.method,
        request.url.path,
        exc.errors(),
    )
    messages = []
    for err in exc.errors():
        loc = ".".join(str(part) for part in err.get("loc", ()) if part != "body")
        msg = err.get("msg", "Invalid value")
        messages.append(f"{loc}: {msg}" if loc else msg)
    return JSONResponse(
        status_code=422,
        content={"detail": "; ".join(messages) or "Invalid request."},
    )


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# Register API routers
app.include_router(upload.router)
app.include_router(templates.router)
app.include_router(businesses.router)
app.include_router(products.router)
app.include_router(assistant.router)
app.include_router(media.router)


@app.get("/")
async def root():
    return {
        "service": "snapshop",
        "demo_mode": settings.DEMO_MODE,
        "mistral_model": settings.MISTRAL_MODEL,
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
