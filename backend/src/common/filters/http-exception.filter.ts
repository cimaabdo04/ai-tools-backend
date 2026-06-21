import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || exception.message;

        if (Array.isArray(resp.message)) {
          errors = this.formatValidationErrors(resp.message as string[]);
          message = 'Validation failed';
        } else if (typeof resp.errors === 'object') {
          errors = resp.errors as Record<string, string[]>;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
        `${request.method} ${request.url}`,
      );
    }

    const timestamp = new Date().toISOString();

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp,
      path: request.url,
    });
  }

  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    for (const msg of messages) {
      const match = msg.match(/^(\w+)\s/);
      if (match) {
        const field = match[1].toLowerCase();
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(msg);
      } else {
        if (!errors._general) {
          errors._general = [];
        }
        errors._general.push(msg);
      }
    }
    return errors;
  }
}
