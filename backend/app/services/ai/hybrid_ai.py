"""
Hybrid AI service combining Qwen3-Next (quantitative analysis) and Gemini 2.5 Flash (visual analysis).
This is the core AI engine for trading decisions with multi-agent orchestration.
"""

import asyncio
import json
import base64
import io
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import Rectangle
import seaborn as sns

# AI and ML imports
import google.generativeai as genai
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema import BaseOutputParser

# Internal imports
from app.core.config import settings, get_ai_config
from app.services.data.market_data import MarketDataService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class TradingDecisionParser(BaseOutputParser):
    """Parse AI output into structured trading decision."""
    
    def parse(self, text: str) -> Dict[str, Any]:
        """Parse AI output text into structured decision."""
        try:
            # Try to extract JSON from the response
            if "{" in text and "}" in text:
                start = text.find("{")
                end = text.rfind("}") + 1
                json_str = text[start:end]
                return json.loads(json_str)
            
            # Fallback: parse key-value pairs
            decision = {
                "action": "hold",
                "confidence": 0.5,
                "reasoning": text,
                "risk_level": "medium"
            }
            
            text_lower = text.lower()
            if "buy" in text_lower or "long" in text_lower:
                decision["action"] = "buy"
            elif "sell" in text_lower or "short" in text_lower:
                decision["action"] = "sell"
            
            return decision
            
        except Exception as e:
            logger.error(f"Error parsing AI decision: {e}")
            return {
                "action": "hold",
                "confidence": 0.0,
                "reasoning": "Error parsing AI response",
                "risk_level": "high"
            }


