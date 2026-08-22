import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Lightweight in-memory rate limiter middleware for sensitive API routes.
 */
export function createRateLimiter(options: { windowMs?: number; maxRequests?: number } = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const maxRequests = options.maxRequests || 60; // 60 requests / minute default
  const store: RateLimitStore = {};

  // Periodically clean up expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const ip in store) {
      if (store[ip].resetTime < now) {
        delete store[ip];
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    if (!store[clientIp] || store[clientIp].resetTime < now) {
      store[clientIp] = {
        count: 1,
        resetTime: now + windowMs,
      };
      next();
      return;
    }

    store[clientIp].count += 1;

    if (store[clientIp].count > maxRequests) {
      const retryAfter = Math.ceil((store[clientIp].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        error: 'Too Many Requests: Rate limit exceeded. Please wait before retrying.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    next();
  };
}
