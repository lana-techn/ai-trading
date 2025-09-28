'use client';

import { useState, useEffect } from 'react';
import { 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  status: 'open' | 'closed';
  pnl?: number;
  closePrice?: number;
  closeTimestamp?: string;
}

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface PaperTradingSimulatorProps {
  className?: string;
}

export default function PaperTradingSimulator({ className }: PaperTradingSimulatorProps) {
  const [balance, setBalance] = useState(100000); // Starting with $100k
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  const symbols = [
    'BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD', 
    'DOT/USD', 'AVAX/USD', 'MATIC/USD', 'LINK/USD'
  ];

  // Simulate real-time price updates
  useEffect(() => {
    const updatePrices = () => {
      const newPrices: Record<string, number> = {};
      symbols.forEach(symbol => {
        const basePrice = getBasePrice(symbol);
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        newPrices[symbol] = basePrice * (1 + variation);
      });
      setCurrentPrices(newPrices);
      
      // Update positions with new prices
      setPositions(prevPositions => 
        prevPositions.map(position => {
          const currentPrice = newPrices[position.symbol] || position.currentPrice;
          const pnl = (currentPrice - position.avgPrice) * position.quantity;
          const pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100;
          
          return {
            ...position,
            currentPrice,
            pnl,
            pnlPercent
          };
        })
      );
    };

    // Initial price update
    updatePrices();

    // Update prices every 5 seconds
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const getBasePrice = (symbol: string): number => {
    const basePrices: Record<string, number> = {
      'BTC/USD': 50000,
      'ETH/USD': 3000,
      'SOL/USD': 100,
      'ADA/USD': 0.5,
      'DOT/USD': 8,
      'AVAX/USD': 25,
      'MATIC/USD': 0.8,
      'LINK/USD': 15
    };
    return basePrices[symbol] || 100;
  };

  const executeTrade = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return;

    const amount = parseFloat(tradeAmount);
    const currentPrice = currentPrices[selectedSymbol] || getBasePrice(selectedSymbol);
    const totalCost = amount * currentPrice;

    // Check if user has enough balance for buy orders
    if (tradeType === 'buy' && totalCost > balance) {
      alert('Insufficient balance');
      return;
    }

    // Check if user has enough position for sell orders
    if (tradeType === 'sell') {
      const existingPosition = positions.find(p => p.symbol === selectedSymbol);
      if (!existingPosition || existingPosition.quantity < amount) {
        alert('Insufficient position');
        return;
      }
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      type: tradeType,
      amount,
      price: currentPrice,
      timestamp: new Date().toISOString(),
      status: 'open'
    };

    setTrades(prev => [newTrade, ...prev]);

    // Update balance
    if (tradeType === 'buy') {
      setBalance(prev => prev - totalCost);
    } else {
      setBalance(prev => prev + totalCost);
    }

    // Update positions
    setPositions(prev => {
      const existingPositionIndex = prev.findIndex(p => p.symbol === selectedSymbol);
      
      if (existingPositionIndex >= 0) {
        const newPositions = [...prev];
        const existingPosition = newPositions[existingPositionIndex];
        
        if (tradeType === 'buy') {
          const newQuantity = existingPosition.quantity + amount;
          const newAvgPrice = ((existingPosition.avgPrice * existingPosition.quantity) + (currentPrice * amount)) / newQuantity;
          
          newPositions[existingPositionIndex] = {
            ...existingPosition,
            quantity: newQuantity,
            avgPrice: newAvgPrice
          };
        } else {
          const newQuantity = existingPosition.quantity - amount;
          if (newQuantity <= 0) {
            newPositions.splice(existingPositionIndex, 1);
          } else {
            newPositions[existingPositionIndex] = {
              ...existingPosition,
              quantity: newQuantity
            };
          }
        }
        
        return newPositions;
      } else if (tradeType === 'buy') {
        const newPosition: Position = {
          symbol: selectedSymbol,
          quantity: amount,
          avgPrice: currentPrice,
          currentPrice,
          pnl: 0,
          pnlPercent: 0
        };
        return [...prev, newPosition];
      }
      
      return prev;
    });

    // Reset form
    setTradeAmount('');
    setShowTradeModal(false);
  };

  const closePosition = (symbol: string) => {
    const position = positions.find(p => p.symbol === symbol);
    if (!position) return;

    const currentPrice = currentPrices[symbol] || getBasePrice(symbol);
    const totalValue = position.quantity * currentPrice;
    
    // Update balance
    setBalance(prev => prev + totalValue);
    
    // Remove position
    setPositions(prev => prev.filter(p => p.symbol !== symbol));
    
    // Add closing trade to history
    const closeTrade: Trade = {
      id: Date.now().toString(),
      symbol,
      type: 'sell',
      amount: position.quantity,
      price: currentPrice,
      timestamp: new Date().toISOString(),
      status: 'closed',
      pnl: position.pnl
    };
    
    setTrades(prev => [closeTrade, ...prev]);
  };

  const totalPortfolioValue = balance + positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);
  const totalPnL = totalPortfolioValue - 100000; // Initial balance was $100k
  const totalPnLPercent = (totalPnL / 100000) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Portfolio Overview */}
      <Card className="border-card-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-card-foreground">
              <div className="relative">
                <ChartBarIcon className="h-6 w-6 mr-3 text-primary transition-all duration-300 hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              Paper Trading Portfolio
            </CardTitle>
            
            <Button
              onClick={() => setShowTradeModal(true)}
              className="bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
              size="md"
            >
              <PlusIcon className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
              New Trade
            </Button>
          </div>
        </CardHeader>
        <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Cash Balance */}
            <Card className="bg-gradient-to-br from-info/10 via-card to-primary/5 border-info/30 hover:border-info/50 transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-info text-sm font-medium group-hover:text-info/80 transition-colors">Cash Balance</p>
                    <p className="text-2xl font-bold text-card-foreground group-hover:scale-105 transition-transform">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="relative">
                    <BanknotesIcon className="h-8 w-8 text-info group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-info/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Portfolio */}
            <Card className="bg-gradient-to-br from-primary/10 via-card to-chart-1/5 border-primary/30 hover:border-primary/50 transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary text-sm font-medium group-hover:text-primary/80 transition-colors">Total Portfolio</p>
                    <p className="text-2xl font-bold text-card-foreground group-hover:scale-105 transition-transform">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="relative">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total P&L */}
            <Card className={cn(
              "bg-gradient-to-br via-card border-2 transition-all duration-300 group hover:scale-105",
              totalPnL >= 0 
                ? "from-trading-bullish/10 to-success/5 border-trading-bullish/30 hover:border-trading-bullish/50 hover:shadow-lg hover:shadow-trading-bullish/20" 
                : "from-trading-bearish/10 to-destructive/5 border-trading-bearish/30 hover:border-trading-bearish/50 hover:shadow-lg hover:shadow-trading-bearish/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium transition-colors", totalPnL >= 0 ? "text-trading-bullish group-hover:text-trading-bullish/80" : "text-trading-bearish group-hover:text-trading-bearish/80")}>Total P&L</p>
                    <p className={cn("text-2xl font-bold transition-all duration-300 group-hover:scale-105", totalPnL >= 0 ? "text-trading-bullish" : "text-trading-bearish")}>
                      {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={cn("text-sm transition-colors", totalPnL >= 0 ? "text-trading-bullish group-hover:text-trading-bullish/80" : "text-trading-bearish group-hover:text-trading-bearish/80")}>
                      {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="relative">
                    {totalPnL >= 0 ? 
                      <ArrowUpIcon className="h-8 w-8 text-trading-bullish group-hover:scale-110 transition-transform" /> : 
                      <ArrowDownIcon className="h-8 w-8 text-trading-bearish group-hover:scale-110 transition-transform" />
                    }
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity",
                      totalPnL >= 0 ? "bg-trading-bullish/20" : "bg-trading-bearish/20"
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Trades */}
            <Card className="bg-gradient-to-br from-chart-5/10 via-card to-secondary/5 border-chart-5/30 hover:border-chart-5/50 transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-chart-5 text-sm font-medium group-hover:text-chart-5/80 transition-colors">Active Trades</p>
                    <p className="text-2xl font-bold text-card-foreground group-hover:scale-105 transition-transform">{positions.length}</p>
                  </div>
                  <div className="relative">
                    <ClockIcon className="h-8 w-8 text-chart-5 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-chart-5/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Current Positions */}
      {positions.length > 0 && (
        <Card className="border-card-border bg-card shadow-sm">
          <CardHeader className="border-b border-border bg-card">
            <CardTitle className="text-card-foreground">Current Positions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-card-foreground">Symbol</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-card-foreground">Quantity</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-card-foreground">Avg Price</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-card-foreground">Current Price</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-card-foreground">P&L</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-card-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {positions.map((position) => (
                    <tr key={position.symbol} className="border-b border-border/50 hover:bg-accent/50 transition-all duration-200 group">
                      <td className="py-4 px-6 font-medium text-card-foreground group-hover:text-primary transition-colors">{position.symbol}</td>
                      <td className="text-right py-4 px-4 text-card-foreground font-mono">{position.quantity.toFixed(4)}</td>
                      <td className="text-right py-4 px-4 text-card-foreground font-mono">${position.avgPrice.toFixed(2)}</td>
                      <td className="text-right py-4 px-4 text-card-foreground font-mono">${position.currentPrice.toFixed(2)}</td>
                      <td className="text-right py-4 px-4">
                        <div className={cn("font-semibold font-mono transition-all duration-200 group-hover:scale-105", position.pnl >= 0 ? "text-trading-bullish" : "text-trading-bearish")}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                        </div>
                        <div className={cn("text-xs font-mono transition-colors", position.pnl >= 0 ? "text-trading-bullish/80" : "text-trading-bearish/80")}>
                          {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="text-right py-4 px-6">
                        <Button
                          onClick={() => closePosition(position.symbol)}
                          variant="outline"
                          size="sm"
                          className="bg-trading-bearish/10 border-trading-bearish/30 text-trading-bearish hover:bg-trading-bearish hover:text-white transition-all duration-200 hover:scale-105"
                        >
                          Close
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trades */}
      <Card className="border-card-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-card">
          <CardTitle className="text-card-foreground">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trades.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="relative inline-block">
                <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30 transition-all duration-300 hover:opacity-50 hover:scale-110" />
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">No trades yet</p>
              <p className="text-sm text-muted-foreground/80">Click &quot;New Trade&quot; to start paper trading</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-card-foreground">Time</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-card-foreground">Symbol</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-card-foreground">Type</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-card-foreground">Amount</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-card-foreground">Price</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-card-foreground">Total</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-card-foreground">P&L</th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-accent/50 transition-all duration-200 group">
                      <td className="py-4 px-6 text-sm text-muted-foreground font-mono group-hover:text-card-foreground transition-colors">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-4 font-medium text-card-foreground group-hover:text-primary transition-colors">{trade.symbol}</td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-md border transition-all duration-200 group-hover:scale-105",
                            trade.type === 'buy' 
                              ? "bg-trading-bullish/15 text-trading-bullish border-trading-bullish/30 hover:bg-trading-bullish/25" 
                              : "bg-trading-bearish/15 text-trading-bearish border-trading-bearish/30 hover:bg-trading-bearish/25"
                          )}
                        >
                          {trade.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="text-right py-4 px-4 text-card-foreground font-mono">{trade.amount.toFixed(4)}</td>
                      <td className="text-right py-4 px-4 text-card-foreground font-mono">${trade.price.toFixed(2)}</td>
                      <td className="text-right py-4 px-4 text-card-foreground font-mono font-semibold">${(trade.amount * trade.price).toFixed(2)}</td>
                      <td className={cn("text-right py-4 px-6 font-semibold font-mono transition-all duration-200 group-hover:scale-105",
                        trade.pnl !== undefined
                          ? trade.pnl >= 0 ? "text-trading-bullish" : "text-trading-bearish"
                          : "text-muted-foreground"
                      )}>
                        {trade.pnl !== undefined
                          ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-lg border border-card-border bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg text-card-foreground">Execute Trade</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Symbol</label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-colors"
                  >
                    {symbols.map(symbol => (
                      <option key={symbol} value={symbol} className="bg-background text-foreground">{symbol}</option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current price: ${(currentPrices[selectedSymbol] || getBasePrice(selectedSymbol)).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tradeType === 'buy' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTradeType('buy')}
                      className={cn(
                        "flex-1 transition-all duration-200",
                        tradeType === 'buy' 
                          ? "bg-trading-bullish hover:bg-trading-bullish/90 text-white border-trading-bullish" 
                          : "hover:bg-trading-bullish/10 hover:text-trading-bullish hover:border-trading-bullish"
                      )}
                    >
                      Buy
                    </Button>
                    <Button
                      type="button"
                      variant={tradeType === 'sell' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTradeType('sell')}
                      className={cn(
                        "flex-1 transition-all duration-200",
                        tradeType === 'sell' 
                          ? "bg-trading-bearish hover:bg-trading-bearish/90 text-white border-trading-bearish" 
                          : "hover:bg-trading-bearish/10 hover:text-trading-bearish hover:border-trading-bearish"
                      )}
                    >
                      Sell
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-colors"
                    placeholder="Enter amount"
                  />
                  {tradeAmount && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: ${(parseFloat(tradeAmount) * (currentPrices[selectedSymbol] || getBasePrice(selectedSymbol))).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTradeModal(false)}
                  className="flex-1 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeTrade}
                  disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                  className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Execute Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}