'use client';

import { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CandlestickPattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  timeDetected: string;
  position: {
    startIndex: number;
    endIndex: number;
  };
}

interface PatternRecognitionProps {
  chartData?: any[];
  symbol: string;
  className?: string;
}

export default function PatternRecognition({ 
  chartData = [], 
  symbol, 
  className 
}: PatternRecognitionProps) {
  const [patterns, setPatterns] = useState<CandlestickPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // Detect patterns when chart data changes
  useEffect(() => {
    if (chartData.length > 10) {
      analyzePatterns();
    }
  }, [chartData]);

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate pattern detection - in production, this would call your backend
      const detectedPatterns = await simulatePatternDetection(chartData);
      setPatterns(detectedPatterns);
    } catch (error) {
      console.error('Pattern analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock pattern detection for demo
  const simulatePatternDetection = async (data: any[]): Promise<CandlestickPattern[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPatterns: CandlestickPattern[] = [
          {
            id: '1',
            name: 'Bullish Engulfing',
            type: 'bullish',
            confidence: 85,
            description: 'A two-candle reversal pattern where a large bullish candle completely engulfs the previous bearish candle.',
            timeDetected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            position: { startIndex: data.length - 20, endIndex: data.length - 18 }
          },
          {
            id: '2',
            name: 'Doji',
            type: 'neutral',
            confidence: 72,
            description: 'A candlestick with virtually the same open and close price, indicating market indecision.',
            timeDetected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            position: { startIndex: data.length - 15, endIndex: data.length - 15 }
          },
          {
            id: '3',
            name: 'Head and Shoulders',
            type: 'bearish',
            confidence: 78,
            description: 'A reversal pattern consisting of three peaks with the middle peak being the highest.',
            timeDetected: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            position: { startIndex: data.length - 30, endIndex: data.length - 20 }
          },
          {
            id: '4',
            name: 'Hammer',
            type: 'bullish',
            confidence: 68,
            description: 'A single candle reversal pattern with a small body and long lower wick.',
            timeDetected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            position: { startIndex: data.length - 5, endIndex: data.length - 5 }
          }
        ];
        
        resolve(mockPatterns);
      }, 1500);
    });
  };

  const getPatternIcon = (type: CandlestickPattern['type'], confidence: number) => {
    if (confidence < 60) return <ExclamationTriangleIcon className="h-5 w-5" />;
    if (confidence >= 80) return <CheckCircleIcon className="h-5 w-5" />;
    
    switch (type) {
      case 'bullish':
        return <ArrowTrendingUpIcon className="h-5 w-5" />;
      case 'bearish':
        return <ArrowTrendingDownIcon className="h-5 w-5" />;
      default:
        return <SparklesIcon className="h-5 w-5" />;
    }
  };

  const getPatternColor = (type: CandlestickPattern['type'], confidence: number) => {
    if (confidence < 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (confidence >= 80) {
      switch (type) {
        case 'bullish':
          return 'text-green-700 bg-green-50 border-green-200';
        case 'bearish':
          return 'text-red-700 bg-red-50 border-red-200';
        default:
          return 'text-blue-700 bg-blue-50 border-blue-200';
      }
    }
    
    switch (type) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pattern Recognition</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={analyzePatterns}
            disabled={isAnalyzing || chartData.length < 10}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              isAnalyzing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            )}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isAnalyzing && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing candlestick patterns...</p>
            </div>
          </div>
        )}

        {!isAnalyzing && patterns.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <SparklesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No patterns detected</p>
            <p className="text-sm mt-1">
              {chartData.length < 10 
                ? 'Need more chart data to analyze patterns' 
                : 'Click Analyze to detect candlestick patterns'
              }
            </p>
          </div>
        )}

        {!isAnalyzing && patterns.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} in {symbol}
              </p>
              <p className="text-xs text-gray-500">
                Last analyzed: {new Date().toLocaleTimeString()}
              </p>
            </div>

            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={cn(
                  "border rounded-lg p-4 cursor-pointer transition-all",
                  getPatternColor(pattern.type, pattern.confidence),
                  selectedPattern === pattern.id 
                    ? "ring-2 ring-offset-2 ring-blue-500" 
                    : "hover:shadow-sm"
                )}
                onClick={() => setSelectedPattern(
                  selectedPattern === pattern.id ? null : pattern.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-0.5">
                      {getPatternIcon(pattern.type, pattern.confidence)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{pattern.name}</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-white bg-opacity-50 rounded">
                          {pattern.type}
                        </span>
                      </div>
                      
                      <p className="text-sm mt-1 opacity-80">
                        {formatTimeAgo(pattern.timeDetected)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn("font-semibold", getConfidenceColor(pattern.confidence))}>
                      {pattern.confidence}%
                    </div>
                    <div className="text-xs opacity-75">confidence</div>
                  </div>
                </div>

                {selectedPattern === pattern.id && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="text-sm opacity-90">{pattern.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                      <span>Position: Candles {pattern.position.startIndex} - {pattern.position.endIndex}</span>
                      <span>Detected: {new Date(pattern.timeDetected).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {patterns.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <strong>Disclaimer:</strong> Pattern recognition is for educational purposes only. 
            Always conduct thorough analysis and consider multiple factors before making trading decisions.
          </div>
        </div>
      )}
    </div>
  );
}