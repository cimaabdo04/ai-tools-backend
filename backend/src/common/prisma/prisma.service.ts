import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const JSON_FIELDS: Record<string, Set<string>> = {
  User: new Set(['socialLinks', 'metadata', 'deviceInfo']),
  Session: new Set(['deviceInfo']),
  Tool: new Set(['pricingTypes', 'pricingDetails', 'features', 'useCases', 'platforms', 'gallery', 'faq', 'schemaMarkup', 'metadata']),
  Category: new Set(['metadata']),
  Tag: new Set(['metadata']),
  Review: new Set(['pros', 'cons']),
  Banner: new Set(['metadata']),
  PricingPlan: new Set(['features', 'limits', 'metadata']),
  Subscription: new Set(['metadata']),
  Payment: new Set(['metadata', 'paymentDetails']),
  ApiKey: new Set(['permissions', 'ipWhitelist']),
  AnalyticEvent: new Set(['metadata']),
  Notification: new Set(['data', 'metadata']),
  PendingEdit: new Set(['changes']),
  AuditLog: new Set(['metadata']),
  AffiliateLink: new Set(['metadata']),
  SponsoredListing: new Set(['metadata']),
  FeaturedHistory: new Set(['metadata']),
  Page: new Set(['content', 'metadata']),
  BlogPost: new Set(['tags', 'metadata']),
  Message: new Set(['metadata']),
};

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function walkData(data: unknown, fields: Set<string>): unknown {
  if (Array.isArray(data)) {
    return data.map(item => walkData(item, fields));
  }
  if (isObject(data)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (fields.has(key) && (isObject(value) || Array.isArray(value))) {
        result[key] = JSON.stringify(value);
      } else if (key === 'create' || key === 'update' || key === 'upsert' || key === 'connectOrCreate') {
        result[key] = walkData(value, fields);
      } else if (key === 'createMany' && isObject(value)) {
        result[key] = { data: walkData((value as any).data, fields) };
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return data;
}

function walkResult(result: unknown, fields: Set<string>): unknown {
  if (Array.isArray(result)) {
    return result.map(item => walkResult(item, fields));
  }
  if (isObject(result)) {
    const resultObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(result)) {
      if (fields.has(key) && typeof value === 'string') {
        try {
          resultObj[key] = JSON.parse(value);
        } catch {
          resultObj[key] = value;
        }
      } else if (isObject(value) || Array.isArray(value)) {
        resultObj[key] = walkResult(value, fields);
      } else {
        resultObj[key] = value;
      }
    }
    return resultObj;
  }
  return result;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _extended: any = null;

  constructor() {
    const self = this;
    const handler: ProxyHandler<PrismaService> = {
      get(target: any, prop: string | symbol) {
        if (prop === 'onModuleInit' || prop === 'onModuleDestroy' ||
            prop === 'cleanDatabase' || prop === 'enableQueryLogging' ||
            prop === 'constructor' || prop === 'logger' ||
            prop === '_extended' || prop === 'then' || prop === 'catch' ||
            prop === Symbol.toStringTag || prop === Symbol.iterator) {
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        }
        if (target._extended && prop in target._extended) {
          const val = target._extended[prop];
          return typeof val === 'function' ? val.bind(target._extended) : val;
        }
        const val = target[prop];
        return typeof val === 'function' ? val.bind(target) : val;
      },
      set(target: any, prop: string | symbol, value: any) {
        target[prop] = value;
        return true;
      },
    };
    return new Proxy(this, handler);
  }

  async onModuleInit() {
    const base = new PrismaClient({
      log: [
        { emit: 'event' as const, level: 'query' as const },
        { emit: 'stdout' as const, level: 'info' as const },
        { emit: 'stdout' as const, level: 'warn' as const },
        { emit: 'stdout' as const, level: 'error' as const },
      ],
      errorFormat: 'colorless',
    });

    this._extended = base.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            const fields = JSON_FIELDS[model];
            if (fields && args && ['create', 'update', 'upsert', 'updateMany', 'createMany'].includes(operation)) {
              if (args.data) {
                args.data = walkData(args.data, fields);
              }
              if (operation === 'upsert') {
                if (args.create) args.create = walkData(args.create, fields);
                if (args.update) args.update = walkData(args.update, fields);
              }
            }
            const result = await query(args);
            if (fields && (operation.startsWith('find') || operation.startsWith('aggregate') || operation === 'groupBy')) {
              return walkResult(result, fields);
            }
            return result;
          },
        },
      },
    });

    try {
      await this._extended.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this._extended?.$disconnect();
    this.logger.log('Disconnected from database');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    const tablenames = await this._extended.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tablename)) {
        try {
          await this._extended.$executeRawUnsafe(
            `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
          );
        } catch {
          // ignore
        }
      }
    }
  }

  async enableQueryLogging() {
    this._extended.$on('query' as any, (e: any) => {
      this.logger.debug(`Query: ${e.query}`);
      this.logger.debug(`Params: ${e.params}`);
      this.logger.debug(`Duration: ${e.duration}ms`);
    });
  }
}
