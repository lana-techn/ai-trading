'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { tradingApi, ChartData, CandlestickData, Quote } from '@/lib/api';
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

interface ChartState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
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
  const [state, setState] = useState<ChartState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    currentPrice: 0,
    priceChange: 0,
    priceChangePercent: 0,
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const dataStreamRef = useRef<(() => void) | null>(null);

  // Fetch real-time data from Alpha Vantage
  const fetchRealTimeData = async (refreshQuote: boolean = true) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch chart data and quote in parallel
      const [chartResponse, quoteResponse] = await Promise.all([
        tradingApi.getChartData(symbol, timeframe),
        refreshQuote ? tradingApi.getQuote(symbol) : Promise.resolve(null)
      ]);
      
      if (!chartResponse.success) {
        throw new Error(chartResponse.error || 'Failed to fetch chart data');
      }
      
      // Convert Alpha Vantage data to chart format with proper time formatting
      const chartData: CandleData[] = chartResponse.data.map((item: CandlestickData) => {
        // For daily timeframe, convert date string to proper format
        let timeValue: string;
        if (timeframe === 'daily' || timeframe === '1d') {
          // Ensure date is in YYYY-MM-DD format for daily charts
          const date = new Date(item.time);
          if (!isNaN(date.getTime())) {
            timeValue = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          } else {
            timeValue = item.time; // fallback to original
          }
        } else {
          // For intraday, keep timestamp format
          timeValue = item.time;
        }
        
        return {
          time: timeValue,
          open: parseFloat(item.open.toString()),
          high: parseFloat(item.high.toString()),
          low: parseFloat(item.low.toString()),
          close: parseFloat(item.close.toString()),
          volume: parseInt(item.volume.toString())
        };
      });
      
      // Sort data by time and remove duplicates for proper chart rendering
      chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      // Remove duplicate timestamps using Map for better performance
      const timeMap = new Map<string, CandleData>();
      chartData.forEach(item => {
        timeMap.set(item.time, item); // This will automatically overwrite duplicates
      });
      
      // Convert back to array and sort by time
      const uniqueChartData = Array.from(timeMap.values()).sort((a, b) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      
      console.log('🔄 Processed data: Original', chartData.length, 'Unique:', uniqueChartData.length);
      
      setChartData(uniqueChartData);
      
      // Update quote if fetched
      if (quoteResponse && quoteResponse.success) {
        setQuote(quoteResponse.data);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentPrice: quoteResponse.data.price,
          priceChange: quoteResponse.data.change,
          priceChangePercent: parseFloat(quoteResponse.data.change_percent),
          lastUpdated: new Date(),
        }));
      } else {
        // Update from chart meta if no quote
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentPrice: chartResponse.meta.latest_price,
          priceChange: chartResponse.meta.price_change,
          priceChangePercent: chartResponse.meta.price_change_percent,
          lastUpdated: new Date(),
        }));
      }
      
      console.log('✅ Real-time data loaded:', {
        symbol,
        timeframe,
        candlesCount: chartData.length,
        currentPrice: quoteResponse?.data?.price || chartResponse.meta.latest_price,
        firstDataPoint: chartData[0],
        lastDataPoint: chartData[chartData.length - 1]
      });
      
    } catch (error) {
      console.error('❌ Error fetching real-time data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
      
      // Fallback to demo data if API fails
      const fallbackData = generateFallbackData(symbol);
      console.log('🔄 Using fallback data:', fallbackData.length, 'candles');
      setChartData(fallbackData);
      
      // Set state from fallback data
      if (fallbackData.length > 0) {
        setState(prev => ({
          ...prev,
          currentPrice: fallbackData[fallbackData.length - 1].close,
          priceChange: fallbackData.length > 1 ? 
            fallbackData[fallbackData.length - 1].close - fallbackData[fallbackData.length - 2].close : 0,
          priceChangePercent: fallbackData.length > 1 ? 
            ((fallbackData[fallbackData.length - 1].close - fallbackData[fallbackData.length - 2].close) / fallbackData[fallbackData.length - 2].close * 100) : 0,
          lastUpdated: new Date()
        }));
      }
    }
  };
  
  // Generate fallback data for demo purposes
  const generateFallbackData = (symbol: string): CandleData[] => {
    console.log('🔄 Generating fallback data for:', symbol);
    
    const basePrices: Record<string, number> = {
      'AAPL': 150,
      'GOOGL': 140,
      'MSFT': 380,
      'TSLA': 200,
      'BTC/USD': 43500,
      'ETH/USD': 2650,
    };
    
    const basePrice = basePrices[symbol] || 100;
    const data: CandleData[] = [];
    
    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const timeStr = date.toISOString().split('T')[0];
      
      const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
      const open = basePrice * randomFactor;
      const high = open * (1 + Math.random() * 0.05); // Up to 5% higher
      const low = open * (1 - Math.random() * 0.05); // Up to 5% lower
      const close = low + Math.random() * (high - low);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({ time: timeStr, open, high, low, close, volume });
    }
    
    return data;
  };

  // Initialize data stream for real-time updates
  const startDataStream = () => {
    if (dataStreamRef.current) {
      dataStreamRef.current();
    }
    
    const cleanup = tradingApi.createDataStream(
      symbol,
      timeframe,
      30000, // 30 seconds interval
      (data: ChartData) => {
        if (data.success && data.data.length > 0) {
          const chartData: CandleData[] = data.data.map((item: CandlestickData) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
          }));
          
          setChartData(chartData);
          
          setState(prev => ({
            ...prev,
            currentPrice: data.meta.latest_price,
            priceChange: data.meta.price_change,
            priceChangePercent: data.meta.price_change_percent,
            lastUpdated: new Date(),
            error: null
          }));
          
          console.log('✅ Stream update:', {
            symbol,
            price: data.meta.latest_price,
            candlesCount: chartData.length
          });
        }
      },
      (error) => {
        console.error('❌ Stream error:', error);
        setState(prev => ({
          ...prev,
          error: 'Real-time data stream error'
        }));
      }
    );
    
    dataStreamRef.current = cleanup;
  };
  
  const stopDataStream = () => {
    if (dataStreamRef.current) {
      dataStreamRef.current();
      dataStreamRef.current = null;
    }
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.warn('⚠️ Chart container not found');
      return;
    }

    console.log('🚀 Using EXACT same config as BackupWorkingChart for:', symbol);
    
    console.log('🚀 Creating chart with container width:', chartContainerRef.current.clientWidth);
    
    // Simple, reliable chart configuration
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
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
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#cccccc',
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
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
    
    console.log('✅ Chart initialized successfully');

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) {
        const { width } = entries[0].contentRect;
        chart.applyOptions({ width: Math.max(width, 300) });
      }
    });
    
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      stopDataStream();
    };
  }, [height]);

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current || !chartData.length) {
      console.log('⏳ Waiting for series or data... Series:', !!seriesRef.current, 'Data length:', chartData.length);
      return;
    }

    console.log('📈 Updating Professional chart with', chartData.length, 'candles');
    console.log('📈 First 3 data points:', chartData.slice(0, 3));
    console.log('📈 Data format check - time type:', typeof chartData[0]?.time, 'sample:', chartData[0]?.time);
    
    try {
      // Enhanced validation for chart data
      const validData = chartData.filter((item, index) => {
        const hasValidTime = item.time && typeof item.time === 'string';
        const hasValidPrices = !isNaN(item.open) && 
                              !isNaN(item.high) && 
                              !isNaN(item.low) && 
                              !isNaN(item.close) &&
                              item.open > 0 && 
                              item.high > 0 && 
                              item.low > 0 && 
                              item.close > 0;
        const hasValidVolume = !isNaN(item.volume) && item.volume >= 0;
        
        const isValid = hasValidTime && hasValidPrices && hasValidVolume;
        
        if (!isValid) {
          console.warn('⚠️ Invalid data point at index', index, ':', item);
        }
        
        return isValid;
      });
      
      // Final sort by timestamp to ensure ascending order
      validData.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeA - timeB;
      });
      
      console.log('🔄 Final validation: Setting', validData.length, 'valid data points to chart');
      console.log('🔄 Time range:', validData[0]?.time, 'to', validData[validData.length - 1]?.time);
      
      if (validData.length > 0) {
        seriesRef.current.setData(validData);
        chartRef.current?.timeScale().fitContent();
        console.log('✅ Chart data updated successfully');
      } else {
        console.error('❌ No valid data points to display');
      }
      
    } catch (error) {
      console.error('❌ Error updating chart:', error);
      console.error('❌ Error details:', {
        chartDataLength: chartData.length,
        sampleData: chartData.slice(0, 2),
        error: error
      });
    }
  }, [chartData, showVolume]);

  // Load initial data when component mounts or symbol changes
  useEffect(() => {
    fetchRealTimeData(true);
  }, [symbol, timeframe]);

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      startDataStream();
    } else {
      stopDataStream();
    }
    
    return () => {
      stopDataStream();
    };
  }, [autoRefresh, symbol, timeframe]);

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(Math.abs(change))}`;
  };

  const changePercent = state.priceChangePercent;

  if (state.isLoading && chartData.length === 0) {
    return (
      <Card className={cn(
        'w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60', 
        className
      )}>
        <CardHeader className="pb-4 bg-gradient-to-r from-background/50 to-muted/30 rounded-t-xl border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md animate-pulse">
              <ChartBarIcon className="h-5 w-5" />
            </div>
            Loading {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto" />
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-secondary animate-spin" style={{animationDirection: 'reverse', animationDuration: '2s'}} />
            </div>
            <div className="space-y-2">
              <p className="text-foreground font-semibold">Loading market data...</p>
              <p className="text-muted-foreground text-sm">Fetching real-time {symbol} data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300', 
      className, 
      isFullscreen && 'fixed inset-4 z-50'
    )}>
      <CardHeader className="pb-4 bg-gradient-to-r from-background/50 to-muted/30 rounded-t-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md">
                    <ChartBarIcon className="h-5 w-5" />
                  </div>
                  {symbol}
                </div>
                {autoRefresh && (
                  <Badge variant="outline" className="bg-green-50/80 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5" />
                    Live
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold">
                  ${formatPrice(state.currentPrice)}
                </span>
                <span className={cn(
                  "text-sm font-medium px-2 py-1 rounded",
                  state.priceChange >= 0 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  {formatChange(state.priceChange)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              disabled={state.isLoading}
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
              onClick={() => fetchRealTimeData(true)}
              disabled={state.isLoading}
            >
              <ArrowPathIcon className={cn("h-4 w-4", state.isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {timeframe} • {chartData.length} periods
          {state.lastUpdated && (
            <span className="ml-2">• Updated {state.lastUpdated.toLocaleTimeString()}</span>
          )}
          {state.error && (
            <span className="ml-2 text-red-500">• {state.error}</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-muted/10 to-muted/20 backdrop-blur">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
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

        <div className="p-6 bg-gradient-to-b from-background/50 to-background">
          <div 
            ref={chartContainerRef}
            style={{ height: `${height}px` }}
            className="w-full rounded-lg overflow-hidden shadow-inner ring-1 ring-border/20"
          />
        </div>
      </CardContent>
    </Card>
  );
}