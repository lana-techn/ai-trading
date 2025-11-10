import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as crypto from 'crypto';

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
  // Simple in-memory cache for image analysis (expires after 5 minutes)
  private readonly analysisCache = new Map<string, { result: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      this.logger.warn('Gemini API key not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    // Using gemini-pro for text chat (stable, proven model)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    // Using gemini-pro-vision for vision (legacy but stable and well-supported)
    this.visionModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro-vision',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1536,
      },
    });
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
      // Generate cache key based on image content
      const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex');
      const cacheKey = `${imageHash}-${additionalContext || 'default'}`;
      
      // Check cache first
      const cached = this.analysisCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        this.logger.debug(`Using cached analysis for image ${imageHash.substring(0, 8)}`);
        return { ...cached.result, fromCache: true };
      }
      
      const analysisStartTime = Date.now();
      this.logger.log(`🚀 Starting Gemini 1.5 Flash vision analysis (image: ${imageBuffer.length} bytes)`);
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Ultra-optimized prompt for fastest processing
      const prompt = `Quick trading chart analysis. ${additionalContext || ''}

Provide:
1. Symbol & timeframe
2. Trend & trading signal (BUY/SELL/HOLD)
3. Confidence %
4. Top 3 key insights (bullets)
5. Support/resistance levels

Be concise.`;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = result.response.text();

      const apiCallTime = Date.now() - analysisStartTime;
      this.logger.log(`✅ Gemini analysis completed in ${apiCallTime}ms`);

      // Parse the analysis to extract structured data
      const parsed = this.parseChartAnalysis(response);

      const analysisResult = {
        success: true,
        analysis: response,
        ...parsed,
      };
      
      // Cache the result
      this.analysisCache.set(cacheKey, {
        result: analysisResult,
        timestamp: Date.now(),
      });
      
      // Clean up old cache entries (keep only last 50)
      if (this.analysisCache.size > 50) {
        const oldestKey = this.analysisCache.keys().next().value;
        if (oldestKey) {
          this.analysisCache.delete(oldestKey);
        }
      }

      return analysisResult;
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
    // Use pre-compiled regex patterns for better performance
    const lowerAnalysis = analysis.toLowerCase();
    
    // Extract trading signal (optimized with direct string checks)
    let tradingSignal: 'BUY' | 'SELL' | 'HOLD' | undefined;
    if (/\b(buy|long|bullish signal)\b/.test(lowerAnalysis)) {
      tradingSignal = 'BUY';
    } else if (/\b(sell|short|bearish signal)\b/.test(lowerAnalysis)) {
      tradingSignal = 'SELL';
    } else if (/\b(hold|neutral|wait)\b/.test(lowerAnalysis)) {
      tradingSignal = 'HOLD';
    }

    // Extract confidence score (single regex)
    const confidence = parseInt(analysis.match(/confidence[:\s]+(\d+)%?/i)?.[1] || '0', 10) || undefined;

    // Extract key insights (optimized)
    const keyInsights = (analysis.match(/[-•*]\s*(.+?)(?=\n|$)/g) || [])
      .map(point => point.replace(/^[-•*]\s*/, '').trim())
      .filter(point => point.length > 10 && point.length < 200)
      .slice(0, 5);

    // Extract symbol (single regex)
    const symbolDetected = analysis.match(/\b([A-Z]{3,5}[-/]?(?:USD|USDT)?|[A-Z]{2,4})\b/)?.[0];

    // Extract timeframe (single regex)
    const timeframeDetected = analysis.match(/(\d+[mhd]|daily|hourly|weekly|monthly|minute|hour|day|week|month)/i)?.[0];

    // Extract support/resistance levels (optimized with single pass)
    const supportLevels = Array.from(analysis.matchAll(/support[:\s]+([0-9,.\s]+)/gi), m => m[1].trim());
    const resistanceLevels = Array.from(analysis.matchAll(/resistance[:\s]+([0-9,.\s]+)/gi), m => m[1].trim());

    // Extract trend (optimized)
    let trend: string | undefined;
    if (/uptrend|bullish trend/i.test(lowerAnalysis)) {
      trend = 'Bullish/Uptrend';
    } else if (/downtrend|bearish trend/i.test(lowerAnalysis)) {
      trend = 'Bearish/Downtrend';
    } else if (/sideways|ranging/i.test(lowerAnalysis)) {
      trend = 'Sideways/Ranging';
    }

    // Extract patterns (optimized with single regex)
    const patternRegex = /head and shoulders|double top|double bottom|triangle|wedge|channel|flag|pennant|cup and handle/gi;
    const patterns = Array.from(new Set(
      (lowerAnalysis.match(patternRegex) || [])
        .map(p => p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    ));

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
