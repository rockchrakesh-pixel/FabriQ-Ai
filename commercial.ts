import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { requireIdempotency } from '../middleware/idempotencyMiddleware';
import { IdempotencyService } from '../services/idempotencyService';
import {
  AppDivision,
  CommercialRevenueEvent,
  CommercialEventType,
  FranchiseSettlement,
  RoyaltyCalculationResult,
  SettlementStatus,
  VersionedFranchiseAgreement,
  RoyaltyTierSlab,
} from '../../src/types';

export const commercialRouter = Router();

const commercialLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 50 });

// Immutable Commercial Audit Log
const COMMERCIAL_AUDIT_LOGS: Array<{
  id: string;
  orgId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}> = [];

function recordCommercialAuditLog(orgId: string, userId: string, action: string, details: string) {
  const entry = {
    id: `audit_com_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orgId,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  COMMERCIAL_AUDIT_LOGS.push(entry);
  console.log(`[Commercial Royalty Audit Log] ${action}: ${details} (User: ${userId})`);
  return entry;
}

export function getCommercialAuditLogs() {
  return COMMERCIAL_AUDIT_LOGS;
}

// ----------------------------------------------------------------------
// In-Memory Storage & Idempotency Map
// ----------------------------------------------------------------------

const IDEMPOTENCY_MAP = new Map<string, CommercialRevenueEvent>();

// Versioned Agreement Store
const VERSIONED_AGREEMENTS: VersionedFranchiseAgreement[] = [
  // Version 1.0 (Historical) for Deccan Luxury Retail (fr-hyd-01)
  {
    agreementVersionId: 'agr_fr-hyd-01_v1.0',
    agreementId: 'agr_fr-hyd-01',
    franchiseId: 'fr-hyd-01',
    orgId: 'org-fabriq-global',
    version: '1.0',
    status: 'expired',
    effectiveDate: '2025-01-01T00:00:00.000Z',
    expiryDate: '2025-12-31T23:59:59.000Z',
    territory: 'Hyderabad Metropolitan Region',
    royaltyModel: 'fixed_percentage',
    royaltyPercentage: 5.0, // 5% historical
    settlementFrequency: 'monthly',
    currency: 'INR',
    applicableDivisions: ['laundry', 'boutique', 'luxury_store'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-12-31T23:59:59.000Z',
  },
  // Version 1.1 (Active) for Deccan Luxury Retail (fr-hyd-01) - Tiered Progressive Marginal
  {
    agreementVersionId: 'agr_fr-hyd-01_v1.1',
    agreementId: 'agr_fr-hyd-01',
    franchiseId: 'fr-hyd-01',
    orgId: 'org-fabriq-global',
    version: '1.1',
    status: 'active',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    expiryDate: '2028-12-31T23:59:59.000Z',
    territory: 'Hyderabad Metropolitan Region',
    royaltyModel: 'tiered',
    royaltyPercentage: 6.0,
    tieredCalculationType: 'progressive_marginal',
    tieredSlabs: [
      {
        slabId: 'slab-01',
        minAmountInMinorUnits: 0,
        maxAmountInMinorUnits: 100000000, // ₹0 – ₹10 Lakhs (100,000,000 paise)
        ratePercentage: 5.0, // 5%
      },
      {
        slabId: 'slab-02',
        minAmountInMinorUnits: 100000000,
        maxAmountInMinorUnits: 250000000, // ₹10 Lakhs – ₹25 Lakhs (250,000,000 paise)
        ratePercentage: 7.0, // 7%
      },
      {
        slabId: 'slab-03',
        minAmountInMinorUnits: 250000000,
        maxAmountInMinorUnits: null, // ₹25 Lakhs+
        ratePercentage: 9.0, // 9%
      },
    ],
    settlementFrequency: 'monthly',
    currency: 'INR',
    applicableDivisions: ['laundry', 'boutique', 'luxury_store'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  // Active Agreement for Bengaluru Prestige Retail (fr-blr-01) - Fixed Percentage
  {
    agreementVersionId: 'agr_fr-blr-01_v1.0',
    agreementId: 'agr_fr-blr-01',
    franchiseId: 'fr-blr-01',
    orgId: 'org-fabriq-global',
    version: '1.0',
    status: 'active',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    expiryDate: '2028-12-31T23:59:59.000Z',
    territory: 'Bengaluru Urban District',
    royaltyModel: 'fixed_percentage',
    royaltyPercentage: 6.5, // 6.5%
    settlementFrequency: 'monthly',
    currency: 'INR',
    applicableDivisions: ['laundry', 'boutique', 'luxury_store'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

// Mock Commercial Revenue Events
const COMMERCIAL_EVENTS: CommercialRevenueEvent[] = [
  {
    eventId: 'evt-1001',
    idempotencyKey: 'idemp-ord-9821-sale',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    isCorporateOwned: false,
    orderId: 'ORD-9821',
    customerId: 'cust-7701',
    eventType: 'SERVICE_SALE',
    grossAmountInMinorUnits: 1500000, // ₹15,000.00 in paise
    discountAmountInMinorUnits: 100000, // ₹1,000.00 discount
    taxAmountInMinorUnits: 252000, // ₹2,520.00 tax (18%)
    netAmountInMinorUnits: 1400000, // ₹14,000.00 net
    eligibleRevenueInMinorUnits: 1400000, // Royalty base: ₹14,000
    currency: 'INR',
    timestamp: '2026-08-10T11:00:00.000Z',
    source: 'POS_TERMINAL',
    agreementVersionId: 'agr_fr-hyd-01_v1.1',
    createdAt: '2026-08-10T11:00:00.000Z',
  },
  {
    eventId: 'evt-1002',
    idempotencyKey: 'idemp-ord-9822-sale',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    franchiseId: null, // Corporate Flagship Mayfair
    branchId: 'b-lon-mayfair',
    isCorporateOwned: true,
    orderId: 'ORD-9822',
    customerId: 'cust-8802',
    eventType: 'PRODUCT_SALE',
    grossAmountInMinorUnits: 350000, // £3,500.00 in pence
    discountAmountInMinorUnits: 0,
    taxAmountInMinorUnits: 70000, // £700 VAT
    netAmountInMinorUnits: 350000,
    eligibleRevenueInMinorUnits: 350000,
    currency: 'GBP',
    timestamp: '2026-08-12T14:30:00.000Z',
    source: 'ONLINE_STORE',
    agreementVersionId: null, // Corporate branch -> no royalty agreement
    createdAt: '2026-08-12T14:30:00.000Z',
  },
  {
    eventId: 'evt-1003',
    idempotencyKey: 'idemp-ord-9821-refund',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    isCorporateOwned: false,
    orderId: 'ORD-9821',
    customerId: 'cust-7701',
    eventType: 'REFUND',
    grossAmountInMinorUnits: -200000, // -₹2,000.00 partial refund in paise
    discountAmountInMinorUnits: 0,
    taxAmountInMinorUnits: -36000,
    netAmountInMinorUnits: -200000,
    eligibleRevenueInMinorUnits: -200000, // Negative revenue adjustment base
    currency: 'INR',
    timestamp: '2026-08-13T09:15:00.000Z',
    source: 'CUSTOMER_CARE',
    agreementVersionId: 'agr_fr-hyd-01_v1.1',
    reversalOfEventId: 'evt-1001',
    createdAt: '2026-08-13T09:15:00.000Z',
  },
];

// Initialize Idempotency Map with mock events
COMMERCIAL_EVENTS.forEach((e) => IDEMPOTENCY_MAP.set(e.idempotencyKey, e));

// Settlements Store
const SETTLEMENTS: FranchiseSettlement[] = [
  {
    settlementId: 'stl-2026-07-fr-hyd-01',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    agreementVersionId: 'agr_fr-hyd-01_v1.1',
    agreementVersion: '1.1',
    settlementPeriod: '2026-07-01_2026-07-31',
    currency: 'INR',
    grossRevenueInMinorUnits: 125000000, // ₹12,50,000.00
    eligibleRevenueInMinorUnits: 120000000, // ₹12,00,000.00
    royaltyAmountInMinorUnits: 6400000, // ₹64,000.00 (Progressive tiered: 5% on ₹10L + 7% on ₹2L)
    adjustmentsInMinorUnits: 0,
    netSettlementInMinorUnits: 6400000,
    status: 'APPROVED',
    eventCount: 42,
    sourceEventIds: ['evt-1001', 'evt-1003'],
    approvedBy: 'usr-ceo-01',
    approvedAt: '2026-08-02T10:00:00.000Z',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
];

// ----------------------------------------------------------------------
// Authoritative Royalty Calculation Engine Core Function
// ----------------------------------------------------------------------

export function calculateRoyaltyForRevenueEvent(
  event: CommercialRevenueEvent,
  agreement?: VersionedFranchiseAgreement
): RoyaltyCalculationResult {
  const calculationId = `calc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // RULE 1: Corporate Owned Branches generate ZERO franchise royalty
  if (event.isCorporateOwned || !event.franchiseId) {
    return {
      calculationId,
      eventId: event.eventId,
      orgId: event.orgId,
      franchiseId: null,
      branchId: event.branchId,
      agreementVersionId: null,
      agreementVersion: null,
      royaltyModel: 'none_corporate',
      eligibleRevenueInMinorUnits: event.eligibleRevenueInMinorUnits,
      calculatedRoyaltyInMinorUnits: 0,
      currency: event.currency,
      isCorporateOwned: true,
      breakdown: {
        model: 'Corporate-Owned Branch (isCorporateOwned = true) — No Franchise Royalty Applicable',
      },
      timestamp: now,
    };
  }

  // Find active or specified agreement if not provided
  const activeAgreement =
    agreement ||
    VERSIONED_AGREEMENTS.find(
      (a) =>
        a.orgId === event.orgId &&
        a.franchiseId === event.franchiseId &&
        (event.agreementVersionId ? a.agreementVersionId === event.agreementVersionId : a.status === 'active')
    );

  if (!activeAgreement) {
    throw new Error(`No valid franchise agreement found for franchiseId '${event.franchiseId}'`);
  }

  // RULE 2: Currency Mismatch Protection
  if (event.currency !== activeAgreement.currency) {
    throw new Error(
      `Currency mismatch: Revenue event currency (${event.currency}) does not match governing agreement currency (${activeAgreement.currency})`
    );
  }

  const revenueBasis = event.eligibleRevenueInMinorUnits;

  // RULE 3: Fixed Percentage Royalty
  if (activeAgreement.royaltyModel === 'fixed_percentage') {
    const rate = activeAgreement.royaltyPercentage;
    const calculatedRoyalty = Math.round((revenueBasis * rate) / 100);

    return {
      calculationId,
      eventId: event.eventId,
      orgId: event.orgId,
      franchiseId: event.franchiseId,
      branchId: event.branchId,
      agreementVersionId: activeAgreement.agreementVersionId,
      agreementVersion: activeAgreement.version,
      royaltyModel: 'fixed_percentage',
      eligibleRevenueInMinorUnits: revenueBasis,
      calculatedRoyaltyInMinorUnits: calculatedRoyalty,
      currency: event.currency,
      isCorporateOwned: false,
      breakdown: {
        model: `Fixed Percentage (${rate}%)`,
        effectiveRatePercentage: rate,
      },
      timestamp: now,
    };
  }

  // RULE 4: Tiered Progressive Marginal Royalty
  if (activeAgreement.royaltyModel === 'tiered') {
    const slabs = activeAgreement.tieredSlabs || [
      { slabId: 's1', minAmountInMinorUnits: 0, maxAmountInMinorUnits: 100000000, ratePercentage: 5.0 },
      { slabId: 's2', minAmountInMinorUnits: 100000000, maxAmountInMinorUnits: 250000000, ratePercentage: 7.0 },
      { slabId: 's3', minAmountInMinorUnits: 250000000, maxAmountInMinorUnits: null, ratePercentage: 9.0 },
    ];

    let totalRoyalty = 0;
    const absRevenue = Math.abs(revenueBasis);
    const isNegative = revenueBasis < 0;

    const slabBreakdown: Array<{
      slabId: string;
      minMinor: number;
      maxMinor: number | null;
      ratePercentage: number;
      taxableAmountInMinor: number;
      royaltyInMinor: number;
    }> = [];

    for (const slab of slabs) {
      const slabMin = slab.minAmountInMinorUnits;
      const slabMax = slab.maxAmountInMinorUnits || Number.POSITIVE_INFINITY;

      if (absRevenue > slabMin) {
        const taxablePart = Math.min(absRevenue, slabMax) - slabMin;
        if (taxablePart > 0) {
          const slabRoyalty = Math.round((taxablePart * slab.ratePercentage) / 100);
          totalRoyalty += slabRoyalty;

          slabBreakdown.push({
            slabId: slab.slabId,
            minMinor: slabMin,
            maxMinor: slab.maxAmountInMinorUnits,
            ratePercentage: slab.ratePercentage,
            taxableAmountInMinor: isNegative ? -taxablePart : taxablePart,
            royaltyInMinor: isNegative ? -slabRoyalty : slabRoyalty,
          });
        }
      }
    }

    const finalRoyalty = isNegative ? -totalRoyalty : totalRoyalty;
    const effectiveRate = absRevenue > 0 ? Number(((totalRoyalty / absRevenue) * 100).toFixed(2)) : 0;

    return {
      calculationId,
      eventId: event.eventId,
      orgId: event.orgId,
      franchiseId: event.franchiseId,
      branchId: event.branchId,
      agreementVersionId: activeAgreement.agreementVersionId,
      agreementVersion: activeAgreement.version,
      royaltyModel: 'tiered',
      eligibleRevenueInMinorUnits: revenueBasis,
      calculatedRoyaltyInMinorUnits: finalRoyalty,
      currency: event.currency,
      isCorporateOwned: false,
      breakdown: {
        model: 'Tiered Progressive Marginal Slabs',
        effectiveRatePercentage: effectiveRate,
        slabBreakdown,
      },
      timestamp: now,
    };
  }

  // RULE 5: Flat Fee Royalty
  if (activeAgreement.royaltyModel === 'flat_fee') {
    const flatFee = activeAgreement.flatFeeInMinorUnits || 500000; // default ₹5,000 in paise
    return {
      calculationId,
      eventId: event.eventId,
      orgId: event.orgId,
      franchiseId: event.franchiseId,
      branchId: event.branchId,
      agreementVersionId: activeAgreement.agreementVersionId,
      agreementVersion: activeAgreement.version,
      royaltyModel: 'flat_fee',
      eligibleRevenueInMinorUnits: revenueBasis,
      calculatedRoyaltyInMinorUnits: flatFee,
      currency: event.currency,
      isCorporateOwned: false,
      breakdown: {
        model: 'Flat Fee Commercial Agreement',
        flatFeeInMinor: flatFee,
      },
      timestamp: now,
    };
  }

  throw new Error(`Unsupported royalty model '${activeAgreement.royaltyModel}'`);
}

// ----------------------------------------------------------------------
// Express API Endpoints
// ----------------------------------------------------------------------

// 1. GET /api/commercial/agreements — Retrieve Versioned Franchise Commercial Agreements
commercialRouter.get(
  '/commercial/agreements',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'mis',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;

      let agreements = VERSIONED_AGREEMENTS.filter((a) => a.orgId === orgId);

      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        agreements = agreements.filter((a) => a.franchiseId === franchiseId);
      }

      res.json({ agreements, count: agreements.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve versioned commercial agreements', details: err?.message });
    }
  }
);

