'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface WorkingTradingChartProps {
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
  volume: number;
}

export default function WorkingTradingChart({ 
  symbol, 
  timeframe = '1d', 
  className, 
  height = 600 
}: WorkingTradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate realistic dummy data
  const generateDummyData = (symbol: string, days: number = 60): CandleData[] => {
    const data: CandleData[] = [];
    
    // Base price depending on symbol
    let basePrice = 100;
    if (symbol.includes('BTC')) basePrice = 43500;
    else if (symbol.includes('ETH')) basePrice = 2650;
    else if (symbol.includes('SOL')) basePrice = 98;
    else if (symbol.includes('ADA')) basePrice = 0.52;
    
    let currentPrice = basePrice;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic price movement
      const volatility = 0.03; // 3% daily volatility
      const trend = (Math.random() - 0.5) * volatility;
      
      const open = currentPrice;
      const range = open * volatility * Math.random();
      const high = open + range;
      const low = open - range * Math.random();
      const close = Math.max(low, Math.min(high, open * (1 + trend)));
      
      currentPrice = close;
      
      data.push({
        time: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000),
      });
    }
    
    return data;
  };

  // Load chart data
  const loadChartData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading chart data for:', symbol);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyData = generateDummyData(symbol);
      console.log('✅ Generated', dummyData.length, 'candles');
      console.log('📊 Sample data:', dummyData.slice(-3));
      
      setChartData(dummyData);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('❌ Error loading chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.warn('⚠️ Chart container not found');
      return;
    }

    console.log('🚀 Initializing chart for:', symbol);

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Detect theme
    const isDark = document.documentElement.classList.contains('dark');
    
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        backgroundColor: 'transparent',
        textColor: isDark ? '#e5e7eb' : '#374151',
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { color: isDark ? '#374151' : '#e5e7eb' },
        horzLines: { color: isDark ? '#374151' : '#e5e7eb' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: isDark ? '#4b5563' : '#d1d5db',
      },
      timeScale: {
        borderColor: isDark ? '#4b5563' : '#d1d5db',
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
        pinch: true,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981', // green-500
      downColor: '#ef4444', // red-500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    console.log('✅ Chart initialized successfully');

    // Handle resize
    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) {
        chart.remove();
      }
    };
  }, [height, symbol]);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !chartData.length) {
      console.log('⏳ Waiting for chart or data...');
      return;
    }

    console.log('📊 Updating chart with', chartData.length, 'candles');
    console.log('📈 Data format check:', chartData[0]);

    try {
      // Set the data
      candlestickSeriesRef.current.setData(chartData);
      
      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }

      console.log('✅ Chart updated successfully');
    } catch (error) {
      console.error('❌ Error updating chart:', error);
    }
  }, [chartData]);

  // Load data on mount and symbol change
  useEffect(() => {
    loadChartData();
  }, [symbol]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing...');
      loadChartData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, symbol]);

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Loading {symbol} Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading candlestick data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5" />
            Chart Error
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="font-medium mb-2">Failed to load {symbol} chart</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadChartData} variant="default">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
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
              {symbol} Chart
              {autoRefresh && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  LIVE
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {timeframe} • {chartData.length} candles
              {lastUpdated && (
                <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-500 hover:bg-green-600 text-white" : ""}
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
              onClick={loadChartData}
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
          className="w-full bg-background rounded-lg border"
        />
        
        {/* Chart Info */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">OHLC</div>
            <div className="space-y-0.5">
              <div>O: <span className="font-mono">${chartData[chartData.length - 1]?.open?.toFixed(2) || '--'}</span></div>
              <div>H: <span className="font-mono text-green-600">${chartData[chartData.length - 1]?.high?.toFixed(2) || '--'}</span></div>
              <div>L: <span className="font-mono text-red-600">${chartData[chartData.length - 1]?.low?.toFixed(2) || '--'}</span></div>
              <div>C: <span className={cn("font-mono font-semibold", 
                chartData[chartData.length - 1] && chartData[chartData.length - 1]?.close >= chartData[chartData.length - 1]?.open 
                  ? "text-green-600" : "text-red-600"
              )}>
                ${chartData[chartData.length - 1]?.close?.toFixed(2) || '--'}
              </span></div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Volume</div>
            <div className="font-mono text-blue-600">
              {chartData[chartData.length - 1]?.volume ? 
                `${(chartData[chartData.length - 1].volume / 1000000).toFixed(1)}M` : '--'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Change</div>
            <div className="font-mono text-green-600">
              +2.34%
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Status</div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}