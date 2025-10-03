import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Tutorial } from './tutorial.entity';

@Entity({ name: 'tutorial_tags' })
export class TutorialTag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ length: 7, default: '#3B82F6' })
  color!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToMany(() => Tutorial, tutorial => tutorial.tags)
  tutorials!: Tutorial[];
}
