import { Controller, Get, Param, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { TutorialSummary, TutorialsService } from './tutorials.service';

@Controller('tutorials')
export class TutorialsController {
  private readonly logger = new Logger(TutorialsController.name);

  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get()
  async list(@Query('category') category?: string): Promise<{
    success: boolean;
    tutorials: TutorialSummary[];
    total: number;
  }> {
    try {
      const tutorials = await this.tutorialsService.getAllTutorials(category);
      return {
        success: true,
        tutorials,
        total: tutorials.length,
      };
    } catch (error) {
      this.logger.error('Error fetching tutorials:', error);
      throw new HttpException('Failed to fetch tutorials', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('categories')
  async categories() {
    try {
      const categories = await this.tutorialsService.getCategories();
      return { success: true, categories };
    } catch (error) {
      this.logger.error('Error fetching categories:', error);
      throw new HttpException('Failed to fetch categories', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('tags')
  async tags() {
    try {
      const tags = await this.tutorialsService.getTags();
      return { success: true, tags };
    } catch (error) {
      this.logger.error('Error fetching tags:', error);
      throw new HttpException('Failed to fetch tags', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  async search(@Query('query') query = ''): Promise<{
    success: boolean;
    query: string;
    tutorials: TutorialSummary[];
  }> {
    try {
      const tutorials = await this.tutorialsService.searchTutorials(query);
      return { success: true, query, tutorials };
    } catch (error) {
      this.logger.error('Error searching tutorials:', error);
      throw new HttpException('Failed to search tutorials', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':slug/related')
  async related(@Param('slug') slug: string, @Query('limit') limit = '3') {
    try {
      const parsedLimit = Math.min(Number(limit) || 3, 10);
      const tutorials = await this.tutorialsService.getRelatedTutorials(slug, parsedLimit);
      return { success: true, tutorials };
    } catch (error) {
      this.logger.error('Error fetching related tutorials:', error);
      throw new HttpException('Failed to fetch related tutorials', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':slug/analytics')
  async analytics(@Param('slug') slug: string) {
    try {
      const analytics = await this.tutorialsService.getTutorialAnalytics(slug);
      return { success: Boolean(analytics), analytics };
    } catch (error) {
      this.logger.error('Error fetching analytics:', error);
      throw new HttpException('Failed to fetch analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':slug/sections/:sectionSlug')
  async getSection(@Param('slug') slug: string, @Param('sectionSlug') sectionSlug: string) {
    try {
      const section = await this.tutorialsService.getSection(slug, sectionSlug);
      return { success: Boolean(section), section };
    } catch (error) {
      this.logger.error('Error fetching section:', error);
      throw new HttpException('Failed to fetch section', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    try {
      const tutorial = await this.tutorialsService.getTutorialBySlug(slug);
      return { success: Boolean(tutorial), tutorial };
    } catch (error) {
      this.logger.error('Error fetching tutorial:', error);
      throw new HttpException('Failed to fetch tutorial', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
