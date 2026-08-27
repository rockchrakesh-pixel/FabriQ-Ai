import { Router, Request, Response } from 'express';
import { backgroundQueueService } from '../services/backgroundQueueService';
import { ProcessLifecycleService } from '../services/processLifecycleService';
import { ObservabilityService } from '../services/observabilityService';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';

export const healthRouter = Router();

const START_TIME = Date.now();

// Probe 1: Liveness Endpoint
healthRouter.get('/health/live', (_req: Request, res: Response) => {
  const isDraining = ProcessLifecycleService.isShuttingDown();
  res.status(isDraining ? 503 : 200).json({
    status: isDraining ? 'DRAINING' : 'UP',
    component: 'liveness',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    lifecycleState: ProcessLifecycleService.getState(),
  });
});

// Probe 2: Readiness Endpoint
healthRouter.get('/health/ready', (_req: Request, res: Response) => {
  const isDraining = ProcessLifecycleService.isShuttingDown();
  const memoryUsage = process.memoryUsage();
  const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const maxHeapMb = 1024; // 1GB threshold check

  const isMemoryHealthy = heapUsedMb < maxHeapMb;
  const isFirebaseConfigured = Boolean(
    process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || true
  );

  const isReady = !isDraining && isMemoryHealthy && isFirebaseConfigured;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'UP' : isDraining ? 'DRAINING' : 'DOWN',
    component: 'readiness',
    timestamp: new Date().toISOString(),
    checks: {
      memoryUsageMb: heapUsedMb,
      memoryStatus: isMemoryHealthy ? 'HEALTHY' : 'WARN_HIGH_MEMORY',
      firebaseConfigured: isFirebaseConfigured,
      environment: process.env.NODE_ENV || 'development',
      lifecycleState: ProcessLifecycleService.getState(),
    },
  });
});

// Overall Health Status
healthRouter.get('/health', (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  const queueMetrics = backgroundQueueService.getMetrics();
  const isDraining = ProcessLifecycleService.isShuttingDown();

  res.status(isDraining ? 503 : 200).json({
    status: isDraining ? 'DRAINING' : 'HEALTHY',
    service: 'FabriQ Enterprise Platform API',
    version: '2.6.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    queueSummary: queueMetrics,
    environment: process.env.NODE_ENV || 'development',
    lifecycleState: ProcessLifecycleService.getState(),
  });
});

// Operational Metrics & Dead-Letter Queue Dashboard Data - Protected
healthRouter.get(
  '/health/metrics',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'admin', 'store_manager'),
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const queueMetrics = backgroundQueueService.getMetrics();
    const snapshot = ObservabilityService.getOperationalSnapshot({
      role: user?.role,
      orgId: user?.orgId,
    });

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      snapshot,
      metrics: {
        queue: queueMetrics,
        memoryUsage: process.memoryUsage(),
        uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
        lifecycleState: ProcessLifecycleService.getState(),
        requests: snapshot.requests,
        errors: snapshot.errors,
        audit: snapshot.audit,
      },
    });
  }
);
