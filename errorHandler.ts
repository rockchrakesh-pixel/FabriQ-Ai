import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/loggerService';
import { ProcessLifecycleService } from '../services/processLifecycleService';
import { ObservabilityService } from '../services/observabilityService';

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Checks if the system is currently in a graceful shutdown phase.
 */
export function getShutdownState(): boolean {
  return ProcessLifecycleService.isShuttingDown();
}

/**
 * Allows overriding or resetting shutdown behavior (for unit tests / test isolation).
 */
export function setShutdownCallbackForTest(cb: ((reason: string, exitCode: number) => void) | null): void {
  ProcessLifecycleService.setShutdownCallbackForTest(cb);
}

export function resetShutdownStateForTest(): void {
  ProcessLifecycleService.resetLifecycleForTest();
}

/**
 * Sanitizes strings by removing stack traces, internal paths, and token values.
 */
export function sanitizeErrorMessage(message: string, isProduction = false): string {
  if (!message) return 'An unexpected error occurred.';
  
  // If in production and message looks like an internal runtime exception / stack trace
  if (isProduction && (message.includes('at ') || message.includes('node_modules') || message.includes('.ts:') || message.includes('.js:'))) {
    return 'An unexpected internal server error occurred.';
  }

  // Redact potential bearer tokens, credentials, or file paths
  let sanitized = message
    .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/(?:[a-zA-Z]:|\/)[^\s:]+\.(?:ts|js|json|env|mjs|cjs)/gi, '[REDACTED_PATH]')
    .replace(/key=[A-Za-z0-9_\-]+/gi, 'key=[REDACTED_KEY]')
    .replace(/secret=[A-Za-z0-9_\-]+/gi, 'secret=[REDACTED_SECRET]');

  return sanitized;
}

/**
 * Maps error classification to standardized error codes.
 */
export function getErrorCode(statusCode: number, errName?: string): string {
  if (statusCode === 400) return 'VALIDATION_ERROR';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 429) return 'RATE_LIMITED';
  if (errName === 'TokenExpiredError') return 'TOKEN_EXPIRED';
  if (errName === 'JsonWebTokenError') return 'INVALID_TOKEN';
  return 'INTERNAL_SERVER_ERROR';
}

/**
 * Global Error Handler Middleware
 */
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || err.status || 500;
  const correlationId = (req as any).correlationId || req.headers?.['x-correlation-id'] || `corr-err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const code = err.code || getErrorCode(statusCode, err.name);
  const rawMessage = err.message || 'An unexpected error occurred.';
  const sanitizedMessage = sanitizeErrorMessage(rawMessage, isProd);
  const user = (req as any).user;

  // Record classified error metrics in ObservabilityService
  const category = ObservabilityService.classifyError(statusCode, code || err.name);
  ObservabilityService.recordError(category, code, sanitizedMessage, correlationId, user?.orgId);

  // Set correlation header on response
  if (res.setHeader && !res.headersSent) {
    res.setHeader('X-Correlation-ID', correlationId);
  }

  // Structured Logging via LoggerService
  const logPayload = {
    correlationId,
    statusCode,
    code,
    route: req.originalUrl || req.url,
    method: req.method,
    error: sanitizedMessage,
    ...(isProd ? {} : { stack: err.stack }),
  };

  if (statusCode >= 500) {
    LoggerService.error(`[Global Error] ${req.method} ${req.originalUrl} failed: ${sanitizedMessage}`, logPayload);
  } else {
    LoggerService.warn(`[Client Warning] ${req.method} ${req.originalUrl} rejected with ${statusCode}: ${sanitizedMessage}`, logPayload);
  }

  // Return sanitized response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: sanitizedMessage,
    },
    code,
    message: sanitizedMessage,
    correlationId,
  });
}

/**
 * Async handler utility to wrap asynchronous express route callbacks.
 * Catches unhandled promise rejections and forwards them cleanly to next(err).
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Initiates graceful shutdown upon unrecoverable process-level failure or termination signal.
 */
export function initiateGracefulShutdown(reason: string, exitCode = 1): boolean {
  if (ProcessLifecycleService.isShuttingDown()) {
    LoggerService.warn(`[Process Resilience] Shutdown already in progress. Ignoring duplicate trigger for: ${reason}`);
    return false;
  }

  return ProcessLifecycleService.initiateGracefulShutdown(reason, exitCode, { isFatal: exitCode !== 0 });
}

/**
 * Registers process-level event listeners for uncaughtException and unhandledRejection.
 */
export function registerProcessFailureHandlers(): void {
  process.on('uncaughtException', (err: Error) => {
    LoggerService.error(`[Process Resilience] FATAL: Uncaught Exception: ${err.message}`, {
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
    initiateGracefulShutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (reason: any) => {
    const errorMsg = reason instanceof Error ? reason.message : String(reason);
    LoggerService.error(`[Process Resilience] FATAL: Unhandled Promise Rejection: ${errorMsg}`, {
      reason: errorMsg,
    });
    initiateGracefulShutdown('unhandledRejection', 1);
  });
}
