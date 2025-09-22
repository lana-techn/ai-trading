'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType } from 'lightweight-charts';
import { 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon,
  ArrowsPointingOutIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

interface TradingChartProps {
  symbol: string;
  timeframe?: string;
  className?: string;
  height?: number;
}

interface CandlestickData {
  time: string; // Will be cast to Time type for lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export default function TradingChart({ 
  symbol, 
  timeframe = '1d', 
  className, 
  height = 400 
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('Initializing TradingChart for symbol:', symbol);

    // Detect theme
    const isDark = document.documentElement.classList.contains('dark');
    const isTerminal = document.documentElement.classList.contains('terminal');
    
    console.log('Theme detected:', { isDark, isTerminal });
    
    // Define theme colors
    const themeColors = {
      background: isDark || isTerminal ? 'transparent' : 'transparent',
      textColor: isDark || isTerminal ? '#e5e7eb' : '#374151',
      gridColor: isDark || isTerminal ? '#374151' : '#e5e7eb',
      crosshairColor: isDark || isTerminal ? '#6b7280' : '#9ca3af',
      borderColor: isDark || isTerminal ? '#4b5563' : '#d1d5db',
    };

    // Create chart with proper theme integration
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: themeColors.background },
        textColor: themeColors.textColor,
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      grid: {
        vertLines: {
          color: themeColors.gridColor,
          style: 0, // Solid line
        },
        horzLines: {
          color: themeColors.gridColor,
          style: 0, // Solid line
        },
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: {
          color: themeColors.crosshairColor,
          width: 1,
          style: 2, // Dashed
          labelBackgroundColor: themeColors.borderColor,
        },
        horzLine: {
          color: themeColors.crosshairColor,
          width: 1,
          style: 2, // Dashed
          labelBackgroundColor: themeColors.borderColor,
        },
      },
      rightPriceScale: {
        borderColor: themeColors.borderColor,
        textColor: themeColors.textColor,
        entireTextOnly: true,
      },
      timeScale: {
        borderColor: themeColors.borderColor,
        textColor: themeColors.textColor,
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
    
    console.log('Chart created successfully with theme:', themeColors);

    chartRef.current = chart;

    // Create candlestick series with professional colors
    const bullishColor = '#22c55e'; // Professional green
    const bearishColor = '#ef4444'; // Professional red
    
    const candlestickSeries = chart.addSeries('Candlestick', {
      upColor: bullishColor,
      downColor: bearishColor,
      borderVisible: false,
      wickUpColor: bullishColor,
      wickDownColor: bearishColor,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    
    console.log('Candlestick series created with colors:', { bullishColor, bearishColor });

    candlestickSeriesRef.current = candlestickSeries;

    // Create volume series with professional styling
    const volumeSeries = chart.addSeries('Histogram', {
      color: '#3b82f680', // Semi-transparent blue
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set to empty string for right scale
      scaleMargins: {
        top: 0.8, // Volume takes bottom 20% of chart
        bottom: 0,
      },
    });
    
    console.log('Volume series created');

    volumeSeriesRef.current = volumeSeries;

    // Set price scale for volume (right side)
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.7, // Leave 70% for price chart
        bottom: 0,
      },
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height]);

  // Load chart data when symbol or timeframe changes
  useEffect(() => {
    loadChartData();
  }, [symbol, timeframe]);

  // Auto-refresh real-time data every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing chart data...');
      loadChartData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoRefresh, symbol, timeframe]);

  // Update chart data when data changes
  useEffect(() => {
    console.log('Chart data update effect:', {
      dataLength: chartData.length,
      hasCandlestickSeries: !!candlestickSeriesRef.current,
      hasVolumeSeries: !!volumeSeriesRef.current
    });
    
    if (chartData.length > 0 && candlestickSeriesRef.current) {
      console.log('Setting candlestick data...');
      // Set candlestick data
      try {
        const candleData = chartData.map(d => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));
        
        console.log('Candle data sample:', candleData.slice(-3));
        candlestickSeriesRef.current.setData(candleData);
        console.log('✅ Candlestick data set successfully');
        
        // Fit content to show all data
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (error) {
        console.error('❌ Error setting candlestick data:', error);
      }

      // Set volume data if available and volume series exists
      if (showVolume && volumeSeriesRef.current && chartData[0]?.volume) {
        try {
          const volumeData = chartData.map(d => ({
            time: d.time,
            value: d.volume || 0,
            color: d.close >= d.open ? '#16a34a60' : '#dc262660',
          }));
          
          console.log('Setting volume data:', volumeData.slice(-3));
          volumeSeriesRef.current.setData(volumeData);
          console.log('✅ Volume data set successfully');
        } catch (error) {
          console.error('❌ Error setting volume data:', error);
        }
      }
    }
  }, [chartData, showVolume]);

  // Toggle volume visibility
  useEffect(() => {
    if (volumeSeriesRef.current && chartRef.current) {
      volumeSeriesRef.current.applyOptions({
        visible: showVolume,
      });
    }
  }, [showVolume]);

  const loadChartData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading chart data for symbol:', symbol);
      
      // Generate working dummy data for now
      const dummyData = generateWorkingDummyData(symbol);
      console.log('Generated dummy data:', dummyData.length, 'candles');
      console.log('Sample data:', dummyData.slice(-3));
      
      setChartData(dummyData);
      setLastUpdated(new Date());
      console.log('Chart data set successfully');

    } catch (err) {
      console.error('Error loading chart data:', err);
      setError('Failed to load chart data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate simple working dummy data for testing
  const generateWorkingDummyData = (symbol: string): CandlestickData[] => {
    const data: CandlestickData[] = [];
    const basePrice = 50000; // Base price for BTC
    let currentPrice = basePrice;
    
    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random price movement
      const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
      const open = currentPrice;
      const close = open * (1 + change);
      
      // Calculate high and low
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      data.push({
        time: date.toISOString().split('T')[0], // YYYY-MM-DD format
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000 + 500000)
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  // Convert symbol format for API calls (disabled for now)
  const convertSymbolForAPI = (symbol: string): string | null => {
    const symbolMap: {[key: string]: string} = {
      'BTC/USD': 'bitcoin',
      'ETH/USD': 'ethereum',
      'SOL/USD': 'solana',
      'ADA/USD': 'cardano',
      'DOT/USD': 'polkadot',
      'AVAX/USD': 'avalanche-2',
      'MATIC/USD': 'matic-network',
      'LINK/USD': 'chainlink',
      'BNB/USD': 'binancecoin',
      'XRP/USD': 'ripple',
      'DOGE/USD': 'dogecoin',
      'UNI/USD': 'uniswap',
      'LTC/USD': 'litecoin',
      'BCH/USD': 'bitcoin-cash',
      'ATOM/USD': 'cosmos',
      'FTM/USD': 'fantom',
      'ALGO/USD': 'algorand',
      'VET/USD': 'vechain',
      'ICP/USD': 'internet-computer',
      'THETA/USD': 'theta-token'
    };
    
    return symbolMap[symbol] || null;
  };

  // Fetch real-time OHLC data from CoinGecko API
  const fetchRealTimeOHLCData = async (coinId: string): Promise<CandlestickData[]> => {
    try {
      console.log('Fetching data for coin:', coinId);
      
      // Fetch OHLC data from CoinGecko (free tier - 30 days of daily data)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=30`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const ohlcData = await response.json();
      console.log('Raw CoinGecko data:', ohlcData.slice(0, 3));
      
      // Convert CoinGecko format [timestamp, open, high, low, close] to our format
      const chartData: CandlestickData[] = ohlcData.map((candle: number[]) => {
        const [timestamp, open, high, low, close] = candle;
        const date = new Date(timestamp);
        
        return {
          time: date.toISOString().split('T')[0] as any,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000000), // CoinGecko free doesn't include volume in OHLC, so we estimate
        };
      });
      
      // Sort by date to ensure proper order
      chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      console.log('Converted chart data:', chartData.slice(0, 3));
      return chartData;
      
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  };

  // Generate realistic mock OHLCV data with trends and patterns (fallback)
  const generateMockOHLCVData = (symbol: string, count: number): CandlestickData[] => {
    const data: CandlestickData[] = [];
    
    // Different base prices for different symbols
    const basePrices: {[key: string]: number} = {
      'BTC/USD': 45000,
      'ETH/USD': 2500,
      'SOL/USD': 95,
      'ADA/USD': 0.45,
      'DOT/USD': 6.5,
      'AVAX/USD': 28,
      'MATIC/USD': 0.8,
      'LINK/USD': 14
    };
    
    let price = basePrices[symbol] || 50000;
    const now = new Date();
    
    // Add trend and market regime
    const trendStrength = (Math.random() - 0.5) * 0.001; // -0.05% to +0.05% daily trend
    
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Generate realistic OHLCV with trend and volatility clustering
      const baseVolatility = 0.015; // 1.5% base daily volatility
      const volatilityMultiplier = 1 + Math.sin(i * 0.1) * 0.5; // Volatility clustering
      const volatility = baseVolatility * volatilityMultiplier;
      
      // Apply trend and random walk
      const randomWalk = (Math.random() - 0.5) * 2 * volatility;
      const change = trendStrength + randomWalk;
      
      const open = price;
      const close = price * (1 + change);
      
      // More realistic high/low based on intraday volatility
      const intradayVolatility = volatility * 0.3;
      const highMultiplier = 1 + Math.random() * intradayVolatility;
      const lowMultiplier = 1 - Math.random() * intradayVolatility;
      
      const high = Math.max(open, close) * highMultiplier;
      const low = Math.min(open, close) * lowMultiplier;
      
      // Volume correlates with price movement and volatility
      const priceChangeAbs = Math.abs(change);
      const baseVolume = 500000;
      const volumeMultiplier = 1 + priceChangeAbs * 10 + Math.random() * 2;
      const volume = Math.floor(baseVolume * volumeMultiplier);

      data.push({
        time: time.toISOString().split('T')[0] as any, // YYYY-MM-DD format required by lightweight-charts
        open: parseFloat(open.toFixed(symbol.includes('/USD') ? 2 : 4)),
        high: parseFloat(high.toFixed(symbol.includes('/USD') ? 2 : 4)),
        low: parseFloat(low.toFixed(symbol.includes('/USD') ? 2 : 4)),
        close: parseFloat(close.toFixed(symbol.includes('/USD') ? 2 : 4)),
        volume,
      });

      price = close;
    }

    return data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // In a real app, you'd implement proper fullscreen modal
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Loading {symbol} Chart</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Fetching real-time data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-destructive">Chart Error</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="font-medium text-foreground mb-2">Failed to load {symbol} chart</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadChartData} variant="default">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              {symbol} Chart
              {autoRefresh && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-500/10 text-green-600 border border-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  LIVE
                </span>
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
              className={autoRefresh ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {autoRefresh ? (
                <><PlayIcon className="h-4 w-4 mr-1" /> Live</>
              ) : (
                <><PauseIcon className="h-4 w-4 mr-1" /> Paused</>
              )}
            </Button>
            
            <Button
              variant={showVolume ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
            >
              Volume
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadChartData}
              title="Refresh Data"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      
      <CardContent className="p-0">
        {/* Chart Container */}
        <div className="p-6 border-b">
          <div 
            ref={chartContainerRef}
            style={{ height: `${height}px` }}
            className="w-full bg-background rounded-lg"
          />
        </div>

        {/* Chart Info */}
        <div className="p-4">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
            <div className="flex flex-wrap gap-4">
              <span className="font-mono text-muted-foreground">
                O: <span className="text-foreground font-medium">{chartData[chartData.length - 1]?.open?.toFixed(2) || '--'}</span>
              </span>
              <span className="font-mono text-muted-foreground">
                H: <span className="text-green-600 font-medium">{chartData[chartData.length - 1]?.high?.toFixed(2) || '--'}</span>
              </span>
              <span className="font-mono text-muted-foreground">
                L: <span className="text-red-600 font-medium">{chartData[chartData.length - 1]?.low?.toFixed(2) || '--'}</span>
              </span>
              <span className="font-mono text-muted-foreground">
                C: <span className={cn("font-semibold", 
                  chartData[chartData.length - 1] && chartData[chartData.length - 1]?.close >= chartData[chartData.length - 1]?.open 
                    ? "text-green-600" 
                    : "text-red-600"
                )}>
                  {chartData[chartData.length - 1]?.close?.toFixed(2) || '--'}
                </span>
              </span>
            </div>
            
            {chartData[chartData.length - 1]?.volume && (
              <span className="font-mono text-muted-foreground">
                Vol: <span className="text-blue-600 font-medium">
                  {(chartData[chartData.length - 1].volume! / 1000000).toFixed(2)}M
                </span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}