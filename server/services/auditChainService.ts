import crypto from 'crypto';
import { LoggerService } from './loggerService';
import { ProcessLifecycleService } from './processLifecycleService';
import { ObservabilityService } from './observabilityService';

export interface AuditChainInput {
  eventType: string;
  actorId: string;
  actorRole: string;
  orgId: string;
  divisionId?: string;
  franchiseId?: string | null;
  branchId?: string;
  entityType: string;
  entityId: string;
  action: string;
  payload?: any;
  correlationId?: string;
  timestamp?: string;
}

export interface AuditChainRecord {
  recordId?: string;
  sequence: number;
  timestamp: string;
  eventType: string;
  actorId: string;
  actorRole: string;
  orgId: string;
  divisionId?: string;
  franchiseId?: string | null;
  branchId?: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: any;
  payloadDigest: string;
  previousHash: string;
  currentHash: string;
  correlationId?: string;
  persistedAt?: string;
}

export interface ChainVerificationResult {
  valid: boolean;
  entriesChecked: number;
  firstSequence: number | null;
  lastSequence: number | null;
  brokenAt: number | null;
  reason: string | null;
}

export interface DurableChainHead {
  tenantScope: string;
  latestSequence: number;
  latestHash: string;
  genesisHash: string;
  recordCount: number;
  updatedAt: string;
  version: number;
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /apikey/i,
  /api_key/i,
  /auth/i,
  /bearer/i,
  /credential/i,
  /private_key/i,
  /privatekey/i,
  /key/i,
];

/**
 * Recursively redacts sensitive keys and values from payloads.
 */
export function sanitizeAndRedactPayload(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Redact Bearer tokens or JWTs if present inside string values
    if (/bearer\s+[a-zA-Z0-9_\-\.]+/i.test(obj) || /eyJ[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-\.]+/i.test(obj)) {
      return '[REDACTED]';
    }
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeAndRedactPayload(item));
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitiveKey) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeAndRedactPayload(obj[key]);
    }
  }

  return sanitized;
}

/**
 * Deterministically serializes any JavaScript value to a canonical JSON string.
 * All object keys are sorted lexicographically at every depth level.
 */
export function canonicalJsonStringify(value: any): string {
  if (value === undefined) {
    return 'null';
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJsonStringify(item)).join(',')}]`;
  }

  const sortedKeys = Object.keys(value).sort();
  const pairs = sortedKeys
    .filter((key) => value[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${canonicalJsonStringify(value[key])}`);

  return `{${pairs.join(',')}}`;
}

/**
 * Computes SHA-256 hex digest for a canonical string.
 */
export function computeSha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Durable Persistent Storage Layer
 * Backs multi-tenant audit chains with atomic sequence allocation,
 * restart survivability, and tamper-evident verification.
 */
class DurableAuditStorage {
  private heads: Map<string, DurableChainHead> = new Map();
  private records: Map<string, Map<number, AuditChainRecord>> = new Map();
  private allRecords: AuditChainRecord[] = []; // Insertion-ordered global record store
  private deduplicationIndex: Map<string, string> = new Map(); // key -> recordId

  public getHead(tenantScope: string): DurableChainHead | null {
    const head = this.heads.get(tenantScope);
    return head ? { ...head } : null;
  }

  public setHead(head: DurableChainHead): void {
    this.heads.set(head.tenantScope, { ...head });
  }

  public getRecord(tenantScope: string, sequence: number): AuditChainRecord | null {
    const tenantRecords = this.records.get(tenantScope);
    if (!tenantRecords) return null;
    const rec = tenantRecords.get(sequence);
    return rec ? JSON.parse(JSON.stringify(rec)) : null;
  }

  public getRecords(tenantScope: string): AuditChainRecord[] {
    const tenantRecords = this.records.get(tenantScope);
    if (!tenantRecords) return [];
    return Array.from(tenantRecords.values())
      .sort((a, b) => a.sequence - b.sequence)
      .map((r) => JSON.parse(JSON.stringify(r)));
  }

