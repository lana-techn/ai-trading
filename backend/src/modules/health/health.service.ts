import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { formatISO } from 'date-fns';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly configService: ConfigService, private readonly dataSource: DataSource) {}

  async getHealthStatus() {
    const version = this.configService.get('app.version', '1.0.0');

    const databaseStatus = await this.checkDatabase();

    return {
      status: databaseStatus === 'healthy' ? 'healthy' : 'degraded',
      version,
      timestamp: formatISO(new Date()),
      services: {
        hybrid_ai: 'operational',
        market_data: 'operational',
        database: databaseStatus,
        redis: 'not_configured',
      },
    };
  }

  private async checkDatabase(): Promise<'healthy' | 'degraded'> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'healthy';
    } catch (error) {
      this.logger.warn(`Database health check failed: ${(error as Error).message}`);
      return 'degraded';
    }
  }
}
