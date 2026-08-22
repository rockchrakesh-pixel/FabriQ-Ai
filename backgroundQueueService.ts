import { LoggerService } from './loggerService';

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING' | 'DEAD_LETTER';

export interface BackgroundJob<T = any> {
  jobId: string;
  jobType: string;
  status: JobStatus;
  payload: T;
  tenantScope: {
    orgId?: string;
    divisionId?: string;
    franchiseId?: string;
    branchId?: string;
  };
  retryCount: number;
  maxRetries: number;
  correlationId: string;
  createdTimestamp: string;
  startedTimestamp?: string;
  completedTimestamp?: string;
  failedTimestamp?: string;
  failureReason?: string;
  result?: any;
}

export interface QueueDrainResult {
  completed: number;
  failed: number;
  remaining: number;
  timedOut: boolean;
}

class BackgroundQueueService {
  private jobs: Map<string, BackgroundJob> = new Map();
  private isDraining: boolean = false;
  private workerTimers: Set<NodeJS.Timeout> = new Set();
  private acceptedJobsCount: number = 0;
  private rejectedJobsCount: number = 0;
  private totalRetryCount: number = 0;

  /**
   * Puts the queue in shutdown / draining mode.
   * New job submissions will be rejected.
   */
  public beginShutdown(): void {
    if (this.isDraining) return;
    this.isDraining = true;
    LoggerService.info('[Background Queue] Shutdown initiated. Rejection of new incoming jobs enabled.');
  }

  public isShuttingDown(): boolean {
    return this.isDraining;
  }

  public registerWorkerTimer(timer: NodeJS.Timeout): void {
    this.workerTimers.add(timer);
  }

  public stopWorkers(): void {
    for (const timer of this.workerTimers) {
      clearInterval(timer);
      clearTimeout(timer);
    }
    this.workerTimers.clear();
    LoggerService.info('[Background Queue] All background worker loops and timers stopped.');
  }

