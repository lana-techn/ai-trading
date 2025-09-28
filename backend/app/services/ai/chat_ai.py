"""
AI Chat service for trading questions and assistance.
Provides conversational AI interface for trading-related queries.
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import re

# AI imports
import google.generativeai as genai
from transformers import pipeline

from app.core.config import settings, get_ai_config
from app.services.ai.hybrid_ai import hybrid_ai
from app.services.data.market_data import market_data_service
from app.utils.logger import get_logger

logger = get_logger(__name__)

class TradingChatAI:
    """AI-powered chat assistant for trading queries."""
    
    def __init__(self):
        self.config = get_ai_config()
        self.gemini_model = None
        self.conversation_history: Dict[str, List[Dict[str, Any]]] = {}
        self._initialized = False
        
        # Trading context and knowledge
        self.trading_context = {
            "supported_markets": ["crypto", "forex", "stocks"],
            "supported_symbols": {
                "crypto": ["BTC-USD", "ETH-USD", "ADA-USD", "SOL-USD", "DOGE-USD"],
                "forex": ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD"],
                "stocks": ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"]
            },
            "trading_strategies": [
                "scalping", "swing trading", "day trading", "position trading",
                "arbitrage", "momentum trading", "mean reversion"
            ],
            "technical_indicators": [
                "RSI", "MACD", "Moving Averages", "Bollinger Bands", 
                "Stochastic", "ATR", "Volume indicators"
            ]
        }
    
    async def initialize(self):
        """Initialize the chat AI service."""
        if self._initialized:
            return
        
        try:
            if self.config["gemini_api_key"]:
                genai.configure(api_key=self.config["gemini_api_key"])
                self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
                logger.info("Chat AI initialized with Gemini")
            else:
                logger.warning("Gemini API key not available for chat")
            
            self._initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize chat AI: {e}")
            self._initialized = False
    
    async def process_message(
        self, 
        message: str, 
        user_id: Optional[str] = None,
        session_id: Optional[str] = "default",
        image_analysis_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process a chat message and return AI response."""
        
        if not self._initialized:
            await self.initialize()
        
        try:
            # Analyze message intent
            intent = await self._analyze_intent(message)
            
            # Get conversation context
            context = self._get_conversation_context(session_id)
            
            # Check if message is related to image analysis
            if image_analysis_id:
                response = await self._handle_image_analysis_query(message, image_analysis_id, context)
            elif intent["type"] == "analysis_request":
                response = await self._handle_analysis_request(message, intent, context)
            elif intent["type"] == "market_query":
                response = await self._handle_market_query(message, intent, context)
            elif intent["type"] == "educational":
                response = await self._handle_educational_query(message, intent, context)
            elif intent["type"] == "general_trading":
                response = await self._handle_general_trading_query(message, intent, context)
            else:
                response = await self._handle_general_query(message, context)
            
            # Store conversation
            self._store_conversation(session_id, message, response)
            
            return {
                "success": True,
                "response": response["text"],
                "intent": intent,
                "suggestions": response.get("suggestions", []),
                "actions": response.get("actions", []),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Chat processing failed: {e}")
            return {
                "success": False,
                "response": "I'm sorry, I'm having trouble processing your request right now. Please try again.",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze user message intent."""
        
        message_lower = message.lower()
        intent = {
            "type": "general",
            "confidence": 0.5,
            "entities": {}
        }
        
        # Extract symbols
        symbol_patterns = [
            r'\\b([A-Z]{3,5}-[A-Z]{3})\\b',  # BTC-USD format
            r'\\b([A-Z]{6})\\b',              # EURUSD format  
            r'\\b([A-Z]{2,5})\\b'             # AAPL format
        ]
        
        symbols = []
        for pattern in symbol_patterns:
            matches = re.findall(pattern, message.upper())
            symbols.extend(matches)
        
        if symbols:
            intent["entities"]["symbols"] = list(set(symbols))
        
        # Intent classification
        if any(word in message_lower for word in ["analyze", "analysis", "predict", "forecast", "recommendation"]):
            intent["type"] = "analysis_request"
            intent["confidence"] = 0.8
            
        elif any(word in message_lower for word in ["price", "chart", "market", "trading", "volume"]):
            intent["type"] = "market_query"
            intent["confidence"] = 0.7
            
        elif any(word in message_lower for word in ["learn", "explain", "what is", "how to", "tutorial"]):
            intent["type"] = "educational"
            intent["confidence"] = 0.8
            
        elif any(word in message_lower for word in ["strategy", "risk", "portfolio", "investment"]):
            intent["type"] = "general_trading"
            intent["confidence"] = 0.7
        
        return intent
    
    async def _handle_analysis_request(
        self, 
        message: str, 
        intent: Dict[str, Any], 
        context: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle requests for market analysis."""
        
        symbols = intent.get("entities", {}).get("symbols", [])
        
        if not symbols:
            return {
                "text": "I'd be happy to analyze a trading symbol for you! Please specify which symbol you'd like me to analyze (e.g., BTC-USD, AAPL, EURUSD).",
                "suggestions": [
                    "Analyze BTC-USD",
                    "What's the outlook for AAPL?",
                    "Give me analysis on EURUSD"
                ]
            }
        
        symbol = symbols[0]  # Use first symbol found
        
        try:
            # Get AI analysis
            analysis = await hybrid_ai.analyze_symbol(symbol)
            
            if not analysis or not analysis.get("success", True):
                return {
                    "text": f"I wasn't able to get current analysis for {symbol}. This could be due to market hours or data availability. Would you like me to try a different symbol?",
                    "suggestions": ["Try BTC-USD", "Try AAPL", "Try EURUSD"]
                }
            
            # Format analysis response
            action = analysis.get("action", "hold")
            confidence = analysis.get("confidence", 0) * 100
            risk_level = analysis.get("risk_level", "medium")
            reasoning = analysis.get("reasoning", "")
            
            response_text = f"""
📊 **Analysis for {symbol}**

**Recommendation:** {action.upper()}
**Confidence:** {confidence:.0f}%
**Risk Level:** {risk_level.upper()}

**AI Reasoning:**
{reasoning}

**Models Used:** {', '.join(analysis.get('models_used', []))}

Would you like me to analyze another symbol or explain any part of this analysis in more detail?
""".strip()
            
            return {
                "text": response_text,
                "suggestions": [
                    f"Explain the {action} recommendation",
                    "What are the key risks?",
                    "Analyze another symbol",
                    "Show technical indicators"
                ],
                "actions": [
                    {
                        "type": "analysis_result",
                        "data": analysis
                    }
                ]
            }
            
        except Exception as e:
            logger.error(f"Analysis request failed: {e}")
            return {
                "text": f"I encountered an error while analyzing {symbol}. Please try again or ask about a different symbol.",
                "suggestions": ["Try a different symbol", "Ask about market conditions"]
            }
    
    async def _handle_market_query(
        self, 
        message: str, 
        intent: Dict[str, Any], 
        context: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle general market queries."""
        
        if self.gemini_model:
            try:
                # Build market context
                market_context = f"""
You are a professional trading assistant. Current context:
- Supported markets: {', '.join(self.trading_context['supported_markets'])}
- Popular symbols: {self.trading_context['supported_symbols']}
- User query: {message}

Provide a helpful, informative response about the market query. Keep it concise and actionable.
If the user asks about specific symbols, suggest they use the analysis feature.
"""
                
                response = self.gemini_model.generate_content(market_context)
                
                return {
                    "text": response.text,
                    "suggestions": [
                        "Get analysis for a specific symbol",
                        "What are the market hours?",
                        "Explain technical indicators"
                    ]
                }
                
            except Exception as e:
                logger.error(f"Gemini market query failed: {e}")
        
        # Fallback response
        return {
            "text": "I can help you with market information! You can ask me about:\n\n• Price analysis for specific symbols (BTC-USD, AAPL, EURUSD, etc.)\n• Technical indicators and their meanings\n• Trading strategies and risk management\n• Market conditions and trends\n\nWhat would you like to know more about?",
            "suggestions": [
                "Analyze BTC-USD",
                "Explain RSI indicator", 
                "What is swing trading?",
                "Show me popular symbols"
            ]
        }
    
    async def _handle_educational_query(
        self, 
        message: str, 
        intent: Dict[str, Any], 
        context: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle educational/learning queries."""
        
        if self.gemini_model:
            try:
                educational_prompt = f"""
You are an expert trading educator. The user is asking: "{message}"

Provide a clear, educational response that:
1. Explains the concept simply
2. Gives practical examples
3. Relates to trading/investing
4. Suggests next learning steps

Keep it conversational and beginner-friendly while being accurate.
"""
                
                response = self.gemini_model.generate_content(educational_prompt)
                
                return {
                    "text": response.text,
                    "suggestions": [
                        "Learn about technical analysis",
                        "Understand risk management",
                        "Explore trading strategies",
                        "Practice with paper trading"
                    ]
                }
                
            except Exception as e:
                logger.error(f"Educational query failed: {e}")
        
        # Fallback educational response
        educational_topics = {
            "rsi": "RSI (Relative Strength Index) is a momentum indicator that measures the speed and magnitude of price changes. Values above 70 suggest overbought conditions, while values below 30 suggest oversold conditions.",
            "macd": "MACD (Moving Average Convergence Divergence) is a trend-following indicator that shows the relationship between two moving averages. It helps identify trend changes and momentum.",
            "support": "Support levels are price points where an asset tends to stop falling and bounce back up. They represent areas where buying interest is strong enough to overcome selling pressure.",
            "resistance": "Resistance levels are price points where an asset tends to stop rising and pull back down. They represent areas where selling pressure overcomes buying interest."
        }
        
        message_lower = message.lower()
        for topic, explanation in educational_topics.items():
            if topic in message_lower:
                return {
                    "text": f"📚 **{topic.upper()}**\n\n{explanation}\n\nWould you like me to show you how this indicator works with a specific symbol?",
                    "suggestions": [
                        f"Show {topic.upper()} for BTC-USD",
                        "Learn about other indicators",
                        "Explain trading strategies"
                    ]
                }
        
        return {
            "text": "I'd love to help you learn about trading! I can explain:\n\n📈 **Technical Indicators:** RSI, MACD, Moving Averages, Bollinger Bands\n📊 **Chart Patterns:** Support/Resistance, Trends, Breakouts\n💰 **Trading Strategies:** Day Trading, Swing Trading, Position Trading\n⚠️ **Risk Management:** Position Sizing, Stop Losses, Portfolio Diversification\n\nWhat would you like to learn about?",
            "suggestions": [
                "What is RSI?",
                "Explain support and resistance",
                "How to manage risk?",
                "What is MACD?"
            ]
        }
    
    async def _handle_general_trading_query(
        self, 
        message: str, 
        intent: Dict[str, Any], 
        context: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle general trading questions."""
        
        if self.gemini_model:
            try:
                trading_prompt = f"""
You are a professional trading advisor. User question: "{message}"

Provide practical trading advice that:
1. Is educational and informative
2. Emphasizes risk management
3. Is suitable for the user's apparent experience level
4. Includes actionable insights

Always remind users that trading involves risks and to never invest more than they can afford to lose.
"""
                
                response = self.gemini_model.generate_content(trading_prompt)
                
                return {
                    "text": response.text + "\n\n⚠️ *Remember: Trading involves significant risk. Never invest more than you can afford to lose.*",
                    "suggestions": [
                        "Get symbol analysis",
                        "Learn about risk management", 
                        "Explore trading strategies",
                        "Ask about market conditions"
                    ]
                }
                
            except Exception as e:
                logger.error(f"Trading query failed: {e}")
        
        # Fallback response
        return {
            "text": "I can help with various trading topics:\n\n💹 **Analysis:** Get AI-powered analysis for any symbol\n📚 **Education:** Learn about indicators, patterns, and strategies\n⚖️ **Risk Management:** Understand position sizing and stop losses\n📈 **Strategy:** Explore different trading approaches\n\nWhat specific aspect of trading interests you most?",
            "suggestions": [
                "Analyze a symbol",
                "Learn about risk management",
                "Explain trading strategies", 
                "Show popular symbols"
            ]
        }
    
    async def _handle_general_query(
        self, 
        message: str, 
        context: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle general queries that don't fit other categories."""
        
        return {
            "text": "Hello! I'm your AI trading assistant. I can help you with:\n\n🤖 **AI Analysis:** Get hybrid AI analysis for any trading symbol\n📊 **Market Data:** Real-time prices and market information\n📚 **Education:** Learn about trading concepts and strategies\n💬 **Chat:** Ask me anything about trading and investing\n\nTry asking: 'Analyze BTC-USD' or 'What is RSI?'",
            "suggestions": [
                "Analyze BTC-USD",
                "Show popular symbols",
                "What is technical analysis?",
                "Explain risk management"
            ]
        }
    
    def _get_conversation_context(self, session_id: str) -> List[Dict[str, Any]]:
        """Get conversation history for context."""
        return self.conversation_history.get(session_id, [])[-5:]  # Last 5 messages
    
    def _store_conversation(
        self, 
        session_id: str, 
        user_message: str, 
        ai_response: Dict[str, Any]
    ):
        """Store conversation for context."""
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        self.conversation_history[session_id].append({
            "timestamp": datetime.utcnow().isoformat(),
            "user_message": user_message,
            "ai_response": ai_response["text"],
            "intent": ai_response.get("intent")
        })
        
        # Keep only last 20 messages per session
        if len(self.conversation_history[session_id]) > 20:
            self.conversation_history[session_id] = self.conversation_history[session_id][-20:]
    
    async def _handle_image_analysis_query(
        self,
        message: str,
        image_analysis_id: int,
        context: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle queries related to uploaded image analysis."""
        
        try:
            # Get image analysis from database
            from app.core.database import get_async_db
            from app.models.models import ImageAnalysis
            
            async with get_async_db() as db:
                result = await db.execute(
                    db.query(ImageAnalysis).filter(ImageAnalysis.id == image_analysis_id)
                )
                analysis = result.first()
                
                if not analysis:
                    return {
                        "text": "I couldn't find the image analysis you're referring to. Could you please upload the image again?",
                        "suggestions": ["Upload new image", "Ask general trading question"]
                    }
                
                # Create context for follow-up questions
                analysis_context = f"""
User is asking about a previously analyzed chart:
- Symbol: {analysis.symbol_detected or 'Unknown'}
- Trading Signal: {analysis.trading_signal.value if analysis.trading_signal else 'None'}
- Confidence: {analysis.confidence_score or 0:.2f}
- Analysis Summary: {analysis.analysis_summary or 'No summary'}
- Key Insights: {analysis.key_insights or []}
- Technical Indicators: {analysis.technical_indicators or {}}
- Support Levels: {analysis.support_levels or []}
- Resistance Levels: {analysis.resistance_levels or []}
- Risk Level: {analysis.risk_level or 'Unknown'}

User's follow-up question: {message}
"""
                
                if self.gemini_model:
                    prompt = f"""
You are a trading expert helping a user understand their chart analysis.

{analysis_context}

Provide a helpful, detailed response that:
1. Directly answers their question
2. References specific details from the analysis
3. Provides actionable trading insights
4. Maintains educational focus
5. Includes appropriate risk warnings

Be conversational and helpful while staying focused on the analysis data.
"""
                    
                    response = self.gemini_model.generate_content(prompt)
                    
                    return {
                        "text": response.text + "\n\n⚠️ *Remember: This analysis is for educational purposes. Always do your own research.*",
                        "suggestions": [
                            "Explain the technical indicators",
                            "What are the key risk factors?",
                            "How should I interpret the signals?",
                            "Upload another chart for analysis"
                        ]
                    }
                else:
                    # Fallback response
                    symbol = analysis.symbol_detected or "this symbol"
                    signal = analysis.trading_signal.value if analysis.trading_signal else "HOLD"
                    
                    return {
                        "text": f"Based on your uploaded chart analysis for {symbol}, I recommended a {signal} signal. \n\nThe analysis showed key insights like {', '.join(analysis.key_insights[:2]) if analysis.key_insights else 'price action and trend analysis'}. \n\nWhat specific aspect would you like me to explain further?",
                        "suggestions": [
                            "Explain the trading signal",
                            "What are the risks?",
                            "Show support/resistance levels",
                            "Upload new chart"
                        ]
                    }
                    
        except Exception as e:
            logger.error(f"Image analysis query failed: {e}")
            return {
                "text": "I had trouble accessing your previous analysis. Could you clarify what you'd like to know, or upload the image again?",
                "suggestions": ["Upload chart image", "Ask general question"]
            }
    
    def get_conversation_stats(self) -> Dict[str, Any]:
        """Get conversation statistics."""
        total_conversations = len(self.conversation_history)
        total_messages = sum(len(conv) for conv in self.conversation_history.values())
        
        return {
            "total_sessions": total_conversations,
            "total_messages": total_messages,
            "active_sessions": len([s for s in self.conversation_history.keys() 
                                 if self.conversation_history[s] and 
                                 datetime.fromisoformat(self.conversation_history[s][-1]["timestamp"]) > 
                                 datetime.utcnow() - timedelta(hours=1)]),
            "initialized": self._initialized
        }

# Global chat AI instance
chat_ai = TradingChatAI()