import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import {
  EnterpriseOperationsService,
  OperationsQueryFilters,
  getOperationsAuditLogs,
} from '../services/enterpriseOperationsService';

export const operationsRouter = Router();

const operationsLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 90 });

const OPERATIONS_ROLES = [
  'super_admin',
  'ceo',
  'owner',
  'franchise_owner',
  'regional_manager',
  'area_manager',
  'store_manager',
  'store_staff',
  'quality_inspector',
  'pickup_executive',
  'delivery_executive',
  'mis',
  'finance',
  'inventory',
];

/**
 * 1. GET /api/operations/command-center
 */
operationsRouter.get(
  '/operations/command-center',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...OPERATIONS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId, timeframe } = req.query;

      const filters: OperationsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId: divisionId as string,
        franchiseId: (franchiseId as string) || (user.role === 'franchise_owner' ? user.franchiseId : undefined),
        branchId: (branchId as string) || (['store_manager', 'store_staff', 'quality_inspector'].includes(user.role) ? user.branchId : undefined),
        timeframe: timeframe as string,
      };

      const summary = EnterpriseOperationsService.getCommandCenterSummary(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, summary });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to retrieve operations command center summary',
      });
    }
  }
);

/**
 * 2. GET /api/operations/sla
 */
operationsRouter.get(
  '/operations/sla',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...OPERATIONS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId } = req.query;

      const filters: OperationsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId: divisionId as string,
        franchiseId: franchiseId as string,
        branchId: branchId as string,
      };

      const slaList = EnterpriseOperationsService.getSLAMetrics(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, slaList, total: slaList.length });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to retrieve SLA metrics',
      });
    }
  }
);

/**
 * 3. POST /api/operations/sla/:orderId/escalate
 */
operationsRouter.post(
  '/operations/sla/:orderId/escalate',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { orderId } = req.params;
      const { reason } = req.body;

      const result = EnterpriseOperationsService.triggerSLAEscalation(
        orderId,
        {
          actorId: user.uid || 'usr-system',
          actorRole: user.role,
          orgId: user.orgId || 'org-fabriq-global',
          franchiseId: user.franchiseId,
          branchId: user.branchId,
        },
        reason
      );

      res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to trigger SLA escalation',
      });
    }
  }
);

/**
 * 4. GET /api/operations/exceptions
 */
operationsRouter.get(
  '/operations/exceptions',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...OPERATIONS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId, status, severity } = req.query;

      const filters: OperationsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId: divisionId as string,
        franchiseId: franchiseId as string,
        branchId: branchId as string,
        status: status as string,
        severity: severity as any,
      };

      const exceptions = EnterpriseOperationsService.listExceptions(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, exceptions, total: exceptions.length });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to list workflow exceptions',
      });
    }
  }
);

/**
 * 5. POST /api/operations/exceptions
 */
operationsRouter.post(
  '/operations/exceptions',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...OPERATIONS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId, orderId, garmentId, exceptionType, severity, title, description, assignedRole } = req.body;

      if (!exceptionType || !severity || !title || !description) {
        res.status(400).json({ error: 'exceptionType, severity, title, and description are required' });
        return;
      }

      const exception = EnterpriseOperationsService.createException(
        {
          orgId: user.orgId || 'org-fabriq-global',
          divisionId: divisionId || user.divisionId || 'laundry',
          franchiseId: franchiseId || user.franchiseId,
          branchId: branchId || user.branchId || 'b-hyd-bowenpally',
          orderId,
          garmentId,
          exceptionType,
          severity,
          title,
          description,
          assignedRole,
        },
        {
          actorId: user.uid || 'usr-system',
          actorRole: user.role,
          orgId: user.orgId || 'org-fabriq-global',
          franchiseId: user.franchiseId,
          branchId: user.branchId,
        }
      );

      res.status(201).json({ success: true, exception });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to create workflow exception',
      });
    }
  }
);

/**
 * 6. POST /api/operations/exceptions/:id/acknowledge
 */