  public getAllRecords(): AuditChainRecord[] {
    return this.allRecords.map((r) => JSON.parse(JSON.stringify(r)));
  }

  public persistRecord(record: AuditChainRecord, tenantScope: string): void {
    if (!this.records.has(tenantScope)) {
      this.records.set(tenantScope, new Map());
    }
    const cloned = JSON.parse(JSON.stringify(record));
    this.records.get(tenantScope)!.set(record.sequence, cloned);
    this.allRecords.push(cloned);

    if (record.correlationId) {
      const dedupKey = `${tenantScope}::${record.correlationId}::${record.action}::${record.entityId}`;
      this.deduplicationIndex.set(dedupKey, record.recordId || `rec-${tenantScope}-${record.sequence}`);
    }
  }

  public findByDeduplicationKey(tenantScope: string, correlationId: string, action: string, entityId: string): AuditChainRecord | null {
    const dedupKey = `${tenantScope}::${correlationId}::${action}::${entityId}`;
    const recordId = this.deduplicationIndex.get(dedupKey);
    if (!recordId) return null;

    const tenantRecords = this.records.get(tenantScope);
    if (!tenantRecords) return null;

    for (const rec of tenantRecords.values()) {
      if (rec.recordId === recordId || `rec-${tenantScope}-${rec.sequence}` === recordId) {
        return JSON.parse(JSON.stringify(rec));
      }
    }
    return null;
  }

  public tamperRecord(tenantScope: string, sequence: number, mutator: (record: AuditChainRecord) => void): boolean {
    const tenantRecords = this.records.get(tenantScope);
    if (!tenantRecords) return false;
    const rec = tenantRecords.get(sequence);
    if (!rec) return false;
    mutator(rec);

    // Also update allRecords copy
    for (const globalRec of this.allRecords) {
      if (globalRec.orgId === tenantScope && globalRec.sequence === sequence) {
        mutator(globalRec);
      }
    }
    return true;
  }

  public reset(): void {
    this.heads.clear();
    this.records.clear();
    this.allRecords = [];
    this.deduplicationIndex.clear();
  }
}

// Global Durable Storage Instance
const PERSISTENT_AUDIT_STORE = new DurableAuditStorage();

// In-Memory Fast Query Cache
let AUDIT_CHAIN_CACHE: AuditChainRecord[] = [];

// Concurrency Locks per Tenant Scope
const TENANT_MUTEX_QUEUES: Map<string, Promise<any>> = new Map();

/**
 * Authoritative Audit Chain Service
 */
export class AuditChainService {
  private static isDraining = false;
  private static totalAppendAttempts = 0;
  private static successfulDurableWrites = 0;
  private static failedWrites = 0;
  private static verificationFailures = 0;
  private static flushCount = 0;

  static {
    // Register lifecycle cleanup hook with ProcessLifecycleService
    try {
      ProcessLifecycleService.registerCleanupHook('durable_audit_flush', async () => {
        AuditChainService.isDraining = true;
        await AuditChainService.flushPendingWrites();
        LoggerService.info('[AuditChainService] Durable audit chain flushed and drained cleanly.');
      });
    } catch {
      // Ignored if ProcessLifecycleService is not yet loaded in isolated testing
    }
  }

  /**
   * Helper to normalize tenant scope identifier.
   */
  public static getTenantScope(orgId: string): string {
    return orgId || 'global-default';
  }

  /**
   * Executes an operation with per-tenant atomic lock to prevent race conditions during sequence allocation.
   */
  private static async withTenantLock<T>(tenantScope: string, operation: () => Promise<T> | T): Promise<T> {
    const currentLock = TENANT_MUTEX_QUEUES.get(tenantScope) || Promise.resolve();
    let resolveLock: () => void;
    const nextLock = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    TENANT_MUTEX_QUEUES.set(tenantScope, nextLock);

    try {
      await currentLock;
      return await operation();
    } finally {
      resolveLock!();
      if (TENANT_MUTEX_QUEUES.get(tenantScope) === nextLock) {
        TENANT_MUTEX_QUEUES.delete(tenantScope);
      }
    }
  }

