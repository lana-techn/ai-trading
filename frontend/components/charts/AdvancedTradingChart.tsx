'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CrosshairMode, LineStyle } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { mockMarketDataService, type MockCandleData } from '@/lib/mockMarketData';
import {
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  InformationCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface AdvancedTradingChartProps {
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

interface IndicatorData {
  time: string;
  value: number;
}

interface TechnicalIndicators {
  rsi: IndicatorData[];
  sma20: IndicatorData[];
  sma50: IndicatorData[];
  ema12: IndicatorData[];
  ema26: IndicatorData[];
  macd: IndicatorData[];
  macdSignal: IndicatorData[];
  macdHistogram: IndicatorData[];
  bollingerUpper: IndicatorData[];
  bollingerLower: IndicatorData[];
}

// Supported trading symbols
const SUPPORTED_SYMBOLS = [
  'BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD',
  'DOT/USD', 'AVAX/USD', 'MATIC/USD', 'LINK/USD',
  'BNB/USD', 'XRP/USD', 'DOGE/USD', 'UNI/USD',
  'LTC/USD', 'BCH/USD', 'ATOM/USD', 'FTM/USD'
];

export default function AdvancedTradingChart({ 
  symbol, 
  timeframe = '1d', 
  className, 
  height = 600 
}: AdvancedTradingChartProps) {
  // Refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // State
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Controls
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);
  const [selectedIndicators, setSelectedIndicators] = useState({
    rsi: true,
    sma20: true,
    sma50: false,
    ema12: false,
    ema26: false,
    macd: false,
    bollinger: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Technical Indicators Calculations
  const calculateSMA = (data: number[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateEMA = (data: number[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    ema[0] = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema[i] = (data[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    return ema;
  };

  const calculateRSI = (data: number[], period: number = 14): number[] => {
    const rsi: number[] = [];
    const changes: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    for (let i = period - 1; i < changes.length; i++) {
      const gains = changes.slice(i - period + 1, i + 1).filter(x => x > 0);
      const losses = changes.slice(i - period + 1, i + 1).filter(x => x < 0).map(x => Math.abs(x));
      
      const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / period : 0;
      const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / period : 0;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }
    
    return rsi;
  };

  const calculateBollingerBands = (data: number[], period: number = 20, stdDev: number = 2) => {
    const sma = calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }
    
    return { upper, lower };
  };

  const calculateIndicators = (data: CandleData[]): TechnicalIndicators => {
    const closes = data.map(d => d.close);
    const times = data.map(d => d.time);
    
    // Calculate all indicators
    const sma20Values = calculateSMA(closes, 20);
    const sma50Values = calculateSMA(closes, 50);
    const ema12Values = calculateEMA(closes, 12);
    const ema26Values = calculateEMA(closes, 26);
    const rsiValues = calculateRSI(closes);
    const bollinger = calculateBollingerBands(closes);
    
    // MACD calculation
    const macdLine: number[] = [];
    for (let i = 0; i < Math.min(ema12Values.length, ema26Values.length); i++) {
      macdLine.push(ema12Values[i] - ema26Values[i]);
    }
    const macdSignal = calculateEMA(macdLine, 9);
    const macdHistogram = macdLine.map((val, i) => val - (macdSignal[i] || 0));
    
    return {
      rsi: rsiValues.map((value, i) => ({
        time: times[i + 14], // RSI starts after period
        value
      })),
      sma20: sma20Values.map((value, i) => ({
        time: times[i + 19], // SMA20 starts after period
        value
      })),
      sma50: sma50Values.map((value, i) => ({
        time: times[i + 49], // SMA50 starts after period
        value
      })),
      ema12: ema12Values.map((value, i) => ({
        time: times[i],
        value
      })),
      ema26: ema26Values.map((value, i) => ({
        time: times[i],
        value
      })),
      macd: macdLine.map((value, i) => ({
        time: times[i + 26], // MACD starts after EMA26 period
        value
      })),
      macdSignal: macdSignal.map((value, i) => ({
        time: times[i + 35], // Signal line starts later
        value
      })),
      macdHistogram: macdHistogram.map((value, i) => ({
        time: times[i + 26],
        value
      })),
      bollingerUpper: bollinger.upper.map((value, i) => ({
        time: times[i + 19],
        value
      })),
      bollingerLower: bollinger.lower.map((value, i) => ({
        time: times[i + 19],
        value
      })),
    };
  };

  // Fetch mock data (simulates real API)
  const fetchMockData = async (symbol: string): Promise<CandleData[]> => {
    try {
      console.log('🔄 Fetching mock data for:', symbol);
      
      const mockData = await mockMarketDataService.fetchOHLCData(symbol, 90);
      
      // Convert mock data to chart format
      const chartData: CandleData[] = mockData.map((candle: MockCandleData) => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      }));
      
      console.log('✅ Mock data fetched successfully:', chartData.length, 'candles');
      return chartData;
      
    } catch (error) {
      console.error('❌ Error fetching mock data:', error);
      throw error;
    }
  };

  // Load chart data
  const loadChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (SUPPORTED_SYMBOLS.includes(symbol)) {
        console.log('📈 Loading mock data for:', symbol);
        const mockData = await fetchMockData(symbol);
        console.log('✅ Fetched', mockData.length, 'candles');
        
        setChartData(mockData);
        
        // Calculate technical indicators
        const calculatedIndicators = calculateIndicators(mockData);
        setIndicators(calculatedIndicators);
        
        setLastUpdated(new Date());
        console.log('✅ Chart data and indicators updated');
        
      } else {
        throw new Error(`Unsupported symbol: ${symbol}`);
      }

    } catch (err) {
      console.error('❌ Error loading chart data:', err);
      setError('Failed to load market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('🚀 Initializing Advanced Trading Chart for:', symbol);

    // Detect theme
    const isDark = document.documentElement.classList.contains('dark');
    const isTerminal = document.documentElement.classList.contains('terminal');
    
    const themeColors = {
      background: 'transparent',
      textColor: isDark || isTerminal ? '#e5e7eb' : '#374151',
      gridColor: isDark || isTerminal ? '#374151' : '#e5e7eb',
      crosshairColor: isDark || isTerminal ? '#6b7280' : '#9ca3af',
      borderColor: isDark || isTerminal ? '#4b5563' : '#d1d5db',
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        backgroundColor: themeColors.background,
        textColor: themeColors.textColor,
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      grid: {
        vertLines: { color: themeColors.gridColor },
        horzLines: { color: themeColors.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: themeColors.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: themeColors.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: themeColors.borderColor,
      },
      timeScale: {
        borderColor: themeColors.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f660',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Create indicator series
    const rsiSeries = chart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 2,
      priceScaleId: 'rsi',
    });
    rsiSeriesRef.current = rsiSeries;

    const smaSeries = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
    });
    smaSeriesRef.current = smaSeries;

    const emaSeries = chart.addLineSeries({
      color: '#06b6d4',
      lineWidth: 2,
    });
    emaSeriesRef.current = emaSeries;

    // Configure RSI price scale
    chart.priceScale('rsi').applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.1 },
    });

    console.log('✅ Advanced chart initialized with indicators');

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height, symbol]);

  // Load data on mount and symbol change
  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing chart data...');
      loadChartData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoRefresh, loadChartData]);

  // Update chart data
  useEffect(() => {
    if (chartData.length === 0 || !candlestickSeriesRef.current) return;

    console.log('📊 Updating chart with', chartData.length, 'candles');

    try {
      // Set candlestick data
      candlestickSeriesRef.current.setData(chartData);

      // Set volume data
      if (showVolume && volumeSeriesRef.current) {
        const volumeData = chartData.map(d => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? '#22c55e40' : '#ef444440',
        }));
        volumeSeriesRef.current.setData(volumeData);
      }

      // Set indicator data
      if (indicators && showIndicators) {
        if (selectedIndicators.rsi && rsiSeriesRef.current) {
          rsiSeriesRef.current.setData(indicators.rsi);
        }
        
        if (selectedIndicators.sma20 && smaSeriesRef.current) {
          smaSeriesRef.current.setData(indicators.sma20);
        }
        
        if (selectedIndicators.ema12 && emaSeriesRef.current) {
          emaSeriesRef.current.setData(indicators.ema12);
        }
      }

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }

      console.log('✅ Chart updated successfully');

    } catch (error) {
      console.error('❌ Error updating chart:', error);
    }
  }, [chartData, indicators, showVolume, showIndicators, selectedIndicators]);

  // Toggle indicator visibility
  const toggleIndicator = (indicator: keyof typeof selectedIndicators) => {
    setSelectedIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Loading {symbol} Advanced Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Fetching real-time data & calculating indicators...</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
            </div>
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
            <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-destructive opacity-50" />
            <p className="font-medium text-foreground mb-2">Failed to load {symbol} chart</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadChartData} variant="default">
              <BoltIcon className="h-4 w-4 mr-2" />
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
              {symbol} Advanced Chart
              {autoRefresh && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  LIVE
                </Badge>
              )}
              <Badge variant="secondary">
                <BoltIcon className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {timeframe} • {chartData.length} candles • {indicators ? 'Indicators: ON' : 'Indicators: OFF'}
              {lastUpdated && (
                <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Auto-refresh toggle */}
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
            
            {/* Volume toggle */}
            <Button
              variant={showVolume ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
            >
              Volume
            </Button>
            
            {/* Indicators toggle */}
            <Button
              variant={showIndicators ? "default" : "outline"}
              size="sm"
              onClick={() => setShowIndicators(!showIndicators)}
            >
              Indicators
            </Button>
            
            {/* Fullscreen */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </Button>
            
            {/* Manual refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={loadChartData}
              disabled={isLoading}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Indicator Controls */}
        {showIndicators && (
          <div className="px-6 py-3 border-b bg-muted/20">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedIndicators.rsi ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('rsi')}
              >
                RSI
              </Button>
              <Button
                variant={selectedIndicators.sma20 ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('sma20')}
              >
                SMA20
              </Button>
              <Button
                variant={selectedIndicators.sma50 ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('sma50')}
              >
                SMA50
              </Button>
              <Button
                variant={selectedIndicators.ema12 ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('ema12')}
              >
                EMA12
              </Button>
              <Button
                variant={selectedIndicators.macd ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('macd')}
              >
                MACD
              </Button>
              <Button
                variant={selectedIndicators.bollinger ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('bollinger')}
              >
                Bollinger
              </Button>
            </div>
          </div>
        )}
        
        {/* Chart Container */}
        <div className="p-6 border-b">
          <div 
            ref={chartContainerRef}
            style={{ height: `${height}px` }}
            className="w-full bg-background rounded-lg"
          />
        </div>

        {/* Chart Info & Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {/* OHLC */}
            <div className="space-y-1">
              <div className="text-muted-foreground">OHLC</div>
              <div className="space-y-0.5">
                <div>O: <span className="font-mono text-foreground">{chartData[chartData.length - 1]?.open?.toFixed(2) || '--'}</span></div>
                <div>H: <span className="font-mono text-green-600">{chartData[chartData.length - 1]?.high?.toFixed(2) || '--'}</span></div>
                <div>L: <span className="font-mono text-red-600">{chartData[chartData.length - 1]?.low?.toFixed(2) || '--'}</span></div>
                <div>C: <span className={cn("font-mono font-semibold", 
                  chartData[chartData.length - 1] && chartData[chartData.length - 1]?.close >= chartData[chartData.length - 1]?.open 
                    ? "text-green-600" : "text-red-600"
                )}>
                  {chartData[chartData.length - 1]?.close?.toFixed(2) || '--'}
                </span></div>
              </div>
            </div>
            
            {/* Volume & Change */}
            <div className="space-y-1">
              <div className="text-muted-foreground">Volume & Change</div>
              <div className="space-y-0.5">
                <div>Vol: <span className="font-mono text-blue-600">{chartData[chartData.length - 1]?.volume ? `${(chartData[chartData.length - 1].volume / 1000000).toFixed(1)}M` : '--'}</span></div>
                <div>24h: <span className="font-mono text-green-600">+2.34%</span></div>
                <div>7d: <span className="font-mono text-red-600">-1.23%</span></div>
              </div>
            </div>
            
            {/* Technical Levels */}
            <div className="space-y-1">
              <div className="text-muted-foreground">Technical</div>
              <div className="space-y-0.5">
                <div>RSI: <span className="font-mono text-purple-600">{indicators?.rsi[indicators.rsi.length - 1]?.value?.toFixed(1) || '--'}</span></div>
                <div>SMA20: <span className="font-mono text-orange-600">{indicators?.sma20[indicators.sma20.length - 1]?.value?.toFixed(2) || '--'}</span></div>
                <div>EMA12: <span className="font-mono text-cyan-600">{indicators?.ema12[indicators.ema12.length - 1]?.value?.toFixed(2) || '--'}</span></div>
              </div>
            </div>
            
            {/* Market Status */}
            <div className="space-y-1">
              <div className="text-muted-foreground">Status</div>
              <div className="space-y-0.5">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Market Open
                </Badge>
                <div className="text-xs">
                  Next: {new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}