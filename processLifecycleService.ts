import http from 'http';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './loggerService';
import { backgroundQueueService } from './backgroundQueueService';

export type LifecycleState =
  | 'RUNNING'
  | 'SHUTDOWN_REQUESTED'
  | 'DRAINING'
  | 'RESOURCES_CLOSING'
  | 'SHUTDOWN_COMPLETE';

export interface CleanupHook {
  name: string;
  fn: () => Promise<void> | void;
}

export class ProcessLifecycleService {
  private static state: LifecycleState = 'RUNNING';
  private static activeRequestCount: number = 0;
  private static httpServer: http.Server | null = null;
  private static cleanupHooks: CleanupHook[] = [];
  private static shutdownCallback: ((reason: string, exitCode: number) => void) | null = null;
  private static signalHandlersRegistered = false;
  private static lastShutdownReason: string | null = null;
  private static stateTransitions: Array<{ from: LifecycleState; to: LifecycleState; timestamp: string; reason?: string }> = [];

  /**
   * Retrieves current lifecycle state of the process.
   */
  public static getState(): LifecycleState {
    return this.state;
  }

  /**
   * Returns true if shutdown has been requested or is in progress.
   */
  public static isShuttingDown(): boolean {
    return this.state !== 'RUNNING';
  }

  /**
   * Configurable shutdown timeout in milliseconds.
   * Defaults to 30,000ms (30 seconds) with fallback.
   */
  public static getShutdownTimeoutMs(): number {
    const envVal = process.env.FABRIQ_SHUTDOWN_TIMEOUT_MS;
    if (envVal !== undefined) {
      const parsed = Number(envVal);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 30000;
  }

  /**
   * Registers HTTP server instance for drain management.
   */
  public static setHttpServer(server: http.Server): void {
    this.httpServer = server;
  }

  /**
   * Registers a cleanup hook to run during the RESOURCES_CLOSING phase.
   */
  public static registerCleanupHook(name: string, fn: () => Promise<void> | void): void {
    this.cleanupHooks.push({ name, fn });
  }

  /**
   * Sets a test-only callback interceptor to avoid calling process.exit during test executions.
   */
  public static setShutdownCallbackForTest(cb: ((reason: string, exitCode: number) => void) | null): void {
    this.shutdownCallback = cb;
  }

  /**
   * Express middleware to track in-flight HTTP requests.
   */
  public static trackRequestMiddleware() {
    return (_req: Request, res: Response, next: NextFunction) => {
      if (ProcessLifecycleService.isShuttingDown()) {
        res.setHeader('Connection', 'close');
      }

      ProcessLifecycleService.activeRequestCount++;

      let decremented = false;
      const decrement = () => {
        if (!decremented) {
          decremented = true;
          ProcessLifecycleService.activeRequestCount = Math.max(0, ProcessLifecycleService.activeRequestCount - 1);
        }
      };

      res.on('finish', decrement);
      res.on('close', decrement);

      next();
    };
  }

  public static getActiveRequestCount(): number {
    return this.activeRequestCount;
  }

  /**
   * Authoritative Graceful Shutdown Coordinator.
   * Synchronously transitions state and triggers callbacks, then proceeds with async draining.
   */
  public static initiateGracefulShutdown(
    reason: string,
    exitCode: number = 0,
    options: { isFatal?: boolean; timeoutMs?: number } = {}
  ): boolean {
    if (this.state !== 'RUNNING') {
      LoggerService.warn(`[Process Resilience] Shutdown already in progress. Ignoring duplicate trigger for: ${reason}`);
      return false;
    }

    this.lastShutdownReason = reason;
    this.recordTransition('RUNNING', 'SHUTDOWN_REQUESTED', reason);
    this.state = 'SHUTDOWN_REQUESTED';
    const timeoutMs = options.timeoutMs ?? this.getShutdownTimeoutMs();

    if (options.isFatal || exitCode !== 0) {
      LoggerService.error(`[Process Resilience] Initiating graceful process shutdown. Reason: ${reason}, ExitCode: ${exitCode}`, {
        event: 'SERVER_SHUTDOWN_REQUESTED',
        reason,
        exitCode,
        timestamp: new Date().toISOString(),
      });
    } else {
      LoggerService.info(`[Process Resilience] Graceful shutdown requested. Reason: ${reason}`, {
        event: 'SERVER_SHUTDOWN_REQUESTED',
        reason,
        exitCode,
        timestamp: new Date().toISOString(),
      });
    }

    this.recordTransition('SHUTDOWN_REQUESTED', 'DRAINING', reason);
    this.state = 'DRAINING';
    LoggerService.info('[Process Resilience] Initiating server drain phase', {
      event: 'SERVER_DRAIN_STARTED',
      activeRequests: this.activeRequestCount,
      timeoutMs,
    });

    // Notify test callback synchronously if registered
    if (this.shutdownCallback) {
      try {
        this.shutdownCallback(reason, exitCode);
      } catch (err: any) {
        LoggerService.error(`[Process Resilience] Error in test shutdown callback: ${err?.message}`);
      }
    }

    // Begin background drain execution
    const runDrainSequence = async () => {
      // 1. Close HTTP server
      if (this.httpServer) {
        LoggerService.info('[Process Resilience] Closing HTTP server listener', { event: 'HTTP_SERVER_CLOSING' });
        try {
          this.httpServer.close();
        } catch {
          // ignore already closed
        }
      }

      // 2. Drain background queue
      LoggerService.info('[Process Resilience] Draining background queue', { event: 'BACKGROUND_QUEUE_DRAIN_STARTED' });
      await backgroundQueueService.drain(Math.min(timeoutMs, 5000));
      LoggerService.info('[Process Resilience] Background queue drain complete', { event: 'BACKGROUND_QUEUE_DRAIN_COMPLETE' });

      // 3. Close resources
      this.recordTransition('DRAINING', 'RESOURCES_CLOSING', reason);
      this.state = 'RESOURCES_CLOSING';
      LoggerService.info('[Process Resilience] Closing external resources and listeners', { event: 'RESOURCES_CLOSING' });

      for (const hook of this.cleanupHooks) {
        try {
          await hook.fn();
        } catch (err: any) {
          LoggerService.error(`[Process Resilience] Error in cleanup hook '${hook.name}': ${err?.message || err}`);
        }
      }

      // 4. Mark complete
      this.recordTransition('RESOURCES_CLOSING', 'SHUTDOWN_COMPLETE', reason);
      this.state = 'SHUTDOWN_COMPLETE';
      LoggerService.info('[Process Resilience] Server graceful shutdown complete', {
        event: 'SERVER_SHUTDOWN_COMPLETE',
        exitCode,
        timestamp: new Date().toISOString(),
      });
    };

    runDrainSequence();

    // In live execution, exit after timeout or drain
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(() => {
        process.exit(exitCode);
      }, timeoutMs).unref();
    }

    return true;
  }

