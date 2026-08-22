import { Router, Request, Response } from 'express';
import { MeasurementService } from '../services/measurementService';
import { WorkflowEngineService } from '../services/workflowEngine';
import { OrderInventoryService } from '../services/orderInventoryService';
import { IdempotencyService } from '../services/idempotencyService';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { LoggerService } from '../services/loggerService';

export const customerMeasurementsRouter = Router();

const measurementRateLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 60 });

const STAFF_ADMIN_ROLES = [
  'store_staff',
  'quality_inspector',
  'store_manager',
  'area_manager',
  'regional_manager',
  'mis',
  'finance',
  'inventory',
  'franchise_owner',
  'owner',
  'ceo',
  'super_admin',
];

/**
 * Helper to check whether requesting user can access customer data
 */
function isAuthorizedForCustomer(user: any, targetCustomerId: string): boolean {
  if (!user) return false;
  if (user.uid === targetCustomerId) return true;
  return STAFF_ADMIN_ROLES.includes(user.role);
}

// 1. Create Customer Bespoke Measurement Profile
customerMeasurementsRouter.post(
  '/customer-measurements',
  measurementRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const idempotencyKey = req.header('X-Idempotency-Key') || req.header('x-idempotency-key');

      const {
        customerId,
        profileName = 'Primary Bespoke Fit Profile',
        measurements,
        measurementUnit = 'cm',
        notes,
      } = req.body;

      if (!customerId || !measurements || typeof measurements !== 'object') {
        res.status(400).json({ error: 'Valid customerId and measurements object are required' });
        return;
      }

      // Authorization check: Must be owner or staff/admin
      if (!isAuthorizedForCustomer(user, customerId)) {
        res.status(403).json({
          error: `Forbidden: User '${user.uid}' is not authorized to create measurement profiles for customer '${customerId}'`,
          code: 'CUSTOMER_MEASUREMENT_ACCESS_DENIED',
        });
        return;
      }

      // Tenant derivation from authenticated token context
      const tenantOrgId = user.orgId || 'org-fabriq-global';
      const tenantDivisionId = user.divisionId || 'div-fabriq-boutique';
      const tenantFranchiseId = user.franchiseId || null;
      const tenantBranchId = user.branchId || null;

      // Idempotency check
      if (idempotencyKey) {
        const idempCheck = IdempotencyService.acquireLock({
          idempotencyKey,
          orgId: tenantOrgId,
          userId: user.uid,
          userRole: user.role,
          action: 'CREATE_MEASUREMENT_PROFILE',
          endpoint: '/api/customer-measurements',
          requestHash: IdempotencyService.generateRequestHash('POST', '/api/customer-measurements', tenantOrgId, req.body),
        });

        if (idempCheck.result === 'REPLAY' && idempCheck.record.responsePayload) {
          res.setHeader('X-Cache', 'HIT-IDEMPOTENCY');
          res.status(200).json(idempCheck.record.responsePayload);
          return;
        }

        if (idempCheck.result === 'FORBIDDEN') {
          res.status(403).json({ error: idempCheck.error });
          return;
        }
      }

      const profile = MeasurementService.createProfile({
        customerId,
        orgId: tenantOrgId,
        divisionId: tenantDivisionId,
        franchiseId: tenantFranchiseId,
        branchId: tenantBranchId,
        profileName,
        measurements,
        measurementUnit,
        notes,
        createdBy: user.uid,
        createdByRole: user.role,
      });

      const responsePayload = {
        message: 'Bespoke measurement profile created successfully',
        profile,
      };

      if (idempotencyKey) {
        IdempotencyService.complete(idempotencyKey, tenantOrgId, responsePayload);
      }

      res.status(201).json(responsePayload);
    } catch (err: any) {
      LoggerService.error(`Failed to create measurement profile: ${err?.message}`, { correlationId: req.correlationId });
      res.status(500).json({ error: 'Failed to create measurement profile', details: err?.message });
    }
  }
);

// 2. Get Active Customer Measurement Profile
customerMeasurementsRouter.get(
  '/customer-measurements/:customerId',
  authenticateFirebaseToken,
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { customerId } = req.params;

      if (!isAuthorizedForCustomer(user, customerId)) {
        res.status(403).json({
          error: `Forbidden: User '${user.uid}' cannot access measurements for customer '${customerId}'`,
          code: 'CUSTOMER_MEASUREMENT_ACCESS_DENIED',
        });
        return;
      }

      const profile = MeasurementService.getProfileByCustomer(customerId, user.orgId);
      if (!profile) {
        res.status(404).json({ error: `No active measurement profile found for customer '${customerId}'` });
        return;
      }

      res.status(200).json({ profile });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve measurement profile', details: err?.message });
    }
  }
);

// 3. Get Customer Measurement Profile Version History
customerMeasurementsRouter.get(
  '/customer-measurements/:customerId/history',
  authenticateFirebaseToken,
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { customerId } = req.params;

      if (!isAuthorizedForCustomer(user, customerId)) {
        res.status(403).json({
          error: `Forbidden: User '${user.uid}' cannot access measurement history for customer '${customerId}'`,
          code: 'CUSTOMER_MEASUREMENT_ACCESS_DENIED',
        });
        return;
      }

      const history = MeasurementService.getProfileHistory(customerId, user.orgId);
      res.status(200).json({ customerId, versionCount: history.length, history });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve measurement profile history', details: err?.message });
    }
  }
);

