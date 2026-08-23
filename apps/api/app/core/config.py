import os
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    # Default to local SQLite if DATABASE_URL is not set or commented out
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./dev.db",
    )
    
    # AI configuration
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    MISTRAL_MODEL: str = os.getenv("MISTRAL_MODEL", "mistral-medium-latest")
    
    # Optional / disabled integrations
    LLAMA_API_KEY: Optional[str] = os.getenv("LLAMA_API_KEY", None)
    LANGSMITH_API_KEY: Optional[str] = os.getenv("LANGSMITH_API_KEY", None)
    LANGSMITH_PROJECT: str = os.getenv("LANGSMITH_PROJECT", "snapshop")
    LANGCHAIN_TRACING_V2: bool = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]


settings = Settings()