  private static recordTransition(from: LifecycleState, to: LifecycleState, reason?: string): void {
    this.stateTransitions.push({
      from,
      to,
      timestamp: new Date().toISOString(),
      reason,
    });
  }

  public static getLifecycleMetrics() {
    return {
      currentState: this.state,
      isDraining: this.isShuttingDown(),
      activeRequests: this.activeRequestCount,
      cleanupHooksCount: this.cleanupHooks.length,
      shutdownTimeoutMs: this.getShutdownTimeoutMs(),
      lastShutdownReason: this.lastShutdownReason,
      transitions: [...this.stateTransitions],
    };
  }

  /**
   * Registers SIGTERM and SIGINT listeners once.
   */
  public static registerSignalHandlers(): void {
    if (this.signalHandlersRegistered) return;
    this.signalHandlersRegistered = true;

    process.on('SIGTERM', () => {
      LoggerService.info('[Process Resilience] Received SIGTERM signal');
      this.initiateGracefulShutdown('SIGTERM', 0);
    });

    process.on('SIGINT', () => {
      LoggerService.info('[Process Resilience] Received SIGINT signal');
      this.initiateGracefulShutdown('SIGINT', 0);
    });
  }

  /**
   * Resets lifecycle state for controlled test fixtures.
   */
  public static resetLifecycleForTest(): void {
    this.state = 'RUNNING';
    this.activeRequestCount = 0;
    this.cleanupHooks = [];
    this.shutdownCallback = null;
    this.httpServer = null;
    this.lastShutdownReason = null;
    this.stateTransitions = [];
    backgroundQueueService.resetQueue();
  }
}
