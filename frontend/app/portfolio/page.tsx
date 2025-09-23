'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  ChartBarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowPathIcon,
  ClockIcon,
  GlobeAltIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import PortfolioDashboard from '@/components/portfolio/PortfolioDashboard';
import PortfolioHoldings from '@/components/portfolio/PortfolioHoldings';
import PortfolioPerformance from '@/components/portfolio/PortfolioPerformance';
import TransactionHistory from '@/components/portfolio/TransactionHistory';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';

interface PortfolioData {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: any[];
  transactions: any[];
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Theme management with mounted state
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkMode = mounted ? resolvedTheme === 'dark' : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock portfolio data - replace with real API calls
  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockData: PortfolioData = {
          totalValue: 127549.83,
          totalGainLoss: 23847.92,
          totalGainLossPercent: 23.01,
          dayChange: 1547.21,
          dayChangePercent: 1.23,
          holdings: [
            { symbol: 'AAPL', name: 'Apple Inc.', quantity: 150, avgPrice: 145.32, currentPrice: 182.41, value: 27361.50, gainLoss: 5563.50, gainLossPercent: 25.55 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 75, avgPrice: 2234.50, currentPrice: 2591.25, value: 19434.38, gainLoss: 2676.25, gainLossPercent: 15.97 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 100, avgPrice: 285.75, currentPrice: 334.89, value: 33489.00, gainLoss: 4914.00, gainLossPercent: 17.19 },
            { symbol: 'TSLA', name: 'Tesla Inc.', quantity: 50, avgPrice: 198.45, currentPrice: 235.87, value: 11793.50, gainLoss: 1871.00, gainLossPercent: 18.86 },
            { symbol: 'BTC-USD', name: 'Bitcoin', quantity: 2.5, avgPrice: 24500.00, currentPrice: 43250.00, value: 108125.00, gainLoss: 46875.00, gainLossPercent: 76.53 },
            { symbol: 'ETH-USD', name: 'Ethereum', quantity: 15, avgPrice: 1650.00, currentPrice: 2340.00, value: 35100.00, gainLoss: 10350.00, gainLossPercent: 41.82 }
          ],
          transactions: [
            { id: 1, type: 'buy', symbol: 'AAPL', quantity: 50, price: 182.41, value: 9120.50, date: '2024-01-15', fees: 1.99 },
            { id: 2, type: 'sell', symbol: 'GOOGL', quantity: 25, price: 2591.25, value: 64781.25, date: '2024-01-14', fees: 4.99 },
            { id: 3, type: 'buy', symbol: 'BTC-USD', quantity: 0.5, price: 43250.00, value: 21625.00, date: '2024-01-13', fees: 12.50 }
          ]
        };
        
        setPortfolioData(mockData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'holdings', label: 'Holdings', icon: BanknotesIcon },
    { id: 'performance', label: 'Performance', icon: ArrowTrendingUpIcon },
    { id: 'transactions', label: 'Transactions', icon: ClockIcon },
    { id: 'analytics', label: 'Analytics', icon: ScaleIcon }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-card rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Modern Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl">
              <BanknotesIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-1">
                My Portfolio
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Real-time portfolio tracking & analytics</span>
                {lastUpdated && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
            >
              {showBalance ? <EyeSlashIcon className="h-4 w-4 mr-2" /> : <EyeIcon className="h-4 w-4 mr-2" />}
              {showBalance ? 'Hide' : 'Show'} Balance
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Position
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        {portfolioData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Portfolio Value */}
            <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                    <BanknotesIcon className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {showBalance ? formatCurrency(portfolioData.totalValue) : '••••••'}
                  </div>
                  <div className="text-sm text-muted-foreground">Portfolio Balance</div>
                </div>
              </CardContent>
            </Card>

            {/* Total Gain/Loss */}
            <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    portfolioData.totalGainLoss >= 0 
                      ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                      : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                  )}>
                    {portfolioData.totalGainLoss >= 0 ? <ArrowTrendingUpIcon className="h-5 w-5" /> : <ArrowTrendingDownIcon className="h-5 w-5" />}
                  </div>
                  <div className="text-xs text-muted-foreground">Total P&L</div>
                </div>
                <div className="space-y-1">
                  <div className={cn(
                    "text-2xl font-bold",
                    portfolioData.totalGainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {showBalance ? formatCurrency(portfolioData.totalGainLoss) : '••••••'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercentage(portfolioData.totalGainLossPercent)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Day Change */}
            <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    portfolioData.dayChange >= 0 
                      ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                      : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                  )}>
                    {portfolioData.dayChange >= 0 ? <ArrowTrendingUpIcon className="h-5 w-5" /> : <ArrowTrendingDownIcon className="h-5 w-5" />}
                  </div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="space-y-1">
                  <div className={cn(
                    "text-2xl font-bold",
                    portfolioData.dayChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {showBalance ? formatCurrency(portfolioData.dayChange) : '••••••'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercentage(portfolioData.dayChangePercent)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Holdings Count */}
            <Card className="bg-gradient-to-br from-card to-card/80 border-border/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                    <GlobeAltIcon className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-muted-foreground">Positions</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {portfolioData.holdings.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Holdings</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto" />
                  <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}} />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">Loading Portfolio Data</p>
                  <p className="text-sm text-muted-foreground">Fetching your latest portfolio information</p>
                </div>
              </div>
            </div>
          ) : (
            portfolioData && (
              <>
                {activeTab === 'overview' && (
                  <PortfolioDashboard 
                    portfolioData={portfolioData}
                    showBalance={showBalance}
                  />
                )}
                {activeTab === 'holdings' && (
                  <PortfolioHoldings 
                    holdings={portfolioData.holdings}
                    showBalance={showBalance}
                  />
                )}
                {activeTab === 'performance' && (
                  <PortfolioPerformance 
                    portfolioData={portfolioData}
                  />
                )}
                {activeTab === 'transactions' && (
                  <TransactionHistory 
                    transactions={portfolioData.transactions}
                    showBalance={showBalance}
                  />
                )}
                {activeTab === 'analytics' && (
                  <PortfolioAnalytics 
                    portfolioData={portfolioData}
                  />
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
