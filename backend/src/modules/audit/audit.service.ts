import { Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';

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

  constructor(private readonly supabaseService: SupabaseService) {}

  async logAiDecision(entry: AiDecisionLog): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    if (!supabase) {
      this.logger.warn('Supabase client not available - skipping audit log');
      return;
    }
    
    const record = {
      symbol: entry.symbol,
      action: entry.action,
      confidence: entry.confidence,
      risk_level: entry.riskLevel,
      models_used: entry.modelsUsed ?? null,
      execution_time_ms: entry.executionTimeMs ?? 0,
      metadata: entry.metadata ?? null,
    };

    const { error } = await supabase
      .from('ai_decisions')
      .insert(record);

    if (error) {
      this.logger.error(`Failed to log decision: ${error.message}`);
      throw error;
    }

    this.logger.log(
      `Decision logged for ${entry.symbol}: ${entry.action} (${(entry.confidence * 100).toFixed(1)}% confidence)`,
    );
  }

  async recentDecisions(limit = 20): Promise<any[]> {
    const supabase = this.supabaseService.getClient();
    
    if (!supabase) {
      this.logger.warn('Supabase client not available');
      return [];
    }
    
    const { data, error } = await supabase
      .from('ai_decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error(`Failed to fetch recent decisions: ${error.message}`);
      throw error;
    }

    return data || [];
  }
}
