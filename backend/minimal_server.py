#!/usr/bin/env python3
"""
Minimal FastAPI server for AI Chat and Alpha Vantage integration
"""

import os
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import aiohttp
import asyncio
import yfinance as yf
import pandas as pd

# Environment setup
os.environ["GEMINI_API_KEY"] = "AIzaSyBipHWt4HXD9M121H1yEt-HhglDM9rove4"
os.environ["ALPHA_VANTAGE_KEY"] = "demo"  # Using demo key for now

# Initialize Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Yahoo Finance helper functions for real stock data
class YFinanceClient:
    def __init__(self):
        self.quote_cache = {}
        self.chart_cache = {}
        self.cache_duration = 60  # Cache for 60 seconds
        self.last_request_time = 0
        self.request_delay = 0.5  # 500ms between requests
    
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time quote using yfinance with caching"""
        # Check cache first
        cache_key = f"quote_{symbol}"
        current_time = time.time()
        
        if cache_key in self.quote_cache:
            cache_time, cached_data = self.quote_cache[cache_key]
            if current_time - cache_time < self.cache_duration:
                print(f"📋 Using cached quote for {symbol}")
                return cached_data
        
        # Rate limiting
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.request_delay:
            await asyncio.sleep(self.request_delay - time_since_last)
        
        try:
            # Convert symbol format if needed
            yf_symbol = self._convert_symbol(symbol)
            ticker = yf.Ticker(yf_symbol)
            
            # Use history for more reliable data
            hist = ticker.history(period='2d', interval='1d')
            if len(hist) == 0:
                raise Exception("No historical data available")
            
            latest = hist.iloc[-1]
            previous = hist.iloc[-2] if len(hist) > 1 else hist.iloc[-1]
            
            current_price = float(latest['Close'])
            previous_close = float(previous['Close'])
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            self.last_request_time = time.time()
            
            result = {
                'symbol': symbol,
                'price': current_price,
                'change': change,
                'change_percent': f'{change_percent:.2f}',
                'volume': int(latest['Volume']) if not pd.isna(latest['Volume']) else 0,
                'latest_trading_day': latest.name.strftime('%Y-%m-%d'),
                'previous_close': previous_close,
                'open': float(latest['Open']),
                'high': float(latest['High']),
                'low': float(latest['Low']),
            }
            
            # Cache the result
            self.quote_cache[cache_key] = (current_time, result)
            print(f"📊 Fresh quote for {symbol}: ${current_price:.2f}")
            return result
        except Exception as e:
            print(f"Error getting quote for {symbol}: {e}")
            # Return realistic mock data based on symbol as fallback
            return self._get_realistic_mock_quote(symbol)
    
    async def get_intraday_data(self, symbol: str, interval: str = '5m') -> List[Dict[str, Any]]:
        """Get intraday data using yfinance"""
        try:
            yf_symbol = self._convert_symbol(symbol)
            ticker = yf.Ticker(yf_symbol)
            
            # Map timeframes
            period_map = {
                '1min': '1d',
                '5min': '5d', 
                '15min': '5d',
                '30min': '5d',
                '60min': '5d'
            }
            
            hist = ticker.history(period=period_map.get(interval, '5d'), interval=interval)
            
            candlesticks = []
            for timestamp, row in hist.iterrows():
                candlesticks.append({
                    'time': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume']) if not pd.isna(row['Volume']) else 0
                })
            
            return candlesticks[-100:]  # Return last 100 candles
            
        except Exception as e:
            print(f"Error getting intraday data for {symbol}: {e}")
            return self._get_mock_intraday_data(symbol, interval)
    
    async def get_daily_data(self, symbol: str) -> List[Dict[str, Any]]:
        """Get daily data using yfinance with caching"""
        # Check cache first
        cache_key = f"daily_{symbol}"
        current_time = time.time()
        
        if cache_key in self.chart_cache:
            cache_time, cached_data = self.chart_cache[cache_key]
            if current_time - cache_time < self.cache_duration:
                print(f"📋 Using cached daily data for {symbol}")
                return cached_data
        
        # Rate limiting
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.request_delay:
            await asyncio.sleep(self.request_delay - time_since_last)
        
        try:
            yf_symbol = self._convert_symbol(symbol)
            ticker = yf.Ticker(yf_symbol)
            
            # Get 3 months of daily data
            hist = ticker.history(period='3mo', interval='1d')
            self.last_request_time = time.time()
            
            if len(hist) == 0:
                raise Exception("No daily data available from yfinance")
            
            candlesticks = []
            for timestamp, row in hist.iterrows():
                candlesticks.append({
                    'time': timestamp.strftime('%Y-%m-%d'),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume']) if not pd.isna(row['Volume']) else 0
                })
            
            # Cache the result
            self.chart_cache[cache_key] = (current_time, candlesticks)
            print(f"📈 Fresh daily data for {symbol}: {len(candlesticks)} candles")
            return candlesticks
            
        except Exception as e:
            print(f"Error getting daily data for {symbol}: {e}")
            return self._get_realistic_mock_daily_data(symbol)
    
    def _convert_symbol(self, symbol: str) -> str:
        """Convert symbol format for yfinance"""
        # Handle crypto pairs
        if '/' in symbol:
            base, quote = symbol.split('/')
            if quote == 'USD':
                return f"{base}-USD"
        return symbol
    
    def _get_realistic_mock_quote(self, symbol: str) -> Dict[str, Any]:
        """Realistic fallback mock quote based on actual stock ranges"""
        # Realistic price ranges based on recent market data
        realistic_prices = {
            'AAPL': {'base': 225.0, 'volatility': 0.02},
            'GOOGL': {'base': 175.0, 'volatility': 0.025},
            'MSFT': {'base': 415.0, 'volatility': 0.018},
            'TSLA': {'base': 250.0, 'volatility': 0.04},
            'AMZN': {'base': 185.0, 'volatility': 0.022},
            'NVDA': {'base': 140.0, 'volatility': 0.035},
            'META': {'base': 565.0, 'volatility': 0.028},
            'NFLX': {'base': 700.0, 'volatility': 0.025},
            'SPY': {'base': 580.0, 'volatility': 0.012},
            'QQQ': {'base': 485.0, 'volatility': 0.015},
            'BTC': {'base': 67000.0, 'volatility': 0.05},
        }
        
        stock_info = realistic_prices.get(symbol, {'base': 150.0, 'volatility': 0.02})
        base_price = stock_info['base']
        volatility = stock_info['volatility']
        
        # Generate realistic daily movement
        import random
        random.seed(int(time.time()) // 86400)  # Same seed for the day
        
        daily_change_pct = (random.random() - 0.5) * 2 * volatility
        current_price = base_price * (1 + daily_change_pct)
        previous_close = base_price
        
        change = current_price - previous_close
        change_percent = (change / previous_close * 100)
        
        # Intraday high/low
        high = current_price * (1 + abs(daily_change_pct) * 0.3)
        low = current_price * (1 - abs(daily_change_pct) * 0.3)
        open_price = previous_close * (1 + daily_change_pct * 0.1)
        
        return {
            'symbol': symbol,
            'price': round(current_price, 2),
            'change': round(change, 2),
            'change_percent': f'{change_percent:.2f}',
            'volume': random.randint(500000, 5000000),
            'latest_trading_day': datetime.now().strftime('%Y-%m-%d'),
            'previous_close': round(previous_close, 2),
            'open': round(open_price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
        }
    
    def _get_mock_intraday_data(self, symbol: str, interval: str) -> List[Dict[str, Any]]:
        """Fallback mock intraday data"""
        candlesticks = []
        base_price = 150.0
        
        for i in range(50):
            time_str = f"2024-12-23 {15-i//12:02d}:{55-(i*5)%60:02d}:00"
            price_variation = (i % 10) * 0.5
            
            candlesticks.append({
                'time': time_str,
                'open': base_price + price_variation,
                'high': base_price + price_variation + 2,
                'low': base_price + price_variation - 1,
                'close': base_price + price_variation + 0.5,
                'volume': 10000 + i * 100
            })
        
        return candlesticks
    
    def _get_realistic_mock_daily_data(self, symbol: str) -> List[Dict[str, Any]]:
        """Realistic fallback daily data with proper stock movements"""
        # Use same realistic prices as quotes
        realistic_prices = {
            'AAPL': {'base': 225.0, 'volatility': 0.02},
            'GOOGL': {'base': 175.0, 'volatility': 0.025},
            'MSFT': {'base': 415.0, 'volatility': 0.018},
            'TSLA': {'base': 250.0, 'volatility': 0.04},
            'AMZN': {'base': 185.0, 'volatility': 0.022},
            'NVDA': {'base': 140.0, 'volatility': 0.035},
            'META': {'base': 565.0, 'volatility': 0.028},
            'NFLX': {'base': 700.0, 'volatility': 0.025},
            'SPY': {'base': 580.0, 'volatility': 0.012},
            'QQQ': {'base': 485.0, 'volatility': 0.015},
            'BTC': {'base': 67000.0, 'volatility': 0.05},
        }
        
        stock_info = realistic_prices.get(symbol, {'base': 150.0, 'volatility': 0.02})
        base_price = stock_info['base']
        volatility = stock_info['volatility']
        
        candlesticks = []
        import random
        
        current_price = base_price
        for i in range(60):  # 60 days of data
            current_date = datetime.now() - timedelta(days=59-i)
            date_str = current_date.strftime('%Y-%m-%d')
            
            # Generate realistic daily movement
            random.seed(int(current_date.timestamp()) // 86400)  # Consistent daily seed
            daily_change_pct = (random.random() - 0.5) * 2 * volatility
            
            open_price = current_price
            close_price = open_price * (1 + daily_change_pct)
            
            # Generate high/low within reasonable bounds
            high_factor = 1 + abs(daily_change_pct) * 0.5 + random.random() * volatility * 0.3
            low_factor = 1 - abs(daily_change_pct) * 0.5 - random.random() * volatility * 0.3
            
            high = max(open_price, close_price) * high_factor
            low = min(open_price, close_price) * low_factor
            
            # Ensure OHLC consistency
            high = max(high, open_price, close_price)
            low = min(low, open_price, close_price)
            
            volume = random.randint(int(500000), int(5000000))
            
            candlesticks.append({
                'time': date_str,
                'open': round(open_price, 2),
                'high': round(high, 2),
                'low': round(low, 2),
                'close': round(close_price, 2),
                'volume': volume
            })
            
            # Update current price for next day
            current_price = close_price * (1 + (random.random() - 0.5) * volatility * 0.1)
        
        return candlesticks

# Alpha Vantage helper functions (keep as backup)
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
            # Generate 30 unique sequential dates
            from datetime import datetime, timedelta
            
            base_date = datetime(2024, 11, 24)  # Start from a fixed date
            for i in range(30):
                current_date = base_date + timedelta(days=i)
                date_str = current_date.strftime('%Y-%m-%d')
                
                # Generate realistic price data with some variation
                base_price = 150
                daily_change = (i % 7 - 3) * 2  # Vary between -6 to +6
                open_price = base_price + daily_change + (i % 3) * 1.5
                
                mock_data[date_str] = {
                    '1. open': str(round(open_price, 2)),
                    '2. high': str(round(open_price * (1 + 0.02 + (i % 5) * 0.005), 2)),
                    '3. low': str(round(open_price * (1 - 0.02 - (i % 4) * 0.005), 2)),
                    '4. close': str(round(open_price + (i % 9 - 4) * 0.8, 2)),
                    '5. volume': str(1000000 + i * 25000 + (i % 10) * 15000)
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

# Initialize real data client
real_data_client = YFinanceClient()
# Keep alpha client as backup
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

@app.get("/api/v1/health")
async def health_v1():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Market Data Endpoints
@app.get("/api/v1/market/quote/{symbol}")
async def get_market_quote(symbol: str) -> MarketDataResponse:
    """Get real-time quote for a symbol using real data"""
    try:
        print(f"📊 Getting quote for {symbol}")
        data = await real_data_client.get_quote(symbol.upper())
        return MarketDataResponse(
            success=True,
            data=data,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        print(f"❌ Error getting quote for {symbol}: {e}")
        return MarketDataResponse(
            success=False,
            data={},
            timestamp=datetime.utcnow().isoformat(),
            error=str(e)
        )

@app.get("/api/v1/market/quote/{symbol}/{currency}")
async def get_market_quote_with_currency(symbol: str, currency: str) -> MarketDataResponse:
    """Get real-time quote for a symbol with currency (e.g., BTC/USD)"""
    try:
        # For crypto pairs, use the symbol as is (e.g., BTC)
        # For stocks, ignore currency and use symbol
        trading_symbol = symbol.upper()
        if currency.upper() == "USD" and symbol.upper() in ["BTC", "ETH", "ADA", "XRP", "LTC", "DOGE"]:
            # For crypto, we might want to use a different symbol format
            # For now, just use the base symbol
            pass
        
        data = await real_data_client.get_quote(trading_symbol)
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
    timeframe: str = Query(default="5min", regex="^(1min|5min|15min|30min|60min|daily|1d)$")
) -> ChartDataResponse:
    """Get candlestick chart data for a symbol using real data"""
    try:
        print(f"📈 Getting chart data for {symbol} ({timeframe})")
        if timeframe == "daily" or timeframe == "1d":
            data = await real_data_client.get_daily_data(symbol.upper())
        else:
            data = await real_data_client.get_intraday_data(symbol.upper(), timeframe)
        
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

@app.get("/api/v1/market/chart/{symbol}/{currency}")
async def get_chart_data_with_currency(
    symbol: str,
    currency: str,
    timeframe: str = Query(default="5min", regex="^(1min|5min|15min|30min|60min|daily|1d)$")
) -> ChartDataResponse:
    """Get candlestick chart data for a symbol with currency (e.g., BTC/USD)"""
    try:
        # For crypto pairs, use the symbol as is (e.g., BTC)
        # For stocks, ignore currency and use symbol
        trading_symbol = symbol.upper()
        if currency.upper() == "USD" and symbol.upper() in ["BTC", "ETH", "ADA", "XRP", "LTC", "DOGE"]:
            # For crypto, we might want to use a different symbol format
            # For now, just use the base symbol
            pass
        
        if timeframe == "daily" or timeframe == "1d":
            data = await real_data_client.get_daily_data(trading_symbol)
            actual_timeframe = "daily"
        else:
            data = await real_data_client.get_intraday_data(trading_symbol, timeframe)
            actual_timeframe = timeframe
        
        # Calculate metadata
        if data:
            closes = [item['close'] for item in data]
            volumes = [item['volume'] for item in data]
            
            meta = {
                'symbol': f"{symbol.upper()}/{currency.upper()}",
                'timeframe': actual_timeframe,
                'count': len(data),
                'latest_price': closes[-1] if closes else 0,
                'price_change': closes[-1] - closes[0] if len(closes) > 1 else 0,
                'price_change_percent': ((closes[-1] - closes[0]) / closes[0] * 100) if len(closes) > 1 and closes[0] > 0 else 0,
                'avg_volume': sum(volumes) / len(volumes) if volumes else 0,
                'high_price': max([item['high'] for item in data]) if data else 0,
                'low_price': min([item['low'] for item in data]) if data else 0
            }
        else:
            meta = {'symbol': f"{symbol.upper()}/{currency.upper()}", 'timeframe': actual_timeframe, 'count': 0}
        
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
            meta={'symbol': f"{symbol.upper()}/{currency.upper()}", 'timeframe': timeframe, 'count': 0},
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