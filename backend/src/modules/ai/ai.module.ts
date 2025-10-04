import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './services/gemini.service';
import { QwenService } from './services/qwen.service';
import { AgentRouterService } from './services/agent-router.service';

@Module({
  imports: [ConfigModule],
  providers: [GeminiService, QwenService, AgentRouterService],
  exports: [GeminiService, QwenService, AgentRouterService],
})
export class AiModule {}
