"""
Configuration management for the AI Trading Agent backend.
Handles environment variables and application settings.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional, Union
import os


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Trading Agent"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-powered trading platform with hybrid analysis"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Database
    DATABASE_URL: Optional[str] = "postgresql://user:password@localhost/traderai"
    
    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL: int = 300  # 5 minutes
    
    # AI Configuration
    GEMINI_API_KEY: Optional[str] = None
    QWEN_MODEL_PATH: str = "Qwen/Qwen2.5-Coder-32B-Instruct"  # Or local path
    USE_LOCAL_QWEN: bool = False  # Set True for local inference
    
    # Data Sources
    ALPHA_VANTAGE_KEY: Optional[str] = None
    TWELVE_DATA_KEY: Optional[str] = None
    
    # Trading Configuration
    DEFAULT_RISK_LEVEL: float = 0.02  # 2% risk per trade
    MAX_CONCURRENT_TRADES: int = 5
    PAPER_TRADING: bool = True  # Start with paper trading
    
    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 25
    WS_HEARTBEAT_TIMEOUT: int = 60
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100
    
    # Compliance and Logging
    LOG_LEVEL: str = "INFO"
    AUDIT_LOG_RETENTION_DAYS: int = 365
    ENABLE_AI_DECISION_LOGGING: bool = True
    
    # Feature Flags
    ENABLE_HYBRID_AI: bool = True
    ENABLE_SENTIMENT_ANALYSIS: bool = True
    ENABLE_TECHNICAL_ANALYSIS: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_database_url() -> str:
    """Get formatted database URL."""
    if settings.DATABASE_URL:
        return settings.DATABASE_URL
    return "postgresql://traderai:password@localhost/traderai"


def is_development() -> bool:
    """Check if running in development mode."""
    return settings.DEBUG or settings.ENVIRONMENT == "development"


def get_ai_config() -> dict:
    """Get AI configuration dictionary."""
    return {
        "gemini_api_key": settings.GEMINI_API_KEY,
        "qwen_model_path": settings.QWEN_MODEL_PATH,
        "use_local_qwen": settings.USE_LOCAL_QWEN,
        "enable_hybrid_ai": settings.ENABLE_HYBRID_AI,
        "enable_sentiment_analysis": settings.ENABLE_SENTIMENT_ANALYSIS,
        "enable_technical_analysis": settings.ENABLE_TECHNICAL_ANALYSIS,
    }


def get_cors_origins() -> List[str]:
    """Get CORS origins based on environment."""
    if is_development():
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",  # Additional dev ports
        ]
    
    origins = settings.BACKEND_CORS_ORIGINS
    if isinstance(origins, str):
        return [origin.strip() for origin in origins.split(",") if origin.strip()]
    return origins or []
