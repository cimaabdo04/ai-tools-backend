import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, InjectThrottlerOptions, InjectThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ThrottlerStorageService } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

const MIN_RATE_LIMIT = 30;
const MIN_TTL = 10000;

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorageService,
    reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // trust proxy is enabled, so req.ip comes from the trusted X-Forwarded-For
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  protected errorMessage = 'Too many requests. Please try again later.';

  protected async handleRequest(requestProps: any): Promise<boolean> {
    try {
      const settings = await this.prisma.siteSettings.findFirst();
      if (settings && !settings.rateLimitingEnabled) {
        // Still enforce a baseline minimum rate limit even if "disabled"
        (this as any).limit = MIN_RATE_LIMIT;
        (this as any).ttl = MIN_TTL;
        return super.handleRequest(requestProps);
      }
      if (settings && settings.rateLimitingMax > 0) {
        (this as any).limit = Math.max(settings.rateLimitingMax, MIN_RATE_LIMIT);
        (this as any).ttl = Math.max(settings.rateLimitingWindow || 60000, MIN_TTL);
      }
    } catch {
      // fallback to defaults
    }
    return super.handleRequest(requestProps);
  }
}
