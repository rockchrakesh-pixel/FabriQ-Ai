import { LoggerService } from './loggerService';
import { OrderInventoryService } from './orderInventoryService';

export type OrderLifecycleState =
  | 'DRAFT'
  | 'CREATED'
  | 'CONFIRMED'
  | 'PICKUP_SCHEDULED'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'PROCESSING'
  | 'QUALITY_CHECK'
  | 'REWORK'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type GarmentCareStage =
  | 'INTAKE'
  | 'SORTED'
  | 'HYDROCARBON_CLEANING'
  | 'STEAM_FINISHING'
  | 'QUALITY_INSPECTION'
  | 'REWORK_SPOTTING'
  | 'PACKAGING'
  | 'DISPATCH_READY';

export interface GarmentTraceabilityUnit {
  garmentId: string;
  orderId: string;
  customerId: string;
  itemName: string;
  category: string;
  fabricType: string;
  stainDetails?: string;
  currentStage: GarmentCareStage;
  qualityStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'REWORK_REQUIRED';
  inspectionNotes?: string;
  assignedInspectorId?: string;
  updatedAt: string;
}

export interface OrderWorkflowEntity {
  orderId: string;
  orgId: string;
  divisionId: string;
  franchiseId?: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  currentState: OrderLifecycleState;
  items: GarmentTraceabilityUnit[];
  totalAmountInMinorUnits: number;
  taxAmountInMinorUnits: number;
  hsnSacCode: string;
  slaTargetHours: number;
  slaBreached: boolean;
  scheduledPickupTime?: string;
  scheduledDeliveryTime?: string;
  history: Array<{
    previousState: OrderLifecycleState;
    newState: OrderLifecycleState;
    actorId: string;
    actorRole: string;
    reason?: string;
    timestamp: string;
  }>;
  createdTimestamp: string;
  updatedTimestamp: string;
}

