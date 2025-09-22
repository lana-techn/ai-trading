#!/usr/bin/env python3
"""
Minimal FastAPI server for testing AI Chat functionality
"""

import os
import time
from datetime import datetime
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# Environment setup
os.environ["GEMINI_API_KEY"] = "AIzaSyBipHWt4HXD9M121H1yEt-HhglDM9rove4"

# Initialize Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# FastAPI app
app = FastAPI(
    title="AI Trading Chat (Minimal)",
    description="Minimal server for testing AI chat functionality",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    success: bool
    response: str
    intent: Dict[str, Any] = {}
    suggestions: list = []
    timestamp: str

# Routes
@app.get("/")
async def root():
    return {"message": "AI Trading Chat Server", "status": "online"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/v1/chat")
async def chat_with_ai(request: ChatRequest) -> ChatResponse:
    """Chat with AI trading assistant"""
    
    try:
        # Create trading-focused prompt with better formatting
        prompt = f"""
You are an expert AI trading assistant. The user is asking: "{request.message}"

Provide a helpful, informative response that:
1. Is educational and practical
2. Relates to trading, markets, or investing
3. Emphasizes risk management if discussing specific trades
4. Is conversational and engaging
5. Uses clean, readable formatting
6. Includes actionable insights when appropriate

Formatting Guidelines:
- Use **bold** for key terms and concepts
- Use bullet points (•) for lists and key points
- Use simple paragraph breaks for sections
- Keep paragraphs short (2-3 sentences max)
- Avoid markdown headers (#, ##, ###) - use **bold text** instead
- Structure information logically with clear flow
- Use emojis only when they add value

If the user asks for analysis of a specific symbol, explain that full technical analysis requires the dedicated analysis feature.

Be concise, clear, and helpful. Format your response to be easy to read and scan.
"""
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Generate suggestions based on message
        suggestions = []
        message_lower = request.message.lower()
        
        if any(word in message_lower for word in ["analyze", "analysis", "symbol"]):
            suggestions = [
                "What are technical indicators?",
                "Explain risk management",
                "How to read charts?"
            ]
        elif any(word in message_lower for word in ["learn", "explain", "what is"]):
            suggestions = [
                "Analyze BTC-USD",
                "Show trading strategies",
                "Explain market volatility"
            ]
        else:
            suggestions = [
                "Analyze a symbol",
                "Learn about RSI",
                "Risk management tips"
            ]
        
        # Determine intent
        intent = {"type": "general", "confidence": 0.7}
        if any(word in message_lower for word in ["analyze", "analysis"]):
            intent = {"type": "analysis_request", "confidence": 0.9}
        elif any(word in message_lower for word in ["learn", "explain", "what is"]):
            intent = {"type": "educational", "confidence": 0.9}
        
        # Clean up the response
        clean_response = response.text.strip()
        
        # Add risk warning only if not already present
        if "trading involves" not in clean_response.lower():
            clean_response += "\n\n⚠️ **Risk Warning**: Trading involves significant risk. Never invest more than you can afford to lose."
        
        return ChatResponse(
            success=True,
            response=clean_response,
            intent=intent,
            suggestions=suggestions,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            success=False,
            response="I'm sorry, I'm having trouble processing your request right now. Please try again.",
            timestamp=datetime.utcnow().isoformat()
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)