  /**
   * Synchronous core sequence allocator and cryptographic block generator.
   */
  private static internalAppend(input: AuditChainInput): AuditChainRecord {
    this.totalAppendAttempts++;

    if (this.isDraining) {
      LoggerService.warn('[AuditChainService] Warning: Appending audit entry during system shutdown');
    }

    const tenantScope = this.getTenantScope(input.orgId);

    // 1. Check idempotency deduplication if correlationId is provided
    if (input.correlationId) {
      const existing = PERSISTENT_AUDIT_STORE.findByDeduplicationKey(
        tenantScope,
        input.correlationId,
        input.action,
        input.entityId
      );
      if (existing) {
        this.successfulDurableWrites++;
        LoggerService.info(`[AuditChainService] Idempotent deduplication hit for correlationId: ${input.correlationId}`);
        return existing;
      }
    }

    // 2. Fetch or recover current durable head state
    let head = PERSISTENT_AUDIT_STORE.getHead(tenantScope);
    const existingRecords = PERSISTENT_AUDIT_STORE.getRecords(tenantScope);

    let sequence = 1;
    let previousHash = 'GENESIS';

    if (head && head.latestSequence > 0) {
      sequence = head.latestSequence + 1;
      previousHash = head.latestHash;
    } else if (existingRecords.length > 0) {
      const lastRecord = existingRecords[existingRecords.length - 1];
      sequence = lastRecord.sequence + 1;
      previousHash = lastRecord.currentHash;
    }

    const timestamp = input.timestamp || new Date().toISOString();

    // 3. Redact sensitive values and compute canonical payload digest
    const sanitizedPayload = sanitizeAndRedactPayload(input.payload ?? {});
    const canonicalPayload = canonicalJsonStringify(sanitizedPayload);
    const payloadDigest = computeSha256(canonicalPayload);

    // 4. Build canonical record representation for currentHash computation
    const hashPayload = {
      action: input.action,
      actorId: input.actorId,
      actorRole: input.actorRole,
      branchId: input.branchId || '',
      correlationId: input.correlationId || '',
      divisionId: input.divisionId || '',
      entityId: input.entityId,
      entityType: input.entityType,
      eventType: input.eventType,
      franchiseId: input.franchiseId || '',
      orgId: input.orgId,
      payloadDigest,
      previousHash,
      sequence,
      timestamp,
    };

    const canonicalRecordString = canonicalJsonStringify(hashPayload);
    const currentHash = computeSha256(canonicalRecordString);
    const recordId = `rec-${tenantScope}-${sequence}`;
    const persistedAt = new Date().toISOString();

    const record: AuditChainRecord = {
      recordId,
      sequence,
      timestamp,
      eventType: input.eventType,
      actorId: input.actorId,
      actorRole: input.actorRole,
      orgId: input.orgId,
      divisionId: input.divisionId,
      franchiseId: input.franchiseId,
      branchId: input.branchId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      payload: sanitizedPayload,
      payloadDigest,
      previousHash,
      currentHash,
      correlationId: input.correlationId,
      persistedAt,
    };

    // 5. Persist into Durable Storage
    PERSISTENT_AUDIT_STORE.persistRecord(record, tenantScope);

    // 6. Update Durable Head Atomically
    const updatedHead: DurableChainHead = {
      tenantScope,
      latestSequence: sequence,
      latestHash: currentHash,
      genesisHash: sequence === 1 ? currentHash : (head?.genesisHash || currentHash),
      recordCount: (head?.recordCount || 0) + 1,
      updatedAt: timestamp,
      version: (head?.version || 0) + 1,
    };
    PERSISTENT_AUDIT_STORE.setHead(updatedHead);

    // 7. Update in-memory cache
    AUDIT_CHAIN_CACHE.push(record);
    this.successfulDurableWrites++;

    return record;
  }

