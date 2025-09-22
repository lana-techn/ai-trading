'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface FinalCandlestickChartProps {
  symbol: string;
  timeframe?: string;
  height?: number;
  className?: string;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function FinalCandlestickChart({
  symbol,
  timeframe = '1d',
  height = 500,
  className
}: FinalCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Generate realistic data dengan format yang benar
  const generateRealisticData = (symbol: string): CandleData[] => {
    console.log('🔄 Generating data for:', symbol);
    
    // Base price berdasarkan symbol
    const basePrices: Record<string, number> = {
      'BTC/USD': 43500,
      'ETH/USD': 2650,
      'SOL/USD': 98,
      'ADA/USD': 0.52,
      'DOT/USD': 7.8,
      'AVAX/USD': 36,
      'MATIC/USD': 0.89,
      'LINK/USD': 15.2,
      'BNB/USD': 315,
      'XRP/USD': 0.62,
      'DOGE/USD': 0.082,
      'UNI/USD': 6.8,
      'LTC/USD': 73,
      'BCH/USD': 245,
      'ATOM/USD': 10.5,
      'FTM/USD': 0.42,
    };

    const basePrice = basePrices[symbol] || 100;
    const data: CandleData[] = [];
    let currentPrice = basePrice;

    // Generate 60 hari data
    for (let i = 60; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic OHLC dengan volatility
      const volatility = 0.03; // 3% daily volatility
      const trend = (Math.random() - 0.5) * volatility;
      
      const open = currentPrice;
      const priceRange = open * volatility;
      
      // Ensure high >= max(open, close) and low <= min(open, close)
      const close = open * (1 + trend);
      const high = Math.max(open, close) + (priceRange * Math.random());
      const low = Math.min(open, close) - (priceRange * Math.random());
      
      data.push({
        time: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
        open: Number(open.toFixed(basePrice < 1 ? 6 : 2)),
        high: Number(high.toFixed(basePrice < 1 ? 6 : 2)),
        low: Number(low.toFixed(basePrice < 1 ? 6 : 2)),
        close: Number(close.toFixed(basePrice < 1 ? 6 : 2)),
      });
      
      currentPrice = close;
    }
    
    console.log('✅ Generated', data.length, 'candles');
    console.log('📊 Sample data:', {
      first: data[0],
      last: data[data.length - 1]
    });
    
    return data;
  };

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    console.log('📈 Loading data for:', symbol);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newData = generateRealisticData(symbol);
      setChartData(newData);
      setLastUpdated(new Date());
      
      console.log('✅ Data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.warn('⚠️ Chart container not ready');
      return;
    }

    console.log('🚀 Initializing chart for', symbol);

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    try {
      // Get container dimensions
      const container = chartContainerRef.current;
      const containerWidth = container.clientWidth || 800;
      
      // Create chart with proper configuration
      const chart = createChart(container, {
        width: containerWidth,
        height: height,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 12,
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        crosshair: {
          mode: 1, // Normal mode
        },
        rightPriceScale: {
          borderColor: '#cccccc',
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
        },
      });

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#4ade80',      // green-400
        downColor: '#f87171',    // red-400
        borderVisible: false,
        wickUpColor: '#4ade80',
        wickDownColor: '#f87171',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      // Handle resize
      const resizeObserver = new ResizeObserver(entries => {
        if (chart && entries.length > 0) {
          const { width } = entries[0].contentRect;
          chart.applyOptions({ width });
        }
      });
      
      resizeObserver.observe(container);

      console.log('✅ Chart initialized');
      setIsVisible(true);

      return () => {
        resizeObserver.disconnect();
        if (chart) {
          chart.remove();
        }
      };

    } catch (error) {
      console.error('❌ Error initializing chart:', error);
    }
  }, [symbol, height]);

  // Update chart with data
  useEffect(() => {
    if (!seriesRef.current || !chartData.length) {
      console.log('⏳ Waiting for series or data...');
      return;
    }

    console.log('📊 Updating chart with', chartData.length, 'candles');

    try {
      seriesRef.current.setData(chartData);
      
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
      
      console.log('✅ Chart updated successfully');
    } catch (error) {
      console.error('❌ Error updating chart:', error);
    }
  }, [chartData]);

  // Load data when symbol changes
  useEffect(() => {
    loadData();
  }, [symbol]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto refresh...');
      loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, symbol]);

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Loading {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ minHeight: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Loading candlestick data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              {symbol} - Final Chart
              {isVisible && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
              {autoRefresh && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
                  Live
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {timeframe} • {chartData.length} candles
              {lastUpdated && (
                <span className="ml-2">
                  • Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? (
                <><PlayIcon className="h-4 w-4 mr-1" /> Live</>
              ) : (
                <><PauseIcon className="h-4 w-4 mr-1" /> Paused</>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div 
          ref={chartContainerRef}
          style={{ height: `${height}px` }}
          className="w-full bg-white border rounded-lg"
        />
        
        {/* Chart Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Open</div>
            <div className="font-mono font-semibold">
              ${chartData[chartData.length - 1]?.open?.toLocaleString() || '--'}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground mb-1">High</div>
            <div className="font-mono font-semibold text-green-600">
              ${chartData[chartData.length - 1]?.high?.toLocaleString() || '--'}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground mb-1">Low</div>
            <div className="font-mono font-semibold text-red-600">
              ${chartData[chartData.length - 1]?.low?.toLocaleString() || '--'}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground mb-1">Close</div>
            <div className={cn("font-mono font-semibold", 
              chartData[chartData.length - 1] && 
              chartData[chartData.length - 1]?.close >= chartData[chartData.length - 1]?.open
                ? "text-green-600" : "text-red-600"
            )}>
              ${chartData[chartData.length - 1]?.close?.toLocaleString() || '--'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}