'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface DebugTestChartProps {
  symbol: string;
  height?: number;
  testName: string;
}

export default function DebugTestChart({ symbol, height = 400, testName }: DebugTestChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [containerInfo, setContainerInfo] = useState<any>(null);

  const createTestChart = () => {
    if (!chartContainerRef.current) {
      console.error(`❌ ${testName}: Container not found`);
      return;
    }

    console.log(`🧪 ${testName}: Creating chart...`);

    // Get container info BEFORE creating chart
    const containerData = {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      offsetWidth: chartContainerRef.current.offsetWidth,
      offsetHeight: chartContainerRef.current.offsetHeight,
      scrollWidth: chartContainerRef.current.scrollWidth,
      scrollHeight: chartContainerRef.current.scrollHeight,
      style: {
        display: chartContainerRef.current.style.display,
        visibility: chartContainerRef.current.style.visibility,
        position: chartContainerRef.current.style.position,
      }
    };
    setContainerInfo(containerData);
    console.log(`🧪 ${testName}: Container info:`, containerData);

    // Clear container
    chartContainerRef.current.innerHTML = '';

    try {
      // EXACT same configuration
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

      console.log(`🧪 ${testName}: Chart created`);

      // EXACT same series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      console.log(`🧪 ${testName}: Candlestick series added`);

      // EXACT same data
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

      console.log(`🧪 ${testName}: Setting data:`, workingData);
      candlestickSeries.setData(workingData);
      
      console.log(`🧪 ${testName}: Data set, calling fitContent...`);
      chart.timeScale().fitContent();

      console.log(`🧪 ${testName}: ✅ Chart should be visible now!`);
      setLastUpdated(new Date());

      // Additional debugging
      setTimeout(() => {
        const chartContainer = chartContainerRef.current;
        if (chartContainer) {
          const canvas = chartContainer.querySelector('canvas');
          const canvasCount = chartContainer.querySelectorAll('canvas').length;
          
          console.log(`🧪 ${testName}: POST-CREATE ANALYSIS:`);
          console.log(`   - Canvas elements found: ${canvasCount}`);
          console.log(`   - Canvas element:`, canvas);
          console.log(`   - Container children:`, chartContainer.children.length);
          console.log(`   - Container innerHTML length:`, chartContainer.innerHTML.length);
          
          if (canvas) {
            console.log(`   - Canvas dimensions:`, {
              width: canvas.width,
              height: canvas.height,
              style: canvas.style.cssText
            });
          }
        }
      }, 500);

    } catch (error) {
      console.error(`❌ ${testName}: Chart creation error:`, error);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      createTestChart();
    }, 100);

    return () => clearTimeout(timeout);
  }, [symbol, height, testName]);

  return (
    <Card className="w-full border-2 border-purple-400">
      <CardHeader>
        <CardTitle className="text-lg text-purple-800">
          🧪 {testName} - {symbol}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Debug test with detailed logging
          {lastUpdated && (
            <span className="ml-2">• Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
        {containerInfo && (
          <div className="text-xs bg-purple-50 p-2 rounded mt-2">
            <div><strong>Container:</strong> {containerInfo.width}×{containerInfo.height}</div>
            <div><strong>Offset:</strong> {containerInfo.offsetWidth}×{containerInfo.offsetHeight}</div>
            <div><strong>Scroll:</strong> {containerInfo.scrollWidth}×{containerInfo.scrollHeight}</div>
            <div><strong>Display:</strong> {containerInfo.style.display || 'default'}</div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div 
          ref={chartContainerRef}
          style={{ height: `${height}px` }}
          className="w-full border border-purple-300 bg-white rounded"
        />
        <div className="mt-2 text-xs text-purple-700">
          Expected: 10 candlesticks, Jan 1-10, 2024 (43,500 → 46,500)
        </div>
      </CardContent>
    </Card>
  );
}