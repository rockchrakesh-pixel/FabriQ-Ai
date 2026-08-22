import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { FranchiseEntity, FranchiseAgreement, BranchEntity } from '../../src/types';

export const franchiseRouter = Router();

const franchiseLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 30 });

// In-memory data store for initial franchise entities, agreements, and branch relationships
const MOCK_FRANCHISES: FranchiseEntity[] = [
  {
    franchiseId: 'fr-hyd-01',
    orgId: 'org-fabriq-global',
    franchiseName: 'FabriQ Jubilee & Secunderabad Atelier Franchise',
    legalEntityName: 'Deccan Luxury Retail & Fabric Care Pvt Ltd',
    ownerName: 'Dr. Siddharth Singhania',
    ownerEmail: 'siddharth@fabriq-deccan.com',
    ownerPhone: '+91 98490 11223',
    territory: 'Hyderabad North & Central (Secunderabad, Bowenpally, Jubilee Hills)',
    country: 'India',
    stateRegion: 'Telangana',
    city: 'Hyderabad',
    status: 'active',
    agreementRefId: 'agr-2026-v1.2',
    agreementStartDate: '2025-01-01',
    agreementEndDate: '2030-12-31',
    operatingDivisions: ['laundry', 'boutique', 'luxury_store'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T04:00:00.000Z',
  },
  {
    franchiseId: 'fr-blr-01',
    orgId: 'org-fabriq-global',
    franchiseName: 'FabriQ Silicon Valley Atelier Franchise',
    legalEntityName: 'Bangalore Couture Care & Retail LLP',
    ownerName: 'Vikramaditya Rao',
    ownerEmail: 'vikram@fabriq-blr.com',
    ownerPhone: '+91 99887 11223',
    territory: 'Bengaluru East (Indiranagar, HSR Layout, Whitefield)',
    country: 'India',
    stateRegion: 'Karnataka',
    city: 'Bengaluru',
    status: 'active',
    agreementRefId: 'agr-blr-2025-v1.0',
    agreementStartDate: '2025-06-01',
    agreementEndDate: '2030-05-31',
    operatingDivisions: ['laundry', 'luxury_store'],
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
  },
];

const MOCK_AGREEMENTS: FranchiseAgreement[] = [
  {
    agreementId: 'agr-2026-v1.2',
    franchiseId: 'fr-hyd-01',
    orgId: 'org-fabriq-global',
    status: 'active',
    effectiveDate: '2025-01-01',
    expiryDate: '2030-12-31',
    territory: 'Hyderabad North & Central',
    royaltyModel: 'fixed_percentage',
    royaltyPercentage: 8.5,
    fixedFee: 50000,
    settlementFrequency: 'monthly',
    currency: 'INR',
    paymentTerms: 'Net 15 Days after month end',
    version: '1.2',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    agreementId: 'agr-blr-2025-v1.0',
    franchiseId: 'fr-blr-01',
    orgId: 'org-fabriq-global',
    status: 'active',
    effectiveDate: '2025-06-01',
    expiryDate: '2030-05-31',
    territory: 'Bengaluru East',
    royaltyModel: 'fixed_percentage',
    royaltyPercentage: 8.0,
    fixedFee: 45000,
    settlementFrequency: 'monthly',
    currency: 'INR',
    paymentTerms: 'Net 15 Days after month end',
    version: '1.0',
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
  },
];

const MOCK_BRANCHES: BranchEntity[] = [
  {
    branchId: 'b-hyd-bowenpally',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    divisionIds: ['laundry', 'boutique', 'luxury_store'],
    name: 'Bowenpally Care Atelier',
    city: 'Secunderabad',
    address: 'Near Diamond Point, Bowenpally, Secunderabad 500011',
    status: 'active',
    isCorporateOwned: false,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    branchId: 'b-hyd-suchitra',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    divisionIds: ['laundry', 'luxury_store'],
    name: 'Suchitra Junction Lounge',
    city: 'Hyderabad',
    address: 'Suchitra Junction, Medchal Highway 500067',
    status: 'active',
    isCorporateOwned: false,
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    branchId: 'b-hyd-kompally',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    divisionIds: ['laundry', 'boutique'],
    name: 'Kompally Luxury Studio',
    city: 'Hyderabad',
    address: 'Main Road, Kompally, Hyderabad 500100',
    status: 'active',
    isCorporateOwned: false,
    createdAt: '2025-05-10T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    branchId: 'b-lon-mayfair',
    orgId: 'org-fabriq-global',
    franchiseId: null, // Corporate Owned Flagship
    divisionIds: ['laundry', 'boutique', 'luxury_store'],
    name: 'Mayfair Flagship Atelier (London)',
    city: 'London',
    address: '14 Mount Street, Mayfair, London W1K 2RF',
    status: 'active',
    isCorporateOwned: true,
    createdAt: '2024-11-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

const AUDIT_LOGS: Array<{ id: string; orgId: string; userId: string; action: string; details: string; timestamp: string }> = [];

// Helper to record immutable audit log
function recordAuditLog(orgId: string, userId: string, action: string, details: string) {
  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orgId,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  AUDIT_LOGS.push(entry);
  console.log(`[Enterprise Audit Log] ${action}: ${details} (User: ${userId})`);
  return entry;
}

// 1. GET /api/franchise — List Franchises within User Scope
franchiseRouter.get(
  '/franchise',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'mis', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { role, franchiseId, orgId } = req.user!;

      let result = MOCK_FRANCHISES.filter((f) => f.orgId === orgId);

      // Franchise owners and regional managers are restricted to their specific franchise
      if (['franchise_owner', 'regional_manager'].includes(role) && franchiseId) {
        result = result.filter((f) => f.franchiseId === franchiseId);
      }

      res.json({ franchises: result });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve franchise list', details: err?.message });
    }
  }
);

// 2. GET /api/franchise/:franchiseId — Get Single Franchise Profile + Active Agreement + Branches
franchiseRouter.get(
  '/franchise/:franchiseId',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'mis', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const franchise = MOCK_FRANCHISES.find((f) => f.franchiseId === franchiseId);

      if (!franchise) {
        res.status(404).json({ error: `Franchise '${franchiseId}' not found` });
        return;
      }

      const activeAgreement = MOCK_AGREEMENTS.find(
        (a) => a.franchiseId === franchiseId && a.status === 'active'
      ) || null;

      const branches = MOCK_BRANCHES.filter((b) => b.franchiseId === franchiseId);

      res.json({
        franchise,
        activeAgreement,
        branches,
        branchCount: branches.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve franchise details', details: err?.message });
    }
  }
);

// 3. POST /api/franchise — Create New Franchise Entity (Corporate Admin Only)
franchiseRouter.post(
  '/franchise',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const {
        franchiseName,
        legalEntityName,
        ownerName,
        ownerEmail,
        ownerPhone,
        territory,
        country = 'India',
        stateRegion,
        city,
        operatingDivisions = ['laundry'],
      } = req.body;

      if (!franchiseName || !ownerEmail || !city) {
        res.status(400).json({ error: 'franchiseName, ownerEmail, and city are required' });
        return;
      }

      const franchiseId = `fr-${city.toLowerCase().substring(0, 3)}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const newFranchise: FranchiseEntity = {
        franchiseId,
        orgId: req.user?.orgId || 'org-fabriq-global',
        franchiseName,
        legalEntityName: legalEntityName || franchiseName,
        ownerName: ownerName || 'Pending Designation',
        ownerEmail,
        ownerPhone: ownerPhone || '',
        territory: territory || city,
        country,
        stateRegion: stateRegion || '',
        city,
        status: 'pending',
        operatingDivisions,
        createdAt: now,
        updatedAt: now,
      };

      MOCK_FRANCHISES.push(newFranchise);

      recordAuditLog(
        newFranchise.orgId,
        req.user?.uid || 'system',
        'FRANCHISE_CREATED',
        `Created franchise '${franchiseName}' (${franchiseId}) for owner ${ownerEmail}`
      );

      res.status(201).json({ franchise: newFranchise });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create franchise entity', details: err?.message });
    }
  }
);

// 4. PUT /api/franchise/:franchiseId — Update Franchise Profile
franchiseRouter.put(
  '/franchise/:franchiseId',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const idx = MOCK_FRANCHISES.findIndex((f) => f.franchiseId === franchiseId);

      if (idx === -1) {
        res.status(404).json({ error: `Franchise '${franchiseId}' not found` });
        return;
      }

      const existing = MOCK_FRANCHISES[idx];

      // Prevent unauthorized tenant identifier tampering
      if (req.body.orgId && req.body.orgId !== existing.orgId) {
        res.status(403).json({ error: 'Forbidden: Cannot modify organization ID of existing franchise' });
        return;
      }

      const updated: FranchiseEntity = {
        ...existing,
        ...req.body,
        franchiseId: existing.franchiseId, // Immutable
        orgId: existing.orgId, // Immutable
        updatedAt: new Date().toISOString(),
      };

      MOCK_FRANCHISES[idx] = updated;

      recordAuditLog(
        existing.orgId,
        req.user?.uid || 'system',
        'FRANCHISE_UPDATED',
        `Updated franchise profile for '${franchiseId}'`
      );

      res.json({ franchise: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update franchise entity', details: err?.message });
    }
  }
);

// 5. POST /api/franchise/:franchiseId/agreements — Versioned Franchise Agreement Creation
franchiseRouter.post(
  '/franchise/:franchiseId/agreements',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const franchise = MOCK_FRANCHISES.find((f) => f.franchiseId === franchiseId);

      if (!franchise) {
        res.status(404).json({ error: `Franchise '${franchiseId}' not found` });
        return;
      }

      const {
        effectiveDate,
        expiryDate,
        territory,
        royaltyModel = 'fixed_percentage',
        royaltyPercentage = 8.0,
        fixedFee = 50000,
        settlementFrequency = 'monthly',
        currency = 'INR',
        paymentTerms = 'Net 15 Days',
        version = '1.0',
      } = req.body;

      // Retire existing active agreements
      MOCK_AGREEMENTS.forEach((a) => {
        if (a.franchiseId === franchiseId && a.status === 'active') {
          a.status = 'renewed';
          a.updatedAt = new Date().toISOString();
        }
      });

      const agreementId = `agr-${franchiseId}-${Date.now()}`;
      const now = new Date().toISOString();

      const newAgreement: FranchiseAgreement = {
        agreementId,
        franchiseId,
        orgId: franchise.orgId,
        status: 'active',
        effectiveDate: effectiveDate || now.substring(0, 10),
        expiryDate: expiryDate || '2031-12-31',
        territory: territory || franchise.territory,
        royaltyModel,
        royaltyPercentage,
        fixedFee,
        settlementFrequency,
        currency,
        paymentTerms,
        version,
        createdAt: now,
        updatedAt: now,
      };

      MOCK_AGREEMENTS.push(newAgreement);

      // Update franchise active agreement reference
      franchise.agreementRefId = agreementId;
      franchise.agreementStartDate = newAgreement.effectiveDate;
      franchise.agreementEndDate = newAgreement.expiryDate;
      franchise.status = 'active';

      recordAuditLog(
        franchise.orgId,
        req.user?.uid || 'system',
        'AGREEMENT_CREATED',
        `Created Agreement version ${version} (${agreementId}) for Franchise '${franchiseId}'`
      );

      res.status(201).json({ agreement: newAgreement, franchise });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create franchise agreement', details: err?.message });
    }
  }
);

// 6. GET /api/franchise/:franchiseId/agreements — View Version History
franchiseRouter.get(
  '/franchise/:franchiseId/agreements',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'finance'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const agreements = MOCK_AGREEMENTS.filter((a) => a.franchiseId === franchiseId);

      res.json({ agreements });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve agreement history', details: err?.message });
    }
  }
);

// 7. POST /api/franchise/:franchiseId/branches/assign — Assign Branch to Franchise
franchiseRouter.post(
  '/franchise/:franchiseId/branches/assign',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const { branchId } = req.body;

      const franchise = MOCK_FRANCHISES.find((f) => f.franchiseId === franchiseId);
      if (!franchise) {
        res.status(404).json({ error: `Franchise '${franchiseId}' not found` });
        return;
      }

      let branch = MOCK_BRANCHES.find((b) => b.branchId === branchId);

      if (!branch) {
        res.status(404).json({ error: `Branch '${branchId}' not found` });
        return;
      }

      branch.franchiseId = franchiseId;
      branch.isCorporateOwned = false;
      branch.updatedAt = new Date().toISOString();

      recordAuditLog(
        franchise.orgId,
        req.user?.uid || 'system',
        'BRANCH_ASSIGNED_TO_FRANCHISE',
        `Assigned Branch '${branchId}' to Franchise '${franchiseId}'`
      );

      res.json({ success: true, branch });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to assign branch to franchise', details: err?.message });
    }
  }
);

// 8. POST /api/franchise/:franchiseId/branches/remove — Remove Branch Assignment (Make Corporate)
franchiseRouter.post(
  '/franchise/:franchiseId/branches/remove',
  franchiseLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner'),
  validateTenantScope,
  async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const { branchId } = req.body;

      const branch = MOCK_BRANCHES.find((b) => b.branchId === branchId);

      if (!branch) {
        res.status(404).json({ error: `Branch '${branchId}' not found` });
        return;
      }

      branch.franchiseId = null;
      branch.isCorporateOwned = true;
      branch.updatedAt = new Date().toISOString();

      recordAuditLog(
        branch.orgId,
        req.user?.uid || 'system',
        'BRANCH_REMOVED_FROM_FRANCHISE',
        `Removed Branch '${branchId}' from Franchise '${franchiseId}' (Reverted to Corporate Owned)`
      );

      res.json({ success: true, branch });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to remove branch assignment', details: err?.message });
    }
  }
);
