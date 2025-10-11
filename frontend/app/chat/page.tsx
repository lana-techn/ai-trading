'use client';

import { useState, useEffect, useRef } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { tradingApi, handleApiError } from '@/lib/api';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const loadingMessage: Message = {
      id: `ai_${Date.now()}`,
      type: 'ai',
      content: 'Thinking...',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await tradingApi.chatWithAI({
        message: text,
        session_id: sessionId,
      });

      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: response.response,
          timestamp: response.timestamp,
        };
        return [...filtered, aiMessage];
      });
    } catch (err) {
      const apiError = handleApiError(err);
      
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage: Message = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: `## Connection Error\n\nI'm having trouble connecting to my AI services. ${apiError.message}\n\n**What you can try:**\n• Check your internet connection\n• Wait a moment and try again\n• Refresh the page if the issue persists`,
          timestamp: new Date().toISOString(),
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
    if (!lastUserMessage) return;
    setMessages(prev => prev.slice(0, -1));
    await handleSendMessage(lastUserMessage.content);
  };

  return (
    <div className="fixed inset-0 top-[80px] flex bg-background">
      <ChatSidebar onNewChat={handleNewChat} currentChatId="current" />
      
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="max-w-lg w-full text-center space-y-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    NousTrade AI Assistant
                  </h2>
                  <p className="text-muted-foreground">
                    Ask me anything about trading & markets
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  {[
                    { icon: '📈', text: 'Analyze BTC-USD' },
                    { icon: '📊', text: 'Explain RSI' },
                    { icon: '💡', text: 'Trading tips' },
                    { icon: '🔍', text: 'Market sentiment' },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(item.text)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-sm font-medium"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 min-h-full">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  type={message.type}
                  content={message.content}
                  timestamp={message.timestamp}
                  isLoading={message.isLoading}
                  onRegenerate={message.type === 'ai' && !message.isLoading ? handleRegenerate : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border bg-background">
          <ChatInput onSend={handleSendMessage} onStop={() => {}} onImageUpload={() => {}} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
