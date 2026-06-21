import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'aitools:',
  ttl: parseInt(process.env.REDIS_CACHE_TTL || '3600', 10),

  bull: {
    prefix: process.env.BULL_PREFIX || 'aitools:bull',
    defaultJobOptions: {
      attempts: parseInt(process.env.BULL_ATTEMPTS || '3', 10),
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.BULL_BACKOFF_DELAY || '1000', 10),
      },
      removeOnComplete: parseInt(process.env.BULL_REMOVE_ON_COMPLETE || '100', 10),
      removeOnFail: parseInt(process.env.BULL_REMOVE_ON_FAIL || '50', 10),
    },
  },
}));
