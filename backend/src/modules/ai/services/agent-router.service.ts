import { Injectable, Logger } from '@nestjs/common';
import { GeminiService, GeminiChatMessage } from './gemini.service';
import { QwenService, QwenAnalysisRequest } from './qwen.service';

export type TaskType = 'chat' | 'chart_analysis' | 'general_analysis';

export interface AgentRequest {
  type: TaskType;
  message?: string;
  conversationHistory?: GeminiChatMessage[];
  chartData?: any;
  technicalIndicators?: any;
  symbol?: string;
  timeframe?: string;
  context?: string;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  modelUsed: 'gemini' | 'qwen';
  data?: any;
  error?: string;
}

@Injectable()
export class AgentRouterService {
  private readonly logger = new Logger(AgentRouterService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly qwenService: QwenService,
  ) {}

  async process(request: AgentRequest): Promise<AgentResponse> {
    this.logger.log(`Routing request to appropriate AI model for task: ${request.type}`);

    try {
      switch (request.type) {
        case 'chat':
          return await this.handleChatTask(request);

        case 'chart_analysis':
          return await this.handleChartAnalysisTask(request);

        case 'general_analysis':
          return await this.handleGeneralAnalysisTask(request);

        default:
          return {
            success: false,
            response: '',
            modelUsed: 'gemini',
            error: `Unknown task type: ${request.type}`,
          };
      }
    } catch (error) {
      this.logger.error('Agent router error:', error);
      return {
        success: false,
        response: '',
        modelUsed: 'gemini',
        error: (error as Error).message,
      };
    }
  }

  private async handleChatTask(request: AgentRequest): Promise<AgentResponse> {
    if (!request.message) {
      return {
        success: false,
        response: '',
        modelUsed: 'gemini',
        error: 'Message is required for chat task',
      };
    }

    const result = await this.geminiService.chat(
      request.message,
      request.conversationHistory || [],
      request.context,
    );

    return {
      success: result.success,
      response: result.response,
      modelUsed: 'gemini',
      error: result.error,
    };
  }

  private async handleChartAnalysisTask(request: AgentRequest): Promise<AgentResponse> {
    if (!request.symbol || !request.technicalIndicators) {
      return {
        success: false,
        response: '',
        modelUsed: 'qwen',
        error: 'Symbol and technical indicators are required for chart analysis',
      };
    }

    const qwenRequest: QwenAnalysisRequest = {
      symbol: request.symbol,
      timeframe: request.timeframe || '1d',
      chartData: request.chartData || {},
      technicalIndicators: request.technicalIndicators,
    };

    const result = await this.qwenService.analyzeChart(qwenRequest);

    return {
      success: result.success,
      response: result.analysis,
      modelUsed: 'qwen',
      data: {
        tradingSignal: result.tradingSignal,
        confidence: result.confidence,
        keyInsights: result.keyInsights,
      },
      error: result.error,
    };
  }

  private async handleGeneralAnalysisTask(request: AgentRequest): Promise<AgentResponse> {
    const isChartRelated = this.isChartRelatedQuery(request.message || '');

    if (isChartRelated && request.technicalIndicators) {
      return await this.handleChartAnalysisTask(request);
    }

    return await this.handleChatTask(request);
  }

  private isChartRelatedQuery(message: string): boolean {
    const chartKeywords = [
      'chart',
      'technical',
      'indicator',
      'trend',
      'analysis',
      'price',
      'support',
      'resistance',
      'pattern',
      'candlestick',
      'moving average',
      'rsi',
      'macd',
      'volume',
    ];

    const lowerMessage = message.toLowerCase();
    return chartKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  async detectTaskType(message: string): Promise<TaskType> {
    if (this.isChartRelatedQuery(message)) {
      return 'chart_analysis';
    }
    return 'chat';
  }
}
