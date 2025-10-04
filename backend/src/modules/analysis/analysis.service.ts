import { Injectable } from '@nestjs/common';
import { formatISO } from 'date-fns';

import { AgentRouterService } from '../ai/services/agent-router.service';
import {
  MarketDataService,
  MarketDataResult,
  MarketCandle,
} from '../market-data/market-data.service';
import { AnalysisRequestDto } from './dto/analysis-request.dto';
import { AuditService } from '../audit/audit.service';

export interface TechnicalIndicators {
  sma_short: number;
  sma_long: number;
  rsi: number;
  volatility: number;
  momentum: number;
}

export interface AnalysisResult {
  success: boolean;
  symbol: string;
  action: string;
  confidence: number;
  reasoning: string;
  risk_level: string;
  models_used: string[];
  technical_indicators: TechnicalIndicators;
  qwen_analysis: any;
  gemini_analysis: any;
  risk_assessment: Record<string, unknown> | null;
  timestamp: string;
  execution_time_ms: number;
}

@Injectable()
export class AnalysisService {
  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly auditService: AuditService,
    private readonly agentRouter: AgentRouterService,
  ) {}

  async analyze(dto: AnalysisRequestDto): Promise<AnalysisResult> {
    const start = Date.now();
    const timeframe = dto.timeframe ?? '1d';
    const marketData = await this.marketDataService.getHistoricalData(dto.symbol, timeframe, 120);
    const indicators = this.calculateIndicators(marketData.candles);

    const { action, confidence, reasoning, riskLevel } = this.deriveDecision(indicators, marketData);

    let qwenAnalysis = null;
    let modelsUsed = ['technical_sma', 'rsi', 'volatility_model'];

    if (dto.includeChart) {
      const chartDataSummary = {
        latestPrice: marketData.latestPrice,
        priceChange: marketData.candles[0]?.close - marketData.candles[marketData.candles.length - 1]?.close,
        highestPrice: Math.max(...marketData.candles.map(c => c.high)),
        lowestPrice: Math.min(...marketData.candles.map(c => c.low)),
      };

      const qwenResponse = await this.agentRouter.process({
        type: 'chart_analysis',
        symbol: dto.symbol,
        timeframe,
        chartData: chartDataSummary,
        technicalIndicators: indicators,
      });

      if (qwenResponse.success) {
        qwenAnalysis = {
          analysis: qwenResponse.response,
          tradingSignal: qwenResponse.data?.tradingSignal,
          confidence: qwenResponse.data?.confidence,
          keyInsights: qwenResponse.data?.keyInsights,
        };
        modelsUsed.push('qwen');
      }
    }

    const response: AnalysisResult = {
      success: true,
      symbol: dto.symbol,
      action,
      confidence,
      reasoning,
      risk_level: riskLevel,
      models_used: modelsUsed,
      technical_indicators: indicators,
      qwen_analysis: qwenAnalysis,
      gemini_analysis: null,
      risk_assessment: this.buildRiskAssessment(indicators, marketData),
      timestamp: formatISO(new Date()),
      execution_time_ms: Date.now() - start,
    };

    await this.auditService.logAiDecision({
      symbol: dto.symbol,
      action: response.action,
      confidence: response.confidence,
      riskLevel: response.risk_level,
      modelsUsed: response.models_used,
      executionTimeMs: response.execution_time_ms,
      metadata: {
        timeframe,
        riskAssessment: response.risk_assessment,
        indicators: response.technical_indicators,
        qwenAnalysis,
      },
    });

    return response;
  }

  private calculateIndicators(candles: MarketCandle[]): TechnicalIndicators {
    const closes = candles.map(candle => candle.close).reverse();
    const smaShort = this.simpleMovingAverage(closes, 20);
    const smaLong = this.simpleMovingAverage(closes, 50);
    const rsi = this.relativeStrengthIndex(closes, 14);
    const volatility = this.annualizedVolatility(closes);
    const momentum = this.momentum(closes, 10);

    return {
      sma_short: Number(smaShort.toFixed(2)),
      sma_long: Number(smaLong.toFixed(2)),
      rsi: Number(rsi.toFixed(2)),
      volatility: Number(volatility.toFixed(2)),
      momentum: Number(momentum.toFixed(2)),
    };
  }

  private deriveDecision(indicators: TechnicalIndicators, marketData: MarketDataResult) {
    const diff = indicators.sma_short - indicators.sma_long;
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let reasoning = 'Moving averages are aligned, suggesting neutral momentum.';
    let confidence = Math.min(Math.abs(diff) / (marketData.latestPrice || 1), 1);

    if (diff > 0.5) {
      action = 'buy';
      reasoning = 'Short-term momentum is above long-term trend, indicating bullish sentiment.';
    } else if (diff < -0.5) {
      action = 'sell';
      reasoning = 'Short-term momentum has crossed below long-term trend, signalling weakness.';
    }

    if (indicators.rsi > 70) {
      action = 'sell';
      reasoning = 'RSI indicates overbought conditions; a pullback is likely.';
    } else if (indicators.rsi < 30) {
      action = 'buy';
      reasoning = 'RSI indicates oversold conditions; a rebound is likely.';
    }

    const riskLevel = indicators.volatility > 35 ? 'high' : indicators.volatility > 20 ? 'medium' : 'low';
    confidence = Number(Math.min(Math.max(confidence, 0.1), 0.95).toFixed(2));

    return { action, confidence, reasoning, riskLevel };
  }

  private buildRiskAssessment(indicators: TechnicalIndicators, marketData: MarketDataResult) {
    return {
      volatility: indicators.volatility,
      recentTrend: indicators.momentum,
      lastUpdated: marketData.timestamp,
      notes: indicators.volatility > 35 ? 'Price action is highly volatile.' : 'Volatility is manageable.',
    };
  }

  private simpleMovingAverage(values: number[], period: number): number {
    if (values.length < period) {
      return values[values.length - 1] ?? 0;
    }

    const subset = values.slice(-period);
    const sum = subset.reduce((acc, value) => acc + value, 0);
    return sum / subset.length;
  }

  private relativeStrengthIndex(values: number[], period: number): number {
    if (values.length <= period) {
      return 50;
    }

    let gains = 0;
    let losses = 0;

    for (let i = values.length - period; i < values.length; i += 1) {
      const delta = values[i] - values[i - 1];
      if (delta > 0) {
        gains += delta;
      } else {
        losses += Math.abs(delta);
      }
    }

    const averageGain = gains / period;
    const averageLoss = losses / period || 1;
    const rs = averageGain / averageLoss;
    return 100 - 100 / (1 + rs);
  }

  private annualizedVolatility(values: number[]): number {
    if (values.length < 2) {
      return 0;
    }

    const returns = [] as number[];
    for (let i = 1; i < values.length; i += 1) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }

    const mean = returns.reduce((acc, value) => acc + value, 0) / returns.length;
    const variance = returns.reduce((acc, value) => acc + (value - mean) ** 2, 0) / returns.length;
    const dailyVol = Math.sqrt(variance);
    return dailyVol * Math.sqrt(252) * 100;
  }

  private momentum(values: number[], lookback: number): number {
    if (values.length <= lookback) {
      return 0;
    }

    const latest = values[values.length - 1];
    const previous = values[values.length - lookback - 1];
    return ((latest - previous) / previous) * 100;
  }
}
