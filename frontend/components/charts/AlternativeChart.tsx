'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

export default function AlternativeChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeChart = () => {
      if (!chartContainerRef.current) {
        setStatus('❌ Container not found');
        return;
      }

      setStatus('🔄 Creating chart...');
      console.log('🚀 Alternative chart initialization');

      try {
        // Clear container first
        chartContainerRef.current.innerHTML = '';
        
        // Set explicit dimensions
        chartContainerRef.current.style.width = '100%';
        chartContainerRef.current.style.height = '400px';
        chartContainerRef.current.style.position = 'relative';

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth || 800,
          height: 400,
          layout: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
        });

        setStatus('📊 Adding candlestick series...');

        const series = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        // Simple test data
        const testData = [
          { time: '2024-01-01', open: 100, high: 120, low: 95, close: 110 },
          { time: '2024-01-02', open: 110, high: 125, low: 105, close: 115 },
          { time: '2024-01-03', open: 115, high: 130, low: 110, close: 120 },
          { time: '2024-01-04', open: 120, high: 135, low: 115, close: 125 },
          { time: '2024-01-05', open: 125, high: 140, low: 120, close: 130 },
        ];

        series.setData(testData);
        chart.timeScale().fitContent();

        setStatus('✅ Chart ready - 5 green candlesticks should be visible');
        console.log('✅ Alternative chart created successfully');

        return () => {
          chart.remove();
        };

      } catch (error) {
        console.error('❌ Alternative chart error:', error);
        setStatus(`❌ Error: ${error}`);
      }
    };

    // Delay initialization to ensure DOM is ready
    timeoutId = setTimeout(initializeChart, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="w-full p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-yellow-800">
        🔄 Alternative Chart Approach
      </h3>
      
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
        <div className="text-sm font-semibold">Status: {status}</div>
      </div>

      <div 
        ref={chartContainerRef}
        className="w-full bg-white border-2 border-gray-400 rounded"
        style={{ height: '400px' }}
      />

      <div className="mt-4 text-sm text-yellow-800">
        <strong>Expected:</strong> 5 ascending green candlesticks (Jan 1-5, 2024, prices 100-130)
      </div>
    </div>
  );
}