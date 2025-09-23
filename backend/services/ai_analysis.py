"""
AI Trading Analysis Service
Menggunakan Gemini AI untuk menganalisis data trading dari Alpha Vantage
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import google.generativeai as genai
import requests
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingSignal(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY" 
    HOLD = "HOLD"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

@dataclass
class MarketData:
    symbol: str
    price: float
    volume: int
    change: float
    change_percent: float
    timestamp: datetime

@dataclass
class TechnicalIndicators:
    rsi: Optional[float] = None
    macd: Optional[Dict] = None
    bollinger_bands: Optional[Dict] = None
    moving_averages: Optional[Dict] = None

@dataclass
class AIAnalysis:
    signal: TradingSignal
    confidence: float  # 0.0 to 1.0
    reasoning: str
    key_insights: List[str]
    risk_assessment: str
    price_target: Optional[float] = None
    stop_loss: Optional[float] = None
    timestamp: datetime = None

class AITradingAnalyzer:
    """AI-powered trading analysis using Gemini AI and Alpha Vantage data"""
    
    def __init__(self):
        # Initialize Gemini AI
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY')
        
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        if not self.alpha_vantage_key:
            raise ValueError("ALPHA_VANTAGE_KEY not found in environment variables")
            
        genai.configure(api_key=self.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Alpha Vantage base URL
        self.av_base_url = "https://www.alphavantage.co/query"
    
    async def get_market_data(self, symbol: str, interval: str = "5min") -> Optional[Dict]:
        """Fetch market data from Alpha Vantage"""
        try:
            params = {
                'function': 'TIME_SERIES_INTRADAY',
                'symbol': symbol,
                'interval': interval,
                'apikey': self.alpha_vantage_key,
                'outputsize': 'compact'
            }
            
            response = requests.get(self.av_base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "Error Message" in data:
                logger.error(f"Alpha Vantage Error: {data['Error Message']}")
                return None
                
            if "Note" in data:
                logger.warning(f"Alpha Vantage Rate Limit: {data['Note']}")
                return None
                
            return data
            
        except Exception as e:
            logger.error(f"Error fetching market data for {symbol}: {str(e)}")
            return None
    
    async def get_technical_indicators(self, symbol: str) -> TechnicalIndicators:
        """Fetch technical indicators from Alpha Vantage"""
        indicators = TechnicalIndicators()
        
        try:
            # Get RSI
            rsi_params = {
                'function': 'RSI',
                'symbol': symbol,
                'interval': 'daily',
                'time_period': 14,
                'series_type': 'close',
                'apikey': self.alpha_vantage_key
            }
            
            rsi_response = requests.get(self.av_base_url, params=rsi_params)
            rsi_data = rsi_response.json()
            
            if 'Technical Analysis: RSI' in rsi_data:
                rsi_values = rsi_data['Technical Analysis: RSI']
                latest_date = sorted(rsi_values.keys())[-1]
                indicators.rsi = float(rsi_values[latest_date]['RSI'])
            
            # Add small delay to avoid rate limiting
            await asyncio.sleep(0.5)
            
            # Get MACD
            macd_params = {
                'function': 'MACD',
                'symbol': symbol,
                'interval': 'daily',
                'series_type': 'close',
                'apikey': self.alpha_vantage_key
            }
            
            macd_response = requests.get(self.av_base_url, params=macd_params)
            macd_data = macd_response.json()
            
            if 'Technical Analysis: MACD' in macd_data:
                macd_values = macd_data['Technical Analysis: MACD']
                latest_date = sorted(macd_values.keys())[-1]
                indicators.macd = {
                    'macd': float(macd_values[latest_date]['MACD']),
                    'signal': float(macd_values[latest_date]['MACD_Signal']),
                    'histogram': float(macd_values[latest_date]['MACD_Hist'])
                }
                
        except Exception as e:
            logger.error(f"Error fetching technical indicators for {symbol}: {str(e)}")
            
        return indicators
    
    def create_analysis_prompt(self, symbol: str, market_data: Dict, 
                             indicators: TechnicalIndicators) -> str:
        """Create a comprehensive prompt for Gemini AI analysis"""
        
        # Extract recent price data
        time_series_key = None
        for key in market_data.keys():
            if 'Time Series' in key:
                time_series_key = key
                break
                
        if not time_series_key:
            return "Tidak dapat menganalisis: data pasar tidak lengkap"
            
        time_series = market_data[time_series_key]
        recent_dates = sorted(time_series.keys())[-10:]  # Last 10 data points
        
        # Build price history
        price_history = []
        for date in recent_dates:
            data_point = time_series[date]
            price_history.append({
                'date': date,
                'open': float(data_point['1. open']),
                'high': float(data_point['2. high']),
                'low': float(data_point['3. low']),
                'close': float(data_point['4. close']),
                'volume': int(data_point['5. volume'])
            })
        
        current_price = price_history[-1]['close']
        prev_price = price_history[-2]['close'] if len(price_history) > 1 else current_price
        price_change = current_price - prev_price
        price_change_pct = (price_change / prev_price) * 100 if prev_price != 0 else 0
        
        # Build prompt with regular string formatting to avoid f-string conflicts
        rsi_text = f"{indicators.rsi:.2f}" if indicators.rsi else 'N/A'
        macd_text = json.dumps(indicators.macd, indent=2) if indicators.macd else 'N/A'
        price_history_text = json.dumps(price_history, indent=2)
        
        prompt = f"""Sebagai AI Trading Analyst Expert, analisis data trading berikut untuk {symbol}:

