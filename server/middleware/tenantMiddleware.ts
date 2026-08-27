import { Request, Response, NextFunction } from 'express';
import { CORPORATE_ROLES } from './rbacMiddleware';

/**
 * Reusable Multi-Tenant Scope Authorization Middleware.
 * Validates requested orgId, franchiseId, branchId against req.user scope.
 * Prevents client-supplied tenant identifier tampering.
 */
export function validateTenantScope(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized: No user session found for tenant scope validation.',
      code: 'TENANT_AUTH_REQUIRED',
    });
    return;
  }

  const { role, orgId, franchiseId, branchId } = req.user;

  // Corporate global roles bypass branch/franchise boundary checks
  if (CORPORATE_ROLES.includes(role)) {
    next();
    return;
  }

  // Extract requested tenant targets from request body, params, or query
  const requestedOrgId = req.body?.orgId || req.query?.orgId || req.params?.orgId;
  const requestedFranchiseId = req.body?.franchiseId || req.query?.franchiseId || req.params?.franchiseId;
  const requestedBranchId = req.body?.branchId || req.query?.branchId || req.params?.branchId;

  // Validate Organization scope
  if (requestedOrgId && orgId && requestedOrgId !== orgId) {
    res.status(403).json({
      error: `Forbidden: Tenant scope violation. User from Org '${orgId}' cannot access Org '${requestedOrgId}'.`,
      code: 'TENANT_ORG_MISMATCH',
    });
    return;
  }

  // Validate Franchise scope for franchise managers
  if (requestedFranchiseId && franchiseId && role === 'franchise_owner' && requestedFranchiseId !== franchiseId) {
    res.status(403).json({
      error: `Forbidden: Tenant scope violation. User from Franchise '${franchiseId}' cannot access Franchise '${requestedFranchiseId}'.`,
      code: 'TENANT_FRANCHISE_MISMATCH',
    });
    return;
  }

  // Validate Branch scope for store staff / managers
  if (
    requestedBranchId &&
    branchId &&
    ['store_manager', 'store_staff', 'pickup_executive', 'delivery_executive', 'inventory'].includes(role) &&
    requestedBranchId !== branchId
  ) {
    res.status(403).json({
      error: `Forbidden: Tenant scope violation. Staff assigned to Branch '${branchId}' cannot perform operations on Branch '${requestedBranchId}'.`,
      code: 'TENANT_BRANCH_MISMATCH',
    });
    return;
  }

  next();
}
