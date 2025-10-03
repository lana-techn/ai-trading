import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { ChatService, ChatMessage } from './chat.service';

class ChatRequestDto {
  message!: string;
  session_id?: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChat(@Body() body: ChatRequestDto) {
    const message = body.message?.trim();
    if (!message) {
      return {
        success: false,
        error: 'Message is required',
      };
    }

    const sessionId = body.session_id ?? 'default';
    return this.chatService.processMessage(message, sessionId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('session_id') sessionId = 'default',
    @Body('additional_context') additionalContext = '',
  ) {
    if (!file) {
      return {
        success: false,
        error: 'File is required',
      };
    }

    const analysis = await this.chatService.analyzeImage(file.originalname ?? 'chart.png', additionalContext);
    return {
      ...analysis,
      session_id: sessionId,
    };
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
    const parsedLimit = Math.min(Number(limit) || 50, 100);
    return {
      success: true,
      session_id: sessionId,
      messages: this.chatService.getHistory(sessionId, parsedLimit),
      total_count: parsedLimit,
    };
  }
}
