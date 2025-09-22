'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface TradingChartProps {
  symbol: string;
  timeframe?: string;
  className?: string;
  height?: number;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function SimpleTradingChart({ 
  symbol, 
  timeframe = '1d', 
  className, 
  height = 400 
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [chartData, setChartData] = useState<CandleData[]>([]);

  // Generate simple test data
  const generateTestData = (): CandleData[] => {
    const data: CandleData[] = [];
    let price = 50000;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const open = price;
      const change = (Math.random() - 0.5) * 0.04; // ±2% change
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      
      data.push({
        time: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)), 
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });
      
      price = close;
    }
    
    return data;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('🚀 Initializing Simple Trading Chart');

    // Create chart with v4 API
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        backgroundColor: 'transparent',
        textColor: '#374151',
        fontSize: 12,
      },
      grid: {
        vertLines: {
          color: '#e5e7eb',
        },
        horzLines: {
          color: '#e5e7eb',
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#9ca3af',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#9ca3af',
          width: 1,
          style: 2,
        },
      },
      priceScale: {
        borderColor: '#d1d5db',
      },
      timeScale: {
        borderColor: '#d1d5db',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Create candlestick series using correct API for v5
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',      // Green
      downColor: '#ef4444',    // Red
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    console.log('✅ Chart and candlestick series created');

    // Generate and set test data
    const testData = generateTestData();
    console.log('📊 Generated test data:', testData.length, 'candles');
    console.log('Sample data:', testData.slice(-3));
    
    setChartData(testData);

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height]);

  // Update chart when data changes
  useEffect(() => {
    if (chartData.length > 0 && candlestickSeriesRef.current) {
      console.log('📈 Setting chart data...');
      
      try {
        candlestickSeriesRef.current.setData(chartData);
        console.log('✅ Candlestick data set successfully!');
        
        // Fit content
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (error) {
        console.error('❌ Error setting data:', error);
      }
    }
  }, [chartData]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {symbol} Chart - Simple Version
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {chartData.length} candles • Working test version
        </p>
      </CardHeader>
      <CardContent>
        <div 
          ref={chartContainerRef}
          style={{ height: `${height}px` }}
          className="w-full bg-white rounded"
        />
        
        {/* Debug info */}
        <div className="mt-4 text-xs text-muted-foreground">
          Last candle: {chartData.length > 0 && (
            <>O: {chartData[chartData.length - 1]?.open} 
            C: {chartData[chartData.length - 1]?.close}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}