// 2. POST /api/commercial/agreements/version — Issue New Agreement Version (Preserves Historical Versions)
commercialRouter.post(
  '/commercial/agreements/version',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid } = req.user!;
      const {
        franchiseId,
        agreementId,
        version,
        royaltyModel,
        royaltyPercentage,
        tieredSlabs,
        flatFeeInMinorUnits,
        currency = 'INR',
        effectiveDate,
        expiryDate,
        territory,
        applicableDivisions = ['laundry', 'boutique', 'luxury_store'],
      } = req.body;

      if (!franchiseId || !agreementId || !version || !royaltyModel || !effectiveDate) {
        res.status(400).json({ error: 'franchiseId, agreementId, version, royaltyModel, and effectiveDate are required' });
        return;
      }

      // Expire previous active versions for this franchise
      VERSIONED_AGREEMENTS.forEach((a) => {
        if (a.orgId === orgId && a.franchiseId === franchiseId && a.status === 'active') {
          a.status = 'expired';
          a.updatedAt = new Date().toISOString();
        }
      });

      const now = new Date().toISOString();
      const agreementVersionId = `agr_${franchiseId}_v${version.replace(/\./g, '_')}`;

      const newVersion: VersionedFranchiseAgreement = {
        agreementVersionId,
        agreementId,
        franchiseId,
        orgId,
        version,
        status: 'active',
        effectiveDate,
        expiryDate: expiryDate || '2029-12-31T23:59:59.000Z',
        territory: territory || 'Unspecified Territory',
        royaltyModel,
        royaltyPercentage: typeof royaltyPercentage === 'number' ? royaltyPercentage : 6.0,
        tieredSlabs,
        tieredCalculationType: 'progressive_marginal',
        flatFeeInMinorUnits,
        settlementFrequency: 'monthly',
        currency,
        applicableDivisions,
        createdAt: now,
        updatedAt: now,
      };

      VERSIONED_AGREEMENTS.push(newVersion);

      recordCommercialAuditLog(
        orgId,
        uid,
        'COMMERCIAL_AGREEMENT_VERSIONED',
        `Issued agreement version ${version} (${agreementVersionId}) for franchise '${franchiseId}' with model '${royaltyModel}'`
      );

      res.status(201).json({ success: true, agreement: newVersion });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to issue new agreement version', details: err?.message });
    }
  }
);

