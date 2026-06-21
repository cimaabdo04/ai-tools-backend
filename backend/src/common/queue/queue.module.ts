import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService, QueueNames } from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: QueueNames.EMAIL,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            password: configService.get('redis.password'),
            db: configService.get('redis.db', 0),
          },
          defaultJobOptions: configService.get('redis.bull.defaultJobOptions', {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: 100,
            removeOnFail: 50,
          }),
        }),
      },
      {
        name: QueueNames.NOTIFICATION,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            password: configService.get('redis.password'),
            db: configService.get('redis.db', 0),
          },
        }),
      },
      {
        name: QueueNames.ANALYTICS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            password: configService.get('redis.password'),
            db: configService.get('redis.db', 0),
          },
        }),
      },
      {
        name: QueueNames.SEARCH_INDEX,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            password: configService.get('redis.password'),
            db: configService.get('redis.db', 0),
          },
        }),
      },
      {
        name: QueueNames.AUDIT_LOG,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            password: configService.get('redis.password'),
            db: configService.get('redis.db', 0),
          },
        }),
      },
      {
        name: QueueNames.SCORE_CALCULATION,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            password: configService.get('redis.password'),
            db: configService.get('redis.db', 0),
          },
        }),
      },
      {
        name: QueueNames.IMAGE_PROCESSING,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            password: configService.get('redis.password'),
            db: configService.get('redis.db', 0),
          },
        }),
      },
    ),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
