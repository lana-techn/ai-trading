import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Role Key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false,
      },
    });
    
    this.logger.log(`Supabase initialized with URL: ${supabaseUrl}`);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async getTutorials(category?: string) {
    try {
      let query = this.supabase
        .from('tutorials')
        .select(`
          *,
          sections (id),
          tutorial_tag_relations (
            tutorial_tags (id, name, color)
          )
        `)
        .eq('status', 'published')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      if (error) {
        this.logger.error(`Supabase getTutorials error: ${error.message}`, error);
        throw error;
      }

      this.logger.debug(`Successfully fetched ${data?.length || 0} tutorials${category ? ` for category: ${category}` : ''}`);
      return data || [];
    } catch (error) {
      this.logger.error(`Error in getTutorials: ${(error as Error).message}`);
      // Return empty array instead of crashing
      return [];
    }
  }

  async getTutorialBySlug(slug: string) {
    try {
      const { data, error } = await this.supabase
        .from('tutorials')
        .select(`
          *,
          sections (*),
          tutorial_tag_relations (
            tutorial_tags (id, name, color)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Supabase getTutorialBySlug error for slug "${slug}": ${error.message}`, error);
        throw error;
      }

      return data || null;
    } catch (error) {
      this.logger.error(`Error in getTutorialBySlug for slug "${slug}": ${(error as Error).message}`);
      return null;
    }
  }

  async getSection(tutorialSlug: string, sectionSlug: string) {
    try {
      const { data, error } = await this.supabase
        .from('sections')
        .select(`
          *,
          tutorials (id, slug, status)
        `)
        .eq('slug', sectionSlug)
        .eq('tutorials.slug', tutorialSlug)
        .eq('tutorials.status', 'published')
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Supabase getSection error for "${tutorialSlug}/${sectionSlug}": ${error.message}`, error);
        throw error;
      }

      return data || null;
    } catch (error) {
      this.logger.error(`Error in getSection for "${tutorialSlug}/${sectionSlug}": ${(error as Error).message}`);
      return null;
    }
  }

  async searchTutorials(query: string) {
    const searchTerm = `%${query}%`;
    
    const { data: titleResults, error: titleError } = await this.supabase
      .from('tutorials')
      .select(`
        *,
        tutorial_tag_relations (
          tutorial_tags (id, name, color)
        )
      `)
      .eq('status', 'published')
      .ilike('title', searchTerm);

    if (titleError) throw titleError;

    const { data: descResults, error: descError } = await this.supabase
      .from('tutorials')
      .select(`
        *,
        tutorial_tag_relations (
          tutorial_tags (id, name, color)
        )
      `)
      .eq('status', 'published')
      .ilike('description', searchTerm);

    if (descError) throw descError;

    const { data: sectionResults, error: sectionError } = await this.supabase
      .from('sections')
      .select(`
        *,
        tutorials (
          id, title, slug, description, category, difficulty_level, 
          estimated_read_time, status, order_index, published_at,
          tutorial_tag_relations (
            tutorial_tags (id, name, color)
          )
        )
      `)
      .eq('is_visible', true)
      .ilike('content', searchTerm);

    if (sectionError) throw sectionError;

    const allResults = new Map();
    
    [...titleResults, ...descResults].forEach(tutorial => {
      allResults.set(tutorial.id, tutorial);
    });

    sectionResults.forEach(section => {
      if (section.tutorials.status === 'published') {
        allResults.set(section.tutorials.id, section.tutorials);
      }
    });

    return Array.from(allResults.values());
  }

  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('tutorials')
        .select('category')
        .eq('status', 'published');

      if (error) {
        this.logger.error(`Supabase getCategories error: ${error.message}`, error);
        throw error;
      }

      const counts: { [key: string]: number } = {};
      data?.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });

      const result = Object.entries(counts).map(([name, count]) => ({ name, count }));
      this.logger.debug(`Successfully fetched ${result.length} categories`);
      return result;
    } catch (error) {
      this.logger.error(`Error in getCategories: ${(error as Error).message}`);
      // Return empty array instead of crashing
      return [];
    }
  }

  async getTags() {
    try {
      const { data, error } = await this.supabase
        .from('tutorial_tags')
        .select('*');

      if (error) {
        this.logger.error(`Supabase getTags error: ${error.message}`, error);
        throw error;
      }

      this.logger.debug(`Successfully fetched ${data?.length || 0} tags`);
      return data || [];
    } catch (error) {
      this.logger.error(`Error in getTags: ${(error as Error).message}`);
      // Return empty array instead of crashing
      return [];
    }
  }

  async getRelatedTutorials(tutorialId: string, limit = 3) {
    try {
      const { data: tutorial, error: tutorialError } = await this.supabase
        .from('tutorials')
        .select('category')
        .eq('id', tutorialId)
        .single();

      if (tutorialError) {
        this.logger.error(`Supabase getRelatedTutorials error fetching tutorial: ${tutorialError.message}`, tutorialError);
        throw tutorialError;
      }

      const { data, error } = await this.supabase
        .from('tutorials')
        .select(`
          *,
          tutorial_tag_relations (
            tutorial_tags (id, name, color)
          )
        `)
        .eq('status', 'published')
        .eq('category', tutorial.category)
        .neq('id', tutorialId)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error(`Supabase getRelatedTutorials error: ${error.message}`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Error in getRelatedTutorials for id "${tutorialId}": ${(error as Error).message}`);
      return [];
    }
  }

  async getTutorialAnalytics(tutorialId: string) {
    const { data, error } = await this.supabase
      .from('tutorial_analytics')
      .select('*')
      .eq('tutorial_id', tutorialId)
      .is('section_id', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async incrementViewCount(tutorialId: string, sectionId: string | null) {
    const existingRecord = await this.supabase
      .from('tutorial_analytics')
      .select('*')
      .eq('tutorial_id', tutorialId)
      .eq('section_id', sectionId)
      .single();

    if (existingRecord.data) {
      const { error } = await this.supabase
        .from('tutorial_analytics')
        .update({
          view_count: existingRecord.data.view_count + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', existingRecord.data.id);

      if (error) throw error;
    } else {
      const { error } = await this.supabase
        .from('tutorial_analytics')
        .insert({
          tutorial_id: tutorialId,
          section_id: sectionId,
          view_count: 1,
          unique_visitors: 1,
          last_viewed_at: new Date().toISOString()
        });

      if (error) throw error;
    }
  }
}
