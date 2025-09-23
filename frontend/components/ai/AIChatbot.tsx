'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircleIcon,
  XIcon,
  SendIcon,
  BrainIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart3Icon,
  ZapIcon,
  RefreshCwIcon,
  SparklesIcon,
  MicIcon,
  ImageIcon,
  PlusIcon
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  analysis?: AIAnalysis;
}

interface AIAnalysis {
  symbol: string;
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  reasoning: string;
  key_insights: string[];
  risk_assessment: string;
  price_target?: number;
  stop_loss?: number;
}

interface AIChatbotProps {
  symbol?: string;
  className?: string;
  chartData?: any;
  autoAnalyze?: boolean;
}

const QUICK_ACTIONS = [
  { icon: '📊', text: 'Analisis Chart', action: 'analyze', gradient: 'from-blue-500 to-cyan-600' },
  { icon: '💰', text: 'Price Target', action: 'price_target', gradient: 'from-green-500 to-emerald-600' },
  { icon: '📈', text: 'Trading Signal', action: 'signal', gradient: 'from-purple-500 to-pink-600' },
  { icon: '⚠️', text: 'Risk Assessment', action: 'risk', gradient: 'from-orange-500 to-red-600' },
];

const SUGGESTED_QUESTIONS = [
  "Bagaimana outlook AAPL untuk minggu ini?",
  "Apakah TSLA sedang dalam tren bullish?",
  "Level support dan resistance BTC-USD?",
  "Strategi trading untuk pasar volatile?",
];

