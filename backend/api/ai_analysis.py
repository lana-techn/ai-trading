"""
API endpoints for AI Trading Analysis
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Optional
import logging
from datetime import datetime
import asyncio

from services.ai_analysis import get_ai_analyzer, AIAnalysis, TradingSignal
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Analysis"])

# Request/Response Models
class AnalysisRequest(BaseModel):
    symbol: str
    timeframe: Optional[str] = "5min"

class MultiAnalysisRequest(BaseModel):
    symbols: List[str]
    timeframe: Optional[str] = "5min"

class AnalysisResponse(BaseModel):
    symbol: str
    signal: str
    confidence: float
    reasoning: str
    key_insights: List[str]
    risk_assessment: str
    price_target: Optional[float] = None
    stop_loss: Optional[float] = None
    timestamp: datetime
    status: str = "success"

class ErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: datetime
    status: str = "error"

# Cache for storing recent analyses (simple in-memory cache)
analysis_cache: Dict[str, AnalysisResponse] = {}
CACHE_DURATION = 300  # 5 minutes

@router.post("/analyze/{symbol}", response_model=AnalysisResponse)
async def analyze_symbol(symbol: str, request: Optional[AnalysisRequest] = None):
    """
    Analyze a single trading symbol using AI
    """
    try:
        symbol = symbol.upper()
        logger.info(f"Received AI analysis request for {symbol}")
        
        # Check cache first
        cache_key = f"{symbol}_{datetime.now().strftime('%Y%m%d_%H%M')}"
        if cache_key in analysis_cache:
            logger.info(f"Returning cached analysis for {symbol}")
            return analysis_cache[cache_key]
        
        # Get AI analyzer
        analyzer = get_ai_analyzer()
        
        # Perform analysis
        analysis = await analyzer.analyze_symbol(symbol)
        
        if not analysis:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze {symbol}. Please check if symbol is valid and try again."
            )
        
        # Convert to response model
        response = AnalysisResponse(
            symbol=symbol,
            signal=analysis.signal.value,
            confidence=analysis.confidence,
            reasoning=analysis.reasoning,
            key_insights=analysis.key_insights,
            risk_assessment=analysis.risk_assessment,
            price_target=analysis.price_target,
            stop_loss=analysis.stop_loss,
            timestamp=analysis.timestamp
        )
        
        # Cache the result
        analysis_cache[cache_key] = response
        
        logger.info(f"AI analysis completed for {symbol}: {analysis.signal.value}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI analysis for {symbol}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error during analysis: {str(e)}"
        )

@router.post("/analyze-multiple", response_model=Dict[str, AnalysisResponse])
async def analyze_multiple_symbols(request: MultiAnalysisRequest):
    """
    Analyze multiple trading symbols concurrently
    """
    try:
        symbols = [s.upper() for s in request.symbols]
        logger.info(f"Received multiple AI analysis request for: {symbols}")
        
        if len(symbols) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 symbols allowed per request"
            )
        
        # Get AI analyzer
        analyzer = get_ai_analyzer()
        
        # Perform concurrent analysis
        analyses = await analyzer.get_multiple_analysis(symbols)
        
        # Convert to response format
        responses = {}
        for symbol, analysis in analyses.items():
            responses[symbol] = AnalysisResponse(
                symbol=symbol,
                signal=analysis.signal.value,
                confidence=analysis.confidence,
                reasoning=analysis.reasoning,
                key_insights=analysis.key_insights,
                risk_assessment=analysis.risk_assessment,
                price_target=analysis.price_target,
                stop_loss=analysis.stop_loss,
                timestamp=analysis.timestamp
            )
        
        logger.info(f"Multiple AI analysis completed for {len(responses)} symbols")
        return responses
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in multiple AI analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error during multiple analysis: {str(e)}"
        )

@router.get("/analysis/{symbol}/latest", response_model=AnalysisResponse)
async def get_latest_analysis(symbol: str):
    """
    Get the latest cached analysis for a symbol
    """
    try:
        symbol = symbol.upper()
        
        # Look for recent cached analysis
        current_time = datetime.now()
        for key, analysis in analysis_cache.items():
            if symbol in key:
                # Check if analysis is recent (within cache duration)
                time_diff = (current_time - analysis.timestamp).total_seconds()
                if time_diff <= CACHE_DURATION:
                    logger.info(f"Returning latest cached analysis for {symbol}")
                    return analysis
        
        raise HTTPException(
            status_code=404,
            detail=f"No recent analysis found for {symbol}. Please request a new analysis."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting latest analysis for {symbol}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check for AI analysis service
    """
    try:
        analyzer = get_ai_analyzer()
        return {
            "status": "healthy",
            "ai_service": "operational",
            "timestamp": datetime.now(),
            "cache_size": len(analysis_cache)
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now()
        }

@router.get("/signals/summary")
async def get_signals_summary():
    """
    Get summary of recent trading signals
    """
    try:
        if not analysis_cache:
            return {
                "total_analyses": 0,
                "signals": {},
                "message": "No recent analyses available"
            }
        
        # Count signals
        signal_counts = {}
        total_confidence = 0
        
        for analysis in analysis_cache.values():
            signal = analysis.signal
            signal_counts[signal] = signal_counts.get(signal, 0) + 1
            total_confidence += analysis.confidence
        
        avg_confidence = total_confidence / len(analysis_cache) if analysis_cache else 0
        
        return {
            "total_analyses": len(analysis_cache),
            "signals": signal_counts,
            "average_confidence": round(avg_confidence, 2),
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error getting signals summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )

@router.delete("/cache/clear")
async def clear_analysis_cache():
    """
    Clear the analysis cache (admin endpoint)
    """
    try:
        cache_size = len(analysis_cache)
        analysis_cache.clear()
        
        logger.info(f"Analysis cache cleared. Removed {cache_size} entries")
        
        return {
            "status": "success",
            "message": f"Cache cleared. Removed {cache_size} entries",
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )