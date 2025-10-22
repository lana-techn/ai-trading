'use client';

import { useState, useEffect, useRef } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ImageUpload from '@/components/chat/ImageUpload';
import { tradingApi, handleApiError } from '@/lib/api';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  imageUrl?: string;
  imageFile?: File;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      messages.forEach(msg => {
        if (msg.imageUrl) {
          URL.revokeObjectURL(msg.imageUrl);
        }
      });
    };
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

  const handleImageUpload = async (file: File, additionalContext?: string) => {
    setIsUploadingImage(true);
    setShowImageUpload(false);

    try {
      // Create object URL for image preview
      const imageUrl = URL.createObjectURL(file);

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: `📊 Uploaded chart image${additionalContext ? ': ' + additionalContext : ''}`,
        timestamp: new Date().toISOString(),
        imageUrl,
        imageFile: file,
      };

      const loadingMessage: Message = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: 'Analyzing your chart...',
        timestamp: new Date().toISOString(),
        isLoading: true,
      };

      setMessages(prev => [...prev, userMessage, loadingMessage]);
      setIsLoading(true);

      const response = await tradingApi.uploadAndAnalyzeImage({
        file,
        session_id: sessionId,
        additional_context: additionalContext,
      });

      if (response.success) {
        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.isLoading);
          const analysisMessage: Message = {
            id: `ai_${Date.now()}`,
            type: 'ai',
            content: response.response,
            timestamp: new Date().toISOString(),
          };
          return [...filtered, analysisMessage];
        });
      } else {
        throw new Error(response.error || 'Failed to analyze image');
      }
    } catch (err) {
      const apiError = handleApiError(err);
      
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage: Message = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: `## Image Analysis Failed\n\nI encountered an error while analyzing your chart. ${apiError.message}\n\n**What you can try:**\n• Ensure the image is clear and contains a trading chart\n• Try uploading a different image\n• Check your internet connection`,
          timestamp: new Date().toISOString(),
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsUploadingImage(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-[80px] flex bg-background">
      <ChatSidebar onNewChat={handleNewChat} currentChatId="current" />
      
      <div className="flex-1 flex flex-col relative">
        {/* Image Upload Modal */}
        {showImageUpload && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-background">
                <h2 className="text-lg font-semibold text-foreground">Analyze Chart</h2>
                <button
                  onClick={() => setShowImageUpload(false)}
                  disabled={isUploadingImage}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  isUploading={isUploadingImage}
                  enableSupabaseUpload={false}
                />
              </div>
            </div>
          </div>
        )}

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
                  imageUrl={message.imageUrl}
                  onRegenerate={message.type === 'ai' && !message.isLoading ? handleRegenerate : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border bg-background">
          <ChatInput 
            onSend={handleSendMessage} 
            onStop={() => {}} 
            onImageUpload={() => setShowImageUpload(true)} 
            isLoading={isLoading || isUploadingImage}
            disabled={isUploadingImage}
          />
        </div>
      </div>
    </div>
  );
}
