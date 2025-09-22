"""
Main FastAPI application for AI Trading Agent.
Provides REST API endpoints for hybrid AI trading analysis.
"""

import time
import json
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware  
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Internal imports
from app.core.config import settings, get_cors_origins
from app.services.ai.hybrid_ai import hybrid_ai
from app.services.ai.chat_ai import chat_ai
from app.services.data.market_data import market_data_service
from app.services.websocket.websocket_manager import (
    connection_manager, handle_websocket_message, startup_websocket, shutdown_websocket
)
from app.utils.logger import get_logger, log_startup_info, audit_logger

logger = get_logger(__name__)


# Pydantic models for API requests/responses
class AnalysisRequest(BaseModel):
    """Request model for AI analysis."""
    symbol: str = Field(..., description="Trading symbol (e.g., BTC-USD, AAPL)")
    timeframe: str = Field("1d", description="Data timeframe (1m, 5m, 1h, 1d)")
    include_chart: bool = Field(True, description="Include visual chart analysis")


class AnalysisResponse(BaseModel):
    """Response model for AI analysis."""
    success: bool
    symbol: str
    action: str
    confidence: float
    reasoning: str
    risk_level: str
    models_used: List[str]
    technical_indicators: Dict[str, Any]
    qwen_analysis: Optional[Dict[str, Any]] = None
    gemini_analysis: Optional[Dict[str, Any]] = None
    risk_assessment: Optional[Dict[str, Any]] = None
    timestamp: str
    execution_time_ms: float


class MarketDataResponse(BaseModel):
    """Response model for market data."""
    success: bool
    symbol: str
    data_points: int
    timeframe: str
    latest_price: float
    data_source: str
    timestamp: str


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    version: str
    timestamp: str
    services: Dict[str, str]


# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    
    # Startup
    logger.info("Starting AI Trading Agent API...")
    log_startup_info()
    
    # Initialize database
    try:
        from app.core.database import startup_database
        await startup_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Initialize services
    try:
        await hybrid_ai.initialize()
        await market_data_service.initialize()
        await chat_ai.initialize()
        await startup_websocket()
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Trading Agent API...")
    try:
        await market_data_service.close()
        await shutdown_websocket()
        
        from app.core.database import shutdown_database
        await shutdown_database()
        
        logger.info("Services closed successfully")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
)


# Middleware for request logging and performance monitoring
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and measure performance."""
    
    start_time = time.time()
    
    # Call the actual endpoint
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Log performance metrics
    audit_logger.log_performance_metrics(
        endpoint=str(request.url.path),
        duration_ms=duration_ms,
        status_code=response.status_code,
        user_id=None  # TODO: Extract from JWT when auth is implemented
    )
    
    # Add performance headers
    response.headers["X-Process-Time"] = str(duration_ms)
    
    return response


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with structured logging."""
    
    logger.error(
        f"HTTP Exception: {exc.status_code} - {exc.detail}",
        endpoint=str(request.url.path),
        status_code=exc.status_code
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": time.time()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions with full context logging."""
    
    context = {
        "endpoint": str(request.url.path),
        "method": request.method,
        "query_params": dict(request.query_params),
    }
    
    from app.utils.logger import log_error_with_context
    log_error_with_context(exc, context)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": time.time()
        }
    )


# API Routes
@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with basic API information."""
    return {
        "message": "AI Trading Agent API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "operational"
    }


@app.get(f"{settings.API_V1_STR}/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring."""
    
    # Import database manager
    from app.core.database import db_manager
    
    # Check database health
    db_health = await db_manager.health_check()
    redis_health = await db_manager.redis_health_check()
    
    # Check service status
    services = {
        "hybrid_ai": "operational" if hybrid_ai._initialized else "not_initialized",
        "market_data": "operational" if market_data_service._initialized else "not_initialized", 
        "database": db_health.get("status", "unknown"),
        "redis": redis_health.get("status", "unknown")
    }
    
    # Determine overall status
    critical_services = ["hybrid_ai", "market_data", "database"]
    overall_status = "healthy"
    
    for service in critical_services:
        if services[service] in ["unhealthy", "unknown"]:
            overall_status = "degraded"
            break
        elif services[service] == "not_initialized":
            overall_status = "starting"
    
    return HealthResponse(
        status=overall_status,
        version=settings.VERSION,
        timestamp=time.time(),
        services=services
    )


