export type AppDivision = 'laundry' | 'boutique' | 'luxury_store';

export type UserRole =
  | 'customer'
  | 'pickup_executive'
  | 'delivery_executive'
  | 'store_staff'
  | 'quality_inspector'
  | 'store_manager'
  | 'area_manager'
  | 'regional_manager'
  | 'mis'
  | 'finance'
  | 'inventory'
  | 'franchise_owner'
  | 'owner'
  | 'ceo'
  | 'super_admin';

export type FranchiseStatus = 'active' | 'pending' | 'suspended' | 'terminated';
export type AgreementStatus = 'draft' | 'active' | 'expired' | 'renewed' | 'terminated';
export type RoyaltyModel = 'fixed_percentage' | 'tiered' | 'flat_fee';

export interface FranchiseEntity {
  franchiseId: string;
  orgId: string;
  franchiseName: string;
  legalEntityName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  territory: string;
  country: string;
  stateRegion: string;
  city: string;
  status: FranchiseStatus;
  agreementRefId?: string;
  agreementStartDate?: string;
  agreementEndDate?: string;
  operatingDivisions: AppDivision[];
  createdAt: string;
  updatedAt: string;
}

export interface FranchiseAgreement {
  agreementId: string;
  franchiseId: string;
  orgId: string;
  status: AgreementStatus;
  effectiveDate: string;
  expiryDate: string;
  territory: string;
  royaltyModel: RoyaltyModel;
  royaltyPercentage: number;
  fixedFee: number;
  settlementFrequency: 'weekly' | 'bi_weekly' | 'monthly';
  currency: string;
  paymentTerms: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchEntity {
  branchId: string;
  orgId: string;
  franchiseId: string | null; // null or 'corporate' for corporate-owned branches
  divisionIds: AppDivision[];
  name: string;
  city: string;
  address: string;
  status: 'active' | 'maintenance' | 'closed';
  isCorporateOwned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType =
  | 'RECEIPT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'CONSUMPTION'
  | 'SALE'
  | 'RETURN'
  | 'DAMAGE'
  | 'ADJUSTMENT'
  | 'OPENING_BALANCE';

export type InventoryCategory =
  | 'laundry_chemical'
  | 'packaging_supplies'
  | 'boutique_fabric'
  | 'boutique_hardware'
  | 'luxury_garment'
  | 'luxury_accessory'
  | 'general_consumable';

export interface WarehouseEntity {
  warehouseId: string;
  orgId: string;
  divisionId: AppDivision;
  name: string;
  city: string;
  address: string;
  isCentral: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  itemId: string;
  orgId: string;
  divisionId: AppDivision;
  sku: string;
  name: string;
  category: InventoryCategory;
  unitOfMeasure: string;
  unitCost: number;
  sellingPrice?: number;
  brand?: string;
  styleCode?: string;
  color?: string;
  size?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStock {
  stockId: string;
  itemId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId: string | null;
  branchId: string | null;
  warehouseId: string | null;
  locationType: 'warehouse' | 'branch';
  locationName: string;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  reorderLevel: number;
  targetStockLevel: number;
  reorderQuantity: number;
  preferredSupplierId?: string;
  lastRestockedAt: string;
  updatedAt: string;
}

export interface EnrichedInventoryStock extends InventoryStock {
  itemName: string;
  sku: string;
  unitOfMeasure: string;
  unitCost: number;
  category: InventoryCategory;
  isLowStock: boolean;
  isCritical: boolean;
}

export interface RoyaltyTierSlab {
  slabId: string;
  minAmountInMinorUnits: number;
  maxAmountInMinorUnits: number | null;
  ratePercentage: number;
}

export interface VersionedFranchiseAgreement {
  agreementVersionId: string;
  agreementId: string;
  franchiseId: string;
  orgId: string;
  version: string;
  status: AgreementStatus;
  effectiveDate: string;
  expiryDate: string;
  territory: string;
  royaltyModel: RoyaltyModel;
  royaltyPercentage: number;
  tieredSlabs?: RoyaltyTierSlab[];
  tieredCalculationType?: 'progressive_marginal' | 'threshold_slab';
  flatFeeInMinorUnits?: number;
  settlementFrequency: 'weekly' | 'bi_weekly' | 'monthly';
  currency: string;
  applicableDivisions: AppDivision[];
  applicableBranchIds?: string[];
  createdAt: string;
  updatedAt: string;
}

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

export interface RoyaltyCalculationResult {
  calculationId: string;
  eventId: string;
  orgId: string;
  franchiseId: string | null;
  branchId: string;
  agreementVersionId: string | null;
  agreementVersion: string | null;
  royaltyModel: RoyaltyModel | 'none_corporate';
  eligibleRevenueInMinorUnits: number;
  calculatedRoyaltyInMinorUnits: number;
  currency: string;
  isCorporateOwned: boolean;
  breakdown: {
    model: string;
    effectiveRatePercentage?: number;
    slabBreakdown?: Array<{
      slabId: string;
      minMinor: number;
      maxMinor: number | null;
      ratePercentage: number;
      taxableAmountInMinor: number;
      royaltyInMinor: number;
    }>;
    flatFeeInMinor?: number;
  };
  timestamp: string;
}

export type SettlementStatus =
  | 'DRAFT'
  | 'CALCULATED'
  | 'REVIEWED'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'READY_FOR_PAYOUT'
  | 'PAID'
  | 'RECONCILED'
  | 'DISPUTED'
  | 'REJECTED'
  | 'VOID'
  | 'REVERSED';

export interface FranchiseSettlement {
  settlementId: string;
  orgId: string;
  franchiseId: string;
  agreementVersionId: string;
  agreementVersion: string;
  settlementPeriod: string;
  currency: string;
  grossRevenueInMinorUnits: number;
  eligibleRevenueInMinorUnits: number;
  royaltyAmountInMinorUnits: number;
  adjustmentsInMinorUnits: number;
  netSettlementInMinorUnits: number;
  status: SettlementStatus;
  eventCount: number;
  sourceEventIds: string[];
  approvedBy?: string;
  approvedAt?: string;
  disputeReason?: string;
  calculationVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export type RevenueLedgerStatus =
  | 'RECOGNIZED'
  | 'PENDING'
  | 'ADJUSTED'
  | 'REVERSED'
  | 'VOID';

export interface RevenueLedgerEntry {
  ledgerId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId: string | null;
  branchId: string;
  isCorporateOwned: boolean;
  transactionId: string;
  orderId?: string;
  customerId?: string;
  serviceProductRef: string;
  paymentRef?: string;
  currency: string;
  grossAmountInMinorUnits: number;
  discountAmountInMinorUnits: number;
  taxAmountInMinorUnits: number;
  netRevenueInMinorUnits: number;
  royaltyAmountInMinorUnits: number;
  refundAmountInMinorUnits: number;
  adjustmentAmountInMinorUnits: number;
  finalRecognizedAmountInMinorUnits: number;
  status: RevenueLedgerStatus;
  transactionDate: string;
  financialPeriodId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ReconciliationStatus =
  | 'PENDING'
  | 'MATCHED'
  | 'MISMATCH'
  | 'RECONCILED'
  | 'DISCREPANCY'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'FAILED'
  | 'MANUAL_REVIEW';

export interface PaymentReconciliationRecord {
  reconciliationId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId: string | null;
  branchId: string;
  paymentRef: string;
  orderRef: string;
  transactionRef: string;
  expectedAmountInMinorUnits: number;
  receivedAmountInMinorUnits: number;
  currency: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  reconciliationStatus: ReconciliationStatus;
  mismatchReason?: string;
  reconciledBy?: string;
  reconciledAt?: string;
  createdAt: string;
}

export type FinancialAdjustmentType = 'REFUND' | 'ADJUSTMENT' | 'REVERSAL';
export type FinancialAdjustmentStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED';

export interface FinancialRefundAdjustment {
  adjustmentId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId: string | null;
  branchId: string;
  originalTransactionId: string;
  type: FinancialAdjustmentType;
  amountInMinorUnits: number;
  eligibleRefundLimitInMinorUnits: number;
  currency: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  status: FinancialAdjustmentStatus;
  financialPeriodId: string;
  createdAt: string;
}

export type PeriodStatus = 'OPEN' | 'CLOSING' | 'LOCKED' | 'CLOSED';

export interface FinancialPeriod {
  periodId: string;
  orgId: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  lockedBy?: string;
  lockedAt?: string;
  closedBy?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAuditTrailEntry {
  auditId: string;
  orgId: string;
  divisionId?: AppDivision;
  franchiseId?: string | null;
  branchId?: string;
  actorId: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  timestamp: string;
}

export interface FranchiseFinancialStatement {
  statementId: string;
  orgId: string;
  franchiseId: string;
  periodId: string;
  currency: string;
  grossSalesInMinorUnits: number;
  discountsInMinorUnits: number;
  refundsInMinorUnits: number;
  adjustmentsInMinorUnits: number;
  royaltyInMinorUnits: number;
  netRevenueInMinorUnits: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'OUTSTANDING';
  settlementStatus: SettlementStatus;
  outstandingAmountInMinorUnits: number;
  generatedAt: string;
}

export interface BranchFinancialReport {
  reportId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId: string | null;
  branchId: string;
  periodId: string;
  dailyRevenueInMinorUnits: number;
  weeklyRevenueInMinorUnits: number;
  monthlyRevenueInMinorUnits: number;
  transactionCount: number;
  averageTransactionValueInMinorUnits: number;
  refundTotalsInMinorUnits: number;
  adjustmentTotalsInMinorUnits: number;
  paymentReconciliationStatus: ReconciliationStatus;
  settlementStatus: SettlementStatus;
}

export interface StockMovementLedger {
  movementId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId: string | null;
  branchId: string | null;
  warehouseId: string | null;
  itemId: string;
  itemName: string;
  movementType: StockMovementType;
  quantity: number;
  previousQuantity: number;
  resultingQuantity: number;
  unitCost: number;
  sourceLocationId?: string;
  destinationLocationId?: string;
  reason: string;
  referenceDocId?: string;
  userId: string;
  timestamp: string;
}

export interface SupplierEntity {
  supplierId: string;
  orgId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  categories: InventoryCategory[];
  leadTimeDays: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderRule {
  ruleId: string;
  orgId: string;
  divisionId: AppDivision;
  itemId: string;
  locationId: string;
  locationType: 'warehouse' | 'branch';
  minStockLevel: number;
  reorderLevel: number;
  reorderQuantity: number;
  preferredSupplierId?: string;
  autoTriggerEnabled: boolean;
  updatedAt: string;
}

export type ScreenId =
  | 'home'
  | 'luxury-store'
  | 'role-login'
  | 'dashboard-customer'
  | 'dashboard-store-manager'
  | 'dashboard-owner'
  | 'dashboard-ceo'
  | 'dashboard-mis'
  | 'home-feedback'
  | 'home-fabriq'
  | 'division-selector'
  | 'boutique-fitting'
  | 'bespoke-tailor'
  | 'payment-success'
  | 'update-profile-picture'
  | 'service-address'
  | 'service-insights'
  | 'my-orders'
  | 'order-tracking'
  | 'confirm-addon'
  | 'select-photo'
  | 'live-order-tracking'
  | 'account'
  | 'concierge-chat'
  | 'membership-plans'
  | 'schedule-pickup'
  | 'checkout-summary'
  | 'service-catalog'
  | 'cart'
  | 'edit-profile'
  | 'order-receipt'
  | 'ai-fabric-advisor'
  | 'enterprise-analytics'
  | 'operations-center';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  credits: number;
  garmentsSaved: number;
  avatarUrl: string;
  address: string;
  pickupTime: string;
  preferredDivision?: AppDivision;
  role?: UserRole;
  storeLocation?: string;
}

export type TransitionType = 'none' | 'push' | 'push_back' | 'slide_up';

export const getDefaultPortalForRole = (role: UserRole): ScreenId => {
  switch (role) {
    case 'store_manager':
    case 'store_staff':
    case 'pickup_executive':
    case 'delivery_executive':
    case 'quality_inspector':
    case 'inventory':
      return 'dashboard-store-manager';
    case 'owner':
    case 'franchise_owner':
    case 'area_manager':
    case 'regional_manager':
      return 'dashboard-owner';
    case 'ceo':
    case 'super_admin':
      return 'dashboard-ceo';
    case 'mis':
    case 'finance':
      return 'dashboard-mis';
    default:
      return 'home';
  }
};

// ============================================================================
// PHASE 2E: ENTERPRISE PROCUREMENT, VENDOR & SUPPLY-CHAIN TYPES
// ============================================================================

export type VendorStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'INACTIVE';
export type VendorComplianceStatus = 'PENDING' | 'VERIFIED' | 'EXPIRING' | 'EXPIRED' | 'REJECTED';
export type VendorRiskClassification = 'LOW' | 'MEDIUM' | 'HIGH';

export interface VendorContact {
  contactId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

export interface VendorAddress {
  addressId: string;
  type: 'BILLING' | 'SHIPPING' | 'WAREHOUSE';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface VendorEntity {
  vendorId: string;
  organizationId: string;
  divisionId?: AppDivision;
  vendorName: string;
  legalName: string;
  vendorType: string;
  registrationTaxId: string;
  primaryContact: VendorContact;
  contacts: VendorContact[];
  email: string;
  phone: string;
  addresses: VendorAddress[];
  paymentTerms: string;
  currency: string;
  status: VendorStatus;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  riskClassification: VendorRiskClassification;
  complianceStatus: VendorComplianceStatus;
  complianceExpiryDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ProcurementItem {
  procurementItemId: string;
  orgId: string;
  divisionId?: AppDivision;
  sku: string;
  itemName: string;
  category: string;
  unitOfMeasure: string;
  preferredVendorIds: string[];
  approvedVendorIds: string[];
  minimumOrderQuantity: number;
  reorderThreshold: number;
  standardLeadTimeDays: number;
  estimatedUnitPriceInMinorUnits: number;
  currency: string;
  taxRatePercent?: number;
  activeStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RequisitionStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEW_REQUIRED' | 'APPROVED' | 'CONVERTED_TO_PO' | 'REJECTED' | 'CANCELLED';

export interface RequisitionItem {
  procurementItemId: string;
  sku: string;
  itemName: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedUnitPriceInMinorUnits: number;
  totalPriceInMinorUnits: number;
}

export interface PurchaseRequisition {
  requisitionId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId?: string | null;
  branchId?: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  items: RequisitionItem[];
  totalQuantity: number;
  totalEstimatedAmountInMinorUnits: number;
  currency: string;
  requiredByDate: string;
  reason: string;
  preferredVendorId?: string;
  status: RequisitionStatus;
  approverId?: string;
  approvedAt?: string;
  rejectionReason?: string;
  convertedPoId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CLOSED' | 'REJECTED' | 'CANCELLED' | 'VOID';

export interface PurchaseOrderLineItem {
  lineItemId: string;
  procurementItemId: string;
  sku: string;
  itemName: string;
  quantity: number;
  receivedQuantity: number;
  unitPriceInMinorUnits: number;
  discountInMinorUnits: number;
  taxRatePercent?: number;
  taxInMinorUnits: number;
  subtotalInMinorUnits: number;
  totalInMinorUnits: number;
}

export interface PurchaseOrderEntity {
  purchaseOrderId: string;
  requisitionId?: string;
  vendorId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId?: string | null;
  branchId?: string;
  version: number;
  lineItems: PurchaseOrderLineItem[];
  totalQuantity: number;
  totalReceivedQuantity: number;
  subtotalInMinorUnits: number;
  totalDiscountInMinorUnits: number;
  totalTaxInMinorUnits: number;
  totalAmountInMinorUnits: number;
  currency: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  status: PurchaseOrderStatus;
  createdBy: string;
  approvedBy?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderVersionHistory {
  versionId: string;
  purchaseOrderId: string;
  version: number;
  changedBy: string;
  changedAt: string;
  changeReason: string;
  snapshot: PurchaseOrderEntity;
}

export type GoodsReceiptStatus = 'DRAFT' | 'RECEIVED' | 'QUALITY_CHECK' | 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'POSTED_TO_INVENTORY' | 'REJECTED' | 'CANCELLED';

export interface GRNItem {
  lineItemId: string;
  procurementItemId: string;
  sku: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  damagedQuantity: number;
  batchLot?: string;
  inspectionNotes?: string;
}

export interface GoodsReceiptNote {
  grnId: string;
  purchaseOrderId: string;
  vendorId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId?: string | null;
  branchId: string;
  receivedItems: GRNItem[];
  totalReceivedQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  receivingEmployeeId: string;
  receivingEmployeeName: string;
  receivingDate: string;
  inspectionStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'PARTIAL';
  inspectorId?: string;
  inspectionDate?: string;
  status: GoodsReceiptStatus;
  inventoryPosted: boolean;
  inventoryPostedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseReturnStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PROCESSED' | 'REJECTED';

export interface ReturnItem {
  procurementItemId: string;
  sku: string;
  itemName: string;
  quantity: number;
  reason: string;
  unitPriceInMinorUnits: number;
  totalAmountInMinorUnits: number;
}

export interface PurchaseReturnEntity {
  returnId: string;
  vendorId: string;
  purchaseOrderId: string;
  grnId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId?: string | null;
  branchId: string;
  returnedItems: ReturnItem[];
  totalQuantity: number;
  totalAmountInMinorUnits: number;
  currency: string;
  reason: string;
  status: PurchaseReturnStatus;
  requestedBy: string;
  approvedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export type InvoiceMatchStatus = 'PENDING' | 'MATCHED' | 'MISMATCH' | 'MANUAL_REVIEW' | 'APPROVED' | 'REJECTED';

export interface VendorInvoiceMatchRecord {
  invoiceMatchId: string;
  orgId: string;
  divisionId: AppDivision;
  franchiseId?: string | null;
  branchId: string;
  vendorId: string;
  vendorInvoiceRef: string;
  purchaseOrderId: string;
  grnId: string;
  poAmountInMinorUnits: number;
  grnAmountInMinorUnits: number;
  invoiceAmountInMinorUnits: number;
  poQuantity: number;
  grnQuantity: number;
  invoiceQuantity: number;
  poCurrency: string;
  invoiceCurrency: string;
  quantityMismatch: boolean;
  priceMismatch: boolean;
  currencyMismatch: boolean;
  status: InvoiceMatchStatus;
  mismatchReason?: string;
  matchedBy?: string;
  matchedAt?: string;
  createdAt: string;
}

export interface VendorPerformanceMetrics {
  vendorId: string;
  vendorName: string;
  totalPurchaseOrders: number;
  onTimeDeliveries: number;
  timelinessRatePercent: number;
  totalItemsOrdered: number;
  totalItemsReceived: number;
  totalItemsRejected: number;
  fulfillmentRatePercent: number;
  qualityRejectionRatePercent: number;
  totalInvoices: number;
  invoiceMismatchCount: number;
  invoiceMatchRatePercent: number;
  averageLeadTimeDays: number;
}

export interface ProcurementAuditTrailEntry {
  auditId: string;
  orgId: string;
  divisionId?: AppDivision;
  franchiseId?: string | null;
  branchId?: string;
  actorId: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  timestamp: string;
}

// ----------------------------------------------------------------------
// Phase 2F-1: Distributed Persistent Idempotency Interfaces
// ----------------------------------------------------------------------

export type IdempotencyStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface IdempotencyRecord {
  idempotencyKey: string;
  orgId: string;
  franchiseId?: string | null;
  branchId?: string | null;
  userId: string;
  userRole: string;
  action: string;
  endpoint: string;
  requestHash: string; // Cryptographic SHA-256 fingerprint of (method + path + body)
  status: IdempotencyStatus;
  statusCode?: number;
  responsePayload?: any;
  resourceId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  expiresAt: string;
}

// ----------------------------------------------------------------------
// Phase 2F-2: Persistent HSN/SAC Tax Schedule & Compliance Engine Types
// ----------------------------------------------------------------------

export type TaxCodeType = 'HSN' | 'SAC';
export type TaxScheduleStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
export type TaxTreatmentType = 'INTRA_STATE' | 'INTER_STATE' | 'UNION_TERRITORY' | 'EXPORT' | 'EXEMPT';

export interface TaxClassification {
  classificationId: string;
  code: string; // e.g., '998812' (SAC Laundry) or '6205' (HSN Shirts)
  codeType: TaxCodeType;
  description: string;
  category: string;
  serviceOrProduct: 'PRODUCT' | 'SERVICE';
  defaultTaxScheduleId?: string;
  active: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  version: number;
  orgId: string;
  divisionScope?: AppDivision[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TaxScheduleVersion {
  versionId: string;
  taxScheduleId: string;
  versionNumber: number;
  status: TaxScheduleStatus;
  cgstRatePercent: number; // e.g., 2.5, 6, 9
  sgstRatePercent: number; // e.g., 2.5, 6, 9
  igstRatePercent: number; // e.g., 5, 12, 18
  utgstRatePercent?: number;
  cessRatePercent?: number;
  effectiveFrom: string; // ISO Date String
  effectiveTo?: string; // ISO Date String or undefined for indefinite
  description?: string;
  jurisdiction: string; // e.g., 'IN-ALL', 'IN-TG', 'IN-MH'
  orgId: string;
  divisionId?: AppDivision;
  franchiseId?: string | null;
  branchId?: string;
  createdBy: string;
  createdAt: string;
}

export interface TaxSchedule {
  taxScheduleId: string;
  name: string;
  scheduleCode: string;
  classificationCode: string; // Link to HSN or SAC code
  codeType: TaxCodeType;
  description: string;
  activeVersionNumber: number;
  versions: TaxScheduleVersion[];
  orgId: string;
  divisionScope?: AppDivision[];
  status: TaxScheduleStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TaxComponentBreakdown {
  taxableAmountInMinorUnits: number;
  cgstAmountInMinorUnits: number;
  cgstRatePercent: number;
  sgstAmountInMinorUnits: number;
  sgstRatePercent: number;
  igstAmountInMinorUnits: number;
  igstRatePercent: number;
  utgstAmountInMinorUnits: number;
  utgstRatePercent: number;
  cessAmountInMinorUnits: number;
  cessRatePercent: number;
  totalTaxAmountInMinorUnits: number;
}

export interface TaxSnapshot {
  snapshotId: string;
  taxScheduleId: string;
  taxScheduleVersionId: string;
  versionNumber: number;
  classificationCode: string;
  codeType: TaxCodeType;
  taxTreatment: TaxTreatmentType;
  taxableAmountInMinorUnits: number;
  breakdown: TaxComponentBreakdown;
  effectiveDateUsed: string;
  calculatedAt: string;
}

export interface TaxAuditRecord {
  auditId: string;
  orgId: string;
  divisionId?: AppDivision;
  actorId: string;
  actorRole: string;
  action: 'CREATE_CLASSIFICATION' | 'UPDATE_CLASSIFICATION' | 'CREATE_TAX_SCHEDULE' | 'VERSION_TAX_SCHEDULE' | 'DEACTIVATE_SCHEDULE' | 'OVERRIDE_TAX_SCHEDULE';
  entity: 'TaxClassification' | 'TaxSchedule' | 'TaxScheduleVersion';
  entityId: string;
  previousVersion?: number;
  newVersion?: number;
  changeSummary: string;
  timestamp: string;
}

export type RequirementStatus = 'REQUIRED' | 'RESERVED' | 'CONSUMED' | 'RELEASED' | 'SHORT' | 'CANCELLED';

export interface OrderInventoryRequirement {
  requirementId: string;
  orderId: string;
  orderItemId?: string;
  garmentId?: string;
  itemId: string;
  sku: string;
  itemName: string;
  orgId: string;
  divisionId: string;
  franchiseId?: string | null;
  branchId?: string | null;
  requiredQuantity: number;
  reservedQuantity: number;
  consumedQuantity: number;
  releasedQuantity: number;
  unit: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
  correlationId?: string;
}

// Enterprise Multi-Dimensional Analytics Interfaces (Phase 2H-5)
export interface AnalyticsQueryFilters {
  orgId: string;
  divisionId?: AppDivision | string;
  franchiseId?: string | null;
  branchId?: string;
  timeframe?: 'today' | 'this_week' | 'this_month' | 'quarter' | 'ytd' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface ExecutiveAnalyticsSummary {
  orgId: string;
  timeframe: string;
  totalRevenueInMinorUnits: number;
  totalGrossMarginPercentage: number;
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  averageOrderValueInMinorUnits: number;
  activeCustomersCount: number;
  slaComplianceRate: number;
  garmentQualityPassRate: number;
  reworkRate: number;
  totalTaxCollectedInMinorUnits: number;
  totalRoyaltiesAccruedInMinorUnits: number;
  generatedAt: string;
}

export interface OperationalKpis {
  orgId: string;
  totalGarmentsProcessed: number;
  garmentsByStage: Record<string, number>;
  qualityMetrics: {
    totalInspected: number;
    passedCount: number;
    failedCount: number;
    reworkRequiredCount: number;
    firstPassYieldRate: number;
    reworkRate: number;
  };
  slaMetrics: {
    totalOrdersTracked: number;
    onTimeOrders: number;
    breachedOrders: number;
    slaCompliancePercentage: number;
    averageTurnaroundTargetHours: number;
  };
  reworkBreakdownByCategory: Record<string, number>;
  generatedAt: string;
}

export interface DivisionAnalyticsComparison {
  divisionId: AppDivision | string;
  divisionName: string;
  orderCount: number;
  completedOrderCount: number;
  revenueInMinorUnits: number;
  grossMarginPercentage: number;
  averageOrderValueInMinorUnits: number;
  slaComplianceRate: number;
  reworkRate: number;
  activeCustomers: number;
}

export interface UnitEconomicsMetrics {
  orgId: string;
  totalGarmentsProcessed: number;
  totalOrdersProcessed: number;
  averageRevenuePerGarmentInMinorUnits: number;
  averageMaterialCostPerGarmentInMinorUnits: number;
  averageRoyaltyPerOrderInMinorUnits: number;
  averageGrossMarginPerOrderInMinorUnits: number;
  grossMarginPercentage: number;
  taxCollectedInMinorUnits: number;
  generatedAt: string;
}

export interface CustomerCohortMetrics {
  orgId: string;
  totalUniqueCustomers: number;
  repeatCustomerCount: number;
  repeatCustomerRate: number;
  averageCustomerLtvInMinorUnits: number;
  multiDivisionAdoptionRate: number;
  customerSpendingTiers: {
    vipCount: number;
    regularCount: number;
    occasionalCount: number;
  };
  generatedAt: string;
}

export interface InventoryConsumptionMetrics {
  orgId: string;
  totalStockItemsCount: number;
  totalStockValueInMinorUnits: number;
  totalRequirementsGenerated: number;
  fulfilledRequirementsCount: number;
  shortageIncidentsCount: number;
  consumptionVelocityScore: number;
  generatedAt: string;
}

// ============================================================================
// PHASE 2H-6: ENTERPRISE OPERATIONS COMMAND CENTER, WORKFLOW ORCHESTRATION & SLA CONTROL
// ============================================================================

export type SLAState = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'ESCALATED' | 'RESOLVED';

export type ExceptionType =
  | 'MISSING_GARMENT'
  | 'QUALITY_FAILURE'
  | 'REWORK_REQUIRED'
  | 'DELAYED_PROCESSING'
  | 'PICKUP_FAILURE'
  | 'DELIVERY_FAILURE'
  | 'INVENTORY_SHORTAGE'
  | 'BRANCH_CAPACITY_ISSUE'
  | 'SLA_BREACH';

export type ExceptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ExceptionStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';

export interface WorkflowException {
  exceptionId: string;
  orgId: string;
  divisionId: AppDivision | string;
  franchiseId?: string | null;
  branchId: string;
  orderId?: string;
  garmentId?: string;
  exceptionType: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  title: string;
  description: string;
  assignedRole: UserRole | string;
  assignedUserId?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  escalatedToRole?: string;
  escalatedAt?: string;
  escalationReason?: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  history: Array<{
    previousStatus: ExceptionStatus;
    newStatus: ExceptionStatus;
    actorId: string;
    actorRole: string;
    notes?: string;
    timestamp: string;
  }>;
}

export interface OrderSLAMetrics {
  orderId: string;
  orgId: string;
  divisionId: AppDivision | string;
  franchiseId?: string | null;
  branchId: string;
  customerName: string;
  currentState: string;
  createdTimestamp: string;
  slaTargetHours: number;
  elapsedHours: number;
  remainingHours: number;
  slaState: SLAState;
  warningThresholdHours: number;
  isBreached: boolean;
  isEscalated: boolean;
  escalationLevel?: string;
  lastEscalatedAt?: string;
}

export interface OperationsCommandCenterSummary {
  orgId: string;
  activeOrdersCount: number;
  completedOrdersCount: number;
  slaBreakdown: {
    onTrack: number;
    atRisk: number;
    breached: number;
    escalated: number;
    resolved: number;
    slaComplianceRate: number;
  };
  stageBreakdown: {
    pickupPending: number;
    intakeInspected: number;
    processing: number;
    qualityInspection: number;
    reworkQueue: number;
    readyForDispatch: number;
    outForDelivery: number;
  };
  exceptionMetrics: {
    totalOpen: number;
    criticalCount: number;
    highCount: number;
    acknowledgedCount: number;
    inProgressCount: number;
    resolvedCount: number;
  };
  capacityOverview: {
    totalActiveBranches: number;
    averageBranchUtilization: number;
    overCapacityBranchesCount: number;
  };
  divisionBreakdown: Array<{
    divisionId: AppDivision | string;
    divisionName: string;
    activeOrders: number;
    breachedSlaCount: number;
    reworkCount: number;
    exceptionCount: number;
  }>;
  criticalAlerts: Array<{
    alertId: string;
    severity: ExceptionSeverity;
    message: string;
    branchId: string;
    orderId?: string;
    timestamp: string;
  }>;
  generatedAt: string;
}

export interface BranchCapacityMetrics {
  branchId: string;
  branchName: string;
  orgId: string;
  divisionIds: AppDivision[];
  activeOrdersCount: number;
  maxDailyCapacity: number;
  utilizationPercentage: number;
  pendingInspectionCount: number;
  reworkCount: number;
  dispatchBacklogCount: number;
  averageCycleTimeHours: number;
  slaRiskCount: number;
  isOverCapacity: boolean;
}







