'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  BookmarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface TradingSidebarProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}

const SYMBOLS = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: '48,000', change: '+2.34%', trend: 'up', marketCap: '945B', icon: '₿' },
  { symbol: 'ETH/USD', name: 'Ethereum', price: '2,658', change: '+1.87%', trend: 'up', marketCap: '320B', icon: 'Ξ' },
  { symbol: 'SOL/USD', name: 'Solana', price: '98.45', change: '-0.92%', trend: 'down', marketCap: '45B', icon: '◎' },
  { symbol: 'ADA/USD', name: 'Cardano', price: '0.5234', change: '+4.12%', trend: 'up', marketCap: '18B', icon: '₳' },
  { symbol: 'DOT/USD', name: 'Polkadot', price: '7.82', change: '+0.78%', trend: 'up', marketCap: '12B', icon: '●' },
  { symbol: 'AVAX/USD', name: 'Avalanche', price: '36.12', change: '-1.23%', trend: 'down', marketCap: '15B', icon: '🔺' },
];

const TIMEFRAMES = [
  { value: '1m', label: '1M', active: false },
  { value: '5m', label: '5M', active: false },
  { value: '15m', label: '15M', active: false },
  { value: '1h', label: '1H', active: false },
  { value: '4h', label: '4H', active: false },
  { value: '1d', label: '1D', active: true },
  { value: '1w', label: '1W', active: false },
];

const TECHNICAL_INDICATORS = [
  { name: 'RSI (14)', value: '65.2', status: 'neutral', color: 'text-yellow-600 dark:text-yellow-400' },
  { name: 'MACD', value: '+245', status: 'bullish', color: 'text-green-600 dark:text-green-400' },
  { name: 'Moving Average', value: '$48,652', status: 'above', color: 'text-blue-600 dark:text-blue-400' },
  { name: 'Bollinger Bands', value: 'Lower', status: 'bearish', color: 'text-red-600 dark:text-red-400' },
  { name: 'Stochastic', value: '78.3', status: 'overbought', color: 'text-red-600 dark:text-red-400' },
  { name: 'Williams %R', value: '-22.1', status: 'bullish', color: 'text-green-600 dark:text-green-400' },
];

export default function TradingSidebar({
  symbol,
  onSymbolChange,
  onTimeframeChange
}: TradingSidebarProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [watchlist, setWatchlist] = useState<string[]>(['BTC/USD', 'ETH/USD']);

  const handleTimeframeClick = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange(timeframe);
  };

  const toggleWatchlist = (symbolName: string) => {
    setWatchlist(prev => 
      prev.includes(symbolName) 
        ? prev.filter(s => s !== symbolName)
        : [...prev, symbolName]
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'bullish': return 'default';
      case 'bearish': return 'destructive';
      case 'neutral': return 'secondary';
      case 'overbought': return 'destructive';
      case 'oversold': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeframe Selector */}
      <Card className="border shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            🕰️ Timeframes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeframeClick(tf.value)}
                className={cn(
                  "text-xs font-medium transition-all duration-200 rounded-full px-2.5 py-1 h-7",
                  selectedTimeframe === tf.value 
                    ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-md transform scale-105" 
                    : "bg-background hover:bg-blue-50 dark:hover:bg-blue-950/50 text-foreground border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                )}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <Card className="border shadow-md bg-card">
        <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 rounded-t-lg">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            📈 Market Overview
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-1">Live cryptocurrency prices</div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {SYMBOLS.map((item) => (
            <div
              key={item.symbol}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
                symbol === item.symbol 
                  ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-md" 
                  : "bg-muted/50 border-border hover:bg-muted"
              )}
              onClick={() => onSymbolChange(item.symbol)}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background shadow-sm">
                  <span className="text-sm font-bold text-foreground">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-foreground">{item.symbol}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(item.symbol);
                      }}
                      className="h-4 w-4 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-full"
                    >
                      <BookmarkIcon 
                        className={cn(
                          "h-2.5 w-2.5 transition-colors",
                          watchlist.includes(item.symbol) ? "fill-current text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                        )} 
                      />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground/70">MCap: ${item.marketCap}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-xs text-foreground">${item.price}</div>
                <div className={cn(
                  "text-xs flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-full",
                  item.trend === 'up' 
                    ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50" 
                    : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50"
                )}>
                  {item.trend === 'up' ? (
                    <ArrowUpIcon className="h-2.5 w-2.5" />
                  ) : (
                    <ArrowDownIcon className="h-2.5 w-2.5" />
                  )}
                  {item.change}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Technical Analysis */}
      <Card className="border shadow-md bg-card">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 rounded-t-lg">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            ⚡ Technical Analysis
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-1">Real-time market signals</div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {TECHNICAL_INDICATORS.map((indicator, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-muted/50 to-muted/70 border border-border hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{indicator.name}</div>
                <Badge 
                  variant={getStatusBadgeVariant(indicator.status)}
                  className="text-xs mt-0.5 font-semibold px-1.5 py-0.5"
                >
                  {indicator.status}
                </Badge>
              </div>
              <div className={cn("font-bold text-xs px-2 py-1 rounded-full bg-background shadow-sm", indicator.color)}>
                {indicator.value}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}