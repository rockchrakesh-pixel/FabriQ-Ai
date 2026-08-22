import { Router, Request, Response } from 'express';
import { WorkflowEngineService, OrderLifecycleState, GarmentCareStage, GarmentTraceabilityUnit } from '../services/workflowEngine';
import { TaxEngineService } from '../services/taxEngineService';
import { IdempotencyService } from '../services/idempotencyService';
import { backgroundQueueService } from '../services/backgroundQueueService';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { LoggerService } from '../services/loggerService';

export const ordersRouter = Router();

const orderRateLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 60 });

// 1. Create Enterprise Order with Garment Traceability & HSN/SAC Tax Calculation
ordersRouter.post(
  '/orders',
  orderRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const idempotencyKey = req.header('X-Idempotency-Key') || req.header('x-idempotency-key');

      const {
        customerId,
        customerName,
        customerPhone,
        items,
        totalAmountInMinorUnits = 150000,
        hsnSacCode = '998813', // Laundry & Textile Care SAC
        slaTargetHours = 24,
        scheduledPickupTime,
        scheduledDeliveryTime,
      } = req.body;

      if (!customerId || !customerName || !items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Valid customerId, customerName, and non-empty items array are required' });
        return;
      }

      const tenantOrgId = user.orgId || 'org-fabriq-global';
      const tenantBranchId = user.branchId || 'b-hyd-bowenpally';

      // Idempotency check
      if (idempotencyKey) {
        const idempCheck = IdempotencyService.acquireLock({
          idempotencyKey,
          orgId: tenantOrgId,
          userId: user.uid || 'usr-client',
          userRole: user.role || 'customer',
          action: 'CREATE_ORDER',
          endpoint: '/api/orders',
          requestHash: IdempotencyService.generateRequestHash('POST', '/api/orders', tenantOrgId, req.body),
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

      // Tax engine computation using active HSN/SAC schedule
      const taxCalc = TaxEngineService.calculateTax(
        tenantOrgId,
        totalAmountInMinorUnits,
        hsnSacCode,
        new Date().toISOString(),
        { taxTreatment: 'INTRA_STATE' }
      );

      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const garmentItems: GarmentTraceabilityUnit[] = items.map((item: any, idx: number) => ({
        garmentId: `grm-${orderId}-${idx + 1}`,
        orderId,
        customerId,
        itemName: String(item.itemName || 'Garment Item').substring(0, 100),
        category: String(item.category || 'Apparel'),
        fabricType: String(item.fabricType || 'Silk / Wool Blend'),
        stainDetails: item.stainDetails ? String(item.stainDetails).substring(0, 200) : undefined,
        currentStage: 'INTAKE' as GarmentCareStage,
        qualityStatus: 'PENDING' as const,
        updatedAt: now,
      }));

      const newOrder = WorkflowEngineService.createOrder({
        orderId,
        orgId: tenantOrgId,
        divisionId: user.divisionId || 'div-fabriq-ai',
        franchiseId: user.franchiseId,
        branchId: tenantBranchId,
        customerId,
        customerName,
        customerPhone: customerPhone || '+919876543210',
        items: garmentItems,
        totalAmountInMinorUnits,
        taxAmountInMinorUnits: taxCalc.breakdown.totalTaxAmountInMinorUnits,
        hsnSacCode,
        slaTargetHours,
        scheduledPickupTime,
        scheduledDeliveryTime,
      });

      // Non-blocking background notification dispatch
      backgroundQueueService.enqueueJob(
        'order_created_notification',
        { orderId, customerName, customerPhone, amount: totalAmountInMinorUnits },
        { orgId: tenantOrgId, branchId: tenantBranchId },
        { correlationId: req.correlationId }
      );

      if (idempotencyKey) {
        IdempotencyService.complete(idempotencyKey, tenantOrgId, {
          message: 'Enterprise order created successfully',
          order: newOrder,
          taxSnapshot: taxCalc.snapshot,
        });
      }

      res.status(201).json({
        message: 'Enterprise order created successfully',
        order: newOrder,
        taxSnapshot: taxCalc.snapshot,
      });
    } catch (err: any) {
      LoggerService.error(`Failed to create order: ${err?.message}`, { correlationId: req.correlationId });
      res.status(500).json({ error: 'Failed to create enterprise order', details: err?.message });
    }
  }
);

// 2. List Orders by Tenant Boundary with Pagination
ordersRouter.get(
  '/orders',
  orderRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { page = 1, limit = 50 } = req.query;

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));

      const orders = WorkflowEngineService.listOrdersByTenant(user.orgId, user.branchId);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedOrders = orders.slice(startIndex, startIndex + limitNum);

      res.status(200).json({
        total: orders.length,
        page: pageNum,
        limit: limitNum,
        orders: paginatedOrders,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to list orders', details: err?.message });
    }
  }
);

