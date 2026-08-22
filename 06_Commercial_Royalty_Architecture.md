# 06. FabriQ Commercial & Royalty Architecture (Phase 2C)

## Executive Summary
The FabriQ Commercial & Royalty Engine is an enterprise-grade financial calculation and settlement foundation. It decouples commercial revenue transactions from underlying store operations and inventory mechanics, providing deterministic, version-controlled royalty calculation and settlement capabilities across all FabriQ operating divisions (`FabriQ AI`, `FabriQ Boutique`, `FabriQ Luxury Store`).

---

## 1. Commercial Event Model
All order transactions, services, retail sales, returns, and adjustments produce normalized, auditable `CommercialRevenueEvent` records:

```typescript
export type CommercialEventType =
  | 'SERVICE_SALE'
  | 'PRODUCT_SALE'
  | 'RETURN'
  | 'REFUND'
  | 'DISCOUNT'
  | 'TAX'
  | 'DELIVERY_FEE'
  | 'OTHER_CHARGE';

export interface CommercialRevenueEvent {
  eventId: string;
  idempotencyKey: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId: string | null;
  branchId: string;
  isCorporateOwned: boolean;
  orderId: string;
  customerId?: string;
  eventType: CommercialEventType;
  grossAmountInMinorUnits: number;
  discountAmountInMinorUnits: number;
  taxAmountInMinorUnits: number;
  netAmountInMinorUnits: number;
  eligibleRevenueInMinorUnits: number;
  currency: string;
  timestamp: string;
  source: string;
  agreementVersionId?: string | null;
  reversalOfEventId?: string;
  createdAt: string;
}
```

---

## 2. Integer Minor Units & Money Precision
To prevent dangerous floating-point representation bugs in authoritative financial ledgers:
- **INR:** Integer paise ($1 \text{ INR} = 100 \text{ paise}$). E.g., ₹25,000.00 is stored as `2500000`.
- **USD / GBP / EUR:** Integer minor units (cents / pence). E.g., $500.00 is stored as `50000`.
- **Rounding:** Explicit `Math.round` integer arithmetic applied server-side for percentage royalty calculations.

---

## 3. Versioned Commercial Agreement Terms
Commercial terms are versioned under `VersionedFranchiseAgreement` (`v1.0`, `v1.1`, `v2.0`). 
- **Historical Audit Integrity:** Historical revenue events retain a reference to the `agreementVersionId` that governed them at the time of execution.
- **Issuing New Versions:** When a new agreement version is issued, prior active versions are marked as `expired`, but historical transactions remain linked to their original governing version.

---

## 4. Royalty Models & Deterministic Calculation Rules

### A. Corporate Branch Exemption
$$\text{If } \text{isCorporateOwned} = \text{true} \lor \text{franchiseId} = \text{null} \implies \text{Royalty} = 0$$
Corporate flagship branches generate zero franchise royalty liability.

### B. Fixed Percentage Model
$$\text{CalculatedRoyalty} = \text{Math.round}\left(\frac{\text{EligibleRevenueInMinorUnits} \times \text{RoyaltyPercentage}}{100}\right)$$

### C. Progressive Marginal Tiered Model (Explicitly Defined)
The engine applies a progressive marginal slab structure (similar to progressive income tax brackets):
- **Slab 1 (₹0 – ₹10 Lakhs / 0 to 100,000,000 paise):** 5.0%
- **Slab 2 (₹10 Lakhs – ₹25 Lakhs / 100,000,000 to 250,000,000 paise):** 7.0%
- **Slab 3 (₹25 Lakhs+ / 250,000,000+ paise):** 9.0%

For revenue crossing slab boundaries, the rate applies **only** to the marginal portion falling within each slab range.

### D. Flat Fee Model
Fixed period or event charge `flatFeeInMinorUnits` independent of revenue volume.

---

## 5. Currency Mismatch Protection
Every revenue event specifies an explicit `currency` (`INR`, `USD`, `GBP`, `EUR`). If a revenue event currency does not match its governing agreement currency, the engine strictly rejects the transaction with a `400 Bad Request` ("Currency mismatch between revenue event and governing agreement").

---

## 6. Idempotency & Reversals
- **Idempotency Map (`IDEMPOTENCY_MAP`):** Request retries matching an existing `idempotencyKey` return the original cached transaction without duplicating revenue records or royalty calculations.
- **Compensating Reversals:** Refunds and returns emit new `REFUND` / `RETURN` events with negative minor unit amounts (`grossAmountInMinorUnits < 0`). The original sale record is preserved for audit immutability.

---

## 7. Settlement Lifecycle Workflow
Settlement statements track period totals and advance through explicit states:
$$\text{DRAFT} \longrightarrow \text{CALCULATED} \longrightarrow \text{REVIEWED} \longrightarrow \text{APPROVED} \longrightarrow \text{PAID} \longrightarrow \text{RECONCILED}$$
*(Or \text{DISPUTED} if under review).*

---

## 8. Security & RBAC
Endpoints (`/api/commercial/*`) are protected by the Phase 1.1 Zero-Trust pipeline (`authenticateFirebaseToken` $\rightarrow$ `requireRoles` $\rightarrow$ `validateTenantScope` $\rightarrow$ `Rate Limiting`).
- Client-supplied royalty rates, amounts, or franchise identifiers are never trusted. All calculations occur server-side.
