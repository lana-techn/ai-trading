import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { AiModule } from './modules/ai/ai.module';
import { AuditModule } from './modules/audit/audit.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ChatModule } from './modules/chat/chat.module';
import { HealthModule } from './modules/health/health.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { TutorialsModule } from './modules/tutorials/tutorials.module';
import { WebsocketModule } from './modules/websocket/websocket.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AiModule,
    HealthModule,
    AnalysisModule,
    MarketDataModule,
    ChatModule,
    TutorialsModule,
    AuditModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
