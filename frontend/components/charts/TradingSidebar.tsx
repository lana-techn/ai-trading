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
    
    // Refresh quotes every 30 seconds
    const interval = setInterval(async () => {
      if (popularSymbols.length > 0) {
        try {
          const symbolsList = popularSymbols.map(s => s.symbol);
          const quotesData = await tradingApi.getMultipleQuotes(symbolsList);
          setQuotes(quotesData);
        } catch (error) {
          console.error('Error refreshing quotes:', error);
        }
      }
    }, 30000);
    
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
          <div className="text-xs text-muted-foreground mt-1">Live market prices via Alpha Vantage</div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                    "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
                    symbol === item.symbol 
                      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-md" 
                      : "bg-muted/50 border-border hover:bg-muted"
                  )}
                  onClick={() => onSymbolChange(item.symbol)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background shadow-sm">
                      <span className="text-sm font-bold text-foreground">
                        {SYMBOL_ICONS[item.symbol] || '📊'}
                      </span>
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
                      <div className="text-xs text-muted-foreground/70">{item.type}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-xs text-foreground">
                      ${quote ? formatPrice(quote.price) : '--'}
                    </div>
                    <div className={cn(
                      "text-xs flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-full",
                      trend === 'up' 
                        ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50" 
                        : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50"
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