// 3. Customer 360 & Order Details View
ordersRouter.get(
  '/orders/:orderId',
  orderRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { orderId } = req.params;

      const order = WorkflowEngineService.getOrder(orderId, user.orgId);
      if (!order) {
        res.status(404).json({ error: `Order '${orderId}' not found within authorized tenant scope` });
        return;
      }

      res.status(200).json({ order });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve order details', details: err?.message });
    }
  }
);

// 4. Transition Order Lifecycle State
ordersRouter.patch(
  '/orders/:orderId/state',
  orderRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { orderId } = req.params;
      const { newState, reason } = req.body;

      if (!newState) {
        res.status(400).json({ error: 'newState parameter is required' });
        return;
      }

      const updatedOrder = WorkflowEngineService.transitionState(
        orderId,
        newState as OrderLifecycleState,
        {
          actorId: user.uid || 'usr-staff-01',
          actorRole: user.role || 'store_staff',
          orgId: user.orgId,
          branchId: user.branchId,
        },
        reason
      );

      // Trigger state-driven notification job
      backgroundQueueService.enqueueJob(
        'order_state_change_notification',
        { orderId, newState, previousState: updatedOrder.history[updatedOrder.history.length - 1]?.previousState },
        { orgId: user.orgId, branchId: user.branchId },
        { correlationId: req.correlationId }
      );

      res.status(200).json({
        message: `Order transitioned to '${newState}' successfully`,
        order: updatedOrder,
      });
    } catch (err: any) {
      if (err?.message?.includes('Invalid state transition') || err?.message?.includes('Cross-tenant')) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Failed to transition order state', details: err?.message });
    }
  }
);

// 5. Update Garment Quality & Trigger Rework Workflow
ordersRouter.patch(
  '/orders/:orderId/garment-quality',
  orderRateLimiter,
  authenticateFirebaseToken,
  requireRoles('quality_inspector', 'store_manager', 'area_manager', 'regional_manager', 'super_admin'),
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { orderId } = req.params;
      const { garmentId, qualityStatus, stage, notes } = req.body;

      if (!garmentId || !qualityStatus || !stage) {
        res.status(400).json({ error: 'garmentId, qualityStatus, and stage are required' });
        return;
      }

      const updatedGarment = WorkflowEngineService.updateGarmentQuality(
        orderId,
        garmentId,
        qualityStatus,
        stage,
        user.uid || 'usr-inspector-01',
        notes
      );

      res.status(200).json({
        message: 'Garment quality inspection updated successfully',
        garment: updatedGarment,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update garment quality', details: err?.message });
    }
  }
);

// 6. Role-Based Work Queues Endpoint
ordersRouter.get(
  '/work-queues/:role',
  orderRateLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { role } = req.params;

      const orders = WorkflowEngineService.listOrdersByTenant(user.orgId, user.branchId);

      let filteredQueue = orders;
      if (role === 'pickup_executive') {
        filteredQueue = orders.filter((o) => o.currentState === 'CONFIRMED' || o.currentState === 'PICKUP_SCHEDULED');
      } else if (role === 'delivery_executive') {
        filteredQueue = orders.filter((o) => o.currentState === 'READY' || o.currentState === 'OUT_FOR_DELIVERY');
      } else if (role === 'quality_inspector') {
        filteredQueue = orders.filter((o) => o.currentState === 'PROCESSING' || o.currentState === 'QUALITY_CHECK' || o.currentState === 'REWORK');
      } else if (role === 'store_staff') {
        filteredQueue = orders.filter((o) => o.currentState === 'CREATED' || o.currentState === 'RECEIVED' || o.currentState === 'INSPECTED');
      }

      res.status(200).json({
        role,
        branchId: user.branchId,
        workQueueCount: filteredQueue.length,
        items: filteredQueue,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch work queue', details: err?.message });
    }
  }
);

// 7. Centralized Operational Exceptions & SLA Breach Center
ordersRouter.get(
  '/operational-exceptions',
  orderRateLimiter,
  authenticateFirebaseToken,
  requireRoles('store_manager', 'area_manager', 'regional_manager', 'mis', 'finance', 'owner', 'ceo', 'super_admin'),
  validateTenantScope,
  (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const orders = WorkflowEngineService.listOrdersByTenant(user.orgId, user.branchId);

      const slaBreachedOrders = orders.filter((o) => o.slaBreached);
      const reworkOrders = orders.filter((o) => o.currentState === 'REWORK');

      res.status(200).json({
        tenantScope: { orgId: user.orgId, branchId: user.branchId },
        summary: {
          totalOrders: orders.length,
          slaBreachesCount: slaBreachedOrders.length,
          reworkCount: reworkOrders.length,
        },
        slaBreaches: slaBreachedOrders,
        reworkQueue: reworkOrders,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve operational exceptions', details: err?.message });
    }
  }
);
