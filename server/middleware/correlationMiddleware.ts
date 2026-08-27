import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/loggerService';
import { ObservabilityService } from '../services/observabilityService';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incomingCorrelationId = req.header('X-Correlation-ID') || req.header('x-correlation-id');
  const correlationId = incomingCorrelationId || `corr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  req.correlationId = correlationId;
  req.startTime = Date.now();

  res.setHeader('X-Correlation-ID', correlationId);

  res.on('finish', () => {
    const isStaticViteAsset =
      req.originalUrl.startsWith('/src/') ||
      req.originalUrl.startsWith('/@') ||
      req.originalUrl.startsWith('/node_modules/') ||
      req.originalUrl.startsWith('/public/') ||
      req.originalUrl.endsWith('.ico') ||
      req.originalUrl.endsWith('.tsx') ||
      req.originalUrl.endsWith('.ts') ||
      req.originalUrl.endsWith('.css');

    if (isStaticViteAsset) {
      return;
    }

    const durationMs = req.startTime ? Date.now() - req.startTime : 0;
    const user = (req as any).user;

    // Record request telemetry in ObservabilityService
    ObservabilityService.recordRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      durationMs,
      correlationId,
      { orgId: user?.orgId, branchId: user?.branchId }
    );

    LoggerService.info(`HTTP ${req.method} ${req.originalUrl} finished with status ${res.statusCode}`, {
      correlationId,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      durationMs,
      userId: user?.uid,
      orgId: user?.orgId,
      franchiseId: user?.franchiseId,
      branchId: user?.branchId,
    });
  });

  next();
};
