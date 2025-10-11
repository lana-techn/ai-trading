'use client';

import { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { tradingApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Button, TradingActionBadge, StatusBadge } from '@/components/ui';

// Mock data for demonstration
const MOCK_PORTFOLIO = {
  totalValue: 125650.75,
  dayChange: 2350.25,
  dayChangePercent: 1.87,
  positions: [
    { symbol: 'BTC-USD', value: 45000, change: 2.5, quantity: 0.5 },
    { symbol: 'ETH-USD', value: 28000, change: -1.2, quantity: 8.2 },
    { symbol: 'AAPL', value: 35000, change: 0.8, quantity: 200 },
    { symbol: 'MSFT', value: 17650.75, change: 1.5, quantity: 50 },
  ],
};

const RECENT_ANALYSES = [
  { symbol: 'BTC-USD', action: 'buy', confidence: 0.85, time: '2 minutes ago' },
  { symbol: 'ETH-USD', action: 'hold', confidence: 0.62, time: '15 minutes ago' },
  { symbol: 'AAPL', action: 'sell', confidence: 0.78, time: '1 hour ago' },
];

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    services: {
      hybrid_ai?: string;
      market_data?: string;
      websocket?: string;
      database?: string;
    };
    timestamp: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  useEffect(() => {
    // Check API health status
    const checkHealth = async () => {
      try {
        const health = await tradingApi.healthCheck();
        setHealthStatus(health);
      } catch (error) {
        console.warn('API not available, running in development mode:', error);
        // Set mock health status for development
        setHealthStatus({
          status: 'development',
          services: {
            hybrid_ai: 'development',
            market_data: 'development',
            websocket: 'development',
            database: 'development'
          },
          timestamp: new Date().toISOString()
        });
        setIsDevelopmentMode(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
  }, []);


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <Card className="border-border bg-card relative" padding="lg">
        {isDevelopmentMode && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-500/30 dark:border-yellow-400/30">
              <div className="h-2 w-2 bg-yellow-600 dark:bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Dev Mode</span>
            </div>
          </div>
        )}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CpuChipIcon className="h-9 w-9 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to NousTrade</h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Advanced hybrid AI trading analysis powered by Qwen and Gemini models
                {isDevelopmentMode && <span className="block text-sm mt-2 text-yellow-700 dark:text-yellow-400 font-medium">⚠️ Running with mock data - Backend not connected</span>}
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center px-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center mx-auto mb-2">
                <CpuChipIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">2</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">AI Models</div>
            </div>
            <div className="text-center px-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center mx-auto mb-2">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">30+</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Trading Pairs</div>
            </div>
            <div className="text-center px-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center mx-auto mb-2">
                <BoltIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Markets</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* AI Status */}
        <Card hover className="transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">AI Systems</p>
                <p className={cn(
                  "text-lg font-bold",
                  healthStatus?.services?.hybrid_ai === 'operational' 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : healthStatus?.services?.hybrid_ai === 'development'
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                )}>
                  {isLoading ? 'Checking...' : 
                   healthStatus?.services?.hybrid_ai === 'operational' ? 'Online' :
                   healthStatus?.services?.hybrid_ai === 'development' ? 'Dev Mode' : 'Offline'}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center",
                healthStatus?.services?.hybrid_ai === 'operational' 
                  ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" 
                  : healthStatus?.services?.hybrid_ai === 'development'
                  ? "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                  : "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
              )}>
                <CpuChipIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Data */}
        <Card hover className="transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Market Data</p>
                <p className={cn(
                  "text-lg font-bold",
                  healthStatus?.services?.market_data === 'operational' 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : healthStatus?.services?.market_data === 'development'
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                )}>
                  {isLoading ? 'Checking...' : 
                   healthStatus?.services?.market_data === 'operational' ? 'Live' :
                   healthStatus?.services?.market_data === 'development' ? 'Mock Data' : 'Delayed'}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center",
                healthStatus?.services?.market_data === 'operational' 
                  ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" 
                  : healthStatus?.services?.market_data === 'development'
                  ? "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                  : "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
              )}>
                <ChartBarIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Value */}
        <Card hover className="transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Portfolio Value</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(MOCK_PORTFOLIO.totalValue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day P&L */}
        <Card hover className="transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Today&apos;s P&L</p>
                <p className={cn(
                  "text-lg font-bold flex items-center space-x-1",
                  MOCK_PORTFOLIO.dayChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  <span>{formatCurrency(MOCK_PORTFOLIO.dayChange)}</span>
                  <span className="text-sm font-medium">({formatPercentage(MOCK_PORTFOLIO.dayChangePercent)})</span>
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center",
                MOCK_PORTFOLIO.dayChange >= 0 
                  ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" 
                  : "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
              )}>
                {MOCK_PORTFOLIO.dayChange >= 0 ? (
                  <ArrowTrendingUpIcon className="h-6 w-6" />
                ) : (
                  <ArrowTrendingDownIcon className="h-6 w-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AI Analyses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ANALYSES.map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg transition-all duration-200 hover:bg-background-tertiary">
                  <div className="flex items-center space-x-3">
                    <TradingActionBadge 
                      action={analysis.action as 'buy' | 'sell' | 'hold'}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-card-foreground">{analysis.symbol}</p>
                      <p className="text-sm text-muted-foreground">{analysis.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">
                      {formatPercentage(analysis.confidence * 100, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Positions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_PORTFOLIO.positions.map((position, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg transition-all duration-200 hover:bg-background-tertiary">
                  <div>
                    <p className="font-medium text-card-foreground">{position.symbol}</p>
                    <p className="text-sm text-muted-foreground">Qty: {position.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">
                      {formatCurrency(position.value)}
                    </p>
                    <p className={cn(
                      "text-sm",
                      position.change >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                    )}>
                      {formatPercentage(position.change)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="ghost"
              size="lg"
              className="h-auto flex-col gap-2 p-4 hover:bg-chart-1/10 hover:text-chart-1 border border-chart-1/20 hover:border-chart-1/40"
              onClick={() => window.location.href = '/analysis'}
            >
              <CpuChipIcon className="h-8 w-8" />
              <span className="text-sm font-medium">AI Analysis</span>
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="h-auto flex-col gap-2 p-4 hover:bg-chart-2/10 hover:text-chart-2 border border-chart-2/20 hover:border-chart-2/40"
              onClick={() => window.location.href = '/charts'}
            >
              <ChartBarIcon className="h-8 w-8" />
              <span className="text-sm font-medium">View Charts</span>
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="h-auto flex-col gap-2 p-4 hover:bg-chart-5/10 hover:text-chart-5 border border-chart-5/20 hover:border-chart-5/40"
              onClick={() => window.location.href = '/trading'}
            >
              <BoltIcon className="h-8 w-8" />
              <span className="text-sm font-medium">Live Trading</span>
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="h-auto flex-col gap-2 p-4 hover:bg-chart-4/10 hover:text-chart-4 border border-chart-4/20 hover:border-chart-4/40"
              onClick={() => window.location.href = '/chat'}
            >
              <CpuChipIcon className="h-8 w-8" />
              <span className="text-sm font-medium">AI Chat</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}