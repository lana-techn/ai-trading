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
  
  // Dragging state with enhanced features
  const [isDragging, setIsDragging] = useState(false)
  const [hasMoved, setHasMoved] = useState(false) // Track if drag actually moved
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [isSnapping, setIsSnapping] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  const chatRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const lastMoveTimeRef = useRef<number>(Date.now())
  
  // LocalStorage key for position
  const POSITION_KEY = `ai-chat-position-${symbol}`

  // Detect mobile devices
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Load saved position or set initial position with better UX
  useEffect(() => {
    setMounted(true)
    const updatePosition = () => {
      if (typeof window !== 'undefined') {
        // Try to load saved position from localStorage
        const savedPosition = localStorage.getItem(POSITION_KEY)
        if (savedPosition) {
          try {
            const parsed = JSON.parse(savedPosition)
            // Validate saved position is still within viewport
            const chatWidth = isOpen ? (isMobile ? 300 : 320) : 64
            const chatHeight = isOpen ? (isMobile ? 400 : 384) : 64
            const maxX = window.innerWidth - chatWidth - 10
            const maxY = window.innerHeight - chatHeight - 10
            
            if (parsed.x >= 0 && parsed.x <= maxX && parsed.y >= 0 && parsed.y <= maxY) {
              setPosition(parsed)
              return
            }
          } catch (e) {
            // Invalid saved position, use default
          }
        }
        
        // Use default position if no saved position or invalid
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
  }, [initialPosition, isMobile, POSITION_KEY, isOpen])

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

          // Create enhanced welcome message with better visual structure
          const trendIcon = result.analysis.trend === 'bullish' ? '🔥' : result.analysis.trend === 'bearish' ? '❄️' : '➡️'
          const trendText = result.analysis.trend === 'bullish' ? 'BULLISH ↑' : result.analysis.trend === 'bearish' ? 'BEARISH ↓' : 'SIDEWAYS'
          const trendColor = result.analysis.trend === 'bullish' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' : result.analysis.trend === 'bearish' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30'
          
          const welcomeMessage: Message = {
            id: 1,
            content: `<div class="space-y-3">
  <div class="flex items-center gap-2 mb-2">
    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
      <span class="text-sm">🚀</span>
    </div>
    <div>
      <div class="font-bold text-sm text-gray-900 dark:text-gray-100">AI Analysis Ready!</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">${symbol} • ${new Date().toLocaleTimeString()}</div>
    </div>
  </div>
  
  <div class="grid grid-cols-1 gap-2">
    <div class="flex items-center justify-between p-2 rounded-lg ${trendColor} border border-current/20">
      <div class="flex items-center gap-2">
        <span class="text-base">${trendIcon}</span>
        <span class="text-xs font-medium">Trend</span>
      </div>
      <span class="text-xs font-bold">${trendText}</span>
    </div>
    
    <div class="grid grid-cols-2 gap-2">
      <div class="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Buy Signal</div>
        <div class="text-sm font-bold text-gray-900 dark:text-gray-100">${result.analysis.signals.buy}%</div>
      </div>
      
      <div class="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</div>
        <div class="text-sm font-bold text-gray-900 dark:text-gray-100">$${data[data.length - 1]?.close.toFixed(2)}</div>
      </div>
    </div>
  </div>
  
  <div class="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
    ${isMobile ? 'Tap' : 'Click'} quick buttons for instant analysis! ⚡
  </div>
</div>`,
            sender: "ai",
            timestamp: new Date(),
            isAnalysis: true
          }

          setMessages([welcomeMessage])

          // Add top insight as enhanced structured message
          if (result.insights.length > 0) {
            const topInsight = result.insights[0]
            const impactIcon = topInsight.impact === 'positive' ? '📈' : topInsight.impact === 'negative' ? '📉' : '➡️'
            const impactColor = topInsight.impact === 'positive' ? 'text-green-600 dark:text-green-400' : topInsight.impact === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
            
            const insightMessage: Message = {
              id: 2,
              content: `<div class="space-y-3">
  <div class="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
      <span class="text-sm">💡</span>
    </div>
    <div class="flex-1">
      <div class="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">${topInsight.title}</div>
      <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">${topInsight.description}</p>
    </div>
  </div>
  
  <div class="grid grid-cols-2 gap-2">
    <div class="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Confidence</div>
      <div class="flex items-center gap-1">
        <div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style="width: ${topInsight.confidence}%"></div>
        </div>
        <span class="text-xs font-bold text-gray-900 dark:text-gray-100">${topInsight.confidence}%</span>
      </div>
    </div>
    
    <div class="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Impact</div>
      <div class="flex items-center gap-1">
        <span>${impactIcon}</span>
        <span class="text-xs font-bold ${impactColor}">${topInsight.impact.toUpperCase()}</span>
      </div>
    </div>
  </div>
</div>`,
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

  // Snap to edges with smooth animation
  const snapToEdge = useCallback((currentX: number, currentY: number) => {
    if (typeof window === 'undefined') return { x: currentX, y: currentY }
    
    const chatWidth = isOpen ? (isMobile ? 300 : 320) : 64
    const chatHeight = isOpen ? (isMobile ? 400 : 384) : 64
    const snapThreshold = 50 // Distance from edge to trigger snap
    
    let finalX = currentX
    let finalY = currentY
    
    // Snap to left or right edge
    if (currentX < snapThreshold) {
      finalX = 10 // Snap to left
    } else if (currentX > window.innerWidth - chatWidth - snapThreshold) {
      finalX = window.innerWidth - chatWidth - 10 // Snap to right
    }
    
    // Snap to top or bottom edge
    if (currentY < snapThreshold) {
      finalY = 10 // Snap to top
    } else if (currentY > window.innerHeight - chatHeight - snapThreshold) {
      finalY = window.innerHeight - chatHeight - 10 // Snap to bottom
    }
    
    return { x: finalX, y: finalY }
  }, [isOpen, isMobile])

  // Enhanced drag functionality with mobile support and double-click reset
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Allow drag from both header AND floating button
    const targetNode = e.target as Node
    const isDragHandle = dragRef.current?.contains(targetNode)
    const isToggleButton = toggleButtonRef.current?.contains(targetNode)
    
    if (!isDragHandle && !isToggleButton) return
    if (isMobile) return // Disable drag on mobile for better touch experience
    
    // Handle double-click to reset position (only on drag handle, not toggle button)
    if (isDragHandle) {
      const currentTime = Date.now()
      if (currentTime - lastClickTime < 300) {
        // Double-click detected - reset to center
        const defaultX = window.innerWidth / 2 - (isOpen ? 160 : 32)
        const defaultY = window.innerHeight / 2 - (isOpen ? 192 : 32)
        setPosition({ x: defaultX, y: defaultY })
        localStorage.setItem(POSITION_KEY, JSON.stringify({ x: defaultX, y: defaultY }))
        return
      }
      setLastClickTime(currentTime)
    }
    
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY
    
    setIsDragging(true)
    setHasMoved(false) // Reset move tracking
    setLastPosition({ x: clientX, y: clientY })
    setVelocity({ x: 0, y: 0 })
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    })
    lastMoveTimeRef.current = Date.now()
    e.preventDefault()
    e.stopPropagation()
  }, [position, isMobile, lastClickTime, isOpen, POSITION_KEY])

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || isMobile) return

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY

    // Use requestAnimationFrame for smooth 60fps updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const newX = clientX - dragStart.x
      const newY = clientY - dragStart.y

      // Calculate velocity for momentum effect
      const currentTime = Date.now()
      const deltaTime = Math.max(1, currentTime - lastMoveTimeRef.current)
      const velocityX = (clientX - lastPosition.x) / deltaTime * 16 // Normalize to 60fps
      const velocityY = (clientY - lastPosition.y) / deltaTime * 16
      
      // Mark that we've moved (for preventing click on drag)
      if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
        setHasMoved(true)
      }
      
      setVelocity({ x: velocityX, y: velocityY })
      setLastPosition({ x: clientX, y: clientY })
      lastMoveTimeRef.current = currentTime

      // Boundary constraints with smooth rubber band effect
      const chatWidth = isOpen ? (isMobile ? 300 : 320) : 64
      const chatHeight = isOpen ? (isMobile ? 400 : 384) : 64
      const maxX = window.innerWidth - chatWidth - 10
      const maxY = window.innerHeight - chatHeight - 10

      // Apply constraints with slight elasticity at edges
      let finalX = newX
      let finalY = newY
      
      // Rubber band effect when dragging beyond bounds
      if (newX < 10) {
        finalX = 10 + (newX - 10) * 0.3 // 30% resistance
      } else if (newX > maxX) {
        finalX = maxX + (newX - maxX) * 0.3
      }
      
      if (newY < 10) {
        finalY = 10 + (newY - 10) * 0.3
      } else if (newY > maxY) {
        finalY = maxY + (newY - maxY) * 0.3
      }

      setPosition({
        x: Math.max(10, Math.min(finalX, maxX)),
        y: Math.max(10, Math.min(finalY, maxY))
      })
    })
  }, [isDragging, dragStart, isOpen, isMobile, lastPosition])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      setIsDragging(false)
      
      // Apply momentum effect if velocity is high enough
      const momentumThreshold = 0.5
      let finalPosition = { x: position.x, y: position.y }
      
      if (Math.abs(velocity.x) > momentumThreshold || Math.abs(velocity.y) > momentumThreshold) {
        // Apply momentum with decay
        const momentumDecay = 0.15 // How much momentum to apply
        finalPosition = {
          x: position.x + velocity.x * momentumDecay,
          y: position.y + velocity.y * momentumDecay
        }
      }
      
      // Apply snap to edges
      setIsSnapping(true)
      const snappedPosition = snapToEdge(finalPosition.x, finalPosition.y)
      
      // Smooth animation to snapped position
      setPosition(snappedPosition)
      
      // Save position to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(POSITION_KEY, JSON.stringify(snappedPosition))
      }
      
      // Reset velocity
      setVelocity({ x: 0, y: 0 })
      
      // Remove snapping state after animation
      setTimeout(() => setIsSnapping(false), 300)
    }
  }, [isDragging, position, velocity, snapToEdge, POSITION_KEY])

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

  // Cleanup effect for animation frames and cache
  useEffect(() => {
    return () => {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Clear cache when component unmounts
      // clearIndicatorCache() // Commented out as the module was not found
    }
  }, [])

  if (!mounted) return null

  return (
    <div 
      className={cn(
        "fixed z-50",
        isSnapping ? "transition-all duration-300 ease-out" : isDragging ? "transition-none" : "transition-all duration-200",
        isDragging && "scale-105 shadow-2xl",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'auto',
        filter: isDragging ? 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.25))' : 'none'
      }}
      ref={chatRef}
    >
      {/* Enhanced Toggle Button with better animations and drag support */}
      {!isOpen && (
        <div
          ref={toggleButtonRef}
          className={cn(
            `${themeStyles.toggleButton} ${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-full border-2 shadow-lg flex items-center justify-center backdrop-blur-sm`,
            !isMobile && "cursor-grab active:cursor-grabbing",
            !isDragging && "hover:scale-110 active:scale-95",
            "transition-all duration-300 hover:shadow-xl",
            "hover:border-blue-400 dark:hover:border-blue-500",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onClick={(e) => {
            // Only open if not dragging - prevent click after drag
            if (!hasMoved) {
              setIsOpen(true)
              // Also update position if needed to ensure it's visible
              if (typeof window !== 'undefined') {
                const chatWidth = isMobile ? 300 : 320
                const chatHeight = isMobile ? 400 : 384
                if (position.x + chatWidth > window.innerWidth || position.y + chatHeight > window.innerHeight) {
                  const safeX = Math.min(position.x, window.innerWidth - chatWidth - 10)
                  const safeY = Math.min(position.y, window.innerHeight - chatHeight - 10)
                  setPosition({ x: safeX, y: safeY })
                }
              }
            }
            // Reset hasMoved after a short delay
            setTimeout(() => setHasMoved(false), 100)
          }}
          title={!isMobile ? `AI Analysis for ${symbol} • Click to open • Drag to move` : `AI Analysis for ${symbol} • Tap to open`}
        >
          <div className="relative">
            <div className={cn(
              "transition-transform duration-300",
              insights.length > 0 && "animate-bounce"
            )}>
              {getTrendIcon()}
            </div>
            {insights.length > 0 && (
              <>
                <div className={cn(
                  `absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md`,
                  "animate-pulse"
                )}>
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
          {/* Header with enhanced drag handle and visual feedback */}
          <div 
            ref={dragRef}
            className={cn(
              `${themeStyles.header} flex items-center justify-between p-3 border-b select-none`,
              !isMobile && 'cursor-grab active:cursor-grabbing hover:bg-opacity-80',
              isDragging && 'cursor-grabbing bg-opacity-90'
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            title={!isMobile ? "Drag to move • Double-click to center" : ""}
          >
            <div className="flex items-center gap-2">
              {!isMobile && (
                <div className={cn(
                  "flex flex-col gap-0.5 transition-all duration-200",
                  isDragging ? "opacity-100 scale-110" : "opacity-50 hover:opacity-100"
                )}>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                  </div>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                  </div>
                </div>
              )}
              <Brain className={cn(
                `${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`,
                isDragging && "animate-pulse"
              )} />
              <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-semibold`}>
                AI Assistant {isDragging && "🔄"}
              </span>
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
                        {!message.isLoading && (
                          message.content.startsWith('<div') ? (
                            // Render HTML content for enhanced analysis messages
                            <div dangerouslySetInnerHTML={{ __html: message.content }} />
                          ) : (
                            // Render markdown-formatted text
                            <div className="space-y-2">
                              {message.content.split('\n').map((line, idx) => {
                                // Handle bold text **text**
                                const parts = line.split(/(\*\*[^*]+\*\*)/g)
                                return (
                                  <div key={idx}>
                                    {parts.map((part, partIdx) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={partIdx}>{part.slice(2, -2)}</strong>
                                      }
                                      return <span key={partIdx}>{part}</span>
                                    })}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        )}
                      </ChatBubbleMessage>
                    </ChatBubble>
                  ))}
                </ChatMessageList>
              </div>

              {/* Input with mobile optimization */}
              <div className="p-2 border-t">
                <form onSubmit={(e) => {e.preventDefault(); handleSubmit(e);}} className={`relative rounded-lg border ${themeStyles.container} focus-within:ring-1 focus-within:ring-blue-500/50 p-1`}>
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