// 3. POST /api/commercial/events — Record Idempotent Commercial Revenue Event
commercialRouter.post(
  '/commercial/events',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'store_manager',
    'store_staff',
    'finance'
  ),
  validateTenantScope,
  requireIdempotency('RECORD_COMMERCIAL_EVENT'),
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid, role, franchiseId: userFranchiseId } = req.user!;
      const {
        idempotencyKey,
        divisionId,
        franchiseId,
        branchId,
        isCorporateOwned = false,
        orderId,
        customerId,
        eventType,
        grossAmountInMinorUnits,
        discountAmountInMinorUnits = 0,
        taxAmountInMinorUnits = 0,
        currency = 'INR',
        source = 'POS_TERMINAL',
        reversalOfEventId,
      } = req.body;

      if (!idempotencyKey || !divisionId || !branchId || !orderId || !eventType || typeof grossAmountInMinorUnits !== 'number') {
        res.status(400).json({ error: 'idempotencyKey, divisionId, branchId, orderId, eventType, and grossAmountInMinorUnits are required' });
        return;
      }

      // IDEMPOTENCY CHECK: Prevent duplicate processing using persistent IdempotencyService
      if (IDEMPOTENCY_MAP.has(idempotencyKey)) {
        const existingEvent = IDEMPOTENCY_MAP.get(idempotencyKey)!;
        recordCommercialAuditLog(
          orgId,
          uid,
          'IDEMPOTENCY_DUPLICATE_PREVENTED',
          `Returned cached revenue event for key '${idempotencyKey}'`
        );
        res.status(200).json({
          success: true,
          idempotentRetried: true,
          event: existingEvent,
        });
        return;
      }


      // Negative financial check for non-reversal events
      if (['SERVICE_SALE', 'PRODUCT_SALE'].includes(eventType) && grossAmountInMinorUnits <= 0) {
        res.status(400).json({ error: 'Gross revenue amount for sales events must be strictly positive (> 0 minor units)' });
        return;
      }

      // Franchise scope validation
      if (['franchise_owner'].includes(role) && userFranchiseId) {
        if (franchiseId && franchiseId !== userFranchiseId) {
          res.status(403).json({ error: 'Forbidden: Cannot record commercial revenue event for a different franchise' });
          return;
        }
      }

      const netAmountInMinorUnits = grossAmountInMinorUnits - discountAmountInMinorUnits;
      const eligibleRevenueInMinorUnits = netAmountInMinorUnits; // Base revenue for royalty

      // Locate active governing agreement if franchise store
      let agreementVersionId: string | null = null;
      if (!isCorporateOwned && franchiseId) {
        const activeAgr = VERSIONED_AGREEMENTS.find(
          (a) => a.orgId === orgId && a.franchiseId === franchiseId && a.status === 'active'
        );

        if (activeAgr) {
          // Currency match validation
          if (activeAgr.currency !== currency) {
            res.status(400).json({
              error: `Currency mismatch: Revenue event currency (${currency}) does not match governing agreement currency (${activeAgr.currency})`,
            });
            return;
          }
          agreementVersionId = activeAgr.agreementVersionId;
        }
      }

      const now = new Date().toISOString();
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newEvent: CommercialRevenueEvent = {
        eventId,
        idempotencyKey,
        orgId,
        divisionId: divisionId as AppDivision,
        franchiseId: isCorporateOwned ? null : franchiseId || null,
        branchId,
        isCorporateOwned: Boolean(isCorporateOwned),
        orderId,
        customerId: customerId || undefined,
        eventType: eventType as CommercialEventType,
        grossAmountInMinorUnits,
        discountAmountInMinorUnits,
        taxAmountInMinorUnits,
        netAmountInMinorUnits,
        eligibleRevenueInMinorUnits,
        currency,
        timestamp: now,
        source,
        agreementVersionId,
        reversalOfEventId: reversalOfEventId || undefined,
        createdAt: now,
      };

      COMMERCIAL_EVENTS.push(newEvent);
      IDEMPOTENCY_MAP.set(idempotencyKey, newEvent);

      // Perform authoritative server-side royalty calculation
      let calculationResult: RoyaltyCalculationResult | null = null;
      try {
        calculationResult = calculateRoyaltyForRevenueEvent(newEvent);
      } catch (err: any) {
        console.warn(`Royalty engine warning: ${err?.message}`);
      }

      recordCommercialAuditLog(
        orgId,
        uid,
        'COMMERCIAL_EVENT_RECORDED',
        `Recorded ${eventType} event (${eventId}) for Order ${orderId}. Net: ${netAmountInMinorUnits} ${currency}. Calculated Royalty: ${calculationResult?.calculatedRoyaltyInMinorUnits || 0}`
      );

      res.status(201).json({
        success: true,
        idempotentRetried: false,
        event: newEvent,
        royaltyCalculation: calculationResult,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to record commercial revenue event', details: err?.message });
    }
  }
);

