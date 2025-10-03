import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ILike, IsNull, Not, Repository } from 'typeorm';

import { TutorialAnalytics } from './entities/tutorial-analytics.entity';
import { TutorialSection } from './entities/tutorial-section.entity';
import { TutorialTag } from './entities/tutorial-tag.entity';
import { Tutorial } from './entities/tutorial.entity';

export interface TutorialSummary {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category: string;
  difficultyLevel: string;
  estimatedReadTime?: number | null;
  status: string;
  orderIndex: number;
  publishedAt?: Date | null;
  sectionCount: number;
  tags: { id: string; name: string; color: string }[];
}

@Injectable()
export class TutorialsService {
  constructor(
    @InjectRepository(Tutorial) private readonly tutorialRepo: Repository<Tutorial>,
    @InjectRepository(TutorialSection) private readonly sectionRepo: Repository<TutorialSection>,
    @InjectRepository(TutorialTag) private readonly tagRepo: Repository<TutorialTag>,
    @InjectRepository(TutorialAnalytics)
    private readonly analyticsRepo: Repository<TutorialAnalytics>,
  ) {}

  async getAllTutorials(category?: string): Promise<TutorialSummary[]> {
    const qb = this.tutorialRepo
      .createQueryBuilder('tutorial')
      .leftJoinAndSelect('tutorial.tags', 'tag')
      .loadRelationCountAndMap('tutorial.sectionCount', 'tutorial.sections', 'visibleSections', qb =>
        qb.where('visibleSections.isVisible = :visible', { visible: true }),
      )
      .where('tutorial.status = :status', { status: 'published' })
      .orderBy('tutorial.orderIndex', 'ASC')
      .addOrderBy('tutorial.createdAt', 'DESC');

    if (category) {
      qb.andWhere('tutorial.category = :category', { category });
    }

    const tutorials = await qb.getMany();
    return tutorials.map(tutorial => ({
      id: tutorial.id,
      title: tutorial.title,
      slug: tutorial.slug,
      description: tutorial.description,
      category: tutorial.category,
      difficultyLevel: tutorial.difficultyLevel,
      estimatedReadTime: tutorial.estimatedReadTime,
      status: tutorial.status,
      orderIndex: tutorial.orderIndex,
      publishedAt: tutorial.publishedAt,
      sectionCount: (tutorial as Tutorial & { sectionCount?: number }).sectionCount ?? 0,
      tags: tutorial.tags?.map(tag => ({ id: tag.id, name: tag.name, color: tag.color })) ?? [],
    }));
  }

  async getTutorialBySlug(slug: string) {
    const tutorial = await this.tutorialRepo.findOne({
      where: { slug, status: 'published' },
      relations: {
        sections: true,
        tags: true,
      },
      order: {
        sections: {
          orderIndex: 'ASC',
        },
      },
    });

    if (!tutorial) {
      return null;
    }

    await this.incrementViewCount(tutorial.id, null);

    return {
      ...tutorial,
      sections: tutorial.sections
        ?.filter(section => section.isVisible)
        .sort((a, b) => a.orderIndex - b.orderIndex),
      tags: tutorial.tags?.map(tag => ({ id: tag.id, name: tag.name, color: tag.color })) ?? [],
    };
  }

  async getSection(tutorialSlug: string, sectionSlug: string) {
    const section = await this.sectionRepo.findOne({
      where: {
        slug: sectionSlug,
        tutorial: {
          slug: tutorialSlug,
          status: 'published',
        },
      },
      relations: {
        tutorial: true,
      },
    });

    if (!section) {
      return null;
    }

    await this.incrementViewCount(section.tutorial.id, section.id);
    return section;
  }

