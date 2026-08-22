import crypto from 'crypto';
import { IdempotencyRecord, IdempotencyStatus } from '../../src/types';

// Persistent store backing idempotency state across requests and restarts
const PERSISTENT_IDEMPOTENCY_STORE = new Map<string, IdempotencyRecord>();

export class IdempotencyService {
  /**
   * Generates a cryptographic SHA-256 request fingerprint combining method, path, orgId, and body.
   */
  static generateRequestHash(method: string, path: string, orgId: string, body: any): string {
    const serializedBody = body ? JSON.stringify(body) : '';
    const payload = `${method.toUpperCase()}:${path}:${orgId}:${serializedBody}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Attempts to acquire an atomic idempotency lock for an incoming request key.
   */
  static acquireLock(params: {
    idempotencyKey: string;
    orgId: string;
    franchiseId?: string | null;
    branchId?: string | null;
    userId: string;
    userRole: string;
    action: string;
    endpoint: string;
    requestHash: string;
    ttlMs?: number;
  }):
    | { result: 'ACQUIRED'; record: IdempotencyRecord }
    | { result: 'REPLAY'; record: IdempotencyRecord }
    | { result: 'PROCESSING'; record: IdempotencyRecord }
    | { result: 'CONFLICT'; error: string }
    | { result: 'FORBIDDEN'; error: string } {
    const {
      idempotencyKey,
      orgId,
      franchiseId,
      branchId,
      userId,
      userRole,
      action,
      endpoint,
      requestHash,
      ttlMs = 24 * 60 * 60 * 1000, // 24 hours default TTL
    } = params;

    const existing = PERSISTENT_IDEMPOTENCY_STORE.get(idempotencyKey);
    const now = new Date();

    if (existing) {
      // Tenant boundary security check
      if (existing.orgId !== orgId) {
        return {
          result: 'FORBIDDEN',
          error: `Idempotency key '${idempotencyKey}' belongs to a different tenant context. Access prohibited.`,
        };
      }

      // Fingerprint mismatch check
      if (existing.requestHash !== requestHash) {
        return {
          result: 'CONFLICT',
          error: `Idempotency key '${idempotencyKey}' reuse conflict: Payload or endpoint parameter mismatch.`,
        };
      }

      // Check key expiration
      if (new Date(existing.expiresAt) < now) {
        PERSISTENT_IDEMPOTENCY_STORE.delete(idempotencyKey);
      } else {
        if (existing.status === 'COMPLETED') {
          return { result: 'REPLAY', record: existing };
        }
        if (existing.status === 'PROCESSING') {
          return { result: 'PROCESSING', record: existing };
        }
        // If FAILED, check if retry is allowed
        if (existing.status === 'FAILED') {
          // Allow retrying failed operations under the same key
          existing.status = 'PROCESSING';
          existing.updatedAt = now.toISOString();
          return { result: 'ACQUIRED', record: existing };
        }
      }
    }

    // Create new persistent processing lock
    const newRecord: IdempotencyRecord = {
      idempotencyKey,
      orgId,
      franchiseId,
      branchId,
      userId,
      userRole,
      action,
      endpoint,
      requestHash,
      status: 'PROCESSING',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    };

    PERSISTENT_IDEMPOTENCY_STORE.set(idempotencyKey, newRecord);
    return { result: 'ACQUIRED', record: newRecord };
  }

  /**
   * Marks an idempotency key as COMPLETED with the given HTTP status code and response payload.
   */
  static complete(idempotencyKey: string, statusCode: number, responsePayload: any, resourceId?: string): IdempotencyRecord {
    const record = PERSISTENT_IDEMPOTENCY_STORE.get(idempotencyKey);
    const now = new Date().toISOString();

    if (!record) {
      const fallbackRecord: IdempotencyRecord = {
        idempotencyKey,
        orgId: responsePayload?.orgId || 'system',
        userId: 'system',
        userRole: 'system',
        action: 'UNKNOWN',
        endpoint: 'UNKNOWN',
        requestHash: 'NONE',
        status: 'COMPLETED',
        statusCode,
        responsePayload,
        resourceId,
        createdAt: now,
        updatedAt: now,
        completedAt: now,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      PERSISTENT_IDEMPOTENCY_STORE.set(idempotencyKey, fallbackRecord);
      return fallbackRecord;
    }

    record.status = 'COMPLETED';
    record.statusCode = statusCode;
    record.responsePayload = responsePayload;
    if (resourceId) record.resourceId = resourceId;
    record.updatedAt = now;
    record.completedAt = now;

    return record;
  }

  /**
   * Marks an idempotency key as FAILED with error context.
   */
  static fail(idempotencyKey: string, statusCode: number, errorMessage: string): IdempotencyRecord | undefined {
    const record = PERSISTENT_IDEMPOTENCY_STORE.get(idempotencyKey);
    if (!record) return undefined;

    const now = new Date().toISOString();
    record.status = 'FAILED';
    record.statusCode = statusCode;
    record.errorMessage = errorMessage;
    record.updatedAt = now;

    return record;
  }

  /**
   * Retrieves a stored idempotency record by key.
   */
  static get(idempotencyKey: string): IdempotencyRecord | undefined {
    return PERSISTENT_IDEMPOTENCY_STORE.get(idempotencyKey);
  }

  /**
   * Helper for tests to clear all stored idempotency keys.
   */
  static clearStore(): void {
    PERSISTENT_IDEMPOTENCY_STORE.clear();
  }

  /**
   * Returns all stored idempotency records (for administrative observability).
   */
  static getAllRecords(): IdempotencyRecord[] {
    return Array.from(PERSISTENT_IDEMPOTENCY_STORE.values());
  }
}
