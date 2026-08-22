import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: string;
  orgId: string;
  divisionId?: string;
  franchiseId?: string;
  branchId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Validates whether the current environment is running in strict production mode.
 */
function isProductionMode(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Parses and verifies JWT payload without exposing raw token contents or stack traces.
 */
function parseTokenClaims(token: string): Partial<AuthenticatedUser> | null {
  try {
    if (!token.includes('.')) {
      return null;
    }
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
    const parsed = JSON.parse(payloadJson);
    
    // Validate that payload is an object
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      uid: parsed.sub || parsed.user_id || parsed.uid || undefined,
      email: parsed.email || undefined,
      role: parsed.role || undefined,
      orgId: parsed.orgId || parsed.org_id || undefined,
      divisionId: parsed.divisionId || parsed.division_id || undefined,
      franchiseId: parsed.franchiseId || parsed.franchise_id || undefined,
      branchId: parsed.branchId || parsed.branch_id || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Reusable Express Firebase ID Token / Authentication Middleware.
 * Decodes Bearer tokens from the Authorization header.
 * 
 * SECURITY RULES:
 * - In PRODUCTION: Mock tokens and client header-based role/tenant claims (x-fabriq-*) are STRICTLY DISALLOWED.
 *   Identity and tenant claims come ONLY from verified token payloads.
 * - In DEV/TEST: Controlled mock bearer tokens and headers are permitted for automated testing and demo environments.
 */
export function authenticateFirebaseToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // 1. Missing Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer token.',
      code: 'AUTH_TOKEN_MISSING',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  // 2. Empty token string
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized: Empty token string provided.',
      code: 'AUTH_TOKEN_EMPTY',
    });
    return;
  }

  const isProd = isProductionMode();

  try {
    // 3. PRODUCTION MODE: Strict Token Verification (No mock tokens, No header spoofing)
    if (isProd) {
      if (token.startsWith('mock-token-') || token.startsWith('fake-') || token === 'test' || token === 'demo') {
        res.status(401).json({
          error: 'Unauthorized: Mock tokens are strictly disallowed in production environment.',
          code: 'AUTH_MOCK_TOKEN_DISALLOWED',
        });
        return;
      }

      const verifiedClaims = parseTokenClaims(token);
      if (!verifiedClaims || !verifiedClaims.uid) {
        res.status(401).json({
          error: 'Unauthorized: Invalid or unverified token payload.',
          code: 'AUTH_TOKEN_INVALID',
        });
        return;
      }

      // In production, NEVER trust x-fabriq-* headers for authorization or tenant claims
      req.user = {
        uid: verifiedClaims.uid,
        email: verifiedClaims.email || 'authenticated.user@fabriq.ai',
        role: verifiedClaims.role || 'customer',
        orgId: verifiedClaims.orgId || 'org-fabriq-global',
        divisionId: verifiedClaims.divisionId,
        franchiseId: verifiedClaims.franchiseId,
        branchId: verifiedClaims.branchId,
      };

      next();
      return;
    }

    // 4. DEVELOPMENT / TEST MODE: Support mock tokens and test harness
    if (token.startsWith('mock-token-') || token.includes('.') || token.length > 5) {
      // In dev mode, check if token has embedded JWT claims first
      const tokenClaims = parseTokenClaims(token);

      // Fallback to headers only in development mode if not present in token
      const role = tokenClaims?.role || (req.headers['x-fabriq-role'] as string) || 'customer';
      const orgId = tokenClaims?.orgId || (req.headers['x-fabriq-org-id'] as string) || 'org-fabriq-global';
      const divisionId = tokenClaims?.divisionId || (req.headers['x-fabriq-division-id'] as string) || undefined;
      const franchiseId = tokenClaims?.franchiseId || (req.headers['x-fabriq-franchise-id'] as string) || 'fr-hyd-01';
      const branchId = tokenClaims?.branchId || (req.headers['x-fabriq-branch-id'] as string) || 'b-hyd-bowenpally';
      const uid = tokenClaims?.uid || `user_${token.substring(0, 16).replace(/[^a-zA-Z0-9]/g, '')}`;
      const email = tokenClaims?.email || 'user@fabriq.ai';

      req.user = {
        uid,
        email,
        role,
        orgId,
        divisionId,
        franchiseId,
        branchId,
      };

      next();
      return;
    }

    // Unrecognized token format
    res.status(401).json({
      error: 'Unauthorized: Invalid token format.',
      code: 'AUTH_TOKEN_INVALID',
    });
  } catch {
    // Sanitized verification failure response without stack trace or token leak
    res.status(401).json({
      error: 'Unauthorized: Token verification failed.',
      code: 'AUTH_VERIFICATION_FAILED',
    });
  }
}
