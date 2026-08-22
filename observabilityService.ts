import { LoggerService } from './loggerService';
import { backgroundQueueService } from './backgroundQueueService';
import { AuditChainService } from './auditChainService';
import { ProcessLifecycleService } from './processLifecycleService';

export type ErrorCategory =
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'BUSINESS_RULE_ERROR'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR'
  | 'TIMEOUT'
  | 'SHUTDOWN_ERROR';

export interface RequestMetricsSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  statusCodes: Record<string, number>;
  statusClasses: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
  latency: {
    count: number;
    totalMs: number;
    minMs: number;
    maxMs: number;
    avgMs: number;
    p95Ms: number;
  };
}

export interface ErrorMetricsSummary {
  totalErrors: number;
  byCategory: Record<ErrorCategory, number>;
  byCode: Record<string, number>;
  recentErrors: Array<{
    category: ErrorCategory;
    code: string;
    message: string;
    correlationId: string;
    timestamp: string;
    orgId?: string;
  }>;
}

export interface RecoveryDiagnosticEvent {
  eventId: string;
  category: 'AUDIT' | 'QUEUE' | 'DATABASE' | 'LIFECYCLE' | 'HEALTH' | 'WORKER';
  whatFailed: string;
  actionTaken: string;
  recoveryState: 'RESOLVED' | 'RETRYING' | 'MANUAL_INTERVENTION_REQUIRED' | 'FAILED_CLOSED';
  correlationId: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface OperationalSnapshot {
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  lifecycle: {
    state: string;
    isDraining: boolean;
    activeRequests: number;
  };
  requests: RequestMetricsSummary;
  errors: ErrorMetricsSummary;
  queue: any;
  audit: any;
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    externalMb: number;
    status: 'HEALTHY' | 'WARN_HIGH_MEMORY';
  };
  health: {
    status: string;
    isLive: boolean;
    isReady: boolean;
  };
  recoveryEvents: RecoveryDiagnosticEvent[];
}

const MAX_RECENT_ERRORS = 50;
const MAX_RECOVERY_EVENTS = 50;
const MAX_LATENCY_SAMPLES = 200; // Bounded circular buffer for percentile computation

export class ObservabilityService {
  private static startTime = Date.now();

