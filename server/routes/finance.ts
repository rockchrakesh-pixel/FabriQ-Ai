import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { TaxEngineService } from '../services/taxEngineService';
import { FinancialLedgerService } from '../services/financialLedgerService';
import { FinancialReconciliationService } from '../services/financialReconciliationService';
import { backgroundQueueService } from '../services/backgroundQueueService';
import {
  AppDivision,
  RevenueLedgerEntry,
  RevenueLedgerStatus,
  PaymentReconciliationRecord,
  ReconciliationStatus,
  FinancialRefundAdjustment,
  FinancialAdjustmentStatus,
  FinancialPeriod,
  PeriodStatus,
  FinancialAuditTrailEntry,
  FranchiseSettlement,
  SettlementStatus,
  FranchiseFinancialStatement,
  BranchFinancialReport,
} from '../../src/types';

export const financeRouter = Router();

const financeLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 60 });

// ----------------------------------------------------------------------
// In-Memory Storage & Idempotency Maps
// ----------------------------------------------------------------------

const FINANCIAL_AUDIT_TRAIL: FinancialAuditTrailEntry[] = [];

function recordFinancialAudit(
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
) {
  const entry: FinancialAuditTrailEntry = {
    auditId: `faudit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
  FINANCIAL_AUDIT_TRAIL.push(entry);
  console.log(`[Financial Audit Trail] ${action} on ${entity}:${entityId} by ${actorId} (${actorRole})`);
  return entry;
}

export function getFinancialAuditTrail() {
  return FINANCIAL_AUDIT_TRAIL;
}

// Financial Periods Store
const FINANCIAL_PERIODS: FinancialPeriod[] = [
  {
    periodId: '2026-07',
    orgId: 'org-fabriq-global',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-31T23:59:59.000Z',
    status: 'CLOSED',
    closedBy: 'usr-ceo-01',
    closedAt: '2026-08-01T10:00:00.000Z',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    periodId: '2026-08',
    orgId: 'org-fabriq-global',
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-08-31T23:59:59.000Z',
    status: 'OPEN',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    periodId: '2026-09',
    orgId: 'org-fabriq-global',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-09-30T23:59:59.000Z',
    status: 'OPEN',
    createdAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

// Revenue Ledger Store
const REVENUE_LEDGER: RevenueLedgerEntry[] = [
  {
    ledgerId: 'ledg-1001',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    isCorporateOwned: false,
    transactionId: 'txn-9821',
    orderId: 'ORD-9821',
    customerId: 'cust-7701',
    serviceProductRef: 'Eco Dry Cleaning Luxury Silk Garments',
    paymentRef: 'pay_Rzp1001',
    currency: 'INR',
    grossAmountInMinorUnits: 1500000, // ₹15,000.00
    discountAmountInMinorUnits: 100000, // ₹1,000.00
    taxAmountInMinorUnits: 252000,
    netRevenueInMinorUnits: 1400000, // ₹14,000.00
    royaltyAmountInMinorUnits: 70000, // ₹700.00 (5%)
    refundAmountInMinorUnits: 0,
    adjustmentAmountInMinorUnits: 0,
    finalRecognizedAmountInMinorUnits: 1400000,
    status: 'RECOGNIZED',
    transactionDate: '2026-08-10T11:00:00.000Z',
    financialPeriodId: '2026-08',
    createdBy: 'usr-sm-01',
    createdAt: '2026-08-10T11:00:00.000Z',
    updatedAt: '2026-08-10T11:00:00.000Z',
  },
  {
    ledgerId: 'ledg-1002',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    franchiseId: null,
    branchId: 'b-lon-mayfair',
    isCorporateOwned: true,
    transactionId: 'txn-9822',
    orderId: 'ORD-9822',
    customerId: 'cust-8802',
    serviceProductRef: 'Handcrafted Bespoke Cashmere Coat',
    paymentRef: 'pay_Rzp1002',
    currency: 'GBP',
    grossAmountInMinorUnits: 350000, // £3,500.00
    discountAmountInMinorUnits: 0,
    taxAmountInMinorUnits: 70000,
    netRevenueInMinorUnits: 350000,
    royaltyAmountInMinorUnits: 0, // Corporate branch
    refundAmountInMinorUnits: 0,
    adjustmentAmountInMinorUnits: 0,
    finalRecognizedAmountInMinorUnits: 350000,
    status: 'RECOGNIZED',
    transactionDate: '2026-08-12T14:30:00.000Z',
    financialPeriodId: '2026-08',
    createdBy: 'usr-sm-lon',
    createdAt: '2026-08-12T14:30:00.000Z',
    updatedAt: '2026-08-12T14:30:00.000Z',
  },
  {
    ledgerId: 'ledg-1003',
    orgId: 'org-fabriq-global',
    divisionId: 'boutique',
    franchiseId: 'fr-blr-01',
    branchId: 'b-blr-indiranagar',
    isCorporateOwned: false,
    transactionId: 'txn-9823',
    orderId: 'ORD-9823',
    customerId: 'cust-9903',
    serviceProductRef: 'AI 3D Fit Custom Tailored Tuxedo',
    paymentRef: 'pay_Rzp1003',
    currency: 'INR',
    grossAmountInMinorUnits: 4500000, // ₹45,000.00
    discountAmountInMinorUnits: 500000, // ₹5,000.00
    taxAmountInMinorUnits: 720000,
    netRevenueInMinorUnits: 4000000, // ₹40,000.00
    royaltyAmountInMinorUnits: 260000, // ₹2,600.00 (6.5%)
    refundAmountInMinorUnits: 0,
    adjustmentAmountInMinorUnits: 0,
    finalRecognizedAmountInMinorUnits: 4000000,
    status: 'RECOGNIZED',
    transactionDate: '2026-08-14T16:00:00.000Z',
    financialPeriodId: '2026-08',
    createdBy: 'usr-sm-blr',
    createdAt: '2026-08-14T16:00:00.000Z',
    updatedAt: '2026-08-14T16:00:00.000Z',
  },
];

// Idempotency Maps
const REVENUE_IDEMPOTENCY_MAP = new Map<string, RevenueLedgerEntry>();
REVENUE_LEDGER.forEach((e) => REVENUE_IDEMPOTENCY_MAP.set(e.transactionId, e));

// Payment Reconciliations Store
const PAYMENT_RECONCILIATIONS: PaymentReconciliationRecord[] = [
  {
    reconciliationId: 'rec-5001',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    paymentRef: 'pay_Rzp1001',
    orderRef: 'ORD-9821',
    transactionRef: 'txn-9821',
    expectedAmountInMinorUnits: 1652000, // Net + Tax = ₹16,520
    receivedAmountInMinorUnits: 1652000,
    currency: 'INR',
    paymentStatus: 'SUCCESS',
    reconciliationStatus: 'MATCHED',
    reconciledBy: 'sys-auto-reconciler',
    reconciledAt: '2026-08-10T11:05:00.000Z',
    createdAt: '2026-08-10T11:05:00.000Z',
  },
  {
    reconciliationId: 'rec-5002',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    franchiseId: null,
    branchId: 'b-lon-mayfair',
    paymentRef: 'pay_Rzp1002',
    orderRef: 'ORD-9822',
    transactionRef: 'txn-9822',
    expectedAmountInMinorUnits: 420000, // £4,200.00
    receivedAmountInMinorUnits: 420000,
    currency: 'GBP',
    paymentStatus: 'SUCCESS',
    reconciliationStatus: 'MATCHED',
    reconciledBy: 'sys-auto-reconciler',
    reconciledAt: '2026-08-12T14:35:00.000Z',
    createdAt: '2026-08-12T14:35:00.000Z',
  },
];

const RECONCILIATION_IDEMPOTENCY_MAP = new Map<string, PaymentReconciliationRecord>();
PAYMENT_RECONCILIATIONS.forEach((r) => RECONCILIATION_IDEMPOTENCY_MAP.set(r.paymentRef, r));

// Financial Refunds & Adjustments Store
const FINANCIAL_REFUNDS: FinancialRefundAdjustment[] = [
  {
    adjustmentId: 'adj-8001',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    originalTransactionId: 'txn-9821',
    type: 'REFUND',
    amountInMinorUnits: 200000, // ₹2,000.00
    eligibleRefundLimitInMinorUnits: 1400000,
    currency: 'INR',
    reason: 'Garment alteration delay goodwill credit',
    requestedBy: 'usr-sm-01',
    approvedBy: 'usr-finance-01',
    approvedAt: '2026-08-13T10:00:00.000Z',
    status: 'EXECUTED',
    financialPeriodId: '2026-08',
    createdAt: '2026-08-13T09:15:00.000Z',
  },
];

const REFUND_IDEMPOTENCY_MAP = new Map<string, FinancialRefundAdjustment>();

// Phase 2D Settlements Store
const PHASE2D_SETTLEMENTS: FranchiseSettlement[] = [
  {
    settlementId: 'stl-2026-07-fr-hyd-01',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    agreementVersionId: 'agr_fr-hyd-01_v1.1',
    agreementVersion: '1.1',
    settlementPeriod: '2026-07-01_2026-07-31',
    currency: 'INR',
    grossRevenueInMinorUnits: 125000000,
    eligibleRevenueInMinorUnits: 120000000,
    royaltyAmountInMinorUnits: 6400000,
    adjustmentsInMinorUnits: 0,
    netSettlementInMinorUnits: 6400000,
    status: 'APPROVED',
    eventCount: 42,
    sourceEventIds: ['txn-9821'],
    approvedBy: 'usr-ceo-01',
    approvedAt: '2026-08-02T10:00:00.000Z',
    calculationVersion: '2D-1.0',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
];

const SETTLEMENT_IDEMPOTENCY_MAP = new Map<string, FranchiseSettlement>();

// ----------------------------------------------------------------------
// Express API Endpoints
// ----------------------------------------------------------------------

// 1. GET /api/finance/revenue-ledger — Retrieve Revenue Ledger Entries
financeRouter.get(
  '/finance/revenue-ledger',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager', 'mis', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;
      const { divisionId, branchId, periodId } = req.query;

      let entries = REVENUE_LEDGER.filter((e) => e.orgId === orgId);

      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        entries = entries.filter((e) => e.franchiseId === franchiseId);
      }

      if (divisionId) {
        entries = entries.filter((e) => e.divisionId === (divisionId as AppDivision));
      }
      if (branchId) {
        entries = entries.filter((e) => e.branchId === branchId);
      }
      if (periodId) {
        entries = entries.filter((e) => e.financialPeriodId === periodId);
      }

      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({ entries, count: entries.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve revenue ledger', details: err?.message });
    }
  }
);

// 2. POST /api/finance/revenue-ledger — Record Revenue Ledger Entry (Idempotent, Period-Locked)
financeRouter.post(
  '/finance/revenue-ledger',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role, franchiseId: userFranchiseId } = req.user!;
      const {
        transactionId,
        divisionId,
        franchiseId,
        branchId,
        isCorporateOwned = false,
        orderId,
        customerId,
        serviceProductRef,
        paymentRef,
        currency = 'INR',
        grossAmountInMinorUnits,
        discountAmountInMinorUnits = 0,
        taxAmountInMinorUnits = 0,
        royaltyAmountInMinorUnits = 0,
        financialPeriodId = '2026-08',
      } = req.body;

      if (!transactionId || !divisionId || !branchId || !serviceProductRef || typeof grossAmountInMinorUnits !== 'number') {
        res.status(400).json({ error: 'transactionId, divisionId, branchId, serviceProductRef, and grossAmountInMinorUnits are required' });
        return;
      }

      // IDEMPOTENCY CHECK
      if (REVENUE_IDEMPOTENCY_MAP.has(transactionId)) {
        const existing = REVENUE_IDEMPOTENCY_MAP.get(transactionId)!;
        recordFinancialAudit(orgId, uid, role, 'IDEMPOTENT_REVENUE_RETRY', 'RevenueLedgerEntry', existing.ledgerId, {
          reason: `Duplicate transaction ID '${transactionId}' returned existing entry`,
        });
        res.status(200).json({ success: true, idempotentRetried: true, entry: existing });
        return;
      }

      // FINANCIAL PERIOD LOCK CHECK
      const period = FINANCIAL_PERIODS.find((p) => p.periodId === financialPeriodId && p.orgId === orgId);
      if (period && (period.status === 'CLOSED' || period.status === 'LOCKED')) {
        res.status(403).json({ error: `Financial period '${financialPeriodId}' is ${period.status}. Revenue ledger modifications are strictly prohibited.` });
        return;
      }

      // NEGATIVE FINANCIAL CHECK
      if (grossAmountInMinorUnits <= 0) {
        res.status(400).json({ error: 'Gross revenue amount must be strictly positive (> 0 minor units).' });
        return;
      }

      // FRANCHISE SCOPE DENIAL
      if (role === 'franchise_owner' && userFranchiseId && franchiseId && franchiseId !== userFranchiseId) {
        res.status(403).json({ error: 'Forbidden: Cannot create revenue entry for another franchise entity.' });
        return;
      }

      const netRevenueInMinorUnits = grossAmountInMinorUnits - discountAmountInMinorUnits;
      const ledgerId = `ledg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const newEntry: RevenueLedgerEntry = {
        ledgerId,
        orgId,
        divisionId: divisionId as AppDivision,
        franchiseId: isCorporateOwned ? null : franchiseId || null,
        branchId,
        isCorporateOwned: Boolean(isCorporateOwned),
        transactionId,
        orderId: orderId || undefined,
        customerId: customerId || undefined,
        serviceProductRef,
        paymentRef: paymentRef || undefined,
        currency,
        grossAmountInMinorUnits,
        discountAmountInMinorUnits,
        taxAmountInMinorUnits,
        netRevenueInMinorUnits,
        royaltyAmountInMinorUnits,
        refundAmountInMinorUnits: 0,
        adjustmentAmountInMinorUnits: 0,
        finalRecognizedAmountInMinorUnits: netRevenueInMinorUnits,
        status: 'RECOGNIZED',
        transactionDate: now,
        financialPeriodId,
        createdBy: uid,
        createdAt: now,
        updatedAt: now,
      };

      REVENUE_LEDGER.push(newEntry);
      REVENUE_IDEMPOTENCY_MAP.set(transactionId, newEntry);

      recordFinancialAudit(orgId, uid, role, 'REVENUE_LEDGER_CREATED', 'RevenueLedgerEntry', ledgerId, {
        divisionId: newEntry.divisionId,
        franchiseId: newEntry.franchiseId,
        branchId: newEntry.branchId,
        newState: JSON.stringify({ netRevenue: netRevenueInMinorUnits, currency }),
      });

      res.status(201).json({ success: true, idempotentRetried: false, entry: newEntry });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to record revenue ledger entry', details: err?.message });
    }
  }
);

