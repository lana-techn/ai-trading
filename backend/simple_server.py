#!/usr/bin/env python3
"""
Simple FastAPI server for AI Trading Analysis
Provides mock AI analysis endpoints for testing
"""

import os
import json
import random
import time
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Pydantic models
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

class HealthResponse(BaseModel):
    status: str
    services: Dict[str, str]
    timestamp: str

# Create FastAPI app
app = FastAPI(
    title="AI Trading Agent - Simple Server",
    description="Simple backend for AI trading analysis testing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock analysis data
MOCK_ANALYSES = {
    "BTC-USD": {
        "signals": ["STRONG_BUY", "BUY", "HOLD"],
        "insights": [
            "Strong bullish momentum detected",
            "Volume surge indicates institutional interest", 
            "Breaking above key resistance level",
            "RSI showing oversold conditions",
            "MACD showing bullish crossover"
        ],
        "price_ranges": (40000, 75000)
    },
    "ETH-USD": {
        "signals": ["BUY", "HOLD", "SELL"],
        "insights": [
            "Ethereum 2.0 upgrade momentum",
            "DeFi ecosystem growth supporting price",
            "Smart contract usage increasing",
            "Layer 2 solutions gaining traction"
        ],
        "price_ranges": (2500, 4500)
    },
    "AAPL": {
        "signals": ["BUY", "HOLD", "SELL"],
        "insights": [
            "Strong iPhone sales in Q4",
            "Services revenue growing consistently",
            "AI integration in products showing promise",
            "Strong brand loyalty maintaining margins"
        ],
        "price_ranges": (150, 200)
    },
    "MSFT": {
        "signals": ["BUY", "STRONG_BUY", "HOLD"],
        "insights": [
            "Azure cloud growth exceeding expectations",
            "AI integration across products accelerating",
            "Office 365 subscription growth steady",
            "Strong enterprise customer retention"
        ],
        "price_ranges": (350, 450)
    }
}

def generate_mock_analysis(symbol: str) -> AnalysisResponse:
    """Generate realistic mock analysis for a symbol"""
    
    # Get symbol config or use default
    symbol_upper = symbol.upper()
    config = MOCK_ANALYSES.get(symbol_upper, {
        "signals": ["HOLD", "BUY", "SELL"],
        "insights": [
            "Technical analysis showing mixed signals",
            "Market sentiment appears neutral",
            "Volume levels are moderate"
        ],
        "price_ranges": (50, 150)
    })
    
    # Randomly select signal and confidence
    signal = random.choice(config["signals"])
    confidence = round(random.uniform(0.65, 0.95), 2)
    
    # Generate insights
    selected_insights = random.sample(
        config["insights"], 
        k=min(3, len(config["insights"]))
    )
    
    # Generate price targets based on signal
    current_price = random.uniform(*config["price_ranges"])
    
    if signal in ["STRONG_BUY", "BUY"]:
        price_target = current_price * random.uniform(1.05, 1.20)
        stop_loss = current_price * random.uniform(0.90, 0.95)
        risk_assessment = "Low to moderate risk with strong upside potential"
        reasoning = f"Based on technical analysis, {symbol} shows strong bullish indicators with {confidence*100:.0f}% confidence. Key factors include positive momentum, strong fundamentals, and favorable market conditions."
    elif signal == "HOLD":
        price_target = current_price * random.uniform(0.98, 1.08)
        stop_loss = current_price * random.uniform(0.92, 0.96)
        risk_assessment = "Moderate risk with balanced risk-reward ratio"
        reasoning = f"Analysis suggests {symbol} is fairly valued with mixed signals. Recommending hold position with {confidence*100:.0f}% confidence until clearer trend emerges."
    else:  # SELL or STRONG_SELL
        price_target = current_price * random.uniform(0.80, 0.95)
        stop_loss = current_price * random.uniform(1.02, 1.08)
        risk_assessment = "Elevated risk with potential for further downside"
        reasoning = f"Technical analysis indicates bearish pressure for {symbol}. With {confidence*100:.0f}% confidence, suggest reducing exposure due to weakening fundamentals and negative momentum."
    
    return AnalysisResponse(
        symbol=symbol_upper,
        signal=signal,
        confidence=confidence,
        reasoning=reasoning,
        key_insights=selected_insights,
        risk_assessment=risk_assessment,
        price_target=round(price_target, 2),
        stop_loss=round(stop_loss, 2),
        timestamp=datetime.now()
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Trading Agent Simple Server",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "analyze": "/api/ai/analyze/{symbol}",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        services={
            "hybrid_ai": "operational",
            "market_data": "operational", 
            "websocket": "operational",
            "database": "operational"
        },
        timestamp=datetime.now().isoformat()
    )

@app.post("/api/ai/analyze/{symbol}", response_model=AnalysisResponse)
async def analyze_symbol(symbol: str):
    """
    Analyze a trading symbol using AI
    Returns mock analysis for testing purposes
    """
    try:
        print(f"Received analysis request for {symbol}")
        
        # Simulate AI processing time
        await asyncio.sleep(random.uniform(1.0, 2.5))
        
        # Generate mock analysis
        analysis = generate_mock_analysis(symbol)
        
        print(f"Generated analysis for {symbol}: {analysis.signal} ({analysis.confidence:.2f} confidence)")
        
        return analysis
        
    except Exception as e:
        print(f"Error analyzing {symbol}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed for {symbol}: {str(e)}"
        )

@app.get("/api/ai/analyze/{symbol}", response_model=AnalysisResponse)
async def get_analysis(symbol: str):
    """Get analysis via GET request (alternative endpoint)"""
    return await analyze_symbol(symbol)

# Add asyncio import for sleep function
import asyncio

if __name__ == "__main__":
    print("🚀 Starting AI Trading Agent Simple Server...")
    print("📊 Mock AI analysis endpoints available")
    print("🌐 Server will run on http://localhost:8000")
    print("📚 API docs available at http://localhost:8000/docs")
    
    uvicorn.run(
        "simple_server:app",
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )