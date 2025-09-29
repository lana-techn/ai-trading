"use client"

import { useState, FormEvent, useEffect } from "react"
import { Bot, TrendingUp, BarChart3, Activity, AlertTriangle, DollarSign, Target, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"
import { MarketData } from "@/lib/mock-data"
import { 
  analyzeMarket, 
  generateAIResponse, 
  generateAIInsights, 
  MarketAnalysis,
  AIInsight 
} from "@/lib/ai-analysis"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isAnalysis?: boolean
}

interface AITradingChatProps {
  symbol: string
  data: MarketData[]
  position?: "bottom-right" | "bottom-left"
  size?: "sm" | "md" | "lg" | "xl" | "full"
  autoAnalyze?: boolean
}

export function AITradingChat({ 
  symbol, 
  data, 
  position = "bottom-right", 
  size = "lg",
  autoAnalyze = true 
}: AITradingChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])

  // Perform initial analysis when component mounts or data changes
  useEffect(() => {
    if (!symbol) {
      return;
    }

    if (!data || !Array.isArray(data)) {
      setMessages([{
        id: 1,
        content: `🤖 **AI Trading Assistant for ${symbol}**\n\n⏳ **Initializing...** Please wait while I load market data.\n\n💡 **Available Commands**:\n• "price" - Current price info\n• "trend" - Market direction\n• "help" - Get assistance`,
        sender: "ai",
        timestamp: new Date()
      }]);
      return;
    }

    if (data.length < 5) {
      setMessages([{
        id: 1,
        content: `🤖 **AI Trading Assistant for ${symbol}**\n\n⏳ **Loading market data...** (${data.length}/60 points)\n\nPlease wait while I gather sufficient data for technical analysis.\n\n💡 **Try these commands**:\n• "price" - Get current price\n• "help" - More information`,
        sender: "ai",
        timestamp: new Date()
      }]);
      return;
    }

    if (!autoAnalyze) {
      return;
    }
    
    try {
      if (data.length < 5) {
        throw new Error(`Insufficient data: only ${data.length} points available`);
      }
      const marketAnalysis = analyzeMarket(data, symbol)
      const aiInsights = generateAIInsights(data, marketAnalysis, symbol)
      setAnalysis(marketAnalysis)
      setInsights(aiInsights)

        // Add welcome message with initial analysis
        const welcomeMessage: Message = {
          id: 1,
          content: `**Welcome! AI Trading Assistant is Ready**\n\n` +
                   `**Current Analysis for ${symbol}**\n` +
                   `• **Market Trend**: ${marketAnalysis.trend === 'bullish' ? 'BULLISH ↑' : marketAnalysis.trend === 'bearish' ? 'BEARISH ↓' : 'SIDEWAYS →'}\n` +
                   `• **Buy Confidence**: ${marketAnalysis.signals.buy}%\n` +
                   `• **Sell Confidence**: ${marketAnalysis.signals.sell}%\n` +
                   `• **Live Price**: $${data[data.length - 1]?.close.toFixed(2)}\n\n` +
                   `**How to Get Started**\n` +
                   `• Ask "analysis" for detailed technical review\n` +
                   `• Ask "buy" for specific trading recommendations\n` +
                   `• Ask "trend" to understand market direction\n` +
                   `• Ask "price" for target levels and support/resistance\n\n` +
                   `**Quick Tip**: Use the command buttons above for instant insights!`,
          sender: "ai",
          timestamp: new Date(),
          isAnalysis: true
        }

        setMessages([welcomeMessage])

        // Add top insight as second message if available
        if (aiInsights.length > 0) {
          const topInsight = aiInsights[0]
          const insightMessage: Message = {
            id: 2,
            content: `🎯 **${topInsight.title}**\n\n${topInsight.description}\n\n📊 **Confidence**: ${topInsight.confidence}% | **Impact**: ${topInsight.impact === 'positive' ? '📈 Positive' : topInsight.impact === 'negative' ? '📉 Negative' : '➡️ Neutral'}`,
            sender: "ai",
            timestamp: new Date(),
            isAnalysis: true
          }
          setMessages(prev => [...prev, insightMessage])
        }
    } catch (error) {
      console.error('Analysis error:', error)
      
      setMessages([{
        id: 1,
        content: `🤖 **AI Trading Assistant for ${symbol}**\n\n⏳ **Loading market data...** (${data.length}/60 points)\n\nPlease wait while I gather sufficient market data for analysis.\n\n💡 **Available Commands**:\n• "price" - Current price info\n• "trend" - Basic market direction\n• "help" - More information`,
        sender: "ai",
        timestamp: new Date()
      }])
    }
  }, [symbol, data, autoAnalyze])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI processing delay
    setTimeout(() => {
      try {
        const aiResponse = generateAIResponse(input, data, symbol, analysis || undefined)
        const aiMessage: Message = {
          id: messages.length + 2,
          content: aiResponse,
          sender: "ai",
          timestamp: new Date(),
          isAnalysis: input.toLowerCase().includes('analysis') || input.toLowerCase().includes('analisis')
        }
        
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        const errorMessage: Message = {
          id: messages.length + 2,
          content: `⚠️ Maaf, terjadi kesalahan saat menganalisis ${symbol}. Silakan coba lagi atau tanyakan hal lain tentang trading.`,
          sender: "ai",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }, 1000)
  }

  const quickActions = [
    { label: "📊 Full Analysis", query: "analysis" },
    { label: "💰 Price Update", query: "price" },
    { label: "🎯 Buy Recommendation", query: "buy" },
    { label: "📈 Trend Analysis", query: "trend" }
  ]

  const handleQuickAction = (query: string) => {
    setInput(query)
  }

  const getTrendIcon = () => {
    if (!analysis) return <Bot className="h-6 w-6" />
    
    switch (analysis.trend) {
      case 'bullish':
        return <TrendingUp className="h-6 w-6 text-green-500" />
      case 'bearish':
        return <Activity className="h-6 w-6 text-red-500" />
      default:
        return <BarChart3 className="h-6 w-6 text-blue-500" />
    }
  }

  const getHeaderStatus = () => {
    if (!analysis) return "Ready to Analyze"
    
    const confidence = Math.max(analysis.signals.buy, analysis.signals.sell, analysis.signals.hold)
    return `${analysis.trend.toUpperCase()} • ${confidence}% confidence`
  }

  return (
    <ExpandableChat
      size={size}
      position={position}
      icon={getTrendIcon()}
      className="transition-all duration-300"
    >
      <ExpandableChatHeader className="relative bg-black text-white border-b border-gray-800">
        <div className="flex flex-col items-center justify-center py-6 px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <Bot className="h-6 w-6 text-black" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white mb-1">AI Trading Assistant</h1>
              <p className="text-xs text-gray-400">Smart Analysis & Insights</p>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <span className="text-2xl font-mono font-bold text-white">{symbol}</span>
            <div className="text-sm text-gray-400 mt-1">{getHeaderStatus()}</div>
          </div>
          
          {analysis && (
            <div className="flex items-center justify-center gap-6 bg-gray-900 rounded-xl px-6 py-3 border border-gray-700">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  analysis.trend === 'bullish' 
                    ? 'bg-white text-black'
                    : analysis.trend === 'bearish'
                    ? 'bg-gray-800 text-white border border-gray-600'
                    : 'bg-gray-700 text-white'
                }`}>
                  {analysis.trend === 'bullish' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : analysis.trend === 'bearish' ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <Activity className="h-4 w-4" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Trend</div>
                  <div className="text-sm font-semibold text-white">{analysis.trend.toUpperCase()}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg">
                  <DollarSign className="h-4 w-4 text-black" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Price</div>
                  <div className="text-sm font-mono font-bold text-white">
                    ${data[data.length - 1]?.close.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody className="bg-white">
        <ChatMessageList className="p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-4 ${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}>
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 ${
                message.sender === "user" 
                  ? "bg-black text-white border-gray-800" 
                  : "bg-white text-black border-gray-300"
              }`}>
                {message.sender === "user" ? (
                  <span className="text-xs font-bold tracking-wide">YOU</span>
                ) : (
                  <Bot className="h-6 w-6" />
                )}
              </div>
              
              <div className={`max-w-[75%] ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}>
                <div className={`inline-block px-6 py-4 rounded-2xl shadow-lg border-2 ${
                  message.sender === "user" 
                    ? "bg-black text-white border-gray-800 rounded-tr-md"
                    : message.isAnalysis 
                    ? "bg-gray-50 text-gray-900 border-gray-200 rounded-tl-md"
                    : "bg-white text-gray-900 border-gray-300 rounded-tl-md"
                }`}>
                  {message.isAnalysis ? (
                    <div className="space-y-4">
                      {message.content.split('\n\n').map((section, index) => {
                        if (section.includes('**') || section.includes('•')) {
                          return (
                            <div key={index} className="space-y-3">
                              {section.split('\n').map((line, lineIndex) => {
                                if (line.includes('**')) {
                                  const parts = line.split('**')
                                  return (
                                    <div key={lineIndex} className="mb-3">
                                      {parts.map((part, partIndex) => 
                                        partIndex % 2 === 1 ? (
                                          <span key={partIndex} className="font-bold text-black text-lg">
                                            {part}
                                          </span>
                                        ) : (
                                          <span key={partIndex} className="text-gray-700">
                                            {part}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )
                                }
                                if (line.includes('•')) {
                                  return (
                                    <div key={lineIndex} className="flex items-start gap-3 py-1">
                                      <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-800 leading-relaxed">{line.replace('•', '').trim()}</span>
                                    </div>
                                  )
                                }
                                return (
                                  <div key={lineIndex} className="text-gray-700 leading-relaxed">
                                    {line}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }
                        return (
                          <div key={index} className="text-gray-700 leading-relaxed">
                            {section}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className={`whitespace-pre-line leading-relaxed ${
                      message.sender === "user" ? "text-white" : "text-gray-800"
                    }`}>
                      {message.content}
                    </div>
                  )}
                </div>
                
                <div className={`text-xs opacity-60 mt-1 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}>
                  {message.timestamp.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black border-2 border-gray-300 flex items-center justify-center shadow-lg">
                <Bot className="h-6 w-6 animate-pulse" />
              </div>
              <div className="max-w-[75%]">
                <div className="inline-block px-6 py-4 rounded-2xl rounded-tl-md bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="font-medium text-gray-800">Analyzing market data...</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Please wait while I process the information
                  </div>
                </div>
              </div>
            </div>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter className="bg-gray-100 border-t border-gray-300">
        {/* Quick Actions */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 bg-black rounded-md">
              <Target className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-black">Quick Commands</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className={`h-11 font-medium border-2 border-gray-300 bg-white text-gray-800 hover:border-black hover:bg-black hover:text-white transition-all duration-200 shadow-sm hover:shadow-md group ${
                  index === 0 ? 'bg-black text-white border-black' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{action.label.split(' ')[0]}</span>
                  <span className="hidden sm:inline text-sm">
                    {action.label.split(' ').slice(1).join(' ')}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <form
            onSubmit={handleSubmit}
            className="relative bg-white rounded-xl border-2 border-gray-300 focus-within:border-black transition-all duration-200 shadow-sm focus-within:shadow-lg"
          >
            <div className="flex items-end gap-4 p-4">
              <div className="flex-1">
                <div className="mb-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Ask AI Assistant
                  </label>
                </div>
                <ChatInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Type your question about ${symbol}...`}
                  className="min-h-[48px] resize-none bg-transparent border-0 p-0 text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:outline-none text-base leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e as any)
                    }
                  }}
                />
              </div>
              <Button 
                type="submit" 
                size="sm"
                className={`h-12 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  !input.trim() || isLoading 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Thinking</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </div>
                )}
              </Button>
            </div>
            
            {analysis && (
              <div className="flex items-center justify-between px-4 pb-3 border-t border-gray-200 pt-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Live Analysis Active
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Updated: {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            )}
          </form>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg">⚙️</span>
                <span className="font-semibold">Quick Tips</span>
              </div>
              <div className="space-y-1">
                <div>• Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Enter</kbd> to send message</div>
                <div>• Use <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Shift+Enter</kbd> for new line</div>
                <div>• Try quick commands above for instant analysis</div>
              </div>
            </div>
          </div>
        </div>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}