from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.tracing import setup_tracing
from app.db import models  # Ensures models are imported before create_all
from app.db.database import Base, engine
from app.routers import assistant, businesses, media, products, templates, upload
from app.routers.media import MEDIA_DIR

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
