import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

type SupportedDbType = 'postgres' | 'sqlite';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseConfig = configService.get<Record<string, any>>('database', {});
        const connectionType = resolveDbType(databaseConfig);
        const baseOptions = {
          type: connectionType,
          autoLoadEntities: true,
          synchronize: true,
          logging: databaseConfig.logging ?? false,
        } as TypeOrmModuleOptions;

        if (connectionType === 'sqlite') {
          const dbPath = resolveSqlitePath(databaseConfig);
          ensurePathExists(dbPath);
          return {
            ...baseOptions,
            database: dbPath,
          } as TypeOrmModuleOptions;
        }

        return {
          ...baseOptions,
          url: resolvePostgresUrl(databaseConfig),
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        } as TypeOrmModuleOptions;
      },
    }),
  ],
})
export class DatabaseModule {}

function resolveDbType(config: Record<string, any>): SupportedDbType {
  const explicitType = (config.type as string | undefined)?.toLowerCase();
  if (explicitType === 'postgres' || explicitType === 'postgresql') return 'postgres';
  if (explicitType === 'sqlite') return 'sqlite';

  const url = (config.url as string | undefined)?.toLowerCase();
  if (url?.startsWith('postgres')) return 'postgres';
  return 'sqlite';
}

function resolveSqlitePath(config: Record<string, any>): string {
  if (config.path) {
    return resolve(process.cwd(), config.path);
  }

  const url = config.url as string | undefined;
  if (url?.startsWith('sqlite')) {
    const [, path = ''] = url.split('sqlite:///');
    if (path) {
      return resolve(process.cwd(), path);
    }
  }

  return resolve(process.cwd(), './data/trader-ai.sqlite');
}

function resolvePostgresUrl(config: Record<string, any>): string {
  if (config.url) return config.url as string;

  const host = config.host ?? 'localhost';
  const port = config.port ?? 5432;
  const username = config.username ?? 'postgres';
  const password = config.password ?? '';
  const database = config.name ?? 'trader_ai';

  const auth = password ? `${username}:${password}` : username;
  return `postgresql://${auth}@${host}:${port}/${database}`;
}

function ensurePathExists(filePath: string) {
  const directory = dirname(filePath);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}
