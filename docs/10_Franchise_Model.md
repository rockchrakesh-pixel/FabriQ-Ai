# 10. FabriQ Franchise Management & Commercial Model (Phase 2A + Phase 2C)

## Core Architectural Rules
1. **Separation of Entity & Agreement:** A Franchise Entity represents the legal and operational business partner. The Franchise Agreement represents time-bounded contractual terms. Versioning agreements (`v1.0`, `v1.1`, `v2.0`) preserves historical audit integrity.
2. **Corporate vs. Franchise Branches:** Branches can be owned by a Franchise (`franchiseId: 'fr-xxx'`) or owned directly by Corporate (`franchiseId: null`, `isCorporateOwned: true`). Corporate branches generate 0 franchise royalty liability.
3. **Multi-Division Franchise Compatibility:** A franchise operates seamlessly across all 3 divisions: `FabriQ AI`, `FabriQ Boutique`, and `FabriQ Luxury Store`.
4. **Phase 2C Commercial & Royalty Engine Foundation (COMPLETED):**
   - ✅ Server-side authoritative royalty calculation engine
   - ✅ Versioned commercial terms (`VersionedFranchiseAgreement`)
   - ✅ Progressive marginal tiered slabs (`₹0–₹10L @ 5%`, `₹10L–₹25L @ 7%`, `₹25L+ @ 9%`)
   - ✅ Normalized revenue event stream (`CommercialRevenueEvent`) with integer minor units
   - ✅ Idempotency map protection against retried event requests
   - ✅ Currency mismatch protection (`INR`, `USD`, `GBP`, `EUR`)
   - ✅ Reversal compensating events for refunds and returns
   - ✅ Settlement lifecycle workflow (`DRAFT` $\rightarrow$ `CALCULATED` $\rightarrow$ `REVIEWED` $\rightarrow$ `APPROVED` $\rightarrow$ `PAID` $\rightarrow$ `RECONCILED` $\rightarrow$ `DISPUTED`)
   - ✅ Automated test scenarios 31–46 passing (100% compliance)

