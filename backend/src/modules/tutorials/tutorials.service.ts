import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SupabaseService } from '../supabase/supabase.service';
import { FALLBACK_TUTORIALS, FALLBACK_CATEGORIES, FALLBACK_TAGS } from './fallback-data';

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
  private readonly logger = new Logger(TutorialsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllTutorials(category?: string): Promise<TutorialSummary[]> {
    try {
      // Check if Supabase is connected
      if (!this.supabaseService.isSupabaseConnected()) {
        this.logger.warn('Supabase not connected, using fallback tutorial data');
        return this.getFallbackTutorials(category);
      }

      const tutorials = await this.supabaseService.getTutorials(category);
      
      // If no tutorials found, use fallback data
      if (!tutorials || tutorials.length === 0) {
        this.logger.warn('No tutorials found in database, using fallback data');
        return this.getFallbackTutorials(category);
      }
      
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
    } catch (error) {
      this.logger.error('Error fetching tutorials from Supabase, using fallback data', error);
      return this.getFallbackTutorials(category);
    }
  }

  private getFallbackTutorials(category?: string): TutorialSummary[] {
    let tutorials = FALLBACK_TUTORIALS;
    
    if (category) {
      tutorials = tutorials.filter(t => t.category === category);
    }
    
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
    try {
      // Check if this is a fallback tutorial by slug
      const fallbackTutorial = FALLBACK_TUTORIALS.find(t => t.slug === slug);
      
      if (fallbackTutorial) {
        this.logger.log(`Returning fallback tutorial for slug: ${slug}`);
        return {
          ...fallbackTutorial,
          sections: fallbackTutorial.sections || [],
          tags: fallbackTutorial.tutorial_tag_relations?.map((relation: any) => relation.tutorial_tags) ?? [],
        };
      }

      // Try to fetch from Supabase if connected
      if (!this.supabaseService.isSupabaseConnected()) {
        this.logger.warn(`Supabase not connected, tutorial ${slug} not found in fallback data`);
        return null;
      }

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
    } catch (error) {
      this.logger.error(`Error fetching tutorial by slug ${slug}`, error);
      
      // Try fallback as last resort
      const fallbackTutorial = FALLBACK_TUTORIALS.find(t => t.slug === slug);
      if (fallbackTutorial) {
        return {
          ...fallbackTutorial,
          sections: fallbackTutorial.sections || [],
          tags: fallbackTutorial.tutorial_tag_relations?.map((relation: any) => relation.tutorial_tags) ?? [],
        };
      }
      
      return null;
    }
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

    try {
      // If Supabase is not connected, search in fallback data
      if (!this.supabaseService.isSupabaseConnected()) {
        this.logger.warn('Supabase not connected, searching in fallback data');
        return this.searchFallbackTutorials(query);
      }

      const tutorials = await this.supabaseService.searchTutorials(query);
      
      // If no results, search in fallback data
      if (!tutorials || tutorials.length === 0) {
        return this.searchFallbackTutorials(query);
      }
      
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
    } catch (error) {
      this.logger.error('Error searching tutorials, using fallback data', error);
      return this.searchFallbackTutorials(query);
    }
  }

  private searchFallbackTutorials(query: string): TutorialSummary[] {
    const lowerQuery = query.toLowerCase();
    const filtered = FALLBACK_TUTORIALS.filter(tutorial => 
      tutorial.title.toLowerCase().includes(lowerQuery) ||
      tutorial.description?.toLowerCase().includes(lowerQuery) ||
      tutorial.category.toLowerCase().includes(lowerQuery)
    );

    return filtered.map(tutorial => ({
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
    try {
      if (!this.supabaseService.isSupabaseConnected()) {
        this.logger.warn('Supabase not connected, using fallback categories');
        return FALLBACK_CATEGORIES;
      }

      const categories = await this.supabaseService.getCategories();
      
      if (!categories || categories.length === 0) {
        this.logger.warn('No categories found in database, using fallback data');
        return FALLBACK_CATEGORIES;
      }
      
      return categories;
    } catch (error) {
      this.logger.error('Error fetching categories, using fallback data', error);
      return FALLBACK_CATEGORIES;
    }
  }

  async getTags() {
    try {
      if (!this.supabaseService.isSupabaseConnected()) {
        this.logger.warn('Supabase not connected, using fallback tags');
        return FALLBACK_TAGS;
      }

      const tags = await this.supabaseService.getTags();
      
      if (!tags || tags.length === 0) {
        this.logger.warn('No tags found in database, using fallback data');
        return FALLBACK_TAGS;
      }
      
      return tags;
    } catch (error) {
      this.logger.error('Error fetching tags, using fallback data', error);
      return FALLBACK_TAGS;
    }
  }

  async getRelatedTutorials(tutorialId: string, limit = 3) {
    try {
      // Check if this is a fallback tutorial
      const fallbackTutorial = FALLBACK_TUTORIALS.find(t => t.id === tutorialId || t.slug === tutorialId);
      
      if (fallbackTutorial) {
        this.logger.log(`Returning related fallback tutorials for: ${tutorialId}`);
        // Return other tutorials from same category
        const related = FALLBACK_TUTORIALS
          .filter(t => t.id !== fallbackTutorial.id && t.category === fallbackTutorial.category)
          .slice(0, limit);
        
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

      if (!this.supabaseService.isSupabaseConnected()) {
        this.logger.warn('Supabase not connected, returning empty related tutorials');
        return [];
      }

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
    } catch (error) {
      this.logger.error(`Error fetching related tutorials for ${tutorialId}`, error);
      return [];
    }
  }

  async getTutorialAnalytics(tutorialId: string) {
    try {
      // Check if this is a fallback tutorial (by ID or slug)
      const isFallbackTutorial = FALLBACK_TUTORIALS.some(t => t.id === tutorialId || t.slug === tutorialId);
      
      if (isFallbackTutorial) {
        this.logger.log(`Returning mock analytics for fallback tutorial: ${tutorialId}`);
        // Return mock analytics for fallback tutorials
        return {
          tutorial_id: tutorialId,
          view_count: Math.floor(Math.random() * 500) + 100,
          unique_visitors: Math.floor(Math.random() * 300) + 50,
          completion_count: Math.floor(Math.random() * 100) + 20,
          average_time_spent: Math.floor(Math.random() * 600) + 180,
          bounce_rate: Math.random() * 0.3 + 0.1,
          last_viewed_at: new Date().toISOString(),
        };
      }

      if (!this.supabaseService.isSupabaseConnected()) {
        this.logger.warn('Supabase not connected, returning null analytics');
        return null;
      }

      return this.supabaseService.getTutorialAnalytics(tutorialId);
    } catch (error) {
      this.logger.error(`Error fetching analytics for ${tutorialId}`, error);
      return null;
    }
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