CURRENT MARKET DATA:
- Symbol: {symbol}
- Current Price: ${current_price:.2f}
- Price Change: ${price_change:.2f} ({price_change_pct:.2f}%)
- Latest Volume: {price_history[-1]['volume']:,}

RECENT PRICE HISTORY (Last 10 periods):
{price_history_text}

TECHNICAL INDICATORS:
- RSI (14): {rsi_text}
- MACD: {macd_text}

ANALISIS YANG DIBUTUHKAN:
1. Analisis teknikal mendalam berdasarkan data di atas
2. Identifikasi pattern dan trend yang terlihat
3. Evaluasi momentum dan volume
4. Penilaian risk/reward ratio
5. Rekomendasi trading signal dengan confidence level

FORMAT RESPONSE (JSON):
{{
    "signal": "STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL",
    "confidence": 0.85,
    "reasoning": "Penjelasan detail analisis teknikal dan fundamental",
    "key_insights": [
        "Insight penting 1",
        "Insight penting 2", 
        "Insight penting 3"
    ],
    "risk_assessment": "Evaluasi risiko dan manajemen risiko",
    "price_target": 125.50,
    "stop_loss": 115.25,
    "technical_analysis": {{
        "trend": "bullish/bearish/sideways",
        "support_levels": [120.00, 115.50],
        "resistance_levels": [130.00, 135.25],
        "volume_analysis": "Volume analysis insights"
    }}
}}

Berikan analisis yang objektif, data-driven, dan actionable untuk trader Indonesia."""
        
        return prompt
    
    async def analyze_symbol(self, symbol: str) -> Optional[AIAnalysis]:
        """Perform complete AI analysis of a trading symbol"""
        try:
            logger.info(f"Starting AI analysis for {symbol}")
            
            # Fetch market data
            market_data = await self.get_market_data(symbol)
            if not market_data:
                logger.error(f"Failed to fetch market data for {symbol}")
                return None
            
            # Fetch technical indicators
            indicators = await self.get_technical_indicators(symbol)
            
            # Create analysis prompt
            prompt = self.create_analysis_prompt(symbol, market_data, indicators)
            
            # Generate AI analysis
            logger.info(f"Generating AI analysis for {symbol}")
            response = await asyncio.create_task(self._generate_ai_response(prompt))
            
            if not response:
                return None
                
            # Parse response - handle markdown code blocks from Gemini
            try:
                # Remove markdown code blocks if present
                clean_response = response
                if '```json' in response:
                    clean_response = response.split('```json')[1].split('```')[0].strip()
                elif '```' in response:
                    clean_response = response.split('```')[1].split('```')[0].strip()
                
                analysis_data = json.loads(clean_response)
                
                analysis = AIAnalysis(
                    signal=TradingSignal(analysis_data['signal']),
                    confidence=analysis_data['confidence'],
                    reasoning=analysis_data['reasoning'],
                    key_insights=analysis_data['key_insights'],
                    risk_assessment=analysis_data['risk_assessment'],
                    price_target=analysis_data.get('price_target'),
                    stop_loss=analysis_data.get('stop_loss'),
                    timestamp=datetime.now()
                )
                
                logger.info(f"AI analysis completed for {symbol}: {analysis.signal.value} (confidence: {analysis.confidence:.2f})")
                return analysis
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response: {str(e)}")
                # Return basic analysis with raw response
                return AIAnalysis(
                    signal=TradingSignal.HOLD,
                    confidence=0.5,
                    reasoning=response[:500] + "..." if len(response) > 500 else response,
                    key_insights=["AI analysis available in reasoning"],
                    risk_assessment="Medium risk - manual review recommended",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.error(f"Error in AI analysis for {symbol}: {str(e)}")
            return None
    
    async def _generate_ai_response(self, prompt: str) -> Optional[str]:
        """Generate response from Gemini AI"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return None
    
    async def get_multiple_analysis(self, symbols: List[str]) -> Dict[str, AIAnalysis]:
        """Analyze multiple symbols concurrently"""
        tasks = []
        for symbol in symbols:
            task = asyncio.create_task(self.analyze_symbol(symbol))
            tasks.append((symbol, task))
            # Add delay between requests to avoid rate limiting
            await asyncio.sleep(1)
        
        results = {}
        for symbol, task in tasks:
            try:
                analysis = await task
                if analysis:
                    results[symbol] = analysis
            except Exception as e:
                logger.error(f"Error analyzing {symbol}: {str(e)}")
        
        return results

# Global analyzer instance
analyzer = None

def get_ai_analyzer() -> AITradingAnalyzer:
    """Get singleton AI analyzer instance"""
    global analyzer
    if analyzer is None:
        analyzer = AITradingAnalyzer()
    return analyzer