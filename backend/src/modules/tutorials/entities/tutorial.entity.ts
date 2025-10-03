import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TutorialAnalytics } from './tutorial-analytics.entity';
import { TutorialSection } from './tutorial-section.entity';
import { TutorialTag } from './tutorial-tag.entity';

@Entity({ name: 'tutorials' })
@Index(['status', 'category'])
export class Tutorial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 100 })
  category!: string;

  @Column({ name: 'difficulty_level', length: 20, default: 'beginner' })
  difficultyLevel!: string;

  @Column({ name: 'estimated_read_time', type: 'integer', nullable: true })
  estimatedReadTime?: number | null;

  @Column({ name: 'order_index', type: 'integer', default: 0 })
  orderIndex!: number;

  @Column({ length: 20, default: 'published' })
  status!: string;

  @Column({ name: 'meta_keywords', type: 'simple-array', nullable: true })
  metaKeywords?: string[] | null;

  @Column({ default: 'AI Trading Agent' })
  author!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt?: Date | null;

  @OneToMany(() => TutorialSection, section => section.tutorial, { cascade: true })
  sections?: TutorialSection[];

  @ManyToMany(() => TutorialTag, tag => tag.tutorials, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'tutorial_tag_relations',
    joinColumn: { name: 'tutorial_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: TutorialTag[];

  @OneToMany(() => TutorialAnalytics, analytics => analytics.tutorial, { cascade: true })
  analytics?: TutorialAnalytics[];
}
