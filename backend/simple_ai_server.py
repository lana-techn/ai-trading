"""
Simple FastAPI server untuk testing AI Analysis endpoints
"""

import os
import sys
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Set environment variables if not exists
if not os.getenv('GEMINI_API_KEY'):
    os.environ['GEMINI_API_KEY'] = 'AIzaSyBipHWt4HXD9M121H1yEt-HhglDM9rove4'
if not os.getenv('ALPHA_VANTAGE_KEY'):
    os.environ['ALPHA_VANTAGE_KEY'] = '8QPO03XZ0NPPQU99'

from api.ai_analysis import router as ai_analysis_router

app = FastAPI(title="AI Trading Analysis Server", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI analysis router
app.include_router(ai_analysis_router)

@app.get("/")
async def root():
    return {
        "message": "AI Trading Analysis Server",
        "status": "operational",
        "endpoints": {
            "analyze_symbol": "POST /api/ai/analyze/{symbol}",
            "health_check": "GET /api/ai/health",
            "signals_summary": "GET /api/ai/signals/summary"
        }
    }

@app.get("/health")
async def simple_health():
    return {"status": "healthy", "service": "ai-analysis"}

if __name__ == "__main__":
    print("🚀 Starting AI Trading Analysis Server...")
    print("📊 Endpoints available:")
    print("   - POST /api/ai/analyze/{symbol}")
    print("   - GET /api/ai/health") 
    print("   - GET /api/ai/signals/summary")
    print("🌐 Server running on: http://localhost:8000")
    
    uvicorn.run(
        "simple_ai_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )