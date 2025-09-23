'use client';

import { useState, useEffect } from 'react';
import { 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-primary" />
              Paper Trading Portfolio
            </CardTitle>
            
            <Button
              onClick={() => setShowTradeModal(true)}
              variant="primary"
              size="md"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Trade
            </Button>
          </div>
        </CardHeader>
        <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Cash Balance */}
            <Card className="bg-gradient-to-br from-info/10 to-primary/5 border-info/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-info text-sm font-medium">Cash Balance</p>
                    <p className="text-2xl font-bold text-card-foreground">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <BanknotesIcon className="h-8 w-8 text-info" />
                </div>
              </CardContent>
            </Card>

            {/* Total Portfolio */}
            <Card className="bg-gradient-to-br from-primary/10 to-chart-1/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary text-sm font-medium">Total Portfolio</p>
                    <p className="text-2xl font-bold text-card-foreground">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <ArrowTrendingUpIcon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Total P&L */}
            <Card className={cn(
              "bg-gradient-to-br border-2",
              totalPnL >= 0 
                ? "from-trading-bullish/10 to-success/5 border-trading-bullish/20" 
                : "from-trading-bearish/10 to-destructive/5 border-trading-bearish/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", totalPnL >= 0 ? "text-trading-bullish" : "text-trading-bearish")}>Total P&L</p>
                    <p className={cn("text-2xl font-bold", totalPnL >= 0 ? "text-trading-bullish" : "text-trading-bearish")}>
                      {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={cn("text-sm", totalPnL >= 0 ? "text-trading-bullish" : "text-trading-bearish")}>
                      {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                    </p>
                  </div>
                  {totalPnL >= 0 ? 
                    <ArrowUpIcon className="h-8 w-8 text-trading-bullish" /> : 
                    <ArrowDownIcon className="h-8 w-8 text-trading-bearish" />
                  }
                </div>
              </CardContent>
            </Card>

            {/* Active Trades */}
            <Card className="bg-gradient-to-br from-chart-5/10 to-secondary/5 border-chart-5/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-chart-5 text-sm font-medium">Active Trades</p>
                    <p className="text-2xl font-bold text-card-foreground">{positions.length}</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-chart-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Current Positions */}
      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Avg Price</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Current Price</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">P&L</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.symbol} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-4 font-medium text-card-foreground">{position.symbol}</td>
                      <td className="text-right py-4 text-card-foreground">{position.quantity.toFixed(4)}</td>
                      <td className="text-right py-4 text-card-foreground">${position.avgPrice.toFixed(2)}</td>
                      <td className="text-right py-4 text-card-foreground">${position.currentPrice.toFixed(2)}</td>
                      <td className="text-right py-4">
                        <div className={cn("font-medium", position.pnl >= 0 ? "text-trading-bullish" : "text-trading-bearish")}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                        </div>
                        <div className={cn("text-xs", position.pnl >= 0 ? "text-trading-bullish" : "text-trading-bearish")}>
                          {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="text-right py-4">
                        <Button
                          onClick={() => closePosition(position.symbol)}
                          variant="destructive"
                          size="sm"
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No trades yet</p>
              <p className="text-sm text-muted-foreground">Click "New Trade" to start paper trading</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4 font-medium text-card-foreground">{trade.symbol}</td>
                      <td className="py-4">
                        <Badge 
                          variant={trade.type === 'buy' ? 'trading-bullish' : 'trading-bearish'}
                          size="sm"
                        >
                          {trade.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="text-right py-4 text-card-foreground">{trade.amount.toFixed(4)}</td>
                      <td className="text-right py-4 text-card-foreground">${trade.price.toFixed(2)}</td>
                      <td className="text-right py-4 text-card-foreground">${(trade.amount * trade.price).toFixed(2)}</td>
                      <td className={cn("text-right py-4 font-medium",
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
          <Card className="w-full max-w-md mx-4 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Execute Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Symbol</label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {symbols.map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current price: ${(currentPrices[selectedSymbol] || getBasePrice(selectedSymbol)).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tradeType === 'buy' ? 'trading-bullish' : 'outline'}
                      size="sm"
                      onClick={() => setTradeType('buy')}
                      className="flex-1"
                    >
                      Buy
                    </Button>
                    <Button
                      type="button"
                      variant={tradeType === 'sell' ? 'trading-bearish' : 'outline'}
                      size="sm"
                      onClick={() => setTradeType('sell')}
                      className="flex-1"
                    >
                      Sell
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeTrade}
                  disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                  className="flex-1"
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