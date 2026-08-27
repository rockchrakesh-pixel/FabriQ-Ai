import { LoggerService } from './loggerService';

export interface TimeoutOptions {
  timeoutMs?: number;
  maxRetries?: number;
  backoffMs?: number;
  operationName?: string;
  correlationId?: string;
}

export async function executeWithTimeoutAndRetry<T>(
  asyncFn: (signal?: AbortSignal) => Promise<T>,
  options: TimeoutOptions = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs || 10000; // Default 10s
  const maxRetries = options.maxRetries ?? 2; // Default 2 retries
  const backoffMs = options.backoffMs || 500;
  const operationName = options.operationName || 'AnonymousAsyncOperation';
  const correlationId = options.correlationId || 'none';

  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await asyncFn(controller.signal);
      clearTimeout(timer);
      return result;
    } catch (err: any) {
      clearTimeout(timer);
      const isAbortError = err?.name === 'AbortError' || err?.message?.includes('aborted');
      const isRetryable =
        isAbortError ||
        err?.status === 429 ||
        err?.status === 503 ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ECONNRESET';

      LoggerService.warn(`Operation '${operationName}' failed on attempt ${attempt}/${maxRetries + 1}`, {
        correlationId,
        error: err?.message || err,
        isAbortError,
        isRetryable,
        attempt,
      });

      if (!isRetryable || attempt > maxRetries) {
        if (isAbortError) {
          throw new Error(`Operation '${operationName}' timed out after ${timeoutMs}ms`);
        }
        throw err;
      }

      // Exponential backoff
      const delay = backoffMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Operation '${operationName}' failed after ${maxRetries + 1} attempts`);
}
