import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const user = request.user;
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    const action = this.mapMethodToAction(method);
    const entity = this.extractEntity(url);

    if (!action || !entity || method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          this.createAuditLog({
            action,
            entity,
            entityId: this.extractEntityId(url),
            userId: user?.id,
            ipAddress,
            userAgent,
            metadata: {
              method,
              url,
              userAgent,
              body: this.sanitizeBody(request.body),
            },
          });
        },
        error: () => {
          this.createAuditLog({
            action: `${action}_failed`,
            entity,
            entityId: this.extractEntityId(url),
            userId: user?.id,
            ipAddress,
            userAgent,
            metadata: {
              method,
              url,
              userAgent,
              body: this.sanitizeBody(request.body),
              error: true,
            },
          });
        },
      }),
    );
  }

  private async createAuditLog(data: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.prisma.auditLog.create({ data });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  private mapMethodToAction(method: string): string | null {
    const map: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    return map[method] || null;
  }

  private extractEntity(url: string): string {
    const parts = url.split('/').filter(Boolean);
    const apiIndex = parts.findIndex((p) => p === 'v1');
    if (apiIndex !== -1 && parts[apiIndex + 1]) {
      return parts[apiIndex + 1].replace(/s$/, '');
    }
    return 'unknown';
  }

  private extractEntityId(url: string): string | undefined {
    const parts = url.split('/').filter(Boolean);
    const apiIndex = parts.findIndex((p) => p === 'v1');
    if (apiIndex !== -1 && parts[apiIndex + 2] && parts[apiIndex + 2] !== 'create') {
      const id = parts[apiIndex + 2];
      if (!id.includes('?') && id !== 'create') {
        return id;
      }
    }
    return undefined;
  }

  private sanitizeBody(body: any): Record<string, unknown> | undefined {
    if (!body) return undefined;
    const sensitiveFields = ['password', 'passwordHash', 'passwordConfirm', 'token', 'secret', 'creditCard', 'ssn'];
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (sensitiveFields.includes(key)) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
