import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { requireIdempotency } from '../middleware/idempotencyMiddleware';
import { IdempotencyService } from '../services/idempotencyService';
import { TaxEngineService } from '../services/taxEngineService';
import {
  AppDivision,
  VendorEntity,
  VendorStatus,
  VendorComplianceStatus,
  ProcurementItem,
  PurchaseRequisition,
  PurchaseOrderEntity,
  PurchaseOrderVersionHistory,
  GoodsReceiptNote,
  PurchaseReturnEntity,
  VendorInvoiceMatchRecord,
  InvoiceMatchStatus,
  VendorPerformanceMetrics,
  ProcurementAuditTrailEntry,
} from '../../src/types';

export const procurementRouter = Router();

const procurementLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 80 });

// Configurable Procurement Tax Policy
export interface ProcurementTaxPolicy {
  defaultTaxRatePercent: number; // Default percentage rate (e.g., 18 for 18% GST standard policy default)
  isTaxExempt?: boolean;
}

let PROCUREMENT_TAX_POLICY: ProcurementTaxPolicy = {
  defaultTaxRatePercent: 18, // Configurable GST policy default
  isTaxExempt: false,
};

// ----------------------------------------------------------------------
// In-Memory Storage & Idempotency Maps
// ----------------------------------------------------------------------

const PROCUREMENT_AUDIT_TRAIL: ProcurementAuditTrailEntry[] = [];

