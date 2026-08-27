# 03. FabriQ Enterprise Platform Architecture

## Multi-Tenant & Organizational Hierarchy
The FabriQ Enterprise Platform adopts a 4-level multi-tenant hierarchy:

$$\text{Organization (orgId)} \longrightarrow \text{Franchise (franchiseId)} \longrightarrow \text{Branch (branchId)} \longrightarrow \text{Division (divisionId)}$$

### Hierarchy Levels:
1. **Organization (`orgId`):** Master enterprise tenant overseeing multi-regional operations (e.g. `org-fabriq-global`).
2. **Division (`divisionId`):** Operating verticals:
   - `laundry` — FabriQ AI Garment Care & Hydrocarbon Atelier
   - `boutique` — FabriQ Boutique 3D Fitting & Bespoke Atelier
   - `luxury_store` — FabriQ Luxury Retail Store
3. **Franchise (`franchiseId`):** Franchise legal entity operating store branches under contract (e.g., `fr-hyd-01` Deccan Luxury Retail).
4. **Branch (`branchId`):** Physical store atelier or collection counter. Supports both Franchise-Owned (`franchiseId: 'fr-xxx'`) and Corporate-Owned (`franchiseId: null`, `isCorporateOwned: true`).

## Security Architecture (Phase 1.1 + Phase 2A + Phase 2B + Phase 2C)
All API endpoints follow the zero-trust execution pipeline:
$\text{Request} \longrightarrow \text{Bearer Token (authMiddleware)} \longrightarrow \text{RBAC (rbacMiddleware)} \longrightarrow \text{Tenant Scope (tenantMiddleware)} \longrightarrow \text{Rate Limiter} \longrightarrow \text{Handler}$

- **Firestore Rules:** Attribute-based access control (ABAC) asserting matching `orgId`, `franchiseId`, `branchId` claims and immutable tenant fields.
- **Audit & Movement Logging:** Administrative operations emit immutable records to `/audit_logs`, `/stock_movements`, and `/commercial_events`.
- **Enterprise Inventory Engine (Phase 2B):** Shared inventory model supporting Corporate Warehouses, Corporate Flagship Branches, and Franchise Branches across all three FabriQ divisions.
- **Franchise Commercial Engine (Phase 2C):** Server-side authoritative royalty calculation engine supporting versioned commercial agreements (`v1.0`, `v1.1`), progressive marginal tiered slabs, normalized revenue events, integer minor units (paise/cents), currency matching, and settlement lifecycle management.
