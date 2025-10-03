import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ai_decisions' })
export class AiDecision {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 32 })
  symbol!: string;

  @Column({ length: 16 })
  action!: string;

  @Column({ type: 'float' })
  confidence!: number;

  @Column({ name: 'risk_level', length: 16 })
  riskLevel!: string;

  @Column({ name: 'models_used', type: 'simple-array', nullable: true })
  modelsUsed?: string[] | null;

  @Column({ name: 'execution_time_ms', type: 'float', default: 0 })
  executionTimeMs!: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
