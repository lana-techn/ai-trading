import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient | null = null;
  private readonly logger = new Logger(SupabaseService.name);
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase URL or Service Role Key not configured - running without tutorials functionality');
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        db: {
          schema: 'public',
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'x-client-info': 'supabase-js-node',
          },
        },
      });
      
      this.logger.log(`Supabase client created for: ${supabaseUrl}`);
    } catch (error) {
      this.logger.error('Failed to create Supabase client:', error);
    }
  }

  async onModuleInit() {
    // Test connection on startup
    await this.testConnection();
  }

  private async testConnection() {
    if (!this.supabase) {
      this.logger.warn('Supabase client not initialized - skipping connection test');
      return;
    }

    try {
      this.logger.log('Testing Supabase connection...');
      const { error } = await this.supabase
        .from('tutorials')
        .select('id')
        .limit(1);

      if (error) {
        this.logger.error(`Supabase connection test failed: ${error.message}`);
        this.isConnected = false;
      } else {
        this.logger.log('✓ Supabase connection successful');
        this.isConnected = true;
      }
    } catch (error) {
      this.logger.error('Supabase connection test error:', error);
      this.isConnected = false;
    }
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  isSupabaseConnected(): boolean {
    return this.isConnected;
  }

  async getTutorials(category?: string) {
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return [];
    }

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
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return null;
    }

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
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return null;
    }

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
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return [];
    }

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
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return [];
    }

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
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return [];
    }

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
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return [];
    }

    try {
      const { filterColumn, identifier } = this.resolveTutorialIdentifier(tutorialId);

      const { data: tutorial, error: tutorialError } = await this.supabase
        .from('tutorials')
        .select('id, category')
        .eq(filterColumn, identifier)
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
        .neq('id', tutorial.id)
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
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return null;
    }

    const { filterColumn, identifier, requiresLookup } = this.resolveTutorialIdentifier(tutorialId, true);

    let resolvedTutorialId = tutorialId;

    if (requiresLookup) {
      const { data: tutorial, error: tutorialError } = await this.supabase
        .from('tutorials')
        .select('id')
        .eq(filterColumn, identifier)
        .single();

      if (tutorialError) {
        if (tutorialError.code !== 'PGRST116') {
          this.logger.error(`Supabase getTutorialAnalytics lookup error: ${tutorialError.message}`, tutorialError);
        }
        return null;
      }

      resolvedTutorialId = tutorial.id;
    }

    const { data, error } = await this.supabase
      .from('tutorial_analytics')
      .select('*')
      .eq('tutorial_id', resolvedTutorialId)
      .is('section_id', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async incrementViewCount(tutorialId: string, sectionId: string | null) {
    if (!this.supabase) {
      this.logger.warn('Supabase client not available');
      return;
    }

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

  private resolveTutorialIdentifier(identifier: string, allowLookup = false) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(identifier);

    if (isUuid) {
      return {
        filterColumn: 'id' as const,
        identifier,
        requiresLookup: false,
      };
    }

    return {
      filterColumn: 'slug' as const,
      identifier,
      requiresLookup: allowLookup,
    };
  }

}

