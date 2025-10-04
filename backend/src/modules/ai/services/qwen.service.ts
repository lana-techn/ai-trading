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
}
