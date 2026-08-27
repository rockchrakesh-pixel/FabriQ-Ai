import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { Request, Response } from 'express';

export interface VerificationResult {
  scenarioId: number;
  scenarioName: string;
  expectedResult: 'ALLOW' | 'DENY';
  actualResult: 'ALLOW' | 'DENY';
  passed: boolean;
  notes: string;
}

function createMockRequest(headers: Record<string, string> = {}, body: any = {}, params: any = {}, query: any = {}): Request {
  return {
    headers: { ...headers },
    body: { ...body },
    params: { ...params },
    query: { ...query },
    user: undefined,
  } as unknown as Request;
}

function createMockResponse(): { res: Response; getStatus: () => number; getBody: () => any } {
  let statusCode = 200;
  let responseBody: any = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      responseBody = data;
      return this;
    },
    send(data: any) {
      responseBody = data;
      return this;
    },
  } as unknown as Response;

  return {
    res,
    getStatus: () => statusCode,
    getBody: () => responseBody,
  };
}

function generateMockJwt(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock_signature_phase2h7a';
  return `${header}.${body}.${signature}`;
}

export function runPhase2H7aVerificationSuite(): VerificationResult[] {
  const results: VerificationResult[] = [];
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    // =========================================================================
    // Scenario 323 (Test A1): Production Request with Mock Token + Header Role Spoofing
    // =========================================================================
    process.env.NODE_ENV = 'production';
    const req323 = createMockRequest({
      authorization: 'Bearer mock-token-attacker-123',
      'x-fabriq-role': 'ceo',
      'x-fabriq-org-id': 'org-fabriq-global',
    });
    const resObj323 = createMockResponse();
    let nextCalled323 = false;
    authenticateFirebaseToken(req323, resObj323.res, () => { nextCalled323 = true; });

    const t323Passed = !nextCalled323 && resObj323.getStatus() === 401 && resObj323.getBody()?.code === 'AUTH_MOCK_TOKEN_DISALLOWED';
    results.push({
      scenarioId: 323,
      scenarioName: 'Phase 2H-7A: Production mode strictly rejects mock tokens and header role spoofing',
      expectedResult: 'DENY',
      actualResult: t323Passed ? 'DENY' : 'ALLOW',
      passed: t323Passed,
      notes: 'In production mode, mock-token-* with x-fabriq-role header is rejected with 401 AUTH_MOCK_TOKEN_DISALLOWED and never grants CEO permissions.',
    });

    // =========================================================================
    // Scenario 324 (Test A2): Production Request with Fake Role Header and No Auth
    // =========================================================================
    const req324 = createMockRequest({
      'x-fabriq-role': 'super_admin',
    });
    const resObj324 = createMockResponse();
    let nextCalled324 = false;
    authenticateFirebaseToken(req324, resObj324.res, () => { nextCalled324 = true; });

    const t324Passed = !nextCalled324 && resObj324.getStatus() === 401 && resObj324.getBody()?.code === 'AUTH_TOKEN_MISSING';
    results.push({
      scenarioId: 324,
      scenarioName: 'Phase 2H-7A: Missing Authorization header rejected regardless of client headers',
      expectedResult: 'DENY',
      actualResult: t324Passed ? 'DENY' : 'ALLOW',
      passed: t324Passed,
      notes: 'Unauthenticated requests with client-injected role headers are immediately denied with HTTP 401.',
    });

    // =========================================================================
    // Scenario 325 (Test A3): Production Tenant Claims Come Solely From Verified Token
    // =========================================================================
    const validJwtCust = generateMockJwt({
      sub: 'usr-cust-9988',
      email: 'customer@client.com',
      role: 'customer',
      orgId: 'org-tenant-actual',
      franchiseId: 'fr-tenant-actual',
      branchId: 'b-tenant-actual',
    });

    const req325 = createMockRequest({
      authorization: `Bearer ${validJwtCust}`,
      'x-fabriq-role': 'ceo', // Attacker trying to spoof role
      'x-fabriq-org-id': 'org-ATTACKER-TARGET', // Attacker trying to spoof org
    });
    const resObj325 = createMockResponse();
    let nextCalled325 = false;
    authenticateFirebaseToken(req325, resObj325.res, () => { nextCalled325 = true; });

    const user325 = req325.user;
    const t325Passed = nextCalled325 && 
      user325?.role === 'customer' && 
      user325?.orgId === 'org-tenant-actual' &&
      (user325?.role as string) !== 'ceo' &&
      (user325?.orgId as string) !== 'org-ATTACKER-TARGET';

    results.push({
      scenarioId: 325,
      scenarioName: 'Phase 2H-7A: Production identity claims derive exclusively from verified token payload',
      expectedResult: 'ALLOW',
      actualResult: t325Passed ? 'ALLOW' : 'DENY',
      passed: t325Passed,
      notes: 'Client-supplied x-fabriq-role and x-fabriq-org-id headers are completely ignored in production in favor of token payload.',
    });

    // =========================================================================
    // Scenario 326 (Test A4): Development / Test Mock Authentication Compatibility
    // =========================================================================
    process.env.NODE_ENV = 'development';
    const req326 = createMockRequest({
      authorization: 'Bearer mock-token-dev-test-suite',
      'x-fabriq-role': 'quality_inspector',
      'x-fabriq-org-id': 'org-fabriq-dev',
    });
    const resObj326 = createMockResponse();
    let nextCalled326 = false;
    authenticateFirebaseToken(req326, resObj326.res, () => { nextCalled326 = true; });

    const user326 = req326.user;
    const t326Passed = nextCalled326 && user326?.role === 'quality_inspector' && user326?.orgId === 'org-fabriq-dev';
    results.push({
      scenarioId: 326,
      scenarioName: 'Phase 2H-7A: Development and test mode supports controlled mock authentication for testing harness',
      expectedResult: 'ALLOW',
      actualResult: t326Passed ? 'ALLOW' : 'DENY',
      passed: t326Passed,
      notes: 'Controlled mock token verification functions properly in development/test without breaking existing suites.',
    });

    // =========================================================================
    // Scenario 327 (Test A5): Authenticated Role Allowed on Authorized Route
    // =========================================================================
    const req327 = createMockRequest({
      authorization: 'Bearer mock-token-store-mgr',
      'x-fabriq-role': 'store_manager',
    });
    const resObj327 = createMockResponse();
    authenticateFirebaseToken(req327, resObj327.res, () => {});

    let rbacNext327 = false;
    const rbacGuard327 = requireRoles('store_manager', 'super_admin');
    rbacGuard327(req327, resObj327.res, () => { rbacNext327 = true; });

    const t327Passed = rbacNext327 && resObj327.getStatus() === 200;
    results.push({
      scenarioId: 327,
      scenarioName: 'Phase 2H-7A: Authorized role passes RBAC gate successfully',
      expectedResult: 'ALLOW',
      actualResult: t327Passed ? 'ALLOW' : 'DENY',
      passed: t327Passed,
      notes: 'Authenticated store_manager role passes through store_manager permitted endpoint.',
    });

    // =========================================================================
    // Scenario 328 (Test A6): Authenticated Role Denied on Unauthorized Route (403)
    // =========================================================================
    const req328 = createMockRequest({
      authorization: 'Bearer mock-token-cust-01',
      'x-fabriq-role': 'customer',
    });
    const resObj328 = createMockResponse();
    authenticateFirebaseToken(req328, resObj328.res, () => {});

    let rbacNext328 = false;
    const rbacGuard328 = requireRoles('ceo', 'super_admin');
    rbacGuard328(req328, resObj328.res, () => { rbacNext328 = true; });

    const t328Passed = !rbacNext328 && resObj328.getStatus() === 403 && resObj328.getBody()?.code === 'ROLE_FORBIDDEN';
    results.push({
      scenarioId: 328,
      scenarioName: 'Phase 2H-7A: Unauthorized role returns HTTP 403 Forbidden with structured code',
      expectedResult: 'DENY',
      actualResult: t328Passed ? 'DENY' : 'ALLOW',
      passed: t328Passed,
      notes: 'Customer role attempting to access CEO endpoint is blocked with 403 ROLE_FORBIDDEN.',
    });

    // =========================================================================
    // Scenario 329 (Test A7): Missing Authentication Against Protected Route
    // =========================================================================
    const req329 = createMockRequest({});
    const resObj329 = createMockResponse();
    let nextCalled329 = false;
    authenticateFirebaseToken(req329, resObj329.res, () => { nextCalled329 = true; });

    const t329Passed = !nextCalled329 && resObj329.getStatus() === 401 && resObj329.getBody()?.code === 'AUTH_TOKEN_MISSING';
    results.push({
      scenarioId: 329,
      scenarioName: 'Phase 2H-7A: Protected endpoints return HTTP 401 for unauthenticated requests',
      expectedResult: 'DENY',
      actualResult: t329Passed ? 'DENY' : 'ALLOW',
      passed: t329Passed,
      notes: 'Protected endpoints immediately return 401 with standard AUTH_TOKEN_MISSING error structure.',
    });

    // =========================================================================
    // Scenario 330 (Test A8): Malformed / Empty Authentication Tokens (401)
    // =========================================================================
    const req330 = createMockRequest({
      authorization: 'Bearer ',
    });
    const resObj330 = createMockResponse();
    let nextCalled330 = false;
    authenticateFirebaseToken(req330, resObj330.res, () => { nextCalled330 = true; });

    const t330Passed = !nextCalled330 && resObj330.getStatus() === 401 && resObj330.getBody()?.code === 'AUTH_TOKEN_EMPTY';
    results.push({
      scenarioId: 330,
      scenarioName: 'Phase 2H-7A: Empty or malformed token string returns HTTP 401 AUTH_TOKEN_EMPTY',
      expectedResult: 'DENY',
      actualResult: t330Passed ? 'DENY' : 'ALLOW',
      passed: t330Passed,
      notes: 'Empty bearer tokens are rejected cleanly with HTTP 401.',
    });

    // =========================================================================
    // Scenario 331 (Test A9): Cross-Tenant Request Validation Remains Enforced
    // =========================================================================
    const req331 = createMockRequest(
      {
        authorization: 'Bearer mock-token-franchise-owner',
        'x-fabriq-role': 'franchise_owner',
        'x-fabriq-org-id': 'org-fabriq-hyd',
      },
      {
        orgId: 'org-fabriq-blr', // Mismatched body orgId
      }
    );
    const resObj331 = createMockResponse();
    authenticateFirebaseToken(req331, resObj331.res, () => {});

    let tenantNext331 = false;
    validateTenantScope(req331, resObj331.res, () => { tenantNext331 = true; });

    const t331Passed = !tenantNext331 && resObj331.getStatus() === 403 && resObj331.getBody()?.code === 'TENANT_ORG_MISMATCH';
    results.push({
      scenarioId: 331,
      scenarioName: 'Phase 2H-7A: Cross-tenant body mismatch is rejected by tenant isolation middleware',
      expectedResult: 'DENY',
      actualResult: t331Passed ? 'DENY' : 'ALLOW',
      passed: t331Passed,
      notes: 'validateTenantScope detects tenant boundary cross-over and rejects with 403 TENANT_ORG_MISMATCH.',
    });

    // =========================================================================
    // Scenario 332 (Test A10): Sanitized Error Responses (No Token Leaks, No Stack Traces)
    // =========================================================================
    process.env.NODE_ENV = 'production';
    const sensitiveSecretToken = 'secret-api-key-internal-token-12345';
    const req332 = createMockRequest({
      authorization: `Bearer ${sensitiveSecretToken}`,
    });
    const resObj332 = createMockResponse();
    authenticateFirebaseToken(req332, resObj332.res, () => {});

    const body332 = JSON.stringify(resObj332.getBody() || {});
    const t332Passed = resObj332.getStatus() === 401 && 
      !body332.includes(sensitiveSecretToken) && 
      !body332.includes('stack') && 
      !body332.includes('node_modules') && 
      !body332.includes('/server/');

    results.push({
      scenarioId: 332,
      scenarioName: 'Phase 2H-7A: Error responses never expose sensitive tokens, secrets, or internal stack traces',
      expectedResult: 'ALLOW',
      actualResult: t332Passed ? 'ALLOW' : 'DENY',
      passed: t332Passed,
      notes: 'Error payloads are strictly sanitized and contain only code and generic sanitized error descriptions.',
    });

  } finally {
    process.env.NODE_ENV = originalNodeEnv;
  }

  return results;
}
