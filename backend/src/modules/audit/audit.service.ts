import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiDecision } from './entities/ai-decision.entity';

export interface AiDecisionLog {
  symbol: string;
  action: string;
  confidence: number;
  riskLevel: string;
  modelsUsed?: string[];
  executionTimeMs?: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectRepository(AiDecision) private readonly decisionRepo: Repository<AiDecision>) {}

  async logAiDecision(entry: AiDecisionLog): Promise<void> {
    const record = this.decisionRepo.create({
      symbol: entry.symbol,
      action: entry.action,
      confidence: entry.confidence,
      riskLevel: entry.riskLevel,
      modelsUsed: entry.modelsUsed ?? null,
      executionTimeMs: entry.executionTimeMs ?? 0,
      metadata: entry.metadata ?? null,
    });

    await this.decisionRepo.save(record);
    this.logger.log(
      `Decision logged for ${entry.symbol}: ${entry.action} (${(entry.confidence * 100).toFixed(1)}% confidence)`,
    );
  }

  async recentDecisions(limit = 20): Promise<AiDecision[]> {
    return this.decisionRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
