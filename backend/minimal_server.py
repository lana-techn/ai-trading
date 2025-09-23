#!/usr/bin/env python3
"""
Minimal FastAPI server for AI Chat and Alpha Vantage integration
"""

import os
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import aiohttp
import asyncio

# Environment setup
os.environ["GEMINI_API_KEY"] = "AIzaSyBipHWt4HXD9M121H1yEt-HhglDM9rove4"
os.environ["ALPHA_VANTAGE_KEY"] = "YOUR_ALPHA_VANTAGE_KEY_HERE"  # Replace with actual key

# Initialize Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Alpha Vantage helper functions
class AlphaVantageClient:
    def __init__(self):
        self.base_url = "https://www.alphavantage.co/query"
        self.api_key = os.environ.get("ALPHA_VANTAGE_KEY")
    
    async def _make_request(self, params: Dict[str, str]) -> Dict[str, Any]:
        """Make API request to Alpha Vantage"""
        if not self.api_key or self.api_key == "YOUR_ALPHA_VANTAGE_KEY_HERE":
            # Return mock data for demo
            return self._get_mock_data(params)
        
        params['apikey'] = self.api_key
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(self.base_url, params=params) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise HTTPException(status_code=response.status, detail="Alpha Vantage API error")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to fetch data: {e}")
    
    def _get_mock_data(self, params: Dict[str, str]) -> Dict[str, Any]:
        """Return mock data for demo purposes"""
        function = params.get('function')
        symbol = params.get('symbol', 'AAPL')
        
        if function == 'GLOBAL_QUOTE':
            return {
                'Global Quote': {
                    '01. symbol': symbol,
                    '02. open': '150.00',
                    '03. high': '155.00',
                    '04. low': '148.00',
                    '05. price': '152.50',
                    '06. volume': '1000000',
                    '07. latest trading day': '2024-12-23',
                    '08. previous close': '149.00',
                    '09. change': '3.50',
                    '10. change percent': '2.35%'
                }
            }
        elif function == 'TIME_SERIES_INTRADAY':
            interval = params.get('interval', '5min')
            mock_data = {}
            for i in range(50):
                time_str = f"2024-12-23 {15-i//12:02d}:{55-(i*5)%60:02d}:00"
                mock_data[time_str] = {
                    '1. open': str(150 + (i % 10) * 0.5),
                    '2. high': str(152 + (i % 8) * 0.3),
                    '3. low': str(149 + (i % 6) * 0.2),
                    '4. close': str(151 + (i % 7) * 0.4),
                    '5. volume': str(10000 + i * 100)
                }
            return {f'Time Series ({interval})': mock_data}
        elif function == 'TIME_SERIES_DAILY':
            mock_data = {}
            for i in range(30):
                date_str = f"2024-{12:02d}-{23-i:02d}"
                mock_data[date_str] = {
                    '1. open': str(150 + (i % 15) * 2),
                    '2. high': str(155 + (i % 12) * 1.5),
                    '3. low': str(145 + (i % 10) * 1.2),
                    '4. close': str(152 + (i % 8) * 1.8),
                    '5. volume': str(1000000 + i * 50000)
                }
            return {'Time Series (Daily)': mock_data}
        
        return {}
    
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time quote"""
        params = {'function': 'GLOBAL_QUOTE', 'symbol': symbol}
        data = await self._make_request(params)
        quote_data = data.get('Global Quote', {})
        
        return {
            'symbol': quote_data.get('01. symbol', symbol),
            'price': float(quote_data.get('05. price', 0)),
            'change': float(quote_data.get('09. change', 0)),
            'change_percent': quote_data.get('10. change percent', '0%').replace('%', ''),
            'volume': int(quote_data.get('06. volume', 0)),
            'latest_trading_day': quote_data.get('07. latest trading day', ''),
            'previous_close': float(quote_data.get('08. previous close', 0)),
            'open': float(quote_data.get('02. open', 0)),
            'high': float(quote_data.get('03. high', 0)),
            'low': float(quote_data.get('04. low', 0)),
        }
    
    async def get_intraday_data(self, symbol: str, interval: str = '5min') -> List[Dict[str, Any]]:
        """Get intraday candlestick data"""
        params = {'function': 'TIME_SERIES_INTRADAY', 'symbol': symbol, 'interval': interval}
        data = await self._make_request(params)
        
        time_series_key = f'Time Series ({interval})'
        time_series = data.get(time_series_key, {})
        
        candlesticks = []
        for timestamp, ohlcv in time_series.items():
            candlesticks.append({
                'time': timestamp,
                'open': float(ohlcv.get('1. open', 0)),
                'high': float(ohlcv.get('2. high', 0)),
                'low': float(ohlcv.get('3. low', 0)),
                'close': float(ohlcv.get('4. close', 0)),
                'volume': int(ohlcv.get('5. volume', 0))
            })
        
        # Sort by time (oldest first for charts)
        candlesticks.sort(key=lambda x: x['time'])
        return candlesticks
    
    async def get_daily_data(self, symbol: str) -> List[Dict[str, Any]]:
        """Get daily candlestick data"""
        params = {'function': 'TIME_SERIES_DAILY', 'symbol': symbol}
        data = await self._make_request(params)
        
        time_series = data.get('Time Series (Daily)', {})
        
        candlesticks = []
        for date, ohlcv in time_series.items():
            candlesticks.append({
                'time': date,
                'open': float(ohlcv.get('1. open', 0)),
                'high': float(ohlcv.get('2. high', 0)),
                'low': float(ohlcv.get('3. low', 0)),
                'close': float(ohlcv.get('4. close', 0)),
                'volume': int(ohlcv.get('5. volume', 0))
            })
        
        # Sort by time (oldest first for charts)
        candlesticks.sort(key=lambda x: x['time'])
        return candlesticks

# Initialize Alpha Vantage client
alpha_client = AlphaVantageClient()

# FastAPI app
app = FastAPI(
    title="AI Trading Chat & Market Data",
    description="Server for AI chat and real-time market data via Alpha Vantage",
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

class MarketDataResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    timestamp: str
    error: Optional[str] = None

class ChartDataResponse(BaseModel):
    success: bool
    data: List[Dict[str, Any]]
    meta: Dict[str, Any]
    timestamp: str
    error: Optional[str] = None

# Routes
@app.get("/")
async def root():
    return {"message": "AI Trading Chat Server", "status": "online"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Market Data Endpoints
@app.get("/api/v1/market/quote/{symbol}")
async def get_market_quote(symbol: str) -> MarketDataResponse:
    """Get real-time quote for a symbol"""
    try:
        data = await alpha_client.get_quote(symbol.upper())
        return MarketDataResponse(
            success=True,
            data=data,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        return MarketDataResponse(
            success=False,
            data={},
            timestamp=datetime.utcnow().isoformat(),
            error=str(e)
        )

@app.get("/api/v1/market/chart/{symbol}")
async def get_chart_data(
    symbol: str, 
    timeframe: str = Query(default="5min", regex="^(1min|5min|15min|30min|60min|daily)$")
) -> ChartDataResponse:
    """Get candlestick chart data for a symbol"""
    try:
        if timeframe == "daily":
            data = await alpha_client.get_daily_data(symbol.upper())
        else:
            data = await alpha_client.get_intraday_data(symbol.upper(), timeframe)
        
        # Calculate metadata
        if data:
            closes = [item['close'] for item in data]
            volumes = [item['volume'] for item in data]
            
            meta = {
                'symbol': symbol.upper(),
                'timeframe': timeframe,
                'count': len(data),
                'latest_price': closes[-1] if closes else 0,
                'price_change': closes[-1] - closes[0] if len(closes) > 1 else 0,
                'price_change_percent': ((closes[-1] - closes[0]) / closes[0] * 100) if len(closes) > 1 and closes[0] > 0 else 0,
                'avg_volume': sum(volumes) / len(volumes) if volumes else 0,
                'high_price': max([item['high'] for item in data]) if data else 0,
                'low_price': min([item['low'] for item in data]) if data else 0
            }
        else:
            meta = {'symbol': symbol.upper(), 'timeframe': timeframe, 'count': 0}
        
        return ChartDataResponse(
            success=True,
            data=data,
            meta=meta,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        return ChartDataResponse(
            success=False,
            data=[],
            meta={'symbol': symbol.upper(), 'timeframe': timeframe, 'count': 0},
            timestamp=datetime.utcnow().isoformat(),
            error=str(e)
        )

@app.get("/api/v1/market/popular-symbols")
async def get_popular_symbols():
    """Get list of popular trading symbols"""
    symbols = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'type': 'Stock'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'type': 'Stock'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'type': 'Stock'},
        {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'type': 'Stock'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'type': 'Stock'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'type': 'Stock'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'type': 'Stock'},
        {'symbol': 'NFLX', 'name': 'Netflix Inc.', 'type': 'Stock'},
        {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF', 'type': 'ETF'},
        {'symbol': 'QQQ', 'name': 'Invesco QQQ Trust', 'type': 'ETF'}
    ]
    
    return MarketDataResponse(
        success=True,
        data={'symbols': symbols},
        timestamp=datetime.utcnow().isoformat()
    )

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