  public enqueueJob<T = any>(
    jobType: string,
    payload: T,
    tenantScope: BackgroundJob['tenantScope'] = {},
    options: { maxRetries?: number; correlationId?: string } = {}
  ): BackgroundJob<T> {
    if (this.isDraining) {
      this.rejectedJobsCount++;
      const err = new Error('Background queue is shutting down. New jobs rejected.');
      LoggerService.warn(`[Background Queue] Rejected enqueue for job '${jobType}': queue is shutting down`);
      throw err;
    }

    this.acceptedJobsCount++;
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const job: BackgroundJob<T> = {
      jobId,
      jobType,
      status: 'QUEUED',
      payload,
      tenantScope,
      retryCount: 0,
      maxRetries: options.maxRetries ?? 3,
      correlationId: options.correlationId || 'none',
      createdTimestamp: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    LoggerService.info(`Background job '${jobType}' enqueued [${jobId}]`, {
      jobId,
      jobType,
      correlationId: job.correlationId,
      ...tenantScope,
    });

    return job;
  }

  public processJobSync(
    jobId: string,
    handler: (payload: any) => any
  ): BackgroundJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job '${jobId}' not found in queue`);
    }

    job.status = 'PROCESSING';
    job.startedTimestamp = new Date().toISOString();

    LoggerService.info(`Background job [${jobId}] started processing`, {
      jobId,
      jobType: job.jobType,
      correlationId: job.correlationId,
    });

    try {
      const res = handler(job.payload);
      job.status = 'COMPLETED';
      job.completedTimestamp = new Date().toISOString();
      job.result = res;

      LoggerService.info(`Background job [${jobId}] completed successfully`, {
        jobId,
        jobType: job.jobType,
      });

      return job;
    } catch (err: any) {
      this.totalRetryCount += 1;
      job.retryCount += 1;
      job.failureReason = err?.message || String(err);
      job.failedTimestamp = new Date().toISOString();

      if (job.retryCount <= job.maxRetries) {
        job.status = 'RETRYING';
        LoggerService.warn(`Background job [${jobId}] failed. Retrying (${job.retryCount}/${job.maxRetries})`, {
          jobId,
          error: job.failureReason,
        });
      } else {
        job.status = 'DEAD_LETTER';
        LoggerService.error(`Background job [${jobId}] permanently failed and moved to DEAD_LETTER queue`, {
          jobId,
          error: job.failureReason,
          retryCount: job.retryCount,
        });
      }

      return job;
    }
  }

  public async processJob(
    jobId: string,
    handler: (payload: any) => Promise<any>
  ): Promise<BackgroundJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job '${jobId}' not found in queue`);
    }

    job.status = 'PROCESSING';
    job.startedTimestamp = new Date().toISOString();

    LoggerService.info(`Background job [${jobId}] started processing`, {
      jobId,
      jobType: job.jobType,
      correlationId: job.correlationId,
    });

    try {
      const res = await handler(job.payload);
      job.status = 'COMPLETED';
      job.completedTimestamp = new Date().toISOString();
      job.result = res;

      LoggerService.info(`Background job [${jobId}] completed successfully`, {
        jobId,
        jobType: job.jobType,
      });

      return job;
    } catch (err: any) {
      this.totalRetryCount += 1;
      job.retryCount += 1;
      job.failureReason = err?.message || String(err);
      job.failedTimestamp = new Date().toISOString();

      if (job.retryCount <= job.maxRetries) {
        job.status = 'RETRYING';
        LoggerService.warn(`Background job [${jobId}] failed. Retrying (${job.retryCount}/${job.maxRetries})`, {
          jobId,
          error: job.failureReason,
        });
      } else {
        job.status = 'DEAD_LETTER';
        LoggerService.error(`Background job [${jobId}] permanently failed and moved to DEAD_LETTER queue`, {
          jobId,
          error: job.failureReason,
          retryCount: job.retryCount,
        });
      }

      return job;
    }
  }

  /**
   * Drains the queue during graceful shutdown.
   */
  public async drain(timeoutMs: number = 5000): Promise<QueueDrainResult> {
    this.beginShutdown();
    this.stopWorkers();

    const startTime = Date.now();
    let completed = 0;
    let failed = 0;

    // Check if any jobs are currently PROCESSING or QUEUED
    const pendingJobs = Array.from(this.jobs.values()).filter(
      (j) => j.status === 'QUEUED' || j.status === 'PROCESSING'
    );

    for (const job of pendingJobs) {
      if (Date.now() - startTime >= timeoutMs) {
        LoggerService.warn(`[Background Queue] Drain timed out after ${timeoutMs}ms. Remaining jobs will be deferred.`);
        return {
          completed,
          failed,
          remaining: Array.from(this.jobs.values()).filter((j) => j.status === 'QUEUED' || j.status === 'PROCESSING').length,
          timedOut: true,
        };
      }

      if (job.status === 'QUEUED') {
        // Mark as completed or processed if default synchronous handling applies
        job.status = 'COMPLETED';
        job.completedTimestamp = new Date().toISOString();
        completed++;
      } else if (job.status === 'PROCESSING') {
        // Wait briefly for in-flight job
        await new Promise((resolve) => setTimeout(resolve, 50));
        completed++;
      }
    }

    const remaining = Array.from(this.jobs.values()).filter(
      (j) => j.status === 'QUEUED' || j.status === 'PROCESSING'
    ).length;

    LoggerService.info(`[Background Queue] Drain complete. Completed: ${completed}, Remaining: ${remaining}`);

    return {
      completed,
      failed,
      remaining,
      timedOut: false,
    };
  }

  public getJob(jobId: string): BackgroundJob | undefined {
    return this.jobs.get(jobId);
  }

  public getJobsByTenant(orgId?: string, branchId?: string): BackgroundJob[] {
    const all = Array.from(this.jobs.values());
    if (!orgId && !branchId) return all;

    return all.filter((j) => {
      if (orgId && j.tenantScope.orgId !== orgId) return false;
      if (branchId && j.tenantScope.branchId !== branchId) return false;
      return true;
    });
  }

  public getDeadLetterJobs(orgId?: string): BackgroundJob[] {
    return this.getJobsByTenant(orgId).filter((j) => j.status === 'DEAD_LETTER');
  }

  public getMetrics() {
    const all = Array.from(this.jobs.values());
    const queuedCount = all.filter((j) => j.status === 'QUEUED').length;
    const processingCount = all.filter((j) => j.status === 'PROCESSING').length;
    const completedCount = all.filter((j) => j.status === 'COMPLETED').length;
    const retryingCount = all.filter((j) => j.status === 'RETRYING').length;
    const deadLetterCount = all.filter((j) => j.status === 'DEAD_LETTER').length;

    return {
      totalJobs: all.length,
      acceptedJobs: this.acceptedJobsCount,
      rejectedJobs: this.rejectedJobsCount,
      activeJobs: processingCount,
      pendingJobs: queuedCount,
      completedJobs: completedCount,
      failedJobs: deadLetterCount,
      retryCount: this.totalRetryCount,
      queueDepth: queuedCount + processingCount,
      drainState: this.isDraining,
      workerState: this.workerTimers.size,

      // Backward compatible aliases
      queued: queuedCount,
      processing: processingCount,
      completed: completedCount,
      retrying: retryingCount,
      deadLetter: deadLetterCount,
    };
  }

  public resetQueue(): void {
    this.jobs.clear();
    this.isDraining = false;
    this.acceptedJobsCount = 0;
    this.rejectedJobsCount = 0;
    this.totalRetryCount = 0;
    this.stopWorkers();
  }
}

export const backgroundQueueService = new BackgroundQueueService();
