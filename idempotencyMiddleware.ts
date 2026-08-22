import { Request, Response, NextFunction } from 'express';
import { IdempotencyService } from '../services/idempotencyService';

export interface IdempotencyRequest extends Request {
  idempotencyKey?: string;
  isIdempotentReplay?: boolean;
}

/**
 * Express middleware that enforces distributed persistent idempotency on mutation endpoints.
 */
export function requireIdempotency(actionName?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Extract Idempotency Key from headers or body
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      (req.headers['x-idempotency-key'] as string) ||
      (req.body && req.body.idempotencyKey) ||
      (req.query && (req.query.idempotencyKey as string));

    if (!idempotencyKey) {
      // If endpoint permits optional idempotency key, proceed without caching
      return next();
    }

    const userClaims = (req as any).userClaims || (req as any).user || {
      orgId: 'org-fabriq-global',
      uid: 'anonymous',
      role: 'customer',
    };

    const action = actionName || `${req.method}_${req.path.replace(/\//g, '_')}`;
    const requestHash = IdempotencyService.generateRequestHash(req.method, req.path, userClaims.orgId, req.body);

    // 2. Acquire persistent lock or retrieve existing record
    const lockResult = IdempotencyService.acquireLock({
      idempotencyKey,
      orgId: userClaims.orgId,
      franchiseId: userClaims.franchiseId || null,
      branchId: userClaims.branchId || null,
      userId: userClaims.uid || 'anonymous',
      userRole: userClaims.role || 'customer',
      action,
      endpoint: `${req.method} ${req.path}`,
      requestHash,
    });

    if (lockResult.result === 'FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: lockResult.error,
        code: 'IDEMPOTENCY_TENANT_FORBIDDEN',
      });
      return;
    }

    if (lockResult.result === 'CONFLICT') {
      res.status(409).json({
        success: false,
        error: lockResult.error,
        code: 'IDEMPOTENCY_KEY_REUSE_CONFLICT',
      });
      return;
    }

    if (lockResult.result === 'PROCESSING') {
      res.status(429).json({
        success: false,
        error: `Request with idempotency key '${idempotencyKey}' is currently processing. Please wait for completion before retrying.`,
        code: 'IDEMPOTENCY_REQUEST_IN_FLIGHT',
      });
      return;
    }

    if (lockResult.result === 'REPLAY') {
      const cached = lockResult.record;
      (req as IdempotencyRequest).idempotencyKey = idempotencyKey;
      (req as IdempotencyRequest).isIdempotentReplay = true;

      // Replay original cached response
      const payload = {
        ...cached.responsePayload,
        idempotentRetried: true,
        idempotencyKey,
      };

      res.status(cached.statusCode || 200).json(payload);
      return;
    }

    // 3. Status ACQUIRED -> Intercept res.json to capture response payload and complete lock
    (req as IdempotencyRequest).idempotencyKey = idempotencyKey;
    (req as IdempotencyRequest).isIdempotentReplay = false;

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const statusCode = res.statusCode || 200;
      if (statusCode >= 200 && statusCode < 300) {
        IdempotencyService.complete(idempotencyKey, statusCode, body, body?.id || body?.orderId || body?.eventId || body?.requisitionId);
      } else {
        IdempotencyService.fail(idempotencyKey, statusCode, body?.error || 'Operation failed');
      }
      return originalJson(body);
    };

    next();
  };
}
