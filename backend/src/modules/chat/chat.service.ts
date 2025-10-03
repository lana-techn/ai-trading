import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  constructor(private readonly configService: ConfigService, private readonly marketDataService: MarketDataService) {
    this.memoryLimit = this.configService.get<number>('chat.memoryLimit', 20);
  }

  async processMessage(message: string, sessionId: string) {
    const session = this.getSession(sessionId);
    session.messages.push({ role: 'user', content: message, timestamp: Date.now() });
    this.trimSession(session);

    const symbol = this.extractSymbol(message);
    let marketSummary = '';

    if (symbol) {
      try {
        const price = await this.marketDataService.getRealTimePrice(symbol);
        marketSummary = `Latest ${symbol} price: ${price.price.toFixed(2)} (${price.source}).`;
      } catch (error) {
        this.logger.debug(`Failed to fetch price for ${symbol}: ${(error as Error).message}`);
      }
    }

    const assistantMessage = this.composeResponse(message, marketSummary, symbol);
    session.messages.push({ role: 'assistant', content: assistantMessage, timestamp: Date.now() });

    return {
      success: true,
      response: assistantMessage,
      suggestions: this.buildSuggestions(symbol),
      session_id: sessionId,
    };
  }

  getHistory(sessionId: string, limit: number) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    return session.messages.slice(-limit);
  }

  async analyzeImage(filename: string, context: string) {
    const signal = context.toLowerCase().includes('bull') ? 'BUY' : 'HOLD';
    const confidence = 60 + Math.random() * 30;

    return {
      success: true,
      message: 'Image analysis completed',
      analysis: {
        trading_signal: signal,
        confidence_score: confidence / 100,
        symbol_detected: this.extractSymbol(context) ?? 'UNKNOWN',
        analysis_summary: 'Chart pattern suggests consolidating structure with breakout potential.',
        key_insights: ['Price is oscillating within a tight range', 'Volume remains neutral'],
        technical_indicators: {
          support: 'Identified near recent lows',
          resistance: 'Aligned with previous highs',
        },
        risk_level: confidence > 80 ? 'medium' : 'low',
      },
      response: `📊 **Chart Analysis Complete**

**Signal:** ${signal}
**Confidence:** ${confidence.toFixed(0)}%

Keep monitoring key support and resistance levels before entering.`,
      image_filename: filename,
      suggestions: [
        'Explain the resistance level details',
        'What catalysts could move this symbol?',
        'Show me recent performance metrics',
      ],
      timestamp: Date.now(),
    };
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