const VALID_TRANSITIONS: Record<OrderLifecycleState, OrderLifecycleState[]> = {
  DRAFT: ['CREATED', 'CANCELLED'],
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKUP_SCHEDULED', 'RECEIVED', 'CANCELLED'],
  PICKUP_SCHEDULED: ['RECEIVED', 'CANCELLED'],
  RECEIVED: ['INSPECTED', 'CANCELLED'],
  INSPECTED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['QUALITY_CHECK', 'REWORK'],
  QUALITY_CHECK: ['READY', 'REWORK', 'CANCELLED'],
  REWORK: ['PROCESSING', 'QUALITY_CHECK'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'READY'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export class WorkflowEngineService {
  private static ordersStore: Map<string, OrderWorkflowEntity> = new Map();

  public static createOrder(
    payload: Omit<OrderWorkflowEntity, 'currentState' | 'history' | 'slaBreached' | 'createdTimestamp' | 'updatedTimestamp'>
  ): OrderWorkflowEntity {
    const now = new Date().toISOString();
    const order: OrderWorkflowEntity = {
      ...payload,
      currentState: 'CREATED',
      slaBreached: false,
      history: [
        {
          previousState: 'DRAFT',
          newState: 'CREATED',
          actorId: payload.customerId,
          actorRole: 'customer',
          reason: 'Initial order creation',
          timestamp: now,
        },
      ],
      createdTimestamp: now,
      updatedTimestamp: now,
    };

    this.ordersStore.set(order.orderId, order);

    // Automatically generate order inventory requirements
    try {
      OrderInventoryService.createRequirementsForOrder(order);
    } catch (invErr: any) {
      LoggerService.warn(`Failed to create inventory requirements for order [${order.orderId}]: ${invErr?.message}`);
    }

    LoggerService.info(`Order [${order.orderId}] created in state CREATED`, {
      orderId: order.orderId,
      orgId: order.orgId,
      branchId: order.branchId,
    });

    return order;
  }

  public static transitionState(
    orderId: string,
    newState: OrderLifecycleState,
    actor: { actorId: string; actorRole: string; orgId: string; branchId?: string },
    reason?: string
  ): OrderWorkflowEntity {
    const order = this.ordersStore.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    // Tenant boundary validation
    if (order.orgId !== actor.orgId) {
      throw new Error(`Cross-tenant order access denied: User org '${actor.orgId}' != Order org '${order.orgId}'`);
    }

    const allowedNextStates = VALID_TRANSITIONS[order.currentState] || [];
    if (!allowedNextStates.includes(newState)) {
      throw new Error(`Invalid state transition from '${order.currentState}' to '${newState}'. Allowed: [${allowedNextStates.join(', ')}]`);
    }

    const now = new Date().toISOString();
    const previousState = order.currentState;
    order.currentState = newState;
    order.updatedTimestamp = now;

    // Check SLA breach status
    const createdTime = new Date(order.createdTimestamp).getTime();
    const elapsedHours = (Date.now() - createdTime) / (1000 * 60 * 60);
    if (elapsedHours > order.slaTargetHours && newState !== 'COMPLETED' && newState !== 'CANCELLED') {
      order.slaBreached = true;
    }

    order.history.push({
      previousState,
      newState,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      reason: reason || `Transitioned from ${previousState} to ${newState}`,
      timestamp: now,
    });

    this.ordersStore.set(orderId, order);

    // Automated order-to-inventory state hooks
    try {
      if (newState === 'CONFIRMED') {
        OrderInventoryService.reserveOrderInventory(orderId, order.orgId, { userId: actor.actorId, userRole: actor.actorRole });
      } else if (newState === 'PROCESSING' || newState === 'RECEIVED') {
        OrderInventoryService.consumeOrderInventory(orderId, order.orgId, { userId: actor.actorId, userRole: actor.actorRole });
      } else if (newState === 'CANCELLED') {
        OrderInventoryService.releaseOrderInventory(orderId, order.orgId, { userId: actor.actorId, userRole: actor.actorRole }, reason);
      }
    } catch (invErr: any) {
      LoggerService.warn(`Order state transition [${orderId}] inventory hook notice: ${invErr?.message}`);
    }

    LoggerService.info(`Order [${orderId}] transitioned: ${previousState} -> ${newState}`, {
      orderId,
      orgId: order.orgId,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
    });

    return order;
  }

  public static updateGarmentQuality(
    orderId: string,
    garmentId: string,
    qualityStatus: GarmentTraceabilityUnit['qualityStatus'],
    stage: GarmentCareStage,
    inspectorId: string,
    notes?: string
  ): GarmentTraceabilityUnit {
    const order = this.ordersStore.get(orderId);
    if (!order) {
      throw new Error(`Order '${orderId}' not found`);
    }

    const item = order.items.find((i) => i.garmentId === garmentId);
    if (!item) {
      throw new Error(`Garment '${garmentId}' not found in order '${orderId}'`);
    }

    item.qualityStatus = qualityStatus;
    item.currentStage = stage;
    item.assignedInspectorId = inspectorId;
    if (notes) item.inspectionNotes = notes;
    item.updatedAt = new Date().toISOString();

    if (qualityStatus === 'FAILED' || qualityStatus === 'REWORK_REQUIRED') {
      order.currentState = 'REWORK';
    }

    this.ordersStore.set(orderId, order);
    return item;
  }

  public static getOrder(orderId: string, orgId: string): OrderWorkflowEntity | undefined {
    const order = this.ordersStore.get(orderId);
    if (!order || order.orgId !== orgId) return undefined;
    return order;
  }

  public static listOrdersByTenant(orgId: string, branchId?: string): OrderWorkflowEntity[] {
    const all = Array.from(this.ordersStore.values());
    return all.filter((o) => {
      if (o.orgId !== orgId) return false;
      if (branchId && o.branchId !== branchId) return false;
      return true;
    });
  }

  public static clearStore(): void {
    this.ordersStore.clear();
  }
}
