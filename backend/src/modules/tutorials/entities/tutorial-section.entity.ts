import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Tutorial } from './tutorial.entity';

@Entity({ name: 'sections' })
@Index(['tutorial', 'slug'], { unique: true })
export class TutorialSection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tutorial, tutorial => tutorial.sections, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  tutorial!: Tutorial;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 100 })
  slug!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'content_type', length: 20, default: 'markdown' })
  contentType!: string;

  @Column({ name: 'order_index', type: 'integer', default: 0 })
  orderIndex!: number;

  @Column({ name: 'is_visible', default: true })
  isVisible!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