// 3. GET /api/finance/settlements — Query Settlements
financeRouter.get(
  '/finance/settlements',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'mis', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;
      const { status } = req.query;

      let list = PHASE2D_SETTLEMENTS.filter((s) => s.orgId === orgId);

      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        list = list.filter((s) => s.franchiseId === franchiseId);
      }

      if (status) {
        list = list.filter((s) => s.status === (status as SettlementStatus));
      }

      res.json({ settlements: list, count: list.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve settlements', details: err?.message });
    }
  }
);

// 4. POST /api/finance/settlements/generate — Idempotent Settlement Generation
financeRouter.post(
  '/finance/settlements/generate',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { franchiseId, settlementPeriod, idempotencyKey } = req.body;

      if (!franchiseId || !settlementPeriod) {
        res.status(400).json({ error: 'franchiseId and settlementPeriod are required' });
        return;
      }

      const compositeKey = idempotencyKey || `stl_${franchiseId}_${settlementPeriod}`;

      if (SETTLEMENT_IDEMPOTENCY_MAP.has(compositeKey)) {
        const existing = SETTLEMENT_IDEMPOTENCY_MAP.get(compositeKey)!;
        recordFinancialAudit(orgId, uid, role, 'IDEMPOTENT_SETTLEMENT_RETRY', 'FranchiseSettlement', existing.settlementId, {
          reason: `Duplicate settlement key '${compositeKey}' returned existing settlement`,
        });
        res.status(200).json({ success: true, idempotentRetried: true, settlement: existing });
        return;
      }

      // Aggregate revenue from revenue ledger for this franchise
      const franchiseEntries = REVENUE_LEDGER.filter((e) => e.orgId === orgId && e.franchiseId === franchiseId && !e.isCorporateOwned);

      let gross = 0;
      let eligible = 0;
      let royalty = 0;
      const sourceIds: string[] = [];

      franchiseEntries.forEach((e) => {
        gross += e.grossAmountInMinorUnits;
        eligible += e.netRevenueInMinorUnits;
        royalty += e.royaltyAmountInMinorUnits;
        sourceIds.push(e.transactionId);
      });

      const settlementId = `stl_${Date.now()}_${franchiseId}`;
      const now = new Date().toISOString();

      const settlement: FranchiseSettlement = {
        settlementId,
        orgId,
        franchiseId,
        agreementVersionId: 'agr_fr-hyd-01_v1.1',
        agreementVersion: '1.1',
        settlementPeriod,
        currency: 'INR',
        grossRevenueInMinorUnits: gross,
        eligibleRevenueInMinorUnits: eligible,
        royaltyAmountInMinorUnits: royalty,
        adjustmentsInMinorUnits: 0,
        netSettlementInMinorUnits: royalty,
        status: 'DRAFT',
        eventCount: franchiseEntries.length,
        sourceEventIds: sourceIds,
        calculationVersion: '2D-1.0',
        createdAt: now,
        updatedAt: now,
      };

      PHASE2D_SETTLEMENTS.push(settlement);
      SETTLEMENT_IDEMPOTENCY_MAP.set(compositeKey, settlement);

      recordFinancialAudit(orgId, uid, role, 'SETTLEMENT_GENERATED', 'FranchiseSettlement', settlementId, {
        franchiseId,
        newState: JSON.stringify({ period: settlementPeriod, netSettlement: royalty }),
      });

      res.status(201).json({ success: true, idempotentRetried: false, settlement });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate settlement', details: err?.message });
    }
  }
);

