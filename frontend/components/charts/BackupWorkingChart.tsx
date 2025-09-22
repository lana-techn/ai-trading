'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface BackupWorkingChartProps {
  symbol: string;
  height?: number;
}

export default function BackupWorkingChart({ symbol, height = 400 }: BackupWorkingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const createWorkingChart = () => {
    if (!chartContainerRef.current) return;

    console.log('🔥 Creating BACKUP working chart for:', symbol);

    // Clear container
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: height,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Use EXACT same data format as working test
    const workingData = [
      { time: '2024-01-01', open: 43500, high: 44200, low: 43200, close: 43800 },
      { time: '2024-01-02', open: 43800, high: 44500, low: 43600, close: 44100 },
      { time: '2024-01-03', open: 44100, high: 44800, low: 43900, close: 44400 },
      { time: '2024-01-04', open: 44400, high: 45100, low: 44200, close: 44700 },
      { time: '2024-01-05', open: 44700, high: 45400, low: 44500, close: 45000 },
      { time: '2024-01-06', open: 45000, high: 45700, low: 44800, close: 45300 },
      { time: '2024-01-07', open: 45300, high: 46000, low: 45100, close: 45600 },
      { time: '2024-01-08', open: 45600, high: 46300, low: 45400, close: 45900 },
      { time: '2024-01-09', open: 45900, high: 46600, low: 45700, close: 46200 },
      { time: '2024-01-10', open: 46200, high: 46900, low: 46000, close: 46500 },
    ];

    console.log('🔥 Setting EXACT working data:', workingData);
    candlestickSeries.setData(workingData);
    chart.timeScale().fitContent();

    console.log('✅ BACKUP chart created - should be visible!');
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      createWorkingChart();
    }, 100);

    return () => clearTimeout(timeout);
  }, [symbol, height]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            🔥 Backup Working Chart - {symbol}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={createWorkingChart}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Uses EXACT same format as test charts that worked
          {lastUpdated && (
            <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={chartContainerRef}
          style={{ height: `${height}px` }}
          className="w-full border border-orange-300 bg-white rounded"
        />
        <div className="mt-2 text-xs text-gray-600">
          Expected: 10 ascending candlesticks (BTC prices 43,500 → 46,500)
        </div>
      </CardContent>
    </Card>
  );
}