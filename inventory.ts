import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { requireIdempotency } from '../middleware/idempotencyMiddleware';
import { OrderInventoryService } from '../services/orderInventoryService';
import { WorkflowEngineService } from '../services/workflowEngine';
import {
  AppDivision,
  InventoryItem,
  WarehouseEntity,
  InventoryStock,
  StockMovementLedger,
  StockMovementType,
  SupplierEntity,
  ReorderRule,
} from '../../src/types';

export const inventoryRouter = Router();

const inventoryLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 40 });

// Helper to write immutable audit log
const AUDIT_LOGS: Array<{ id: string; orgId: string; userId: string; action: string; details: string; timestamp: string }> = [];

export function recordAuditLog(orgId: string, userId: string, action: string, details: string) {
  const entry = {
    id: `audit_inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orgId,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  AUDIT_LOGS.push(entry);
  console.log(`[Enterprise Inventory Audit Log] ${action}: ${details} (User: ${userId})`);
  return entry;
}

export function getInventoryAuditLogs() {
  return AUDIT_LOGS;
}

// ----------------------------------------------------------------------
// Mock In-Memory Enterprise Storage
// ----------------------------------------------------------------------

const MOCK_WAREHOUSES: WarehouseEntity[] = [
  {
    warehouseId: 'wh-central-hyd',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    name: 'FabriQ Central Solvents & Garment Depot (Hyderabad)',
    city: 'Hyderabad',
    address: 'Plot 42, Cherlapally Industrial Park, Hyderabad 500051',
    isCentral: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    warehouseId: 'wh-boutique-hub',
    orgId: 'org-fabriq-global',
    divisionId: 'boutique',
    name: 'FabriQ Atelier Fabric & Accessories Central Warehouse',
    city: 'Secunderabad',
    address: '12 Industrial Area, Bowenpally, Secunderabad 500011',
    isCentral: true,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    warehouseId: 'wh-luxury-vault',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    name: 'FabriQ Luxury Retail Central Vault',
    city: 'Bengaluru',
    address: 'Indiranagar 100ft Road, Bengaluru 560038',
    isCentral: true,
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

export const MOCK_ITEMS: InventoryItem[] = [
  // FabriQ AI (Laundry Consumables)
  {
    itemId: 'item-lnd-01',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    sku: 'LND-SOLV-GRE-01',
    name: 'GreenEarth® Hydrocarbon Solvent',
    category: 'laundry_chemical',
    unitOfMeasure: 'Liters',
    unitCost: 850,
    brand: 'GreenEarth Solutions',
    description: 'Eco-friendly non-toxic dry cleaning hydrocarbon fluid',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    itemId: 'item-lnd-02',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    sku: 'LND-PKG-HNG-500',
    name: 'FabriQ Gold Monogram Velvet Hangers',
    category: 'packaging_supplies',
    unitOfMeasure: 'Pieces',
    unitCost: 120,
    brand: 'FabriQ Enterprise',
    description: 'Custom luxury weighted velvet suit & gown hangers',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    itemId: 'item-lnd-03',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    sku: 'LND-PKG-COV-200',
    name: 'Breathable Silk & Leather Garment Covers',
    category: 'packaging_supplies',
    unitOfMeasure: 'Covers',
    unitCost: 95,
    brand: 'FabriQ Atelier',
    description: 'Dust-proof zippered garment travel protection covers',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    itemId: 'item-lnd-04',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    sku: 'LND-CHEM-DET-50',
    name: 'Silk & Cashmere Enzyme Detergent Booster',
    category: 'laundry_chemical',
    unitOfMeasure: 'Liters',
    unitCost: 1400,
    brand: 'Seitz Germany',
    description: 'Ultra-delicate wool & silk protein-protecting detergent',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },

  // FabriQ Boutique (Tailoring Materials & Fabrics)
  {
    itemId: 'item-btq-01',
    orgId: 'org-fabriq-global',
    divisionId: 'boutique',
    sku: 'BTQ-FAB-SILK-ITA',
    name: 'Italian Pure Mulberry Silk (Cream White)',
    category: 'boutique_fabric',
    unitOfMeasure: 'Meters',
    unitCost: 3200,
    brand: 'Taroni Como',
    color: 'Cream White',
    description: '100% pure Mulberry silk fabric for bespoke bridal wear',
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    itemId: 'item-btq-02',
    orgId: 'org-fabriq-global',
    divisionId: 'boutique',
    sku: 'BTQ-HDW-ZAR-GLD',
    name: 'Zardozi Metallic Gold Embroidery Thread',
    category: 'boutique_hardware',
    unitOfMeasure: 'Spools',
    unitCost: 650,
    brand: 'DMC Metallic',
    color: 'Royal Gold',
    description: '24K gold foil wrapped embroidery thread for couture detailing',
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },

  // FabriQ Luxury Store (Finished Goods & Retail Stock)
  {
    itemId: 'item-lux-01',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    sku: 'LUX-BAG-MONO-BRN',
    name: 'Monogram Canvas Atelier Tote Bag',
    category: 'luxury_accessory',
    unitOfMeasure: 'Pieces',
    unitCost: 18500,
    sellingPrice: 42000,
    brand: 'FabriQ Maison',
    color: 'Monogram Brown',
    size: 'Large',
    styleCode: 'M-TOTE-2026',
    description: 'Hand-stitched coated canvas tote with Italian calfskin trim',
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    itemId: 'item-lux-02',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    sku: 'LUX-COAT-CASH-NVY',
    name: 'Couture Cashmere Double-Breasted Trench Coat',
    category: 'luxury_garment',
    unitOfMeasure: 'Pieces',
    unitCost: 35000,
    sellingPrice: 88000,
    brand: 'FabriQ Atelier',
    color: 'Navy Blue',
    size: 'Medium (EU 48)',
    styleCode: 'C-TRENCH-NAV',
    description: '100% Mongolian Cashmere lined with silk jacquard',
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

export const MOCK_STOCK: InventoryStock[] = [
  // Central Warehouse Stock (Corporate)
  {
    stockId: 'stk-wh-hyd-item-lnd-01',
    itemId: 'item-lnd-01',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: null,
    branchId: null,
    warehouseId: 'wh-central-hyd',
    locationType: 'warehouse',
    locationName: 'FabriQ Central Solvents Depot (HYD)',
    currentQuantity: 450,
    reservedQuantity: 20,
    availableQuantity: 430,
    minStockLevel: 100,
    reorderLevel: 150,
    targetStockLevel: 600,
    reorderQuantity: 300,
    preferredSupplierId: 'sup-greenearth',
    lastRestockedAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    stockId: 'stk-wh-btq-item-btq-01',
    itemId: 'item-btq-01',
    orgId: 'org-fabriq-global',
    divisionId: 'boutique',
    franchiseId: null,
    branchId: null,
    warehouseId: 'wh-boutique-hub',
    locationType: 'warehouse',
    locationName: 'FabriQ Atelier Fabric Warehouse (SEC)',
    currentQuantity: 120,
    reservedQuantity: 15,
    availableQuantity: 105,
    minStockLevel: 30,
    reorderLevel: 50,
    targetStockLevel: 200,
    reorderQuantity: 100,
    preferredSupplierId: 'sup-taroni-italy',
    lastRestockedAt: '2026-08-05T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },

  // Franchise Branch Stock (Bowenpally - Franchise 'fr-hyd-01')
  {
    stockId: 'stk-b-bowenpally-item-lnd-01',
    itemId: 'item-lnd-01',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    locationType: 'branch',
    locationName: 'Bowenpally Care Atelier',
    currentQuantity: 12, // LOW STOCK TRIGGER ALERT (< reorderLevel 25)
    reservedQuantity: 2,
    availableQuantity: 10,
    minStockLevel: 15,
    reorderLevel: 25,
    targetStockLevel: 50,
    reorderQuantity: 30,
    preferredSupplierId: 'sup-greenearth',
    lastRestockedAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    stockId: 'stk-b-bowenpally-item-lnd-02',
    itemId: 'item-lnd-02',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    locationType: 'branch',
    locationName: 'Bowenpally Care Atelier',
    currentQuantity: 320,
    reservedQuantity: 10,
    availableQuantity: 310,
    minStockLevel: 100,
    reorderLevel: 150,
    targetStockLevel: 500,
    reorderQuantity: 200,
    preferredSupplierId: 'sup-fabriq-mfg',
    lastRestockedAt: '2026-08-12T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    stockId: 'stk-b-bowenpally-item-lux-01',
    itemId: 'item-lux-01',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    locationType: 'branch',
    locationName: 'Bowenpally Care Atelier',
    currentQuantity: 4,
    reservedQuantity: 1,
    availableQuantity: 3,
    minStockLevel: 2,
    reorderLevel: 3,
    targetStockLevel: 10,
    reorderQuantity: 5,
    preferredSupplierId: 'sup-fabriq-maison',
    lastRestockedAt: '2026-08-08T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },

  // Corporate Flagship Branch Stock (Mayfair London - Corporate Owned)
  {
    stockId: 'stk-b-mayfair-item-lux-02',
    itemId: 'item-lux-02',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    franchiseId: null, // Corporate owned branch
    branchId: 'b-lon-mayfair',
    warehouseId: null,
    locationType: 'branch',
    locationName: 'Mayfair Flagship Atelier (London)',
    currentQuantity: 8,
    reservedQuantity: 2,
    availableQuantity: 6,
    minStockLevel: 3,
    reorderLevel: 5,
    targetStockLevel: 15,
    reorderQuantity: 10,
    preferredSupplierId: 'sup-fabriq-maison',
    lastRestockedAt: '2026-08-14T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

export const MOCK_STOCK_MOVEMENTS: StockMovementLedger[] = [
  {
    movementId: 'mvt-1001',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: null,
    branchId: null,
    warehouseId: 'wh-central-hyd',
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    movementType: 'OPENING_BALANCE',
    quantity: 500,
    previousQuantity: 0,
    resultingQuantity: 500,
    unitCost: 850,
    reason: 'Initial central warehouse stock audit',
    userId: 'usr-admin-01',
    timestamp: '2026-08-01T08:00:00.000Z',
  },
  {
    movementId: 'mvt-1002',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    movementType: 'TRANSFER_IN',
    quantity: 30,
    previousQuantity: 0,
    resultingQuantity: 30,
    unitCost: 850,
    sourceLocationId: 'wh-central-hyd',
    destinationLocationId: 'b-hyd-bowenpally',
    reason: 'Inter-facility inventory transfer from central depot',
    referenceDocId: 'trf-2026-0801',
    userId: 'usr-admin-01',
    timestamp: '2026-08-01T10:30:00.000Z',
  },
  {
    movementId: 'mvt-1003',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    movementType: 'CONSUMPTION',
    quantity: 18,
    previousQuantity: 30,
    resultingQuantity: 12,
    unitCost: 850,
    reason: 'Batch cleaning run for couture silk order #ORD-9821',
    referenceDocId: 'ORD-9821',
    userId: 'usr-tech-04',
    timestamp: '2026-08-14T16:00:00.000Z',
  },
];

const MOCK_SUPPLIERS: SupplierEntity[] = [
  {
    supplierId: 'sup-greenearth',
    orgId: 'org-fabriq-global',
    name: 'GreenEarth® Cleaning Systems International',
    contactPerson: 'Marcus Vance',
    email: 'orders@greenearthcleaning.com',
    phone: '+1 800 555 4733',
    city: 'Kansas City, USA',
    categories: ['laundry_chemical'],
    leadTimeDays: 7,
    rating: 4.9,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    supplierId: 'sup-taroni-italy',
    orgId: 'org-fabriq-global',
    name: 'Taroni S.p.A. Silk Weavers',
    contactPerson: 'Elena Rossi',
    email: 'export@taroni.it',
    phone: '+39 031 223344',
    city: 'Como, Italy',
    categories: ['boutique_fabric'],
    leadTimeDays: 14,
    rating: 5.0,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    supplierId: 'sup-fabriq-maison',
    orgId: 'org-fabriq-global',
    name: 'FabriQ Maison Craftsmanship Studio',
    contactPerson: 'Pierre Dupont',
    email: 'atelier@fabriq-maison.com',
    phone: '+33 1 42 68 00 00',
    city: 'Paris, France',
    categories: ['luxury_accessory', 'luxury_garment'],
    leadTimeDays: 10,
    rating: 4.95,
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

const MOCK_REORDER_RULES: ReorderRule[] = [
  {
    ruleId: 'rule-b-bowenpally-lnd-01',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    itemId: 'item-lnd-01',
    locationId: 'b-hyd-bowenpally',
    locationType: 'branch',
    minStockLevel: 15,
    reorderLevel: 25,
    reorderQuantity: 30,
    preferredSupplierId: 'sup-greenearth',
    autoTriggerEnabled: true,
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

// ----------------------------------------------------------------------
// Express API Routes for Enterprise Inventory
// ----------------------------------------------------------------------

// 1. GET /api/inventory/items — List Master Catalog Items
inventoryRouter.get(
  '/inventory/items',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'inventory',
    'store_staff',
    'mis',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const { divisionId, category } = req.query;

      let items = MOCK_ITEMS.filter((item) => item.orgId === orgId);

      if (divisionId) {
        items = items.filter((item) => item.divisionId === (divisionId as AppDivision));
      }
      if (category) {
        items = items.filter((item) => item.category === category);
      }

      res.json({ items, count: items.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve catalog items', details: err?.message });
    }
  }
);

// 2. GET /api/inventory/warehouses — List Warehouses
inventoryRouter.get(
  '/inventory/warehouses',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'inventory',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const warehouses = MOCK_WAREHOUSES.filter((wh) => wh.orgId === orgId);
      res.json({ warehouses, count: warehouses.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve warehouses', details: err?.message });
    }
  }
);

// 3. GET /api/inventory/stock — Query Stock Balances Across Warehouses & Branches
inventoryRouter.get(
  '/inventory/stock',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'inventory',
    'store_staff',
    'mis',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;
      const { divisionId, branchId, warehouseId, locationType } = req.query;

      let stock = MOCK_STOCK.filter((s) => s.orgId === orgId);

      // Franchise isolation rule: Franchise owners & regional managers can only query stock assigned to their franchise
      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        stock = stock.filter((s) => s.franchiseId === franchiseId);
      }

      if (divisionId) {
        stock = stock.filter((s) => s.divisionId === (divisionId as AppDivision));
      }
      if (branchId) {
        stock = stock.filter((s) => s.branchId === branchId);
      }
      if (warehouseId) {
        stock = stock.filter((s) => s.warehouseId === warehouseId);
      }
      if (locationType) {
        stock = stock.filter((s) => s.locationType === locationType);
      }

      // Join item details for UI presentation
      const enrichedStock = stock.map((stk) => {
        const item = MOCK_ITEMS.find((i) => i.itemId === stk.itemId);
        return {
          ...stk,
          itemName: item?.name || 'Unknown Item',
          sku: item?.sku || 'UNKNOWN',
          unitOfMeasure: item?.unitOfMeasure || 'Units',
          unitCost: item?.unitCost || 0,
          category: item?.category || 'general_consumable',
          isLowStock: stk.currentQuantity <= stk.reorderLevel,
          isCritical: stk.currentQuantity <= stk.minStockLevel,
        };
      });

      res.json({ stock: enrichedStock, count: enrichedStock.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve stock balances', details: err?.message });
    }
  }
);

// 4. POST /api/inventory/stock/movement — Record Auditable Stock Movement (Receipt, Consumption, Damage, Sale, Return, Adjustment)
inventoryRouter.post(
  '/inventory/stock/movement',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'store_manager', 'inventory'),
  validateTenantScope,
  requireIdempotency('RECORD_STOCK_MOVEMENT'),
  async (req: Request, res: Response) => {

    try {
      const { orgId, uid, role, franchiseId: userFranchiseId } = req.user!;
      const {
        itemId,
        branchId,
        warehouseId,
        movementType,
        quantity,
        reason,
        referenceDocId,
      } = req.body as {
        itemId: string;
        branchId?: string;
        warehouseId?: string;
        movementType: StockMovementType;
        quantity: number;
        reason: string;
        referenceDocId?: string;
      };

      if (!itemId || !movementType || typeof quantity !== 'number' || quantity <= 0 || !reason) {
        res.status(400).json({
          error: 'Invalid input: itemId, movementType, positive quantity, and reason are required',
        });
        return;
      }

      // Check item exists
      const item = MOCK_ITEMS.find((i) => i.itemId === itemId && i.orgId === orgId);
      if (!item) {
        res.status(404).json({ error: `Item '${itemId}' not found in organization` });
        return;
      }

      // Locate stock record
      let stockIndex = MOCK_STOCK.findIndex(
        (s) =>
          s.orgId === orgId &&
          s.itemId === itemId &&
          (branchId ? s.branchId === branchId : s.warehouseId === warehouseId)
      );

      // Franchise scope validation
      if (['franchise_owner'].includes(role) && userFranchiseId) {
        if (stockIndex !== -1 && MOCK_STOCK[stockIndex].franchiseId !== userFranchiseId) {
          res.status(403).json({ error: 'Forbidden: Cannot alter stock outside your franchise scope' });
          return;
        }
      }

      let stock = stockIndex !== -1 ? MOCK_STOCK[stockIndex] : null;

      // Deduct operations: CONSUMPTION, DAMAGE, SALE, TRANSFER_OUT
      const isDeduction = ['CONSUMPTION', 'DAMAGE', 'SALE', 'TRANSFER_OUT'].includes(movementType);
      const isAddition = ['RECEIPT', 'RETURN', 'TRANSFER_IN', 'OPENING_BALANCE'].includes(movementType);

      const previousQty = stock ? stock.currentQuantity : 0;
      let deltaQty = isDeduction ? -Math.abs(quantity) : Math.abs(quantity);

      if (movementType === 'ADJUSTMENT') {
        // For adjustment, quantity can be positive or negative shift
        deltaQty = quantity;
      }

      const resultingQty = previousQty + deltaQty;

      // FINANCIAL & INVENTORY INTEGRITY: Prevent negative stock
      if (resultingQty < 0) {
        res.status(400).json({
          error: `Insufficient stock for operation. Available: ${previousQty}, Requested deduction: ${Math.abs(deltaQty)}`,
        });
        return;
      }

      const now = new Date().toISOString();

      if (!stock) {
        // Create new stock entry if addition
        const newStock: InventoryStock = {
          stockId: `stk_${branchId || warehouseId}_${itemId}`,
          itemId,
          orgId,
          divisionId: item.divisionId,
          franchiseId: branchId ? userFranchiseId || null : null,
          branchId: branchId || null,
          warehouseId: warehouseId || null,
          locationType: branchId ? 'branch' : 'warehouse',
          locationName: branchId ? `Branch ${branchId}` : `Warehouse ${warehouseId}`,
          currentQuantity: resultingQty,
          reservedQuantity: 0,
          availableQuantity: resultingQty,
          minStockLevel: 10,
          reorderLevel: 20,
          targetStockLevel: 100,
          reorderQuantity: 50,
          lastRestockedAt: isAddition ? now : 'N/A',
          updatedAt: now,
        };
        MOCK_STOCK.push(newStock);
        stock = newStock;
      } else {
        stock.currentQuantity = resultingQty;
        stock.availableQuantity = Math.max(0, resultingQty - stock.reservedQuantity);
        if (isAddition) stock.lastRestockedAt = now;
        stock.updatedAt = now;
      }

      // Record Auditable Stock Movement Ledger Entry
      const movementId = `mvt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const movementEntry: StockMovementLedger = {
        movementId,
        orgId,
        divisionId: item.divisionId,
        franchiseId: stock.franchiseId,
        branchId: stock.branchId,
        warehouseId: stock.warehouseId,
        itemId,
        itemName: item.name,
        movementType,
        quantity: deltaQty,
        previousQuantity: previousQty,
        resultingQuantity: resultingQty,
        unitCost: item.unitCost,
        reason,
        referenceDocId: referenceDocId || undefined,
        userId: uid,
        timestamp: now,
      };

      MOCK_STOCK_MOVEMENTS.push(movementEntry);

      recordAuditLog(
        orgId,
        uid,
        `STOCK_${movementType}`,
        `Recorded ${movementType} of ${deltaQty} units for '${item.name}' at location (${stock.locationName}). Resulting Qty: ${resultingQty}`
      );

      res.status(201).json({
        success: true,
        movement: movementEntry,
        stock: {
          ...stock,
          isLowStock: stock.currentQuantity <= stock.reorderLevel,
          isCritical: stock.currentQuantity <= stock.minStockLevel,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to record stock movement', details: err?.message });
    }
  }
);

// 5. POST /api/inventory/transfer — Controlled Inter-Facility Inventory Transfer
inventoryRouter.post(
  '/inventory/transfer',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'store_manager', 'inventory'),
  validateTenantScope,
  requireIdempotency('RECORD_STOCK_TRANSFER'),
  async (req: Request, res: Response) => {

    try {
      const { orgId, uid, role, franchiseId: userFranchiseId } = req.user!;
      const {
        itemId,
        sourceLocationId, // branchId or warehouseId
        sourceType, // 'warehouse' | 'branch'
        destinationLocationId,
        destinationType, // 'warehouse' | 'branch'
        quantity,
        reason,
      } = req.body as {
        itemId: string;
        sourceLocationId: string;
        sourceType: 'warehouse' | 'branch';
        destinationLocationId: string;
        destinationType: 'warehouse' | 'branch';
        quantity: number;
        reason: string;
      };

      if (!itemId || !sourceLocationId || !destinationLocationId || !quantity || quantity <= 0 || !reason) {
        res.status(400).json({ error: 'itemId, sourceLocationId, destinationLocationId, positive quantity, and reason are required' });
        return;
      }

      if (sourceLocationId === destinationLocationId) {
        res.status(400).json({ error: 'Source and destination locations must be distinct' });
        return;
      }

      // Check item
      const item = MOCK_ITEMS.find((i) => i.itemId === itemId && i.orgId === orgId);
      if (!item) {
        res.status(404).json({ error: `Item '${itemId}' not found in organization` });
        return;
      }

      // Find Source Stock
      const sourceStockIndex = MOCK_STOCK.findIndex(
        (s) =>
          s.orgId === orgId &&
          s.itemId === itemId &&
          (sourceType === 'branch' ? s.branchId === sourceLocationId : s.warehouseId === sourceLocationId)
      );

      if (sourceStockIndex === -1) {
        res.status(404).json({ error: `No stock record found for item '${item.name}' at source location` });
        return;
      }

      const sourceStock = MOCK_STOCK[sourceStockIndex];

      // Franchise Scope Check: Franchise owners cannot transfer stock out of non-franchise stores
      if (['franchise_owner'].includes(role) && userFranchiseId) {
        if (sourceStock.franchiseId !== userFranchiseId) {
          res.status(403).json({ error: 'Forbidden: Cannot transfer stock out of a facility outside your franchise scope' });
          return;
        }
      }

      // Quantity Check
      if (sourceStock.availableQuantity < quantity) {
        res.status(400).json({
          error: `Insufficient available stock at source. Available: ${sourceStock.availableQuantity}, Requested transfer: ${quantity}`,
        });
        return;
      }

      // Find or Create Destination Stock
      let destStockIndex = MOCK_STOCK.findIndex(
        (s) =>
          s.orgId === orgId &&
          s.itemId === itemId &&
          (destinationType === 'branch' ? s.branchId === destinationLocationId : s.warehouseId === destinationLocationId)
      );

      const now = new Date().toISOString();
      let destStock: InventoryStock;

      if (destStockIndex === -1) {
        destStock = {
          stockId: `stk_${destinationLocationId}_${itemId}`,
          itemId,
          orgId,
          divisionId: item.divisionId,
          franchiseId: destinationType === 'branch' ? (userFranchiseId || null) : null,
          branchId: destinationType === 'branch' ? destinationLocationId : null,
          warehouseId: destinationType === 'warehouse' ? destinationLocationId : null,
          locationType: destinationType,
          locationName: `${destinationType.toUpperCase()} ${destinationLocationId}`,
          currentQuantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          minStockLevel: 10,
          reorderLevel: 20,
          targetStockLevel: 100,
          reorderQuantity: 50,
          lastRestockedAt: now,
          updatedAt: now,
        };
        MOCK_STOCK.push(destStock);
      } else {
        destStock = MOCK_STOCK[destStockIndex];
      }

      // Execute Atomic Ledger Movement for Transfer Out & Transfer In
      const srcPrevQty = sourceStock.currentQuantity;
      sourceStock.currentQuantity -= quantity;
      sourceStock.availableQuantity = Math.max(0, sourceStock.currentQuantity - sourceStock.reservedQuantity);
      sourceStock.updatedAt = now;

      const destPrevQty = destStock.currentQuantity;
      destStock.currentQuantity += quantity;
      destStock.availableQuantity = Math.max(0, destStock.currentQuantity - destStock.reservedQuantity);
      destStock.lastRestockedAt = now;
      destStock.updatedAt = now;

      const transferDocId = `trf_${Date.now()}`;

      // Source Ledger Entry (TRANSFER_OUT)
      const outMovement: StockMovementLedger = {
        movementId: `mvt_out_${Date.now()}`,
        orgId,
        divisionId: item.divisionId,
        franchiseId: sourceStock.franchiseId,
        branchId: sourceStock.branchId,
        warehouseId: sourceStock.warehouseId,
        itemId,
        itemName: item.name,
        movementType: 'TRANSFER_OUT',
        quantity: -quantity,
        previousQuantity: srcPrevQty,
        resultingQuantity: sourceStock.currentQuantity,
        unitCost: item.unitCost,
        sourceLocationId,
        destinationLocationId,
        reason: `Transfer to ${destStock.locationName}: ${reason}`,
        referenceDocId: transferDocId,
        userId: uid,
        timestamp: now,
      };

      // Destination Ledger Entry (TRANSFER_IN)
      const inMovement: StockMovementLedger = {
        movementId: `mvt_in_${Date.now()}`,
        orgId,
        divisionId: item.divisionId,
        franchiseId: destStock.franchiseId,
        branchId: destStock.branchId,
        warehouseId: destStock.warehouseId,
        itemId,
        itemName: item.name,
        movementType: 'TRANSFER_IN',
        quantity: quantity,
        previousQuantity: destPrevQty,
        resultingQuantity: destStock.currentQuantity,
        unitCost: item.unitCost,
        sourceLocationId,
        destinationLocationId,
        reason: `Transfer from ${sourceStock.locationName}: ${reason}`,
        referenceDocId: transferDocId,
        userId: uid,
        timestamp: now,
      };

      MOCK_STOCK_MOVEMENTS.push(outMovement, inMovement);

      recordAuditLog(
        orgId,
        uid,
        'STOCK_TRANSFER',
        `Transferred ${quantity} units of '${item.name}' from ${sourceStock.locationName} to ${destStock.locationName} (Ref: ${transferDocId})`
      );

      res.json({
        success: true,
        transferId: transferDocId,
        sourceStock,
        destStock,
        outMovement,
        inMovement,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to process inventory transfer', details: err?.message });
    }
  }
);

// 6. GET /api/inventory/movements — Query Auditable Stock Movement Ledger History
inventoryRouter.get(
  '/inventory/movements',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'inventory',
    'mis',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;
      const { divisionId, itemId, movementType, limit = '50' } = req.query;

      let movements = MOCK_STOCK_MOVEMENTS.filter((m) => m.orgId === orgId);

      // Franchise Scope Check
      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        movements = movements.filter((m) => m.franchiseId === franchiseId);
      }

      if (divisionId) {
        movements = movements.filter((m) => m.divisionId === (divisionId as AppDivision));
      }
      if (itemId) {
        movements = movements.filter((m) => m.itemId === itemId);
      }
      if (movementType) {
        movements = movements.filter((m) => m.movementType === movementType);
      }

      // Sort reverse chronological
      movements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const maxLimit = Math.min(100, parseInt(limit as string, 10) || 50);
      const sliced = movements.slice(0, maxLimit);

      res.json({ movements: sliced, count: sliced.length, total: movements.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve stock movement ledger', details: err?.message });
    }
  }
);

// 7. GET /api/inventory/reorder-alerts — Query Reorder Rule Triggers & Low Stock Alerts
inventoryRouter.get(
  '/inventory/reorder-alerts',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'inventory',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;
      const { divisionId } = req.query;

      let stock = MOCK_STOCK.filter((s) => s.orgId === orgId);

      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        stock = stock.filter((s) => s.franchiseId === franchiseId);
      }

      if (divisionId) {
        stock = stock.filter((s) => s.divisionId === (divisionId as AppDivision));
      }

      // Filter stock where current quantity <= reorder level
      const lowStockAlerts = stock
        .filter((s) => s.currentQuantity <= s.reorderLevel)
        .map((s) => {
          const item = MOCK_ITEMS.find((i) => i.itemId === s.itemId);
          const supplier = MOCK_SUPPLIERS.find((sup) => sup.supplierId === s.preferredSupplierId);
          return {
            stockId: s.stockId,
            itemId: s.itemId,
            itemName: item?.name || 'Unknown Item',
            sku: item?.sku || 'UNKNOWN',
            divisionId: s.divisionId,
            locationName: s.locationName,
            currentQuantity: s.currentQuantity,
            reorderLevel: s.reorderLevel,
            minStockLevel: s.minStockLevel,
            targetStockLevel: s.targetStockLevel,
            suggestedReorderQuantity: Math.max(s.reorderQuantity, s.targetStockLevel - s.currentQuantity),
            preferredSupplier: supplier ? supplier.name : 'Central Warehouse',
            supplierLeadTimeDays: supplier?.leadTimeDays || 3,
            severity: s.currentQuantity <= s.minStockLevel ? 'CRITICAL_OUT_OF_STOCK' : 'REORDER_THRESHOLD_TRIGGERED',
          };
        });

      res.json({ alerts: lowStockAlerts, count: lowStockAlerts.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve reorder alerts', details: err?.message });
    }
  }
);

// 8. GET /api/inventory/suppliers — List Master Supplier Foundation Records
inventoryRouter.get(
  '/inventory/suppliers',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'inventory',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const suppliers = MOCK_SUPPLIERS.filter((sup) => sup.orgId === orgId);
      res.json({ suppliers, count: suppliers.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve supplier records', details: err?.message });
    }
  }
);

// 9. POST /api/inventory/reorder-rules — Create/Update Reorder Trigger Architecture Rules
inventoryRouter.post(
  '/inventory/reorder-rules',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'inventory'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid } = req.user!;
      const {
        itemId,
        locationId,
        locationType,
        minStockLevel,
        reorderLevel,
        reorderQuantity,
        preferredSupplierId,
        autoTriggerEnabled = true,
      } = req.body;

      if (!itemId || !locationId || typeof minStockLevel !== 'number' || typeof reorderLevel !== 'number') {
        res.status(400).json({ error: 'itemId, locationId, minStockLevel, and reorderLevel are required' });
        return;
      }

      const item = MOCK_ITEMS.find((i) => i.itemId === itemId && i.orgId === orgId);
      if (!item) {
        res.status(404).json({ error: `Item '${itemId}' not found` });
        return;
      }

      // Update matching Stock record reorder parameters
      const stock = MOCK_STOCK.find(
        (s) =>
          s.orgId === orgId &&
          s.itemId === itemId &&
          (locationType === 'branch' ? s.branchId === locationId : s.warehouseId === locationId)
      );

      if (stock) {
        stock.minStockLevel = minStockLevel;
        stock.reorderLevel = reorderLevel;
        if (reorderQuantity) stock.reorderQuantity = reorderQuantity;
        if (preferredSupplierId) stock.preferredSupplierId = preferredSupplierId;
        stock.updatedAt = new Date().toISOString();
      }

      const ruleId = `rule_${locationId}_${itemId}`;
      const existingRuleIndex = MOCK_REORDER_RULES.findIndex((r) => r.ruleId === ruleId);

      const ruleData: ReorderRule = {
        ruleId,
        orgId,
        divisionId: item.divisionId,
        itemId,
        locationId,
        locationType: locationType || 'branch',
        minStockLevel,
        reorderLevel,
        reorderQuantity: reorderQuantity || 50,
        preferredSupplierId: preferredSupplierId || undefined,
        autoTriggerEnabled,
        updatedAt: new Date().toISOString(),
      };

      if (existingRuleIndex !== -1) {
        MOCK_REORDER_RULES[existingRuleIndex] = ruleData;
      } else {
        MOCK_REORDER_RULES.push(ruleData);
      }

      recordAuditLog(
        orgId,
        uid,
        'REORDER_RULE_UPDATED',
        `Configured reorder rule for '${item.name}' at location '${locationId}'. Min: ${minStockLevel}, Reorder: ${reorderLevel}`
      );

      res.status(200).json({ success: true, rule: ruleData });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to configure reorder rule', details: err?.message });
    }
  }
);

