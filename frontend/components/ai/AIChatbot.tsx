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

export default function AIChatbot({ symbol, className = '' }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
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

${symbol ? `Currently analyzing ${symbol}. ` : ''}What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [symbol]);

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

  const generateContextualResponse = (input: string, currentSymbol?: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('halo')) {
      return `👋 Hello! I'm your AI Trading Assistant. How can I help you with trading analysis today? ${currentSymbol ? `I see you're looking at ${currentSymbol}.` : ''}`;
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
            if (!isOpen) setHasNewMessage(false);
          }}
          className={`
            relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
            ${isOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-180' 
              : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 hover:scale-110'
            }
            flex items-center justify-center text-white
            ${!isOpen ? 'animate-pulse hover:animate-none' : ''}
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
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                  <span className="text-xs font-bold text-white">!</span>
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
          bg-white dark:bg-gray-900 rounded-2xl shadow-2xl 
          border border-gray-200 dark:border-gray-700 z-40 
          flex flex-col 
          animate-in slide-in-from-bottom-5 duration-300
          sm:w-96 sm:h-[600px]
        ">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-2xl">
            <div className="relative">
              <BrainIcon className="h-8 w-8" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Trading Assistant</h3>
              <p className="text-sm opacity-90">
                {isTyping ? 'Typing...' : 'Online • Ready to help'}
              </p>
            </div>
            <div className="ml-auto">
              <SparklesIcon className="h-5 w-5 animate-spin" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl p-3 text-sm
                    ${message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-4'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-4 shadow-md'
                    }
                    ${message.isTyping ? 'animate-pulse' : ''}
                  `}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                  
                  {message.type === 'ai' && !message.isTyping && (
                    <div className="text-xs opacity-70 mt-2 flex items-center gap-2">
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
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
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
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">💡 Suggested questions:</p>
              <div className="space-y-1">
                {SUGGESTED_QUESTIONS.slice(0, 2).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-2 text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-blue-700 dark:text-blue-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about trading analysis..."
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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