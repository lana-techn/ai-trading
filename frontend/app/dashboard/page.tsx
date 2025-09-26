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
      <Card className="bg-gradient-to-r from-primary to-chart-5 border-0 relative" padding="lg">
        {isDevelopmentMode && (
          <div className="absolute top-4 right-4">
            <StatusBadge status="warning" className="bg-warning/20 text-warning border-warning/30" />
          </div>
        )}
        <div className="flex items-center justify-between text-primary-foreground">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to AI Trading Agent</h1>
            <p className="text-primary-foreground/90">
              Advanced hybrid AI trading analysis powered by Qwen and Gemini models
              {isDevelopmentMode && <span className="block text-sm mt-1 opacity-80">Running with mock data - Backend not connected</span>}
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm opacity-90">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">30+</div>
              <div className="text-sm opacity-90">Indicators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm opacity-90">Markets</div>
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
                <p className="text-sm text-muted-foreground">AI Systems</p>
                <p className={cn(
                  "font-semibold",
                  healthStatus?.services?.hybrid_ai === 'operational' 
                    ? "text-success" 
                    : healthStatus?.services?.hybrid_ai === 'development'
                    ? "text-info"
                    : "text-destructive"
                )}>
                  {isLoading ? 'Checking...' : 
                   healthStatus?.services?.hybrid_ai === 'operational' ? 'Online' :
                   healthStatus?.services?.hybrid_ai === 'development' ? 'Dev Mode' : 'Offline'}
                </p>
              </div>
              <CpuChipIcon className={cn(
                "h-8 w-8",
                healthStatus?.services?.hybrid_ai === 'operational' 
                  ? "text-success" 
                  : healthStatus?.services?.hybrid_ai === 'development'
                  ? "text-info"
                  : "text-destructive"
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Market Data */}
        <Card hover className="transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Data</p>
                <p className={cn(
                  "font-semibold",
                  healthStatus?.services?.market_data === 'operational' 
                    ? "text-success" 
                    : healthStatus?.services?.market_data === 'development'
                    ? "text-info"
                    : "text-destructive"
                )}>
                  {isLoading ? 'Checking...' : 
                   healthStatus?.services?.market_data === 'operational' ? 'Live' :
                   healthStatus?.services?.market_data === 'development' ? 'Mock Data' : 'Delayed'}
                </p>
              </div>
              <ChartBarIcon className={cn(
                "h-8 w-8",
                healthStatus?.services?.market_data === 'operational' 
                  ? "text-success" 
                  : healthStatus?.services?.market_data === 'development'
                  ? "text-info"
                  : "text-destructive"
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Value */}
        <Card hover className="transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="font-semibold text-card-foreground">
                  {formatCurrency(MOCK_PORTFOLIO.totalValue)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Day P&L */}
        <Card hover className="transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s P&L</p>
                <p className={cn(
                  "font-semibold flex items-center space-x-1",
                  MOCK_PORTFOLIO.dayChange >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                )}>
                  <span>{formatCurrency(MOCK_PORTFOLIO.dayChange)}</span>
                  <span className="text-sm">({formatPercentage(MOCK_PORTFOLIO.dayChangePercent)})</span>
                </p>
              </div>
              {MOCK_PORTFOLIO.dayChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-8 w-8 text-trading-bullish" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 text-trading-bearish" />
              )}
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