'use client';

import { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon, ArrowPathIcon, UserCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  type: 'user' | 'ai';
  content: string;
  timestamp?: string;
  isLoading?: boolean;
  imageUrl?: string;
  onRegenerate?: () => void;
}

export default function ChatMessage({ type, content, timestamp, isLoading, imageUrl, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace(/^###\s*/, '')}</h3>;
      if (line.startsWith('##')) return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace(/^##\s*/, '')}</h2>;
      if (/\*\*(.*?)\*\*/g.test(line)) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <p key={i} className="mb-2">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
      }
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <div key={i} className="flex items-start gap-2 mb-1 ml-4"><span className="text-primary mt-1">•</span><span className="flex-1">{line.replace(/^[\s]*[•\-]\s*/, '')}</span></div>;
      }
      return line.trim() ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 max-w-4xl mx-auto px-4 py-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <CpuChipIcon className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            {[0, 150, 300].map((delay, i) => (
              <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group flex gap-4 max-w-4xl mx-auto px-4 py-6 hover:bg-muted/30 transition-colors", type === 'ai' && "border-b border-border/50")}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", type === 'ai' ? "bg-gradient-to-br from-primary to-primary/70 shadow-lg" : "bg-muted border border-border")}>
        {type === 'ai' ? <CpuChipIcon className="w-5 h-5 text-white" /> : <UserCircleIcon className="w-5 h-5 text-muted-foreground" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">{type === 'ai' ? 'NousTrade AI' : 'You'}</span>
          {timestamp && <span className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleTimeString()}</span>}
        </div>
        
        {imageUrl && (
          <div className="mb-3 bg-muted/30 p-2 rounded-lg">
            <img 
              src={imageUrl} 
              alt="Uploaded chart" 
              className="w-full max-w-lg rounded-lg border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            />
            <p className="text-xs text-muted-foreground mt-2 italic">Chart uploaded for analysis</p>
          </div>
        )}
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
          {formatContent(content)}
        </div>
        
        {type === 'ai' && !isLoading && (
          <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-muted rounded-md transition-all border border-border">
              {copied ? <><CheckIcon className="w-3.5 h-3.5" /><span>Copied!</span></> : <><ClipboardDocumentIcon className="w-3.5 h-3.5" /><span>Copy</span></>}
            </button>
            {onRegenerate && (
              <button onClick={onRegenerate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-muted rounded-md transition-all border border-border">
                <ArrowPathIcon className="w-3.5 h-3.5" /><span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