export default function AIChatbot({ symbol, className = '', chartData, autoAnalyze = true }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  const [tradingOpportunityAlert, setTradingOpportunityAlert] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `🤖 Hi! I'm your AI Trading Assistant! 

I can help you with:
• 📊 Technical analysis
• 📈 Trading signals  
• 💰 Price predictions
• ⚠️ Risk assessment

${symbol ? `Currently analyzing ${symbol}. ` : ''}${autoAnalyze ? 'I\'ll automatically analyze the chart for you!' : 'What would you like to know?'}`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [symbol, autoAnalyze]);
  
  // Auto-analyze when symbol changes
  useEffect(() => {
    if (symbol && autoAnalyze && messages.length > 0) {
      // Add a small delay to let the chart load
      const timer = setTimeout(() => {
        performAutoAnalysis();
        setLastAnalysisTime(Date.now());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [symbol, autoAnalyze]);
  
  // Monitor for trading opportunities in real-time
  useEffect(() => {
    if (!symbol || !chartData || !Array.isArray(chartData)) return;
    
    const interval = setInterval(() => {
      // Check for significant price movements or volume spikes
      const recentData = chartData.slice(-3);
      if (recentData.length < 3) return;
      
      const latestPrice = recentData[recentData.length - 1]?.close;
      const previousPrice = recentData[recentData.length - 2]?.close;
      const priceChangePercent = Math.abs((latestPrice - previousPrice) / previousPrice) * 100;
      
      const latestVolume = recentData[recentData.length - 1]?.volume;
      const avgVolume = recentData.reduce((sum, d) => sum + d.volume, 0) / recentData.length;
      const volumeSpike = latestVolume > avgVolume * 2;
      
      // Trigger alert for significant moves
      if ((priceChangePercent > 2 || volumeSpike) && Date.now() - lastAnalysisTime > 30000) {
        const alertType = priceChangePercent > 5 ? 'HIGH_VOLATILITY' : volumeSpike ? 'VOLUME_SPIKE' : 'PRICE_MOVE';
        sendTradingAlert(alertType, priceChangePercent, volumeSpike);
        setLastAnalysisTime(Date.now());
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [chartData, symbol, lastAnalysisTime]);
  
  const sendTradingAlert = async (alertType: string, priceChange: number, volumeSpike: boolean) => {
    let alertMessage = '';
    
    switch (alertType) {
      case 'HIGH_VOLATILITY':
        alertMessage = `🚨 **High Volatility Alert for ${symbol}**\n\n📊 Price moved ${priceChange.toFixed(2)}% in recent periods!\n⚡ This could be a significant trading opportunity.\n\n🤖 Should I analyze this movement for you?`;
        break;
      case 'VOLUME_SPIKE':
        alertMessage = `📢 **Volume Spike Alert for ${symbol}**\n\n📈 Unusually high trading volume detected!\n💡 This often precedes significant price movements.\n\n🔍 Want me to investigate this pattern?`;
        break;
      case 'PRICE_MOVE':
        alertMessage = `📊 **Price Movement Alert for ${symbol}**\n\n⚡ Notable price change: ${priceChange.toFixed(2)}%\n${volumeSpike ? '📈 Also seeing increased volume!' : ''}\n\n🎯 Shall I provide detailed analysis?`;
        break;
    }
    
    const alertChatMessage: ChatMessage = {
      id: `alert-${Date.now()}`,
      type: 'ai',
      content: alertMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, alertChatMessage]);
    
    // Show notification if chat is closed
    if (!isOpen) {
      setHasNewMessage(true);
      setTradingOpportunityAlert(alertType);
    }
  };

  const performAutoAnalysis = async () => {
    if (!symbol || isLoading) return;
    
    setIsLoading(true);
    setIsTyping(true);
    
    // Add AI thinking message
    const thinkingMessage: ChatMessage = {
      id: 'auto-thinking',
      type: 'ai',
      content: `🔍 I'm automatically analyzing ${symbol} chart for you...`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    
    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'auto-typing',
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch(`http://localhost:8000/api/ai/analyze/${symbol}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const analysis = await response.json();
        
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => msg.id !== 'auto-typing'));
        
        const autoAnalysisMessage = `🎆 **Auto Analysis Complete for ${symbol}**
        
🎯 **Signal:** ${getSignalEmoji(analysis.signal)} **${analysis.signal}**
📊 **Confidence:** ${(analysis.confidence * 100).toFixed(1)}%

💡 **Key Market Insights:**
${analysis.key_insights.map((insight, idx) => `${idx + 1}. ${insight}`).join('\n')}

⚠️ **Risk Assessment:**
${analysis.risk_assessment}

${analysis.price_target ? `🎯 **Price Target:** $${analysis.price_target.toFixed(2)}` : ''}
${analysis.stop_loss ? `🛑 **Stop Loss:** $${analysis.stop_loss.toFixed(2)}` : ''}

🚀 Ready to help with any questions about this analysis!`;
        
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: autoAnalysisMessage,
          timestamp: new Date(),
          analysis,
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Show notification if chat is closed
        if (!isOpen) {
          setHasNewMessage(true);
        }
        
      } else {
        // Remove typing indicator and show error
        setMessages(prev => prev.filter(msg => msg.id !== 'auto-typing'));
        
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: `❌ Sorry, I couldn't automatically analyze ${symbol} right now. The market data service might be temporarily unavailable. You can try asking me manually!`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } catch (error) {
      // Remove typing indicator and show connection error
      setMessages(prev => prev.filter(msg => msg.id !== 'auto-typing'));
      
      const connectionErrorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `🔧 I'm having trouble connecting to the analysis service. Please make sure the backend is running on port 8000, or try asking me manually!`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, connectionErrorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user is asking for analysis
      const isAnalysisRequest = inputValue.toLowerCase().includes('analisis') || 
                               inputValue.toLowerCase().includes('analyze') ||
                               inputValue.toLowerCase().includes('signal') ||
                               inputValue.toLowerCase().includes('chart');

      let aiResponse = '';
      let analysis: AIAnalysis | undefined;

      if (isAnalysisRequest && symbol) {
        // Fetch AI analysis
        try {
          const response = await fetch(`http://localhost:8000/api/ai/analyze/${symbol}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            analysis = await response.json();
            aiResponse = `🎯 **AI Analysis for ${symbol}**

**Signal:** ${getSignalEmoji(analysis.signal)} ${analysis.signal}
**Confidence:** ${(analysis.confidence * 100).toFixed(1)}%

**Key Insights:**
${analysis.key_insights.map((insight, idx) => `${idx + 1}. ${insight}`).join('\n')}

**Risk Assessment:** ${analysis.risk_assessment}

${analysis.price_target ? `🎯 **Price Target:** $${analysis.price_target.toFixed(2)}` : ''}
${analysis.stop_loss ? `🛑 **Stop Loss:** $${analysis.stop_loss.toFixed(2)}` : ''}

Would you like me to explain any part of this analysis?`;
          } else {
            aiResponse = `❌ Sorry, I couldn't analyze ${symbol} right now. Please try again later.`;
          }
        } catch (error) {
          aiResponse = `🔧 There was an error connecting to the analysis service. Please check if the backend is running.`;
        }
      } else {
        // Generate contextual response based on user input
        aiResponse = generateContextualResponse(inputValue, symbol);
      }

      // Remove typing indicator and add AI response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        analysis,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Show notification badge if chat is closed
      if (!isOpen) {
        setHasNewMessage(true);
      }

    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: '❌ Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'analyze':
        message = symbol ? `Analisis chart ${symbol}` : 'Analisis chart';
        break;
      case 'price_target':
        message = symbol ? `Berapa price target ${symbol}?` : 'Berapa price target yang realistis?';
        break;
      case 'signal':
        message = symbol ? `Trading signal untuk ${symbol}` : 'Trading signal saat ini';
        break;
      case 'risk':
        message = symbol ? `Risk assessment ${symbol}` : 'Bagaimana risk management yang baik?';
        break;
    }
    setInputValue(message);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const getSignalEmoji = (signal: string): string => {
    switch (signal) {
      case 'STRONG_BUY': return '🚀';
      case 'BUY': return '📈';
      case 'HOLD': return '⚖️';
      case 'SELL': return '📉';
      case 'STRONG_SELL': return '🔻';
      default: return '❓';
    }
  };

  const analyzeChartPattern = (data: any): string => {
    if (!chartData || !Array.isArray(chartData) || chartData.length < 5) {
      return "";
    }
    
    const recentData = chartData.slice(-5);
    const prices = recentData.map(d => d.close);
    const volumes = recentData.map(d => d.volume);
    
    // Simple pattern recognition
    const isUptrend = prices.every((price, i) => i === 0 || price >= prices[i-1]);
    const isDowntrend = prices.every((price, i) => i === 0 || price <= prices[i-1]);
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeSpike = currentVolume > avgVolume * 1.5;
    
    if (isUptrend && volumeSpike) {
      return "\n\n📈 **Chart Pattern Alert:** I notice a strong uptrend with volume spike - this could indicate bullish momentum!";
    } else if (isDowntrend && volumeSpike) {
      return "\n\n📉 **Chart Pattern Alert:** I see a downtrend with high volume - potential bearish pressure detected!";
    } else if (volumeSpike) {
      return "\n\n📊 **Volume Alert:** Significant volume spike detected - market activity is increasing!";
    }
    
    return "";
  };

  const generateContextualResponse = (input: string, currentSymbol?: string): string => {
    const lowerInput = input.toLowerCase();
    const chartInsight = analyzeChartPattern(chartData);
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('halo')) {
      return `👋 Hello! I'm your AI Trading Assistant. How can I help you with trading analysis today? ${currentSymbol ? `I see you're looking at ${currentSymbol}.` : ''}${chartInsight}`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('bantuan')) {
      return `🆘 **I can help you with:**

📊 **Technical Analysis** - Chart patterns, indicators
📈 **Trading Signals** - Buy/Sell/Hold recommendations  
💰 **Price Targets** - Potential support/resistance levels
⚠️ **Risk Assessment** - Risk management strategies
📱 **Market Updates** - Latest market trends

Just ask me anything about trading or use the quick action buttons below!`;
    }
    
    if (lowerInput.includes('thank') || lowerInput.includes('terima kasih')) {
      return `😊 You're welcome! I'm always here to help with your trading analysis. Feel free to ask me anything!`;
    }
    
    return `🤖 I understand you're asking about "${input}". ${currentSymbol ? `For ${currentSymbol}, ` : ''}I'd be happy to help! 

To get the most accurate analysis, try asking:
• "Analyze the chart"
• "What's the trading signal?"
• "Show me price targets"
• "Risk assessment please"

Or use the quick action buttons for instant analysis!`;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setHasNewMessage(false);
              setTradingOpportunityAlert(null);
            }
          }}
          className={`
            relative w-14 h-14 rounded-full shadow-lg transition-all duration-500 ease-in-out
            ${isOpen 
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rotate-180 shadow-red-500/30' 
              : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 hover:scale-110 shadow-purple-500/30'
            }
            flex items-center justify-center text-white
            ${!isOpen ? 'animate-pulse hover:animate-none' : ''}
            dark:shadow-lg dark:shadow-purple-500/20
          `}
        >
          {isOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <>
              <MessageCircleIcon className="h-6 w-6" />
              {isTyping && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping" />
              )}
              {hasNewMessage && !isTyping && (
                <div className={`
                  absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white 
                  flex items-center justify-center animate-bounce
                  ${
                    tradingOpportunityAlert === 'HIGH_VOLATILITY' ? 'bg-orange-500' :
                    tradingOpportunityAlert === 'VOLUME_SPIKE' ? 'bg-blue-500' :
                    tradingOpportunityAlert === 'PRICE_MOVE' ? 'bg-green-500' :
                    'bg-red-500'
                  }
                `}>
                  <span className="text-xs font-bold text-white">
                    {
                      tradingOpportunityAlert === 'HIGH_VOLATILITY' ? '⚡' :
                      tradingOpportunityAlert === 'VOLUME_SPIKE' ? '📊' :
                      tradingOpportunityAlert === 'PRICE_MOVE' ? '📈' :
                      '!'
                    }
                  </span>
                </div>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="
          fixed bottom-24 right-6 
          w-96 max-w-[calc(100vw-3rem)] 
          h-[600px] max-h-[calc(100vh-8rem)] 
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl 
          border border-gray-200/50 dark:border-gray-700/50 z-40 
          flex flex-col 
          animate-in slide-in-from-bottom-5 duration-500
          sm:w-96 sm:h-[600px]
          dark:shadow-2xl dark:shadow-gray-900/50
          transition-all duration-300 ease-in-out
        ">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 text-white rounded-t-2xl transition-all duration-300">
            <div className="relative">
              <BrainIcon className="h-8 w-8" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 dark:bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse transition-colors duration-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Trading Assistant</h3>
              <p className="text-sm opacity-90 transition-opacity duration-300">
                {isTyping ? 'Typing...' : 'Online • Ready to help'}
              </p>
            </div>
            <div className="ml-auto">
              <SparklesIcon className="h-5 w-5 animate-spin" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-300">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl p-3 text-sm transition-all duration-300
                    ${message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white ml-4 shadow-lg shadow-blue-500/20 dark:shadow-blue-600/30'
                      : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 mr-4 shadow-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
                    }
                    ${message.isTyping ? 'animate-pulse' : ''}
                  `}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce transition-colors duration-300"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce transition-colors duration-300" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                  
                  {message.type === 'ai' && !message.isTyping && (
                    <div className="text-xs opacity-70 mt-2 flex items-center gap-2 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <BrainIcon className="h-3 w-3" />
                      {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {!isLoading && messages.length > 0 && (
            <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 backdrop-blur-sm transition-all duration-300">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {QUICK_ACTIONS.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className={`
                      relative overflow-hidden flex items-center gap-2 p-3 text-xs
                      bg-gradient-to-r ${action.gradient} text-white
                      hover:scale-105 hover:shadow-lg
                      rounded-lg transition-all duration-200
                      active:scale-95
                    `}
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="font-medium">{action.text}</span>
                    <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-200" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-blue-50/30 dark:bg-blue-900/10 backdrop-blur-sm transition-all duration-300">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium transition-colors duration-300">💡 Suggested questions:</p>
              <div className="space-y-1">
                {SUGGESTED_QUESTIONS.slice(0, 2).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-2 text-xs bg-blue-50/80 dark:bg-blue-900/30 hover:bg-blue-100/90 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-300 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300/70 dark:hover:border-blue-700/70 backdrop-blur-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-b-2xl transition-all duration-300">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about trading analysis..."
                className="flex-1 p-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 dark:hover:from-purple-700 dark:hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/25 dark:shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-600/40"
              >
                {isLoading ? (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}