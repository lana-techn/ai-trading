'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon, PhotoIcon, StopIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  onImageUpload?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const suggestedPrompts = [
  { icon: '📈', text: 'Analyze BTC-USD' },
  { icon: '📊', text: 'Explain RSI' },
  { icon: '💡', text: 'Trading tips' },
];

export default function ChatInput({ onSend, onStop, onImageUpload, isLoading, disabled, placeholder = "Ask anything about trading..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || isLoading || disabled) return;
    onSend(message.trim());
    setMessage('');
    setShowSuggestions(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    if (e.target.value.trim()) setShowSuggestions(false);
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {showSuggestions && !message && (
          <div className="mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 flex-wrap">
              <SparklesIcon className="w-4 h-4 text-muted-foreground" />
              {suggestedPrompts.map((prompt, i) => (
                <button key={i} onClick={() => { setMessage(prompt.text); setShowSuggestions(false); textareaRef.current?.focus(); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={cn("flex items-end gap-3 p-3 rounded-2xl border transition-all", isLoading ? "border-primary bg-primary/5" : "border-border bg-muted/50 focus-within:border-primary focus-within:bg-background")}>
          <button onClick={onImageUpload} disabled={isLoading || disabled}
            className={cn("flex-shrink-0 p-2 rounded-lg transition-colors", isLoading || disabled ? "text-muted-foreground cursor-not-allowed" : "text-muted-foreground hover:text-foreground hover:bg-background")}>
            <PhotoIcon className="w-5 h-5" />
          </button>

          <textarea ref={textareaRef} value={message} onChange={handleChange} onKeyDown={handleKeyDown} disabled={isLoading || disabled} placeholder={placeholder} rows={1}
            className={cn("flex-1 bg-transparent border-none outline-none resize-none text-sm placeholder:text-muted-foreground text-foreground disabled:cursor-not-allowed disabled:opacity-50 max-h-[200px] py-2")} />

          {message.length > 0 && <div className="text-xs text-muted-foreground self-center">{message.length}</div>}

          {isLoading ? (
            <button onClick={onStop} className="flex-shrink-0 p-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
              <StopIcon className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSend} disabled={!message.trim() || disabled}
              className={cn("flex-shrink-0 p-2 rounded-lg transition-all", !message.trim() || disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md")}>
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-center mt-2">
          <div className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">Shift + Enter</kbd> for new line
          </div>
        </div>
      </div>
    </div>
  );
}