// ----------------------------------------------------------------------
// Phase 2H-2 Order-to-Inventory Integration REST APIs
// ----------------------------------------------------------------------

const INVENTORY_MUTATION_ROLES = [
  'super_admin',
  'ceo',
  'owner',
  'franchise_owner',
  'regional_manager',
  'area_manager',
  'store_manager',
  'inventory',
  'store_staff',
];

// 10. POST /api/orders/:orderId/inventory/reserve — Reserve Stock for Order Requirements
inventoryRouter.post(
  '/orders/:orderId/inventory/reserve',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(...INVENTORY_MUTATION_ROLES),
  validateTenantScope,
  requireIdempotency('RESERVE_ORDER_INVENTORY'),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { orgId, uid, role } = req.user!;

      const order = WorkflowEngineService.getOrder(orderId, orgId);
      if (!order) {
        res.status(404).json({ error: `Order '${orderId}' not found within tenant scope` });
        return;
      }

      // Ensure requirements exist
      let reqs = OrderInventoryService.getRequirementsByOrder(orderId, orgId);
      if (reqs.length === 0) {
        reqs = OrderInventoryService.createRequirementsForOrder(order);
      }

      const reserveResult = OrderInventoryService.reserveOrderInventory(orderId, orgId, { userId: uid, userRole: role });

      if (!reserveResult.success) {
        res.status(400).json({
          error: 'Inventory reservation failed or stock shortage encountered',
          details: reserveResult.errors,
          requirements: reserveResult.requirements,
        });
        return;
      }

      res.status(200).json({
        message: `Inventory successfully reserved for order '${orderId}'`,
        requirements: reserveResult.requirements,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to reserve order inventory', details: err?.message });
    }
  }
);