operationsRouter.post(
  '/operations/exceptions/:id/acknowledge',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager', 'store_staff'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { notes } = req.body;

      const exception = EnterpriseOperationsService.acknowledgeException(
        id,
        {
          actorId: user.uid || 'usr-system',
          actorRole: user.role,
          orgId: user.orgId || 'org-fabriq-global',
          franchiseId: user.franchiseId,
          branchId: user.branchId,
        },
        notes
      );

      res.status(200).json({ success: true, exception });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to acknowledge exception',
      });
    }
  }
);

/**
 * 7. POST /api/operations/exceptions/:id/resolve
 */
operationsRouter.post(
  '/operations/exceptions/:id/resolve',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager', 'store_staff'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { resolutionNotes } = req.body;

      if (!resolutionNotes) {
        res.status(400).json({ error: 'resolutionNotes are required to resolve an exception' });
        return;
      }

      const exception = EnterpriseOperationsService.resolveException(
        id,
        {
          actorId: user.uid || 'usr-system',
          actorRole: user.role,
          orgId: user.orgId || 'org-fabriq-global',
          franchiseId: user.franchiseId,
          branchId: user.branchId,
        },
        resolutionNotes
      );

      res.status(200).json({ success: true, exception });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to resolve exception',
      });
    }
  }
);

/**
 * 8. POST /api/operations/exceptions/:id/escalate
 */
operationsRouter.post(
  '/operations/exceptions/:id/escalate',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { targetRole, reason } = req.body;

      if (!targetRole || !reason) {
        res.status(400).json({ error: 'targetRole and reason are required to escalate an exception' });
        return;
      }

      const exception = EnterpriseOperationsService.escalateException(
        id,
        {
          actorId: user.uid || 'usr-system',
          actorRole: user.role,
          orgId: user.orgId || 'org-fabriq-global',
          franchiseId: user.franchiseId,
          branchId: user.branchId,
        },
        targetRole,
        reason
      );

      res.status(200).json({ success: true, exception });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to escalate exception',
      });
    }
  }
);

/**
 * 9. GET /api/operations/capacity
 */
operationsRouter.get(
  '/operations/capacity',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...OPERATIONS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { branchId } = req.query;

      const filters: OperationsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        branchId: branchId as string,
      };

      const capacity = EnterpriseOperationsService.getCapacityMetrics(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, capacity });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to retrieve capacity metrics',
      });
    }
  }
);

/**
 * 10. GET /api/operations/quality
 */
operationsRouter.get(
  '/operations/quality',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...OPERATIONS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { branchId } = req.query;

      const filters: OperationsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        branchId: branchId as string,
      };

      const quality = EnterpriseOperationsService.getQualityMetrics(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, quality });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to retrieve quality metrics',
      });
    }
  }
);

/**
 * 11. POST /api/operations/sla-monitor/job
 */
operationsRouter.post(
  '/operations/sla-monitor/job',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'mis', 'regional_manager'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId } = req.body;

      const filters: OperationsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId,
        franchiseId,
        branchId,
      };

      const result = EnterpriseOperationsService.enqueueSLAMonitoringJob(filters, {
        actorId: user.uid || 'usr-system',
        actorRole: user.role,
        orgId: user.orgId || 'org-fabriq-global',
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(202).json({ success: true, message: 'SLA monitoring job enqueued', ...result });
    } catch (err: any) {
      res.status(err.message?.includes('denied') || err.message?.includes('Cross-') ? 403 : 400).json({
        error: err?.message || 'Failed to enqueue SLA monitoring job',
      });
    }
  }
);

/**
 * 12. GET /api/operations/audit-logs
 */
operationsRouter.get(
  '/operations/audit-logs',
  operationsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'mis', 'finance', 'regional_manager'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const logs = getOperationsAuditLogs(user.orgId || 'org-fabriq-global');
      res.status(200).json({ success: true, logs, total: logs.length });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to retrieve operations audit logs' });
    }
  }
);
