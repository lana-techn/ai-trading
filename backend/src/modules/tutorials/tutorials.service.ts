import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SupabaseService } from '../supabase/supabase.service';

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
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllTutorials(category?: string): Promise<TutorialSummary[]> {
    const tutorials = await this.supabaseService.getTutorials(category);
    
    return tutorials.map(tutorial => ({
      id: tutorial.id,
      title: tutorial.title,
      slug: tutorial.slug,
      description: tutorial.description,
      category: tutorial.category,
      difficultyLevel: tutorial.difficulty_level,
      estimatedReadTime: tutorial.estimated_read_time,
      status: tutorial.status,
      orderIndex: tutorial.order_index,
      publishedAt: tutorial.published_at,
      sectionCount: tutorial.sections?.length ?? 0,
      tags: tutorial.tutorial_tag_relations?.map((relation: any) => relation.tutorial_tags) ?? [],
    }));
  }

  async getTutorialBySlug(slug: string) {
    const tutorial = await this.supabaseService.getTutorialBySlug(slug);

    if (!tutorial) {
      return null;
    }

    await this.incrementViewCount(tutorial.id, null);

    return {
      ...tutorial,
      sections: tutorial.sections
        ?.filter((section: any) => section.is_visible)
        .sort((a: any, b: any) => a.order_index - b.order_index),
      tags: tutorial.tutorial_tag_relations?.map((relation: any) => relation.tutorial_tags) ?? [],
    };
  }

  async getSection(tutorialSlug: string, sectionSlug: string) {
    const section = await this.supabaseService.getSection(tutorialSlug, sectionSlug);

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

    const tutorials = await this.supabaseService.searchTutorials(query);
    
    return tutorials.map(tutorial => ({
      id: tutorial.id,
      title: tutorial.title,
      slug: tutorial.slug,
      description: tutorial.description,
      category: tutorial.category,
      difficultyLevel: tutorial.difficulty_level,
      estimatedReadTime: tutorial.estimated_read_time,
      status: tutorial.status,
      orderIndex: tutorial.order_index,
      publishedAt: tutorial.published_at,
      sectionCount: tutorial.sections?.length ?? 0,
      tags: tutorial.tutorial_tag_relations?.map((relation: any) => relation.tutorial_tags) ?? [],
    }));
  }

  async getCategories(): Promise<{ name: string; count: number }[]> {
    return this.supabaseService.getCategories();
  }

  async getTags() {
    return this.supabaseService.getTags();
  }

  async getRelatedTutorials(tutorialId: string, limit = 3) {
    const related = await this.supabaseService.getRelatedTutorials(tutorialId, limit);
    return related.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      category: item.category,
      difficultyLevel: item.difficulty_level,
      estimatedReadTime: item.estimated_read_time,
      status: item.status,
      orderIndex: item.order_index,
      publishedAt: item.published_at,
      tags: item.tutorial_tag_relations?.map((relation: any) => relation.tutorial_tags) ?? [],
    }));
  }

  async getTutorialAnalytics(tutorialId: string) {
    return this.supabaseService.getTutorialAnalytics(tutorialId);
  }

  private async incrementViewCount(tutorialId: string, sectionId: string | null) {
    return this.supabaseService.incrementViewCount(tutorialId, sectionId);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async decayBounceRates() {
    const supabase = this.supabaseService.getClient();
    
    if (!supabase) {
      return;
    }

    const { data: analytics, error } = await supabase
      .from('tutorial_analytics')
      .select('*')
      .not('bounce_rate', 'is', null);
    
    if (error || !analytics.length) return;

    const now = new Date();
    for (const record of analytics) {
      const decayedBounceRate = Math.max(0, Number(record.bounce_rate) * 0.98);
      await supabase
        .from('tutorial_analytics')
        .update({
          bounce_rate: decayedBounceRate,
          last_viewed_at: record.last_viewed_at ?? now.toISOString()
        })
        .eq('id', record.id);
    }
  }
}