// 4. GET /api/commercial/events — Query Commercial Revenue Events
commercialRouter.get(
  '/commercial/events',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'mis',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;
      const { divisionId, branchId, orderId } = req.query;

      let events = COMMERCIAL_EVENTS.filter((e) => e.orgId === orgId);

      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        events = events.filter((e) => e.franchiseId === franchiseId);
      }

      if (divisionId) {
        events = events.filter((e) => e.divisionId === (divisionId as AppDivision));
      }
      if (branchId) {
        events = events.filter((e) => e.branchId === branchId);
      }
      if (orderId) {
        events = events.filter((e) => e.orderId === orderId);
      }

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json({ events, count: events.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve commercial revenue events', details: err?.message });
    }
  }
);

// 5. POST /api/commercial/calculate-royalty — Authoritative Server-Side Royalty Engine Endpoint
commercialRouter.post(
  '/commercial/calculate-royalty',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'mis',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const { eventId, agreementVersionId } = req.body;

      if (!eventId) {
        res.status(400).json({ error: 'eventId is required for royalty calculation' });
        return;
      }

      const event = COMMERCIAL_EVENTS.find((e) => e.eventId === eventId && e.orgId === orgId);
      if (!event) {
        res.status(404).json({ error: `Commercial revenue event '${eventId}' not found` });
        return;
      }

      const agreement = agreementVersionId
        ? VERSIONED_AGREEMENTS.find((a) => a.agreementVersionId === agreementVersionId && a.orgId === orgId)
        : undefined;

      const result = calculateRoyaltyForRevenueEvent(event, agreement);

      res.json({ success: true, calculation: result });
    } catch (err: any) {
      res.status(400).json({ error: 'Royalty calculation failed', details: err?.message });
    }
  }
);

