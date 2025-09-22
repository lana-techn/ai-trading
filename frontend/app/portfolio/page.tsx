'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  ChartPieIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

interface Transaction {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  fees: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weekChange: number;
  monthChange: number;
  yearChange: number;
  cashBalance: number;
}

const PortfolioPage = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    weekChange: 0,
    monthChange: 0,
    yearChange: 0,
    cashBalance: 10000,
  });
  const [showBalances, setShowBalances] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const symbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'MATIC', 'AVAX'];
      const mockHoldings: Holding[] = [];
      let totalValue = 0;

      symbols.forEach((symbol, index) => {
        if (Math.random() > 0.3) { // 70% chance of holding
          const amount = Math.random() * 10 + 0.1;
          const avgPrice = Math.random() * 50000 + 1000;
          const currentPrice = avgPrice * (0.8 + Math.random() * 0.4); // ±20% variation
          const value = amount * currentPrice;
          const pnl = (currentPrice - avgPrice) * amount;
          const pnlPercent = (pnl / (avgPrice * amount)) * 100;

          totalValue += value;

          mockHoldings.push({
            id: `holding-${index}`,
            symbol,
            name: `${symbol} Token`,
            amount,
            avgPrice,
            currentPrice,
            value,
            pnl,
            pnlPercent,
            allocation: 0, // Will be calculated below
          });
        }
      });

      // Calculate allocations
      mockHoldings.forEach(holding => {
        holding.allocation = (holding.value / totalValue) * 100;
      });

      const totalPnl = mockHoldings.reduce((sum, h) => sum + h.pnl, 0);
      const totalInvested = mockHoldings.reduce((sum, h) => sum + (h.avgPrice * h.amount), 0);

      setHoldings(mockHoldings);
      setMetrics(prev => ({
        ...prev,
        totalValue: totalValue + prev.cashBalance,
        totalPnl,
        totalPnlPercent: totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0,
        dayChange: totalValue * (Math.random() * 0.1 - 0.05),
        dayChangePercent: Math.random() * 10 - 5,
        weekChange: totalValue * (Math.random() * 0.2 - 0.1),
        monthChange: totalValue * (Math.random() * 0.3 - 0.15),
        yearChange: totalValue * (Math.random() * 2 - 1),
      }));

      // Generate mock transactions
      const mockTransactions: Transaction[] = [];
      for (let i = 0; i < 20; i++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = Math.random() * 5 + 0.1;
        const price = Math.random() * 50000 + 1000;
        const total = amount * price;
        
        mockTransactions.push({
          id: `tx-${i}`,
          timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Last 30 days
          symbol,
          type,
          amount,
          price,
          total,
          fees: total * 0.001, // 0.1% fee
        });
      }

      mockTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(mockTransactions);
      setIsLoading(false);
    };

    generateMockData();
  }, []);

  const formatCurrency = (value: number, hideBalance = false) => {
    if (hideBalance && !showBalances) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
            <p className="text-muted-foreground mt-1">Track your crypto investments and performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center gap-2"
            >
              {showBalances ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              {showBalances ? 'Hide' : 'Show'} Balances
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(metrics.totalValue, true)}
                  </p>
                </div>
                <WalletIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2 transition-colors",
            metrics.totalPnl >= 0 
              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800"
              : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-red-200 dark:border-red-800"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                  <p className={cn("text-2xl font-bold",
                    metrics.totalPnl >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                  )}>
                    {formatCurrency(metrics.totalPnl, true)}
                  </p>
                  <p className={cn("text-sm",
                    metrics.totalPnl >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                  )}>
                    {formatPercentage(metrics.totalPnlPercent)}
                  </p>
                </div>
                {metrics.totalPnl >= 0 ? (
                  <ArrowTrendingUpIcon className="h-8 w-8 text-trading-bullish" />
                ) : (
                  <ArrowTrendingDownIcon className="h-8 w-8 text-trading-bearish" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            metrics.dayChange >= 0 
              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800"
              : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-red-200 dark:border-red-800"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">24h Change</p>
                  <p className={cn("text-2xl font-bold",
                    metrics.dayChange >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                  )}>
                    {formatCurrency(metrics.dayChange, true)}
                  </p>
                  <p className={cn("text-sm",
                    metrics.dayChange >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                  )}>
                    {formatPercentage(metrics.dayChangePercent)}
                  </p>
                </div>
                {metrics.dayChange >= 0 ? (
                  <ArrowUpIcon className="h-8 w-8 text-trading-bullish" />
                ) : (
                  <ArrowDownIcon className="h-8 w-8 text-trading-bearish" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(metrics.cashBalance, true)}
                  </p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <ChartPieIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartPieIcon className="h-5 w-5" />
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {holdings.length === 0 ? (
              <div className="text-center py-12">
                <ChartPieIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No Holdings Yet</p>
                <p className="text-muted-foreground">Start trading to build your portfolio</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Holdings</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Avg Price</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Current Price</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Value</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">P&L</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => (
                      <tr key={holding.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-card-foreground">{holding.symbol}</p>
                            <p className="text-sm text-muted-foreground">{holding.name}</p>
                          </div>
                        </td>
                        <td className="text-right py-4 text-card-foreground">
                          {holding.amount.toFixed(4)}
                        </td>
                        <td className="text-right py-4 text-card-foreground">
                          {formatCurrency(holding.avgPrice)}
                        </td>
                        <td className="text-right py-4 text-card-foreground">
                          {formatCurrency(holding.currentPrice)}
                        </td>
                        <td className="text-right py-4 font-medium text-card-foreground">
                          {formatCurrency(holding.value, true)}
                        </td>
                        <td className="text-right py-4">
                          <div className={cn("font-medium",
                            holding.pnl >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                          )}>
                            {formatCurrency(holding.pnl, true)}
                          </div>
                          <div className={cn("text-sm",
                            holding.pnl >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                          )}>
                            {formatPercentage(holding.pnlPercent)}
                          </div>
                        </td>
                        <td className="text-right py-4">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm text-card-foreground">
                              {holding.allocation.toFixed(1)}%
                            </span>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                style={{ width: `${Math.min(holding.allocation, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Asset</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 15).map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-4 text-sm text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-4 font-medium text-card-foreground">{tx.symbol}</td>
                        <td className="py-4">
                          <Badge 
                            variant={tx.type === 'buy' ? 'trading-bullish' : 'trading-bearish'}
                            size="sm"
                          >
                            {tx.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="text-right py-4 text-card-foreground">
                          {tx.amount.toFixed(4)}
                        </td>
                        <td className="text-right py-4 text-card-foreground">
                          {formatCurrency(tx.price)}
                        </td>
                        <td className="text-right py-4 text-card-foreground font-medium">
                          {formatCurrency(tx.total, true)}
                        </td>
                        <td className="text-right py-4 text-muted-foreground">
                          {formatCurrency(tx.fees)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioPage;