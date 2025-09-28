'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  CpuChipIcon,
  EyeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  BoltIcon,
  SparklesIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { tradingApi, AnalysisRequest, AnalysisResponse, handleApiError, PriceData } from '@/lib/api';
import { cn, isValidSymbol, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

interface AnalysisFormData {
  symbol: string;
  timeframe: string;
  include_chart: boolean;
  model_preference: 'hybrid' | 'qwen' | 'gemini';
  analysis_type: 'quick' | 'detailed' | 'comprehensive';
}

interface ModelPerformance {
  model: string;
  accuracy: number;
  avg_confidence: number;
  success_rate: number;
  avg_execution_time: number;
}

interface AnalysisHistory {
  id: string;
  symbol: string;
  timestamp: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  result?: 'correct' | 'incorrect' | 'pending';
  actual_outcome?: number;
}

const TIMEFRAMES = [
  { value: '1m', label: '1 Minute', icon: '⚡' },
  { value: '5m', label: '5 Minutes', icon: '🔥' },
  { value: '15m', label: '15 Minutes', icon: '📊' },
  { value: '1h', label: '1 Hour', icon: '⏰' },
  { value: '4h', label: '4 Hours', icon: '📈' },
  { value: '1d', label: '1 Day', icon: '🌅' },
  { value: '1w', label: '1 Week', icon: '📅' },
];

const POPULAR_SYMBOLS = [
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', icon: '₿', color: 'text-orange-500' },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', icon: 'Ξ', color: 'text-blue-500' },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', icon: '◎', color: 'text-purple-500' },
  { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto', icon: '₳', color: 'text-green-500' },
  { symbol: 'AAPL', name: 'Apple', type: 'stock', icon: '🍎', color: 'text-gray-700' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock', icon: '🚗', color: 'text-red-500' },
  { symbol: 'GOOGL', name: 'Google', type: 'stock', icon: '🔍', color: 'text-blue-600' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', icon: '🪟', color: 'text-blue-700' },
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', icon: '💶', color: 'text-green-600' },
  { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', icon: '💷', color: 'text-blue-800' },
  { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', icon: '💴', color: 'text-red-600' },
  { symbol: 'AUDUSD', name: 'AUD/USD', type: 'forex', icon: '🇦🇺', color: 'text-yellow-600' },
];

const MODEL_OPTIONS = [
  { value: 'hybrid', label: 'Hybrid AI', description: 'Qwen + Gemini combined analysis', icon: SparklesIcon, color: 'text-purple-500' },
  { value: 'qwen', label: 'Qwen Model', description: 'Fast technical analysis', icon: BoltIcon, color: 'text-blue-500' },
  { value: 'gemini', label: 'Gemini Vision', description: 'Chart pattern recognition', icon: EyeIcon, color: 'text-green-500' },
];

const ANALYSIS_TYPES = [
  { value: 'quick', label: 'Quick Analysis', description: 'Basic insights (5s)', icon: BoltIcon },
  { value: 'detailed', label: 'Detailed Analysis', description: 'Comprehensive review (15s)', icon: ChartBarIcon },
  { value: 'comprehensive', label: 'Deep Analysis', description: 'Full AI assessment (30s)', icon: AcademicCapIcon },
];

export default function AIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AnalysisFormData>({
    defaultValues: {
      symbol: 'BTC-USD',
      timeframe: '1d',
      include_chart: true,
      model_preference: 'hybrid',
      analysis_type: 'detailed',
    },
  });

  const watchedSymbol = watch('symbol');

  const onSubmit = useCallback(async (data: AnalysisFormData) => {
    if (!isValidSymbol(data.symbol)) {
      setError('Please enter a valid trading symbol');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const request: AnalysisRequest = {
        symbol: data.symbol.toUpperCase(),
        timeframe: data.timeframe,
        include_chart: data.include_chart,
      };

      const result = await tradingApi.analyzeSymbol(request);
      setAnalysisResult(result);
    } catch (err) {
      const apiError = handleApiError(err);
      
      // Show mock analysis for development/demo purposes
      if (apiError.message.includes('Network error') || apiError.message.includes('Server error')) {
        const mockResult: AnalysisResponse = {
          success: true,
          symbol: data.symbol.toUpperCase(),
          action: ['buy', 'sell', 'hold'][Math.floor(Math.random() * 3)] as 'buy' | 'sell' | 'hold',
          confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
          reasoning: `Mock analysis for ${data.symbol.toUpperCase()}: Based on current market conditions and technical indicators, this ${['buy', 'sell', 'hold'][Math.floor(Math.random() * 3)]} recommendation considers price momentum, volume patterns, and risk factors. This is a development-mode simulation using synthetic data.`,
          risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          models_used: data.include_chart ? ['qwen', 'gemini'] : ['qwen'],
          technical_indicators: {
            RSI: Math.round((Math.random() * 40 + 30) * 100) / 100, // 30-70
            MACD: Math.round((Math.random() * 2 - 1) * 100) / 100, // -1 to 1
            'Bollinger Bands': Math.round((Math.random() * 50 + 25) * 100) / 100, // 25-75
            'Moving Average (20)': Math.round((Math.random() * 1000 + 40000) * 100) / 100,
            Volume: Math.round((Math.random() * 1000000) * 100) / 100,
          },
          timestamp: new Date().toISOString(),
          execution_time_ms: Math.round(Math.random() * 2000 + 500), // 500-2500ms
        };
        
        // Simulate API delay
        setTimeout(() => {
          setAnalysisResult(mockResult);
          setIsAnalyzing(false);
        }, 1500);
        return;
      }
      
      setError(apiError.message);
      setIsAnalyzing(false);
    }
  }, []);

  const handleQuickSymbol = (symbol: string) => {
    setValue('symbol', symbol);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy':
        return <ArrowTrendingUpIcon className="h-5 w-5" />;
      case 'sell':
        return <ArrowTrendingDownIcon className="h-5 w-5" />;
      case 'hold':
        return <MinusIcon className="h-5 w-5" />;
      default:
        return <MinusIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gradient-to-r from-primary to-chart-5 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl">Hybrid AI Analysis</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Get comprehensive trading insights using Qwen + Gemini AI
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Symbol Input */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Trading Symbol
              </label>
              <input
                {...register('symbol', { 
                  required: 'Symbol is required',
                  validate: value => isValidSymbol(value) || 'Invalid symbol format'
                })}
                type="text"
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input-focus bg-background transition-colors",
                  errors.symbol ? "border-destructive" : "border-input"
                )}
                placeholder="e.g., BTC-USD, AAPL"
              />
              {errors.symbol && (
                <p className="mt-1 text-sm text-destructive">{errors.symbol.message}</p>
              )}
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Timeframe
              </label>
              <select
                {...register('timeframe')}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input-focus bg-background text-card-foreground transition-colors"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Include Chart Analysis */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Visual Analysis
              </label>
              <div className="flex items-center space-x-2">
                <input
                  {...register('include_chart')}
                  type="checkbox"
                  className="rounded border-input text-primary focus:ring-ring focus:ring-2"
                />
                <span className="text-sm text-muted-foreground">Include Gemini chart analysis</span>
              </div>
            </div>

            {/* Analyze Button */}
            <div className="flex items-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isAnalyzing}
                loading={isAnalyzing}
                fullWidth
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>
        </form>

          {/* Quick Symbol Selection */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-card-foreground mb-3">Popular Symbols</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SYMBOLS.map((item) => (
                <Button
                  key={item.symbol}
                  variant={watchedSymbol === item.symbol ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleQuickSymbol(item.symbol)}
                  className="transition-all duration-200"
                >
                  <span className="font-medium">{item.symbol}</span>
                  <span className="ml-1 text-xs opacity-75">({item.name})</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {isAnalyzing && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-64 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
                  <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="text-center">
                    <CardContent className="pt-6">
                      <div className="h-12 bg-muted rounded mb-3 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-24 mx-auto animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-4/5 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/5 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-6">
          {/* Main Analysis Result */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Analysis Result for {analysisResult.symbol}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Completed in {analysisResult.execution_time_ms.toFixed(0)}ms
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {analysisResult.models_used.map((model) => (
                    <div
                      key={model}
                      className="flex items-center space-x-1 px-2 py-1 bg-accent rounded-full border border-border"
                    >
                      {model === 'qwen' ? (
                        <ChartBarIcon className="h-4 w-4 text-chart-1" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-chart-2" />
                      )}
                      <span className="text-xs text-muted-foreground capitalize">{model}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Action Recommendation */}
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className={cn(
                      "inline-flex items-center space-x-2 px-4 py-3 rounded-lg mb-3",
                      analysisResult.action === 'buy' ? "bg-trading-bullish/10 text-trading-bullish border border-trading-bullish/20" :
                      analysisResult.action === 'sell' ? "bg-trading-bearish/10 text-trading-bearish border border-trading-bearish/20" :
                      "bg-muted text-muted-foreground border border-border"
                    )}>
                      {getActionIcon(analysisResult.action)}
                      <span className="font-semibold uppercase">
                        {analysisResult.action}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Recommended Action</p>
                  </CardContent>
                </Card>

                {/* Confidence Score */}
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-3">
                      <span className={cn(
                        analysisResult.confidence >= 0.8 ? "text-trading-bullish" :
                        analysisResult.confidence >= 0.6 ? "text-warning" :
                        "text-trading-bearish"
                      )}>
                        {formatPercentage(analysisResult.confidence * 100, 0)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence Level</p>
                  </CardContent>
                </Card>

                {/* Risk Level */}
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className={cn(
                      "inline-flex items-center space-x-2 px-4 py-3 rounded-lg mb-3",
                      analysisResult.risk_level === 'low' ? "bg-trading-bullish/10 text-trading-bullish border border-trading-bullish/20" :
                      analysisResult.risk_level === 'medium' ? "bg-warning/10 text-warning border border-warning/20" :
                      "bg-trading-bearish/10 text-trading-bearish border border-trading-bearish/20"
                    )}>
                      <span className="font-semibold uppercase">
                        {analysisResult.risk_level} Risk
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Risk Assessment</p>
                  </CardContent>
                </Card>
              </div>

              {/* Reasoning */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">AI Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground">{analysisResult.reasoning}</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Technical Indicators */}
          {Object.keys(analysisResult.technical_indicators).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(analysisResult.technical_indicators).map(([key, value]) => {
                    if (value === null || value === undefined) return null;
                    
                    return (
                      <Card key={key} className="text-center">
                        <CardContent className="pt-6">
                          <div className="font-bold text-lg text-card-foreground">
                            {typeof value === 'number' ? value.toFixed(2) : value.toString()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}