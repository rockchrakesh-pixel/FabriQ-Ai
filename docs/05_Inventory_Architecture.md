# 05. FabriQ Enterprise Inventory Architecture (Phase 2B)

## Overview & Design Principles
The FabriQ Inventory Engine is an Enterprise Shared Capability supporting all present (`FabriQ AI`, `FabriQ Boutique`, `FabriQ Luxury Store`) and future operational divisions without duplicating core stock engines or ledger mechanics.

## Inventory Ownership Hierarchy
Inventory entities support three distinct operational ownership structures:

1. **Corporate Central Warehouse Inventory:**
   $$\text{Organization (orgId)} \longrightarrow \text{Division (divisionId)} \longrightarrow \text{Warehouse (warehouseId)} \longrightarrow \text{Stock}$$
   - `franchiseId` = `null`
   - `branchId` = `null`

2. **Franchise Branch Store Inventory:**
   $$\text{Organization (orgId)} \longrightarrow \text{Franchise (franchiseId)} \longrightarrow \text{Branch (branchId)} \longrightarrow \text{Stock}$$
   - `warehouseId` = `null`

3. **Corporate Flagship Branch Inventory:**
   $$\text{Organization (orgId)} \longrightarrow \text{Corporate Branch (branchId)} \longrightarrow \text{Stock}$$
   - `franchiseId` = `null`
   - `warehouseId` = `null`

## Shared Catalog & Division-Specific Categories
Core inventory items share a unified schema (`InventoryItem`) with division-specific category tags:
- **FabriQ AI (Laundry):** `laundry_chemical` (solvents, enzyme detergents), `packaging_supplies` (monogram velvet hangers, garment covers, polybags).
- **FabriQ Boutique:** `boutique_fabric` (Italian Mulberry Silk rolls), `boutique_hardware` (Zardozi gold thread, YKK zippers, pearl buttons).
- **FabriQ Luxury Store:** `luxury_garment` (Cashmere trench coats), `luxury_accessory` (Monogram canvas totes, leather belts).

## Auditable Stock Movement Ledger
Stock quantities cannot be silently modified. Every quantity change appends an immutable record to `StockMovementLedger` with movement types:
`RECEIPT`, `TRANSFER_IN`, `TRANSFER_OUT`, `CONSUMPTION`, `SALE`, `RETURN`, `DAMAGE`, `ADJUSTMENT`, `OPENING_BALANCE`.

Each entry records: `movementId`, `orgId`, `divisionId`, `franchiseId`, `branchId`, `warehouseId`, `itemId`, `itemName`, `movementType`, `quantity`, `previousQuantity`, `resultingQuantity`, `unitCost`, `reason`, `userId`, `timestamp`.

## Reorder Triggers & Supplier Records
- `ReorderRule` monitors `currentQuantity <= reorderLevel`.
- Generates reorder alerts specifying `suggestedReorderQuantity` and preferred supplier details.

## Firestore Composite Index Requirements
Querying stock balances and movements across tenant parameters relies on the following compound indexes:
1. `(orgId ASC, divisionId ASC, branchId ASC)`
2. `(orgId ASC, franchiseId ASC, currentQuantity ASC)`
3. `(orgId ASC, itemId ASC, timestamp DESC)`