// 5. POST /api/finance/settlements/:settlementId/transition — State Transition Validation
financeRouter.post(
  '/finance/settlements/:settlementId/transition',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { settlementId } = req.params;
      const { targetStatus, reason } = req.body;

      const settlement = PHASE2D_SETTLEMENTS.find((s) => s.settlementId === settlementId && s.orgId === orgId);
      if (!settlement) {
        res.status(404).json({ error: `Settlement '${settlementId}' not found` });
        return;
      }

      // STATE TRANSITION MATRIX VALIDATION
      const allowedTransitions: Record<SettlementStatus, SettlementStatus[]> = {
        DRAFT: ['CALCULATED', 'VOID'],
        CALCULATED: ['REVIEW_REQUIRED', 'APPROVED', 'VOID'],
        REVIEW_REQUIRED: ['APPROVED', 'REJECTED', 'VOID'],
        APPROVED: ['READY_FOR_PAYOUT', 'VOID'],
        READY_FOR_PAYOUT: ['PAID', 'REVERSED'],
        PAID: ['RECONCILED', 'REVERSED'],
        RECONCILED: [],
        DISPUTED: ['REVIEW_REQUIRED', 'VOID'],
        REJECTED: ['DRAFT', 'VOID'],
        VOID: [],
        REVERSED: [],
        REVIEWED: ['APPROVED', 'VOID'], // Backward compatibility with Phase 2C
      };

      const validTargets = allowedTransitions[settlement.status] || [];
      if (!validTargets.includes(targetStatus as SettlementStatus)) {
        res.status(400).json({
          error: `Invalid state transition from '${settlement.status}' to '${targetStatus}'. Allowed next states: [${validTargets.join(', ')}]`,
        });
        return;
      }

      const prevStatus = settlement.status;
      settlement.status = targetStatus as SettlementStatus;
      settlement.updatedAt = new Date().toISOString();

      if (targetStatus === 'APPROVED') {
        settlement.approvedBy = uid;
        settlement.approvedAt = new Date().toISOString();
      }

      recordFinancialAudit(orgId, uid, role, 'SETTLEMENT_STATE_TRANSITION', 'FranchiseSettlement', settlementId, {
        franchiseId: settlement.franchiseId,
        previousState: prevStatus,
        newState: targetStatus,
        reason,
      });

      res.json({ success: true, settlement });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to transition settlement status', details: err?.message });
    }
  }
);

// 6. GET /api/finance/franchise-statement — Franchise Financial Statement
financeRouter.get(
  '/finance/franchise-statement',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId: userFranchiseId } = req.user!;
      const targetFranchiseId = (req.query.franchiseId as string) || userFranchiseId || 'fr-hyd-01';

      if (role === 'franchise_owner' && userFranchiseId && targetFranchiseId !== userFranchiseId) {
        res.status(403).json({ error: 'Forbidden: Franchise owners cannot access financial statements of other franchises.' });
        return;
      }

      const franchiseEntries = REVENUE_LEDGER.filter((e) => e.orgId === orgId && e.franchiseId === targetFranchiseId);

      let grossSales = 0;
      let discounts = 0;
      let refunds = 0;
      let adjustments = 0;
      let royalty = 0;

      franchiseEntries.forEach((e) => {
        grossSales += e.grossAmountInMinorUnits;
        discounts += e.discountAmountInMinorUnits;
        refunds += e.refundAmountInMinorUnits;
        adjustments += e.adjustmentAmountInMinorUnits;
        royalty += e.royaltyAmountInMinorUnits;
      });

      const netRevenue = grossSales - discounts - refunds - adjustments;

      const statement: FranchiseFinancialStatement = {
        statementId: `fstmt_${targetFranchiseId}_2026-08`,
        orgId,
        franchiseId: targetFranchiseId,
        periodId: '2026-08',
        currency: 'INR',
        grossSalesInMinorUnits: grossSales,
        discountsInMinorUnits: discounts,
        refundsInMinorUnits: refunds,
        adjustmentsInMinorUnits: adjustments,
        royaltyInMinorUnits: royalty,
        netRevenueInMinorUnits: netRevenue,
        paymentStatus: 'PAID',
        settlementStatus: 'APPROVED',
        outstandingAmountInMinorUnits: 0,
        generatedAt: new Date().toISOString(),
      };

      res.json({ statement });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate franchise financial statement', details: err?.message });
    }
  }
);

