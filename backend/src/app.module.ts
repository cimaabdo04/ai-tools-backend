import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { appConfig, databaseConfig, redisConfig, jwtConfig, stripeConfig } from './config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { QueueModule } from './common/queue/queue.module';
import { MailModule } from './common/mail/mail.module';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { MaintenanceGuard } from './common/guards/maintenance.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ToolsModule } from './modules/tools/tools.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { SearchModule } from './modules/search/search.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CmsModule } from './modules/cms/cms.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { EditsModule } from './modules/edits/edits.module';
import { AuditModule } from './modules/audit/audit.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { BannersModule } from './modules/banners/banners.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { WhiteLabelModule } from './modules/white-label/white-label.module';
import { ImportModule } from './modules/import/import.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, stripeConfig],
      envFilePath: ['.env', '.env.local', `.env.${process.env.NODE_ENV || 'development'}`],
      cache: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: config.get<number>('throttle.ttl', 60000),
          limit: config.get<number>('throttle.limit', 60),
        }],
      }),
    }),
    ScheduleModule.forRoot(),
    ...(process.env.REDIS_HOST
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              connection: {
                host: config.get('redis.host', 'localhost'),
                port: config.get('redis.port', 6379),
                password: config.get('redis.password'),
                db: config.get('redis.db', 0),
              },
              defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: 100,
                removeOnFail: 50,
              },
              prefix: 'aitools:bull',
            }),
          }),
        ]
      : []),
    PrismaModule,
    ...(process.env.REDIS_HOST ? [RedisModule] : []),
    ...(process.env.REDIS_HOST ? [QueueModule] : []),
    MailModule,
    AuthModule,
    UsersModule,
    ToolsModule,
    CategoriesModule,
    TagsModule,
    SearchModule,
    ReviewsModule,
    BookmarksModule,
    CollectionsModule,
    RecommendationsModule,
    PaymentsModule,
    PricingModule,
    AnalyticsModule,
    CmsModule,
    NotificationsModule,
    MessagesModule,
    ReportsModule,
    ClaimsModule,
    EditsModule,
    AuditModule,
    ApiKeysModule,
    BannersModule,
    AffiliatesModule,
    WhiteLabelModule,
    ImportModule,
    SettingsModule,
    AdminModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_GUARD, useClass: MaintenanceGuard },
  ],
})
export class AppModule {}