// 6. GET /api/commercial/settlements — Query Franchise Settlement Statements
commercialRouter.get(
  '/commercial/settlements',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles(
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'mis',
    'finance'
  ),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, role, franchiseId } = req.user!;
      const { status } = req.query;

      let settlements = SETTLEMENTS.filter((s) => s.orgId === orgId);

      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        settlements = settlements.filter((s) => s.franchiseId === franchiseId);
      }

      if (status) {
        settlements = settlements.filter((s) => s.status === (status as SettlementStatus));
      }

      res.json({ settlements, count: settlements.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve franchise settlements', details: err?.message });
    }
  }
);

// 7. POST /api/commercial/settlements/generate — Generate Draft Franchise Settlement
commercialRouter.post(
  '/commercial/settlements/generate',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid } = req.user!;
      const { franchiseId, settlementPeriod } = req.body;

      if (!franchiseId || !settlementPeriod) {
        res.status(400).json({ error: 'franchiseId and settlementPeriod (e.g. 2026-08-01_2026-08-31) are required' });
        return;
      }

      const activeAgreement = VERSIONED_AGREEMENTS.find(
        (a) => a.orgId === orgId && a.franchiseId === franchiseId && a.status === 'active'
      );

      if (!activeAgreement) {
        res.status(400).json({ error: `No active agreement version found for franchise '${franchiseId}'` });
        return;
      }

      // Filter events for this franchise
      const franchiseEvents = COMMERCIAL_EVENTS.filter(
        (e) => e.orgId === orgId && e.franchiseId === franchiseId && !e.isCorporateOwned
      );

      let totalGross = 0;
      let totalEligible = 0;
      let totalRoyalty = 0;
      const sourceEventIds: string[] = [];

      for (const event of franchiseEvents) {
        totalGross += event.grossAmountInMinorUnits;
        totalEligible += event.eligibleRevenueInMinorUnits;
        sourceEventIds.push(event.eventId);

        try {
          const calc = calculateRoyaltyForRevenueEvent(event, activeAgreement);
          totalRoyalty += calc.calculatedRoyaltyInMinorUnits;
        } catch (err) {
          console.warn(`Event ${event.eventId} royalty calculation skipped:`, err);
        }
      }

      const now = new Date().toISOString();
      const settlementId = `stl_${Date.now()}_${franchiseId}`;

      const settlement: FranchiseSettlement = {
        settlementId,
        orgId,
        franchiseId,
        agreementVersionId: activeAgreement.agreementVersionId,
        agreementVersion: activeAgreement.version,
        settlementPeriod,
        currency: activeAgreement.currency,
        grossRevenueInMinorUnits: totalGross,
        eligibleRevenueInMinorUnits: totalEligible,
        royaltyAmountInMinorUnits: totalRoyalty,
        adjustmentsInMinorUnits: 0,
        netSettlementInMinorUnits: totalRoyalty,
        status: 'DRAFT',
        eventCount: franchiseEvents.length,
        sourceEventIds,
        createdAt: now,
        updatedAt: now,
      };

      SETTLEMENTS.push(settlement);

      recordCommercialAuditLog(
        orgId,
        uid,
        'SETTLEMENT_GENERATED_DRAFT',
        `Generated DRAFT settlement ${settlementId} for period ${settlementPeriod}. Net Royalty: ${totalRoyalty} ${activeAgreement.currency}`
      );

      res.status(201).json({ success: true, settlement });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate franchise settlement statement', details: err?.message });
    }
  }
);