// 4. Update Measurement Profile (Increment Version)
customerMeasurementsRouter.patch(
  '/customer-measurements/:measurementProfileId',
  measurementRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { measurementProfileId } = req.params;
      const { measurements, profileName, measurementUnit, notes, changeReason } = req.body;

      const existingProfile = MeasurementService.getProfileById(measurementProfileId, user.orgId);
      if (!existingProfile) {
        res.status(404).json({ error: `Measurement profile '${measurementProfileId}' not found within tenant scope` });
        return;
      }

      if (!isAuthorizedForCustomer(user, existingProfile.customerId)) {
        res.status(403).json({
          error: `Forbidden: User '${user.uid}' cannot modify measurement profile '${measurementProfileId}'`,
          code: 'CUSTOMER_MEASUREMENT_ACCESS_DENIED',
        });
        return;
      }

      const idempotencyKey = req.header('X-Idempotency-Key') || req.header('x-idempotency-key');
      if (idempotencyKey) {
        const idempCheck = IdempotencyService.acquireLock({
          idempotencyKey,
          orgId: user.orgId,
          userId: user.uid,
          userRole: user.role,
          action: 'UPDATE_MEASUREMENT_PROFILE',
          endpoint: `/api/customer-measurements/${measurementProfileId}`,
          requestHash: IdempotencyService.generateRequestHash('PATCH', `/api/customer-measurements/${measurementProfileId}`, user.orgId, req.body),
        });

        if (idempCheck.result === 'REPLAY' && idempCheck.record.responsePayload) {
          res.setHeader('X-Cache', 'HIT-IDEMPOTENCY');
          res.status(200).json(idempCheck.record.responsePayload);
          return;
        }

        if (idempCheck.result === 'FORBIDDEN') {
          res.status(403).json({ error: idempCheck.error });
          return;
        }
      }

      const updatedProfile = MeasurementService.updateProfile(measurementProfileId, user.orgId, {
        measurements,
        profileName,
        measurementUnit,
        notes,
        changeReason,
        updatedBy: user.uid,
        updatedByRole: user.role,
      });

      const responsePayload = {
        message: `Measurement profile updated successfully to version ${updatedProfile.measurementVersion}`,
        profile: updatedProfile,
      };

      if (idempotencyKey) {
        IdempotencyService.complete(idempotencyKey, user.orgId, responsePayload);
      }

      res.status(200).json(responsePayload);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update measurement profile', details: err?.message });
    }
  }
);

// 5. Enterprise Customer 360 Aggregation API
customerMeasurementsRouter.get(
  '/customer-360/:customerId',
  measurementRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { customerId } = req.params;

      if (!isAuthorizedForCustomer(user, customerId)) {
        res.status(403).json({
          error: `Forbidden: User '${user.uid}' cannot access Customer 360 for customer '${customerId}'`,
          code: 'CUSTOMER_360_ACCESS_DENIED',
        });
        return;
      }

      // Aggregate tenant-scoped orders
      const tenantOrders = WorkflowEngineService.listOrdersByTenant(user.orgId, undefined);
      const customerOrders = tenantOrders.filter((o) => o.customerId === customerId);

      // Aggregate active garments in care / tailoring
      const allGarments = customerOrders.flatMap((o) => o.items || []);
      const activeGarments = allGarments.filter((g) => (g.qualityStatus as string) !== 'REJECTED');

      // Aggregate active tailoring measurements
      const measurementProfile = MeasurementService.getProfileByCustomer(customerId, user.orgId);

      // Financial total spent summary
      const totalSpentMinorUnits = customerOrders.reduce((sum, o) => sum + (o.totalAmountInMinorUnits || 0), 0);
      const totalTaxPaidMinorUnits = customerOrders.reduce((sum, o) => sum + (o.taxAmountInMinorUnits || 0), 0);

      // Summary metrics
      const activeOrdersCount = customerOrders.filter((o) => o.currentState !== 'COMPLETED' && o.currentState !== 'CANCELLED').length;
      const slaBreachedOrdersCount = customerOrders.filter((o) => o.slaBreached).length;

      // Aggregate inventory fulfillment status across customer orders
      const allRequirements = customerOrders.flatMap((o) => OrderInventoryService.getRequirementsByOrder(o.orderId, user.orgId));
      const reservedCount = allRequirements.filter((r) => r.status === 'RESERVED').length;
      const consumedCount = allRequirements.filter((r) => r.status === 'CONSUMED').length;
      const shortCount = allRequirements.filter((r) => r.status === 'SHORT').length;

      const customer360Data = {
        customerId,
        tenantOrgId: user.orgId,
        summary: {
          totalOrdersCount: customerOrders.length,
          activeOrdersCount,
          completedOrdersCount: customerOrders.filter((o) => o.currentState === 'COMPLETED').length,
          slaBreachedOrdersCount,
          totalGarmentsCount: allGarments.length,
          inventoryRequirementsCount: allRequirements.length,
          inventoryReservedCount: reservedCount,
          inventoryConsumedCount: consumedCount,
          inventoryShortageCount: shortCount,
          totalSpentInMinorUnits: totalSpentMinorUnits,
          totalTaxPaidInMinorUnits: totalTaxPaidMinorUnits,
          currency: 'INR',
          hasMeasurementProfile: !!measurementProfile,
          activeMeasurementVersion: measurementProfile?.measurementVersion || 0,
        },
        profile: {
          customerId,
          name: customerOrders[0]?.customerName || 'FabriQ Patron',
          phone: customerOrders[0]?.customerPhone || '+919876543210',
          tier: totalSpentMinorUnits > 500000 ? 'VIP Patron' : 'Standard Member',
        },
        bespokeMeasurementProfile: measurementProfile || null,
        activeGarments,
        recentOrders: customerOrders,
      };

      res.status(200).json(customer360Data);
    } catch (err: any) {
      LoggerService.error(`Failed to aggregate Customer 360 view: ${err?.message}`, { correlationId: req.correlationId });
      res.status(500).json({ error: 'Failed to aggregate Customer 360 data', details: err?.message });
    }
  }
);
