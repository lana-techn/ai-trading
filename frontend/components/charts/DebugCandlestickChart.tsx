'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface DebugCandlestickChartProps {
  symbol: string;
  height?: number;
}

export default function DebugCandlestickChart({ 
  symbol, 
  height = 400 
}: DebugCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Hard-coded test data yang pasti bekerja
  const getTestCandlestickData = () => {
    const basePrice = symbol.includes('BTC') ? 43000 : 
                     symbol.includes('ETH') ? 2600 : 100;
    
    const data = [];
    let price = basePrice;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic OHLC
      const change = (Math.random() - 0.5) * 0.05; // 5% max change
      const open = price;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      data.push({
        time: date.toISOString().split('T')[0], // Format: 2024-01-15
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });
      
      price = close;
    }
    
    return data;
  };

  useEffect(() => {
    if (!chartContainerRef.current) {
      console.error('❌ Chart container not found');
      return;
    }

    console.log('🚀 Creating debug candlestick chart for:', symbol);

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    try {
      // Create chart with minimal config
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#ebebeb' },
          horzLines: { color: '#ebebeb' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Create candlestick series with clear colors
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00ff00',      // Bright green
        downColor: '#ff0000',    // Bright red  
        borderVisible: true,
        wickUpColor: '#00ff00',
        wickDownColor: '#ff0000',
        borderUpColor: '#00ff00',
        borderDownColor: '#ff0000',
      });

      seriesRef.current = candlestickSeries;

      // Get test data
      const testData = getTestCandlestickData();
      console.log('📊 Test data generated:', testData);
      console.log('📈 First candle:', testData[0]);
      console.log('📈 Last candle:', testData[testData.length - 1]);

      // Set data
      candlestickSeries.setData(testData);
      
      // Fit content to make sure everything is visible
      chart.timeScale().fitContent();

      console.log('✅ Chart created successfully');
      setIsReady(true);

      // Handle resize
      const handleResize = () => {
        if (chart && chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) {
          chart.remove();
        }
      };

    } catch (error) {
      console.error('❌ Error creating chart:', error);
    }
  }, [symbol, height]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Debug Candlestick Chart - {symbol}
          {isReady && <span className="text-green-600 ml-2">✓ Ready</span>}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Testing basic candlestick functionality
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm font-semibold mb-2">Debug Info:</div>
          <div className="text-xs space-y-1">
            <div>• Chart Container: {chartContainerRef.current ? '✓ Found' : '❌ Not Found'}</div>
            <div>• Chart Instance: {chartRef.current ? '✓ Created' : '❌ Not Created'}</div>
            <div>• Series Instance: {seriesRef.current ? '✓ Created' : '❌ Not Created'}</div>
            <div>• Status: {isReady ? '✓ Ready' : '⏳ Initializing'}</div>
          </div>
        </div>
        
        <div 
          ref={chartContainerRef}
          style={{ height: `${height}px` }}
          className="w-full border border-gray-300 rounded bg-white"
        />
        
        <div className="mt-4 text-xs text-gray-600">
          <strong>Expected:</strong> Green/red candlesticks showing price movement over 30 days
        </div>
      </CardContent>
    </Card>
  );
}