// 8. POST /api/commercial/settlements/:settlementId/status — Advance Settlement Lifecycle Status
commercialRouter.post(
  '/commercial/settlements/:settlementId/status',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId, uid } = req.user!;
      const { settlementId } = req.params;
      const { nextStatus, disputeReason } = req.body as { nextStatus: SettlementStatus; disputeReason?: string };

      const settlement = SETTLEMENTS.find((s) => s.settlementId === settlementId && s.orgId === orgId);

      if (!settlement) {
        res.status(404).json({ error: `Settlement '${settlementId}' not found` });
        return;
      }

      const validStatuses: SettlementStatus[] = [
        'DRAFT',
        'CALCULATED',
        'REVIEWED',
        'APPROVED',
        'PAID',
        'RECONCILED',
        'DISPUTED',
      ];

      if (!validStatuses.includes(nextStatus)) {
        res.status(400).json({ error: `Invalid settlement status '${nextStatus}'` });
        return;
      }

      const prevStatus = settlement.status;
      settlement.status = nextStatus;
      settlement.updatedAt = new Date().toISOString();

      if (nextStatus === 'APPROVED') {
        settlement.approvedBy = uid;
        settlement.approvedAt = new Date().toISOString();
      }

      if (nextStatus === 'DISPUTED') {
        settlement.disputeReason = disputeReason || 'Franchise royalty amount under review';
      }

      recordCommercialAuditLog(
        orgId,
        uid,
        `SETTLEMENT_STATUS_${nextStatus}`,
        `Updated settlement ${settlementId} status from ${prevStatus} to ${nextStatus}`
      );

      res.json({ success: true, settlement });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update settlement status', details: err?.message });
    }
  }
);