@app.post(f"{settings.API_V1_STR}/analyze", response_model=AnalysisResponse)
async def analyze_symbol(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Perform hybrid AI analysis on a trading symbol.
    
    This endpoint combines Qwen (quantitative) and Gemini (visual) analysis
    to provide comprehensive trading recommendations.
    """
    
    start_time = time.time()
    
    try:
        logger.info(f"Starting analysis for {request.symbol}")
        
        # Perform hybrid AI analysis
        analysis_result = await hybrid_ai.analyze_symbol(
            symbol=request.symbol,
            timeframe=request.timeframe,
            include_chart=request.include_chart
        )
        
        if not analysis_result:
            raise HTTPException(
                status_code=400, 
                detail=f"Unable to analyze symbol {request.symbol}"
            )
        
        # Calculate execution time
        execution_time = (time.time() - start_time) * 1000
        
        # Log AI decision for audit (background task)
        background_tasks.add_task(
            audit_logger.log_ai_decision,
            user_id=None,  # TODO: Get from JWT
            symbol=request.symbol,
            decision=analysis_result,
            model_info={
                "models_used": analysis_result.get("models_used", []),
                "timeframe": request.timeframe,
                "include_chart": request.include_chart
            },
            execution_time_ms=execution_time
        )
        
        # Build response
        response = AnalysisResponse(
            success=True,
            symbol=analysis_result.get("symbol", request.symbol),
            action=analysis_result.get("action", "hold"),
            confidence=analysis_result.get("confidence", 0.0),
            reasoning=analysis_result.get("reasoning", ""),
            risk_level=analysis_result.get("risk_level", "unknown"),
            models_used=analysis_result.get("models_used", []),
            technical_indicators=analysis_result.get("technical_indicators", {}),
            qwen_analysis=analysis_result.get("qwen_analysis"),
            gemini_analysis=analysis_result.get("gemini_analysis"),
            risk_assessment=analysis_result.get("risk_assessment"),
            timestamp=analysis_result.get("timestamp", ""),
            execution_time_ms=execution_time
        )
        
        logger.info(f"Analysis completed for {request.symbol}: {response.action} (confidence: {response.confidence:.2f})")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed for {request.symbol}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )


@app.get(f"{settings.API_V1_STR}/market-data/{{symbol}}", response_model=MarketDataResponse)
async def get_market_data(
    symbol: str, 
    timeframe: str = "1d", 
    limit: int = 100
):
    """
    Fetch market data for a trading symbol.
    
    Supports multiple data sources including yfinance, CCXT, and Alpha Vantage.
    """
    
    try:
        logger.info(f"Fetching market data for {symbol}")
        
        # Fetch market data
        data = await market_data_service.get_market_data(
            symbol=symbol, 
            timeframe=timeframe, 
            limit=limit
        )
        
        if data.empty:
            raise HTTPException(
                status_code=404, 
                detail=f"No market data found for symbol {symbol}"
            )
        
        # Determine data source
        data_source = market_data_service._determine_data_source(symbol)
        
        response = MarketDataResponse(
            success=True,
            symbol=symbol,
            data_points=len(data),
            timeframe=timeframe,
            latest_price=float(data['close'].iloc[-1]),
            data_source=data_source,
            timestamp=time.time()
        )
        
        logger.info(f"Market data fetched for {symbol}: {response.data_points} points from {data_source}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Market data fetch failed for {symbol}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Market data fetch failed: {str(e)}"
        )


@app.get(f"{settings.API_V1_STR}/price/{{symbol}}")
async def get_real_time_price(symbol: str):
    """Get real-time price data for a symbol."""
    
    try:
        price_data = await market_data_service.get_real_time_price(symbol)
        
        if not price_data:
            raise HTTPException(
                status_code=404, 
                detail=f"Price data not available for {symbol}"
            )
        
        return {
            "success": True,
            **price_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Real-time price fetch failed for {symbol}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Price fetch failed: {str(e)}"
        )


@app.get(f"{settings.API_V1_STR}/symbols")
async def get_supported_symbols():
    """Get list of supported trading symbols."""
    
    # Popular symbols by category
    symbols = {
        "crypto": [
            "BTC-USD", "ETH-USD", "ADA-USD", "SOL-USD", "DOGE-USD",
            "DOT-USD", "AVAX-USD", "MATIC-USD", "LINK-USD", "UNI-USD"
        ],
        "forex": [
            "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD",
            "USDCAD", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY"
        ],
        "stocks": [
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
            "NVDA", "META", "NFLX", "ADBE", "CRM"
        ]
    }
    
    return {
        "success": True,
        "symbols": symbols,
        "total_count": sum(len(category) for category in symbols.values()),
        "timestamp": time.time()
    }


@app.post(f"{settings.API_V1_STR}/chat")
async def chat_with_ai(request: Dict[str, str]):
    """
    Chat with AI trading assistant.
    
    Provides conversational AI interface for trading questions and analysis.
    """
    
    message = request.get("message", "")
    session_id = request.get("session_id", "default")
    
    if not message:
        raise HTTPException(
            status_code=400, 
            detail="Message is required"
        )
    
    try:
        response = await chat_ai.process_message(
            message=message,
            session_id=session_id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat message"
        )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time price feeds and updates."""
    await connection_manager.connect(websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle the message
            await handle_websocket_message(websocket, message)
            
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connection_manager.disconnect(websocket)


@app.get(f"{settings.API_V1_STR}/websocket/stats")
async def websocket_stats():
    """Get WebSocket connection statistics."""
    stats = connection_manager.get_stats()
    return {
        "success": True,
        "data": stats,
        "timestamp": time.time()
    }


# Development server
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