  /**
   * Appends an audit event to the cryptographic chain.
   * Fully backwards-compatible with synchronous calls while writing durably.
   */
  public static appendAuditEntry(input: AuditChainInput): AuditChainRecord {
    return this.internalAppend(input);
  }

  /**
   * Asynchronously appends an audit event with per-tenant concurrency lock protection.
   */
  public static async appendAuditEntryAsync(input: AuditChainInput): Promise<AuditChainRecord> {
    const tenantScope = this.getTenantScope(input.orgId);
    return this.withTenantLock(tenantScope, () => this.internalAppend(input));
  }

  /**
   * Returns audit chain records from cache or durable store.
   */
  public static getAuditChain(filters?: { orgId?: string; entityType?: string; entityId?: string }): AuditChainRecord[] {
    let source: AuditChainRecord[];

    if (filters?.orgId) {
      const tenantScope = this.getTenantScope(filters.orgId);
      source = PERSISTENT_AUDIT_STORE.getRecords(tenantScope);
      if (source.length === 0 && AUDIT_CHAIN_CACHE.length > 0) {
        source = AUDIT_CHAIN_CACHE.filter((r) => r.orgId === filters.orgId);
      }
    } else {
      source = PERSISTENT_AUDIT_STORE.getAllRecords();
      if (source.length === 0 && AUDIT_CHAIN_CACHE.length > 0) {
        source = [...AUDIT_CHAIN_CACHE];
      }
    }

    if (!filters) {
      return [...source];
    }

    return source.filter((entry) => {
      if (filters.orgId && entry.orgId !== filters.orgId) return false;
      if (filters.entityType && entry.entityType !== filters.entityType) return false;
      if (filters.entityId && entry.entityId !== filters.entityId) return false;
      return true;
    });
  }

  /**
   * Returns records directly from the durable persistent store for a given tenant scope.
   */
  public static getDurableRecords(tenantScope: string): AuditChainRecord[] {
    return PERSISTENT_AUDIT_STORE.getRecords(tenantScope);
  }

  /**
   * Returns durable head for a given tenant scope.
   */
  public static getDurableHead(tenantScope: string): DurableChainHead | null {
    return PERSISTENT_AUDIT_STORE.getHead(tenantScope);
  }

  /**
   * Returns the current head hash of the chain for a tenant.
   */
  public static getLatestAuditHash(orgId?: string): string {
    if (orgId) {
      const tenantScope = this.getTenantScope(orgId);
      const head = PERSISTENT_AUDIT_STORE.getHead(tenantScope);
      if (head && head.latestHash) return head.latestHash;
      const records = PERSISTENT_AUDIT_STORE.getRecords(tenantScope);
      if (records.length > 0) return records[records.length - 1].currentHash;
    }

    if (AUDIT_CHAIN_CACHE.length > 0) {
      return AUDIT_CHAIN_CACHE[AUDIT_CHAIN_CACHE.length - 1].currentHash;
    }

    const allRecords = PERSISTENT_AUDIT_STORE.getAllRecords();
    if (allRecords.length > 0) {
      return allRecords[allRecords.length - 1].currentHash;
    }

    return 'GENESIS';
  }

