import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiDecision } from './entities/ai-decision.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiDecision])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
