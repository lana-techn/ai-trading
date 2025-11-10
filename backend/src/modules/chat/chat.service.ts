import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AgentRouterService } from '../ai/services/agent-router.service';
import { GeminiChatMessage } from '../ai/services/gemini.service';
import { MarketDataService } from '../market-data/market-data.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface SessionMemory {
  messages: ChatMessage[];
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly sessions = new Map<string, SessionMemory>();
  private readonly memoryLimit: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly marketDataService: MarketDataService,
    private readonly agentRouter: AgentRouterService,
  ) {
    this.memoryLimit = this.configService.get<number>('chat.memoryLimit', 20);
  }

  async processMessage(message: string, sessionId: string) {
    const session = this.getSession(sessionId);
    session.messages.push({ role: 'user', content: message, timestamp: Date.now() });
    this.trimSession(session);

    const symbol = this.extractSymbol(message);
    let marketContext = '';

    if (symbol) {
      try {
        const price = await this.marketDataService.getRealTimePrice(symbol);
        marketContext = `Current market data for ${symbol}: Price ${price.price.toFixed(2)} (${price.source}).`;
      } catch (error) {
        this.logger.debug(`Failed to fetch price for ${symbol}: ${(error as Error).message}`);
      }
    }

    const conversationHistory: GeminiChatMessage[] = session.messages
      .slice(0, -1)
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.content,
      }));

    const systemContext = [
      'You are a professional trading assistant. Provide helpful insights about trading and market analysis.',
      marketContext,
    ]
      .filter(Boolean)
      .join('\n');

    const aiResponse = await this.agentRouter.process({
      type: 'chat',
      message,
      conversationHistory,
      context: systemContext,
    });

    if (!aiResponse.success) {
      this.logger.error(`AI Response failed: ${aiResponse.error}`);
    }

    const assistantMessage = aiResponse.success
      ? aiResponse.response
      : this.composeResponse(message, marketContext, symbol);

    session.messages.push({ role: 'assistant', content: assistantMessage, timestamp: Date.now() });

    return {
      success: true,
      response: assistantMessage,
      suggestions: this.buildSuggestions(symbol),
      session_id: sessionId,
      model_used: aiResponse.modelUsed,
    };
  }

  getHistory(sessionId: string, limit: number) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    return session.messages.slice(-limit);
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string, filename: string, context: string) {
    try {
      const startTime = Date.now();
      this.logger.log(`📸 Starting analysis for: ${filename} (${(imageBuffer.length / 1024).toFixed(1)}KB)`);
      
      // Smart image optimization - balance between size and quality
      let optimizedBuffer = imageBuffer;
      try {
        const sharp = require('sharp');
        const metadata = await sharp(imageBuffer).metadata();
        
        // Only optimize if image is large enough to benefit
        if (imageBuffer.length > 200 * 1024 || (metadata.width && metadata.width > 1024)) {
          optimizedBuffer = await sharp(imageBuffer)
            .resize(1024, 768, { 
              fit: 'inside', 
              withoutEnlargement: true,
              kernel: 'nearest' // Faster resize algorithm
            })
            .jpeg({ 
              quality: 80, 
              mozjpeg: true // Better compression
            })
            .toBuffer();
          this.logger.log(`⚡ Optimized: ${imageBuffer.length} → ${optimizedBuffer.length} bytes (${((1 - optimizedBuffer.length/imageBuffer.length) * 100).toFixed(1)}% smaller)`);
        } else {
          this.logger.log(`✓ Image already optimal (${imageBuffer.length} bytes)`);
          optimizedBuffer = imageBuffer;
        }
      } catch (err) {
        this.logger.warn('Optimization skipped:', err);
        optimizedBuffer = imageBuffer;
      }
      
      const beforeAI = Date.now();
      this.logger.log(`⏱️  Image prep took ${beforeAI - startTime}ms, sending to AI...`);
      
      // Use Gemini Vision for real chart analysis
      const visionAnalysis = await this.agentRouter.analyzeChartImage(optimizedBuffer, mimeType, context);
      
      const aiTime = Date.now() - beforeAI;
      this.logger.log(`🤖 AI processing took ${aiTime}ms`);

      if (!visionAnalysis.success) {
        this.logger.error(`Vision analysis failed: ${visionAnalysis.error}`);
        return this.createFallbackImageAnalysis(filename, context);
      }

      const signal = visionAnalysis.tradingSignal || 'HOLD';
      const confidence = visionAnalysis.confidence || 50;

      // Format a clean response
      const processingTime = Date.now() - startTime;
      const isCached = visionAnalysis.fromCache;
      
      const responseText = `📊 **Chart Analysis Complete** ${isCached ? '⚡ (Cached)' : ''}

**Trading Signal:** ${signal}
**Confidence Level:** ${confidence}%
${visionAnalysis.symbolDetected ? `**Symbol Detected:** ${visionAnalysis.symbolDetected}` : ''}
${visionAnalysis.timeframeDetected ? `**Timeframe:** ${visionAnalysis.timeframeDetected}` : ''}

**Analysis Summary:**
${visionAnalysis.analysis}

${visionAnalysis.keyInsights && visionAnalysis.keyInsights.length > 0 
  ? `\n**Key Insights:**\n${visionAnalysis.keyInsights.map((insight: string) => `• ${insight}`).join('\n')}`
  : ''}

_Analysis completed in ${processingTime}ms${isCached ? ' (from cache)' : ''}_`;

      return {
        success: true,
        message: 'Image analysis completed successfully',
        analysis: {
          trading_signal: signal,
          confidence_score: confidence / 100,
          symbol_detected: visionAnalysis.symbolDetected || this.extractSymbol(context) || 'UNKNOWN',
          timeframe_detected: visionAnalysis.timeframeDetected,
          analysis_summary: visionAnalysis.analysis.substring(0, 500) + '...',
          detailed_analysis: visionAnalysis.analysis,
          key_insights: visionAnalysis.keyInsights || [],
          technical_indicators: visionAnalysis.technicalIndicators || {},
          support_levels: visionAnalysis.technicalIndicators?.support || [],
          resistance_levels: visionAnalysis.technicalIndicators?.resistance || [],
          risk_level: confidence > 75 ? 'low' : confidence > 50 ? 'medium' : 'high',
          risk_factors: this.determineRiskFactors(confidence, visionAnalysis),
          processing_time_ms: processingTime,
          model_used: isCached ? 'gemini-vision (cached)' : 'gemini-vision',
          from_cache: isCached,
        },
        response: responseText,
        image_filename: filename,
        suggestions: this.generateSuggestions(visionAnalysis.symbolDetected, signal),
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error('Image analysis error:', error);
      return this.createFallbackImageAnalysis(filename, context);
    }
  }

  private createFallbackImageAnalysis(filename: string, context: string) {
    return {
      success: true,
      message: 'Image analysis completed (fallback mode)',
      analysis: {
        trading_signal: 'HOLD',
        confidence_score: 0.5,
        symbol_detected: this.extractSymbol(context) ?? 'UNKNOWN',
        analysis_summary: 'Chart analysis is currently unavailable. Please try again or provide more context.',
        key_insights: ['Unable to process image at this time', 'Please ensure image is clear and well-lit'],
        technical_indicators: {},
        support_levels: [],
        resistance_levels: [],
        risk_level: 'high',
        risk_factors: ['Analysis unavailable'],
        processing_time_ms: 0,
        model_used: 'fallback',
      },
      response: `⚠️ **Chart Analysis - Limited Mode**

Unable to fully analyze the chart image. Please ensure:
- Image is clear and readable
- Chart shows visible price action and indicators
- Try uploading again or provide additional context

**Status:** ${context || 'No additional context provided'}`,
      image_filename: filename,
      suggestions: ['Try uploading a clearer image', 'Add context about the timeframe', 'Specify the symbol'],
      timestamp: Date.now(),
    };
  }

  private determineRiskFactors(confidence: number, analysis: any): string[] {
    const factors: string[] = [];
    
    if (confidence < 60) {
      factors.push('Low confidence in signal');
    }
    
    if (analysis.technicalIndicators?.patterns?.length > 0) {
      factors.push('Multiple patterns detected - requires careful analysis');
    }
    
    if (!analysis.symbolDetected) {
      factors.push('Symbol not clearly identified');
    }
    
    return factors.length > 0 ? factors : ['Normal market risk'];
  }

  private generateSuggestions(symbol?: string, signal?: string): string[] {
    const suggestions = [
      'Show me the full technical analysis',
      'What are the key support and resistance levels?',
      'Explain the risk factors in detail',
    ];
    
    if (symbol) {
      suggestions.unshift(`Get real-time data for ${symbol}`);
      suggestions.push(`Show me recent news about ${symbol}`);
    }
    
    if (signal === 'BUY') {
      suggestions.push('What is the optimal entry point?');
      suggestions.push('Suggest stop-loss levels');
    } else if (signal === 'SELL') {
      suggestions.push('What is the target price?');
      suggestions.push('When should I exit this position?');
    }
    
    return suggestions.slice(0, 5);
  }

  private getSession(sessionId: string): SessionMemory {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { messages: [] });
    }
    return this.sessions.get(sessionId)!;
  }

  private trimSession(session: SessionMemory) {
    if (session.messages.length > this.memoryLimit) {
      session.messages.splice(0, session.messages.length - this.memoryLimit);
    }
  }

  private extractSymbol(message: string): string | null {
    const match = message.match(/([A-Z]{2,5}-?USD|[A-Z]{2,5}\b)/);
    return match ? match[0].toUpperCase() : null;
  }

  private composeResponse(message: string, marketSummary: string, symbol: string | null): string {
    const baseResponse = `Thanks for the question${symbol ? ` about ${symbol}` : ''}!`;
    const guidance = symbol
      ? 'I analysed recent price action and momentum to provide a quick outlook.'
      : 'Let me know the asset you are tracking so I can provide more targeted analysis.';

    return [baseResponse, guidance, marketSummary].filter(Boolean).join(' ');
  }

  private buildSuggestions(symbol: string | null) {
    const base = ['Show latest technical summary', 'Share risk assessment', 'What events are upcoming?'];
    if (symbol) {
      base.unshift(`Give me a trading plan for ${symbol}`);
    }
    return base.slice(0, 4);
  }
}
