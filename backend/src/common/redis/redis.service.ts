import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly defaultTtl: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);
    const keyPrefix = this.configService.get<string>('redis.keyPrefix', 'aitools:');
    this.defaultTtl = this.configService.get<number>('redis.ttl', 3600);

    this.client = new Redis({
      host,
      port,
      password,
      db,
      keyPrefix,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', (delay) => {
      this.logger.warn(`Reconnecting to Redis in ${delay}ms`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key "${key}"`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl !== undefined && ttl !== null) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.setex(key, this.defaultTtl, value);
      }
    } catch (error) {
      this.logger.error(`Error setting key "${key}"`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key "${key}"`, error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          const pipeline = this.client.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        }
      });

      return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern "${pattern}"`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking key "${key}"`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key "${key}"`, error);
      return -2;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key "${key}"`, error);
      return 0;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      this.logger.error(`Error setting expiry for key "${key}"`, error);
    }
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Error HSET "${key}" field "${field}"`, error);
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Error HGET "${key}" field "${field}"`, error);
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      const result = await this.client.hgetall(key);
      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      this.logger.error(`Error HGETALL "${key}"`, error);
      return null;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Error SADD "${key}"`, error);
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      this.logger.error(`Error SMEMBERS "${key}"`, error);
      return [];
    }
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    try {
      await this.client.zadd(key, score, member);
    } catch (error) {
      this.logger.error(`Error ZADD "${key}"`, error);
    }
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zrevrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Error ZREVRANGE "${key}"`, error);
      return [];
    }
  }

  async zscore(key: string, member: string): Promise<number | null> {
    try {
      const result = await this.client.zscore(key, member);
      return result ? parseFloat(result) : null;
    } catch (error) {
      this.logger.error(`Error ZSCORE "${key}"`, error);
      return null;
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
