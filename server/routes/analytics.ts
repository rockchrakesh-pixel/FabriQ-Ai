import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import {
  EnterpriseAnalyticsService,
  getAnalyticsAuditLogs,
} from '../services/enterpriseAnalyticsService';
import { AnalyticsQueryFilters } from '../../src/types';

export const analyticsRouter = Router();

const analyticsLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 80 });

const ANALYTICS_ROLES = [
  'super_admin',
  'ceo',
  'owner',
  'franchise_owner',
  'regional_manager',
  'area_manager',
  'store_manager',
  'mis',
  'finance',
];

/**
 * 1. GET /analytics/executive-summary
 */
analyticsRouter.get(
  '/analytics/executive-summary',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...ANALYTICS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId, timeframe, startDate, endDate } = req.query;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId: divisionId as string,
        franchiseId: (franchiseId as string) || (user.role === 'franchise_owner' ? user.franchiseId : undefined),
        branchId: branchId as string,
        timeframe: (timeframe as any) || 'this_month',
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const summary = EnterpriseAnalyticsService.getExecutiveSummary(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, summary });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to retrieve executive analytics summary' });
    }
  }
);

/**
 * 2. GET /analytics/operational-kpis
 */
analyticsRouter.get(
  '/analytics/operational-kpis',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...ANALYTICS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId, startDate, endDate } = req.query;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId: divisionId as string,
        franchiseId: (franchiseId as string) || (user.role === 'franchise_owner' ? user.franchiseId : undefined),
        branchId: branchId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const kpis = EnterpriseAnalyticsService.getOperationalKpiMetrics(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, kpis });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to retrieve operational KPIs' });
    }
  }
);

/**
 * 3. GET /analytics/divisions
 */
analyticsRouter.get(
  '/analytics/divisions',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...ANALYTICS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { franchiseId, branchId } = req.query;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        franchiseId: (franchiseId as string) || (user.role === 'franchise_owner' ? user.franchiseId : undefined),
        branchId: branchId as string,
      };

      const comparisons = EnterpriseAnalyticsService.getDivisionComparison(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, divisions: comparisons });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to retrieve division analytics comparison' });
    }
  }
);

/**
 * 4. GET /analytics/unit-economics
 */
analyticsRouter.get(
  '/analytics/unit-economics',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId } = req.query;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId: divisionId as string,
        franchiseId: (franchiseId as string) || (user.role === 'franchise_owner' ? user.franchiseId : undefined),
        branchId: branchId as string,
      };

      const unitEconomics = EnterpriseAnalyticsService.getUnitEconomics(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, unitEconomics });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to retrieve unit economics' });
    }
  }
);

/**
 * 5. GET /analytics/cohorts
 */
analyticsRouter.get(
  '/analytics/cohorts',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'regional_manager', 'mis', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId } = req.query;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId: divisionId as string,
        franchiseId: franchiseId as string,
        branchId: branchId as string,
      };

      const cohorts = EnterpriseAnalyticsService.getCustomerCohorts(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, cohorts });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to retrieve customer cohort metrics' });
    }
  }
);

/**
 * 6. GET /analytics/inventory-consumption
 */
analyticsRouter.get(
  '/analytics/inventory-consumption',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles(...ANALYTICS_ROLES),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { branchId } = req.query;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        branchId: branchId as string,
      };

      const inventoryConsumption = EnterpriseAnalyticsService.getInventoryConsumptionAnalytics(filters, {
        orgId: user.orgId,
        role: user.role,
        userId: user.uid,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, inventoryConsumption });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to retrieve inventory consumption analytics' });
    }
  }
);

/**
 * 7. POST /analytics/snapshot/enqueue
 */
analyticsRouter.post(
  '/analytics/snapshot/enqueue',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'mis', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId, timeframe } = req.body;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId,
        franchiseId,
        branchId,
        timeframe: timeframe || 'this_month',
      };

      const result = EnterpriseAnalyticsService.enqueueAnalyticsSnapshotJob(filters, {
        actorId: user.uid,
        actorRole: user.role,
        orgId: user.orgId,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(202).json({ success: true, message: 'Analytics snapshot compilation job enqueued', ...result });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to enqueue analytics snapshot' });
    }
  }
);

/**
 * 8. POST /analytics/export
 */
analyticsRouter.post(
  '/analytics/export',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'owner', 'regional_manager', 'mis', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { divisionId, franchiseId, branchId, format = 'json' } = req.body;

      const filters: AnalyticsQueryFilters = {
        orgId: user.orgId || 'org-fabriq-global',
        divisionId,
        franchiseId,
        branchId,
      };

      const exportResult = EnterpriseAnalyticsService.generateExport(filters, format === 'csv' ? 'csv' : 'json', {
        actorId: user.uid,
        actorRole: user.role,
        orgId: user.orgId,
        franchiseId: user.franchiseId,
        branchId: user.branchId,
      });

      res.status(200).json({ success: true, ...exportResult });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to generate analytics export' });
    }
  }
);

/**
 * 9. GET /analytics/audit-logs
 */
analyticsRouter.get(
  '/analytics/audit-logs',
  analyticsLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  requireRoles('super_admin', 'ceo', 'mis', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const logs = getAnalyticsAuditLogs(user.orgId || 'org-fabriq-global');
      res.status(200).json({ success: true, logs, total: logs.length });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to retrieve analytics audit logs' });
    }
  }
);
