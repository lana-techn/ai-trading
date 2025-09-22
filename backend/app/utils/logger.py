"""
Structured logging utility for the AI Trading Agent.
Provides compliance-ready audit trails and performance monitoring.
"""

import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict, Optional
from loguru import logger as loguru_logger
from app.core.config import settings


class AuditLogger:
    """Structured audit logger for compliance and debugging."""
    
    def __init__(self):
        self._setup_loguru()
    
    def _setup_loguru(self):
        """Configure loguru logger with structured output."""
        
        # Remove default handler
        loguru_logger.remove()
        
        # Add custom handler with JSON format for production
        if not settings.DEBUG:
            loguru_logger.add(
                sys.stdout,
                format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{line} | {message}",
                level=settings.LOG_LEVEL,
                serialize=True,  # JSON output
                backtrace=True,
                diagnose=True
            )
        else:
            # Human-readable format for development
            loguru_logger.add(
                sys.stdout,
                format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
                level=settings.LOG_LEVEL,
                colorize=True
            )
        
        # Add file logging for audit trails
        if settings.ENABLE_AI_DECISION_LOGGING:
            loguru_logger.add(
                "logs/audit_{time:YYYY-MM-DD}.log",
                format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{line} | {message}",
                level="INFO",
                rotation="1 day",
                retention=f"{settings.AUDIT_LOG_RETENTION_DAYS} days",
                compression="gz",
                serialize=True
            )
    
    def log_ai_decision(
        self, 
        user_id: Optional[int], 
        symbol: str, 
        decision: Dict[str, Any],
        model_info: Dict[str, Any],
        execution_time_ms: float
    ):
        """Log AI trading decision for compliance audit."""
        
        audit_entry = {
            "event_type": "ai_decision",
            "user_id": user_id,
            "symbol": symbol,
            "timestamp": datetime.utcnow().isoformat(),
            "decision": {
                "action": decision.get("action"),
                "confidence": decision.get("confidence"),
                "risk_level": decision.get("risk_level"),
                "models_used": decision.get("models_used", [])
            },
            "model_info": model_info,
            "execution_time_ms": execution_time_ms,
            "compliance": {
                "human_oversight_required": decision.get("risk_level") == "high",
                "logged_for_audit": True
            }
        }
        
        loguru_logger.bind(audit=True).info(
            "AI Decision Logged", 
            **audit_entry
        )
    
    def log_trade_execution(
        self, 
        user_id: int, 
        trade_data: Dict[str, Any],
        ai_decision_id: Optional[int] = None
    ):
        """Log trade execution for audit trail."""
        
        audit_entry = {
            "event_type": "trade_execution",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "trade": {
                "symbol": trade_data.get("symbol"),
                "side": trade_data.get("side"),
                "quantity": trade_data.get("quantity"),
                "price": trade_data.get("entry_price"),
                "is_paper_trade": trade_data.get("is_paper_trade", True)
            },
            "ai_decision_id": ai_decision_id,
            "compliance": {
                "paper_trading": trade_data.get("is_paper_trade", True),
                "risk_checked": True
            }
        }
        
        loguru_logger.bind(audit=True).info(
            "Trade Execution Logged", 
            **audit_entry
        )
    
    def log_security_event(
        self, 
        event_type: str, 
        user_id: Optional[int],
        ip_address: Optional[str],
        details: Dict[str, Any]
    ):
        """Log security-related events."""
        
        security_entry = {
            "event_type": "security_event",
            "security_event_type": event_type,
            "user_id": user_id,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details
        }
        
        loguru_logger.bind(security=True).warning(
            f"Security Event: {event_type}",
            **security_entry
        )
    
    def log_performance_metrics(
        self, 
        endpoint: str, 
        duration_ms: float,
        status_code: int,
        user_id: Optional[int] = None
    ):
        """Log API performance metrics."""
        
        perf_entry = {
            "event_type": "performance",
            "endpoint": endpoint,
            "duration_ms": duration_ms,
            "status_code": status_code,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Log as warning if slow
        if duration_ms > 5000:  # 5 seconds
            loguru_logger.bind(performance=True).warning(
                f"Slow API Response: {endpoint}",
                **perf_entry
            )
        else:
            loguru_logger.bind(performance=True).info(
                f"API Response: {endpoint}",
                **perf_entry
            )


# Global audit logger
audit_logger = AuditLogger()


def get_logger(name: str) -> Any:
    """Get a logger instance with the specified name."""
    return loguru_logger.bind(logger_name=name)


def log_startup_info():
    """Log application startup information."""
    startup_info = {
        "event_type": "startup",
        "timestamp": datetime.utcnow().isoformat(),
        "config": {
            "debug": settings.DEBUG,
            "environment": "development" if settings.DEBUG else "production",
            "ai_features": {
                "hybrid_ai_enabled": settings.ENABLE_HYBRID_AI,
                "sentiment_analysis": settings.ENABLE_SENTIMENT_ANALYSIS,
                "technical_analysis": settings.ENABLE_TECHNICAL_ANALYSIS
            },
            "security": {
                "paper_trading": settings.PAPER_TRADING,
                "rate_limiting": True,
                "audit_logging": settings.ENABLE_AI_DECISION_LOGGING
            }
        }
    }
    
    loguru_logger.info("Application Startup", **startup_info)


def log_error_with_context(
    error: Exception, 
    context: Dict[str, Any],
    user_id: Optional[int] = None
):
    """Log errors with full context for debugging."""
    
    error_entry = {
        "event_type": "error",
        "error_type": type(error).__name__,
        "error_message": str(error),
        "user_id": user_id,
        "context": context,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    loguru_logger.bind(error=True).error(
        f"Application Error: {error_entry['error_type']}",
        **error_entry
    )