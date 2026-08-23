import os
import logging

logger = logging.getLogger(__name__)


def setup_tracing() -> None:
    """Tracing disabled for lightweight testing with standard LangChain + Mistral AI."""
    os.environ["LANGCHAIN_TRACING_V2"] = "false"
