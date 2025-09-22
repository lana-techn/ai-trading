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
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

interface ProfessionalTradingChartProps {
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
  volume: number;
}

export default function ProfessionalTradingChart({
  symbol,
  timeframe = '1d',
  height = 500,
  className
}: ProfessionalTradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate data using EXACT same format as BackupWorkingChart
  const generateCryptoData = (symbol: string): CandleData[] => {
    console.log('🔄 Generating data EXACTLY like BackupWorkingChart for:', symbol);
    
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
    };

    const basePrice = basePrices[symbol] || 100;
    const data: CandleData[] = [];
    let price = basePrice;

    // Use IDENTICAL data as BackupWorkingChart (that works!)
    const identicalData = [
      { time: '2024-01-01', open: 43500, high: 44200, low: 43200, close: 43800, volume: 500000 },
      { time: '2024-01-02', open: 43800, high: 44500, low: 43600, close: 44100, volume: 600000 },
      { time: '2024-01-03', open: 44100, high: 44800, low: 43900, close: 44400, volume: 700000 },
      { time: '2024-01-04', open: 44400, high: 45100, low: 44200, close: 44700, volume: 800000 },
      { time: '2024-01-05', open: 44700, high: 45400, low: 44500, close: 45000, volume: 900000 },
      { time: '2024-01-06', open: 45000, high: 45700, low: 44800, close: 45300, volume: 600000 },
      { time: '2024-01-07', open: 45300, high: 46000, low: 45100, close: 45600, volume: 700000 },
      { time: '2024-01-08', open: 45600, high: 46300, low: 45400, close: 45900, volume: 800000 },
      { time: '2024-01-09', open: 45900, high: 46600, low: 45700, close: 46200, volume: 900000 },
      { time: '2024-01-10', open: 46200, high: 46900, low: 46000, close: 46500, volume: 1000000 },
    ];
    
    // Return IDENTICAL data
    return identicalData;
    
    console.log('✅ Generated IDENTICAL data as BackupWorkingChart:', identicalData.length, 'candles');
    console.log('📊 First candle:', identicalData[0]);
    
    return identicalData;
  };

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    console.log('📈 Loading data for:', symbol);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const newData = generateCryptoData(symbol);
      console.log('📈 Generated data length:', newData.length);
      console.log('📈 First 3 candles:', newData.slice(0, 3));
      
      setChartData(newData);
      
      if (newData.length > 0) {
        const latest = newData[newData.length - 1];
        const previous = newData[newData.length - 2];
        
        setCurrentPrice(latest.close);
        console.log('📈 Current price set to:', latest.close);
        
        if (previous) {
          const change = latest.close - previous.close;
          setPriceChange(change);
          console.log('📈 Price change:', change);
        }
      }
      
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
      console.warn('⚠️ Chart container not found');
      return;
    }

    console.log('🚀 Using EXACT same config as BackupWorkingChart for:', symbol);
    
    // Professional trading chart configuration
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: height,
      layout: {
        backgroundColor: '#FAFAFA',    // Slightly off-white background
        textColor: '#2E2E2E',         // Dark gray text
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { 
          color: '#E8E8E8',           // Light grid lines
          style: 0,                   // Solid lines
        },
        horzLines: { 
          color: '#E8E8E8',           // Light grid lines
          style: 0,                   // Solid lines
        },
      },
      crosshair: {
        mode: 1,                      // Normal crosshair
        vertLine: {
          color: '#4A90E2',           // Blue crosshair
          width: 1,
          style: 2,                   // Dashed line
        },
        horzLine: {
          color: '#4A90E2',           // Blue crosshair
          width: 1,
          style: 2,                   // Dashed line
        },
      },
      rightPriceScale: {
        borderColor: '#D0D0D0',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#D0D0D0',
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

    // Professional candlestick series with standard trading colors
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00C851',        // Standard green for bullish candles
      downColor: '#FF4444',      // Standard red for bearish candles  
      borderVisible: true,       // Show borders for better definition
      wickUpColor: '#00C851',    // Green wicks for bullish
      wickDownColor: '#FF4444',  // Red wicks for bearish
      borderUpColor: '#00A142',  // Darker green borders
      borderDownColor: '#CC0000',// Darker red borders
    });

    // Skip volume series for now - just like BackupWorkingChart
    // const volumeSeries = chart.addHistogramSeries({...});

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    // volumeSeriesRef.current = volumeSeries;
    
    console.log('✅ Professional Trading Chart initialized for', symbol);
    
    // Load realistic BTC candlestick data
    const immediateData = [
      { time: '2024-01-01', open: 43500, high: 44200, low: 43200, close: 43800 }, // Green (up)
      { time: '2024-01-02', open: 43800, high: 44100, low: 43200, close: 43400 }, // Red (down)
      { time: '2024-01-03', open: 43400, high: 44800, low: 43100, close: 44600 }, // Green (up)
      { time: '2024-01-04', open: 44600, high: 45100, low: 44200, close: 44300 }, // Red (down)
      { time: '2024-01-05', open: 44300, high: 45400, low: 44100, close: 45200 }, // Green (up)
      { time: '2024-01-06', open: 45200, high: 45300, low: 44600, close: 44800 }, // Red (down)
      { time: '2024-01-07', open: 44800, high: 46000, low: 44600, close: 45900 }, // Green (up)
      { time: '2024-01-08', open: 45900, high: 46300, low: 45200, close: 45400 }, // Red (down)
      { time: '2024-01-09', open: 45400, high: 46600, low: 45200, close: 46400 }, // Green (up)
      { time: '2024-01-10', open: 46400, high: 46900, low: 45800, close: 45900 }, // Red (down)
      { time: '2024-01-11', open: 45900, high: 47200, low: 45700, close: 47000 }, // Green (up)
      { time: '2024-01-12', open: 47000, high: 47500, low: 46200, close: 46500 }, // Red (down)
      { time: '2024-01-13', open: 46500, high: 47800, low: 46300, close: 47600 }, // Green (up)
      { time: '2024-01-14', open: 47600, high: 47900, low: 46800, close: 47100 }, // Red (down)
      { time: '2024-01-15', open: 47100, high: 48200, low: 46900, close: 48000 }, // Green (up)
    ];
    
    // Set candlestick data and fit to viewport
    candlestickSeries.setData(immediateData);
    chart.timeScale().fitContent();
    
    // Update state immediately with latest candle data
    const latestCandle = immediateData[immediateData.length - 1];
    const previousCandle = immediateData[immediateData.length - 2];
    
    setChartData(immediateData);
    setCurrentPrice(latestCandle.close);
    setPriceChange(latestCandle.close - previousCandle.close);
    setLastUpdated(new Date());
    
    console.log('✅ Chart loaded successfully with', immediateData.length, 'candles');

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) {
        const { width } = entries[0].contentRect;
        chart.applyOptions({ width: Math.max(width, 300) });
      }
    });
    
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [height]);

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current || !chartData.length) {
      console.log('⏳ Waiting for series or data... Series:', !!seriesRef.current, 'Data length:', chartData.length);
      return;
    }

    console.log('📈 Updating Professional chart with', chartData.length, 'candles');
    console.log('📈 Sample data being set:', chartData.slice(0, 2));
    
    try {
      // EXACT same approach as BackupWorkingChart
      console.log('🔄 Setting data EXACTLY like BackupWorkingChart:', chartData.slice(0, 2));
      
      seriesRef.current.setData(chartData);
      chartRef.current.timeScale().fitContent();
      
      console.log('✅ Data set and fitContent called - EXACTLY like BackupWorkingChart');
      
    } catch (error) {
      console.error('❌ Error updating chart:', error);
    }
  }, [chartData, showVolume]);

  // DISABLE async loading - using immediate data instead
  // useEffect(() => {
  //   loadData();
  // }, [symbol]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, symbol]);

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(Math.abs(change))}`;
  };

  const changePercent = currentPrice > 0 && priceChange !== 0 
    ? ((priceChange / (currentPrice - priceChange)) * 100)
    : 0;

  if (isLoading && chartData.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Loading {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full transition-all duration-300', className, isFullscreen && 'fixed inset-4 z-50')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                {symbol}
                {autoRefresh && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                    Live
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold">
                  ${formatPrice(currentPrice)}
                </span>
                <span className={cn(
                  "text-sm font-medium px-2 py-1 rounded",
                  priceChange >= 0 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  {formatChange(priceChange)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              disabled={isLoading}
            >
              {autoRefresh ? (
                <><PauseIcon className="h-4 w-4 mr-1" /> Pause</>
              ) : (
                <><PlayIcon className="h-4 w-4 mr-1" /> Live</>
              )}
            </Button>
            
            <Button
              variant={showVolume ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
            >
              {showVolume ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
              Volume
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
            >
              <ArrowPathIcon className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {timeframe} • {chartData.length} periods
          {lastUpdated && (
            <span className="ml-2">• Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="px-6 py-3 border-b bg-muted/20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">24h High</div>
              <div className="font-semibold text-green-600">
                ${chartData.length ? formatPrice(Math.max(...chartData.slice(-24).map(d => d.high))) : '--'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">24h Low</div>
              <div className="font-semibold text-red-600">
                ${chartData.length ? formatPrice(Math.min(...chartData.slice(-24).map(d => d.low))) : '--'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">24h Volume</div>
              <div className="font-semibold text-blue-600">
                {chartData.length ? (chartData.slice(-24).reduce((sum, d) => sum + d.volume, 0) / 1e6).toFixed(1) + 'M' : '--'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Market Status</div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Open
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div 
            ref={chartContainerRef}
            style={{ height: `${height}px` }}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}