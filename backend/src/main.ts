import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    // Enable better logging in production
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const allowedOrigins = configService.get<string[]>('cors.origins', []);
  const port = configService.get<number>('app.port', 8000);

  // Enable compression for all responses
  const compression = require('compression');
  app.use(compression({
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6, // Compression level (0-9)
  }));

  // Security headers with helmet
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });

  // Optimize body parsing with size limits
  app.use(json({ 
    limit: '10mb',
    strict: true,
    type: ['application/json', 'text/json'],
  }));
  app.use(urlencoded({ 
    extended: true,
    limit: '10mb',
    parameterLimit: 1000,
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  await app.listen(port, '0.0.0.0');
  
  // Log startup information
  Logger.log(`🚀 Trader AI backend running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
  Logger.log(`🔧 API Prefix: /api/v1`, 'Bootstrap');
  Logger.log(`✅ Health check: http://localhost:${port}/health`, 'Bootstrap');

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    Logger.log('SIGTERM signal received: closing HTTP server', 'Bootstrap');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch(err => {
  Logger.error('Failed to start application', err, 'Bootstrap');
  process.exit(1);
});
