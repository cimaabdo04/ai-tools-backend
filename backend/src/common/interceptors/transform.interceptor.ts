import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Reflector } from '@nestjs/core';

export interface WrappedResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  timestamp: string;
  statusCode: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    const skipTransform = this.reflector.get<boolean>(
      'skipTransform',
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data: any) => {
        if (skipTransform || data?.__raw) {
          return data?.data ?? data;
        }

        const result: WrappedResponse<T> = {
          success: true,
          message: data?.message || 'Operation successful',
          timestamp: new Date().toISOString(),
          statusCode,
        };

        if (data?.data !== undefined) {
          result.data = data.data;
        } else if (data?.message) {
          const { message: _msg, ...rest } = data;
          if (Object.keys(rest).length > 0) {
            result.data = rest as T;
          }
        } else {
          result.data = data as T;
        }

        if (data?.meta) {
          result.meta = data.meta;
        }

        return result;
      }),
    );
  }
}
