# 11. FabriQ Enterprise Product Roadmap

## Milestone Overview

### Phase 1: Security & Monolith Modularization (COMPLETED)
- Split server routes into `/server/routes/`
- Hardened Firestore Security Rules
- Built Gemini AI 3.6 / 3.1 Pro / Veo / Grounding integrations

### Phase 1.1: Security Hardening & Gate Verification (COMPLETED — GREEN)
- Server-authoritative Firebase Bearer token verification middleware
- RBAC middleware (`requireRoles`) for all 15 operational roles
- Multi-Tenant scope middleware (`validateTenantScope`)
- Server-side Razorpay HMAC-SHA256 signature verification
- FCM Push notification security & in-memory rate limiting
- 15/15 Automated security regression tests passing

### Phase 2A: Franchise Management Foundation (COMPLETED — GREEN GATE)
- Extended Franchise Entity model with territory and multi-division support
- Extensible versioned Franchise Agreement model
- Franchise ➔ Branch relationship (Franchise-owned vs Corporate-owned)
- Franchise API routes (`/api/franchise`) protected by Phase 1.1 security middleware
- Dedicated Franchise Architecture Profile UI in `FranchiseeHub.tsx`
- Immutable Audit Logging for franchise & agreement lifecycle events

### Phase 2B: Enterprise Inventory Foundation (COMPLETED — CURRENT GATE)
- Enterprise shared inventory capability for FabriQ AI, FabriQ Boutique, and FabriQ Luxury Store
- Three-tier ownership model: Corporate Warehouse, Corporate Branch, Franchise Branch
- Division-specific stock support (Laundry chemicals, packaging, tailoring fabrics/hardware, luxury retail)
- Auditable Stock Movement Ledger (`RECEIPT`, `TRANSFER_IN`, `TRANSFER_OUT`, `CONSUMPTION`, `SALE`, `RETURN`, `DAMAGE`, `ADJUSTMENT`)
- Controlled Inter-Facility Transfers (Warehouse $\rightarrow$ Branch, Branch $\rightarrow$ Branch, Branch $\rightarrow$ Warehouse)
- Reorder Trigger Architecture & Supplier records
- Zero-Trust Security Middleware (`/api/inventory`) & Firestore Security Rules
- Dedicated `EnterpriseInventoryDashboard.tsx` UI
- 24/24 Automated security & inventory tests passing

### Phase 2C: Franchise Commercial & Royalty Foundation (COMPLETED — GREEN GATE)
- Versioned Franchise Commercial Agreement Terms (`v1.0`, `v1.1`, `v2.0`)
- Server-Side Authoritative Royalty Calculation Engine (Fixed %, Flat Fee, Progressive Marginal Tiered Slabs)
- Multi-Division Normalized Commercial Revenue Event Ledger (`SERVICE_SALE`, `PRODUCT_SALE`, `REFUND`, `RETURN`)
- Integer Minor Units Storage & Math (Paise / Cents)
- Corporate Branch Zero Royalty Exemption (`isCorporateOwned: true`)
- Currency Mismatch Protection & Idempotency Map Verification
- Franchise Settlement Statement Lifecycle Workflow (`DRAFT` $\rightarrow$ `CALCULATED` $\rightarrow$ `REVIEWED` $\rightarrow$ `APPROVED` $\rightarrow$ `PAID` $\rightarrow$ `RECONCILED` $\rightarrow$ `DISPUTED`)
- Dedicated `FranchiseCommercialDashboard.tsx` UI
- 46/46 Automated Security, Inventory, & Commercial verification tests passing (100% GREEN)

### Phase 2C: Multi-Store Inventory & Chemical Stock Sync (UPCOMING)
- Chemical stock tracking across ateliers
- Automated reorder threshold notifications
