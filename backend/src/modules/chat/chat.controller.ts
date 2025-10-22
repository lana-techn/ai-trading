import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { ChatService, ChatMessage } from './chat.service';

class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
  
  @IsString()
  @IsOptional()
  session_id?: string;
}

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChat(@Body() body: ChatRequestDto) {
    try {
      if (!body || typeof body !== 'object') {
        throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
      }
      
      const message = body.message?.trim();
      if (!message) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }

      const sessionId = body.session_id ?? 'default';
      return await this.chatService.processMessage(message, sessionId);
    } catch (error) {
      this.logger.error('Error processing chat message:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to process message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('session_id') sessionId = 'default',
    @Body('additional_context') additionalContext = '',
  ) {
    try {
      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }

      const analysis = await this.chatService.analyzeImage(file.originalname ?? 'chart.png', additionalContext);
      return {
        ...analysis,
        session_id: sessionId,
      };
    } catch (error) {
      this.logger.error('Error analyzing image:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to analyze image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('history/:sessionId')
  async history(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit = '50',
  ): Promise<{
    success: boolean;
    session_id: string;
    messages: ChatMessage[];
    total_count: number;
  }> {
    try {
      const parsedLimit = Math.min(Number(limit) || 50, 100);
      return {
        success: true,
        session_id: sessionId,
        messages: this.chatService.getHistory(sessionId, parsedLimit),
        total_count: parsedLimit,
      };
    } catch (error) {
      this.logger.error('Error fetching chat history:', error);
      throw new HttpException('Failed to fetch chat history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