  // Request telemetry
  private static totalRequests = 0;
  private static successfulRequests = 0;
  private static failedRequests = 0;
  private static statusCodes: Map<string, number> = new Map();
  private static statusClasses = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  };
  private static latencySamples: number[] = [];
  private static latencyTotalMs = 0;
  private static latencyMinMs = Infinity;
  private static latencyMaxMs = 0;

  // Error telemetry
  private static totalErrors = 0;
  private static errorsByCategory: Record<ErrorCategory, number> = {
    AUTHENTICATION_ERROR: 0,
    AUTHORIZATION_ERROR: 0,
    VALIDATION_ERROR: 0,
    NOT_FOUND: 0,
    BUSINESS_RULE_ERROR: 0,
    DATABASE_ERROR: 0,
    EXTERNAL_SERVICE_ERROR: 0,
    INTERNAL_ERROR: 0,
    TIMEOUT: 0,
    SHUTDOWN_ERROR: 0,
  };
  private static errorsByCode: Map<string, number> = new Map();
  private static recentErrors: Array<{
    category: ErrorCategory;
    code: string;
    message: string;
    correlationId: string;
    timestamp: string;
    orgId?: string;
  }> = [];

  // Recovery diagnostics
  private static recoveryEvents: RecoveryDiagnosticEvent[] = [];

  /**
   * Classifies HTTP status code or error name into canonical ErrorCategory.
   */
  public static classifyError(statusCode: number, codeOrName?: string): ErrorCategory {
    if (statusCode === 401 || codeOrName === 'UNAUTHORIZED' || codeOrName === 'TOKEN_EXPIRED' || codeOrName === 'INVALID_TOKEN') {
      return 'AUTHENTICATION_ERROR';
    }
    if (statusCode === 403 || codeOrName === 'FORBIDDEN' || codeOrName === 'INSUFFICIENT_PERMISSIONS' || codeOrName === 'TENANT_MISMATCH') {
      return 'AUTHORIZATION_ERROR';
    }
    if (statusCode === 400 || statusCode === 422 || codeOrName === 'VALIDATION_ERROR') {
      return 'VALIDATION_ERROR';
    }
    if (statusCode === 404 || codeOrName === 'NOT_FOUND') {
      return 'NOT_FOUND';
    }
    if (statusCode === 409 || codeOrName === 'CONFLICT' || codeOrName === 'BUSINESS_RULE_ERROR') {
      return 'BUSINESS_RULE_ERROR';
    }
    if (statusCode === 408 || statusCode === 504 || codeOrName === 'TIMEOUT') {
      return 'TIMEOUT';
    }
    if (statusCode === 503 || codeOrName === 'SHUTDOWN_ERROR' || codeOrName === 'SERVER_DRAINING') {
      return 'SHUTDOWN_ERROR';
    }
    if (codeOrName?.includes('DB_') || codeOrName?.includes('FIRESTORE') || codeOrName?.includes('DATABASE')) {
      return 'DATABASE_ERROR';
    }
    if (codeOrName?.includes('EXTERNAL_') || codeOrName?.includes('GATEWAY') || codeOrName?.includes('PAYMENT_PROVIDER')) {
      return 'EXTERNAL_SERVICE_ERROR';
    }
    return 'INTERNAL_ERROR';
  }

  /**
   * Records request metrics deterministically upon HTTP completion.
   */
  public static recordRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
    correlationId?: string,
    tenantScope?: { orgId?: string; branchId?: string }
  ): void {
    this.totalRequests++;

    const statusStr = String(statusCode);
    this.statusCodes.set(statusStr, (this.statusCodes.get(statusStr) || 0) + 1);

    if (statusCode >= 200 && statusCode < 300) {
      this.successfulRequests++;
      this.statusClasses['2xx']++;
    } else if (statusCode >= 300 && statusCode < 400) {
      this.successfulRequests++;
      this.statusClasses['3xx']++;
    } else if (statusCode >= 400 && statusCode < 500) {
      this.failedRequests++;
      this.statusClasses['4xx']++;
    } else if (statusCode >= 500) {
      this.failedRequests++;
      this.statusClasses['5xx']++;
    }

    // Bounded latency tracking
    const validDuration = Math.max(0, durationMs);
    this.latencyTotalMs += validDuration;
    if (validDuration < this.latencyMinMs) this.latencyMinMs = validDuration;
    if (validDuration > this.latencyMaxMs) this.latencyMaxMs = validDuration;

    if (this.latencySamples.length >= MAX_LATENCY_SAMPLES) {
      this.latencySamples.shift();
    }
    this.latencySamples.push(validDuration);
  }

  /**
   * Records structured error metrics.
   */
  public static recordError(
    category: ErrorCategory,
    code: string,
    message: string,
    correlationId?: string,
    orgId?: string
  ): void {
    this.totalErrors++;
    if (this.errorsByCategory[category] !== undefined) {
      this.errorsByCategory[category]++;
    } else {
      this.errorsByCategory.INTERNAL_ERROR++;
    }

    this.errorsByCode.set(code, (this.errorsByCode.get(code) || 0) + 1);

    if (this.recentErrors.length >= MAX_RECENT_ERRORS) {
      this.recentErrors.shift();
    }

    this.recentErrors.push({
      category,
      code,
      message,
      correlationId: correlationId || 'none',
      timestamp: new Date().toISOString(),
      orgId,
    });
  }

  /**
   * Records a controlled recovery diagnostic event.
   */
  public static recordRecoveryEvent(event: Omit<RecoveryDiagnosticEvent, 'eventId' | 'timestamp'>): void {
    const fullEvent: RecoveryDiagnosticEvent = {
      eventId: `rec-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    if (this.recoveryEvents.length >= MAX_RECOVERY_EVENTS) {
      this.recoveryEvents.shift();
    }
    this.recoveryEvents.push(fullEvent);

    LoggerService.info(`[Recovery Diagnostics] ${event.category} event: ${event.actionTaken} (${event.recoveryState})`, {
      correlationId: event.correlationId,
      whatFailed: event.whatFailed,
      recoveryState: event.recoveryState,
    });
  }

  /**
   * Retrieves Request Metrics Summary.
   */
  public static getRequestMetrics(): RequestMetricsSummary {
    const count = this.totalRequests;
    const avgMs = count > 0 ? Math.round((this.latencyTotalMs / count) * 100) / 100 : 0;
    const minMs = this.latencyMinMs === Infinity ? 0 : this.latencyMinMs;
    const maxMs = this.latencyMaxMs;

    // Compute P95 from bounded samples
    let p95Ms = 0;
    if (this.latencySamples.length > 0) {
      const sorted = [...this.latencySamples].sort((a, b) => a - b);
      const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
      p95Ms = sorted[p95Index];
    }

    const statusCodesObj: Record<string, number> = {};
    for (const [code, c] of this.statusCodes.entries()) {
      statusCodesObj[code] = c;
    }

    return {
      totalRequests: count,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      statusCodes: statusCodesObj,
      statusClasses: { ...this.statusClasses },
      latency: {
        count,
        totalMs: this.latencyTotalMs,
        minMs,
        maxMs,
        avgMs,
        p95Ms,
      },
    };
  }

  /**
   * Retrieves Error Metrics Summary.
   */
  public static getErrorMetrics(orgIdFilter?: string): ErrorMetricsSummary {
    const codesObj: Record<string, number> = {};
    for (const [code, count] of this.errorsByCode.entries()) {
      codesObj[code] = count;
    }

    const filteredRecent = orgIdFilter
      ? this.recentErrors.filter((e) => !e.orgId || e.orgId === orgIdFilter)
      : this.recentErrors;

    return {
      totalErrors: this.totalErrors,
      byCategory: { ...this.errorsByCategory },
      byCode: codesObj,
      recentErrors: filteredRecent.slice(-MAX_RECENT_ERRORS),
    };
  }

  /**
   * Retrieves Recovery Diagnostic Events.
   */
  public static getRecoveryEvents(): RecoveryDiagnosticEvent[] {
    return [...this.recoveryEvents];
  }

  /**
   * Builds an authenticated, tenant-safe Operational Snapshot.
   */
  public static getOperationalSnapshot(
    requesterContext?: { role?: string; orgId?: string }
  ): OperationalSnapshot {
    const memory = process.memoryUsage();
    const heapUsedMb = Math.round(memory.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.round(memory.heapTotal / 1024 / 1024);
    const rssMb = Math.round(memory.rss / 1024 / 1024);
    const externalMb = Math.round(memory.external / 1024 / 1024);
    const isMemoryHealthy = heapUsedMb < 1024;

    const requestSummary = this.getRequestMetrics();
    const errorSummary = this.getErrorMetrics(requesterContext?.orgId);
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    const queueSummary = backgroundQueueService.getMetrics();
    const auditSummary = AuditChainService.getAuditMetrics(requesterContext?.orgId);
    const lifecycleState = ProcessLifecycleService.getState();
    const isDraining = ProcessLifecycleService.isShuttingDown();
    const activeRequests = ProcessLifecycleService.getActiveRequestCount();

    return {
      service: 'FabriQ Enterprise Platform API',
      version: '2.6.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      lifecycle: {
        state: lifecycleState,
        isDraining,
        activeRequests,
      },
      requests: requestSummary,
      errors: errorSummary,
      queue: queueSummary,
      audit: auditSummary,
      memory: {
        heapUsedMb,
        heapTotalMb,
        rssMb,
        externalMb,
        status: isMemoryHealthy ? 'HEALTHY' : 'WARN_HIGH_MEMORY',
      },
      health: {
        status: isDraining ? 'DRAINING' : 'HEALTHY',
        isLive: !isDraining,
        isReady: !isDraining && isMemoryHealthy,
      },
      recoveryEvents: this.getRecoveryEvents(),
    };
  }

  /**
   * Resets all metrics for deterministic test isolation.
   */
  public static resetMetricsForTest(): void {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.statusCodes.clear();
    this.statusClasses = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    this.latencySamples = [];
    this.latencyTotalMs = 0;
    this.latencyMinMs = Infinity;
    this.latencyMaxMs = 0;

    this.totalErrors = 0;
    this.errorsByCategory = {
      AUTHENTICATION_ERROR: 0,
      AUTHORIZATION_ERROR: 0,
      VALIDATION_ERROR: 0,
      NOT_FOUND: 0,
      BUSINESS_RULE_ERROR: 0,
      DATABASE_ERROR: 0,
      EXTERNAL_SERVICE_ERROR: 0,
      INTERNAL_ERROR: 0,
      TIMEOUT: 0,
      SHUTDOWN_ERROR: 0,
    };
    this.errorsByCode.clear();
    this.recentErrors = [];
    this.recoveryEvents = [];
    this.startTime = Date.now();
  }
}
