# FabriQ Enterprise Architecture Specification
## Document 07: Phase 2D — Enterprise Finance, Settlement & Revenue Control Foundation

### 1. Architectural Principles
Phase 2D implements the server-authoritative financial control layer across all FabriQ operating divisions (`FabriQ AI`, `FabriQ Boutique`, `FabriQ Luxury Store`).

Key Principles:
1. **Server-Authoritative Integer Precision:** All financial calculations use minor currency units (paise for INR, cents for USD/EUR/GBP) to prevent floating-point calculation drift.
2. **Controlled Revenue Ledger:** Revenue entries are append-only. Mutation of historical recognized revenue is strictly prohibited; compensating transactions (refunds/adjustments) are used.
3. **State Transition Matrix Enforcement:** Settlements advance through explicit, validated state steps: `DRAFT` $\rightarrow$ `CALCULATED` $\rightarrow$ `REVIEW_REQUIRED` $\rightarrow$ `APPROVED` $\rightarrow$ `READY_FOR_PAYOUT` $\rightarrow$ `PAID` $\rightarrow$ `RECONCILED`.
4. **Financial Period Locking:** Accounting periods (`2026-07`, `2026-08`) support `OPEN`, `LOCKED`, and `CLOSED` states. Closed periods block retro-active revenue or refund posting.
5. **Strict Tenant & Division Scope Isolation:** Multi-tenant checks prevent Franchise A from reading Franchise B settlement statements or Branch A from reading Branch B financial reports.

---

### 2. Core Collections & Entity Specs
- `/organizations/{orgId}/revenue_ledger/{ledgerId}` (`RevenueLedgerEntry`)
- `/organizations/{orgId}/payment_reconciliations/{reconciliationId}` (`PaymentReconciliationRecord`)
- `/organizations/{orgId}/financial_refunds/{adjustmentId}` (`FinancialRefundAdjustment`)
- `/organizations/{orgId}/financial_periods/{periodId}` (`FinancialPeriod`)
- `/organizations/{orgId}/financial_audit_logs/{auditId}` (`FinancialAuditTrailEntry`)
- `/organizations/{orgId}/franchise_financial_statements/{statementId}` (`FranchiseFinancialStatement`)

---

### 3. Verification & Compliance
- **TypeScript:** 0 errors
- **Production Build:** Vite clean bundle
- **Security & Integrity Test Suite:** 74/74 Test Scenarios PASSED (100% Green)
- **Firestore Security Rules:** Deployed and validated
