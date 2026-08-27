import { LoggerService } from './loggerService';
import { TaxEngineService } from './taxEngineService';
import { IdempotencyService } from './idempotencyService';
import { FinancialReconciliationService } from './financialReconciliationService';
import { AuditChainService } from './auditChainService';
import { AppDivision, RoyaltyTierSlab, RoyaltyModel } from '../../src/types';

export type FinancialAccountType =
  | 'ACCOUNTS_RECEIVABLE'
  | 'SALES_REVENUE'
  | 'TAX_PAYABLE_GST'
  | 'ROYALTY_EXPENSE'
  | 'ROYALTY_PAYABLE'
  | 'PLATFORM_COMMISSION_EXPENSE'
  | 'PLATFORM_COMMISSION_PAYABLE'
  | 'ACCOUNTS_PAYABLE_FRANCHISEE'
  | 'ACCOUNTS_PAYABLE_VENDOR'
  | 'INVENTORY_ASSET'
  | 'INVENTORY_SHRINKAGE_EXPENSE'
  | 'BANK_CASH'
  | 'CUSTOMER_REFUNDS_PAYABLE'
  | 'INTER_DIVISION_CLEARING';

export interface FinancialLedgerLine {
  lineId: string;
  accountId: FinancialAccountType;
  accountName: string;
  debitInMinorUnits: number;
  creditInMinorUnits: number;
  description: string;
}

export type FinancialLedgerTransactionType =
  | 'ORDER_FINALIZATION'
  | 'ROYALTY_ACCRUAL'
  | 'SETTLEMENT_PAYOUT'
  | 'COMMISSION_CHARGE'
  | 'TAX_LIABILITY'
  | 'REVERSAL'
  | 'PROCUREMENT_AP'
  | 'INVENTORY_WRITE_OFF'
  | 'MANUAL_ADJUSTMENT'
  | 'INTER_DIVISION_TRANSFER';

export type FinancialLedgerStatus = 'POSTED' | 'REVERSED' | 'PENDING';

export interface FinancialLedgerTransaction {
  transactionId: string;
  orgId: string;
  divisionId: AppDivision | string;
  franchiseId: string | null;
  branchId: string;
  transactionType: FinancialLedgerTransactionType;
  referenceId: string;
  reversalOfTransactionId?: string;
  currency: string;
  entries: FinancialLedgerLine[];
  totalDebitInMinorUnits: number;
  totalCreditInMinorUnits: number;
  isBalanced: boolean;
  status: FinancialLedgerStatus;
  idempotencyKey?: string;
  actorId: string;
  actorRole: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RoyaltyCalculationResult {
  calculationId: string;
  orgId: string;
  franchiseId: string | null;
  eligibleRevenueInMinorUnits: number;
  calculatedRoyaltyInMinorUnits: number;
  royaltyModel: string;
  currency: string;
  isCorporateOwned: boolean;
  slabBreakdown?: Array<{
    slabId: string;
    minMinor: number;
    maxMinor: number | null;
    ratePercentage: number;
    portionInMinor: number;
    royaltyInMinor: number;
  }>;
  milestoneIncentiveApplied?: boolean;
  milestoneDiscountInMinorUnits?: number;
  effectiveRatePercentage: number;
  timestamp: string;
}

export interface AutomatedSettlementResult {
  settlementId: string;
  orgId: string;
  franchiseId: string;
  settlementPeriod: string;
  currency: string;
  grossRevenueInMinorUnits: number;
  eligibleRevenueInMinorUnits: number;
  royaltyAmountInMinorUnits: number;
  platformCommissionInMinorUnits: number;
  taxWithheldInMinorUnits: number;
  netPayoutInMinorUnits: number;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID' | 'RECONCILED';
  sourceTransactionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAuditLog {
  auditId: string;
  orgId: string;
  action: string;
  entity: string;
  entityId: string;
  actorId: string;
  actorRole: string;
  details: string;
  timestamp: string;
}

export class FinancialLedgerService {
  private static ledgerStore: Map<string, FinancialLedgerTransaction> = new Map();
  private static idempotencyStore: Map<string, FinancialLedgerTransaction> = new Map();
  private static auditLogs: FinancialAuditLog[] = [];
  private static settlementsStore: Map<string, AutomatedSettlementResult> = new Map();

