import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Role Key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async getTutorials(category?: string) {
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
      throw error;
    }

    return data;
  }

  async getTutorialBySlug(slug: string) {
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
      throw error;
    }

    return data || null;
  }

  async getSection(tutorialSlug: string, sectionSlug: string) {
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
      throw error;
    }

    return data || null;
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
    const { data, error } = await this.supabase
      .from('tutorials')
      .select('category')
      .eq('status', 'published');

    if (error) {
      throw error;
    }

    const counts: { [key: string]: number } = {};
    data.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  async getTags() {
    const { data, error } = await this.supabase
      .from('tutorial_tags')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async getRelatedTutorials(tutorialId: string, limit = 3) {
    const { data: tutorial, error: tutorialError } = await this.supabase
      .from('tutorials')
      .select('category')
      .eq('id', tutorialId)
      .single();

    if (tutorialError) throw tutorialError;

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
      throw error;
    }

    return data;
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
