"use client";

import { useState, useEffect } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';

// Market data
const initialMarketData = {
  BTC: { price: 67234, change: 2.34, color: "orange" },
  ETH: { price: 2567, change: 1.87, color: "blue" },
  TSLA: { price: 248.50, change: -0.45, color: "red" },
  AAPL: { price: 175.84, change: 0.92, color: "gray" }
};

export default function TradingDashboard() {
  const [marketData, setMarketData] = useState(initialMarketData);
  const [aiAnalysis, setAiAnalysis] = useState({ sentiment: 75, confidence: 87 });
  const [totalPnL, setTotalPnL] = useState(127000);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          const fluctuation = (Math.random() - 0.5) * 0.015;
          newData[key].price = Math.round((newData[key].price * (1 + fluctuation)) * 100) / 100;
          newData[key].change = Math.round((newData[key].change + fluctuation * 100) * 100) / 100;
        });
        return newData;
      });
      
      setAiAnalysis(prev => ({
        sentiment: Math.max(65, Math.min(90, prev.sentiment + (Math.random() - 0.5) * 8)),
        confidence: Math.max(75, Math.min(95, prev.confidence + (Math.random() - 0.5) * 6))
      }));
      
      setTotalPnL(prev => Math.round(prev + (Math.random() - 0.4) * 800));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl border-4 border-zinc-700 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CpuChipIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Trading Dashboard</h2>
            <p className="text-sm text-gray-400">Real-time Market Analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-lg text-green-400 font-bold">LIVE</span>
        </div>
      </div>

      {/* Market Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(marketData).map(([symbol, data]) => {
          const colors = {
            orange: "bg-orange-500",
            blue: "bg-blue-500", 
            red: "bg-red-500",
            gray: "bg-gray-600"
          };
          
          const symbolIcons = { BTC: "₿", ETH: "E", TSLA: "T", AAPL: "A" };
          
          return (
            <div key={symbol} className="bg-zinc-800/70 p-4 rounded-xl border border-zinc-600 hover:bg-zinc-700/70 transition-all duration-300">
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-8 h-8 ${colors[data.color]} rounded-full flex items-center justify-center text-white font-bold`}>
                  {symbolIcons[symbol]}
                </div>
                <span className="text-lg font-bold text-white">{symbol}</span>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                ${data.price.toLocaleString()}
              </div>
              <div className={`text-sm font-semibold ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.change >= 0 ? '+' : ''}{data.change}%
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-6 mb-6 border border-blue-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <SparklesIcon className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">AI Market Analysis</h3>
          <div className="ml-auto text-blue-400 animate-pulse">● Processing...</div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Market Sentiment</span>
              <span className="text-sm font-bold text-green-400">
                {aiAnalysis.sentiment >= 70 ? 'Bullish' : 'Neutral'} {Math.round(aiAnalysis.sentiment)}%
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                style={{ width: `${aiAnalysis.sentiment}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">AI Confidence</span>
              <span className="text-sm font-bold text-blue-400">
                High {Math.round(aiAnalysis.confidence)}%
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all duration-1000"
                style={{ width: `${aiAnalysis.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
          <div className="text-2xl font-bold text-white mb-1">94.7%</div>
          <div className="text-sm text-gray-400">Win Rate</div>
        </div>
        <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
          <div className={`text-2xl font-bold mb-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${Math.round(totalPnL / 1000)}K
          </div>
          <div className="text-sm text-gray-400">Total P&L</div>
        </div>
        <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
          <div className="text-2xl font-bold text-blue-400 mb-1">0.8s</div>
          <div className="text-sm text-gray-400">Exec Time</div>
        </div>
      </div>
    </div>
  );
}