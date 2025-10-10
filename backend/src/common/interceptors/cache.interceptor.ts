import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 60000; // 60 seconds default

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.getCacheKey(request);
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cachedResponse = this.cache.get(cacheKey);
    
    if (cachedResponse && this.isValid(cachedResponse)) {
      // Return cached response with cache headers
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-Cache', 'HIT');
      response.setHeader('X-Cache-TTL', cachedResponse.ttl);
      return of(cachedResponse.data);
    }

    return next.handle().pipe(
      tap(data => {
        // Cache the response
        const ttl = this.getTTL(request);
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });
        
        // Set cache headers
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Cache', 'MISS');
        response.setHeader('X-Cache-TTL', ttl);
        
        // Clean up old cache entries periodically
        this.cleanupCache();
      }),
    );
  }

  private getCacheKey(request: any): string {
    const { url, method } = request;
    const userId = request.user?.id || 'anonymous';
    return `${method}:${url}:${userId}`;
  }

  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private getTTL(request: any): number {
    // Different TTL for different routes
    const url = request.url;
    
    if (url.includes('/market-data')) {
      return 5000; // 5 seconds for market data
    } else if (url.includes('/analysis')) {
      return 30000; // 30 seconds for analysis
    } else if (url.includes('/tutorials')) {
      return 300000; // 5 minutes for tutorials
    } else if (url.includes('/health')) {
      return 1000; // 1 second for health checks
    }
    
    return this.defaultTTL;
  }

  private cleanupCache(): void {
    // Run cleanup every 100 requests
    if (Math.random() > 0.01) return;
    
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
    
    // Also limit cache size to prevent memory leaks
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 20% of entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
}