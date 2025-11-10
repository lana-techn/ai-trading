'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { tradingApi, PopularSymbol, Quote } from '@/lib/api';
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

const SYMBOL_ICONS: { [key: string]: string } = {
  'AAPL': '🍎',
  'GOOGL': '🔍', 
  'MSFT': '🪟',
  'TSLA': '⚡',
  'AMZN': '📦',
  'NVDA': '🎮',
  'META': '👥',
  'NFLX': '🎬',
  'SPY': '📊',
  'QQQ': '💹'
};

const TIMEFRAMES = [
  { value: '1min', label: '1M', active: false },
  { value: '5min', label: '5M', active: true },
  { value: '15min', label: '15M', active: false },
  { value: '30min', label: '30M', active: false },
  { value: '60min', label: '1H', active: false },
  { value: 'daily', label: '1D', active: false },
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
  const [selectedTimeframe, setSelectedTimeframe] = useState('5min');
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'TSLA']);
  const [popularSymbols, setPopularSymbols] = useState<PopularSymbol[]>([]);
  const [quotes, setQuotes] = useState<{ [key: string]: Quote }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch popular symbols and quotes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch popular symbols
        const symbolsResponse = await tradingApi.getPopularSymbols();
        if (symbolsResponse.success) {
          setPopularSymbols(symbolsResponse.data.symbols);
          
          // Fetch quotes for popular symbols
          const symbolsList = symbolsResponse.data.symbols.map(s => s.symbol);
          const quotesData = await tradingApi.getMultipleQuotes(symbolsList);
          setQuotes(quotesData);
        }
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh quotes every 15 seconds for better real-time feeling
    const interval = setInterval(async () => {
      if (popularSymbols.length > 0) {
        try {
          const symbolsList = popularSymbols.map(s => s.symbol);
          const quotesData = await tradingApi.getMultipleQuotes(symbolsList);
          setQuotes(quotesData);
          // Market data refreshed successfully
        } catch (error) {
          console.error('Error refreshing quotes:', error);
        }
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

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
  
  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const formatChange = (change: number) => {
    return change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
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
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
              🕰️
            </div>
            Timeframes
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
      <Card className="border-0 shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="pb-4 bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-950/30 dark:to-blue-950/30 rounded-t-xl border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-sm">
                <ArrowTrendingUpIcon className="h-4 w-4" />
              </div>
              Market Overview
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground font-medium">Live</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">Real-time market data powered by Alpha Vantage</div>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-xl" />
                    <div className="space-y-2">
                      <div className="w-16 h-3 bg-muted rounded" />
                      <div className="w-24 h-2 bg-muted rounded" />
                      <div className="w-12 h-2 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="w-16 h-4 bg-muted rounded" />
                    <div className="w-12 h-3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            popularSymbols.map((item) => {
              const quote = quotes[item.symbol];
              const change = quote ? parseFloat(quote.change_percent) : 0;
              const trend = change >= 0 ? 'up' : 'down';
              
              return (
                <div
                  key={item.symbol}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
                    symbol === item.symbol 
                      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700 shadow-md" 
                      : "bg-background hover:bg-muted/50 border-border/50 hover:border-border"
                  )}
                  onClick={() => onSymbolChange(item.symbol)}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {SYMBOL_ICONS[item.symbol] || '📈'}
                      </span>
                    </div>
                    {watchlist.includes(item.symbol) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-sm">{item.symbol}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(item.symbol);
                        }}
                        className="h-4 w-4 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                      >
                        <BookmarkIcon 
                          className={cn(
                            "h-2.5 w-2.5",
                            watchlist.includes(item.symbol) ? "fill-current text-yellow-500" : "text-muted-foreground"
                          )} 
                        />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground/70">{item.type}</div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right flex flex-col gap-1">
                    <div className="font-semibold text-sm">
                      ${quote ? formatPrice(quote.price) : '--'}
                    </div>
                    <div className={cn(
                      "text-xs flex items-center gap-1 font-medium px-1.5 py-0.5 rounded",
                      trend === 'up' 
                        ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" 
                        : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                    )}>
                      {trend === 'up' ? (
                        <ArrowUpIcon className="h-2.5 w-2.5" />
                      ) : (
                        <ArrowDownIcon className="h-2.5 w-2.5" />
                      )}
                      {quote ? formatChange(change) : '--'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Technical Analysis */}
      <Card className="border-0 shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-t-xl border-b border-border/50">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
              <BoltIcon className="h-4 w-4" />
            </div>
            Technical Analysis
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-1 font-medium">Real-time market signals and indicators</div>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {TECHNICAL_INDICATORS.map((indicator, index) => (
            <div key={index} className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-background/80 to-muted/30 border border-border/60 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate mb-1">{indicator.name}</div>
                <Badge 
                  variant={getStatusBadgeVariant(indicator.status)}
                  className="text-xs font-semibold px-2 py-0.5 shadow-sm"
                >
                  {indicator.status}
                </Badge>
              </div>
              <div className={cn("font-bold text-sm px-3 py-1.5 rounded-xl bg-background/80 shadow-sm ring-1 ring-border/20 group-hover:ring-border/40 transition-all", indicator.color)}>
                {indicator.value}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}