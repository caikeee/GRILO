"""
🔧 Configuration Management with Environment Validation (QW5)
Ensures all required environment variables are present at startup
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Environment variables and configuration.
    Validation happens automatically - if missing vars, FastAPI crashes with clear error.
    """
    
    # Database
    database_url: str = "sqlite:///./grilo.db"
    
    # API Keys
    groq_api_key: str  # Required - crash if missing
    groq_transcription_api_key: Optional[str] = None
    elevenlabs_api_key: Optional[str] = None
    secret_key: str  # Required - crash if missing
    
    # Models
    model_name: str = "llama-3.3-70b-versatile"
    
    # Server Configuration
    host: str = "127.0.0.1"
    port: int = 8000
    reload: bool = False
    debug: bool = False
    
    # CORS Configuration
    cors_origins: str = "http://localhost:3000,http://localhost:8080"  # CSV format
    
    # Rate Limiting
    rate_limit_calls: int = 20  # requests per minute
    rate_limit_period: int = 60  # seconds
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CSV CORS origins"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Load settings on startup - will crash if required vars missing
settings = Settings()


def validate_settings():
    """Validate critical settings on startup"""
    if not settings.groq_api_key:
        raise ValueError("❌ GROQ_API_KEY not set in .env")
    if not settings.secret_key:
        raise ValueError("❌ SECRET_KEY not set in .env")
    if len(settings.secret_key) < 32:
        raise ValueError("❌ SECRET_KEY must be at least 32 characters")


__all__ = ["settings", "validate_settings"]
