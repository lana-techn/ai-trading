import AITradingChat from '@/components/chat/AIChat';
import { Card, CardContent } from '@/components/ui';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ChatPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <ChatBubbleLeftRightIcon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">💬 AI Trading Assistant</h1>
              <p className="text-muted-foreground mt-1">
                Chat with our hybrid AI powered by Qwen and Gemini for comprehensive trading insights
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 dark:text-green-400 font-medium text-sm">AI Online</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[700px]">
        <CardContent className="h-full p-0">
          <AITradingChat />
        </CardContent>
      </Card>
    </div>
  );
}