// 7. GET /api/finance/branch-report — Branch Financial Report
financeRouter.get(
  '/finance/branch-report',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId: userFranchiseId, branchId: userBranchId } = req.user!;
      const targetBranchId = (req.query.branchId as string) || userBranchId || 'b-hyd-bowenpally';

      if (role === 'store_manager' && userBranchId && targetBranchId !== userBranchId) {
        res.status(403).json({ error: 'Forbidden: Store managers cannot access financial reports of other branches.' });
        return;
      }

      const branchEntries = REVENUE_LEDGER.filter((e) => e.orgId === orgId && e.branchId === targetBranchId);

      let monthlyRevenue = 0;
      let refundTotals = 0;
      let adjustmentTotals = 0;

      branchEntries.forEach((e) => {
        monthlyRevenue += e.netRevenueInMinorUnits;
        refundTotals += e.refundAmountInMinorUnits;
        adjustmentTotals += e.adjustmentAmountInMinorUnits;
      });

      const txCount = branchEntries.length;
      const avgTxValue = txCount > 0 ? Math.round(monthlyRevenue / txCount) : 0;

      const report: BranchFinancialReport = {
        reportId: `brep_${targetBranchId}_2026-08`,
        orgId,
        divisionId: branchEntries[0]?.divisionId || 'laundry',
        franchiseId: branchEntries[0]?.franchiseId || null,
        branchId: targetBranchId,
        periodId: '2026-08',
        dailyRevenueInMinorUnits: Math.round(monthlyRevenue / 30),
        weeklyRevenueInMinorUnits: Math.round(monthlyRevenue / 4),
        monthlyRevenueInMinorUnits: monthlyRevenue,
        transactionCount: txCount,
        averageTransactionValueInMinorUnits: avgTxValue,
        refundTotalsInMinorUnits: refundTotals,
        adjustmentTotalsInMinorUnits: adjustmentTotals,
        paymentReconciliationStatus: 'MATCHED',
        settlementStatus: 'APPROVED',
      };

      res.json({ report });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate branch financial report', details: err?.message });
    }
  }
);

// 8. GET /api/finance/division-report — Consolidated Division Revenue
financeRouter.get(
  '/finance/division-report',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;

      const divisions: AppDivision[] = ['laundry', 'boutique', 'luxury_store'];

      const report = divisions.map((div) => {
        const divEntries = REVENUE_LEDGER.filter((e) => e.orgId === orgId && e.divisionId === div);

        let gross = 0;
        let net = 0;
        let refunds = 0;
        let royalties = 0;

        divEntries.forEach((e) => {
          gross += e.grossAmountInMinorUnits;
          net += e.netRevenueInMinorUnits;
          refunds += e.refundAmountInMinorUnits;
          royalties += e.royaltyAmountInMinorUnits;
        });

        return {
          divisionId: div,
          divisionName: div === 'laundry' ? 'FabriQ AI' : div === 'boutique' ? 'FabriQ Boutique' : 'FabriQ Luxury Store',
          grossRevenueInMinorUnits: gross,
          netRevenueInMinorUnits: net,
          refundTotalsInMinorUnits: refunds,
          royaltyTotalsInMinorUnits: royalties,
          transactionCount: divEntries.length,
        };
      });

      res.json({ divisionReport: report });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate division revenue report', details: err?.message });
    }
  }
);

// 9. GET /api/finance/reconciliations & POST /api/finance/reconciliations/verify
financeRouter.get(
  '/finance/reconciliations',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'store_manager'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const list = PAYMENT_RECONCILIATIONS.filter((r) => r.orgId === orgId);
      res.json({ reconciliations: list, count: list.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve payment reconciliations', details: err?.message });
    }
  }
);

financeRouter.post(
  '/finance/reconciliations/verify',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { paymentRef, orderRef, expectedAmountInMinorUnits, receivedAmountInMinorUnits, currency = 'INR', branchId = 'b-hyd-bowenpally', divisionId = 'laundry' } = req.body;

      if (!paymentRef || !orderRef || typeof expectedAmountInMinorUnits !== 'number' || typeof receivedAmountInMinorUnits !== 'number') {
        res.status(400).json({ error: 'paymentRef, orderRef, expectedAmountInMinorUnits, and receivedAmountInMinorUnits are required' });
        return;
      }

      // IDEMPOTENCY CHECK
      if (RECONCILIATION_IDEMPOTENCY_MAP.has(paymentRef)) {
        const existing = RECONCILIATION_IDEMPOTENCY_MAP.get(paymentRef)!;
        recordFinancialAudit(orgId, uid, role, 'IDEMPOTENT_RECONCILIATION_RETRY', 'PaymentReconciliationRecord', existing.reconciliationId, {
          reason: `Duplicate payment ref '${paymentRef}' returned existing reconciliation`,
        });
        res.status(200).json({ success: true, idempotentRetried: true, reconciliation: existing });
        return;
      }

      // AUTHORITATIVE MATCH DETERMINATION
      const isMatched = expectedAmountInMinorUnits === receivedAmountInMinorUnits;
      const reconStatus: ReconciliationStatus = isMatched ? 'MATCHED' : 'MISMATCH';
      const mismatchReason = isMatched
        ? undefined
        : `Discrepancy: Expected ${expectedAmountInMinorUnits} ${currency}, received ${receivedAmountInMinorUnits} ${currency}`;

      const reconciliationId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const record: PaymentReconciliationRecord = {
        reconciliationId,
        orgId,
        divisionId: divisionId as AppDivision,
        franchiseId: 'fr-hyd-01',
        branchId,
        paymentRef,
        orderRef,
        transactionRef: `txn_${orderRef}`,
        expectedAmountInMinorUnits,
        receivedAmountInMinorUnits,
        currency,
        paymentStatus: 'SUCCESS',
        reconciliationStatus: reconStatus,
        mismatchReason,
        reconciledBy: uid,
        reconciledAt: now,
        createdAt: now,
      };

      PAYMENT_RECONCILIATIONS.push(record);
      RECONCILIATION_IDEMPOTENCY_MAP.set(paymentRef, record);

      recordFinancialAudit(orgId, uid, role, 'PAYMENT_RECONCILED', 'PaymentReconciliationRecord', reconciliationId, {
        newState: JSON.stringify({ reconStatus, expected: expectedAmountInMinorUnits, received: receivedAmountInMinorUnits }),
      });

      res.status(201).json({ success: true, idempotentRetried: false, reconciliation: record });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to verify payment reconciliation', details: err?.message });
    }
  }
);

