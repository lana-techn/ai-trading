'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import CandlestickChart from '@/components/charts/CandlestickChart';
import ChartBottomSections from '@/components/charts/ChartBottomSections';
import { cn } from '@/lib/utils';

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [assetType, setAssetType] = useState<'stocks' | 'crypto'>('stocks');
  

  // Asset options
  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'];
  const cryptoSymbols = ['BTC-USD', 'ETH-USD', 'ADA-USD', 'SOL-USD', 'DOT-USD', 'AVAX-USD'];
  
  const currentSymbols = assetType === 'stocks' ? stockSymbols : cryptoSymbols;

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  
  const handleAssetTypeChange = (type: 'stocks' | 'crypto') => {
    setAssetType(type);
    // Switch to first symbol of the new asset type
    const newSymbols = type === 'stocks' ? stockSymbols : cryptoSymbols;
    setSelectedSymbol(newSymbols[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Modern Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl transition-colors duration-300">
              <ChartBarIcon className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-foreground mb-1">
                Professional Trading
              </h1>
              <p className="text-xl text-primary font-medium">
                Advanced Candlestick Analysis
              </p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Real-time market data with interactive charts, technical analysis tools, and professional trading insights
          </p>
        </div>

        {/* Main Layout */}
        <div className="space-y-8">
          {/* Asset Selection Tabs */}
          <div className="flex items-center justify-center">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-2 shadow-lg transition-colors duration-300">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAssetTypeChange('stocks')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-all duration-300",
                    assetType === 'stocks'
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  📈 Stocks
                </button>
                <button 
                  onClick={() => handleAssetTypeChange('crypto')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-all duration-300",
                    assetType === 'crypto'
                      ? "bg-warning text-warning-foreground hover:bg-warning/90"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  ₿ Crypto
                </button>
              </div>
            </div>
          </div>
          
          {/* Symbol Selection Pills */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg overflow-x-auto transition-all duration-300 hover:shadow-xl hover:bg-card/70">
              {currentSymbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleSymbolChange(symbol)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap",
                    selectedSymbol === symbol
                      ? assetType === 'stocks' 
                        ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover" 
                        : "bg-warning text-warning-foreground shadow-lg hover:bg-warning/90"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          
          {/* Large Professional Trading Chart */}
          <div className="w-full">
            <CandlestickChart
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
              height={600}
            />
          </div>
          
          {/* Market Overview Section - Moved to Bottom */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl shadow-lg transition-colors duration-300">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Market Overview
              </h2>
              <p className="text-muted-foreground">
                Real-time market data and analysis tools
              </p>
            </div>
            <div className="p-6">
              <ChartBottomSections />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}