  /**
   * Reset store (used for test isolation)
   */
  public static resetStore(): void {
    this.ledgerStore.clear();
    this.idempotencyStore.clear();
    this.auditLogs = [];
    this.settlementsStore.clear();
    FinancialReconciliationService.resetStore();
  }

  /**
   * Record immutable audit log entry
   */
  public static logFinancialAudit(
    orgId: string,
    action: string,
    entity: string,
    entityId: string,
    actorId: string,
    actorRole: string,
    details: string
  ): FinancialAuditLog {
    const entry: FinancialAuditLog = {
      auditId: `faudit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orgId,
      action,
      entity,
      entityId,
      actorId,
      actorRole,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(entry);
    LoggerService.info(`[Financial Audit] ${action} on ${entity}:${entityId} by ${actorId} (${actorRole})`, {
      orgId,
      action,
      entity,
      entityId,
    });
    AuditChainService.appendAuditEntry({
      eventType: 'FINANCIAL_MUTATION',
      actorId,
      actorRole,
      orgId,
      entityType: entity,
      entityId,
      action,
      payload: { details },
      timestamp: entry.timestamp,
    });
    return entry;
  }

  public static getAuditLogs(orgId: string): FinancialAuditLog[] {
    return this.auditLogs.filter((log) => log.orgId === orgId);
  }

  /**
   * Post a balanced double-entry transaction to the ledger
   * Strict Immutability: Total Debit MUST equal Total Credit
   */
  public static postTransaction(transaction: FinancialLedgerTransaction): FinancialLedgerTransaction {
    // 1. Check idempotency if key is provided
    if (transaction.idempotencyKey) {
      const existing = this.idempotencyStore.get(transaction.idempotencyKey);
      if (existing) {
        LoggerService.info(`Idempotency HIT for transaction key [${transaction.idempotencyKey}]`, {
          transactionId: existing.transactionId,
        });
        return existing;
      }
    }

    // 2. Validate line items
    if (!transaction.entries || transaction.entries.length === 0) {
      throw new Error('Ledger transaction must contain at least one debit and one credit line item.');
    }

    // 3. Calculate and verify balancing
    const totalDebit = transaction.entries.reduce((acc, curr) => acc + (curr.debitInMinorUnits || 0), 0);
    const totalCredit = transaction.entries.reduce((acc, curr) => acc + (curr.creditInMinorUnits || 0), 0);

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Ledger transaction is out of balance: Total Debit (${totalDebit}) does not equal Total Credit (${totalCredit}).`
      );
    }

    const timestamp = transaction.timestamp || new Date().toISOString();

    // 4. Validate financial period lock (reject direct mutations in closed periods)
    FinancialReconciliationService.assertPeriodOpenForPosting(
      transaction.orgId,
      timestamp,
      { actorId: transaction.actorId, actorRole: transaction.actorRole }
    );

    const balancedTx: FinancialLedgerTransaction = {
      ...transaction,
      totalDebitInMinorUnits: totalDebit,
      totalCreditInMinorUnits: totalCredit,
      isBalanced: true,
      status: transaction.status || 'POSTED',
      timestamp,
    };

    // 5. Store transaction immutably
    this.ledgerStore.set(balancedTx.transactionId, balancedTx);

    if (balancedTx.idempotencyKey) {
      this.idempotencyStore.set(balancedTx.idempotencyKey, balancedTx);
    }

    // 6. Audit log
    this.logFinancialAudit(
      balancedTx.orgId,
      'POST_LEDGER_TRANSACTION',
      'FinancialLedgerTransaction',
      balancedTx.transactionId,
      balancedTx.actorId,
      balancedTx.actorRole,
      `Posted ${balancedTx.transactionType} for reference ${balancedTx.referenceId} with total ${totalDebit} ${balancedTx.currency}`
    );

    return balancedTx;
  }

  /**
   * Immutability Protection: Update is strictly prohibited
   */
  public static updateTransaction(): never {
    throw new Error(
      'Financial ledger records are immutable. Direct updates are prohibited by enterprise accounting policy. Use compensating reversals.'
    );
  }

  /**
   * Immutability Protection: Delete is strictly prohibited
   */
  public static deleteTransaction(): never {
    throw new Error(
      'Financial ledger records are immutable. Direct deletions are prohibited by enterprise accounting policy. Use compensating reversals.'
    );
  }