// 10. POST /api/finance/refunds — Controlled Financial Refund & Adjustment
financeRouter.post(
  '/finance/refunds',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { originalTransactionId, type = 'REFUND', amountInMinorUnits, currency = 'INR', reason, financialPeriodId = '2026-08', idempotencyKey } = req.body;

      if (!originalTransactionId || !reason || typeof amountInMinorUnits !== 'number') {
        res.status(400).json({ error: 'originalTransactionId, amountInMinorUnits, and reason are required' });
        return;
      }

      // IDEMPOTENCY CHECK
      const idKey = idempotencyKey || `ref_${originalTransactionId}_${amountInMinorUnits}`;
      if (REFUND_IDEMPOTENCY_MAP.has(idKey)) {
        const existing = REFUND_IDEMPOTENCY_MAP.get(idKey)!;
        recordFinancialAudit(orgId, uid, role, 'IDEMPOTENT_REFUND_RETRY', 'FinancialRefundAdjustment', existing.adjustmentId, {
          reason: `Duplicate refund key '${idKey}' returned existing refund record`,
        });
        res.status(200).json({ success: true, idempotentRetried: true, adjustment: existing });
        return;
      }

      // CLOSED PERIOD CHECK
      const period = FINANCIAL_PERIODS.find((p) => p.periodId === financialPeriodId && p.orgId === orgId);
      if (period && period.status === 'CLOSED') {
        res.status(403).json({ error: `Financial period '${financialPeriodId}' is CLOSED. Refund/adjustment creation is rejected.` });
        return;
      }

      // ELIGIBILITY & OVERAGE CHECK
      const originalTx = REVENUE_LEDGER.find((e) => e.transactionId === originalTransactionId && e.orgId === orgId);
      const eligibleLimit = originalTx ? originalTx.netRevenueInMinorUnits : 1400000;

      if (amountInMinorUnits > eligibleLimit) {
        res.status(400).json({
          error: `Refund amount (${amountInMinorUnits} ${currency}) exceeds total eligible transaction revenue limit (${eligibleLimit} ${currency}). Rejected.`,
        });
        return;
      }

      // LARGE REFUND APPROVAL TRIGGER (> ₹10,000 / 1,000,000 paise)
      const requiresApproval = amountInMinorUnits > 1000000;
      const initialStatus: FinancialAdjustmentStatus = requiresApproval ? 'PENDING_APPROVAL' : 'EXECUTED';

      const adjustmentId = `adj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const adjustment: FinancialRefundAdjustment = {
        adjustmentId,
        orgId,
        divisionId: originalTx?.divisionId || 'laundry',
        franchiseId: originalTx?.franchiseId || null,
        branchId: originalTx?.branchId || 'b-hyd-bowenpally',
        originalTransactionId,
        type,
        amountInMinorUnits,
        eligibleRefundLimitInMinorUnits: eligibleLimit,
        currency,
        reason,
        requestedBy: uid,
        approvedBy: requiresApproval ? undefined : uid,
        approvedAt: requiresApproval ? undefined : now,
        status: initialStatus,
        financialPeriodId,
        createdAt: now,
      };

      FINANCIAL_REFUNDS.push(adjustment);
      REFUND_IDEMPOTENCY_MAP.set(idKey, adjustment);

      // If auto-executed, update revenue ledger refund total
      if (initialStatus === 'EXECUTED' && originalTx) {
        originalTx.refundAmountInMinorUnits += amountInMinorUnits;
        originalTx.finalRecognizedAmountInMinorUnits = originalTx.netRevenueInMinorUnits - originalTx.refundAmountInMinorUnits;
        originalTx.updatedAt = now;
      }

      recordFinancialAudit(orgId, uid, role, 'REFUND_CREATED', 'FinancialRefundAdjustment', adjustmentId, {
        newState: JSON.stringify({ amount: amountInMinorUnits, status: initialStatus, requiresApproval }),
      });

      res.status(201).json({ success: true, idempotentRetried: false, adjustment });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to process refund or adjustment', details: err?.message });
    }
  }
);

financeRouter.post(
  '/finance/refunds/:adjustmentId/approve',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { adjustmentId } = req.params;

      const adjustment = FINANCIAL_REFUNDS.find((a) => a.adjustmentId === adjustmentId && a.orgId === orgId);
      if (!adjustment) {
        res.status(404).json({ error: `Adjustment '${adjustmentId}' not found` });
        return;
      }

      adjustment.status = 'EXECUTED';
      adjustment.approvedBy = uid;
      adjustment.approvedAt = new Date().toISOString();

      const originalTx = REVENUE_LEDGER.find((e) => e.transactionId === adjustment.originalTransactionId && e.orgId === orgId);
      if (originalTx) {
        originalTx.refundAmountInMinorUnits += adjustment.amountInMinorUnits;
        originalTx.finalRecognizedAmountInMinorUnits = originalTx.netRevenueInMinorUnits - originalTx.refundAmountInMinorUnits;
        originalTx.updatedAt = new Date().toISOString();
      }

      recordFinancialAudit(orgId, uid, role, 'REFUND_APPROVED', 'FinancialRefundAdjustment', adjustmentId, {
        newState: 'EXECUTED',
      });

      res.json({ success: true, adjustment });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to approve refund adjustment', details: err?.message });
    }
  }
);

// 11. GET /api/finance/periods & POST /api/finance/periods/:periodId/status — Period Locking
financeRouter.get(
  '/finance/periods',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'mis', 'store_manager'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const periods = FINANCIAL_PERIODS.filter((p) => p.orgId === orgId);
      res.json({ periods });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve financial periods', details: err?.message });
    }
  }
);

financeRouter.post(
  '/finance/periods/:periodId/status',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { periodId } = req.params;
      const { targetStatus } = req.body as { targetStatus: PeriodStatus };

      const period = FINANCIAL_PERIODS.find((p) => p.periodId === periodId && p.orgId === orgId);
      if (!period) {
        res.status(404).json({ error: `Financial period '${periodId}' not found` });
        return;
      }

      const prevStatus = period.status;
      period.status = targetStatus;
      period.updatedAt = new Date().toISOString();

      if (targetStatus === 'LOCKED') {
        period.lockedBy = uid;
        period.lockedAt = new Date().toISOString();
      } else if (targetStatus === 'CLOSED') {
        period.closedBy = uid;
        period.closedAt = new Date().toISOString();
      }

      recordFinancialAudit(orgId, uid, role, 'PERIOD_STATUS_CHANGED', 'FinancialPeriod', periodId, {
        previousState: prevStatus,
        newState: targetStatus,
      });

      res.json({ success: true, period });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to change financial period status', details: err?.message });
    }
  }
);

// 12. GET /api/finance/audit-trail — Query Append-Only Financial Audit Trail
financeRouter.get(
  '/finance/audit-trail',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const logs = FINANCIAL_AUDIT_TRAIL.filter((l) => l.orgId === orgId);
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json({ auditTrail: logs, count: logs.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve financial audit trail', details: err?.message });
    }
  }
);

// 13. GET /api/finance/dashboard-summary — Dashboard Consolidated Financial Overview
financeRouter.get(
  '/finance/dashboard-summary',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager', 'mis', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;

      let entries = REVENUE_LEDGER.filter((e) => e.orgId === orgId);
      let settlements = PHASE2D_SETTLEMENTS.filter((s) => s.orgId === orgId);

      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        entries = entries.filter((e) => e.franchiseId === franchiseId);
        settlements = settlements.filter((s) => s.franchiseId === franchiseId);
      }

      let totalGross = 0;
      let totalNet = 0;
      let totalRoyalty = 0;
      let totalRefunds = 0;

      entries.forEach((e) => {
        totalGross += e.grossAmountInMinorUnits;
        totalNet += e.netRevenueInMinorUnits;
        totalRoyalty += e.royaltyAmountInMinorUnits;
        totalRefunds += e.refundAmountInMinorUnits;
      });

      const pendingSettlementsCount = settlements.filter((s) => ['DRAFT', 'CALCULATED', 'REVIEW_REQUIRED'].includes(s.status)).length;
      const pendingRefundsCount = FINANCIAL_REFUNDS.filter((r) => r.status === 'PENDING_APPROVAL').length;

      res.json({
        summary: {
          totalGrossRevenueInMinorUnits: totalGross,
          totalNetRevenueInMinorUnits: totalNet,
          totalRoyaltyInMinorUnits: totalRoyalty,
          totalRefundsInMinorUnits: totalRefunds,
          totalTransactionsCount: entries.length,
          pendingSettlementsCount,
          pendingRefundsCount,
          activeFinancialPeriod: '2026-08',
          currency: 'INR',
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate financial dashboard summary', details: err?.message });
    }
  }
);

// ----------------------------------------------------------------------
// Phase 2F-2: Persistent HSN/SAC Tax Schedule & Compliance API Routes
// ----------------------------------------------------------------------

// 14. GET /api/finance/tax/classifications — Query HSN/SAC Master Codes
financeRouter.get(
  '/finance/tax/classifications',
  financeLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const { codeType, division } = req.query;

      const classifications = TaxEngineService.getClassifications(orgId, {
        codeType: codeType as any,
        division: division as any,
      });

      res.json({ success: true, count: classifications.length, classifications });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch tax classifications', details: err?.message });
    }
  }
);

// 15. POST /api/finance/tax/classifications — Create New HSN/SAC Classification Master
financeRouter.post(
  '/finance/tax/classifications',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { code, codeType, description, category, serviceOrProduct, divisionScope, effectiveFrom } = req.body;

      if (!code || !codeType || !description || !category || !serviceOrProduct) {
        res.status(400).json({ error: 'code, codeType (HSN|SAC), description, category, serviceOrProduct are required.' });
        return;
      }

      const classification = TaxEngineService.createClassification(orgId, uid, role, {
        code,
        codeType,
        description,
        category,
        serviceOrProduct,
        divisionScope,
        effectiveFrom,
      });

      res.status(201).json({ success: true, classification });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create tax classification' });
    }
  }
);

// 16. GET /api/finance/tax/schedules — Query Tax Schedules & Versions
financeRouter.get(
  '/finance/tax/schedules',
  financeLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const { codeType, classificationCode } = req.query;

      const schedules = TaxEngineService.getSchedules(orgId, {
        codeType: codeType as any,
        classificationCode: classificationCode as string,
      });

      res.json({ success: true, count: schedules.length, schedules });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch tax schedules', details: err?.message });
    }
  }
);

// 17. POST /api/finance/tax/schedules — Create Tax Schedule for HSN/SAC
financeRouter.post(
  '/finance/tax/schedules',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const {
        name,
        classificationCode,
        codeType,
        description,
        cgstRatePercent,
        sgstRatePercent,
        igstRatePercent,
        utgstRatePercent,
        cessRatePercent,
        effectiveFrom,
        jurisdiction,
        divisionScope,
      } = req.body;

      if (!name || !classificationCode || !codeType || cgstRatePercent == null || sgstRatePercent == null || igstRatePercent == null) {
        res.status(400).json({ error: 'name, classificationCode, codeType, cgstRatePercent, sgstRatePercent, igstRatePercent are required.' });
        return;
      }

      const schedule = TaxEngineService.createSchedule(orgId, uid, role, {
        name,
        classificationCode,
        codeType,
        description,
        cgstRatePercent: Number(cgstRatePercent),
        sgstRatePercent: Number(sgstRatePercent),
        igstRatePercent: Number(igstRatePercent),
        utgstRatePercent: utgstRatePercent != null ? Number(utgstRatePercent) : undefined,
        cessRatePercent: cessRatePercent != null ? Number(cessRatePercent) : undefined,
        effectiveFrom,
        jurisdiction,
        divisionScope,
      });

      res.status(201).json({ success: true, schedule });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create tax schedule' });
    }
  }
);

// 18. POST /api/finance/tax/schedules/:taxScheduleId/versions — Add Version to Tax Schedule
financeRouter.post(
  '/finance/tax/schedules/:taxScheduleId/versions',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role } = req.user!;
      const { taxScheduleId } = req.params;
      const {
        cgstRatePercent,
        sgstRatePercent,
        igstRatePercent,
        utgstRatePercent,
        cessRatePercent,
        effectiveFrom,
        effectiveTo,
        jurisdiction,
        divisionId,
        description,
      } = req.body;

      if (cgstRatePercent == null || sgstRatePercent == null || igstRatePercent == null || !effectiveFrom) {
        res.status(400).json({ error: 'cgstRatePercent, sgstRatePercent, igstRatePercent, and effectiveFrom are required.' });
        return;
      }

      const version = TaxEngineService.addVersionToSchedule(orgId, taxScheduleId, uid, role, {
        cgstRatePercent: Number(cgstRatePercent),
        sgstRatePercent: Number(sgstRatePercent),
        igstRatePercent: Number(igstRatePercent),
        utgstRatePercent: utgstRatePercent != null ? Number(utgstRatePercent) : undefined,
        cessRatePercent: cessRatePercent != null ? Number(cessRatePercent) : undefined,
        effectiveFrom,
        effectiveTo,
        jurisdiction,
        divisionId,
        description,
      });

      res.status(201).json({ success: true, version });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to add tax schedule version' });
    }
  }
);

// 19. POST /api/finance/tax/calculate — Calculate GST Components & Generate Tax Snapshot
financeRouter.post(
  '/finance/tax/calculate',
  financeLimiter,
  authenticateFirebaseToken,
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const { taxableAmountInMinorUnits, classificationCode, effectiveDate, taxTreatment, jurisdiction, divisionId } = req.body;

      if (taxableAmountInMinorUnits == null || typeof taxableAmountInMinorUnits !== 'number' || !classificationCode) {
        res.status(400).json({ error: 'taxableAmountInMinorUnits (number) and classificationCode are required.' });
        return;
      }

      const result = TaxEngineService.calculateTax(
        orgId,
        taxableAmountInMinorUnits,
        classificationCode,
        effectiveDate || new Date().toISOString(),
        {
          taxTreatment,
          jurisdiction,
          divisionId,
        }
      );

      res.json({
        success: true,
        breakdown: result.breakdown,
        snapshot: result.snapshot,
        scheduleVersion: result.scheduleVersion,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to calculate tax' });
    }
  }
);

// 20. GET /api/finance/tax/audit-trail — Query Tax Configuration Audit Logs
financeRouter.get(
  '/finance/tax/audit-trail',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const auditLogs = TaxEngineService.getAuditLogs(orgId);
      auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json({ success: true, count: auditLogs.length, auditLogs });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve tax audit logs', details: err?.message });
    }
  }
);

// ======================================================================
// PHASE 2H-3: DOUBLE-ENTRY FINANCIAL LEDGER & AUTOMATED ROYALTY ROUTES
// ======================================================================

// 21. POST /api/finance/ledger/finalize-order — Finalize Order and Post Balanced Ledger Transaction
financeRouter.post(
  '/finance/ledger/finalize-order',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const idempotencyKey = req.header('X-Idempotency-Key') || req.header('x-idempotency-key');
      const { orderId, divisionId, franchiseId, branchId, customerId, totalAmountInMinorUnits, taxAmountInMinorUnits, hsnSacCode, currency } = req.body;

      if (!orderId || !divisionId || !branchId || !customerId || typeof totalAmountInMinorUnits !== 'number') {
        res.status(400).json({ error: 'orderId, divisionId, branchId, customerId, and totalAmountInMinorUnits are required.' });
        return;
      }

      if (user.role === 'franchise_owner' && user.franchiseId && franchiseId && franchiseId !== user.franchiseId) {
        res.status(403).json({ error: 'Forbidden: Cannot finalize orders belonging to another franchise.' });
        return;
      }

      const result = FinancialLedgerService.finalizeOrder({
        orderId,
        orgId: user.orgId,
        divisionId,
        franchiseId: user.role === 'franchise_owner' ? user.franchiseId : franchiseId,
        branchId,
        customerId,
        totalAmountInMinorUnits,
        taxAmountInMinorUnits,
        hsnSacCode,
        currency,
        actor: { actorId: user.uid, actorRole: user.role },
        idempotencyKey,
      });

      res.status(201).json({ success: true, transaction: result.transaction, taxBreakdown: result.taxBreakdown });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to finalize order in financial ledger' });
    }
  }
);

// 22. POST /api/finance/ledger/royalty/calculate — Calculate Royalty Deterministically
financeRouter.post(
  '/finance/ledger/royalty/calculate',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { franchiseId, eligibleRevenueInMinorUnits, isCorporateOwned, model, customPercentage, tieredSlabs, milestoneThresholdInMinorUnits, milestoneIncentivePercentage, currency } = req.body;

      if (typeof eligibleRevenueInMinorUnits !== 'number') {
        res.status(400).json({ error: 'eligibleRevenueInMinorUnits (number) is required.' });
        return;
      }

      if (user.role === 'franchise_owner' && user.franchiseId && franchiseId && franchiseId !== user.franchiseId) {
        res.status(403).json({ error: 'Forbidden: Cannot calculate royalty for another franchise.' });
        return;
      }

      const result = FinancialLedgerService.calculateRoyalty({
        orgId: user.orgId,
        franchiseId: user.role === 'franchise_owner' ? user.franchiseId : franchiseId,
        eligibleRevenueInMinorUnits,
        isCorporateOwned,
        model,
        customPercentage,
        tieredSlabs,
        milestoneThresholdInMinorUnits,
        milestoneIncentivePercentage,
        currency,
      });

      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to calculate royalty' });
    }
  }
);

// 23. POST /api/finance/ledger/settlements/generate — Automated Franchise Royalty Settlement Generation
financeRouter.post(
  '/finance/ledger/settlements/generate',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const idempotencyKey = req.header('X-Idempotency-Key') || req.header('x-idempotency-key');
      const { franchiseId, settlementPeriod, platformCommissionPercentage, currency } = req.body;

      if (!franchiseId || !settlementPeriod) {
        res.status(400).json({ error: 'franchiseId and settlementPeriod are required.' });
        return;
      }

      const settlement = FinancialLedgerService.generateSettlement({
        orgId: user.orgId,
        franchiseId,
        settlementPeriod,
        platformCommissionPercentage,
        currency,
        actor: { actorId: user.uid, actorRole: user.role },
        idempotencyKey,
      });

      // Enqueue asynchronous settlement payout job
      backgroundQueueService.enqueueJob(
        'settlement_payout_processing',
        { settlementId: settlement.settlementId, franchiseId, amount: settlement.netPayoutInMinorUnits },
        { orgId: user.orgId },
        { correlationId: req.correlationId }
      );

      res.status(201).json({ success: true, settlement });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to generate automated settlement' });
    }
  }
);

// 24. POST /api/finance/ledger/reverse — Post Balanced Compensating Reversal Transaction
financeRouter.post(
  '/finance/ledger/reverse',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { transactionId, reason } = req.body;

      if (!transactionId || !reason) {
        res.status(400).json({ error: 'transactionId and reason are required.' });
        return;
      }

      const reversal = FinancialLedgerService.reverseTransaction(
        transactionId,
        user.orgId,
        { actorId: user.uid, actorRole: user.role },
        reason
      );

      res.status(201).json({ success: true, reversal });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to reverse financial transaction' });
    }
  }
);

// 25. GET /api/finance/ledger/transactions — Query Financial Ledger Transactions
financeRouter.get(
  '/finance/ledger/transactions',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { franchiseId, branchId, divisionId, transactionType } = req.query;

      const transactions = FinancialLedgerService.queryTransactions({
        orgId: user.orgId,
        franchiseId: franchiseId as string | undefined,
        branchId: branchId as string | undefined,
        divisionId: divisionId as string | undefined,
        transactionType: transactionType as any,
        user: {
          orgId: user.orgId,
          role: user.role,
          franchiseId: user.franchiseId,
          branchId: user.branchId,
        },
      });

      res.json({ success: true, count: transactions.length, transactions });
    } catch (err: any) {
      res.status(403).json({ error: err.message || 'Failed to query financial ledger transactions' });
    }
  }
);

// 26. GET /api/finance/ledger/customer-summary/:customerId — Customer 360 Financial Aggregation
financeRouter.get(
  '/finance/ledger/customer-summary/:customerId',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'store_staff', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { customerId } = req.params;

      const summary = FinancialLedgerService.getCustomerFinancialSummary(customerId, user.orgId);
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve customer financial summary', details: err?.message });
    }
  }
);

// 27. POST /api/finance/ledger/procurement/grn — Post Goods Receipt AP Ledger Entry
financeRouter.post(
  '/finance/ledger/procurement/grn',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'store_manager'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { grnId, poId, vendorId, divisionId, branchId, totalAmountInMinorUnits, currency } = req.body;

      if (!grnId || !poId || !vendorId || !divisionId || !branchId || typeof totalAmountInMinorUnits !== 'number') {
        res.status(400).json({ error: 'grnId, poId, vendorId, divisionId, branchId, and totalAmountInMinorUnits are required.' });
        return;
      }

      const tx = FinancialLedgerService.recordGoodsReceiptAP({
        orgId: user.orgId,
        divisionId,
        branchId,
        grnId,
        poId,
        vendorId,
        totalAmountInMinorUnits,
        currency,
        actor: { actorId: user.uid, actorRole: user.role },
      });

      res.status(201).json({ success: true, transaction: tx });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to post procurement AP ledger entry' });
    }
  }
);

// 28. POST /api/finance/ledger/inventory/write-off — Post Inventory Shrinkage Expense
financeRouter.post(
  '/finance/ledger/inventory/write-off',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { writeOffId, itemId, divisionId, branchId, amountInMinorUnits, reason } = req.body;

      if (!writeOffId || !itemId || !divisionId || !branchId || typeof amountInMinorUnits !== 'number' || !reason) {
        res.status(400).json({ error: 'writeOffId, itemId, divisionId, branchId, amountInMinorUnits, and reason are required.' });
        return;
      }

      const tx = FinancialLedgerService.recordInventoryWriteOff({
        orgId: user.orgId,
        divisionId,
        branchId,
        writeOffId,
        itemId,
        amountInMinorUnits,
        reason,
        actor: { actorId: user.uid, actorRole: user.role },
      });

      res.status(201).json({ success: true, transaction: tx });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to post inventory write-off expense' });
    }
  }
);

// 29. GET /api/finance/ledger/reconcile-divisions — Inter-Division Settlement Reconciliation
financeRouter.get(
  '/finance/ledger/reconcile-divisions',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { divisionA, divisionB } = req.query;

      if (!divisionA || !divisionB) {
        res.status(400).json({ error: 'divisionA and divisionB query parameters are required.' });
        return;
      }

      const result = FinancialLedgerService.reconcileInterDivisionSettlement(
        user.orgId,
        String(divisionA),
        String(divisionB)
      );

      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to reconcile inter-division settlements' });
    }
  }
);

// ======================================================================
// PHASE 2H-4: RECONCILIATION, PERIOD CLOSE & FINANCIAL CONTROL ROUTES
// ======================================================================

// 30. POST /api/finance/reconciliation/run — Trigger On-Demand or Periodic Reconciliation
financeRouter.post(
  '/finance/reconciliation/run',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { type, periodId, franchiseId, divisionId, orders, isAsync } = req.body;

      if (isAsync) {
        const job = backgroundQueueService.enqueueJob(
          'financial_reconciliation_batch',
          { type, periodId, franchiseId, divisionId },
          { orgId: user.orgId },
          { correlationId: req.correlationId }
        );
        res.status(202).json({ success: true, message: 'Reconciliation task enqueued', jobId: job.jobId });
        return;
      }

      let result: any;
      if (type === 'ORDERS_LEDGER' && Array.isArray(orders)) {
        result = FinancialReconciliationService.reconcileOrdersWithLedger({
          orgId: user.orgId,
          divisionId,
          franchiseId,
          orders,
          actor: { actorId: user.uid, actorRole: user.role },
        });
      } else if (type === 'ROYALTIES_LEDGER' && franchiseId) {
        result = FinancialReconciliationService.reconcileRoyaltiesWithLedger({
          orgId: user.orgId,
          franchiseId,
          periodId,
          actor: { actorId: user.uid, actorRole: user.role },
        });
      } else if (type === 'TAXES_LEDGER') {
        result = FinancialReconciliationService.reconcileTaxesWithLedger({
          orgId: user.orgId,
          periodId,
          actor: { actorId: user.uid, actorRole: user.role },
        });
      } else {
        result = FinancialReconciliationService.runComprehensivePeriodReconciliation(
          user.orgId,
          periodId || 'CURRENT',
          { actorId: user.uid, actorRole: user.role }
        );
      }

      res.json({ success: true, reconciliation: result });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to run financial reconciliation' });
    }
  }
);

// 31. GET /api/finance/reconciliation/summary — Query Multi-Tenant Reconciliation Records
financeRouter.get(
  '/finance/reconciliation/summary',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const records = FinancialReconciliationService.getReconciliations(user.orgId);
      res.json({ success: true, count: records.length, records });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve reconciliation records', details: err?.message });
    }
  }
);

// 32. GET /api/finance/reconciliation/discrepancies — Query Open Financial Discrepancies
financeRouter.get(
  '/finance/reconciliation/discrepancies',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const discrepancies = FinancialReconciliationService.getDiscrepancies(user.orgId);
      res.json({ success: true, count: discrepancies.length, discrepancies });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve financial discrepancies', details: err?.message });
    }
  }
);

// 33. POST /api/finance/periods/open — Open Financial Period
financeRouter.post(
  '/finance/periods/open',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { periodId, name, startDate, endDate } = req.body;

      if (!periodId || !name || !startDate || !endDate) {
        res.status(400).json({ error: 'periodId, name, startDate, and endDate are required.' });
        return;
      }

      const period = FinancialReconciliationService.openPeriod({
        orgId: user.orgId,
        periodId,
        name,
        startDate,
        endDate,
        actor: { actorId: user.uid, actorRole: user.role },
      });

      res.status(201).json({ success: true, period });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to open financial period' });
    }
  }
);

// 34. POST /api/finance/periods/close — Close & Lock Financial Period with Gating Validation
financeRouter.post(
  '/finance/periods/close',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { periodId, forceOverride } = req.body;

      if (!periodId) {
        res.status(400).json({ error: 'periodId is required.' });
        return;
      }

      const result = FinancialReconciliationService.closePeriod({
        orgId: user.orgId,
        periodId,
        actor: { actorId: user.uid, actorRole: user.role },
        forceOverride: Boolean(forceOverride),
      });

      res.json({ success: true, period: result.period, reconciliation: result.reconciliation });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to close financial period' });
    }
  }
);

// 35. POST /api/finance/periods/reopen — Reopen Locked Period (CEO / Super Admin only)
financeRouter.post(
  '/finance/periods/reopen',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { periodId, reason } = req.body;

      if (!periodId || !reason) {
        res.status(400).json({ error: 'periodId and reason are required.' });
        return;
      }

      const period = FinancialReconciliationService.reopenPeriod({
        orgId: user.orgId,
        periodId,
        reason,
        actor: { actorId: user.uid, actorRole: user.role },
      });

      res.json({ success: true, period });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to reopen financial period' });
    }
  }
);

// 36. GET /api/finance/periods — List Financial Periods
financeRouter.get(
  '/finance/periods',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const periods = FinancialReconciliationService.getPeriods(user.orgId);
      res.json({ success: true, count: periods.length, periods });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve financial periods', details: err?.message });
    }
  }
);

// 37. POST /api/finance/adjustments/request — Request Financial Adjustment
financeRouter.post(
  '/finance/adjustments/request',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'store_manager'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { divisionId, franchiseId, branchId, amountInMinorUnits, currency, debitAccountId, creditAccountId, reason, periodId } = req.body;

      if (!divisionId || !branchId || typeof amountInMinorUnits !== 'number' || !debitAccountId || !creditAccountId || !reason || !periodId) {
        res.status(400).json({ error: 'divisionId, branchId, amountInMinorUnits, debitAccountId, creditAccountId, reason, and periodId are required.' });
        return;
      }

      const adjustment = FinancialReconciliationService.requestAdjustment({
        orgId: user.orgId,
        divisionId,
        franchiseId,
        branchId,
        amountInMinorUnits,
        currency,
        debitAccountId,
        creditAccountId,
        reason,
        periodId,
        actor: { actorId: user.uid, actorRole: user.role },
      });

      res.status(201).json({ success: true, adjustment });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to request financial adjustment' });
    }
  }
);

// 38. POST /api/finance/adjustments/:adjustmentId/approve — Approve & Execute Adjustment (Separation of Duty)
financeRouter.post(
  '/finance/adjustments/:adjustmentId/approve',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { adjustmentId } = req.params;

      const result = FinancialReconciliationService.approveAdjustment({
        orgId: user.orgId,
        adjustmentId,
        actor: { actorId: user.uid, actorRole: user.role },
      });

      res.json({ success: true, adjustment: result.adjustment, transaction: result.transaction });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to approve financial adjustment' });
    }
  }
);

// 39. POST /api/finance/adjustments/:adjustmentId/reject — Reject Financial Adjustment
financeRouter.post(
  '/finance/adjustments/:adjustmentId/reject',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { adjustmentId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({ error: 'reason is required to reject adjustment.' });
        return;
      }

      const adjustment = FinancialReconciliationService.rejectAdjustment({
        orgId: user.orgId,
        adjustmentId,
        reason,
        actor: { actorId: user.uid, actorRole: user.role },
      });

      res.json({ success: true, adjustment });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to reject financial adjustment' });
    }
  }
);

// 40. GET /api/finance/adjustments — List Financial Adjustments
financeRouter.get(
  '/finance/adjustments',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'store_manager', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const adjustments = FinancialReconciliationService.getAdjustments(user.orgId);
      res.json({ success: true, count: adjustments.length, adjustments });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve adjustments', details: err?.message });
    }
  }
);

// 41. GET /api/finance/reports/trial-balance — Enterprise Trial Balance Report
financeRouter.get(
  '/finance/reports/trial-balance',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const trialBalance = FinancialReconciliationService.generateTrialBalance(user.orgId);
      res.json({ success: true, trialBalance });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate trial balance', details: err?.message });
    }
  }
);

// 42. GET /api/finance/reports/export — Financial Reconciliation & Period Close Export
financeRouter.get(
  '/finance/reports/export',
  financeLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { format } = req.query;

      const trialBalance = FinancialReconciliationService.generateTrialBalance(user.orgId);
      const reconciliations = FinancialReconciliationService.getReconciliations(user.orgId);
      const discrepancies = FinancialReconciliationService.getDiscrepancies(user.orgId);

      FinancialLedgerService.logFinancialAudit(
        user.orgId,
        'EXPORT_FINANCIAL_REPORT',
        'FinancialReportExport',
        `exp-${Date.now()}`,
        user.uid,
        user.role,
        `Exported financial reporting package in format ${format || 'JSON'}`
      );

      res.json({
        success: true,
        orgId: user.orgId,
        exportedAt: new Date().toISOString(),
        format: format || 'JSON',
        trialBalance,
        reconciliationSummary: { count: reconciliations.length, records: reconciliations },
        discrepancies: { count: discrepancies.length, records: discrepancies },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to export financial report', details: err?.message });
    }
  }
);



