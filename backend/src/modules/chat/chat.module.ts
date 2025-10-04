import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiModule } from '../ai/ai.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [ConfigModule, AiModule, MarketDataModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
