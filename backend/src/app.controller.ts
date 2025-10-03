import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly configService: ConfigService) {}

  @Get()
  getRoot() {
    return {
      message: this.appService.getWelcomeMessage(),
      version: this.configService.get('app.version', '1.0.0'),
      docs: '/api/v1/docs',
      status: 'operational',
    };
  }
}
