import { MOCK_STOCK, MOCK_STOCK_MOVEMENTS, MOCK_ITEMS, recordAuditLog } from '../routes/inventory';
import { StockMovementLedger, AppDivision } from '../../src/types';
import { LoggerService } from './loggerService';
import { OrderWorkflowEntity } from './workflowEngine';

export type RequirementStatus = 'REQUIRED' | 'RESERVED' | 'CONSUMED' | 'RELEASED' | 'SHORT' | 'CANCELLED';

export interface OrderInventoryRequirement {
  requirementId: string;
  orderId: string;
  orderItemId?: string;
  garmentId?: string;
  itemId: string;
  sku: string;
  itemName: string;
  orgId: string;
  divisionId: string;
  franchiseId?: string | null;
  branchId?: string | null;
  requiredQuantity: number;
  reservedQuantity: number;
  consumedQuantity: number;
  releasedQuantity: number;
  unit: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
  correlationId?: string;
}

const requirementsStore = new Map<string, OrderInventoryRequirement>();

export class OrderInventoryService {
  /**
   * Helper to map order items to stock catalog items by division
   */
  private static resolveStockItemForGarment(garment: any, divisionId: string, orgId: string) {
    // 1. Check direct SKU or itemId match
    let match = MOCK_ITEMS.find((i) => (i.itemId === garment.category || i.sku === garment.category) && i.orgId === orgId);
    if (match) return match;

    // 2. Division fallbacks
    if (divisionId === 'laundry' || divisionId === 'div-fabriq-laundry') {
      return MOCK_ITEMS.find((i) => i.itemId === 'item-lnd-01' && i.orgId === orgId) || MOCK_ITEMS[0];
    }
    if (divisionId === 'boutique' || divisionId === 'div-fabriq-boutique') {
      return MOCK_ITEMS.find((i) => i.itemId === 'item-btq-01' && i.orgId === orgId) || MOCK_ITEMS[4];
    }
    if (divisionId === 'luxury_store' || divisionId === 'div-fabriq-luxury') {
      return MOCK_ITEMS.find((i) => i.itemId === 'item-lux-01' && i.orgId === orgId) || MOCK_ITEMS[6];
    }
    return MOCK_ITEMS[0];
  }

  /**
   * Create inventory requirements for an order
   */
  public static createRequirementsForOrder(order: OrderWorkflowEntity): OrderInventoryRequirement[] {
    const now = new Date().toISOString();
    const createdRequirements: OrderInventoryRequirement[] = [];

    const items = order.items && order.items.length > 0 ? order.items : [{ garmentId: `garment-${order.orderId}`, itemName: 'Standard Item', category: 'general' }];

    for (let index = 0; index < items.length; index++) {
      const g = items[index];
      const stockItem = this.resolveStockItemForGarment(g, order.divisionId, order.orgId);
      const reqId = `req-${order.orderId}-${index + 1}`;

      // Check if requirement already exists
      if (requirementsStore.has(reqId)) {
        createdRequirements.push(requirementsStore.get(reqId)!);
        continue;
      }

      const req: OrderInventoryRequirement = {
        requirementId: reqId,
        orderId: order.orderId,
        orderItemId: g.garmentId,
        garmentId: g.garmentId,
        itemId: stockItem.itemId,
        sku: stockItem.sku,
        itemName: stockItem.name,
        orgId: order.orgId,
        divisionId: order.divisionId,
        franchiseId: order.franchiseId || null,
        branchId: order.branchId || null,
        requiredQuantity: 1,
        reservedQuantity: 0,
        consumedQuantity: 0,
        releasedQuantity: 0,
        unit: stockItem.unitOfMeasure || 'Units',
        status: 'REQUIRED',
        createdAt: now,
        updatedAt: now,
      };

      requirementsStore.set(reqId, req);
      createdRequirements.push(req);
    }

    LoggerService.info(`Created ${createdRequirements.length} inventory requirements for order [${order.orderId}]`, {
      orderId: order.orderId,
      orgId: order.orgId,
    });

    return createdRequirements;
  }