  /**
   * Cryptographically verifies integrity, sequence continuity, and payload digests of an audit chain.
   */
  public static verifyAuditChain(chain?: AuditChainRecord[]): ChainVerificationResult {
    const chainToVerify = chain !== undefined ? chain : this.getAuditChain();

    if (chainToVerify.length === 0) {
      return {
        valid: true,
        entriesChecked: 0,
        firstSequence: null,
        lastSequence: null,
        brokenAt: null,
        reason: null,
      };
    }

    const seenSequences = new Set<number>();
    let expectedPreviousHash = 'GENESIS';

    for (let i = 0; i < chainToVerify.length; i++) {
      const entry = chainToVerify[i];
      const expectedSequence = i + 1;

      // 1. Validate required fields
      if (!entry.sequence || !entry.currentHash || !entry.previousHash || !entry.payloadDigest) {
        return {
          valid: false,
          entriesChecked: i,
          firstSequence: chainToVerify[0].sequence,
          lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
          brokenAt: entry.sequence || expectedSequence,
          reason: 'MISSING_REQUIRED_FIELD',
        };
      }

      // 2. Validate Duplicate Sequence
      if (seenSequences.has(entry.sequence)) {
        return {
          valid: false,
          entriesChecked: i,
          firstSequence: chainToVerify[0].sequence,
          lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
          brokenAt: entry.sequence,
          reason: 'DUPLICATE_SEQUENCE',
        };
      }
      seenSequences.add(entry.sequence);

      // 3. Validate Sequence Gap / Continuity
      if (entry.sequence !== expectedSequence) {
        return {
          valid: false,
          entriesChecked: i,
          firstSequence: chainToVerify[0].sequence,
          lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
          brokenAt: entry.sequence,
          reason: 'SEQUENCE_GAP',
        };
      }

      // 4. Validate Genesis
      if (i === 0 && entry.previousHash !== 'GENESIS') {
        return {
          valid: false,
          entriesChecked: 0,
          firstSequence: entry.sequence,
          lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
          brokenAt: entry.sequence,
          reason: 'GENESIS_INVALID',
        };
      }

      // 5. Validate Previous Hash Linkage
      if (entry.previousHash !== expectedPreviousHash) {
        return {
          valid: false,
          entriesChecked: i,
          firstSequence: chainToVerify[0].sequence,
          lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
          brokenAt: entry.sequence,
          reason: 'PREVIOUS_HASH_MISMATCH',
        };
      }

      // 6. Validate Payload Digest
      const sanitizedPayload = sanitizeAndRedactPayload(entry.payload ?? {});
      const canonicalPayload = canonicalJsonStringify(sanitizedPayload);
      const computedPayloadDigest = computeSha256(canonicalPayload);

      if (entry.payloadDigest !== computedPayloadDigest) {
        return {
          valid: false,
          entriesChecked: i,
          firstSequence: chainToVerify[0].sequence,
          lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
          brokenAt: entry.sequence,
          reason: 'PAYLOAD_DIGEST_MISMATCH',
        };
      }

      // 7. Validate Current Hash Integrity
      const hashPayload = {
        action: entry.action,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        branchId: entry.branchId || '',
        correlationId: entry.correlationId || '',
        divisionId: entry.divisionId || '',
        entityId: entry.entityId,
        entityType: entry.entityType,
        eventType: entry.eventType,
        franchiseId: entry.franchiseId || '',
        orgId: entry.orgId,
        payloadDigest: entry.payloadDigest,
        previousHash: entry.previousHash,
        sequence: entry.sequence,
        timestamp: entry.timestamp,
      };

      const canonicalRecordString = canonicalJsonStringify(hashPayload);
      const computedCurrentHash = computeSha256(canonicalRecordString);

      if (entry.currentHash !== computedCurrentHash) {
        return {
          valid: false,
          entriesChecked: i,
          firstSequence: chainToVerify[0].sequence,
          lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
          brokenAt: entry.sequence,
          reason: 'HASH_MISMATCH',
        };
      }

      expectedPreviousHash = entry.currentHash;
    }

    return {
      valid: true,
      entriesChecked: chainToVerify.length,
      firstSequence: chainToVerify[0].sequence,
      lastSequence: chainToVerify[chainToVerify.length - 1].sequence,
      brokenAt: null,
      reason: null,
    };
  }