class QwenAnalyzer:
    """Qwen3-Next analyzer for quantitative trading analysis."""
    
    def __init__(self):
        self.config = get_ai_config()
        self.model_path = self.config["qwen_model_path"]
        self.tokenizer = None
        self.model = None
        self.pipeline = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize Qwen model for inference."""
        if self._initialized:
            return
            
        try:
            logger.info(f"Loading Qwen model: {self.model_path}")
            
            if self.config["use_local_qwen"]:
                # Load local model
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_path,
                    torch_dtype="auto",
                    device_map="auto"
                )
            else:
                # Use Hugging Face pipeline (easier setup)
                self.pipeline = pipeline(
                    "text-generation",
                    model=self.model_path,
                    torch_dtype="auto",
                    device_map="auto",
                    max_new_tokens=1024,
                    temperature=0.1
                )
            
            self._initialized = True
            logger.info("Qwen model initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Qwen model: {e}")
            # Fallback: use a smaller model or mock
            self.pipeline = None
            self._initialized = False
    
    async def analyze_market_data(
        self, 
        symbol: str, 
        market_data: pd.DataFrame, 
        technical_indicators: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform quantitative analysis using Qwen."""
        
        if not self._initialized:
            await self.initialize()
        
        try:
            # Prepare quantitative prompt
            prompt = self._build_quant_prompt(symbol, market_data, technical_indicators)
            
            if self.pipeline:
                # Use pipeline for inference
                messages = [
                    {"role": "system", "content": "You are a quantitative trading analyst. Provide mathematical and statistical analysis."},
                    {"role": "user", "content": prompt}
                ]
                
                response = self.pipeline(messages, max_new_tokens=512, temperature=0.1)
                analysis_text = response[0]["generated_text"][-1]["content"]
                
            else:
                # Fallback analysis (rule-based)
                analysis_text = self._fallback_analysis(symbol, market_data, technical_indicators)
            
            # Parse response
            parser = TradingDecisionParser()
            decision = parser.parse(analysis_text)
            
            # Add quantitative metrics
            decision.update({
                "model": "qwen",
                "analysis_type": "quantitative",
                "technical_score": self._calculate_technical_score(technical_indicators),
                "momentum_score": self._calculate_momentum_score(market_data),
                "volatility_score": self._calculate_volatility_score(market_data)
            })
            
            return decision
            
        except Exception as e:
            logger.error(f"Qwen analysis failed: {e}")
            return self._fallback_decision(symbol)
    
    def _build_quant_prompt(
        self, 
        symbol: str, 
        market_data: pd.DataFrame, 
        indicators: Dict[str, Any]
    ) -> str:
        """Build quantitative analysis prompt for Qwen."""
        
        latest = market_data.iloc[-1]
        prev = market_data.iloc[-2] if len(market_data) > 1 else latest
        
        price_change = ((latest['close'] - prev['close']) / prev['close']) * 100
        volume_change = ((latest['volume'] - prev['volume']) / prev['volume']) * 100 if prev['volume'] > 0 else 0
        
        prompt = f"""
Analyze {symbol} for trading decision based on the following quantitative data:

CURRENT PRICE DATA:
- Current Price: ${latest['close']:.2f}
- Price Change: {price_change:.2f}%
- Volume: {latest['volume']:,.0f}
- Volume Change: {volume_change:.2f}%

TECHNICAL INDICATORS:
- RSI: {indicators.get('rsi', 'N/A')}
- MACD: {indicators.get('macd', 'N/A')}
- SMA_20: ${indicators.get('sma_20', 'N/A')}
- SMA_50: ${indicators.get('sma_50', 'N/A')}
- Bollinger Upper: ${indicators.get('bb_upper', 'N/A')}
- Bollinger Lower: ${indicators.get('bb_lower', 'N/A')}

RISK METRICS:
- Volatility (20d): {indicators.get('volatility_20d', 'N/A')}
- ATR: {indicators.get('atr', 'N/A')}

Provide a JSON response with:
{{
    "action": "buy|sell|hold",
    "confidence": 0.0-1.0,
    "reasoning": "detailed mathematical reasoning",
    "risk_level": "low|medium|high",
    "target_price": estimated_target,
    "stop_loss": suggested_stop_loss
}}

Focus on mathematical analysis, statistical significance, and quantitative signals.
"""
        return prompt
    
    def _calculate_technical_score(self, indicators: Dict[str, Any]) -> float:
        """Calculate overall technical analysis score."""
        score = 0.5  # Neutral starting point
        
        try:
            rsi = indicators.get('rsi')
            if rsi:
                if rsi < 30:  # Oversold
                    score += 0.2
                elif rsi > 70:  # Overbought
                    score -= 0.2
            
            macd = indicators.get('macd')
            if macd and macd > 0:
                score += 0.1
            elif macd and macd < 0:
                score -= 0.1
                
            sma_20 = indicators.get('sma_20')
            sma_50 = indicators.get('sma_50')
            if sma_20 and sma_50:
                if sma_20 > sma_50:  # Bullish
                    score += 0.15
                else:  # Bearish
                    score -= 0.15
                    
        except Exception as e:
            logger.warning(f"Error calculating technical score: {e}")
        
        return max(0.0, min(1.0, score))
    
    def _calculate_momentum_score(self, market_data: pd.DataFrame) -> float:
        """Calculate momentum score from price data."""
        try:
            if len(market_data) < 5:
                return 0.5
            
            # Calculate rate of change
            recent_prices = market_data['close'].tail(5).values
            price_changes = np.diff(recent_prices) / recent_prices[:-1]
            avg_change = np.mean(price_changes)
            
            # Normalize to 0-1 scale
            momentum = 0.5 + (avg_change * 10)  # Scale factor
            return max(0.0, min(1.0, momentum))
            
        except Exception:
            return 0.5
    
    def _calculate_volatility_score(self, market_data: pd.DataFrame) -> float:
        """Calculate volatility score (higher = more volatile)."""
        try:
            if len(market_data) < 20:
                return 0.5
            
            returns = market_data['close'].pct_change().dropna()
            volatility = returns.std() * np.sqrt(252)  # Annualized
            
            # Normalize: typical crypto volatility 0.5-2.0
            normalized = min(1.0, volatility / 2.0)
            return normalized
            
        except Exception:
            return 0.5
    
    def _fallback_analysis(
        self, 
        symbol: str, 
        market_data: pd.DataFrame, 
        indicators: Dict[str, Any]
    ) -> str:
        """Fallback analysis when Qwen model is unavailable."""
        
        tech_score = self._calculate_technical_score(indicators)
        momentum_score = self._calculate_momentum_score(market_data)
        
        if tech_score > 0.7 and momentum_score > 0.6:
            action = "buy"
            confidence = 0.7
            reasoning = "Strong technical indicators and positive momentum"
        elif tech_score < 0.3 and momentum_score < 0.4:
            action = "sell"
            confidence = 0.7
            reasoning = "Weak technical indicators and negative momentum"
        else:
            action = "hold"
            confidence = 0.5
            reasoning = "Mixed signals, recommending hold position"
        
        return json.dumps({
            "action": action,
            "confidence": confidence,
            "reasoning": reasoning,
            "risk_level": "medium"
        })
    
    def _fallback_decision(self, symbol: str) -> Dict[str, Any]:
        """Fallback decision when analysis fails."""
        return {
            "action": "hold",
            "confidence": 0.0,
            "reasoning": f"Unable to analyze {symbol} due to technical issues",
            "risk_level": "high",
            "model": "qwen_fallback",
            "analysis_type": "quantitative"
        }