  /**
   * Reserve stock for order inventory requirements
   */
  public static reserveOrderInventory(
    orderId: string,
    orgId: string,
    actor: { userId: string; userRole: string }
  ): { success: boolean; requirements: OrderInventoryRequirement[]; errors?: string[] } {
    const reqs = this.getRequirementsByOrder(orderId, orgId);
    if (reqs.length === 0) {
      throw new Error(`No inventory requirements found for order '${orderId}' within tenant '${orgId}'`);
    }

    const errors: string[] = [];
    const now = new Date().toISOString();

    for (const req of reqs) {
      // Idempotency check: if already reserved or consumed, skip double reservation
      if (req.status === 'RESERVED' || req.status === 'CONSUMED') {
        continue;
      }

      // Find stock record matching tenant and location
      const stockIndex = MOCK_STOCK.findIndex(
        (s) =>
          s.orgId === orgId &&
          s.itemId === req.itemId &&
          (req.branchId ? s.branchId === req.branchId : true)
      );

      if (stockIndex === -1) {
        req.status = 'SHORT';
        req.updatedAt = now;
        errors.push(`No stock record found for item '${req.itemName}' (${req.itemId}) at branch '${req.branchId}'`);
        continue;
      }

      const stock = MOCK_STOCK[stockIndex];
      const neededQty = req.requiredQuantity - req.reservedQuantity;

      // Safe reservation check against available stock
      if (stock.availableQuantity < neededQty) {
        req.status = 'SHORT';
        req.updatedAt = now;
        errors.push(`Insufficient stock for '${req.itemName}'. Available: ${stock.availableQuantity}, Needed: ${neededQty}`);
        continue;
      }

      // Execute reservation shift
      stock.reservedQuantity += neededQty;
      stock.availableQuantity = Math.max(0, stock.currentQuantity - stock.reservedQuantity);
      stock.updatedAt = now;

      req.reservedQuantity += neededQty;
      req.status = 'RESERVED';
      req.updatedAt = now;

      recordAuditLog(
        orgId,
        actor.userId,
        'INVENTORY_RESERVATION',
        `Reserved ${neededQty} units of '${req.itemName}' for order ${orderId}`
      );
    }

    const allReserved = reqs.every((r) => r.status === 'RESERVED' || r.status === 'CONSUMED');
    return {
      success: allReserved && errors.length === 0,
      requirements: reqs,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Consume stock for order inventory requirements (Creates immutable StockMovementLedger entries)
   */
  public static consumeOrderInventory(
    orderId: string,
    orgId: string,
    actor: { userId: string; userRole: string }
  ): { success: boolean; requirements: OrderInventoryRequirement[]; movements: StockMovementLedger[] } {
    const reqs = this.getRequirementsByOrder(orderId, orgId);
    if (reqs.length === 0) {
      throw new Error(`No inventory requirements found for order '${orderId}' within tenant '${orgId}'`);
    }

    const movements: StockMovementLedger[] = [];
    const now = new Date().toISOString();

    for (const req of reqs) {
      // Idempotency check: if already consumed, skip double consumption
      if (req.status === 'CONSUMED') {
        continue;
      }

      const stockIndex = MOCK_STOCK.findIndex(
        (s) =>
          s.orgId === orgId &&
          s.itemId === req.itemId &&
          (req.branchId ? s.branchId === req.branchId : true)
      );

      if (stockIndex === -1) {
        throw new Error(`Stock record not found for item '${req.itemId}' at branch '${req.branchId}'`);
      }

      const stock = MOCK_STOCK[stockIndex];
      const qtyToDeduct = req.requiredQuantity;

      if (stock.currentQuantity < qtyToDeduct) {
        throw new Error(`Insufficient current stock for deduction. Stock current: ${stock.currentQuantity}, Requested: ${qtyToDeduct}`);
      }

      const prevQty = stock.currentQuantity;
      stock.currentQuantity -= qtyToDeduct;

      if (req.status === 'RESERVED' && req.reservedQuantity > 0) {
        stock.reservedQuantity = Math.max(0, stock.reservedQuantity - req.reservedQuantity);
      }

      stock.availableQuantity = Math.max(0, stock.currentQuantity - stock.reservedQuantity);
      stock.updatedAt = now;

      req.consumedQuantity = req.requiredQuantity;
      req.status = 'CONSUMED';
      req.updatedAt = now;

      // Create immutable StockMovementLedger record
      const mvt: StockMovementLedger = {
        movementId: `mvt_order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orgId,
        divisionId: req.divisionId as AppDivision,
        franchiseId: req.franchiseId || null,
        branchId: req.branchId || null,
        warehouseId: null,
        itemId: req.itemId,
        itemName: req.itemName,
        movementType: 'CONSUMPTION',
        quantity: -qtyToDeduct,
        previousQuantity: prevQty,
        resultingQuantity: stock.currentQuantity,
        unitCost: MOCK_ITEMS.find((i) => i.itemId === req.itemId)?.unitCost || 0,
        reason: `Automated stock deduction for order [${orderId}]`,
        referenceDocId: orderId,
        userId: actor.userId,
        timestamp: now,
      };

      MOCK_STOCK_MOVEMENTS.push(mvt);
      movements.push(mvt);

      recordAuditLog(
        orgId,
        actor.userId,
        'INVENTORY_CONSUMPTION',
        `Deducted ${qtyToDeduct} units of '${req.itemName}' for order [${orderId}]`
      );
    }

    return {
      success: true,
      requirements: reqs,
      movements,
    };
  }

  /**
   * Release reservation or issue compensating reversal for cancelled order
   */
  public static releaseOrderInventory(
    orderId: string,
    orgId: string,
    actor: { userId: string; userRole: string },
    reason: string = 'Order Cancellation Reversal'
  ): { success: boolean; requirements: OrderInventoryRequirement[]; compensatingMovements?: StockMovementLedger[] } {
    const reqs = this.getRequirementsByOrder(orderId, orgId);
    const now = new Date().toISOString();
    const compensatingMovements: StockMovementLedger[] = [];

    for (const req of reqs) {
      if (req.status === 'RELEASED' || req.status === 'CANCELLED') {
        continue;
      }

      const stockIndex = MOCK_STOCK.findIndex(
        (s) =>
          s.orgId === orgId &&
          s.itemId === req.itemId &&
          (req.branchId ? s.branchId === req.branchId : true)
      );

      if (stockIndex !== -1) {
        const stock = MOCK_STOCK[stockIndex];

        if (req.status === 'RESERVED' && req.reservedQuantity > 0) {
          stock.reservedQuantity = Math.max(0, stock.reservedQuantity - req.reservedQuantity);
          stock.availableQuantity = Math.max(0, stock.currentQuantity - stock.reservedQuantity);
          stock.updatedAt = now;
        } else if (req.status === 'CONSUMED' && req.consumedQuantity > 0) {
          // Compensating reversal movement (RETURN)
          const prevQty = stock.currentQuantity;
          stock.currentQuantity += req.consumedQuantity;
          stock.availableQuantity = Math.max(0, stock.currentQuantity - stock.reservedQuantity);
          stock.updatedAt = now;

          const returnMvt: StockMovementLedger = {
            movementId: `mvt_rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            orgId,
            divisionId: req.divisionId as AppDivision,
            franchiseId: req.franchiseId || null,
            branchId: req.branchId || null,
            warehouseId: null,
            itemId: req.itemId,
            itemName: req.itemName,
            movementType: 'RETURN',
            quantity: req.consumedQuantity,
            previousQuantity: prevQty,
            resultingQuantity: stock.currentQuantity,
            unitCost: MOCK_ITEMS.find((i) => i.itemId === req.itemId)?.unitCost || 0,
            reason: `Compensating inventory reversal for cancelled order [${orderId}]: ${reason}`,
            referenceDocId: orderId,
            userId: actor.userId,
            timestamp: now,
          };

          MOCK_STOCK_MOVEMENTS.push(returnMvt);
          compensatingMovements.push(returnMvt);
        }
      }

      req.releasedQuantity = req.requiredQuantity;
      req.status = 'CANCELLED';
      req.updatedAt = now;
    }

    return {
      success: true,
      requirements: reqs,
      compensatingMovements: compensatingMovements.length > 0 ? compensatingMovements : undefined,
    };
  }

  /**
   * Get all requirements for an order within tenant org scope
   */
  public static getRequirementsByOrder(orderId: string, orgId: string): OrderInventoryRequirement[] {
    const results: OrderInventoryRequirement[] = [];
    for (const req of requirementsStore.values()) {
      if (req.orderId === orderId && req.orgId === orgId) {
        results.push(req);
      }
    }
    return results;
  }

  /**
   * List all requirements for tenant / branch
   */
  public static listRequirementsByTenant(orgId: string, branchId?: string): OrderInventoryRequirement[] {
    const results: OrderInventoryRequirement[] = [];
    for (const req of requirementsStore.values()) {
      if (req.orgId === orgId && (!branchId || req.branchId === branchId)) {
        results.push(req);
      }
    }
    return results;
  }

  /**
   * Reset in-memory requirements store (for testing)
   */
  public static clearStore(): void {
    requirementsStore.clear();
  }
}
