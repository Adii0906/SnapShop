"""Isolated AI Service Provider layer.

Manages LLM provider configuration and initialization (Mistral AI).
Reads MISTRAL_MODEL (defaults to mistral-medium-latest) and MISTRAL_API_KEY from settings.
Provides a clean abstraction layer so model/provider details are isolated from API routers.
"""
import logging
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """Base exception for AI Service errors."""
    pass


def get_mistral_model_name() -> str:
    """Return configured Mistral model name."""
    return settings.MISTRAL_MODEL or "mistral-medium-latest"


def get_mistral_llm(model: Optional[str] = None) -> Any:
    """Instantiate and return a ChatMistralAI model instance.
    Raises AIServiceError if API key is not configured.
    """
    if not settings.MISTRAL_API_KEY:
        raise AIServiceError(
            "MISTRAL_API_KEY is not set in environment. "
            "Please configure MISTRAL_API_KEY in .env or set DEMO_MODE=true."
        )

    model_name = model or get_mistral_model_name()
    try:
        from langchain_mistralai import ChatMistralAI
        return ChatMistralAI(
            model=model_name,
            api_key=settings.MISTRAL_API_KEY,
        )
    except ImportError:
        raise AIServiceError(
            "langchain-mistralai package is not installed. "
            "Install requirements.txt to use real LLM features."
        )


def get_active_llm() -> Any:
    """Get the primary active LLM instance (Mistral by default)."""
    return get_mistral_llm()
