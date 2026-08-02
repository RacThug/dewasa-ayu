import { CEREMONY_IDS } from '@dewasa-ayu/ceremony-rules';
import { WarigaError } from '@dewasa-ayu/wariga-engine';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { ZodValidationException } from 'nestjs-zod';

/** Minimal response shape we use — avoids depending on express types directly. */
interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

type ErrorCode =
  | 'INVALID_DATE'
  | 'UNKNOWN_CEREMONY'
  | 'INVALID_PARAM'
  | 'OUT_OF_RANGE'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

// WarigaError codes are all client errors (400).
const WARIGA_STATUS = 400;

function httpStatusToCode(status: number): ErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  return status < 500 ? 'INVALID_PARAM' : 'INTERNAL_ERROR';
}

/**
 * Maps every thrown error to the API error envelope (API-001 / PRD §16.4):
 * `{ success: false, error: { code, message, details? } }`. Engine `WarigaError`s,
 * Zod validation failures, throttling, and other HTTP exceptions all funnel here.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Api');

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<HttpResponse>();

    let status = 500;
    let code: ErrorCode = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof WarigaError) {
      status = WARIGA_STATUS;
      code = exception.code;
      message = exception.message;
      if (exception.code === 'UNKNOWN_CEREMONY') details = { valid_ceremonies: CEREMONY_IDS };
    } else if (exception instanceof ZodValidationException) {
      status = 400;
      code = 'INVALID_PARAM';
      message = 'Request validation failed';
      // getZodError() is typed `unknown` (nestjs-zod v5 supports Zod 3 & 4); read .issues defensively.
      const zodError = exception.getZodError() as { issues?: unknown };
      details = { issues: zodError.issues ?? [] };
    } else if (exception instanceof ThrottlerException) {
      status = 429;
      code = 'RATE_LIMITED';
      message = 'Too many requests';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = httpStatusToCode(status);
      message = exception.message;
    } else {
      this.logger.error(
        exception instanceof Error ? (exception.stack ?? exception.message) : String(exception),
      );
    }

    res.status(status).json({
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    });
  }
}
