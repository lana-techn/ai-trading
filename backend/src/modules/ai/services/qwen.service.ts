import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface QwenAnalysisRequest {
  chartData: any;
  technicalIndicators: any;
  symbol: string;
  timeframe: string;
}

export interface QwenAnalysisResponse {
  success: boolean;
  analysis: string;
  tradingSignal?: 'buy' | 'sell' | 'hold';
  confidence?: number;
  keyInsights?: string[];
  error?: string;
}

export interface QwenImageAnalysisResponse {
  success: boolean;
  analysis: string;
  tradingSignal?: 'BUY' | 'SELL' | 'HOLD';
  confidence?: number;
  keyInsights?: string[];
  symbolDetected?: string;
  timeframeDetected?: string;
  technicalIndicators?: {
    support?: string[];
    resistance?: string[];
    trend?: string;
    patterns?: string[];
  };
  error?: string;
}

@Injectable()
export class QwenService {
  private readonly logger = new Logger(QwenService.name);
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.openRouterApiKey');
    const baseURL = 'https://openrouter.ai/api/v1';

    if (!apiKey) {
      this.logger.warn('OpenRouter API key not configured');
    }

    this.client = new OpenAI({
      apiKey: apiKey || '',
      baseURL,
      defaultHeaders: {
        'HTTP-Referer': 'https://trader-ai-agent.local',
        'X-Title': 'Trader AI Agent',
      },
    });
  }

  async analyzeChart(request: QwenAnalysisRequest): Promise<QwenAnalysisResponse> {
    try {
      const prompt = this.buildChartAnalysisPrompt(request);

      const completion = await this.client.chat.completions.create({
        model: 'qwen/qwen3-coder:free',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional trading analyst. Analyze the provided chart data and technical indicators to provide trading insights. Be concise and provide actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const analysis = completion.choices[0]?.message?.content || '';
      const { signal, confidence, insights } = this.parseAnalysis(analysis);

      return {
        success: true,
        analysis,
        tradingSignal: signal,
        confidence,
        keyInsights: insights,
      };
    } catch (error) {
      this.logger.error('Qwen analysis error:', error);
      return {
        success: false,
        analysis: '',
        error: (error as Error).message,
      };
    }
  }

  private buildChartAnalysisPrompt(request: QwenAnalysisRequest): string {
    return `Analyze the following trading data for ${request.symbol} (${request.timeframe} timeframe):

Technical Indicators:
${JSON.stringify(request.technicalIndicators, null, 2)}

Chart Data Summary:
${JSON.stringify(request.chartData, null, 2)}

Please provide:
1. Overall trend analysis
2. Trading signal (BUY/SELL/HOLD) with confidence level (0-100%)
3. Key insights (3-5 bullet points)
4. Risk assessment

Format your response clearly with sections.`;
  }

  private parseAnalysis(analysis: string): {
    signal: 'buy' | 'sell' | 'hold';
    confidence: number;
    insights: string[];
  } {
    let signal: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 50;
    const insights: string[] = [];

    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes('buy') || lowerAnalysis.includes('bullish')) {
      signal = 'buy';
    } else if (lowerAnalysis.includes('sell') || lowerAnalysis.includes('bearish')) {
      signal = 'sell';
    }

    const confidenceMatch = analysis.match(/confidence[:\s]+(\d+)%?/i);
    if (confidenceMatch) {
      confidence = parseInt(confidenceMatch[1], 10);
    }

    const bulletPoints = analysis.match(/[-•]\s*(.+)/g);
    if (bulletPoints) {
      insights.push(...bulletPoints.map(point => point.replace(/[-•]\s*/, '').trim()).slice(0, 5));
    }

    return { signal, confidence, insights };
  }

  async chat(message: string, context?: string): Promise<{ success: boolean; response: string; error?: string }> {
    try {
      const systemMessage = context || 'You are a helpful trading assistant.';

      const completion = await this.client.chat.completions.create({
        model: 'qwen/qwen3-coder:free',
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || '';

      return {
        success: true,
        response,
      };
    } catch (error) {
      this.logger.error('Qwen chat error:', error);
      return {
        success: false,
        response: '',
        error: (error as Error).message,
      };
    }
  }

  async analyzeChartImage(
    imageBuffer: Buffer,
    mimeType: string,
    additionalContext?: string,
  ): Promise<QwenImageAnalysisResponse> {
    try {
      this.logger.debug('Starting chart image analysis with Qwen Vision via OpenRouter');
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Construct detailed prompt for trading chart analysis
      const prompt = `You are a professional trading analyst. Analyze this trading chart image in detail.

${additionalContext ? `Additional Context: ${additionalContext}\n` : ''}
Please provide a comprehensive analysis including:

1. **Symbol & Timeframe Detection**: What asset/symbol and timeframe is shown (if visible)
2. **Trend Analysis**: Current trend (bullish/bearish/neutral), trend strength
3. **Technical Patterns**: Identify any chart patterns (head & shoulders, triangles, channels, flags, etc.)
4. **Support & Resistance**: Key support and resistance levels visible on the chart
5. **Technical Indicators**: Analyze any visible indicators (moving averages, RSI, MACD, Bollinger Bands, volume, etc.)
6. **Price Action**: Analyze candlestick patterns, breakouts, or consolidation
7. **Trading Signal**: Provide a clear trading recommendation (BUY/SELL/HOLD)
8. **Confidence Score**: Rate your confidence in the analysis (0-100%)
9. **Key Insights**: 3-5 actionable bullet points for traders
10. **Risk Assessment**: Potential risks, stop-loss suggestions, and risk/reward ratio

Format your response in clear sections with headers.`;

      // Use Qwen VL model (Vision-Language) via OpenRouter
      const completion = await this.client.chat.completions.create({
        model: 'qwen/qwen-2-vl-72b-instruct', // Qwen's vision model
        messages: [
          {
            role: 'system',
            content: 'You are a professional trading analyst specialized in technical chart analysis. Provide detailed, accurate analysis based on what you see in the chart.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const analysis = completion.choices[0]?.message?.content || '';

      this.logger.debug(`Qwen Vision analysis complete: ${analysis.substring(0, 100)}...`);

      // Parse the analysis to extract structured data
      const parsed = this.parseImageAnalysis(analysis);

      return {
        success: true,
        analysis,
        ...parsed,
      };
    } catch (error) {
      this.logger.error('Qwen Vision analysis error:', error);
      this.logger.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      return {
        success: false,
        analysis: '',
        error: (error as Error).message,
      };
    }
  }

  private parseImageAnalysis(analysis: string): {
    tradingSignal?: 'BUY' | 'SELL' | 'HOLD';
    confidence?: number;
    keyInsights?: string[];
    symbolDetected?: string;
    timeframeDetected?: string;
    technicalIndicators?: {
      support?: string[];
      resistance?: string[];
      trend?: string;
      patterns?: string[];
    };
  } {
    const lowerAnalysis = analysis.toLowerCase();
    
    // Extract trading signal
    let tradingSignal: 'BUY' | 'SELL' | 'HOLD' | undefined;
    if (lowerAnalysis.includes('buy') || lowerAnalysis.includes('long') || lowerAnalysis.includes('bullish signal')) {
      tradingSignal = 'BUY';
    } else if (lowerAnalysis.includes('sell') || lowerAnalysis.includes('short') || lowerAnalysis.includes('bearish signal')) {
      tradingSignal = 'SELL';
    } else if (lowerAnalysis.includes('hold') || lowerAnalysis.includes('neutral') || lowerAnalysis.includes('wait')) {
      tradingSignal = 'HOLD';
    }

    // Extract confidence score
    let confidence: number | undefined;
    const confidenceMatch = analysis.match(/confidence[:\s]+(\d+)%?/i);
    if (confidenceMatch) {
      confidence = parseInt(confidenceMatch[1], 10);
    }

    // Extract key insights (bullet points)
    const keyInsights: string[] = [];
    const bulletPoints = analysis.match(/[-•*]\s*(.+?)(?=\n|$)/g);
    if (bulletPoints) {
      keyInsights.push(
        ...bulletPoints
          .map(point => point.replace(/^[-•*]\s*/, '').trim())
          .filter(point => point.length > 10 && point.length < 200)
          .slice(0, 5)
      );
    }

    // Extract symbol (common patterns: BTC/USD, AAPL, EUR/USD, etc.)
    let symbolDetected: string | undefined;
    const symbolMatch = analysis.match(/\b([A-Z]{3,5}[-/]?(?:USD|USDT)?|[A-Z]{2,4})\b/);
    if (symbolMatch) {
      symbolDetected = symbolMatch[0];
    }

    // Extract timeframe
    let timeframeDetected: string | undefined;
    const timeframeMatch = analysis.match(/(\d+[mhd]|daily|hourly|weekly|monthly|minute|hour|day|week|month)/i);
    if (timeframeMatch) {
      timeframeDetected = timeframeMatch[0];
    }

    // Extract support/resistance levels
    const supportLevels: string[] = [];
    const resistanceLevels: string[] = [];
    const supportMatches = analysis.matchAll(/support[:\s]+([0-9,.\s]+)/gi);
    for (const match of supportMatches) {
      supportLevels.push(match[1].trim());
    }
    const resistanceMatches = analysis.matchAll(/resistance[:\s]+([0-9,.\s]+)/gi);
    for (const match of resistanceMatches) {
      resistanceLevels.push(match[1].trim());
    }

    // Extract trend
    let trend: string | undefined;
    if (lowerAnalysis.includes('uptrend') || lowerAnalysis.includes('bullish trend')) {
      trend = 'Bullish/Uptrend';
    } else if (lowerAnalysis.includes('downtrend') || lowerAnalysis.includes('bearish trend')) {
      trend = 'Bearish/Downtrend';
    } else if (lowerAnalysis.includes('sideways') || lowerAnalysis.includes('ranging')) {
      trend = 'Sideways/Ranging';
    }

    // Extract patterns
    const patterns: string[] = [];
    const patternKeywords = [
      'head and shoulders', 'double top', 'double bottom', 'triangle',
      'wedge', 'channel', 'flag', 'pennant', 'cup and handle', 'ascending triangle',
      'descending triangle', 'symmetrical triangle', 'rising wedge', 'falling wedge'
    ];
    for (const pattern of patternKeywords) {
      if (lowerAnalysis.includes(pattern)) {
        patterns.push(pattern.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    }

    return {
      tradingSignal,
      confidence,
      keyInsights: keyInsights.length > 0 ? keyInsights : undefined,
      symbolDetected,
      timeframeDetected,
      technicalIndicators: {
        support: supportLevels.length > 0 ? supportLevels : undefined,
        resistance: resistanceLevels.length > 0 ? resistanceLevels : undefined,
        trend,
        patterns: patterns.length > 0 ? patterns : undefined,
      },
    };
  }
}