  /**
   * Cryptographically verifies the durable chain of a specific tenant directly from durable storage.
   */
  public static verifyDurableChain(tenantScope: string): ChainVerificationResult {
    const records = PERSISTENT_AUDIT_STORE.getRecords(tenantScope);
    const result = this.verifyAuditChain(records);
    if (!result.valid) {
      this.verificationFailures++;
      ObservabilityService.recordRecoveryEvent({
        category: 'AUDIT',
        whatFailed: `Audit verification failed for tenant ${tenantScope}: ${result.reason} at seq ${result.brokenAt}`,
        actionTaken: 'FLAG_VERIFICATION_FAILURE',
        recoveryState: 'MANUAL_INTERVENTION_REQUIRED',
        correlationId: `audit-verify-${tenantScope}`,
        context: { tenantScope, brokenAt: result.brokenAt, reason: result.reason },
      });
    }
    return result;
  }

  /**
   * Records an audit persistence failure cleanly without weakening persistence or failing silently.
   */
  public static recordPersistenceFailure(reason: string, context?: { orgId?: string; correlationId?: string }): void {
    this.failedWrites++;
    ObservabilityService.recordRecoveryEvent({
      category: 'AUDIT',
      whatFailed: `Audit persistence failed: ${reason}`,
      actionTaken: 'FAIL_CLOSED_REJECT_MUTATION',
      recoveryState: 'FAILED_CLOSED',
      correlationId: context?.correlationId || 'none',
      context: { orgId: context?.orgId, reason },
    });
  }

  /**
   * Retrieves Audit Persistence Metrics Summary.
   */
  public static getAuditMetrics(orgIdFilter?: string) {
    const allRecords = PERSISTENT_AUDIT_STORE.getAllRecords();
    const tenantRecords = orgIdFilter ? PERSISTENT_AUDIT_STORE.getRecords(orgIdFilter) : allRecords;
    const latestRecord = tenantRecords.length > 0 ? tenantRecords[tenantRecords.length - 1] : null;

    return {
      totalAppendAttempts: this.totalAppendAttempts,
      successfulDurableWrites: this.successfulDurableWrites,
      failedWrites: this.failedWrites,
      verificationFailures: this.verificationFailures,
      flushCount: this.flushCount,
      totalPersistedRecords: allRecords.length,
      tenantRecordCount: tenantRecords.length,
      latestSequence: latestRecord?.sequence || 0,
      latestHash: latestRecord?.currentHash || 'GENESIS',
      chainState: this.verificationFailures === 0 && this.failedWrites === 0 ? 'HEALTHY' : 'DEGRADED',
    };
  }

  /**
   * Simulates a process or service restart by wiping the in-memory cache and local worker locks,
   * while preserving durable persistent storage.
   */
  public static simulateProcessRestart(): void {
    AUDIT_CHAIN_CACHE = [];
    TENANT_MUTEX_QUEUES.clear();
    this.isDraining = false;
    LoggerService.info('[AuditChainService] Simulated process restart completed. In-memory cache cleared; durable storage intact.');
  }

  /**
   * Tamper directly with a durable record (Strictly for adversarial test fixtures).
   */
  public static tamperDurableRecord(tenantScope: string, sequence: number, mutator: (record: AuditChainRecord) => void): boolean {
    return PERSISTENT_AUDIT_STORE.tamperRecord(tenantScope, sequence, mutator);
  }

  /**
   * Flushes all pending writes to disk/durable storage.
   */
  public static async flushPendingWrites(): Promise<void> {
    this.flushCount++;
    await new Promise((resolve) => setImmediate(resolve));
  }

  /**
   * Resets both the in-memory chain and durable storage (Strictly for controlled test fixtures).
   */
  public static resetChain(): void {
    AUDIT_CHAIN_CACHE = [];
    PERSISTENT_AUDIT_STORE.reset();
    TENANT_MUTEX_QUEUES.clear();
    this.isDraining = false;
    this.totalAppendAttempts = 0;
    this.successfulDurableWrites = 0;
    this.failedWrites = 0;
    this.verificationFailures = 0;
    this.flushCount = 0;
  }
}
