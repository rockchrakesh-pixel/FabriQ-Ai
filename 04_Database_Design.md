# 04. FabriQ Database Design & Data Model

## Blueprint Schemas (`firebase-blueprint.json`)

### Franchise Entity (`/organizations/{orgId}/franchises/{franchiseId}`)
- `franchiseId`: Unique identifier (e.g. `fr-hyd-01`)
- `orgId`: Parent organization identifier
- `franchiseName`: Operating trade name
- `legalEntityName`: Registered legal entity name
- `ownerName`, `ownerEmail`, `ownerPhone`: Primary franchisee contact details
- `territory`: Geographically bounded territory
- `country`, `stateRegion`, `city`: Location attributes
- `status`: `'active' | 'pending' | 'suspended' | 'terminated'`
- `agreementRefId`: Current active agreement ID reference
- `operatingDivisions`: Array of operating divisions (`['laundry', 'boutique', 'luxury_store']`)
- `createdAt`, `updatedAt`: ISO timestamps

### Franchise Agreement Entity (`/organizations/{orgId}/franchises/{franchiseId}/agreements/{agreementId}`)
- `agreementId`: Unique agreement version ID
- `franchiseId`: Linked franchise entity
- `orgId`: Organization scope
- `status`: `'draft' | 'active' | 'expired' | 'renewed' | 'terminated'`
- `effectiveDate`, `expiryDate`: Contract duration bounds
- `territory`: Agreed geographic territory
- `royaltyModel`: `'fixed_percentage' | 'tiered' | 'flat_fee'` (Model metadata; no financial calculation in Phase 2A)
- `royaltyPercentage`, `fixedFee`: Agreed terms
- `settlementFrequency`: `'weekly' | 'bi_weekly' | 'monthly'`
- `currency`, `paymentTerms`: Financial settlement metadata
- `version`: Immutable version string (e.g. `'1.2'`)
- `createdAt`, `updatedAt`: ISO timestamps

### Branch Entity (`/organizations/{orgId}/branches/{branchId}`)
- `branchId`: Branch store identifier
- `orgId`: Parent organization
- `franchiseId`: Linked franchise ID (or `null` for corporate-owned)
- `divisionIds`: Operating divisions supported at branch
- `name`, `city`, `address`: Store location details
- `isCorporateOwned`: Boolean flag distinguishing corporate flagships from franchise stores

### Warehouse Entity (`/organizations/{orgId}/warehouses/{warehouseId}`)
- `warehouseId`: Unique warehouse ID
- `orgId`: Parent organization ID
- `divisionId`: Division identifier
- `name`, `city`, `address`: Warehouse facility location
- `isCentral`: Boolean flag indicating central distribution status

### Master Inventory Item (`/organizations/{orgId}/inventory_items/{itemId}`)
- `itemId`, `sku`, `name`, `category`: Catalog item identification
- `divisionId`: Laundry, Boutique, or Luxury Store
- `unitOfMeasure`, `unitCost`, `sellingPrice`: Commercial metadata

### Stock Balance (`/organizations/{orgId}/stock_balances/{stockId}`)
- `stockId`, `itemId`, `orgId`, `divisionId`, `franchiseId`, `branchId`, `warehouseId`, `locationType`
- `currentQuantity`, `reservedQuantity`, `availableQuantity`, `minStockLevel`, `reorderLevel`, `reorderQuantity`

### Stock Movement Ledger (`/organizations/{orgId}/stock_movements/{movementId}`)
- `movementId`, `movementType` (`RECEIPT`, `TRANSFER_IN`, `TRANSFER_OUT`, `CONSUMPTION`, `SALE`, `RETURN`, `DAMAGE`, `ADJUSTMENT`, `OPENING_BALANCE`)
- `quantity`, `previousQuantity`, `resultingQuantity`, `reason`, `userId`, `timestamp`

### Versioned Commercial Agreement (`/organizations/{orgId}/commercial_agreements/{agreementVersionId}`)
- `agreementVersionId`: Versioned identifier (e.g. `agr_fr-hyd-01_v1.1`)
- `agreementId`, `franchiseId`, `orgId`, `version` (`1.0`, `1.1`), `status` (`active`, `expired`)
- `royaltyModel`: `'fixed_percentage' | 'tiered' | 'flat_fee'`
- `tieredSlabs`: Array of progressive marginal slabs (`minAmountInMinorUnits`, `maxAmountInMinorUnits`, `ratePercentage`)
- `currency`: explicit ISO currency (`INR`, `USD`, `GBP`, `EUR`)

### Normalized Commercial Revenue Event (`/organizations/{orgId}/commercial_events/{eventId}`)
- `eventId`, `idempotencyKey`, `orgId`, `divisionId`, `franchiseId`, `branchId`, `isCorporateOwned`
- `orderId`, `eventType` (`SERVICE_SALE`, `PRODUCT_SALE`, `REFUND`, `RETURN`, `DISCOUNT`, `TAX`, `DELIVERY_FEE`)
- `grossAmountInMinorUnits`, `discountAmountInMinorUnits`, `taxAmountInMinorUnits`, `netAmountInMinorUnits`, `eligibleRevenueInMinorUnits`
- `currency`, `timestamp`, `agreementVersionId`, `reversalOfEventId`

### Franchise Settlement Statement (`/organizations/{orgId}/franchise_settlements/{settlementId}`)
- `settlementId`, `orgId`, `franchiseId`, `agreementVersionId`, `settlementPeriod`, `currency`
- `grossRevenueInMinorUnits`, `eligibleRevenueInMinorUnits`, `royaltyAmountInMinorUnits`, `netSettlementInMinorUnits`
- `status`: `'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'PAID' | 'RECONCILED' | 'DISPUTED'`