  /**
   * Order Finalization: Recognizes Sales Revenue, Accounts Receivable, and GST Liabilities
   */
  public static finalizeOrder(params: {
    orderId: string;
    orgId: string;
    divisionId: AppDivision | string;
    franchiseId?: string | null;
    branchId: string;
    customerId: string;
    totalAmountInMinorUnits: number;
    taxAmountInMinorUnits?: number;
    hsnSacCode?: string;
    currency?: string;
    actor: { actorId: string; actorRole: string };
    idempotencyKey?: string;
  }): { transaction: FinancialLedgerTransaction; taxBreakdown: any } {
    const currency = params.currency || 'INR';
    const hsnSacCode = params.hsnSacCode || '998813';

    // Calculate tax using TaxEngineService
    const taxCalc = TaxEngineService.calculateTax(
      params.orgId,
      params.totalAmountInMinorUnits,
      hsnSacCode,
      new Date().toISOString(),
      { taxTreatment: 'INTRA_STATE' }
    );

    const taxAmount = params.taxAmountInMinorUnits !== undefined
      ? params.taxAmountInMinorUnits
      : taxCalc.breakdown.totalTaxAmountInMinorUnits;

    const netTaxableRevenue = params.totalAmountInMinorUnits - taxAmount;

    const txId = `ltx-ord-${params.orderId}-${Date.now()}`;
    const lines: FinancialLedgerLine[] = [
      {
        lineId: `line-ar-${params.orderId}`,
        accountId: 'ACCOUNTS_RECEIVABLE',
        accountName: 'Accounts Receivable - Customers',
        debitInMinorUnits: params.totalAmountInMinorUnits,
        creditInMinorUnits: 0,
        description: `Customer receivable for Order ${params.orderId}`,
      },
      {
        lineId: `line-rev-${params.orderId}`,
        accountId: 'SALES_REVENUE',
        accountName: `Sales Revenue (${params.divisionId})`,
        debitInMinorUnits: 0,
        creditInMinorUnits: netTaxableRevenue,
        description: `Recognized revenue for Order ${params.orderId}`,
      },
      {
        lineId: `line-tax-${params.orderId}`,
        accountId: 'TAX_PAYABLE_GST',
        accountName: 'GST Output Tax Liability Payable',
        debitInMinorUnits: 0,
        creditInMinorUnits: taxAmount,
        description: `GST liability (${hsnSacCode}) for Order ${params.orderId}`,
      },
    ];

    const transaction: FinancialLedgerTransaction = {
      transactionId: txId,
      orgId: params.orgId,
      divisionId: params.divisionId,
      franchiseId: params.franchiseId || null,
      branchId: params.branchId,
      transactionType: 'ORDER_FINALIZATION',
      referenceId: params.orderId,
      currency,
      entries: lines,
      totalDebitInMinorUnits: params.totalAmountInMinorUnits,
      totalCreditInMinorUnits: params.totalAmountInMinorUnits,
      isBalanced: true,
      status: 'POSTED',
      idempotencyKey: params.idempotencyKey,
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
      timestamp: new Date().toISOString(),
      metadata: {
        customerId: params.customerId,
        hsnSacCode,
        taxTreatment: taxCalc.snapshot.taxTreatment,
      },
    };

    const postedTx = this.postTransaction(transaction);
    return { transaction: postedTx, taxBreakdown: taxCalc };
  }

