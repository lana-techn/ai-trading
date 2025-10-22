'use client';

import { useState } from 'react';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon,
  Bars3Icon,
  XMarkIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
}

export default function ChatSidebar({ onNewChat, onSelectChat, currentChatId }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: '1',
      title: 'Bitcoin Analysis',
      timestamp: new Date(),
      preview: 'Analyze BTC-USD price action...'
    },
    {
      id: '2',
      title: 'RSI Indicator',
      timestamp: new Date(Date.now() - 86400000),
      preview: 'What is RSI and how to use it?'
    },
  ]);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-4 z-50 p-2 bg-background border border-border rounded-lg shadow-lg hover:bg-muted transition-colors"
      >
        {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative top-0 left-0 h-full bg-background border-r border-border z-40 transition-transform duration-300 flex flex-col w-64 lg:w-72",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => { onNewChat(); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Recent Chats
          </div>
          
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => { onSelectChat?.(chat.id); setIsOpen(false); }}
              className={cn(
                "w-full group flex items-start gap-3 p-3 rounded-lg transition-all duration-200 text-left cursor-pointer",
                currentChatId === chat.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent"
              )}
            >
              <ChatBubbleLeftIcon className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5",
                currentChatId === chat.id ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn("font-medium text-sm truncate", currentChatId === chat.id ? "text-primary" : "text-foreground")}>
                  {chat.title}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{chat.preview}</div>
                <div className="text-xs text-muted-foreground mt-1">{chat.timestamp.toLocaleDateString()}</div>
              </div>
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive cursor-pointer"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <TrashIcon className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <div className="font-semibold mb-1">NousTrade AI</div>
            <div>Powered by Qwen & Gemini</div>
          </div>
        </div>
      </aside>
    </>
  );
}
