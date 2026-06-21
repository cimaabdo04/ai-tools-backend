import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';

export enum QueueNames {
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  ANALYTICS = 'analytics',
  SEARCH_INDEX = 'search-index',
  AUDIT_LOG = 'audit-log',
  SCORE_CALCULATION = 'score-calculation',
  IMAGE_PROCESSING = 'image-processing',
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QueueNames.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QueueNames.NOTIFICATION) private readonly notificationQueue: Queue,
    @InjectQueue(QueueNames.ANALYTICS) private readonly analyticsQueue: Queue,
    @InjectQueue(QueueNames.SEARCH_INDEX) private readonly searchIndexQueue: Queue,
    @InjectQueue(QueueNames.AUDIT_LOG) private readonly auditLogQueue: Queue,
    @InjectQueue(QueueNames.SCORE_CALCULATION) private readonly scoreCalculationQueue: Queue,
    @InjectQueue(QueueNames.IMAGE_PROCESSING) private readonly imageProcessingQueue: Queue,
  ) {}

  async addEmailJob(data: EmailJobData, options?: JobOptions): Promise<Job> {
    return this.addJob(QueueNames.EMAIL, data, options);
  }

  async addNotificationJob(data: NotificationJobData, options?: JobOptions): Promise<Job> {
    return this.addJob(QueueNames.NOTIFICATION, data, options);
  }

  async addAnalyticsJob(data: AnalyticsJobData, options?: JobOptions): Promise<Job> {
    return this.addJob(QueueNames.ANALYTICS, data, options);
  }

  async addSearchIndexJob(data: SearchIndexJobData, options?: JobOptions): Promise<Job> {
    return this.addJob(QueueNames.SEARCH_INDEX, data, options);
  }

  async addAuditLogJob(data: AuditLogJobData, options?: JobOptions): Promise<Job> {
    return this.addJob(QueueNames.AUDIT_LOG, data, options);
  }

  async addScoreCalculationJob(data: ScoreCalculationJobData, options?: JobOptions): Promise<Job> {
    return this.addJob(QueueNames.SCORE_CALCULATION, data, options);
  }

  async addImageProcessingJob(data: ImageProcessingJobData, options?: JobOptions): Promise<Job> {
    return this.addJob(QueueNames.IMAGE_PROCESSING, data, options);
  }

  private getQueue(name: QueueNames): Queue {
    const queues: Record<QueueNames, Queue> = {
      [QueueNames.EMAIL]: this.emailQueue,
      [QueueNames.NOTIFICATION]: this.notificationQueue,
      [QueueNames.ANALYTICS]: this.analyticsQueue,
      [QueueNames.SEARCH_INDEX]: this.searchIndexQueue,
      [QueueNames.AUDIT_LOG]: this.auditLogQueue,
      [QueueNames.SCORE_CALCULATION]: this.scoreCalculationQueue,
      [QueueNames.IMAGE_PROCESSING]: this.imageProcessingQueue,
    };
    return queues[name];
  }

  private async addJob(name: QueueNames, data: any, options?: JobOptions): Promise<Job> {
    try {
      const queue = this.getQueue(name);
      const job = await queue.add(name, data, {
        removeOnComplete: 100,
        removeOnFail: 50,
        ...options,
      });
      this.logger.debug(`Job ${job.id} added to queue ${name}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add job to queue ${name}`, error);
      throw error;
    }
  }

  async getQueueMetrics(name: QueueNames) {
    const queue = this.getQueue(name);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }

  async pauseQueue(name: QueueNames): Promise<void> {
    const queue = this.getQueue(name);
    await queue.pause();
    this.logger.warn(`Queue ${name} paused`);
  }

  async resumeQueue(name: QueueNames): Promise<void> {
    const queue = this.getQueue(name);
    await queue.resume();
    this.logger.log(`Queue ${name} resumed`);
  }

  async emptyQueue(name: QueueNames): Promise<void> {
    const queue = this.getQueue(name);
    await queue.drain();
    this.logger.warn(`Queue ${name} emptied`);
  }
}

export interface JobOptions {
  delay?: number;
  attempts?: number;
  backoff?: { type: 'exponential' | 'fixed'; delay: number };
  priority?: number;
  removeOnComplete?: number | boolean;
  removeOnFail?: number | boolean;
}

export interface EmailJobData {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, unknown>;
  html?: string;
  text?: string;
  attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface AnalyticsJobData {
  eventType: string;
  userId?: string;
  toolId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchIndexJobData {
  action: 'index' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data?: Record<string, unknown>;
}

export interface AuditLogJobData {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface ScoreCalculationJobData {
  toolId: string;
}

export interface ImageProcessingJobData {
  filePath: string;
  outputPath: string;
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  };
}
