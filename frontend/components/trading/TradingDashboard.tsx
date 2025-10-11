"use client";

import { 
  CpuChipIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { useMarketData } from '@/lib/hooks/useMarketData';
import { cn } from '@/lib/utils';

interface TradingDashboardProps {
  variant?: 'default' | 'compact';
  className?: string;
  showHeader?: boolean;
  showActivePositions?: boolean;
  updateInterval?: number;
}

export default function TradingDashboard({ 
  variant = 'default',
  className,
  showHeader = true,
  showActivePositions = false,
  updateInterval = 3000
}: TradingDashboardProps) {
  const { marketData, aiAnalysis, totalPnL } = useMarketData({ updateInterval });

  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      "w-full bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl shadow-2xl",
      isCompact ? "p-4 border-2 border-zinc-700" : "max-w-6xl mx-auto p-6 border-4 border-zinc-700",
      className
    )}>
      {/* Header */}
      {showHeader && (
        <div className={cn(
          "flex items-center justify-between",
          isCompact ? "mb-4" : "mb-6"
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center",
              isCompact ? "w-8 h-8" : "w-10 h-10"
            )}>
              <CpuChipIcon className={cn("text-white", isCompact ? "h-5 w-5" : "h-6 w-6")} />
            </div>
            <div>
              <h2 className={cn("font-bold text-white", isCompact ? "text-lg" : "text-2xl")}>
                AI Trading Dashboard
              </h2>
              <p className="text-sm text-gray-400">Real-time Market Analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn("bg-green-400 rounded-full animate-pulse", isCompact ? "w-2 h-2" : "w-3 h-3")}></div>
            <span className={cn("text-green-400 font-bold", isCompact ? "text-sm" : "text-lg")}>LIVE</span>
          </div>
        </div>
      )}

      {/* Market Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(marketData).map(([symbol, data]) => {
          const colors = {
            orange: "bg-orange-500",
            blue: "bg-blue-500", 
            red: "bg-red-500",
            gray: "bg-gray-600"
          };
          
          const symbolIcons = { BTC: "₿", ETH: "E", TSLA: "T", AAPL: "A" };
          
          return (
            <div key={symbol} className="bg-zinc-800/70 p-4 rounded-xl border border-zinc-600 hover:bg-zinc-700/70 transition-all duration-300">
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-8 h-8 ${colors[data.color as keyof typeof colors]} rounded-full flex items-center justify-center text-white font-bold`}>
                  {symbolIcons[symbol as keyof typeof symbolIcons]}
                </div>
                <span className="text-lg font-bold text-white">{symbol}</span>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                ${data.price.toLocaleString()}
              </div>
              <div className={`text-sm font-semibold ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.change >= 0 ? '+' : ''}{data.change}%
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-6 mb-6 border border-blue-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <SparklesIcon className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">AI Market Analysis</h3>
          <div className="ml-auto text-blue-400 animate-pulse">● Processing...</div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Market Sentiment</span>
              <span className="text-sm font-bold text-green-400">
                {aiAnalysis.sentiment >= 70 ? 'Bullish' : 'Neutral'} {Math.round(aiAnalysis.sentiment)}%
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                style={{ width: `${aiAnalysis.sentiment}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">AI Confidence</span>
              <span className="text-sm font-bold text-blue-400">
                High {Math.round(aiAnalysis.confidence)}%
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all duration-1000"
                style={{ width: `${aiAnalysis.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className={cn("grid grid-cols-3", isCompact ? "gap-3" : "gap-6")}>
        <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
          <div className={cn("font-bold text-white mb-1", isCompact ? "text-xl" : "text-2xl")}>94.7%</div>
          <div className="text-sm text-gray-400">Win Rate</div>
        </div>
        <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
          <div className={cn(
            "font-bold mb-1",
            isCompact ? "text-xl" : "text-2xl",
            totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {totalPnL >= 0 ? '+' : ''}${Math.round(totalPnL / 1000)}K
          </div>
          <div className="text-sm text-gray-400">Total P&L</div>
        </div>
        <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
          <div className={cn("font-bold text-blue-400 mb-1", isCompact ? "text-xl" : "text-2xl")}>0.8s</div>
          <div className="text-sm text-gray-400">Exec Time</div>
        </div>
      </div>

      {/* Active Positions - Optional */}
      {showActivePositions && (
        <div className="mt-6 space-y-2">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Positions</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 rounded border border-zinc-700/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white font-medium">BTC Long</span>
              </div>
              <div className="text-sm text-green-400">+{Math.abs(marketData.BTC.change).toFixed(1)}%</div>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 rounded border border-zinc-700/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-white font-medium">ETH Long</span>
              </div>
              <div className="text-sm text-green-400">+{Math.abs(marketData.ETH.change).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}