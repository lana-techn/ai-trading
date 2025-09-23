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

  // Volume series with color mapping based on price movement
  const volumeSeries = useMemo(() => {
    if (data.length === 0) return [];

    return [{
      name: 'Volume',
      data: data.map((item, index) => {
        const isBullish = item.close >= item.open;
        return {
          x: item.timestamp,
          y: item.volume,
          fillColor: isBullish ? '#10b981' : '#ef4444', // Green for bullish, red for bearish
        }
      })
    }];
  }, [data]);

  // Enhanced Candlestick options with better colors and UX
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
        },
        offsetY: -10
      },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    theme: {
      mode: isDark ? 'dark' : 'light'
    },
    title: {
      text: `📈 ${symbol} Candlestick Analysis`,
      style: {
        fontSize: '18px',
        fontWeight: '700',
        color: isDark ? '#f3f4f6' : '#374151'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: isDark ? '#9ca3af' : '#64748b',
          fontSize: '11px'
        },
        format: 'MMM dd'
      },
      axisBorder: {
        color: isDark ? '#4b5563' : '#d1d5db'
      },
      axisTicks: {
        color: isDark ? '#4b5563' : '#d1d5db'
      }
    },
    yaxis: {
      title: {
        text: 'Price (USD)',
        style: {
          color: isDark ? '#9ca3af' : '#64748b',
          fontSize: '12px',
          fontWeight: '600'
        }
      },
      labels: {
        style: {
          colors: isDark ? '#9ca3af' : '#64748b',
          fontSize: '11px'
        },
        formatter: (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      tooltip: {
        enabled: true
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00d4aa', // Brighter green for bullish
          downward: '#ff6b6b' // Softer red for bearish
        },
        wick: {
          useFillColor: true
        }
      }
    },
    grid: {
      borderColor: isDark ? '#374151' : '#e2e8f0',
      strokeDashArray: 3,
      opacity: 0.3
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
        const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
        const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
        const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
        const timestamp = new Date(w.globals.categoryLabels[dataPointIndex]);
        
        const isBullish = c >= o;
        const change = c - o;
        const changePercent = ((change / o) * 100);
        
        const timeStr = timestamp.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const bgColor = isBullish ? '#00d4aa' : '#ff6b6b';
        const textColor = '#ffffff';
        
        return `
          <div style="
            background: ${bgColor};
            color: ${textColor};
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            line-height: 1.5;
            min-width: 200px;
          ">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <span>${isBullish ? '📈' : '📉'}</span>
              <span>${symbol}</span>
            </div>
            <div style="margin-bottom: 8px; font-size: 12px; opacity: 0.9;">
              ${timeStr}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <div style="font-size: 11px; opacity: 0.8;">Open</div>
                <div style="font-weight: 600;">$${o.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.8;">Close</div>
                <div style="font-weight: 600;">$${c.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.8;">High</div>
                <div style="font-weight: 600;">$${h.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 11px; opacity: 0.8;">Low</div>
                <div style="font-weight: 600;">$${l.toFixed(2)}</div>
              </div>
            </div>
            <div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); text-align: center;">
              <div style="font-weight: 600;">
                ${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        `;
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          toolbar: {
            show: false
          }
        }
      }
    }]
  }), [isDark, height, symbol]);

  // Enhanced Volume options with better UI/UX
  const volumeOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height: height * 0.3,
      toolbar: {
        show: false
      },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    theme: {
      mode: isDark ? 'dark' : 'light'
    },
    title: {
      text: '📊 Trading Volume',
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: isDark ? '#f3f4f6' : '#374151'
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '75%',
        borderRadius: 2,
        distributed: true, // Enable individual colors per bar
        colors: {
          backgroundBarColors: [isDark ? '#1f2937' : '#f8fafc'],
          backgroundBarOpacity: 0.3,
        }
      }
    },
    colors: ['#10b981', '#ef4444'], // Will be overridden by individual bar colors
    fill: {
      type: 'gradient',
      gradient: {
        shade: isDark ? 'dark' : 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 50, 100],
        colorStops: []
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      title: {
        text: 'Volume',
        style: {
          color: isDark ? '#9ca3af' : '#64748b',
          fontSize: '12px',
          fontWeight: '500'
        }
      },
      labels: {
        style: {
          colors: isDark ? '#9ca3af' : '#64748b',
          fontSize: '11px'
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
      borderColor: isDark ? '#374151' : '#e2e8f0',
      strokeDashArray: 3,
      opacity: 0.3,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      shared: false,
      intersect: false,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const timestamp = new Date(w.globals.categoryLabels[dataPointIndex]);
        const timeStr = timestamp.toLocaleDateString('id-ID', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        let volumeStr;
        if (value >= 1e9) volumeStr = `${(value / 1e9).toFixed(2)}B`;
        else if (value >= 1e6) volumeStr = `${(value / 1e6).toFixed(2)}M`;
        else if (value >= 1e3) volumeStr = `${(value / 1e3).toFixed(2)}K`;
        else volumeStr = value.toLocaleString();
        
        const isBullish = data[dataPointIndex]?.close >= data[dataPointIndex]?.open;
        const bgColor = isBullish ? '#10b981' : '#ef4444';
        const textColor = '#ffffff';
        
        return `
          <div style="
            background: ${bgColor};
            color: ${textColor};
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 13px;
            line-height: 1.4;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">
              📊 Volume: ${volumeStr}
            </div>
            <div style="opacity: 0.9;">
              ${timeStr}
            </div>
            <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">
              ${isBullish ? '📈 Bullish' : '📉 Bearish'}
            </div>
          </div>
        `;
      }
    },
    dataLabels: {
      enabled: false
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'darken',
          value: 0.7
        }
      }
    }
  }), [isDark, height, data]);

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

        {/* Enhanced Stats with Modern Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
            <div className="relative p-5 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-colors duration-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">24H High</span>
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400 text-center">
                ${Math.max(...data.slice(-24).map(d => d.high)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70 text-center mt-1">
                📈 Bullish Peak
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
            <div className="relative p-5 bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-colors duration-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <TrendingDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">24H Low</span>
              </div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400 text-center">
                ${Math.min(...data.slice(-24).map(d => d.low)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-red-600/70 dark:text-red-400/70 text-center mt-1">
                📉 Bearish Low
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
            <div className="relative p-5 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Volume</span>
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 text-center">
                {(() => {
                  const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
                  if (avgVolume >= 1e9) return `${(avgVolume / 1e9).toFixed(1)}B`;
                  if (avgVolume >= 1e6) return `${(avgVolume / 1e6).toFixed(1)}M`;
                  if (avgVolume >= 1e3) return `${(avgVolume / 1e3).toFixed(1)}K`;
                  return avgVolume.toFixed(0);
                })()
                }
              </div>
              <div className="text-xs text-blue-600/70 dark:text-blue-400/70 text-center mt-1">
                📊 Trading Activity
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
            <div className="relative p-5 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors duration-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Volatility</span>
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 text-center">
                {(((Math.max(...data.slice(-24).map(d => d.high)) - Math.min(...data.slice(-24).map(d => d.low))) / currentPrice) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-purple-600/70 dark:text-purple-400/70 text-center mt-1">
                ⚡ Price Movement
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
