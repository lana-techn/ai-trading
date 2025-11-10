import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiChatResponse {
  success: boolean;
  response: string;
  error?: string;
}

export interface GeminiImageAnalysisResponse {
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
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model;
  private readonly visionModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      this.logger.warn('Gemini API key not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    // Using gemini-2.0-flash which is available and fast
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    // Using gemini-pro-vision for image analysis (legacy but stable model)
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  }

  async chat(
    message: string,
    conversationHistory: GeminiChatMessage[] = [],
    systemContext?: string,
  ): Promise<GeminiChatResponse> {
    try {
      this.logger.debug(`Starting Gemini chat with message: ${message.substring(0, 50)}...`);
      
      const chat = this.model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const prompt = systemContext ? `${systemContext}\n\n${message}` : message;
      const result = await chat.sendMessage(prompt);
      const response = result.response.text();

      this.logger.debug(`Gemini response received: ${response.substring(0, 100)}...`);

      return {
        success: true,
        response,
      };
    } catch (error) {
      this.logger.error('Gemini chat error:', error);
      this.logger.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      return {
        success: false,
        response: '',
        error: (error as Error).message,
      };
    }
  }

  async generateContent(prompt: string): Promise<GeminiChatResponse> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        success: true,
        response,
      };
    } catch (error) {
      this.logger.error('Gemini generation error:', error);
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
  ): Promise<GeminiImageAnalysisResponse> {
    try {
      this.logger.debug(`Starting chart image analysis with Gemini Vision`);
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Construct detailed prompt for trading chart analysis
      const prompt = `You are a professional trading analyst. Analyze this trading chart image in detail.

${additionalContext ? `Additional Context: ${additionalContext}\n` : ''}
Please provide a comprehensive analysis including:

1. **Symbol & Timeframe Detection**: What asset/symbol and timeframe is shown (if visible)
2. **Trend Analysis**: Current trend (bullish/bearish/neutral), trend strength
3. **Technical Patterns**: Identify any chart patterns (head & shoulders, triangles, channels, etc.)
4. **Support & Resistance**: Key support and resistance levels visible
5. **Technical Indicators**: Analyze any visible indicators (moving averages, RSI, MACD, volume, etc.)
6. **Trading Signal**: Provide a clear trading recommendation (BUY/SELL/HOLD)
7. **Confidence Score**: Rate your confidence in the analysis (0-100%)
8. **Key Insights**: 3-5 actionable bullet points for traders
9. **Risk Assessment**: Potential risks and stop-loss suggestions

Format your response in a clear, structured way with sections.`;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = result.response.text();

      this.logger.debug(`Gemini Vision analysis complete: ${response.substring(0, 100)}...`);

      // Parse the analysis to extract structured data
      const parsed = this.parseChartAnalysis(response);

      return {
        success: true,
        analysis: response,
        ...parsed,
      };
    } catch (error) {
      this.logger.error('Gemini Vision analysis error:', error);
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

  private parseChartAnalysis(analysis: string): {
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
      'wedge', 'channel', 'flag', 'pennant', 'cup and handle'
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