  /**
   * Deterministic Commercial Royalty Engine:
   * Supports Fixed Percentage, Progressive Tiered Marginal Slabs, and Volume Milestone Incentives
   */
  public static calculateRoyalty(params: {
    orgId: string;
    franchiseId: string | null;
    eligibleRevenueInMinorUnits: number;
    isCorporateOwned?: boolean;
    model?: 'fixed_percentage' | 'tiered' | 'volume_milestone';
    customPercentage?: number;
    tieredSlabs?: RoyaltyTierSlab[];
    milestoneThresholdInMinorUnits?: number;
    milestoneIncentivePercentage?: number;
    currency?: string;
  }): RoyaltyCalculationResult {
    const currency = params.currency || 'INR';

    // Corporate exemption rule
    if (params.isCorporateOwned || !params.franchiseId) {
      return {
        calculationId: `roy-calc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orgId: params.orgId,
        franchiseId: params.franchiseId,
        eligibleRevenueInMinorUnits: params.eligibleRevenueInMinorUnits,
        calculatedRoyaltyInMinorUnits: 0,
        royaltyModel: 'none_corporate',
        currency,
        isCorporateOwned: true,
        effectiveRatePercentage: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const model = params.model || 'fixed_percentage';
    let totalRoyalty = 0;
    let slabBreakdown: RoyaltyCalculationResult['slabBreakdown'] = undefined;
    let milestoneApplied = false;
    let milestoneDiscount = 0;

    if (model === 'fixed_percentage') {
      const rate = params.customPercentage !== undefined ? params.customPercentage : 5.0;
      totalRoyalty = Math.round((params.eligibleRevenueInMinorUnits * rate) / 100);
    } else if (model === 'tiered') {
      // Default standard slabs if not custom-specified
      const slabs: RoyaltyTierSlab[] = params.tieredSlabs || [
        { slabId: 'slab-01', minAmountInMinorUnits: 0, maxAmountInMinorUnits: 100000000, ratePercentage: 5.0 }, // Up to ₹10L (5%)
        { slabId: 'slab-02', minAmountInMinorUnits: 100000000, maxAmountInMinorUnits: 250000000, ratePercentage: 7.0 }, // ₹10L to ₹25L (7%)
        { slabId: 'slab-03', minAmountInMinorUnits: 250000000, maxAmountInMinorUnits: null, ratePercentage: 9.0 }, // ₹25L+ (9%)
      ];

      slabBreakdown = [];
      let remainingRevenue = params.eligibleRevenueInMinorUnits;

      for (const slab of slabs) {
        if (remainingRevenue <= 0) break;
        const slabCapacity = slab.maxAmountInMinorUnits !== null
          ? slab.maxAmountInMinorUnits - slab.minAmountInMinorUnits
          : Infinity;

        const portionInSlab = Math.min(remainingRevenue, slabCapacity);
        const slabRoyalty = Math.round((portionInSlab * slab.ratePercentage) / 100);

        slabBreakdown.push({
          slabId: slab.slabId,
          minMinor: slab.minAmountInMinorUnits,
          maxMinor: slab.maxAmountInMinorUnits,
          ratePercentage: slab.ratePercentage,
          portionInMinor: portionInSlab,
          royaltyInMinor: slabRoyalty,
        });

        totalRoyalty += slabRoyalty;
        remainingRevenue -= portionInSlab;
      }
    } else if (model === 'volume_milestone') {
      // Base rate of 6%
      const baseRate = params.customPercentage || 6.0;
      const baseRoyalty = Math.round((params.eligibleRevenueInMinorUnits * baseRate) / 100);
      const threshold = params.milestoneThresholdInMinorUnits || 500000000; // ₹50 Lakhs
      const incentivePct = params.milestoneIncentivePercentage || 1.0; // 1% discount

      if (params.eligibleRevenueInMinorUnits >= threshold) {
        milestoneApplied = true;
        milestoneDiscount = Math.round((params.eligibleRevenueInMinorUnits * incentivePct) / 100);
        totalRoyalty = Math.max(0, baseRoyalty - milestoneDiscount);
      } else {
        totalRoyalty = baseRoyalty;
      }
    }

    const effectiveRate = params.eligibleRevenueInMinorUnits > 0
      ? Number(((totalRoyalty / params.eligibleRevenueInMinorUnits) * 100).toFixed(2))
      : 0;

    return {
      calculationId: `roy-calc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orgId: params.orgId,
      franchiseId: params.franchiseId,
      eligibleRevenueInMinorUnits: params.eligibleRevenueInMinorUnits,
      calculatedRoyaltyInMinorUnits: totalRoyalty,
      royaltyModel: model,
      currency,
      isCorporateOwned: false,
      slabBreakdown,
      milestoneIncentiveApplied: milestoneApplied,
      milestoneDiscountInMinorUnits: milestoneDiscount,
      effectiveRatePercentage: effectiveRate,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Post Royalty Accrual Double-Entry to Financial Ledger
   */
  public static accrueRoyalty(params: {
    orgId: string;
    divisionId: AppDivision | string;
    franchiseId: string;
    branchId: string;
    orderId: string;
    calculatedRoyaltyInMinorUnits: number;
    currency?: string;
    actor: { actorId: string; actorRole: string };
    idempotencyKey?: string;
  }): FinancialLedgerTransaction {
    const currency = params.currency || 'INR';
    const amount = params.calculatedRoyaltyInMinorUnits;

    if (amount <= 0) {
      throw new Error('Royalty accrual amount must be greater than zero.');
    }

    const txId = `ltx-roy-${params.orderId}-${Date.now()}`;
    const lines: FinancialLedgerLine[] = [
      {
        lineId: `line-roy-exp-${params.orderId}`,
        accountId: 'ROYALTY_EXPENSE',
        accountName: 'Franchise Royalty Expense',
        debitInMinorUnits: amount,
        creditInMinorUnits: 0,
        description: `Royalty expense on Order ${params.orderId} for Franchise ${params.franchiseId}`,
      },
      {
        lineId: `line-roy-pay-${params.orderId}`,
        accountId: 'ROYALTY_PAYABLE',
        accountName: 'Franchise Royalty Payable to HQ',
        debitInMinorUnits: 0,
        creditInMinorUnits: amount,
        description: `Royalty liability for Order ${params.orderId} to FabriQ HQ`,
      },
    ];

    const transaction: FinancialLedgerTransaction = {
      transactionId: txId,
      orgId: params.orgId,
      divisionId: params.divisionId,
      franchiseId: params.franchiseId,
      branchId: params.branchId,
      transactionType: 'ROYALTY_ACCRUAL',
      referenceId: params.orderId,
      currency,
      entries: lines,
      totalDebitInMinorUnits: amount,
      totalCreditInMinorUnits: amount,
      isBalanced: true,
      status: 'POSTED',
      idempotencyKey: params.idempotencyKey,
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
      timestamp: new Date().toISOString(),
    };

    return this.postTransaction(transaction);
  }

  /**
   * Automated Franchise Commercial Settlement Generation
   */
  public static generateSettlement(params: {
    orgId: string;
    franchiseId: string;
    settlementPeriod: string;
    platformCommissionPercentage?: number;
    currency?: string;
    actor: { actorId: string; actorRole: string };
    idempotencyKey?: string;
  }): AutomatedSettlementResult {
    const currency = params.currency || 'INR';
    const commissionRate = params.platformCommissionPercentage !== undefined
      ? params.platformCommissionPercentage
      : 2.5; // 2.5% platform fee

    // Check idempotency
    if (params.idempotencyKey) {
      const existing = Array.from(this.settlementsStore.values()).find(
        (s) => (s as any).idempotencyKey === params.idempotencyKey
      );
      if (existing) return existing;
    }

    // Aggregate eligible transactions for franchise
    const franchiseTxs = Array.from(this.ledgerStore.values()).filter(
      (tx) =>
        tx.orgId === params.orgId &&
        tx.franchiseId === params.franchiseId &&
        tx.status === 'POSTED' &&
        tx.transactionType === 'ORDER_FINALIZATION'
    );

    const grossRevenue = franchiseTxs.reduce((sum, tx) => sum + tx.totalDebitInMinorUnits, 0);
    const eligibleRevenue = grossRevenue;

    // Calculate royalty
    const royaltyCalc = this.calculateRoyalty({
      orgId: params.orgId,
      franchiseId: params.franchiseId,
      eligibleRevenueInMinorUnits: eligibleRevenue,
      model: 'tiered',
    });

    const royaltyAmount = royaltyCalc.calculatedRoyaltyInMinorUnits;
    const platformCommission = Math.round((eligibleRevenue * commissionRate) / 100);
    const taxWithheld = 0;
    const netPayout = Math.max(0, eligibleRevenue - royaltyAmount - platformCommission - taxWithheld);

    const settlementId = `stl-${params.settlementPeriod}-${params.franchiseId}-${Date.now()}`;
    const settlement: AutomatedSettlementResult = {
      settlementId,
      orgId: params.orgId,
      franchiseId: params.franchiseId,
      settlementPeriod: params.settlementPeriod,
      currency,
      grossRevenueInMinorUnits: grossRevenue,
      eligibleRevenueInMinorUnits: eligibleRevenue,
      royaltyAmountInMinorUnits: royaltyAmount,
      platformCommissionInMinorUnits: platformCommission,
      taxWithheldInMinorUnits: taxWithheld,
      netPayoutInMinorUnits: netPayout,
      status: 'APPROVED',
      sourceTransactionIds: franchiseTxs.map((t) => t.transactionId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (params.idempotencyKey) {
      (settlement as any).idempotencyKey = params.idempotencyKey;
    }

    this.settlementsStore.set(settlementId, settlement);

    // Post settlement payout transaction to ledger upon approval
    const lines: FinancialLedgerLine[] = [
      {
        lineId: `line-stl-roy-${settlementId}`,
        accountId: 'ROYALTY_PAYABLE',
        accountName: 'Royalty Deductions Settled',
        debitInMinorUnits: royaltyAmount,
        creditInMinorUnits: 0,
        description: `Royalty deduction for settlement ${settlementId}`,
      },
      {
        lineId: `line-stl-comm-${settlementId}`,
        accountId: 'PLATFORM_COMMISSION_EXPENSE',
        accountName: 'Platform Commission Expense',
        debitInMinorUnits: platformCommission,
        creditInMinorUnits: 0,
        description: `Platform fee for settlement ${settlementId}`,
      },
      {
        lineId: `line-stl-pay-${settlementId}`,
        accountId: 'ACCOUNTS_PAYABLE_FRANCHISEE',
        accountName: 'Franchisee Net Settlement Disbursement',
        debitInMinorUnits: netPayout,
        creditInMinorUnits: 0,
        description: `Net payable to franchisee ${params.franchiseId}`,
      },
      {
        lineId: `line-stl-cash-${settlementId}`,
        accountId: 'BANK_CASH',
        accountName: 'Central Treasury Bank Account',
        debitInMinorUnits: 0,
        creditInMinorUnits: eligibleRevenue,
        description: `Settlement revenue disbursement for period ${params.settlementPeriod}`,
      },
    ];

    const stlTx: FinancialLedgerTransaction = {
      transactionId: `ltx-stl-${settlementId}`,
      orgId: params.orgId,
      divisionId: 'laundry',
      franchiseId: params.franchiseId,
      branchId: 'b-central-treasury',
      transactionType: 'SETTLEMENT_PAYOUT',
      referenceId: settlementId,
      currency,
      entries: lines,
      totalDebitInMinorUnits: eligibleRevenue,
      totalCreditInMinorUnits: eligibleRevenue,
      isBalanced: true,
      status: 'POSTED',
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
      timestamp: new Date().toISOString(),
    };

    this.postTransaction(stlTx);
    return settlement;
  }

  /**
   * Order Cancellation: Generates Balanced Compensating Reversal Transaction
   */
  public static reverseTransaction(
    originalTransactionId: string,
    orgId: string,
    actor: { actorId: string; actorRole: string },
    reason: string
  ): FinancialLedgerTransaction {
    const original = this.ledgerStore.get(originalTransactionId);
    if (!original) {
      throw new Error(`Transaction '${originalTransactionId}' not found.`);
    }

    if (original.orgId !== orgId) {
      throw new Error(`Cross-tenant financial access violation: ${orgId} != ${original.orgId}`);
    }

    if (original.status === 'REVERSED') {
      throw new Error(`Transaction '${originalTransactionId}' has already been reversed.`);
    }

    // Create inverted compensating lines
    const reversalLines: FinancialLedgerLine[] = original.entries.map((entry, idx) => ({
      lineId: `line-rev-${idx}-${original.transactionId}`,
      accountId: entry.accountId,
      accountName: entry.accountName,
      debitInMinorUnits: entry.creditInMinorUnits, // Inverted
      creditInMinorUnits: entry.debitInMinorUnits, // Inverted
      description: `Reversal of: ${entry.description} (Reason: ${reason})`,
    }));

    const reversalTxId = `ltx-rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const reversalTx: FinancialLedgerTransaction = {
      transactionId: reversalTxId,
      orgId,
      divisionId: original.divisionId,
      franchiseId: original.franchiseId,
      branchId: original.branchId,
      transactionType: 'REVERSAL',
      referenceId: original.referenceId,
      reversalOfTransactionId: original.transactionId,
      currency: original.currency,
      entries: reversalLines,
      totalDebitInMinorUnits: original.totalCreditInMinorUnits,
      totalCreditInMinorUnits: original.totalDebitInMinorUnits,
      isBalanced: true,
      status: 'POSTED',
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      timestamp: new Date().toISOString(),
      metadata: { originalTransactionId, reason },
    };

    // Mark original as REVERSED
    original.status = 'REVERSED';
    this.ledgerStore.set(original.transactionId, original);

    // Post reversal transaction
    const postedReversal = this.postTransaction(reversalTx);

    this.logFinancialAudit(
      orgId,
      'REVERSE_FINANCIAL_TRANSACTION',
      'FinancialLedgerTransaction',
      originalTransactionId,
      actor.actorId,
      actorRoleSafe(actor.actorRole),
      `Compensating reversal ${reversalTxId} created. Reason: ${reason}`
    );

    return postedReversal;
  }

  /**
   * Procurement AP Posting: Goods Receipt Note (GRN) creates Accounts Payable
   */
  public static recordGoodsReceiptAP(params: {
    orgId: string;
    divisionId: AppDivision | string;
    branchId: string;
    grnId: string;
    poId: string;
    vendorId: string;
    totalAmountInMinorUnits: number;
    currency?: string;
    actor: { actorId: string; actorRole: string };
  }): FinancialLedgerTransaction {
    const currency = params.currency || 'INR';
    const amount = params.totalAmountInMinorUnits;

    const lines: FinancialLedgerLine[] = [
      {
        lineId: `line-grn-asset-${params.grnId}`,
        accountId: 'INVENTORY_ASSET',
        accountName: 'Raw Materials & Chemical Inventory Asset',
        debitInMinorUnits: amount,
        creditInMinorUnits: 0,
        description: `Inventory received on GRN ${params.grnId} for PO ${params.poId}`,
      },
      {
        lineId: `line-grn-ap-${params.grnId}`,
        accountId: 'ACCOUNTS_PAYABLE_VENDOR',
        accountName: 'Accounts Payable - Vendors',
        debitInMinorUnits: 0,
        creditInMinorUnits: amount,
        description: `Vendor payable to ${params.vendorId} for GRN ${params.grnId}`,
      },
    ];

    const tx: FinancialLedgerTransaction = {
      transactionId: `ltx-grn-${params.grnId}`,
      orgId: params.orgId,
      divisionId: params.divisionId,
      franchiseId: null,
      branchId: params.branchId,
      transactionType: 'PROCUREMENT_AP',
      referenceId: params.grnId,
      currency,
      entries: lines,
      totalDebitInMinorUnits: amount,
      totalCreditInMinorUnits: amount,
      isBalanced: true,
      status: 'POSTED',
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
      timestamp: new Date().toISOString(),
    };

    return this.postTransaction(tx);
  }

  /**
   * Inventory Shrinkage/Write-Off Expense Posting
   */
  public static recordInventoryWriteOff(params: {
    orgId: string;
    divisionId: AppDivision | string;
    branchId: string;
    writeOffId: string;
    itemId: string;
    amountInMinorUnits: number;
    reason: string;
    actor: { actorId: string; actorRole: string };
  }): FinancialLedgerTransaction {
    const amount = params.amountInMinorUnits;

    const lines: FinancialLedgerLine[] = [
      {
        lineId: `line-wo-exp-${params.writeOffId}`,
        accountId: 'INVENTORY_SHRINKAGE_EXPENSE',
        accountName: 'Inventory Shrinkage & Loss Expense',
        debitInMinorUnits: amount,
        creditInMinorUnits: 0,
        description: `Inventory write-off ${params.writeOffId} for item ${params.itemId}: ${params.reason}`,
      },
      {
        lineId: `line-wo-asset-${params.writeOffId}`,
        accountId: 'INVENTORY_ASSET',
        accountName: 'Inventory Asset Stock Deducted',
        debitInMinorUnits: 0,
        creditInMinorUnits: amount,
        description: `Stock written off on ${params.writeOffId}`,
      },
    ];

    const tx: FinancialLedgerTransaction = {
      transactionId: `ltx-wo-${params.writeOffId}`,
      orgId: params.orgId,
      divisionId: params.divisionId,
      franchiseId: null,
      branchId: params.branchId,
      transactionType: 'INVENTORY_WRITE_OFF',
      referenceId: params.writeOffId,
      currency: 'INR',
      entries: lines,
      totalDebitInMinorUnits: amount,
      totalCreditInMinorUnits: amount,
      isBalanced: true,
      status: 'POSTED',
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
      timestamp: new Date().toISOString(),
    };

    return this.postTransaction(tx);
  }

  /**
   * Customer 360 Financial Spending Aggregator
   */
  public static getCustomerFinancialSummary(customerId: string, orgId: string): {
    customerId: string;
    orgId: string;
    totalGrossSpentInMinorUnits: number;
    totalRefundedInMinorUnits: number;
    netSpentInMinorUnits: number;
    finalizedOrderCount: number;
  } {
    const allCustomerTxs = Array.from(this.ledgerStore.values()).filter(
      (tx) => tx.orgId === orgId && tx.metadata?.customerId === customerId
    );

    let grossSpent = 0;
    let refunded = 0;
    let orderCount = 0;

    for (const tx of allCustomerTxs) {
      if (tx.transactionType === 'ORDER_FINALIZATION' && tx.status === 'POSTED') {
        grossSpent += tx.totalDebitInMinorUnits;
        orderCount++;
      } else if (tx.transactionType === 'REVERSAL' || tx.status === 'REVERSED') {
        refunded += tx.totalDebitInMinorUnits;
      }
    }

    return {
      customerId,
      orgId,
      totalGrossSpentInMinorUnits: grossSpent,
      totalRefundedInMinorUnits: refunded,
      netSpentInMinorUnits: Math.max(0, grossSpent - refunded),
      finalizedOrderCount: orderCount,
    };
  }

  /**
   * Cross-Division Financial Balancing & Reconciliation
   */
  public static reconcileInterDivisionSettlement(
    orgId: string,
    divisionA: string,
    divisionB: string
  ): { isBalanced: boolean; discrepancyInMinorUnits: number; totalTransferredInMinorUnits: number } {
    const interTxs = Array.from(this.ledgerStore.values()).filter(
      (tx) =>
        tx.orgId === orgId &&
        (tx.divisionId === divisionA || tx.divisionId === divisionB) &&
        tx.transactionType === 'INTER_DIVISION_TRANSFER'
    );

    let totalA = 0;
    let totalB = 0;

    for (const tx of interTxs) {
      if (tx.divisionId === divisionA) totalA += tx.totalDebitInMinorUnits;
      if (tx.divisionId === divisionB) totalB += tx.totalDebitInMinorUnits;
    }

    const diff = Math.abs(totalA - totalB);
    return {
      isBalanced: diff === 0,
      discrepancyInMinorUnits: diff,
      totalTransferredInMinorUnits: totalA + totalB,
    };
  }

  /**
   * Query transactions with Multi-Tenant & RBAC Isolation
   */
  public static queryTransactions(params: {
    orgId: string;
    franchiseId?: string | null;
    branchId?: string;
    divisionId?: string;
    transactionType?: FinancialLedgerTransactionType;
    user: { orgId: string; role: string; franchiseId?: string | null; branchId?: string };
  }): FinancialLedgerTransaction[] {
    // 1. Cross-tenant check
    if (params.orgId !== params.user.orgId) {
      throw new Error(`Cross-tenant financial access violation: User org '${params.user.orgId}' !== Target org '${params.orgId}'`);
    }

    // 2. Customer role check
    if (params.user.role === 'customer') {
      throw new Error('Access denied: Customer role is prohibited from accessing financial ledger records.');
    }

    // 3. Franchise isolation
    if (params.user.role === 'franchise_owner') {
      if (!params.user.franchiseId) {
        throw new Error('Franchise owner missing franchise identifier context.');
      }
      if (params.franchiseId && params.franchiseId !== params.user.franchiseId) {
        throw new Error(`Franchise isolation violation: Cannot access data for franchise '${params.franchiseId}'`);
      }
    }

    // 4. Branch staff restriction
    if (params.user.role === 'store_staff' && params.transactionType === 'ROYALTY_ACCRUAL') {
      throw new Error('Access denied: Store staff role cannot access restricted franchise royalty accounts.');
    }

    return Array.from(this.ledgerStore.values()).filter((tx) => {
      if (tx.orgId !== params.orgId) return false;
      if (params.user.role === 'franchise_owner' && tx.franchiseId !== params.user.franchiseId) return false;
      if (params.franchiseId && tx.franchiseId !== params.franchiseId) return false;
      if (params.branchId && tx.branchId !== params.branchId) return false;
      if (params.divisionId && tx.divisionId !== params.divisionId) return false;
      if (params.transactionType && tx.transactionType !== params.transactionType) return false;
      return true;
    });
  }

  public static getTransactionById(txId: string, orgId: string): FinancialLedgerTransaction | undefined {
    const tx = this.ledgerStore.get(txId);
    if (!tx || tx.orgId !== orgId) return undefined;
    return tx;
  }
}

function actorRoleSafe(role?: string): string {
  return role || 'system';
}
