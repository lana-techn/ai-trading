"use client"

import { useState, FormEvent, useEffect, useMemo, useCallback, useRef } from "react"
import { Bot, TrendingUp, BarChart3, Activity, AlertTriangle, DollarSign, Target, TrendingDown, Zap, Brain, GripVertical, Minimize2, Maximize2, X, Move, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import { ChatMessageList } from "@/components/ui/chat-message-list"
import { MarketData } from "@/lib/mock-data"
import { 
  analyzeMarket, 
  generateAIResponse, 
  generateAIInsights, 
  MarketAnalysis,
  AIInsight 
} from "@/lib/ai-analysis"
import { clearIndicatorCache } from "@/lib/analysis/technical-indicators"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isAnalysis?: boolean
  isLoading?: boolean
}

interface EnhancedDraggableAIChatProps {
  symbol: string
  data: MarketData[]
  autoAnalyze?: boolean
  onAnalysisUpdate?: (analysis: MarketAnalysis | null) => void
  className?: string
  initialPosition?: { x?: number; y?: number }
}

// Cache for analysis results
const analysisCache = new Map<string, { analysis: MarketAnalysis; insights: AIInsight[]; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

export function EnhancedDraggableAIChat({ 
  symbol, 
  data, 
  autoAnalyze = true,
  onAnalysisUpdate,
  className,
  initialPosition = {}
}: EnhancedDraggableAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const { theme } = useTheme()
  
  // Chat state management
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  const chatRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  // Detect mobile devices
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Set initial position with better UX and mobile support
  useEffect(() => {
    setMounted(true)
    const updatePosition = () => {
      if (typeof window !== 'undefined') {
        const defaultX = isMobile ? 20 : window.innerWidth - 400
        const defaultY = isMobile ? window.innerHeight - 100 : window.innerHeight - 550
        
        setPosition({
          x: initialPosition.x ?? defaultX,
          y: initialPosition.y ?? defaultY
        })
      }
    }

    updatePosition()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updatePosition)
      return () => window.removeEventListener('resize', updatePosition)
    }
  }, [initialPosition, isMobile])

  // Generate cache key
  const getCacheKey = useCallback((symbol: string, dataLength: number, lastTimestamp: string) => {
    return `${symbol}-${dataLength}-${lastTimestamp}`
  }, [])

  // Memoized analysis computation with caching
  const computeAnalysis = useCallback(async () => {
    if (!data || data.length < 5) {
      return null
    }

    const cacheKey = getCacheKey(symbol, data.length, data[data.length - 1]?.timestamp?.toString() || "")
    const cachedResult = analysisCache.get(cacheKey)
    
    // Check cache validity
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return cachedResult
    }

    try {
      // Use requestIdleCallback for better performance
      return new Promise<{ analysis: MarketAnalysis; insights: AIInsight[]; timestamp: number }>((resolve) => {
        const computeInIdle = () => {
          try {
            const marketAnalysis = analyzeMarket(data, symbol)
            const aiInsights = generateAIInsights(data, marketAnalysis, symbol)
            const result = {
              analysis: marketAnalysis,
              insights: aiInsights,
              timestamp: Date.now()
            }
            
            // Cache the result
            analysisCache.set(cacheKey, result)
            
            // Clean old cache entries (keep only last 5)
            if (analysisCache.size > 5) {
              const entries = Array.from(analysisCache.entries()).sort((a, b) => b[1].timestamp - a[1].timestamp)
              analysisCache.clear()
              entries.slice(0, 5).forEach(([key, value]) => analysisCache.set(key, value))
            }
            
            resolve(result)
          } catch (error) {
            console.error('Analysis computation error:', error)
            resolve({ analysis: null as any, insights: [], timestamp: Date.now() })
          }
        }

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(computeInIdle, { timeout: 5000 })
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(computeInIdle, 0)
        }
      })
    } catch (error) {
      console.error('Analysis error:', error)
      return null
    }
  }, [symbol, data, getCacheKey])

  // Memoized theme-aware styling with mobile optimizations
  const themeStyles = useMemo(() => ({
    container: `${theme === 'dark' ? 'bg-gray-900/96 border-gray-700' : 'bg-white/96 border-gray-200'}`,
    header: `${theme === 'dark' ? 'bg-gray-800/96 text-gray-100' : 'bg-gray-50/96 text-gray-900'}`,
    message: `${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`,
    userBubble: `${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'}`,
    aiBubble: `${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-100 text-gray-900'}`,
    quickAction: `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`,
    toggleButton: `${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600' : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200'}`,
    pulse: `${theme === 'dark' ? 'bg-green-400' : 'bg-green-500'}`
  }), [theme])

  // Performance-optimized analysis effect
  useEffect(() => {
    if (!symbol || !autoAnalyze) return

    const performAnalysis = async () => {
      if (!data || data.length < 5) {
        setMessages([{
          id: 1,
          content: `🤖 **AI Trading Assistant for ${symbol}**\n\n⏳ **Loading market data...** (${data?.length || 0}/60 points)\n\nPlease wait while I gather sufficient data for technical analysis.\n\n💡 **Available Commands**:\n• "price" - Current price info\n• "trend" - Basic market direction\n• "help" - More information`,
          sender: "ai",
          timestamp: new Date()
        }])
        setAnalysis(null)
        setInsights([])
        onAnalysisUpdate?.(null)
        return
      }

      try {
        const result = await computeAnalysis()
        if (result && result.analysis) {
          setAnalysis(result.analysis)
          setInsights(result.insights)
          onAnalysisUpdate?.(result.analysis)

          // Create optimized welcome message
          const welcomeMessage: Message = {
            id: 1,
            content: `**🚀 AI Analysis Ready!**\n\n` +
                     `**${symbol}** (${new Date().toLocaleTimeString()})\n` +
                     `• **Trend**: ${result.analysis.trend === 'bullish' ? '🔥 BULLISH ↑' : result.analysis.trend === 'bearish' ? '❄️ BEARISH ↓' : '➡️ SIDEWAYS'}\n` +
                     `• **Buy Signal**: ${result.analysis.signals.buy}%\n` +
                     `• **Price**: $${data[data.length - 1]?.close.toFixed(2)}\n\n` +
                     `${isMobile ? 'Tap' : 'Click'} quick buttons for instant analysis!`,
            sender: "ai",
            timestamp: new Date(),
            isAnalysis: true
          }

          setMessages([welcomeMessage])

          // Add top insight as second message
          if (result.insights.length > 0) {
            const topInsight = result.insights[0]
            const insightMessage: Message = {
              id: 2,
              content: `💡 **${topInsight.title}**\n\n${topInsight.description}\n\n**Confidence**: ${topInsight.confidence}% | **Impact**: ${topInsight.impact === 'positive' ? '📈' : topInsight.impact === 'negative' ? '📉' : '➡️'} ${topInsight.impact.toUpperCase()}`,
              sender: "ai",
              timestamp: new Date(),
              isAnalysis: true
            }
            setMessages(prev => [...prev, insightMessage])
          }
        }
      } catch (error) {
        console.error('Analysis error:', error)
        setMessages([{
          id: 1,
          content: `🤖 **AI Trading Assistant for ${symbol}**\n\n⚠️ **Analysis temporarily unavailable**\n\nI'm experiencing some technical difficulties. You can still ask me basic questions about:\n• Current price\n• Market trends\n• Trading help`,
          sender: "ai",
          timestamp: new Date()
        }])
      }
    }

    performAnalysis()
  }, [symbol, data, autoAnalyze, computeAnalysis, onAnalysisUpdate, isMobile])

  // Enhanced drag functionality with mobile support
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current?.contains((e.target as Node))) return
    if (isMobile) return // Disable drag on mobile for better touch experience
    
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY
    
    setIsDragging(true)
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    })
    e.preventDefault()
  }, [position, isMobile])

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || isMobile) return

    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY

    const newX = clientX - dragStart.x
    const newY = clientY - dragStart.y

    // Boundary constraints with mobile considerations
    const chatWidth = isOpen ? (isMobile ? 300 : 320) : 64
    const chatHeight = isOpen ? (isMobile ? 400 : 384) : 64
    const maxX = window.innerWidth - chatWidth - 10
    const maxY = window.innerHeight - chatHeight - 10

    setPosition({
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY))
    })
  }, [isDragging, dragStart, isOpen, isMobile])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Attach global mouse and touch events
  useEffect(() => {
    if (isDragging && !isMobile) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove)
      document.addEventListener('touchend', handleMouseUp)
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove)
        document.removeEventListener('touchend', handleMouseUp)
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, isMobile])

  // Optimized message submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Add loading message immediately
    const loadingMessage: Message = {
      id: Date.now() + 1,
      content: "",
      sender: "ai",
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // Use setTimeout for better perceived performance
      setTimeout(() => {
        try {
          const aiResponse = generateAIResponse(input, data, symbol, analysis || undefined)
          const aiMessage: Message = {
            id: Date.now() + 2,
            content: aiResponse,
            sender: "ai",
            timestamp: new Date(),
            isAnalysis: input.toLowerCase().includes('analysis') || input.toLowerCase().includes('analisis')
          }
          
          setMessages(prev => prev.filter(m => !m.isLoading).concat([aiMessage]))
        } catch (error) {
          const errorMessage: Message = {
            id: Date.now() + 2,
            content: `⚠️ Sorry, I encountered an error analyzing ${symbol}. Please try again or ask something else about trading.`,
            sender: "ai",
            timestamp: new Date()
          }
          setMessages(prev => prev.filter(m => !m.isLoading).concat([errorMessage]))
        } finally {
          setIsLoading(false)
        }
      }, 800)
    } catch (error) {
      setIsLoading(false)
      setMessages(prev => prev.filter(m => !m.isLoading))
    }
  }, [input, data, symbol, analysis])

  // Optimized quick actions
  const quickActions = useMemo(() => [
    { label: "📊", query: "analysis", tooltip: "Full Analysis" },
    { label: "💰", query: "price", tooltip: "Price Update" },
    { label: "🎯", query: "buy", tooltip: "Buy Signal" },
    { label: "📈", query: "trend", tooltip: "Trend Analysis" }
  ], [])

  const handleQuickAction = useCallback((query: string) => {
    setInput(query)
    // Auto-submit for better UX
    const event = { preventDefault: () => {} } as FormEvent
    handleSubmit(event)
  }, [handleSubmit])

  // Dynamic icon based on analysis
  const getTrendIcon = useCallback(() => {
    if (!analysis) return <Bot className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-500`} />
    
    switch (analysis.trend) {
      case 'bullish':
        return <TrendingUp className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-500`} />
      case 'bearish':
        return <TrendingDown className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-500`} />
      default:
        return <Activity className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500`} />
    }
  }, [analysis, isMobile])

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear cache when component unmounts
      clearIndicatorCache()
    }
  }, [])

  if (!mounted) return null

  return (
    <div 
      className={cn("fixed z-50 transition-all duration-300", className)}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      ref={chatRef}
    >
      {/* Enhanced Toggle Button */}
      {!isOpen && (
        <div
          className={`${themeStyles.toggleButton} ${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-full border-2 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-sm`}
          onClick={() => setIsOpen(true)}
          title={`AI Analysis for ${symbol}`}
        >
          <div className="relative">
            {getTrendIcon()}
            {insights.length > 0 && (
              <>
                <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-green-500 rounded-full flex items-center justify-center`}>
                  <span className="text-xs text-white font-bold">{insights.length}</span>
                </div>
                {/* Pulse animation for new insights */}
                <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${themeStyles.pulse} rounded-full animate-ping opacity-75`}></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Main Chat Window */}
      {isOpen && (
        <div 
          className={`${themeStyles.container} ${isMobile ? 'w-72' : 'w-80'} ${isMinimized ? 'h-16' : isMobile ? 'h-80' : 'h-96'} rounded-xl border-2 shadow-2xl backdrop-blur-md transition-all duration-300 overflow-hidden`}
        >
          {/* Header with enhanced drag handle */}
          <div 
            ref={dragRef}
            className={`${themeStyles.header} flex items-center justify-between p-3 border-b ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''} select-none`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              {!isMobile && <GripVertical className="h-4 w-4 opacity-50" />}
              <Brain className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-semibold`}>AI Assistant</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content - only visible when not minimized */}
          {!isMinimized && (
            <>
              {/* Status and Quick Actions */}
              <div className="p-2 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{symbol}</span>
                  {analysis && (
                    <div className="text-xs opacity-60 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{insights.length} insights</span>
                    </div>
                  )}
                </div>
                
                {/* Quick Action Buttons with mobile optimization */}
                <div className={`flex ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
                  {quickActions.map((action) => (
                    <Button
                      key={action.query}
                      size="sm"
                      variant="ghost"
                      className={`${themeStyles.quickAction} ${isMobile ? 'text-xs px-1.5 py-1 h-6 flex-1' : 'text-xs px-2 py-1 h-6'}`}
                      onClick={() => handleQuickAction(action.query)}
                      title={action.tooltip}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Messages with mobile optimization */}
              <div className="flex-1 overflow-hidden">
                <ChatMessageList className={`px-3 py-2 ${isMobile ? 'h-44' : 'h-56'} overflow-y-auto`}>
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      variant={message.sender === "user" ? "sent" : "received"}
                      className={message.sender === "user" ? themeStyles.userBubble : themeStyles.aiBubble}
                    >
                      <ChatBubbleAvatar
                        className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} shrink-0 border`}
                        fallback={message.sender === "user" ? "U" : "AI"}
                      />
                      <ChatBubbleMessage
                        variant={message.sender === "user" ? "sent" : "received"}
                        isLoading={message.isLoading}
                        className={`${themeStyles.message} text-xs ${message.isAnalysis ? 'font-medium' : ''}`}
                      >
                        {!message.isLoading && message.content}
                      </ChatBubbleMessage>
                    </ChatBubble>
                  ))}
                </ChatMessageList>
              </div>

              {/* Input with mobile optimization */}
              <div className="p-2 border-t">
                <form onSubmit={handleSubmit} className={`relative rounded-lg border ${themeStyles.container} focus-within:ring-1 focus-within:ring-blue-500/50 p-1`}>
                  <ChatInput
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${symbol}...`}
                    className={`min-h-8 text-xs resize-none rounded-lg ${themeStyles.container} border-0 p-2 shadow-none focus-visible:ring-0 ${themeStyles.message}`}
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between px-2 pt-1">
                    <div className="text-xs opacity-40">
                      {data.length} points
                    </div>
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="h-6 text-xs"
                      disabled={isLoading || !input.trim()}
                    >
                      {isLoading ? "..." : "Send"}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}