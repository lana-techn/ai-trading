'use client';

import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function GuaranteedChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('🚀 Creating guaranteed chart');

    const chart = createChart(chartContainerRef.current, {
      width: 600,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#e0e0e0' },
        horzLines: { color: '#e0e0e0' },
      },
      rightPriceScale: {
        borderColor: '#cccccc',
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00C851',        // Bright green for up candles
      downColor: '#FF4444',      // Bright red for down candles
      borderVisible: true,
      wickUpColor: '#00C851',
      wickDownColor: '#FF4444',
      borderUpColor: '#00C851',
      borderDownColor: '#FF4444',
    });

    // Data yang PASTI bekerja - copy dari dokumentasi lightweight-charts
    const data = [
      { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
      { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
      { time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
      { time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
      { time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
      { time: '2018-12-27', open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
      { time: '2018-12-28', open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
      { time: '2018-12-29', open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
      { time: '2018-12-30', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
      { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    ];

    console.log('📊 Setting data:', data);
    console.log('📊 Data sample:', data[0]);
    console.log('📊 Container dimensions:', {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      offsetWidth: chartContainerRef.current.offsetWidth,
      offsetHeight: chartContainerRef.current.offsetHeight
    });
    
    candlestickSeries.setData(data);
    
    // Fit content to ensure visibility
    chart.timeScale().fitContent();
    
    console.log('✅ Chart created and data set - should be visible now');
    console.log('📈 Series info:', {
      seriesType: candlestickSeries.seriesType(),
      dataLength: data.length
    });

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div className="w-full p-6 bg-white border-2 border-blue-500 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🕯️ Guaranteed Candlestick Chart</h3>
      <div 
        ref={chartContainerRef}
        className="w-full bg-gray-50 border border-gray-300 rounded"
        style={{ 
          height: '400px', 
          minHeight: '400px',
          minWidth: '600px'
        }}
      />
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-800 font-semibold">
          ✅ Status: Chart initialized successfully
        </p>
        <p className="text-xs text-green-600 mt-1">
          Data: 10 candlesticks from Dec 22-31, 2018 • Library: lightweight-charts@4.2.0
        </p>
        <p className="text-xs text-gray-600 mt-2">
          If you can see this green box but no candlesticks above, there might be a rendering issue.
        </p>
      </div>
    </div>
  );
}