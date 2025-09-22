'use client';

import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface BasicCandlestickChartProps {
  symbol: string;
}

export default function BasicCandlestickChart({ symbol }: BasicCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('🚀 Creating BASIC candlestick chart');

    const chart = createChart(chartContainerRef.current, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Hard-coded data yang PASTI bekerja
    const data = [
      { time: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
      { time: '2024-01-02', open: 105, high: 115, low: 100, close: 108 },
      { time: '2024-01-03', open: 108, high: 118, low: 103, close: 112 },
      { time: '2024-01-04', open: 112, high: 120, low: 108, close: 116 },
      { time: '2024-01-05', open: 116, high: 125, low: 110, close: 118 },
      { time: '2024-01-06', open: 118, high: 128, low: 115, close: 120 },
      { time: '2024-01-07', open: 120, high: 130, low: 118, close: 125 },
      { time: '2024-01-08', open: 125, high: 135, low: 120, close: 130 },
      { time: '2024-01-09', open: 130, high: 140, low: 125, close: 128 },
      { time: '2024-01-10', open: 128, high: 138, low: 123, close: 135 },
    ];

    console.log('📊 Setting hardcoded data:', data);
    candlestickSeries.setData(data);

    chart.timeScale().fitContent();

    console.log('✅ Basic chart should be visible now');

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Basic Test Chart - {symbol}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Hardcoded candlestick data - should ALWAYS work
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={chartContainerRef}
          className="w-full h-96 border-2 border-blue-500 bg-white"
        />
        <div className="mt-2 text-xs">
          Expected: 10 candlesticks from Jan 1-10, 2024. Green/red bars showing price movement 100-135.
        </div>
      </CardContent>
    </Card>
  );
}