// 11. POST /api/orders/:orderId/inventory/consume — Consume Stock & Record Auditable Ledger Movements
inventoryRouter.post(
  '/orders/:orderId/inventory/consume',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(...INVENTORY_MUTATION_ROLES),
  validateTenantScope,
  requireIdempotency('CONSUME_ORDER_INVENTORY'),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { orgId, uid, role } = req.user!;

      const order = WorkflowEngineService.getOrder(orderId, orgId);
      if (!order) {
        res.status(404).json({ error: `Order '${orderId}' not found within tenant scope` });
        return;
      }

      const consumeResult = OrderInventoryService.consumeOrderInventory(orderId, orgId, { userId: uid, userRole: role });

      res.status(200).json({
        message: `Inventory successfully consumed for order '${orderId}'`,
        requirements: consumeResult.requirements,
        movements: consumeResult.movements,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to consume order inventory', details: err?.message });
    }
  }
);

// 12. POST /api/orders/:orderId/inventory/release — Release Reservation or Issue Reversal
inventoryRouter.post(
  '/orders/:orderId/inventory/release',
  inventoryLimiter,
  authenticateFirebaseToken,
  requireRoles(...INVENTORY_MUTATION_ROLES),
  validateTenantScope,
  requireIdempotency('RELEASE_ORDER_INVENTORY'),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { reason = 'Order Cancellation Reversal' } = req.body;
      const { orgId, uid, role } = req.user!;

      const releaseResult = OrderInventoryService.releaseOrderInventory(orderId, orgId, { userId: uid, userRole: role }, reason);

      res.status(200).json({
        message: `Inventory reservation/consumption released/reversed for order '${orderId}'`,
        requirements: releaseResult.requirements,
        compensatingMovements: releaseResult.compensatingMovements,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to release order inventory', details: err?.message });
    }
  }
);

// 13. GET /api/orders/:orderId/inventory — Query Requirements for an Order
const getOrderInventoryHandler = (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { orgId } = req.user!;

    const reqs = OrderInventoryService.getRequirementsByOrder(orderId, orgId);
    res.status(200).json({ orderId, requirements: reqs, count: reqs.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve order inventory requirements', details: err?.message });
  }
};

inventoryRouter.get('/orders/:orderId/inventory', inventoryLimiter, authenticateFirebaseToken, validateTenantScope, getOrderInventoryHandler);
inventoryRouter.get('/inventory/order/:orderId', inventoryLimiter, authenticateFirebaseToken, validateTenantScope, getOrderInventoryHandler);

