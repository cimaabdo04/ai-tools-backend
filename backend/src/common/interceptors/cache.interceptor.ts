import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler())
      || this.generateCacheKey(request);

    const cacheTtl = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());

    return new Observable((observer) => {
      this.redisService
        .get(cacheKey)
        .then((cached) => {
          if (cached) {
            try {
              observer.next(JSON.parse(cached));
              observer.complete();
              return;
            } catch {
              // parsing failed, continue
            }
          }

          next.handle()
            .pipe(
              tap({
                next: (data: any) => {
                  if (data && cacheTtl !== 0) {
                    this.redisService
                      .set(cacheKey, JSON.stringify(data), cacheTtl)
                      .catch((err) => this.logger.error('Cache set error', err));
                  }
                },
                error: () => {
                  // don't cache errors
                },
              }),
            )
            .subscribe({
              next: (data) => observer.next(data),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
        })
        .catch((err) => {
          this.logger.error('Cache get error', err);
          next.handle().subscribe({
            next: (data) => observer.next(data),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        });
    });
  }

  private generateCacheKey(request: any): string {
    const base = `${request.route?.path || request.url}`;
    const query = request.query ? JSON.stringify(request.query, Object.keys(request.query).sort()) : '';
    const userPart = request.user?.id || 'anon';
    return `cache:${base}:${query}:${userPart}`;
  }
}

export function CacheKey(key: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_KEY_METADATA, key, descriptor.value);
  };
}

export function CacheTTL(ttl: number) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_TTL_METADATA, ttl, descriptor.value);
  };
}
