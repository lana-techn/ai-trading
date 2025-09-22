'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

export default function UltimateTestChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Starting...');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!chartContainerRef.current) {
        setDebugInfo('❌ No container');
        return;
      }

      setDebugInfo('🔄 Creating chart...');
      console.log('🚀 ULTIMATE TEST CHART');

      try {
        const container = chartContainerRef.current;
        
        // FORCE container to be visible
        container.style.width = '100%';
        container.style.height = '400px';
        container.style.backgroundColor = '#ffffff';
        container.style.border = '3px solid #ff0000'; // RED border to confirm container
        container.style.position = 'relative';
        container.style.zIndex = '10';
        
        const chart = createChart(container, {
          width: 800,
          height: 400,
          layout: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
          },
          grid: {
            vertLines: { color: '#dddddd' },
            horzLines: { color: '#dddddd' },
          },
          rightPriceScale: {
            borderColor: '#000000',
          },
          timeScale: {
            borderColor: '#000000',
          },
        });

        const series = chart.addCandlestickSeries({
          upColor: '#00ff00',      // BRIGHT GREEN
          downColor: '#ff0000',    // BRIGHT RED
          borderVisible: true,
          wickUpColor: '#00ff00',
          wickDownColor: '#ff0000',
          borderUpColor: '#00ff00',
          borderDownColor: '#ff0000',
        });

        // MASSIVE price range data for maximum visibility
        const data = [
          { time: '2024-01-01', open: 1000, high: 1200, low: 800, close: 1100 },
          { time: '2024-01-02', open: 1100, high: 1300, low: 900, close: 1200 },
          { time: '2024-01-03', open: 1200, high: 1400, low: 1000, close: 900 },  // DOWN candle (RED)
          { time: '2024-01-04', open: 900, high: 1100, low: 700, close: 1000 },   // UP candle (GREEN)
          { time: '2024-01-05', open: 1000, high: 1500, low: 500, close: 1400 },  // UP candle (GREEN)
        ];

        console.log('📊 ULTIMATE: Setting LARGE data:', data);
        series.setData(data);
        chart.timeScale().fitContent();

        setDebugInfo('✅ ULTIMATE CHART READY - SHOULD BE IMPOSSIBLE TO MISS!');
        console.log('✅ ULTIMATE: Chart with HUGE price range created');

        // FORCE a repaint
        setTimeout(() => {
          chart.resize(800, 400);
        }, 100);

      } catch (error) {
        console.error('❌ ULTIMATE error:', error);
        setDebugInfo(`❌ Error: ${error}`);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full p-8 bg-red-100 border-4 border-red-500 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-800 mb-2">
          🔥 ULTIMATE CANDLESTICK TEST
        </h2>
        <div className="bg-red-200 p-4 rounded border border-red-400">
          <div className="font-bold text-red-900">Status: {debugInfo}</div>
          <div className="text-sm text-red-700 mt-2">
            This chart has:
            <ul className="list-disc ml-5 mt-1">
              <li>HUGE price ranges (500-1500)</li>
              <li>BRIGHT colors (pure green/red)</li>
              <li>RED border around chart area</li>
              <li>Forced dimensions and visibility</li>
            </ul>
          </div>
        </div>
      </div>

      <div 
        ref={chartContainerRef}
        className="w-full"
        style={{ 
          height: '400px',
          minHeight: '400px',
          backgroundColor: '#ffffff',
          border: '3px solid #ff0000',
        }}
      />

      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <div className="font-bold text-yellow-800">What you should see:</div>
        <div className="text-sm text-yellow-700 mt-1">
          • Red border around white chart area<br/>
          • 5 HUGE candlesticks with extreme price movements<br/>
          • Bright green (up) and red (down) colors<br/>
          • Grid lines and price/time axis
        </div>
      </div>
    </div>
  );
}