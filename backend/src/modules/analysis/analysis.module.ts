import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [MarketDataModule, AuditModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
