'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';
import { 
  BrainIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  EyeIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  BarChart3Icon,
  ZapIcon
} from 'lucide-react';

interface AIAnalysis {
  symbol: string;
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  reasoning: string;
  key_insights: string[];
  risk_assessment: string;
  price_target?: number;
  stop_loss?: number;
  timestamp: string;
  status: string;
}

interface AIInsightsProps {
  symbol: string;
  onAnalysisUpdate?: (analysis: AIAnalysis) => void;
  className?: string;
}

export default function AIInsights({ symbol, onAnalysisUpdate, className = '' }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchAnalysis = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/ai/analyze/${symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze ${symbol}`);
      }
      
      const data: AIAnalysis = await response.json();
      setAnalysis(data);
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
      
      if (onAnalysisUpdate) {
        onAnalysisUpdate(data);
      }
      
    } catch (err) {
      console.error('AI analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchAnalysis();
    }
  }, [symbol]);

  const getSignalColor = (signal: string): string => {
    switch (signal) {
      case 'STRONG_BUY': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'BUY': return 'text-green-500 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'HOLD': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'SELL': return 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'STRONG_SELL': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY':
        return <TrendingUpIcon className="h-5 w-5" />;
      case 'BUY':
        return <ThumbsUpIcon className="h-5 w-5" />;
      case 'HOLD':
        return <BarChart3Icon className="h-5 w-5" />;
      case 'SELL':
        return <ThumbsDownIcon className="h-5 w-5" />;
      case 'STRONG_SELL':
        return <TrendingDownIcon className="h-5 w-5" />;
      default:
        return <AlertTriangleIcon className="h-5 w-5" />;
    }
  };

  const getSignalText = (signal: string): string => {
    switch (signal) {
      case 'STRONG_BUY': return '🚀 Strong Buy';
      case 'BUY': return '📈 Buy';
      case 'HOLD': return '⚖️ Hold';
      case 'SELL': return '📉 Sell';
      case 'STRONG_SELL': return '🔻 Strong Sell';
      default: return '❓ Unknown';
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <div className="text-center">
              <BrainIcon className="h-12 w-12 mx-auto text-purple-500 animate-pulse mb-4" />
              <RefreshCwIcon className="h-6 w-6 mx-auto animate-spin text-blue-500 mb-2" />
              <p className="text-lg font-medium">🧠 AI sedang menganalisis {symbol}...</p>
              <p className="text-sm text-gray-500 mt-2">Memproses data market dan indikator teknikal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangleIcon className="h-12 w-12 mx-auto text-red-500" />
            <div>
              <p className="text-lg font-medium text-red-600">Analysis Error</p>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
            <button
              onClick={fetchAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCwIcon className="h-4 w-4" />
              Retry Analysis
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <BrainIcon className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-600">No Analysis Available</p>
              <p className="text-sm text-gray-500 mt-2">Click to generate AI analysis for {symbol}</p>
            </div>
            <button
              onClick={fetchAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ZapIcon className="h-4 w-4" />
              Generate Analysis
            </button>
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BrainIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🤖 AI Analysis</h3>
              <p className="text-sm text-gray-500">{symbol} • Updated {lastUpdated}</p>
            </div>
          </div>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Trading Signal */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getSignalColor(analysis.signal)}`}>
              {getSignalIcon(analysis.signal)}
              <span className="font-bold text-lg">{getSignalText(analysis.signal)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">Confidence:</span>
              <div className="flex items-center gap-1">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${analysis.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {(analysis.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Targets */}
        {(analysis.price_target || analysis.stop_loss) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {analysis.price_target && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUpIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">Price Target</span>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatPrice(analysis.price_target)}
                </p>
              </div>
            )}
            
            {analysis.stop_loss && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Stop Loss</span>
                </div>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatPrice(analysis.stop_loss)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Key Insights */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-blue-600" />
            💡 Key Insights
          </h4>
          <div className="space-y-2">
            {analysis.key_insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">🔍 AI Reasoning</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {analysis.reasoning}
            </p>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-orange-600" />
            ⚠️ Risk Assessment
          </h4>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
            <p className="text-sm leading-relaxed text-orange-800 dark:text-orange-300">
              {analysis.risk_assessment}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p>⚡ Powered by Gemini AI & Alpha Vantage • Analysis generated at {new Date(analysis.timestamp).toLocaleString('id-ID')}</p>
          <p className="mt-1">📊 This analysis is for informational purposes only and should not be considered as financial advice.</p>
        </div>
      </CardContent>
    </Card>
  );
}