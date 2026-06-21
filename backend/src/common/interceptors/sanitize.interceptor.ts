import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  private readonly defaultOptions: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    stripAllTags: true,
    allowedSchemes: [],
    disallowedTagsMode: 'discard',
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }

    if (request.query) {
      request.query = this.sanitizeObject(request.query);
    }

    if (request.params) {
      request.params = this.sanitizeObject(request.params);
    }

    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'string') {
          return sanitizeHtml(data, this.defaultOptions);
        }
        return data;
      }),
    );
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      if (typeof obj === 'string') {
        return sanitizeHtml(obj, this.defaultOptions);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeObject(value);
    }
    return sanitized;
  }
}
