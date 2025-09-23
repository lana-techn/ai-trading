'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent } from '@/components/ui';
import { useTheme } from 'next-themes';
import { 
  RefreshCwIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  BarChart3Icon,
  Activity,
  Volume2
} from 'lucide-react';
import { generateCandlestickData, MarketData } from '@/lib/mock-data';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CandlestickChartProps {
  symbol: string;
  timeframe?: string;
  height?: number;
  className?: string;
}

export default function CandlestickChart({ 
  symbol, 
  timeframe = '1d', 
  height = 500,
  className = ''
}: CandlestickChartProps) {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  // Load data
  useEffect(() => {
    if (mounted) {
      setLoading(true);
      // Use clean mock data
      const mockData = generateCandlestickData(symbol, 30, timeframe);
      setData(mockData);
      setLoading(false);
    }
  }, [symbol, timeframe, mounted]);

  // Prepare candlestick series
  const candlestickSeries = useMemo(() => {
    if (data.length === 0) return [];

    return [{
      name: symbol,
      data: data.map(item => ({
        x: item.timestamp,
        y: [item.open, item.high, item.low, item.close]
      }))
    }];
  }, [data, symbol]);

  // Volume series
  const volumeSeries = useMemo(() => {
    if (data.length === 0) return [];

    return [{
      name: 'Volume',
      data: data.map(item => ({
        x: item.timestamp,
        y: item.volume
      }))
    }];
  }, [data]);

  // Candlestick options
  const candlestickOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'candlestick',
      height: height * 0.7,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      background: 'transparent'
    },
    theme: {
      mode: isDark ? 'dark' : 'light'
    },
    title: {
      text: `${symbol} Candlestick Chart`,
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: isDark ? '#f3f4f6' : '#374151'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: isDark ? '#9ca3af' : '#64748b',
          fontSize: '11px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Price ($)',
        style: {
          color: isDark ? '#9ca3af' : '#64748b',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          colors: isDark ? '#9ca3af' : '#64748b'
        },
        formatter: (val: number) => `$${val.toFixed(2)}`
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',
          downward: '#ef4444'
        }
      }
    },
    grid: {
      borderColor: isDark ? '#374151' : '#e2e8f0'
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light'
    }
  }), [isDark, height, symbol]);

  // Volume options
  const volumeOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height: height * 0.3,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    theme: {
      mode: isDark ? 'dark' : 'light'
    },
    title: {
      text: 'Volume',
      style: {
        fontSize: '14px',
        color: isDark ? '#f3f4f6' : '#374151'
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '80%',
        colors: {
          ranges: [{
            from: 0,
            to: Number.MAX_VALUE,
            color: '#10b981'
          }]
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#9ca3af' : '#64748b'
        },
        formatter: (val: number) => {
          if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
          if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
          if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
          return val.toString();
        }
      }
    },
    grid: {
      borderColor: isDark ? '#374151' : '#e2e8f0'
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light'
    },
    dataLabels: {
      enabled: false
    }
  }), [isDark, height]);

  // Calculate stats
  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;
  const previousPrice = data.length > 1 ? data[data.length - 2].close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  if (!mounted) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardContent className="p-6">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center space-y-4">
              <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-lg font-medium">Loading {symbol} chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center space-y-4">
              <BarChart3Icon className="h-16 w-16 mx-auto text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-600">No data available</p>
                <p className="text-sm text-gray-500">Unable to load chart data for {symbol}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">{symbol}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-semibold">
                ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                priceChange >= 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {priceChange >= 0 ? (
                  <TrendingUpIcon className="h-4 w-4" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4" />
                )}
                <span>
                  {priceChange >= 0 ? '+' : ''}${Math.abs(priceChange).toFixed(2)} 
                  ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <div>Demo Data</div>
            <div>{data.length} periods</div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <Chart
            options={candlestickOptions}
            series={candlestickSeries}
            type="candlestick"
            height={height * 0.7}
          />
          
          <Chart
            options={volumeOptions}
            series={volumeSeries}
            type="bar"
            height={height * 0.3}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">24H High</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              ${Math.max(...data.slice(-24).map(d => d.high)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDownIcon className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">24H Low</span>
            </div>
            <div className="text-lg font-bold text-red-600">
              ${Math.min(...data.slice(-24).map(d => d.low)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg Volume</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {(() => {
                const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
                if (avgVolume >= 1e9) return `${(avgVolume / 1e9).toFixed(1)}B`;
                if (avgVolume >= 1e6) return `${(avgVolume / 1e6).toFixed(1)}M`;
                if (avgVolume >= 1e3) return `${(avgVolume / 1e3).toFixed(1)}K`;
                return avgVolume.toFixed(0);
              })()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Volatility</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {(((Math.max(...data.slice(-24).map(d => d.high)) - Math.min(...data.slice(-24).map(d => d.low))) / currentPrice) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}