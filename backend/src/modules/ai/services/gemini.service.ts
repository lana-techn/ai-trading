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

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      this.logger.warn('Gemini API key not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
  }

  async chat(
    message: string,
    conversationHistory: GeminiChatMessage[] = [],
    systemContext?: string,
  ): Promise<GeminiChatResponse> {
    try {
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

      return {
        success: true,
        response,
      };
    } catch (error) {
      this.logger.error('Gemini chat error:', error);
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
}
