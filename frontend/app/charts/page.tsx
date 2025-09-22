'use client';

import { useState } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import ProfessionalTradingChart from '@/components/charts/ProfessionalTradingChart';
import TradingSidebar from '@/components/charts/TradingSidebar';
import ChartBottomSections from '@/components/charts/ChartBottomSections';

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Professional Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center text-foreground">
              <ChartBarIcon className="h-8 w-8 mr-3 text-primary" />
              Professional Trading Charts
            </h1>
            <p className="text-muted-foreground mt-1">
              Advanced candlestick analysis with real-time data and interactive controls
            </p>
          </div>
        </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Chart Area */}
        <div className="xl:col-span-3">
          <ProfessionalTradingChart
            symbol={selectedSymbol}
            timeframe={selectedTimeframe}
            height={600}
          />
          
          {/* Bottom sections below chart */}
          <ChartBottomSections />
        </div>
        
        {/* Interactive Sidebar */}
        <div className="xl:col-span-1">
          <TradingSidebar
            symbol={selectedSymbol}
            onSymbolChange={handleSymbolChange}
            onTimeframeChange={handleTimeframeChange}
          />
        </div>
      </div>
    </div>
    </div>
  );
}