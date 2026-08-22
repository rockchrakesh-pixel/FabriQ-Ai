import { 
  AuditChainService, 
  AuditChainRecord, 
  canonicalJsonStringify, 
  computeSha256, 
  sanitizeAndRedactPayload 
} from '../services/auditChainService';
import { EnterpriseOperationsService } from '../services/enterpriseOperationsService';

export interface VerificationResult {
  scenarioId: number;
  scenarioName: string;
  expectedResult: 'ALLOW' | 'DENY';
  actualResult: 'ALLOW' | 'DENY';
  passed: boolean;
  notes: string;
}

export function runPhase2H7dVerificationSuite(): VerificationResult[] {
  const results: VerificationResult[] = [];

  // Reset chain before running tests
  AuditChainService.resetChain();

  // =========================================================================
  // Scenario 364: Genesis audit entry created correctly
  // =========================================================================
  const genesisEntry = AuditChainService.appendAuditEntry({
    eventType: 'SYSTEM_INIT',
    actorId: 'usr-system-01',
    actorRole: 'super_admin',
    orgId: 'org-fabriq-global',
    entityType: 'SystemConfig',
    entityId: 'cfg-root',
    action: 'INITIALIZE_AUDIT_LEDGER',
    payload: { version: '2.6.0', mode: 'ENTERPRISE' },
    correlationId: 'corr-init-364',
  });

  const t364Passed = genesisEntry.sequence === 1 &&
    genesisEntry.previousHash === 'GENESIS' &&
    typeof genesisEntry.currentHash === 'string' &&
    genesisEntry.currentHash.length === 64 &&
    genesisEntry.payloadDigest.length === 64;

  results.push({
    scenarioId: 364,
    scenarioName: 'Phase 2H-7D: Genesis audit entry created with sequence 1 and previousHash GENESIS',
    expectedResult: 'ALLOW',
    actualResult: t364Passed ? 'ALLOW' : 'DENY',
    passed: t364Passed,
    notes: 'The initial audit record establishes the immutable genesis cryptographic boundary.',
  });

  // =========================================================================
  // Scenario 365: Sequential entries create correct previousHash linkage
  // =========================================================================
  const secondEntry = AuditChainService.appendAuditEntry({
    eventType: 'STORE_CONFIGURATION',
    actorId: 'usr-admin-01',
    actorRole: 'admin',
    orgId: 'org-fabriq-global',
    entityType: 'StoreLocation',
    entityId: 'loc-hyd-jubilee',
    action: 'UPDATE_CAPACITY',
    payload: { dailyGarmentCapacity: 150 },
    correlationId: 'corr-seq-365',
  });

  const t365Passed = secondEntry.sequence === 2 &&
    secondEntry.previousHash === genesisEntry.currentHash &&
    secondEntry.currentHash !== genesisEntry.currentHash;

  results.push({
    scenarioId: 365,
    scenarioName: 'Phase 2H-7D: Sequential entries create strict cryptographic previousHash linkage',
    expectedResult: 'ALLOW',
    actualResult: t365Passed ? 'ALLOW' : 'DENY',
    passed: t365Passed,
    notes: 'Record N explicitly references the SHA-256 currentHash of Record N-1.',
  });

  // =========================================================================
  // Scenario 366: SHA-256 currentHash verifies correctly
  // =========================================================================
  const thirdEntry = AuditChainService.appendAuditEntry({
    eventType: 'PRICING_RULE',
    actorId: 'usr-ceo-01',
    actorRole: 'ceo',
    orgId: 'org-fabriq-global',
    entityType: 'TierSlab',
    entityId: 'slab-couture-01',
    action: 'PUBLISH_ROYALTY_SLAB',
    payload: { ratePercentage: 6.5, minMinor: 0 },
    correlationId: 'corr-hash-366',
  });

  const expectedHashPayload = {
    action: thirdEntry.action,
    actorId: thirdEntry.actorId,
    actorRole: thirdEntry.actorRole,
    branchId: thirdEntry.branchId || '',
    correlationId: thirdEntry.correlationId || '',
    divisionId: thirdEntry.divisionId || '',
    entityId: thirdEntry.entityId,
    entityType: thirdEntry.entityType,
    eventType: thirdEntry.eventType,
    franchiseId: thirdEntry.franchiseId || '',
    orgId: thirdEntry.orgId,
    payloadDigest: thirdEntry.payloadDigest,
    previousHash: thirdEntry.previousHash,
    sequence: thirdEntry.sequence,
    timestamp: thirdEntry.timestamp,
  };
  const recomputedHash = computeSha256(canonicalJsonStringify(expectedHashPayload));
  const t366Passed = thirdEntry.currentHash === recomputedHash;

  results.push({
    scenarioId: 366,
    scenarioName: 'Phase 2H-7D: SHA-256 currentHash computes deterministically over canonical record fields',
    expectedResult: 'ALLOW',
    actualResult: t366Passed ? 'ALLOW' : 'DENY',
    passed: t366Passed,
    notes: 'Cryptographic hash accurately binds sequence, previousHash, payloadDigest, and audit metadata.',
  });

  // =========================================================================
  // Scenario 367: Payload digest is deterministic
  // =========================================================================
  const samplePayloadA = { orderId: 'ord-101', totalMinor: 45000, notes: 'Silk Dry Clean' };
  const samplePayloadB = { orderId: 'ord-101', totalMinor: 45000, notes: 'Silk Dry Clean' };
  const digestA = computeSha256(canonicalJsonStringify(samplePayloadA));
  const digestB = computeSha256(canonicalJsonStringify(samplePayloadB));
  const t367Passed = digestA === digestB && digestA.length === 64;

  results.push({
    scenarioId: 367,
    scenarioName: 'Phase 2H-7D: Payload digest is strictly deterministic for identical payloads',
    expectedResult: 'ALLOW',
    actualResult: t367Passed ? 'ALLOW' : 'DENY',
    passed: t367Passed,
    notes: 'Identical payload structures generate the exact same SHA-256 payloadDigest.',
  });

  // =========================================================================
  // Scenario 368: Reordered object keys produce same payload digest
  // =========================================================================
  const payloadOrder1 = { zIndex: 10, alpha: 'first', meta: { beta: 2, gamma: 3 } };
  const payloadOrder2 = { meta: { gamma: 3, beta: 2 }, alpha: 'first', zIndex: 10 };
  const canonicalOrder1 = canonicalJsonStringify(payloadOrder1);
  const canonicalOrder2 = canonicalJsonStringify(payloadOrder2);
  const digestOrder1 = computeSha256(canonicalOrder1);
  const digestOrder2 = computeSha256(canonicalOrder2);
  const t368Passed = canonicalOrder1 === canonicalOrder2 && digestOrder1 === digestOrder2;

  results.push({
    scenarioId: 368,
    scenarioName: 'Phase 2H-7D: Reordered object keys produce identical canonical serialization and digest',
    expectedResult: 'ALLOW',
    actualResult: t368Passed ? 'ALLOW' : 'DENY',
    passed: t368Passed,
    notes: 'Lexicographical key sorting eliminates JSON key insertion ordering variance.',
  });

  // =========================================================================
  // Scenario 369: Sequence increments correctly
  // =========================================================================
  const entry4 = AuditChainService.appendAuditEntry({
    eventType: 'INVENTORY_REBALANCE',
    actorId: 'usr-inv-01',
    actorRole: 'inventory',
    orgId: 'org-fabriq-global',
    entityType: 'SolventStock',
    entityId: 'stk-hcarb-01',
    action: 'TRANSFER_STOCK',
    payload: { liters: 50, from: 'WH-HYD', to: 'BR-JUBILEE' },
  });

  const entry5 = AuditChainService.appendAuditEntry({
    eventType: 'QUALITY_CALIBRATION',
    actorId: 'usr-qa-01',
    actorRole: 'quality_inspector',
    orgId: 'org-fabriq-global',
    entityType: 'OpticalScanner',
    entityId: 'dev-opt-04',
    action: 'CALIBRATE_SPECTROMETER',
    payload: { status: 'OPTIMAL' },
  });

  const t369Passed = entry4.sequence === 4 && entry5.sequence === 5;
  results.push({
    scenarioId: 369,
    scenarioName: 'Phase 2H-7D: Audit chain sequence strictly increments by 1 monotonically',
    expectedResult: 'ALLOW',
    actualResult: t369Passed ? 'ALLOW' : 'DENY',
    passed: t369Passed,
    notes: 'Monotonic sequence generator prevents gaps and duplicate sequence assignments.',
  });

  // =========================================================================
  // Scenario 370: Intact chain returns valid=true
  // =========================================================================
  const verificationReport = AuditChainService.verifyAuditChain();
  const t370Passed = verificationReport.valid === true &&
    verificationReport.entriesChecked === 5 &&
    verificationReport.firstSequence === 1 &&
    verificationReport.lastSequence === 5 &&
    verificationReport.brokenAt === null &&
    verificationReport.reason === null;

  results.push({
    scenarioId: 370,
    scenarioName: 'Phase 2H-7D: Cryptographic verification passes with valid=true across full intact chain',
    expectedResult: 'ALLOW',
    actualResult: t370Passed ? 'ALLOW' : 'DENY',
    passed: t370Passed,
    notes: 'Full chain verification checks genesis, linkages, sequence continuity, and payload digests.',
  });

  // =========================================================================
  // Scenario 371: Tampered payload causes verification failure
  // =========================================================================
  const currentChainCopy: AuditChainRecord[] = JSON.parse(JSON.stringify(AuditChainService.getAuditChain()));
  // Tamper payload in entry 3
  currentChainCopy[2].payload = { ...currentChainCopy[2].payload, ratePercentage: 99.9 };
  const tamperedPayloadRes = AuditChainService.verifyAuditChain(currentChainCopy);
  const t371Passed = tamperedPayloadRes.valid === false &&
    tamperedPayloadRes.brokenAt === 3 &&
    tamperedPayloadRes.reason === 'PAYLOAD_DIGEST_MISMATCH';

  results.push({
    scenarioId: 371,
    scenarioName: 'Phase 2H-7D: Tampered payload immediately causes PAYLOAD_DIGEST_MISMATCH failure',
    expectedResult: 'ALLOW',
    actualResult: t371Passed ? 'ALLOW' : 'DENY',
    passed: t371Passed,
    notes: 'Unauthorized mutation of payload contents violates payloadDigest integrity.',
  });

  // =========================================================================
  // Scenario 372: Tampered previousHash causes verification failure
  // =========================================================================
  const tamperedPrevHashChain: AuditChainRecord[] = JSON.parse(JSON.stringify(AuditChainService.getAuditChain()));
  tamperedPrevHashChain[1].previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const tamperedPrevHashRes = AuditChainService.verifyAuditChain(tamperedPrevHashChain);
  const t372Passed = tamperedPrevHashRes.valid === false &&
    tamperedPrevHashRes.brokenAt === 2 &&
    tamperedPrevHashRes.reason === 'PREVIOUS_HASH_MISMATCH';

  results.push({
    scenarioId: 372,
    scenarioName: 'Phase 2H-7D: Tampered previousHash causes PREVIOUS_HASH_MISMATCH failure',
    expectedResult: 'ALLOW',
    actualResult: t372Passed ? 'ALLOW' : 'DENY',
    passed: t372Passed,
    notes: 'Breaking the cryptographic link between consecutive blocks halts verification.',
  });

  // =========================================================================
  // Scenario 373: Tampered currentHash causes verification failure
  // =========================================================================
  const tamperedCurrHashChain: AuditChainRecord[] = JSON.parse(JSON.stringify(AuditChainService.getAuditChain()));
  tamperedCurrHashChain[3].currentHash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  const tamperedCurrHashRes = AuditChainService.verifyAuditChain(tamperedCurrHashChain);
  const t373Passed = tamperedCurrHashRes.valid === false &&
    tamperedCurrHashRes.brokenAt === 4 &&
    tamperedCurrHashRes.reason === 'HASH_MISMATCH';

  results.push({
    scenarioId: 373,
    scenarioName: 'Phase 2H-7D: Tampered currentHash causes HASH_MISMATCH failure',
    expectedResult: 'ALLOW',
    actualResult: t373Passed ? 'ALLOW' : 'DENY',
    passed: t373Passed,
    notes: 'Direct manipulation of entry hash digest is caught by hash re-computation.',
  });

  // =========================================================================
  // Scenario 374: Missing sequence is detected
  // =========================================================================
  const gapChain: AuditChainRecord[] = JSON.parse(JSON.stringify(AuditChainService.getAuditChain()));
  // Remove entry at index 2 (sequence 3 is missing)
  gapChain.splice(2, 1);
  const gapRes = AuditChainService.verifyAuditChain(gapChain);
  const t374Passed = gapRes.valid === false &&
    gapRes.brokenAt === 4 &&
    gapRes.reason === 'SEQUENCE_GAP';

  results.push({
    scenarioId: 374,
    scenarioName: 'Phase 2H-7D: Omission or deletion of intermediate audit entries causes SEQUENCE_GAP',
    expectedResult: 'ALLOW',
    actualResult: t374Passed ? 'ALLOW' : 'DENY',
    passed: t374Passed,
    notes: 'Adversarial record deletion is immediately flagged as a sequence discontinuity.',
  });

  // =========================================================================
  // Scenario 375: Duplicate sequence is detected
  // =========================================================================
  const duplicateSeqChain: AuditChainRecord[] = JSON.parse(JSON.stringify(AuditChainService.getAuditChain()));
  duplicateSeqChain[2].sequence = 2; // Duplicate sequence 2
  const dupRes = AuditChainService.verifyAuditChain(duplicateSeqChain);
  const t375Passed = dupRes.valid === false &&
    dupRes.brokenAt === 2 &&
    dupRes.reason === 'DUPLICATE_SEQUENCE';

  results.push({
    scenarioId: 375,
    scenarioName: 'Phase 2H-7D: Duplicate sequence numbers in chain are rejected with DUPLICATE_SEQUENCE',
    expectedResult: 'ALLOW',
    actualResult: t375Passed ? 'ALLOW' : 'DENY',
    passed: t375Passed,
    notes: 'Replay of existing sequence numbers is rejected by sequence set validation.',
  });

  // =========================================================================
  // Scenario 376: Sensitive credentials/tokens are excluded or redacted
  // =========================================================================
  const sensitivePayload = {
    apiKey: 'ai_studio_secret_key_12345',
    password: 'super_secret_master_password',
    bearerToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token',
    userContext: {
      userId: 'usr-sec-01',
      sessionSecret: 'sess_secret_token_999',
    },
    publicNote: 'Approved standard alteration',
  };

  const sensitiveEntry = AuditChainService.appendAuditEntry({
    eventType: 'SECURITY_EVENT',
    actorId: 'usr-admin-sec',
    actorRole: 'super_admin',
    orgId: 'org-fabriq-global',
    entityType: 'AuthProfile',
    entityId: 'usr-sec-01',
    action: 'ROTATE_CREDENTIALS',
    payload: sensitivePayload,
  });

  const payloadString = JSON.stringify(sensitiveEntry.payload);
  const t376Passed = !payloadString.includes('ai_studio_secret_key_12345') &&
    !payloadString.includes('super_secret_master_password') &&
    !payloadString.includes('eyJhbGciOiJIUzI1Ni') &&
    !payloadString.includes('sess_secret_token_999') &&
    sensitiveEntry.payload.apiKey === '[REDACTED]' &&
    sensitiveEntry.payload.password === '[REDACTED]' &&
    sensitiveEntry.payload.publicNote === 'Approved standard alteration';

  results.push({
    scenarioId: 376,
    scenarioName: 'Phase 2H-7D: Sensitive credentials, passwords, and tokens are scrubbed with [REDACTED]',
    expectedResult: 'ALLOW',
    actualResult: t376Passed ? 'ALLOW' : 'DENY',
    passed: t376Passed,
    notes: 'Sensitive secrets are redacted before payload canonicalization and hashing.',
  });

  // =========================================================================
  // Scenario 377: Enterprise mutation creates audit entry
  // =========================================================================
  const chainLengthBefore = AuditChainService.getAuditChain().length;
  const exc = EnterpriseOperationsService.createException(
    {
      orgId: 'org-ops-global-01',
      orderId: 'ord-audit-test-101',
      exceptionType: 'QUALITY_FAILURE',
      severity: 'HIGH',
      title: 'Hemline thread snag detected in final QA',
      description: 'Minor seam pull requires couture hand-stitching rework',
      branchId: 'br-hyd-01',
      divisionId: 'boutique',
    },
    { actorId: 'usr-qa-01', actorRole: 'quality_inspector', orgId: 'org-ops-global-01', branchId: 'br-hyd-01' }
  );

  const chainLengthAfter = AuditChainService.getAuditChain().length;
  const latestAuditEntry = AuditChainService.getAuditChain()[chainLengthAfter - 1];
  const t377Passed = chainLengthAfter === chainLengthBefore + 1 &&
    latestAuditEntry.entityType === 'WorkflowException' &&
    latestAuditEntry.entityId === exc.exceptionId &&
    latestAuditEntry.action === 'CREATE_EXCEPTION';

  results.push({
    scenarioId: 377,
    scenarioName: 'Phase 2H-7D: Enterprise business mutations automatically append verified audit chain entries',
    expectedResult: 'ALLOW',
    actualResult: t377Passed ? 'ALLOW' : 'DENY',
    passed: t377Passed,
    notes: 'Enterprise operations mutations seamlessly trigger appendAuditEntry in the audit chain.',
  });

  // =========================================================================
  // Scenario 378: Correlation ID and tenant scope are preserved
  // =========================================================================
  const scopedAuditEntry = AuditChainService.appendAuditEntry({
    eventType: 'FINANCIAL_RECONCILIATION',
    actorId: 'usr-fin-01',
    actorRole: 'finance_manager',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyderabad-west',
    branchId: 'br-hitech-02',
    entityType: 'SettlementBatch',
    entityId: 'stl-batch-902',
    action: 'APPROVE_SETTLEMENT',
    payload: { grossInMinorUnits: 1250000, netPayoutInMinorUnits: 1100000 },
    correlationId: 'corr-trace-audit-378',
  });

  const t378Passed = scopedAuditEntry.orgId === 'org-fabriq-global' &&
    scopedAuditEntry.divisionId === 'laundry' &&
    scopedAuditEntry.franchiseId === 'fr-hyderabad-west' &&
    scopedAuditEntry.branchId === 'br-hitech-02' &&
    scopedAuditEntry.correlationId === 'corr-trace-audit-378';

  results.push({
    scenarioId: 378,
    scenarioName: 'Phase 2H-7D: Correlation ID and full multi-tenant scope are preserved in audit records',
    expectedResult: 'ALLOW',
    actualResult: t378Passed ? 'ALLOW' : 'DENY',
    passed: t378Passed,
    notes: 'Audit records carry verifiable tenant isolation boundaries and correlation identifiers.',
  });

  return results;
}
