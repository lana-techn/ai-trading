'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PaperAirplaneIcon, 
  CpuChipIcon, 
  UserIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  LightBulbIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { cn, formatTimestamp } from '@/lib/utils';
import { tradingApi, handleApiError } from '@/lib/api';
import ImageUpload from './ImageUpload';

// Helper component for formatting AI messages
const MessageContent = ({ content }: { content: string }) => {
  const formatLine = (line: string) => {
    let formattedLine = line;
    
    // Handle markdown headers (###, ##, #)
    if (formattedLine.match(/^#{1,3}\s+/)) {
      const headerLevel = (formattedLine.match(/^#{1,3}/) || [''])[0].length;
      const headerText = formattedLine.replace(/^#{1,3}\s+/, '').trim();
      const sizeClass = headerLevel === 1 ? 'text-lg' : headerLevel === 2 ? 'text-base' : 'text-sm';
      return (
        <h3 className={`font-bold ${sizeClass} text-foreground mb-2 mt-4`}>
          {headerText}
        </h3>
      );
    }
    
    // Handle bold text (**text**)
    const boldParts = formattedLine.split(/\*\*(.*?)\*\*/);
    if (boldParts.length > 1) {
      return (
        <span>
          {boldParts.map((part, index) => 
            index % 2 === 1 ? 
              <strong key={index} className="font-semibold text-foreground">{part}</strong> : 
              <span key={index}>{part}</span>
          )}
        </span>
      );
    }
    
    // Handle bullet points
    if (formattedLine.match(/^[\s]*[•\-\*]\s+/)) {
      const bulletText = formattedLine.replace(/^[\s]*[•\-\*]\s+/, '').trim();
      return (
        <div className="flex items-start gap-2 my-1">
          <span className="text-primary text-sm font-bold mt-0.5">•</span>
          <span className="flex-1">{bulletText}</span>
        </div>
      );
    }
    
    // Handle numbered lists
    if (formattedLine.match(/^\d+\.\s+/)) {
      const numberMatch = formattedLine.match(/^(\d+)\.(\s+)(.*)$/);
      if (numberMatch) {
        return (
          <div className="flex items-start gap-2 my-1">
            <span className="text-primary text-sm font-bold mt-0.5">{numberMatch[1]}.</span>
            <span className="flex-1">{numberMatch[3]}</span>
          </div>
        );
      }
    }
    
    return <span>{formattedLine}</span>;
  };
  
  // Split content by paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split('\n').filter(line => line.trim());
        
        // Handle warnings and alerts
        if (paragraph.includes('⚠️') || paragraph.includes('**Risk Warning**')) {
          return (
            <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                <div className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                  {paragraph.replace('⚠️', '').replace('**Risk Warning**:', '').trim()}
                </div>
              </div>
            </div>
          );
        }
        
        // Handle code blocks or special sections
        if (paragraph.includes('```')) {
          return (
            <div key={index} className="bg-muted/50 border border-border rounded-lg p-3 font-mono text-sm">
              {paragraph.replace(/```/g, '').trim()}
            </div>
          );
        }
        
        // Regular paragraph with line-by-line formatting
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex}>
                {formatLine(line)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'image';
  message: string;
  timestamp: string;
  intent?: any;
  suggestions?: string[];
  actions?: any[];
  isLoading?: boolean;
  imageFilename?: string;
  imageAnalysis?: any;
}

interface AITradingChatProps {
  className?: string;
  initialMessage?: string;
}

export default function AITradingChat({ className, initialMessage }: AITradingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message,
      timestamp: new Date().toISOString(),
    };

    const loadingMessage: ChatMessage = {
      id: `ai_${Date.now()}`,
      type: 'ai',
      message: '🤔 Analyzing your question and preparing a comprehensive response...',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await tradingApi.chatWithAI({
        message,
        session_id: sessionId,
      });

      // Remove loading message and add AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          message: response.response,
          timestamp: response.timestamp,
          intent: response.intent,
          suggestions: response.suggestions,
          actions: response.actions,
        };
        return [...filtered, aiMessage];
      });

    } catch (err) {
      const apiError = handleApiError(err);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          message: `😔 **Connection Error**\n\nI'm having trouble connecting to my AI services right now. This might be due to:\n\n• Network connectivity issues\n• Server maintenance\n• High traffic volume\n\n**What you can try:**\n• Check your internet connection\n• Wait a moment and try again\n• Refresh the page if the issue persists\n\n*Error details: ${apiError.message}*`,
          timestamp: new Date().toISOString(),
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleImageUpload = async (file: File, additionalContext?: string) => {
    setIsImageUploading(true);
    setShowImageUpload(false);

    // Add user message for image upload
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'image',
      message: `Uploaded chart image: ${file.name}`,
      timestamp: new Date().toISOString(),
      imageFilename: file.name
    };

    const loadingMessage: ChatMessage = {
      id: `ai_${Date.now()}`,
      type: 'ai',
      message: '🔍 Analyzing your chart image with AI... This may take a moment.',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);

    try {
      const response = await tradingApi.uploadAndAnalyzeImage({
        file,
        session_id: sessionId,
        additional_context: additionalContext
      });

      // Remove loading message and add AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          message: response.response,
          timestamp: new Date().toISOString(),
          suggestions: response.suggestions,
          imageAnalysis: response.analysis
        };
        return [...filtered, aiMessage];
      });

    } catch (err) {
      const apiError = handleApiError(err);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          message: `😔 **Image Analysis Failed**\n\nI encountered an error while analyzing your chart:\n\n*${apiError.message}*\n\nPlease try uploading the image again or ensure it's a clear trading chart image.`,
          timestamp: new Date().toISOString(),
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg shadow-sm border border-border", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <CpuChipIcon className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            🤖 AI Trading Assistant
          </h3>
          <p className="text-sm text-muted-foreground">
            Ask me about trading analysis, market insights, or education
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 max-w-md mx-auto">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CpuChipIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              👋 Welcome to AI Trading Chat!
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              I'm your AI trading assistant powered by advanced AI. I can help you with analysis, market insights, and educational content.
            </p>
            
            <div className="space-y-4">
              <div className="text-left">
                <h4 className="text-sm font-medium text-foreground mb-2">🚀 Quick Start:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { text: "Upload Chart for Analysis", icon: "📈", action: () => setShowImageUpload(!showImageUpload) },
                    { text: "Analyze BTC-USD", icon: "🔍", action: () => handleSuggestionClick("Analyze BTC-USD") },
                    { text: "What is RSI?", icon: "📊", action: () => handleSuggestionClick("What is RSI?") },
                    { text: "Explain support and resistance", icon: "📚", action: () => handleSuggestionClick("Explain support and resistance") }
                  ].map((suggestion) => (
                    <button
                      key={suggestion.text}
                      onClick={suggestion.action}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors border border-primary/20 text-left"
                    >
                      <span>{suggestion.icon}</span>
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={cn(
            "flex gap-3",
            message.type === 'user' ? "justify-end" : "justify-start"
          )}>
            {message.type === 'ai' && (
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                  {message.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                  ) : (
                    <CpuChipIcon className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            )}
            
            <div className={cn(
              "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm",
              message.type === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-foreground border border-border"
            )}>
              <div className="text-sm leading-relaxed">
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-muted-foreground">AI is thinking...</span>
                  </div>
                ) : (
                  <MessageContent content={message.message} />
                )}
              </div>
              
              {message.type === 'ai' && !message.isLoading && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(message.message)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                    title="Copy message"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {(message.type === 'user' || message.type === 'image') && (
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center border border-border">
                  {message.type === 'image' ? (
                    <PhotoIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Image Upload Interface */}
        {showImageUpload && (
          <div className="mb-4">
            <ImageUpload
              onImageUpload={handleImageUpload}
              isUploading={isImageUploading}
            />
          </div>
        )}

        {/* Suggestions */}
        {messages.length > 0 && messages[messages.length - 1]?.suggestions && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <LightBulbIcon className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">💡 Suggestions:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-2 text-sm text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 border border-primary/20"
                >
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-3">
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={isLoading || isImageUploading}
            className={cn(
              "px-3 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center",
              showImageUpload
                ? "bg-primary text-primary-foreground shadow-md"
                : isLoading || isImageUploading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-input shadow-sm"
            )}
            title="Upload chart image for analysis"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={showImageUpload ? "Or ask me anything about trading..." : "Ask me anything about trading... 💬"}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder:text-muted-foreground"
            />
            {inputMessage && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {inputMessage.length} chars
              </div>
            )}
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className={cn(
              "px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center min-w-[48px]",
              isLoading || !inputMessage.trim()
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md"
            )}
            title={isLoading ? "Processing..." : "Send message"}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div className="flex gap-2">
            {[
              { text: "Upload Chart", action: () => setShowImageUpload(!showImageUpload) },
              { text: "Analyze BTC", action: () => handleSuggestionClick("Analyze BTC-USD") },
              { text: "Learn RSI", action: () => handleSuggestionClick("What is RSI indicator?") }
            ].map((quick) => (
              <button
                key={quick.text}
                onClick={quick.action}
                disabled={isLoading || isImageUploading}
                className="px-2 py-1 text-xs text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {quick.text}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Powered by AI ✨
          </div>
        </div>
      </div>
    </div>
  );
}