  async searchTutorials(query: string): Promise<TutorialSummary[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;
    const tutorials = await this.tutorialRepo.find({
      where: [
        { status: 'published', title: ILike(searchTerm) },
        { status: 'published', description: ILike(searchTerm) },
        { status: 'published', category: ILike(searchTerm) },
      ],
      relations: { tags: true },
    });

    const unique = new Map<string, TutorialSummary>();
    tutorials.forEach(tutorial => {
      unique.set(tutorial.id, {
        id: tutorial.id,
        title: tutorial.title,
        slug: tutorial.slug,
        description: tutorial.description,
        category: tutorial.category,
        difficultyLevel: tutorial.difficultyLevel,
        estimatedReadTime: tutorial.estimatedReadTime,
        status: tutorial.status,
        orderIndex: tutorial.orderIndex,
        publishedAt: tutorial.publishedAt,
        sectionCount: tutorial.sections?.length ?? 0,
        tags: tutorial.tags?.map(tag => ({ id: tag.id, name: tag.name, color: tag.color })) ?? [],
      });
    });

    const sections = await this.sectionRepo.find({
      where: { content: ILike(searchTerm), isVisible: true },
      relations: { tutorial: { tags: true } },
    });

    sections.forEach(section => {
      const tutorial = section.tutorial;
      if (!tutorial || tutorial.status !== 'published') return;
      if (!unique.has(tutorial.id)) {
        unique.set(tutorial.id, {
          id: tutorial.id,
          title: tutorial.title,
          slug: tutorial.slug,
          description: tutorial.description,
          category: tutorial.category,
          difficultyLevel: tutorial.difficultyLevel,
          estimatedReadTime: tutorial.estimatedReadTime,
          status: tutorial.status,
          orderIndex: tutorial.orderIndex,
          publishedAt: tutorial.publishedAt,
          sectionCount: tutorial.sections?.length ?? 0,
          tags: tutorial.tags?.map(tag => ({ id: tag.id, name: tag.name, color: tag.color })) ?? [],
        });
      }
    });

    return Array.from(unique.values());
  }

  async getCategories(): Promise<{ name: string; count: number }[]> {
    const tutorials = await this.tutorialRepo.find({
      where: { status: 'published' },
      select: ['category'],
    });

    const counts = new Map<string, number>();
    tutorials.forEach(tutorial => {
      counts.set(tutorial.category, (counts.get(tutorial.category) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }

  async getTags() {
    const tags = await this.tagRepo.find();
    return tags.map(tag => ({ id: tag.id, name: tag.name, color: tag.color }));
  }

  async getRelatedTutorials(tutorialId: string, limit = 3) {
    const tutorial = await this.tutorialRepo.findOne({ where: { id: tutorialId } });
    if (!tutorial) {
      return [];
    }

    const qb = this.tutorialRepo
      .createQueryBuilder('tutorial')
      .leftJoinAndSelect('tutorial.tags', 'tag')
      .where('tutorial.status = :status', { status: 'published' })
      .andWhere('tutorial.category = :category', { category: tutorial.category })
      .andWhere('tutorial.id != :id', { id: tutorialId })
      .orderBy('tutorial.publishedAt', 'DESC')
      .limit(limit);

    const related = await qb.getMany();
    return related.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      category: item.category,
      difficultyLevel: item.difficultyLevel,
      estimatedReadTime: item.estimatedReadTime,
      status: item.status,
      orderIndex: item.orderIndex,
      publishedAt: item.publishedAt,
      tags: item.tags?.map(tag => ({ id: tag.id, name: tag.name, color: tag.color })) ?? [],
    }));
  }

  async getTutorialAnalytics(tutorialId: string) {
    return this.analyticsRepo.findOne({
      where: {
        tutorial: { id: tutorialId },
        section: IsNull(),
      },
    });
  }

  private async incrementViewCount(tutorialId: string, sectionId: string | null) {
    let record = await this.analyticsRepo.findOne({
      where: {
        tutorial: { id: tutorialId },
        section: sectionId ? { id: sectionId } : IsNull(),
      },
      relations: {
        tutorial: true,
        section: true,
      },
    });

    if (!record) {
      record = this.analyticsRepo.create({
        tutorial: { id: tutorialId } as Tutorial,
        section: sectionId ? ({ id: sectionId } as TutorialSection) : null,
        viewCount: 1,
        uniqueVisitors: 1,
        lastViewedAt: new Date(),
      });
    } else {
      record.viewCount += 1;
      record.lastViewedAt = new Date();
    }

    await this.analyticsRepo.save(record);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async decayBounceRates() {
    const analytics = await this.analyticsRepo.find({ where: { bounceRate: Not(IsNull()) } });
    if (!analytics.length) return;

    const now = new Date();
    for (const record of analytics) {
      // simple decay to slowly normalise bounce rate over time
      record.bounceRate = Math.max(0, Number(record.bounceRate) * 0.98);
      record.lastViewedAt = record.lastViewedAt ?? now;
    }

    await this.analyticsRepo.save(analytics);
  }
}
