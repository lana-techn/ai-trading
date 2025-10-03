import { Controller, Get, Param, Query } from '@nestjs/common';

import { TutorialSummary, TutorialsService } from './tutorials.service';

@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get()
  async list(@Query('category') category?: string): Promise<{
    success: boolean;
    tutorials: TutorialSummary[];
    total: number;
  }> {
    const tutorials = await this.tutorialsService.getAllTutorials(category);
    return {
      success: true,
      tutorials,
      total: tutorials.length,
    };
  }

  @Get('categories')
  async categories() {
    const categories = await this.tutorialsService.getCategories();
    return { success: true, categories };
  }

  @Get('tags')
  async tags() {
    const tags = await this.tutorialsService.getTags();
    return { success: true, tags };
  }

  @Get('search')
  async search(@Query('query') query = ''): Promise<{
    success: boolean;
    query: string;
    tutorials: TutorialSummary[];
  }> {
    const tutorials = await this.tutorialsService.searchTutorials(query);
    return { success: true, query, tutorials };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const tutorial = await this.tutorialsService.getTutorialBySlug(slug);
    return { success: Boolean(tutorial), tutorial };
  }

  @Get(':slug/sections/:sectionSlug')
  async getSection(@Param('slug') slug: string, @Param('sectionSlug') sectionSlug: string) {
    const section = await this.tutorialsService.getSection(slug, sectionSlug);
    return { success: Boolean(section), section };
  }

  @Get(':id/related')
  async related(@Param('id') id: string, @Query('limit') limit = '3') {
    const parsedLimit = Math.min(Number(limit) || 3, 10);
    const tutorials = await this.tutorialsService.getRelatedTutorials(id, parsedLimit);
    return { success: true, tutorials };
  }

  @Get(':id/analytics')
  async analytics(@Param('id') id: string) {
    const analytics = await this.tutorialsService.getTutorialAnalytics(id);
    return { success: Boolean(analytics), analytics };
  }
}
