# 13. FabriQ Changelog & Architecture Audit Log

## [Phase 2D] - 2026-08-16
### Added
- **Enterprise Finance Express Router (`/server/routes/finance.ts`):** Implemented endpoints for revenue ledger entries, settlement state transitions, payment reconciliations, controlled refunds/adjustments, accounting period controls, franchise statements, branch reports, division reporting, and audit trails.
- **Controlled Enterprise Revenue Ledger (`RevenueLedgerEntry`):** Append-only recognized revenue record storing integer minor currency units, discounts, taxes, and net recognized revenue.
- **Settlement State Transition Matrix:** Validated settlement state flow: `DRAFT` ➔ `CALCULATED` ➔ `REVIEW_REQUIRED` ➔ `APPROVED` ➔ `READY_FOR_PAYOUT` ➔ `PAID` ➔ `RECONCILED` (with support for `REJECTED`, `VOID`, `REVERSED`).
- **Payment Reconciliation Foundation (`PaymentReconciliationRecord`):** Authoritative server-side verification matching Razorpay/gateway payment references against order expectations, flagging discrepancies as `MISMATCH`.
- **Refund & Adjustment Controls (`FinancialRefundAdjustment`):** Rejects refunds exceeding original net transaction revenue limit or posted in CLOSED accounting periods. Large refunds (> ₹10,000) trigger executive approval workflow.
- **Financial Period Controls (`FinancialPeriod`):** Enforces `OPEN`, `LOCKED`, and `CLOSED` states. Closed periods prevent retro-active ledger mutations.
- **Enterprise Finance UI (`/src/components/finance/EnterpriseFinanceDashboard.tsx`):** Built interactive financial dashboard with overview KPI cards, revenue ledger table, settlement state manager, payment reconciliation modal, refund request form, accounting period controls, and audit trail viewer.
- **Firestore Security Rules (`firestore.rules`):** Secured `/revenue_ledger` (immutable write-once), `/payment_reconciliations`, `/financial_refunds`, `/financial_periods`, `/financial_audit_logs`, and `/franchise_financial_statements`.
- **Automated Security & Integrity Test Suite:** Added test scenarios 47–74 in `/server/tests/securityVerification.ts` (74/74 tests passing with 100% green compliance).
- **Documentation:** Created `/docs/07_Enterprise_Finance_Architecture.md` and updated core system docs.

## [Phase 2C] - 2026-08-15
### Added
- **Commercial & Royalty Express Router (`/server/routes/commercial.ts`):** Implemented endpoints for versioned commercial agreements, normalized revenue event recording, server-authoritative royalty calculation, draft settlement generation, settlement status lifecycle management, and reconciliation reporting.
- **Server-Authoritative Royalty Calculation Engine:**
  - Corporate branch zero royalty exemption (`isCorporateOwned: true`).
  - Fixed percentage calculation model.
  - Progressive marginal tiered slab model (`₹0–₹10L @ 5%`, `₹10L–₹25L @ 7%`, `₹25L+ @ 9%`).
  - Flat fee per settlement period model.
- **Normalized Revenue Event Ledger (`CommercialRevenueEvent`):** Multi-division commercial event stream tracking `SERVICE_SALE`, `PRODUCT_SALE`, `REFUND`, `RETURN`, `DISCOUNT`, `TAX`, `DELIVERY_FEE`.
- **Financial Minor Unit Precision:** Integer minor units (paise for INR, cents for USD/EUR/GBP) to eliminate floating-point rounding errors.
- **Idempotency & Reversal Protection:** Request retries with matching `idempotencyKey` return cached transactions; refunds/returns emit compensating negative revenue events without mutating original sales.
- **Currency Mismatch Prevention:** Rejects events where transaction currency does not match governing agreement currency.
- **Firestore Security Rules (`firestore.rules`):** Secured `/commercial_agreements`, `/commercial_events` (immutable, creation allowed, update/delete denied), and `/franchise_settlements`.
- **Franchise Commercial UI (`src/components/franchise/FranchiseCommercialDashboard.tsx`):** Interactive UI featuring agreement version manager, revenue event stream, server royalty simulator, and settlement statement lifecycle workflow.
- **Documentation & Test Verification:** Created `/docs/06_Commercial_Royalty_Architecture.md`, updated all enterprise docs, and added automated test scenarios 31–46 in `/server/tests/securityVerification.ts` (46/46 tests passing).

## [Phase 2B] - 2026-08-15
### Added
- **Enterprise Shared Inventory Router (`/server/routes/inventory.ts`):** Implemented endpoints for master catalog items, warehouses, stock querying, auditable stock movements, inter-facility transfers, reorder triggers, supplier management, and reorder rule configuration.
- **Auditable Stock Movement Ledger (`StockMovementLedger`):** Multi-tenant immutable movement ledger tracking `RECEIPT`, `TRANSFER_IN`, `TRANSFER_OUT`, `CONSUMPTION`, `SALE`, `RETURN`, `DAMAGE`, `ADJUSTMENT`, `OPENING_BALANCE`.
- **Three-Tier Ownership Model:** Corporate Warehouse (`warehouseId`), Franchise Branch (`franchiseId` + `branchId`), Corporate Branch (`branchId`, `isCorporateOwned`).
- **Division-Specific Item Support:** Standardized schema for FabriQ AI (chemicals/packaging), FabriQ Boutique (fabrics/hardware), and FabriQ Luxury Store (retail garments/totes/belts).
- **Security Middleware & Rules (`firestore.rules`):** Enforced zero-trust RBAC and tenant scope validation for all inventory endpoints and Firestore subcollections.
- **Enterprise Inventory UI (`/src/components/inventory/EnterpriseInventoryDashboard.tsx`):** Built interactive dashboard with division filters, stock balance view, movement ledger table, reorder alerts, and inter-facility transfer form.
- **Documentation & Automated Tests:** Created `/docs/05_Inventory_Architecture.md` and added automated test scenarios 19-24 to `server/tests/securityVerification.ts`.

## [Phase 2A] - 2026-08-15
### Added
- **Franchise Entity & Agreement Models (`/src/types.ts`):** Added `FranchiseEntity`, `FranchiseAgreement`, and `BranchEntity` interfaces supporting multi-division operation (`laundry`, `boutique`, `luxury_store`) and versioned agreements.
- **Franchise Express Router (`/server/routes/franchise.ts`):** Created secure endpoints for franchise CRUD, versioned agreement management, and branch assignment/unassignment.
- **Franchise Security Middleware Integration:** All `/api/franchise` endpoints are wrapped with `authenticateFirebaseToken`, `requireRoles`, `validateTenantScope`, and `createRateLimiter`.
- **Immutable Audit Logging:** Franchise creation, updates, agreement versioning, and branch assignments write immutable event records.
- **Firestore Security Rules Update (`firestore.rules`):** Deployed rules for `/organizations/{orgId}/franchises/{franchiseId}/agreements/{agreementId}` sub-collection.
- **Franchise Architecture Profile Component (`/src/components/franchise/FranchiseProfileFoundation.tsx`):** Integrated dedicated foundation tab in `FranchiseeHub.tsx`.
- **Enterprise Architecture Documentation:** Published `/docs/03_Enterprise_Architecture.md`, `/docs/04_Database_Design.md`, `/docs/10_Franchise_Model.md`, `/docs/11_Product_Roadmap.md`, and `/docs/13_CHANGELOG.md`.