class GeminiAnalyzer:
    """Gemini 2.5 Flash analyzer for visual and multimodal analysis."""
    
    def __init__(self):
        self.config = get_ai_config()
        self.api_key = self.config["gemini_api_key"]
        self.model = None
        self._initialized = False
    
    async def initialize(self):
        """Initialize Gemini model."""
        if self._initialized or not self.api_key:
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            self._initialized = True
            logger.info("Gemini model initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            self._initialized = False
    
    async def analyze_chart_and_sentiment(
        self, 
        symbol: str, 
        market_data: pd.DataFrame, 
        chart_image: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """Perform visual analysis using Gemini."""
        
        if not self._initialized:
            await self.initialize()
        
        try:
            # Generate chart if not provided
            if chart_image is None:
                chart_image = self._generate_chart(symbol, market_data)
            
            # Prepare multimodal prompt
            prompt = self._build_visual_prompt(symbol, market_data)
            
            if self.model and chart_image:
                # Use Gemini for multimodal analysis
                response = await self._query_gemini_with_image(prompt, chart_image)
                
            else:
                # Fallback analysis
                response = self._fallback_visual_analysis(symbol, market_data)
            
            # Parse response
            parser = TradingDecisionParser()
            decision = parser.parse(response)
            
            # Add visual analysis metadata
            decision.update({
                "model": "gemini",
                "analysis_type": "visual",
                "chart_patterns": self._detect_patterns(market_data),
                "trend_analysis": self._analyze_trend(market_data)
            })
            
            return decision
            
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            return self._fallback_decision(symbol)
    
    def _generate_chart(self, symbol: str, market_data: pd.DataFrame) -> bytes:
        """Generate candlestick chart for visual analysis."""
        
        try:
            plt.style.use('dark_background')
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), height_ratios=[3, 1])
            
            # Prepare data
            data = market_data.tail(50)  # Last 50 periods
            data.index = pd.to_datetime(data.index) if not isinstance(data.index, pd.DatetimeIndex) else data.index
            
            # Candlestick chart
            for i, (idx, row) in enumerate(data.iterrows()):
                color = 'g' if row['close'] > row['open'] else 'r'
                
                # Body
                ax1.add_patch(Rectangle(
                    (i - 0.3, min(row['open'], row['close'])),
                    0.6, abs(row['close'] - row['open']),
                    facecolor=color, alpha=0.7
                ))
                
                # Wick
                ax1.plot([i, i], [row['low'], row['high']], color=color, linewidth=1)
            
            # Add moving averages
            if len(data) >= 20:
                sma20 = data['close'].rolling(20).mean()
                ax1.plot(range(len(sma20)), sma20, color='blue', label='SMA20')
            
            if len(data) >= 50:
                sma50 = data['close'].rolling(50).mean()
                ax1.plot(range(len(sma50)), sma50, color='orange', label='SMA50')
            
            ax1.set_title(f'{symbol} Price Chart', fontsize=16, color='white')
            ax1.set_ylabel('Price', color='white')
            ax1.legend()
            ax1.grid(True, alpha=0.3)
            
            # Volume chart
            ax2.bar(range(len(data)), data['volume'], color='cyan', alpha=0.6)
            ax2.set_ylabel('Volume', color='white')
            ax2.set_xlabel('Time Periods', color='white')
            ax2.grid(True, alpha=0.3)
            
            # Save to bytes
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight', 
                       facecolor='#1e1e1e', edgecolor='none')
            plt.close()
            
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Chart generation failed: {e}")
            return b''
    
    def _build_visual_prompt(self, symbol: str, market_data: pd.DataFrame) -> str:
        """Build visual analysis prompt for Gemini."""
        
        latest = market_data.iloc[-1]
        
        return f"""
Analyze the provided {symbol} price chart image for visual trading patterns and signals.

CURRENT CONTEXT:
- Symbol: {symbol}
- Current Price: ${latest['close']:.2f}
- Current Volume: {latest['volume']:,.0f}
- Data Points: {len(market_data)} periods

VISUAL ANALYSIS TASKS:
1. Identify chart patterns (triangles, head & shoulders, flags, etc.)
2. Analyze trend direction and strength
3. Identify support and resistance levels
4. Assess volume patterns and confirmation
5. Look for divergences between price and indicators
6. Evaluate breakout potential

Provide a JSON response with:
{{
    "action": "buy|sell|hold",
    "confidence": 0.0-1.0,
    "reasoning": "detailed visual pattern analysis",
    "risk_level": "low|medium|high",
    "key_patterns": ["pattern1", "pattern2"],
    "support_levels": [price1, price2],
    "resistance_levels": [price1, price2]
}}

Focus on visual patterns, chart formations, and technical chart analysis.
"""
    
    async def _query_gemini_with_image(self, prompt: str, image_bytes: bytes) -> str:
        """Query Gemini with image and text prompt."""
        
        try:
            # Convert image to base64
            image_b64 = base64.b64encode(image_bytes).decode()
            
            # Create multimodal prompt
            response = self.model.generate_content([
                prompt,
                {"mime_type": "image/png", "data": image_b64}
            ])
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini query failed: {e}")
            return self._fallback_visual_analysis(None, None)
    
    def _detect_patterns(self, market_data: pd.DataFrame) -> List[str]:
        """Detect basic chart patterns."""
        patterns = []
        
        try:
            if len(market_data) < 20:
                return patterns
            
            closes = market_data['close'].values
            
            # Simple trend detection
            recent_trend = np.polyfit(range(20), closes[-20:], 1)[0]
            if recent_trend > 0:
                patterns.append("uptrend")
            elif recent_trend < 0:
                patterns.append("downtrend")
            else:
                patterns.append("sideways")
            
            # Volatility pattern
            volatility = np.std(closes[-20:]) / np.mean(closes[-20:])
            if volatility > 0.05:
                patterns.append("high_volatility")
            elif volatility < 0.02:
                patterns.append("low_volatility")
                
        except Exception as e:
            logger.warning(f"Pattern detection error: {e}")
        
        return patterns
    
    def _analyze_trend(self, market_data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze trend strength and direction."""
        
        try:
            if len(market_data) < 10:
                return {"direction": "unknown", "strength": 0.5}
            
            closes = market_data['close'].values
            
            # Short-term trend (10 periods)
            short_trend = np.polyfit(range(10), closes[-10:], 1)[0]
            
            # Medium-term trend (20 periods if available)
            medium_trend = 0
            if len(market_data) >= 20:
                medium_trend = np.polyfit(range(20), closes[-20:], 1)[0]
            
            # Determine direction and strength
            direction = "up" if short_trend > 0 else "down" if short_trend < 0 else "sideways"
            strength = min(1.0, abs(short_trend) * 1000)  # Scale factor
            
            return {
                "direction": direction,
                "strength": strength,
                "short_trend": short_trend,
                "medium_trend": medium_trend
            }
            
        except Exception:
            return {"direction": "unknown", "strength": 0.5}
    
    def _fallback_visual_analysis(self, symbol: Optional[str], market_data: Optional[pd.DataFrame]) -> str:
        """Fallback when visual analysis is unavailable."""
        
        return json.dumps({
            "action": "hold",
            "confidence": 0.4,
            "reasoning": "Visual analysis unavailable, recommending hold",
            "risk_level": "medium",
            "key_patterns": ["unknown"],
            "support_levels": [],
            "resistance_levels": []
        })
    
    def _fallback_decision(self, symbol: str) -> Dict[str, Any]:
        """Fallback decision when analysis fails."""
        return {
            "action": "hold",
            "confidence": 0.0,
            "reasoning": f"Unable to perform visual analysis for {symbol}",
            "risk_level": "high",
            "model": "gemini_fallback",
            "analysis_type": "visual"
        }


class HybridTradingAI:
    """Main hybrid AI service combining Qwen and Gemini analysis."""
    
    def __init__(self):
        self.qwen = QwenAnalyzer()
        self.gemini = GeminiAnalyzer()
        self.market_data_service = MarketDataService()
        self._initialized = False
    
    async def initialize(self):
        """Initialize both AI analyzers."""
        if self._initialized:
            return
        
        logger.info("Initializing Hybrid AI system...")
        
        # Initialize analyzers
        await self.qwen.initialize()
        await self.gemini.initialize()
        
        self._initialized = True
        logger.info("Hybrid AI system initialized")
    
    async def analyze_symbol(
        self, 
        symbol: str, 
        timeframe: str = "1d",
        include_chart: bool = True
    ) -> Dict[str, Any]:
        """
        Perform comprehensive hybrid analysis of a trading symbol.
        
        Args:
            symbol: Trading symbol (e.g., "BTC-USD", "AAPL")
            timeframe: Data timeframe ("1m", "5m", "1h", "1d")
            include_chart: Whether to generate chart for visual analysis
            
        Returns:
            Combined analysis from both AI agents
        """
        
        if not self._initialized:
            await self.initialize()
        
        try:
            logger.info(f"Starting hybrid analysis for {symbol}")
            
            # Step 1: Fetch market data
            market_data = await self.market_data_service.get_market_data(symbol, timeframe)
            if market_data.empty:
                raise ValueError(f"No market data available for {symbol}")
            
            # Step 2: Calculate technical indicators
            indicators = await self.market_data_service.calculate_technical_indicators(market_data)
            
            # Step 3: Run both analyses in parallel
            qwen_task = self.qwen.analyze_market_data(symbol, market_data, indicators)
            gemini_task = None
            
            if include_chart:
                gemini_task = self.gemini.analyze_chart_and_sentiment(symbol, market_data)
            
            # Wait for analyses
            qwen_result = await qwen_task
            gemini_result = await gemini_task if gemini_task else None
            
            # Step 4: Combine results
            combined_decision = self._combine_analyses(
                symbol, qwen_result, gemini_result, market_data, indicators
            )
            
            logger.info(f"Hybrid analysis completed for {symbol}: {combined_decision['action']} (confidence: {combined_decision['confidence']:.2f})")
            
            return combined_decision
            
        except Exception as e:
            logger.error(f"Hybrid analysis failed for {symbol}: {e}")
            return self._fallback_decision(symbol)
    
    def _combine_analyses(
        self, 
        symbol: str,
        qwen_result: Dict[str, Any], 
        gemini_result: Optional[Dict[str, Any]],
        market_data: pd.DataFrame,
        indicators: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Combine Qwen and Gemini analyses into final decision."""
        
        try:
            # Base decision on Qwen (quantitative analysis)
            decision = {
                "symbol": symbol,
                "timestamp": datetime.utcnow().isoformat(),
                "action": qwen_result.get("action", "hold"),
                "confidence": qwen_result.get("confidence", 0.5),
                "reasoning": "",
                "risk_level": qwen_result.get("risk_level", "medium"),
                
                # Analysis breakdown
                "qwen_analysis": qwen_result,
                "gemini_analysis": gemini_result,
                "technical_indicators": indicators,
                
                # Meta information
                "models_used": ["qwen"],
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "data_points": len(market_data)
            }
            
            # If Gemini analysis is available, combine decisions
            if gemini_result:
                decision["models_used"].append("gemini")
                
                # Voting mechanism
                qwen_action = qwen_result.get("action", "hold")
                gemini_action = gemini_result.get("action", "hold")
                qwen_confidence = qwen_result.get("confidence", 0.5)
                gemini_confidence = gemini_result.get("confidence", 0.5)
                
                # If both agree, increase confidence
                if qwen_action == gemini_action:
                    decision["confidence"] = min(1.0, (qwen_confidence + gemini_confidence) / 1.5)
                    decision["reasoning"] = f"Both quantitative and visual analysis suggest {qwen_action}. "
                    
                # If they disagree, use weighted average
                else:
                    # Qwen gets 60% weight (quantitative more reliable)
                    # Gemini gets 40% weight (visual confirmation)
                    qwen_weight = 0.6
                    gemini_weight = 0.4
                    
                    combined_confidence = (qwen_confidence * qwen_weight + gemini_confidence * gemini_weight)
                    
                    # If confidence is low, default to hold
                    if combined_confidence < 0.6:
                        decision["action"] = "hold"
                        decision["confidence"] = combined_confidence
                        decision["reasoning"] = f"Mixed signals: Qwen suggests {qwen_action}, Gemini suggests {gemini_action}. "
                    else:
                        # Use higher confidence analysis
                        if qwen_confidence > gemini_confidence:
                            decision["action"] = qwen_action
                        else:
                            decision["action"] = gemini_action
                        
                        decision["confidence"] = combined_confidence
                        decision["reasoning"] = f"Weighted decision: Qwen({qwen_action}, {qwen_confidence:.2f}) vs Gemini({gemini_action}, {gemini_confidence:.2f}). "
            
            # Add reasoning from both models
            if qwen_result.get("reasoning"):
                decision["reasoning"] += f"Quantitative: {qwen_result['reasoning']} "
            
            if gemini_result and gemini_result.get("reasoning"):
                decision["reasoning"] += f"Visual: {gemini_result['reasoning']}"
            
            # Risk assessment
            decision["risk_assessment"] = self._assess_risk(decision, indicators, market_data)
            
            return decision
            
        except Exception as e:
            logger.error(f"Error combining analyses: {e}")
            return self._fallback_decision(symbol)
    
    def _assess_risk(
        self, 
        decision: Dict[str, Any], 
        indicators: Dict[str, Any],
        market_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Assess overall risk for the trading decision."""
        
        try:
            risk_factors = []
            risk_score = 0.5  # Neutral
            
            # Volatility risk
            volatility = indicators.get('volatility_20d', 0)
            if volatility > 0.5:  # High volatility
                risk_factors.append("high_volatility")
                risk_score += 0.2
            elif volatility < 0.1:  # Very low volatility
                risk_factors.append("low_liquidity_risk")
                risk_score += 0.1
            
            # Trend consistency risk
            if decision.get("qwen_analysis", {}).get("momentum_score", 0.5) < 0.3:
                risk_factors.append("weak_momentum")
                risk_score += 0.15
            
            # Model disagreement risk
            if decision.get("gemini_analysis") and decision["models_used"]:
                qwen_action = decision["qwen_analysis"].get("action")
                gemini_action = decision["gemini_analysis"].get("action")
                if qwen_action != gemini_action:
                    risk_factors.append("model_disagreement")
                    risk_score += 0.2
            
            # Low confidence risk
            if decision["confidence"] < 0.6:
                risk_factors.append("low_confidence")
                risk_score += 0.1
            
            # Normalize risk score
            risk_score = min(1.0, max(0.0, risk_score))
            
            return {
                "risk_score": risk_score,
                "risk_factors": risk_factors,
                "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.4 else "low",
                "volatility": volatility,
                "confidence_adjusted_score": risk_score * decision["confidence"]
            }
            
        except Exception as e:
            logger.warning(f"Risk assessment error: {e}")
            return {
                "risk_score": 0.8,
                "risk_factors": ["assessment_error"],
                "risk_level": "high"
            }
    
    def _fallback_decision(self, symbol: str) -> Dict[str, Any]:
        """Fallback decision when hybrid analysis fails."""
        return {
            "symbol": symbol,
            "timestamp": datetime.utcnow().isoformat(),
            "action": "hold",
            "confidence": 0.0,
            "reasoning": "Hybrid analysis system unavailable",
            "risk_level": "high",
            "models_used": ["fallback"],
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "error": "System unavailable"
        }


# Global instance
hybrid_ai = HybridTradingAI()