export function recordProcurementAudit(
  orgId: string,
  actorId: string,
  actorRole: string,
  action: string,
  entity: string,
  entityId: string,
  opts?: {
    divisionId?: AppDivision;
    franchiseId?: string | null;
    branchId?: string;
    previousState?: string;
    newState?: string;
    reason?: string;
  }
): ProcurementAuditTrailEntry {
  const entry: ProcurementAuditTrailEntry = {
    auditId: `paudit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orgId,
    divisionId: opts?.divisionId,
    franchiseId: opts?.franchiseId,
    branchId: opts?.branchId,
    actorId,
    actorRole,
    action,
    entity,
    entityId,
    previousState: opts?.previousState,
    newState: opts?.newState,
    reason: opts?.reason,
    timestamp: new Date().toISOString(),
  };
  PROCUREMENT_AUDIT_TRAIL.push(entry);
  console.log(`[Procurement Audit Log] ${action} on ${entity} (${entityId}) by ${actorId} [${actorRole}]`);
  return entry;
}

export function getProcurementAuditTrail(): ProcurementAuditTrailEntry[] {
  return PROCUREMENT_AUDIT_TRAIL;
}

// Data Stores
const VENDORS: VendorEntity[] = [
  {
    vendorId: 'v-solvents-india',
    organizationId: 'org-fabriq-global',
    divisionId: 'laundry',
    vendorName: 'Solvents India Hydrocarbon Corp',
    legalName: 'Solvents India Private Limited',
    vendorType: 'CHEM_SOLVENT',
    registrationTaxId: '36AAACS1234F1Z1',
    primaryContact: {
      contactId: 'vc-1',
      name: 'Rajesh Sharma',
      email: 'rajesh@solventsindia.com',
      phone: '+919876543210',
      role: 'Sales Director',
      isPrimary: true,
    },
    contacts: [
      {
        contactId: 'vc-1',
        name: 'Rajesh Sharma',
        email: 'rajesh@solventsindia.com',
        phone: '+919876543210',
        role: 'Sales Director',
        isPrimary: true,
      },
    ],
    email: 'orders@solventsindia.com',
    phone: '+914023456789',
    addresses: [
      {
        addressId: 'va-1',
        type: 'BILLING',
        street: 'Phase III, IDA Cherlapally',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500051',
        country: 'India',
        isPrimary: true,
      },
    ],
    paymentTerms: 'NET_30',
    currency: 'INR',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    riskClassification: 'LOW',
    complianceStatus: 'VERIFIED',
    complianceExpiryDate: '2027-12-31T23:59:59.000Z',
    verifiedBy: 'usr-corp-admin-01',
    verifiedAt: '2026-01-10T10:00:00.000Z',
    createdBy: 'usr-corp-admin-01',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedBy: 'usr-corp-admin-01',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    vendorId: 'v-italian-silk',
    organizationId: 'org-fabriq-global',
    divisionId: 'boutique',
    vendorName: 'Milano Silk & Textiles SpA',
    legalName: 'Milano Textiles Italia S.r.l.',
    vendorType: 'LUXURY_FABRIC',
    registrationTaxId: 'IT12345678901',
    primaryContact: {
      contactId: 'vc-2',
      name: 'Marco Rossi',
      email: 'marco.rossi@milanosilk.it',
      phone: '+39021234567',
      role: 'Export Manager',
      isPrimary: true,
    },
    contacts: [],
    email: 'export@milanosilk.it',
    phone: '+39021234567',
    addresses: [],
    paymentTerms: 'NET_60',
    currency: 'INR',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    riskClassification: 'LOW',
    complianceStatus: 'VERIFIED',
    complianceExpiryDate: '2027-06-30T23:59:59.000Z',
    verifiedBy: 'usr-corp-admin-01',
    verifiedAt: '2026-02-01T10:00:00.000Z',
    createdBy: 'usr-corp-admin-01',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedBy: 'usr-corp-admin-01',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    vendorId: 'v-blocked-supplier',
    organizationId: 'org-fabriq-global',
    divisionId: 'laundry',
    vendorName: 'NonCompliant Chemical Trading',
    legalName: 'NonCompliant Chemical Trading Corp',
    vendorType: 'CHEM_SOLVENT',
    registrationTaxId: '36AAACN9999F1Z9',
    primaryContact: {
      contactId: 'vc-3',
      name: 'Vikram Mehta',
      email: 'vikram@noncompliantchem.com',
      phone: '+919111111111',
      role: 'Manager',
      isPrimary: true,
    },
    contacts: [],
    email: 'info@noncompliantchem.com',
    phone: '+919111111111',
    addresses: [],
    paymentTerms: 'IMMEDIATE',
    currency: 'INR',
    status: 'BLOCKED',
    approvalStatus: 'REJECTED',
    riskClassification: 'HIGH',
    complianceStatus: 'EXPIRED',
    complianceExpiryDate: '2025-01-01T00:00:00.000Z',
    createdBy: 'usr-corp-admin-01',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedBy: 'usr-corp-admin-01',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const PROCUREMENT_CATALOG: ProcurementItem[] = [
  {
    procurementItemId: 'pitem-hydrocarbon-solvent',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    sku: 'SKU-SOLVENT-HC-200L',
    itemName: 'Eco Hydrocarbon Dry Cleaning Solvent (200L Drum)',
    category: 'Solvents',
    unitOfMeasure: 'DRUM',
    preferredVendorIds: ['v-solvents-india'],
    approvedVendorIds: ['v-solvents-india'],
    minimumOrderQuantity: 2,
    reorderThreshold: 5,
    standardLeadTimeDays: 4,
    estimatedUnitPriceInMinorUnits: 4500000,
    currency: 'INR',
    activeStatus: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    procurementItemId: 'pitem-silk-fabric-roll',
    orgId: 'org-fabriq-global',
    divisionId: 'boutique',
    sku: 'SKU-SILK-RAW-50M',
    itemName: 'Italian Raw Silk Fabric Roll (50m)',
    category: 'Textiles',
    unitOfMeasure: 'ROLL',
    preferredVendorIds: ['v-italian-silk'],
    approvedVendorIds: ['v-italian-silk'],
    minimumOrderQuantity: 1,
    reorderThreshold: 2,
    standardLeadTimeDays: 14,
    estimatedUnitPriceInMinorUnits: 12500000,
    currency: 'INR',
    activeStatus: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

const PURCHASE_REQUISITIONS: PurchaseRequisition[] = [
  {
    requisitionId: 'req-001',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    requesterId: 'usr-store-mgr-bowenpally',
    requesterName: 'Ayesha Khan',
    requesterRole: 'store_manager',
    items: [
      {
        procurementItemId: 'pitem-hydrocarbon-solvent',
        sku: 'SKU-SOLVENT-HC-200L',
        itemName: 'Eco Hydrocarbon Dry Cleaning Solvent (200L Drum)',
        quantity: 2,
        unitOfMeasure: 'DRUM',
        estimatedUnitPriceInMinorUnits: 4500000,
        totalPriceInMinorUnits: 9000000,
      },
    ],
    totalQuantity: 2,
    totalEstimatedAmountInMinorUnits: 9000000,
    currency: 'INR',
    requiredByDate: '2026-09-01',
    reason: 'Replenish dry cleaning solvent inventory for Q3 workload peak.',
    preferredVendorId: 'v-solvents-india',
    status: 'APPROVED',
    approverId: 'usr-corp-admin-01',
    approvedAt: '2026-08-10T12:00:00.000Z',
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-10T12:00:00.000Z',
  },
];

const PURCHASE_ORDERS: PurchaseOrderEntity[] = [
  {
    purchaseOrderId: 'po-2026-001',
    requisitionId: 'req-001',
    vendorId: 'v-solvents-india',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    version: 1,
    lineItems: [
      {
        lineItemId: 'poli-1',
        procurementItemId: 'pitem-hydrocarbon-solvent',
        sku: 'SKU-SOLVENT-HC-200L',
        itemName: 'Eco Hydrocarbon Dry Cleaning Solvent (200L Drum)',
        quantity: 2,
        receivedQuantity: 0,
        unitPriceInMinorUnits: 4500000,
        discountInMinorUnits: 0,
        taxInMinorUnits: 1620000,
        subtotalInMinorUnits: 9000000,
        totalInMinorUnits: 10620000,
      },
    ],
    totalQuantity: 2,
    totalReceivedQuantity: 0,
    subtotalInMinorUnits: 9000000,
    totalDiscountInMinorUnits: 0,
    totalTaxInMinorUnits: 1620000,
    totalAmountInMinorUnits: 10620000,
    currency: 'INR',
    expectedDeliveryDate: '2026-08-25',
    paymentTerms: 'NET_30',
    status: 'ISSUED',
    createdBy: 'usr-inventory-mgr',
    approvedBy: 'usr-corp-admin-01',
    issuedAt: '2026-08-11T09:00:00.000Z',
    createdAt: '2026-08-11T08:00:00.000Z',
    updatedAt: '2026-08-11T09:00:00.000Z',
  },
];

const PO_VERSIONS: PurchaseOrderVersionHistory[] = [];
const GOODS_RECEIPTS: GoodsReceiptNote[] = [];
const PURCHASE_RETURNS: PurchaseReturnEntity[] = [];
const VENDOR_INVOICE_MATCHES: VendorInvoiceMatchRecord[] = [];

// Idempotency Tracking Maps
const REQ_IDEMPOTENCY_MAP = new Map<string, PurchaseRequisition>();
const PO_IDEMPOTENCY_MAP = new Map<string, PurchaseOrderEntity>();
const GRN_IDEMPOTENCY_MAP = new Map<string, GoodsReceiptNote>();
const INVENTORY_POSTING_KEYS = new Set<string>();

// ----------------------------------------------------------------------
// 1. VENDOR MASTER API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/vendors',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let list = VENDORS.filter((v) => v.organizationId === userClaims?.orgId);

      if (userClaims?.role === 'franchise_owner' && userClaims.franchiseId) {
        list = list.filter((v) => !v.divisionId || v.divisionId === userClaims.divisionId);
      }

      res.json({ success: true, count: list.length, vendors: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/vendors',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const {
        vendorName,
        legalName,
        vendorType,
        registrationTaxId,
        primaryContact,
        email,
        phone,
        addresses,
        paymentTerms,
        currency,
        divisionId,
        riskClassification,
      } = req.body;

      if (!vendorName || !email || !currency) {
        return res.status(400).json({ success: false, error: 'vendorName, email, and currency are required.' });
      }

      const vendorId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newVendor: VendorEntity = {
        vendorId,
        organizationId: userClaims.orgId,
        divisionId: divisionId || userClaims.divisionId,
        vendorName,
        legalName: legalName || vendorName,
        vendorType: vendorType || 'GENERAL_SUPPLIER',
        registrationTaxId: registrationTaxId || '',
        primaryContact: primaryContact || {
          contactId: `vc-${Date.now()}`,
          name: vendorName,
          email,
          phone: phone || '',
          role: 'Primary Contact',
          isPrimary: true,
        },
        contacts: [],
        email,
        phone: phone || '',
        addresses: addresses || [],
        paymentTerms: paymentTerms || 'NET_30',
        currency: currency.toUpperCase(),
        status: 'PENDING_APPROVAL',
        approvalStatus: 'PENDING',
        riskClassification: riskClassification || 'LOW',
        complianceStatus: 'PENDING',
        createdBy: userClaims.uid,
        createdAt: new Date().toISOString(),
        updatedBy: userClaims.uid,
        updatedAt: new Date().toISOString(),
      };

      VENDORS.push(newVendor);

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'CREATE_VENDOR', 'Vendor', vendorId, {
        divisionId: newVendor.divisionId,
        newState: 'PENDING_APPROVAL',
      });

      res.status(201).json({ success: true, vendor: newVendor });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/vendors/:vendorId/status',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { vendorId } = req.params;
      const { status, reason } = req.body;

      const validStatuses: VendorStatus[] = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'INACTIVE'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
      }

      const vendor = VENDORS.find((v) => v.vendorId === vendorId && v.organizationId === userClaims.orgId);
      if (!vendor) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      const prevStatus = vendor.status;
      vendor.status = status;
      if (status === 'ACTIVE') {
        vendor.approvalStatus = 'APPROVED';
      } else if (status === 'BLOCKED') {
        vendor.approvalStatus = 'REJECTED';
      }
      vendor.updatedBy = userClaims.uid;
      vendor.updatedAt = new Date().toISOString();

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'UPDATE_VENDOR_STATUS', 'Vendor', vendorId, {
        divisionId: vendor.divisionId,
        previousState: prevStatus,
        newState: status,
        reason: reason || 'Status transition requested by authorized role',
      });

      res.json({ success: true, vendor });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/vendors/:vendorId/compliance',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { vendorId } = req.params;
      const { complianceStatus, expiryDate, notes } = req.body;

      const validStatuses: VendorComplianceStatus[] = ['PENDING', 'VERIFIED', 'EXPIRING', 'EXPIRED', 'REJECTED'];
      if (!validStatuses.includes(complianceStatus)) {
        return res.status(400).json({ success: false, error: `Invalid compliance status: ${complianceStatus}` });
      }

      const vendor = VENDORS.find((v) => v.vendorId === vendorId && v.organizationId === userClaims.orgId);
      if (!vendor) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      const prevComp = vendor.complianceStatus;
      vendor.complianceStatus = complianceStatus;
      vendor.complianceExpiryDate = expiryDate || vendor.complianceExpiryDate;
      vendor.verifiedBy = userClaims.uid;
      vendor.verifiedAt = new Date().toISOString();
      vendor.updatedBy = userClaims.uid;
      vendor.updatedAt = new Date().toISOString();

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'UPDATE_VENDOR_COMPLIANCE', 'Vendor', vendorId, {
        divisionId: vendor.divisionId,
        previousState: prevComp,
        newState: complianceStatus,
        reason: notes || 'Compliance record update',
      });

      res.json({ success: true, vendor });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 2. PROCUREMENT CATALOG API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/catalog',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const list = PROCUREMENT_CATALOG.filter((item) => item.orgId === userClaims.orgId);
      res.json({ success: true, count: list.length, items: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/catalog',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'inventory', 'store_manager'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const {
        sku,
        itemName,
        category,
        unitOfMeasure,
        preferredVendorIds,
        approvedVendorIds,
        minimumOrderQuantity,
        reorderThreshold,
        standardLeadTimeDays,
        estimatedUnitPriceInMinorUnits,
        currency,
      } = req.body;

      if (!sku || !itemName || !unitOfMeasure || estimatedUnitPriceInMinorUnits == null) {
        return res.status(400).json({ success: false, error: 'sku, itemName, unitOfMeasure, and unit price are required.' });
      }

      if (estimatedUnitPriceInMinorUnits <= 0) {
        return res.status(400).json({ success: false, error: 'Unit price must be positive minor currency integer.' });
      }

      const procurementItemId = `pitem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newItem: ProcurementItem = {
        procurementItemId,
        orgId: userClaims.orgId,
        divisionId: userClaims.divisionId,
        sku,
        itemName,
        category: category || 'General Supplies',
        unitOfMeasure,
        preferredVendorIds: preferredVendorIds || [],
        approvedVendorIds: approvedVendorIds || [],
        minimumOrderQuantity: minimumOrderQuantity || 1,
        reorderThreshold: reorderThreshold || 5,
        standardLeadTimeDays: standardLeadTimeDays || 3,
        estimatedUnitPriceInMinorUnits,
        currency: (currency || 'INR').toUpperCase(),
        activeStatus: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      PROCUREMENT_CATALOG.push(newItem);

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'CREATE_CATALOG_ITEM', 'ProcurementItem', procurementItemId, {
        divisionId: newItem.divisionId,
      });

      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 3. PURCHASE REQUISITIONS API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/requisitions',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let list = PURCHASE_REQUISITIONS.filter((r) => r.orgId === userClaims.orgId);

      if (userClaims.role === 'franchise_owner' && userClaims.franchiseId) {
        list = list.filter((r) => r.franchiseId === userClaims.franchiseId);
      } else if (userClaims.role === 'store_manager' && userClaims.branchId) {
        list = list.filter((r) => r.branchId === userClaims.branchId);
      }

      res.json({ success: true, count: list.length, requisitions: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/requisitions',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  requireIdempotency('CREATE_REQUISITION'),
  async (req: Request, res: Response) => {

    try {
      const userClaims = (req as any).userClaims;
      const { items, requiredByDate, reason, preferredVendorId, idempotencyKey } = req.body;

      if (idempotencyKey && REQ_IDEMPOTENCY_MAP.has(idempotencyKey)) {
        return res.json({ success: true, requisition: REQ_IDEMPOTENCY_MAP.get(idempotencyKey), cached: true });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'At least one line item is required.' });
      }

      let totalQty = 0;
      let totalAmount = 0;
      for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
          return res.status(400).json({ success: false, error: 'Requisition items must have positive quantity.' });
        }
        if (!item.estimatedUnitPriceInMinorUnits || item.estimatedUnitPriceInMinorUnits <= 0) {
          return res.status(400).json({ success: false, error: 'Requisition items must have positive price.' });
        }
        const lineTotal = item.quantity * item.estimatedUnitPriceInMinorUnits;
        item.totalPriceInMinorUnits = lineTotal;
        totalQty += item.quantity;
        totalAmount += lineTotal;
      }

      const requisitionId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const reqRecord: PurchaseRequisition = {
        requisitionId,
        orgId: userClaims.orgId,
        divisionId: userClaims.divisionId,
        franchiseId: userClaims.franchiseId,
        branchId: userClaims.branchId,
        requesterId: userClaims.uid,
        requesterName: userClaims.uid,
        requesterRole: userClaims.role,
        items,
        totalQuantity: totalQty,
        totalEstimatedAmountInMinorUnits: totalAmount,
        currency: 'INR',
        requiredByDate: requiredByDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        reason: reason || 'Operational inventory replenishment',
        preferredVendorId,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      PURCHASE_REQUISITIONS.push(reqRecord);

      if (idempotencyKey) {
        REQ_IDEMPOTENCY_MAP.set(idempotencyKey, reqRecord);
      }

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'CREATE_REQUISITION', 'PurchaseRequisition', requisitionId, {
        divisionId: reqRecord.divisionId,
        franchiseId: reqRecord.franchiseId,
        branchId: reqRecord.branchId,
        newState: 'SUBMITTED',
      });

      res.status(201).json({ success: true, requisition: reqRecord });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/requisitions/:reqId/approve',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory', 'franchise_owner'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { reqId } = req.params;
      const { approve, rejectionReason } = req.body;

      const requisition = PURCHASE_REQUISITIONS.find((r) => r.requisitionId === reqId && r.orgId === userClaims.orgId);
      if (!requisition) {
        return res.status(404).json({ success: false, error: 'Requisition not found' });
      }

      if (requisition.status !== 'SUBMITTED' && requisition.status !== 'REVIEW_REQUIRED') {
        return res.status(400).json({ success: false, error: `Requisition cannot be approved from status: ${requisition.status}` });
      }

      const HIGH_VALUE_THRESHOLD = 10000000;
      if (
        requisition.requesterId === userClaims.uid &&
        requisition.totalEstimatedAmountInMinorUnits > HIGH_VALUE_THRESHOLD &&
        !['super_admin', 'ceo', 'owner'].includes(userClaims.role)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Separation of Duties Policy: Requester cannot approve high-value requisition (> ₹1,00,000). Elevated executive sign-off required.',
        });
      }

      const prevStatus = requisition.status;
      if (approve) {
        requisition.status = 'APPROVED';
        requisition.approverId = userClaims.uid;
        requisition.approvedAt = new Date().toISOString();
      } else {
        requisition.status = 'REJECTED';
        requisition.rejectionReason = rejectionReason || 'Rejected during procurement review';
      }
      requisition.updatedAt = new Date().toISOString();

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, approve ? 'APPROVE_REQUISITION' : 'REJECT_REQUISITION', 'PurchaseRequisition', reqId, {
        divisionId: requisition.divisionId,
        franchiseId: requisition.franchiseId,
        branchId: requisition.branchId,
        previousState: prevStatus,
        newState: requisition.status,
      });

      res.json({ success: true, requisition });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 4. PURCHASE ORDERS & VERSIONING API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/purchase-orders',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let list = PURCHASE_ORDERS.filter((po) => po.orgId === userClaims.orgId);

      if (userClaims.role === 'franchise_owner' && userClaims.franchiseId) {
        list = list.filter((po) => po.franchiseId === userClaims.franchiseId);
      } else if (userClaims.role === 'store_manager' && userClaims.branchId) {
        list = list.filter((po) => po.branchId === userClaims.branchId);
      }

      res.json({ success: true, count: list.length, purchaseOrders: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/purchase-orders',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'inventory', 'finance'),
  validateTenantScope,
  procurementLimiter,
  requireIdempotency('CREATE_PURCHASE_ORDER'),
  async (req: Request, res: Response) => {

    try {
      const userClaims = (req as any).userClaims;
      const {
        requisitionId,
        vendorId,
        lineItems,
        expectedDeliveryDate,
        paymentTerms,
        currency,
        idempotencyKey,
      } = req.body;

      if (idempotencyKey && PO_IDEMPOTENCY_MAP.has(idempotencyKey)) {
        return res.json({ success: true, purchaseOrder: PO_IDEMPOTENCY_MAP.get(idempotencyKey), cached: true });
      }

      if (!vendorId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
        return res.status(400).json({ success: false, error: 'vendorId and lineItems are required.' });
      }

      const vendor = VENDORS.find((v) => v.vendorId === vendorId && v.organizationId === userClaims.orgId);
      if (!vendor) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      if (vendor.status === 'BLOCKED' || vendor.status === 'SUSPENDED' || vendor.status === 'INACTIVE') {
        return res.status(400).json({
          success: false,
          error: `Procurement policy rejection: Vendor status is ${vendor.status}. Direct procurement prohibited.`,
        });
      }

      if (vendor.complianceStatus === 'EXPIRED' || vendor.complianceStatus === 'REJECTED') {
        return res.status(400).json({
          success: false,
          error: `Compliance policy rejection: Vendor compliance status is ${vendor.complianceStatus}. Procurement blocked until verified.`,
        });
      }

      let totalQty = 0;
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const poLineItems = lineItems.map((li: any, index: number) => {
        if (!li.quantity || li.quantity <= 0) {
          throw new Error(`Line item #${index + 1} must have a positive quantity.`);
        }
        if (li.unitPriceInMinorUnits == null || li.unitPriceInMinorUnits < 0) {
          throw new Error(`Line item #${index + 1} must have a non-negative unit price.`);
        }

        const qty = li.quantity;
        const price = li.unitPriceInMinorUnits;
        const discount = li.discountInMinorUnits || 0;
        const itemSubtotal = qty * price - discount;

        // Dynamic configurable tax policy calculation
        const catalogItem = PROCUREMENT_CATALOG.find(
          (ci) => ci.procurementItemId === li.procurementItemId || ci.sku === li.sku
        );
        const effectiveTaxRatePercent =
          li.taxRatePercent !== undefined
            ? Number(li.taxRatePercent)
            : catalogItem?.taxRatePercent !== undefined
            ? Number(catalogItem.taxRatePercent)
            : PROCUREMENT_TAX_POLICY.isTaxExempt
            ? 0
            : PROCUREMENT_TAX_POLICY.defaultTaxRatePercent;

        const tax =
          li.taxInMinorUnits !== undefined
            ? li.taxInMinorUnits
            : Math.round(itemSubtotal * (effectiveTaxRatePercent / 100));
        const lineTotal = itemSubtotal + tax;

        totalQty += qty;
        subtotal += qty * price;
        totalDiscount += discount;
        totalTax += tax;

        return {
          lineItemId: `poli-${Date.now()}-${index}`,
          procurementItemId: li.procurementItemId || `item-${index}`,
          sku: li.sku || 'SKU-GENERIC',
          itemName: li.itemName || 'Procurement Material',
          quantity: qty,
          receivedQuantity: 0,
          unitPriceInMinorUnits: price,
          discountInMinorUnits: discount,
          taxRatePercent: effectiveTaxRatePercent,
          taxInMinorUnits: tax,
          subtotalInMinorUnits: itemSubtotal,
          totalInMinorUnits: lineTotal,
        };
      });

      const grandTotal = subtotal - totalDiscount + totalTax;

      const purchaseOrderId = `po-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const poRecord: PurchaseOrderEntity = {
        purchaseOrderId,
        requisitionId,
        vendorId,
        orgId: userClaims.orgId,
        divisionId: userClaims.divisionId,
        franchiseId: userClaims.franchiseId,
        branchId: userClaims.branchId,
        version: 1,
        lineItems: poLineItems,
        totalQuantity: totalQty,
        totalReceivedQuantity: 0,
        subtotalInMinorUnits: subtotal,
        totalDiscountInMinorUnits: totalDiscount,
        totalTaxInMinorUnits: totalTax,
        totalAmountInMinorUnits: grandTotal,
        currency: (currency || vendor.currency || 'INR').toUpperCase(),
        expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        paymentTerms: paymentTerms || vendor.paymentTerms || 'NET_30',
        status: 'DRAFT',
        createdBy: userClaims.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      PURCHASE_ORDERS.push(poRecord);

      if (idempotencyKey) {
        PO_IDEMPOTENCY_MAP.set(idempotencyKey, poRecord);
      }

      if (requisitionId) {
        const reqObj = PURCHASE_REQUISITIONS.find((r) => r.requisitionId === requisitionId);
        if (reqObj) {
          reqObj.status = 'CONVERTED_TO_PO';
          reqObj.convertedPoId = purchaseOrderId;
        }
      }

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'CREATE_PURCHASE_ORDER', 'PurchaseOrder', purchaseOrderId, {
        divisionId: poRecord.divisionId,
        franchiseId: poRecord.franchiseId,
        branchId: poRecord.branchId,
        newState: 'DRAFT',
      });

      res.status(201).json({ success: true, purchaseOrder: poRecord });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/purchase-orders/:poId/approve',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { poId } = req.params;

      const po = PURCHASE_ORDERS.find((p) => p.purchaseOrderId === poId && p.orgId === userClaims.orgId);
      if (!po) {
        return res.status(404).json({ success: false, error: 'Purchase Order not found' });
      }

      if (po.status !== 'DRAFT' && po.status !== 'PENDING_APPROVAL') {
        return res.status(400).json({ success: false, error: `Purchase Order cannot be approved from status: ${po.status}` });
      }

      const prevStatus = po.status;
      po.status = 'ISSUED';
      po.approvedBy = userClaims.uid;
      po.issuedAt = new Date().toISOString();
      po.updatedAt = new Date().toISOString();

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'APPROVE_PURCHASE_ORDER', 'PurchaseOrder', poId, {
        divisionId: po.divisionId,
        franchiseId: po.franchiseId,
        branchId: po.branchId,
        previousState: prevStatus,
        newState: 'ISSUED',
      });

      res.json({ success: true, purchaseOrder: po });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/purchase-orders/:poId/revise',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { poId } = req.params;
      const { changeReason, updatedLineItems } = req.body;

      const po = PURCHASE_ORDERS.find((p) => p.purchaseOrderId === poId && p.orgId === userClaims.orgId);
      if (!po) {
        return res.status(404).json({ success: false, error: 'Purchase Order not found' });
      }

      if (!changeReason) {
        return res.status(400).json({ success: false, error: 'changeReason is required for controlled PO revisioning.' });
      }

      const versionHistoryRecord: PurchaseOrderVersionHistory = {
        versionId: `pover_${poId}_v${po.version}`,
        purchaseOrderId: poId,
        version: po.version,
        changedBy: userClaims.uid,
        changedAt: new Date().toISOString(),
        changeReason,
        snapshot: JSON.parse(JSON.stringify(po)),
      };
      PO_VERSIONS.push(versionHistoryRecord);

      po.version += 1;
      if (updatedLineItems && Array.isArray(updatedLineItems)) {
        po.lineItems = updatedLineItems;
        let sub = 0;
        let disc = 0;
        let tax = 0;
        let qty = 0;

        po.lineItems.forEach((li) => {
          qty += li.quantity;
          sub += li.quantity * li.unitPriceInMinorUnits;
          disc += li.discountInMinorUnits || 0;
          tax += li.taxInMinorUnits || 0;
        });

        po.totalQuantity = qty;
        po.subtotalInMinorUnits = sub;
        po.totalDiscountInMinorUnits = disc;
        po.totalTaxInMinorUnits = tax;
        po.totalAmountInMinorUnits = sub - disc + tax;
      }
      po.updatedAt = new Date().toISOString();

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'REVISE_PURCHASE_ORDER', 'PurchaseOrder', poId, {
        divisionId: po.divisionId,
        franchiseId: po.franchiseId,
        branchId: po.branchId,
        reason: `Revised to Version ${po.version}: ${changeReason}`,
      });

      res.json({ success: true, purchaseOrder: po, versionHistory: versionHistoryRecord });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.get(
  '/procurement/purchase-orders/:poId/versions',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { poId } = req.params;

      const history = PO_VERSIONS.filter((v) => v.purchaseOrderId === poId && v.snapshot.orgId === userClaims.orgId);
      res.json({ success: true, count: history.length, versions: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 5. GOODS RECEIPT (GRN) & QUALITY VERIFICATION API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/goods-receipts',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let list = GOODS_RECEIPTS.filter((grn) => grn.orgId === userClaims.orgId);

      if (userClaims.role === 'franchise_owner' && userClaims.franchiseId) {
        list = list.filter((g) => g.franchiseId === userClaims.franchiseId);
      } else if (userClaims.role === 'store_manager' && userClaims.branchId) {
        list = list.filter((g) => g.branchId === userClaims.branchId);
      }

      res.json({ success: true, count: list.length, goodsReceipts: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/goods-receipts',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'inventory', 'store_manager', 'franchise_owner'),
  validateTenantScope,
  procurementLimiter,
  requireIdempotency('CREATE_GOODS_RECEIPT'),
  async (req: Request, res: Response) => {

    try {
      const userClaims = (req as any).userClaims;
      const { purchaseOrderId, receivedItems, idempotencyKey, allowOverReceipt } = req.body;

      if (idempotencyKey && GRN_IDEMPOTENCY_MAP.has(idempotencyKey)) {
        return res.json({ success: true, goodsReceipt: GRN_IDEMPOTENCY_MAP.get(idempotencyKey), cached: true });
      }

      const po = PURCHASE_ORDERS.find((p) => p.purchaseOrderId === purchaseOrderId && p.orgId === userClaims.orgId);
      if (!po) {
        return res.status(404).json({ success: false, error: 'Purchase Order not found' });
      }

      if (po.status !== 'APPROVED' && po.status !== 'ISSUED' && po.status !== 'PARTIALLY_RECEIVED') {
        return res.status(400).json({ success: false, error: `Cannot receive goods against PO in status: ${po.status}` });
      }

      if (!receivedItems || !Array.isArray(receivedItems) || receivedItems.length === 0) {
        return res.status(400).json({ success: false, error: 'receivedItems list is required.' });
      }

      let totalRx = 0;
      let totalAcc = 0;
      let totalRej = 0;

      const grnItems = receivedItems.map((ri: any) => {
        const lineItem = po.lineItems.find((l) => l.procurementItemId === ri.procurementItemId || l.sku === ri.sku);
        const orderedQty = lineItem ? lineItem.quantity : ri.orderedQuantity || ri.receivedQuantity;
        const rxQty = ri.receivedQuantity;

        if (rxQty <= 0) {
          throw new Error(`Received quantity for item ${ri.itemName || ri.sku} must be positive.`);
        }

        if (rxQty > orderedQty && !allowOverReceipt && !['super_admin', 'ceo', 'owner'].includes(userClaims.role)) {
          throw new Error(
            `Over-receipt policy violation: Received quantity (${rxQty}) exceeds ordered PO quantity (${orderedQty}). Over-receipt authorization required.`
          );
        }

        const acceptedQty = ri.acceptedQuantity != null ? ri.acceptedQuantity : rxQty;
        const rejectedQty = ri.rejectedQuantity != null ? ri.rejectedQuantity : 0;
        const damagedQty = ri.damagedQuantity != null ? ri.damagedQuantity : 0;

        totalRx += rxQty;
        totalAcc += acceptedQty;
        totalRej += rejectedQty;

        return {
          lineItemId: lineItem?.lineItemId || `grnli-${Date.now()}`,
          procurementItemId: ri.procurementItemId || lineItem?.procurementItemId || `pitem-${Date.now()}`,
          sku: ri.sku || lineItem?.sku || 'SKU-GENERIC',
          itemName: ri.itemName || lineItem?.itemName || 'Material Item',
          orderedQuantity: orderedQty,
          receivedQuantity: rxQty,
          acceptedQuantity: acceptedQty,
          rejectedQuantity: rejectedQty,
          damagedQuantity: damagedQty,
          batchLot: ri.batchLot || `LOT-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}`,
          inspectionNotes: ri.inspectionNotes || 'Received at store facility',
        };
      });

      const grnId = `grn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const grnRecord: GoodsReceiptNote = {
        grnId,
        purchaseOrderId,
        vendorId: po.vendorId,
        orgId: userClaims.orgId,
        divisionId: po.divisionId,
        franchiseId: po.franchiseId,
        branchId: po.branchId || userClaims.branchId || 'b-hyd-bowenpally',
        receivedItems: grnItems,
        totalReceivedQty: totalRx,
        totalAcceptedQty: totalAcc,
        totalRejectedQty: totalRej,
        receivingEmployeeId: userClaims.uid,
        receivingEmployeeName: userClaims.uid,
        receivingDate: new Date().toISOString(),
        inspectionStatus: totalRej === 0 ? 'PASSED' : 'PARTIAL',
        status: 'RECEIVED',
        inventoryPosted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      GOODS_RECEIPTS.push(grnRecord);

      if (idempotencyKey) {
        GRN_IDEMPOTENCY_MAP.set(idempotencyKey, grnRecord);
      }

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'CREATE_GOODS_RECEIPT', 'GoodsReceipt', grnId, {
        divisionId: grnRecord.divisionId,
        franchiseId: grnRecord.franchiseId,
        branchId: grnRecord.branchId,
        newState: 'RECEIVED',
      });

      res.status(201).json({ success: true, goodsReceipt: grnRecord });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/goods-receipts/:grnId/quality-check',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'inventory', 'store_manager', 'quality_inspector'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { grnId } = req.params;
      const { itemInspections } = req.body;

      const grn = GOODS_RECEIPTS.find((g) => g.grnId === grnId && g.orgId === userClaims.orgId);
      if (!grn) {
        return res.status(404).json({ success: false, error: 'Goods Receipt Note not found' });
      }

      if (grn.status === 'POSTED_TO_INVENTORY') {
        return res.status(400).json({ success: false, error: 'Cannot modify quality check after inventory posting.' });
      }

      if (itemInspections && Array.isArray(itemInspections)) {
        let totalAcc = 0;
        let totalRej = 0;

        grn.receivedItems.forEach((item) => {
          const check = itemInspections.find((c: any) => c.sku === item.sku || c.procurementItemId === item.procurementItemId);
          if (check) {
            item.acceptedQuantity = check.acceptedQuantity != null ? check.acceptedQuantity : item.receivedQuantity;
            item.rejectedQuantity = check.rejectedQuantity != null ? check.rejectedQuantity : 0;
            item.damagedQuantity = check.damagedQuantity != null ? check.damagedQuantity : 0;
            item.inspectionNotes = check.notes || item.inspectionNotes;
          }
          totalAcc += item.acceptedQuantity;
          totalRej += item.rejectedQuantity;
        });

        grn.totalAcceptedQty = totalAcc;
        grn.totalRejectedQty = totalRej;
        grn.inspectionStatus = totalRej === 0 ? 'PASSED' : totalAcc > 0 ? 'PARTIAL' : 'FAILED';
      }

      grn.status = 'QUALITY_CHECK';
      grn.inspectorId = userClaims.uid;
      grn.inspectionDate = new Date().toISOString();
      grn.updatedAt = new Date().toISOString();

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'PERFORM_QUALITY_CHECK', 'GoodsReceipt', grnId, {
        divisionId: grn.divisionId,
        franchiseId: grn.franchiseId,
        branchId: grn.branchId,
        newState: grn.inspectionStatus,
      });

      res.json({ success: true, goodsReceipt: grn });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 6. PROCUREMENT TO INVENTORY POSTING INTEGRATION
// ----------------------------------------------------------------------

procurementRouter.post(
  '/procurement/goods-receipts/:grnId/post-inventory',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'inventory', 'store_manager'),
  validateTenantScope,
  procurementLimiter,
  requireIdempotency('POST_GRN_INVENTORY'),
  async (req: Request, res: Response) => {

    try {
      const userClaims = (req as any).userClaims;
      const { grnId } = req.params;

      const grn = GOODS_RECEIPTS.find((g) => g.grnId === grnId && g.orgId === userClaims.orgId);
      if (!grn) {
        return res.status(404).json({ success: false, error: 'Goods Receipt Note not found' });
      }

      const postingKey = `posting_${grnId}`;
      if (grn.inventoryPosted || INVENTORY_POSTING_KEYS.has(postingKey)) {
        return res.status(400).json({
          success: false,
          error: 'Idempotency Protection: Goods receipt has already been posted to the inventory ledger.',
          posted: true,
        });
      }

      const po = PURCHASE_ORDERS.find((p) => p.purchaseOrderId === grn.purchaseOrderId);

      grn.receivedItems.forEach((item) => {
        if (item.acceptedQuantity > 0) {
          if (po) {
            const poli = po.lineItems.find((l) => l.procurementItemId === item.procurementItemId || l.sku === item.sku);
            if (poli) {
              poli.receivedQuantity += item.acceptedQuantity;
            }
          }
        }
      });

      if (po) {
        po.totalReceivedQuantity = po.lineItems.reduce((acc, l) => acc + l.receivedQuantity, 0);
        if (po.totalReceivedQuantity >= po.totalQuantity) {
          po.status = 'FULLY_RECEIVED';
        } else if (po.totalReceivedQuantity > 0) {
          po.status = 'PARTIALLY_RECEIVED';
        }
        po.updatedAt = new Date().toISOString();
      }

      grn.inventoryPosted = true;
      grn.inventoryPostedAt = new Date().toISOString();
      grn.status = 'POSTED_TO_INVENTORY';
      grn.updatedAt = new Date().toISOString();

      INVENTORY_POSTING_KEYS.add(postingKey);

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'POST_GRN_TO_INVENTORY', 'GoodsReceipt', grnId, {
        divisionId: grn.divisionId,
        franchiseId: grn.franchiseId,
        branchId: grn.branchId,
        newState: 'POSTED_TO_INVENTORY',
        reason: `Posted ${grn.totalAcceptedQty} accepted items to inventory ledger.`,
      });

      res.json({ success: true, goodsReceipt: grn, purchaseOrder: po });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 7. PURCHASE RETURNS API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/returns',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let list = PURCHASE_RETURNS.filter((r) => r.orgId === userClaims.orgId);

      if (userClaims.role === 'franchise_owner' && userClaims.franchiseId) {
        list = list.filter((r) => r.franchiseId === userClaims.franchiseId);
      }

      res.json({ success: true, count: list.length, returns: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/returns',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'inventory', 'store_manager', 'finance'),
  validateTenantScope,
  procurementLimiter,
  requireIdempotency('CREATE_PURCHASE_RETURN'),
  async (req: Request, res: Response) => {

    try {
      const userClaims = (req as any).userClaims;
      const { purchaseOrderId, grnId, vendorId, returnedItems, reason } = req.body;

      if (!purchaseOrderId || !returnedItems || !Array.isArray(returnedItems) || returnedItems.length === 0) {
        return res.status(400).json({ success: false, error: 'purchaseOrderId and returnedItems are required.' });
      }

      let totalQty = 0;
      let totalAmount = 0;

      for (const item of returnedItems) {
        if (!item.quantity || item.quantity <= 0) {
          return res.status(400).json({ success: false, error: 'Returned items must have positive quantity.' });
        }
        const itemAmount = item.quantity * (item.unitPriceInMinorUnits || 0);
        item.totalAmountInMinorUnits = itemAmount;
        totalQty += item.quantity;
        totalAmount += itemAmount;
      }

      const returnId = `preturn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const returnRecord: PurchaseReturnEntity = {
        returnId,
        vendorId: vendorId || 'v-solvents-india',
        purchaseOrderId,
        grnId: grnId || 'grn-001',
        orgId: userClaims.orgId,
        divisionId: userClaims.divisionId,
        franchiseId: userClaims.franchiseId,
        branchId: userClaims.branchId || 'b-hyd-bowenpally',
        returnedItems,
        totalQuantity: totalQty,
        totalAmountInMinorUnits: totalAmount,
        currency: 'INR',
        reason: reason || 'Quality rejection return to vendor',
        status: 'PROCESSED',
        requestedBy: userClaims.uid,
        approvedBy: userClaims.uid,
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      PURCHASE_RETURNS.push(returnRecord);

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'PROCESS_PURCHASE_RETURN', 'PurchaseReturn', returnId, {
        divisionId: returnRecord.divisionId,
        franchiseId: returnRecord.franchiseId,
        branchId: returnRecord.branchId,
        newState: 'PROCESSED',
        reason: `Processed vendor purchase return of ${totalQty} units (Valued at minor units: ${totalAmount}).`,
      });

      res.status(201).json({ success: true, purchaseReturn: returnRecord });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 8. VENDOR INVOICE MATCHING & FINANCE INTEGRATION API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/invoices',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let list = VENDOR_INVOICE_MATCHES.filter((inv) => inv.orgId === userClaims.orgId);

      if (userClaims.role === 'franchise_owner' && userClaims.franchiseId) {
        list = list.filter((i) => i.franchiseId === userClaims.franchiseId);
      }

      res.json({ success: true, count: list.length, invoices: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/invoices/match',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  requireIdempotency('MATCH_VENDOR_INVOICE'),
  async (req: Request, res: Response) => {

    try {
      const userClaims = (req as any).userClaims;
      const {
        purchaseOrderId,
        grnId,
        vendorInvoiceRef,
        invoiceAmountInMinorUnits,
        invoiceQuantity,
        invoiceCurrency,
      } = req.body;

      if (!vendorInvoiceRef) {
        return res.status(400).json({ success: false, error: 'vendorInvoiceRef is required.' });
      }

      const duplicateInv = VENDOR_INVOICE_MATCHES.find(
        (m) => m.vendorInvoiceRef === vendorInvoiceRef && m.orgId === userClaims.orgId
      );
      if (duplicateInv) {
        return res.status(400).json({
          success: false,
          error: `Duplicate invoice reference detected: Invoice '${vendorInvoiceRef}' has already been processed.`,
        });
      }

      const po = PURCHASE_ORDERS.find((p) => p.purchaseOrderId === purchaseOrderId && p.orgId === userClaims.orgId);
      const grn = GOODS_RECEIPTS.find((g) => g.grnId === grnId && g.orgId === userClaims.orgId);

      if (!po) {
        return res.status(404).json({ success: false, error: `3-Way Match Error: Missing Purchase Order '${purchaseOrderId}'.` });
      }

      if (!grn) {
        return res.status(404).json({ success: false, error: `3-Way Match Error: Missing Goods Receipt Note '${grnId}'.` });
      }

      const poAmt = po.totalAmountInMinorUnits;
      const grnAmt = po.subtotalInMinorUnits;
      const invAmt = invoiceAmountInMinorUnits;

      const poQty = po.totalQuantity;
      const grnQty = grn.totalAcceptedQty;
      const invQty = invoiceQuantity;

      const poCurr = po.currency.toUpperCase();
      const invCurr = (invoiceCurrency || 'INR').toUpperCase();

      const quantityMismatch = invQty !== grnQty || invQty !== poQty;
      const priceMismatch = invAmt !== poAmt;
      const currencyMismatch = invCurr !== poCurr;

      let status: InvoiceMatchStatus = 'MATCHED';
      const mismatchReasons: string[] = [];

      if (currencyMismatch) {
        status = 'MISMATCH';
        mismatchReasons.push(`Currency mismatch: PO currency is ${poCurr} vs Invoice currency ${invCurr}.`);
      }
      if (quantityMismatch) {
        status = 'MISMATCH';
        mismatchReasons.push(`Quantity mismatch: Invoice quantity ${invQty} differs from PO/GRN quantity ${grnQty}.`);
      }
      if (priceMismatch) {
        status = 'MISMATCH';
        mismatchReasons.push(`Price mismatch: Invoice total ₹${(invAmt / 100).toFixed(2)} differs from PO total ₹${(poAmt / 100).toFixed(2)}.`);
      }

      const invoiceMatchId = `invm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const matchRecord: VendorInvoiceMatchRecord = {
        invoiceMatchId,
        orgId: userClaims.orgId,
        divisionId: po.divisionId,
        franchiseId: po.franchiseId,
        branchId: po.branchId || 'b-hyd-bowenpally',
        vendorId: po.vendorId,
        vendorInvoiceRef,
        purchaseOrderId,
        grnId,
        poAmountInMinorUnits: poAmt,
        grnAmountInMinorUnits: grnAmt,
        invoiceAmountInMinorUnits: invAmt,
        poQuantity: poQty,
        grnQuantity: grnQty,
        invoiceQuantity: invQty,
        poCurrency: poCurr,
        invoiceCurrency: invCurr,
        quantityMismatch,
        priceMismatch,
        currencyMismatch,
        status,
        mismatchReason: mismatchReasons.join(' | ') || undefined,
        matchedBy: userClaims.uid,
        matchedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      VENDOR_INVOICE_MATCHES.push(matchRecord);

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'PERFORM_INVOICE_MATCH', 'VendorInvoiceMatch', invoiceMatchId, {
        divisionId: matchRecord.divisionId,
        franchiseId: matchRecord.franchiseId,
        branchId: matchRecord.branchId,
        newState: status,
        reason: status === 'MATCHED' ? '3-Way Match Passed' : mismatchReasons.join(' | '),
      });

      res.status(201).json({ success: true, invoiceMatch: matchRecord });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/invoices/:matchId/approve',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { matchId } = req.params;

      const record = VENDOR_INVOICE_MATCHES.find((m) => m.invoiceMatchId === matchId && m.orgId === userClaims.orgId);
      if (!record) {
        return res.status(404).json({ success: false, error: 'Invoice match record not found' });
      }

      record.status = 'APPROVED';
      record.matchedBy = userClaims.uid;
      record.matchedAt = new Date().toISOString();

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'APPROVE_VENDOR_INVOICE', 'VendorInvoiceMatch', matchId, {
        divisionId: record.divisionId,
        franchiseId: record.franchiseId,
        branchId: record.branchId,
        newState: 'APPROVED',
        reason: 'Authorized accounts payable liability approval',
      });

      res.json({ success: true, invoiceMatch: record });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 9. VENDOR PERFORMANCE FOUNDATION API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/vendor-performance',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const orgVendors = VENDORS.filter((v) => v.organizationId === userClaims.orgId);

      const metrics: VendorPerformanceMetrics[] = orgVendors.map((vendor) => {
        const vPOs = PURCHASE_ORDERS.filter((p) => p.vendorId === vendor.vendorId);
        const vGRNs = GOODS_RECEIPTS.filter((g) => g.vendorId === vendor.vendorId);
        const vInvoices = VENDOR_INVOICE_MATCHES.filter((i) => i.vendorId === vendor.vendorId);

        const totalPOs = vPOs.length;
        const totalInvoices = vInvoices.length;
        const invoiceMismatchCount = vInvoices.filter((i) => i.status === 'MISMATCH').length;

        let totalItemsOrdered = 0;
        let totalItemsReceived = 0;
        let totalItemsRejected = 0;

        vGRNs.forEach((g) => {
          totalItemsReceived += g.totalReceivedQty;
          totalItemsRejected += g.totalRejectedQty;
        });

        vPOs.forEach((p) => {
          totalItemsOrdered += p.totalQuantity;
        });

        const fulfillmentRate = totalItemsOrdered > 0 ? Math.min(100, Math.round((totalItemsReceived / totalItemsOrdered) * 100)) : 100;
        const qualityRejectionRate = totalItemsReceived > 0 ? Math.round((totalItemsRejected / totalItemsReceived) * 100) : 0;
        const invoiceMatchRate = totalInvoices > 0 ? Math.round(((totalInvoices - invoiceMismatchCount) / totalInvoices) * 100) : 100;

        return {
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          totalPurchaseOrders: totalPOs,
          onTimeDeliveries: Math.max(0, totalPOs - 1),
          timelinessRatePercent: totalPOs > 0 ? 95 : 100,
          totalItemsOrdered,
          totalItemsReceived,
          totalItemsRejected,
          fulfillmentRatePercent: fulfillmentRate,
          qualityRejectionRatePercent: qualityRejectionRate,
          totalInvoices,
          invoiceMismatchCount,
          invoiceMatchRatePercent: invoiceMatchRate,
          averageLeadTimeDays: 4,
        };
      });

      res.json({ success: true, count: metrics.length, performanceMetrics: metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 10. PROCUREMENT REPORTING, AUDIT & DASHBOARD SUMMARY
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/reports',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let pos = PURCHASE_ORDERS.filter((p) => p.orgId === userClaims.orgId);
      let grns = GOODS_RECEIPTS.filter((g) => g.orgId === userClaims.orgId);
      let returns = PURCHASE_RETURNS.filter((r) => r.orgId === userClaims.orgId);

      if (userClaims.role === 'franchise_owner' && userClaims.franchiseId) {
        pos = pos.filter((p) => p.franchiseId === userClaims.franchiseId);
        grns = grns.filter((g) => g.franchiseId === userClaims.franchiseId);
        returns = returns.filter((r) => r.franchiseId === userClaims.franchiseId);
      }

      const totalProcurementSpendInMinorUnits = pos.reduce((acc, p) => acc + p.totalAmountInMinorUnits, 0);
      const openPOsCount = pos.filter((p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_RECEIVED').length;
      const totalGRNsCount = grns.length;
      const totalReturnsCount = returns.length;

      res.json({
        success: true,
        tenantScope: {
          orgId: userClaims.orgId,
          divisionId: userClaims.divisionId,
          franchiseId: userClaims.franchiseId,
          branchId: userClaims.branchId,
        },
        reports: {
          totalProcurementSpendInMinorUnits,
          totalProcurementSpendFormatted: `₹${(totalProcurementSpendInMinorUnits / 100).toLocaleString('en-IN')}`,
          openPOsCount,
          totalGRNsCount,
          totalReturnsCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.get(
  '/procurement/audit-trail',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'inventory'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const logs = PROCUREMENT_AUDIT_TRAIL.filter((l) => l.orgId === userClaims.orgId);
      res.json({ success: true, count: logs.length, auditLogs: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.get(
  '/procurement/dashboard-summary',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      let reqs = PURCHASE_REQUISITIONS.filter((r) => r.orgId === userClaims.orgId);
      let pos = PURCHASE_ORDERS.filter((p) => p.orgId === userClaims.orgId);
      let grns = GOODS_RECEIPTS.filter((g) => g.orgId === userClaims.orgId);
      let invs = VENDOR_INVOICE_MATCHES.filter((i) => i.orgId === userClaims.orgId);
      let vendors = VENDORS.filter((v) => v.organizationId === userClaims.orgId);

      if (userClaims.role === 'franchise_owner' && userClaims.franchiseId) {
        reqs = reqs.filter((r) => r.franchiseId === userClaims.franchiseId);
        pos = pos.filter((p) => p.franchiseId === userClaims.franchiseId);
        grns = grns.filter((g) => g.franchiseId === userClaims.franchiseId);
        invs = invs.filter((i) => i.franchiseId === userClaims.franchiseId);
      }

      const openRequisitionsCount = reqs.filter((r) => r.status === 'SUBMITTED' || r.status === 'REVIEW_REQUIRED').length;
      const pendingPoApprovalsCount = pos.filter((p) => p.status === 'DRAFT' || p.status === 'PENDING_APPROVAL').length;
      const openPOsCount = pos.filter((p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_RECEIVED').length;
      const totalPoValueInMinorUnits = pos.reduce((acc, p) => acc + p.totalAmountInMinorUnits, 0);
      const awaitingReceiptCount = grns.filter((g) => g.status === 'RECEIVED' || g.status === 'QUALITY_CHECK').length;
      const invoiceMismatchesCount = invs.filter((i) => i.status === 'MISMATCH').length;
      const vendorIssuesCount = vendors.filter((v) => v.status === 'BLOCKED' || v.status === 'SUSPENDED' || v.complianceStatus === 'EXPIRED').length;

      res.json({
        success: true,
        summary: {
          openRequisitionsCount,
          pendingPoApprovalsCount,
          openPOsCount,
          totalPoValueInMinorUnits,
          totalPoValueFormatted: `₹${(totalPoValueInMinorUnits / 100).toLocaleString('en-IN')}`,
          awaitingReceiptCount,
          invoiceMismatchesCount,
          vendorIssuesCount,
          totalVendorsCount: vendors.length,
          activeVendorsCount: vendors.filter((v) => v.status === 'ACTIVE').length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ----------------------------------------------------------------------
// 11. PROCUREMENT TAX POLICY API
// ----------------------------------------------------------------------

procurementRouter.get(
  '/procurement/tax-policy',
  authenticateFirebaseToken,
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        taxPolicy: PROCUREMENT_TAX_POLICY,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

procurementRouter.post(
  '/procurement/tax-policy',
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  procurementLimiter,
  async (req: Request, res: Response) => {
    try {
      const userClaims = (req as any).userClaims;
      const { defaultTaxRatePercent, isTaxExempt } = req.body;

      if (defaultTaxRatePercent != null) {
        if (typeof defaultTaxRatePercent !== 'number' || defaultTaxRatePercent < 0 || defaultTaxRatePercent > 100) {
          return res.status(400).json({ success: false, error: 'defaultTaxRatePercent must be a valid percentage between 0 and 100.' });
        }
        PROCUREMENT_TAX_POLICY.defaultTaxRatePercent = defaultTaxRatePercent;
      }

      if (isTaxExempt != null) {
        PROCUREMENT_TAX_POLICY.isTaxExempt = Boolean(isTaxExempt);
      }

      recordProcurementAudit(userClaims.orgId, userClaims.uid, userClaims.role, 'UPDATE_TAX_POLICY', 'ProcurementTaxPolicy', 'global_policy', {
        reason: `Updated default procurement tax rate to ${PROCUREMENT_TAX_POLICY.defaultTaxRatePercent}% (isTaxExempt: ${PROCUREMENT_TAX_POLICY.isTaxExempt}).`,
      });

      res.json({
        success: true,
        taxPolicy: PROCUREMENT_TAX_POLICY,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);
