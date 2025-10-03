import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TutorialSection } from './tutorial-section.entity';
import { Tutorial } from './tutorial.entity';

@Entity({ name: 'tutorial_analytics' })
export class TutorialAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tutorial, tutorial => tutorial.analytics, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  tutorial!: Tutorial;

  @ManyToOne(() => TutorialSection, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  section?: TutorialSection | null;

  @Column({ name: 'view_count', type: 'integer', default: 0 })
  viewCount!: number;

  @Column({ name: 'unique_visitors', type: 'integer', default: 0 })
  uniqueVisitors!: number;

  @Column({ name: 'avg_read_time', type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgReadTime?: number | null;

  @Column({ name: 'bounce_rate', type: 'decimal', precision: 4, scale: 2, nullable: true })
  bounceRate?: number | null;

  @Column({ name: 'last_viewed_at', type: 'datetime', nullable: true })
  lastViewedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