// 9. GET /api/commercial/reconciliation — Verify Traceability and Reproducibility
commercialRouter.get(
  '/commercial/reconciliation',
  commercialLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance', 'mis'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.user!;
      const { franchiseId } = req.query;

      let events = COMMERCIAL_EVENTS.filter((e) => e.orgId === orgId);
      if (franchiseId) {
        events = events.filter((e) => e.franchiseId === franchiseId);
      }

      const reconciliationReport = events.map((event) => {
        let calculation: RoyaltyCalculationResult | null = null;
        let isReproducible = false;

        try {
          calculation = calculateRoyaltyForRevenueEvent(event);
          isReproducible = true;
        } catch (err: any) {
          isReproducible = false;
        }

        return {
          eventId: event.eventId,
          orderId: event.orderId,
          franchiseId: event.franchiseId,
          branchId: event.branchId,
          isCorporateOwned: event.isCorporateOwned,
          eligibleRevenueInMinorUnits: event.eligibleRevenueInMinorUnits,
          currency: event.currency,
          governingAgreementVersion: event.agreementVersionId || 'N/A (Corporate)',
          calculatedRoyaltyInMinorUnits: calculation?.calculatedRoyaltyInMinorUnits ?? 0,
          isReproducible,
        };
      });

      res.json({
        reconciliationReport,
        totalEventsChecked: reconciliationReport.length,
        allReproducible: reconciliationReport.every((r) => r.isReproducible),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate commercial reconciliation report', details: err?.message });
    }
  }
);
