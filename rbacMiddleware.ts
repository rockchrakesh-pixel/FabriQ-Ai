import { Request, Response, NextFunction } from 'express';

export const CORPORATE_ROLES = ['super_admin', 'ceo', 'owner', 'mis', 'finance'];

/**
 * Reusable Role-Based Access Control (RBAC) Middleware.
 * Ensures req.user has one of the allowed roles before proceeding.
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized: No authenticated user identity found in request context.',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userRole = req.user.role || 'customer';

    // Corporate super-admins and CEOs always pass RBAC authorization
    if (userRole === 'super_admin' || userRole === 'ceo') {
      next();
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Forbidden: Role '${userRole}' does not have permission to perform this operation. Permitted roles: [${allowedRoles.join(', ')}]`,
        code: 'ROLE_FORBIDDEN',
      });
      return;
    }

    next();
  };
}
