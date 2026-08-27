import { LoggerService } from './loggerService';
import { TaxEngineService } from './taxEngineService';
import { FinancialLedgerService, FinancialLedgerTransaction, FinancialLedgerLine } from './financialLedgerService';
import { AppDivision, ReconciliationStatus, PeriodStatus } from '../../src/types';

export type DiscrepancySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DiscrepancyCategory =
  | 'MISSING_LEDGER_ENTRY'
  | 'DUPLICATE_LEDGER_ENTRY'
  | 'AMOUNT_MISMATCH'
  | 'TAX_MISMATCH'
  | 'ROYALTY_MISMATCH'
  | 'SETTLEMENT_MISMATCH'
  | 'UNMATCHED_PAYMENT'
  | 'UNMATCHED_REFUND'
  | 'INVENTORY_ACCOUNTING_MISMATCH'
  | 'INTER_DIVISION_IMBALANCE'
  | 'PERIOD_LOCK_VIOLATION'
  | 'UNBALANCED_TRANSACTION';

export interface FinancialDiscrepancy {
  discrepancyId: string;
  orgId: string;
  category: DiscrepancyCategory;
  severity: DiscrepancySeverity;
  referenceId: string;
  sourceEntity: string;
  expectedAmountInMinorUnits: number;
  actualAmountInMinorUnits: number;
  varianceInMinorUnits: number;
  currency: string;
  description: string;
  detectedAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'WAIVED';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface FinancialReconciliationRecord {
  reconciliationId: string;
  orgId: string;
  divisionId?: AppDivision | string;
  franchiseId?: string | null;
  branchId?: string;
  reconciliationType:
    | 'ORDERS_LEDGER'
    | 'PAYMENTS_LEDGER'
    | 'REFUNDS_LEDGER'
    | 'ROYALTIES_LEDGER'
    | 'SETTLEMENTS_LEDGER'
    | 'TAXES_LEDGER'
    | 'PROCUREMENT_LEDGER'
    | 'INVENTORY_LEDGER'
    | 'INTER_DIVISION_CLEARING'
    | 'COMPREHENSIVE_PERIOD_CLOSE';
  periodId?: string;
  status: ReconciliationStatus;
  expectedTotalInMinorUnits: number;
  actualTotalInMinorUnits: number;
  varianceInMinorUnits: number;
  discrepancies: FinancialDiscrepancy[];
  sourceReferenceIds: string[];
  executionTimestamp: string;
  actorId: string;
  actorRole: string;
  metadata?: Record<string, any>;
}

export interface ManagedFinancialPeriod {
  periodId: string;
  orgId: string;
  name: string; // e.g. "FY2026-Q3" or "2026-08"
  startDate: string;
  endDate: string;
  status: PeriodStatus; // 'OPEN' | 'CLOSING' | 'CLOSED' | 'LOCKED'
  openedBy: string;
  openedAt: string;
  closedBy?: string;
  closedAt?: string;
  closingVerificationId?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  reopenReason?: string;
  lockOverrideAuthorizedRoles: string[];
}

export type AdjustmentStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'CANCELLED';

export interface FinancialAdjustmentRequest {
  adjustmentId: string;
  orgId: string;
  divisionId: AppDivision | string;
  franchiseId?: string | null;
  branchId: string;
  amountInMinorUnits: number;
  currency: string;
  debitAccountId: string;
  creditAccountId: string;
  reason: string;
  periodId: string;
  requestedBy: string;
  requesterRole: string;
  requestedAt: string;
  status: AdjustmentStatus;
  approvedBy?: string;
  approverRole?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  executedLedgerTransactionId?: string;
}

export class FinancialReconciliationService {
  private static reconciliationStore: Map<string, FinancialReconciliationRecord> = new Map();
  private static discrepancyStore: Map<string, FinancialDiscrepancy> = new Map();
  private static periodStore: Map<string, ManagedFinancialPeriod> = new Map();
  private static adjustmentStore: Map<string, FinancialAdjustmentRequest> = new Map();

  /**
   * Reset store (used for test isolation)
   */
  public static resetStore(): void {
    this.reconciliationStore.clear();
    this.discrepancyStore.clear();
    this.periodStore.clear();
    this.adjustmentStore.clear();
  }

  // ======================================================================
  // 1. FINANCIAL PERIOD MANAGEMENT & PERIOD CLOSE GATES
  // ======================================================================

  /**
   * Open a new financial period
   */
  public static openPeriod(params: {
    orgId: string;
    periodId: string;
    name: string;
    startDate: string;
    endDate: string;
    actor: { actorId: string; actorRole: string };
  }): ManagedFinancialPeriod {
    if (!['finance', 'super_admin', 'ceo', 'owner'].includes(params.actor.actorRole)) {
      throw new Error(`Unauthorized: Role '${params.actor.actorRole}' cannot open financial periods.`);
    }

    const existing = this.periodStore.get(params.periodId);
    if (existing && existing.orgId === params.orgId && (existing.status === 'OPEN' || existing.status === 'CLOSING')) {
      return existing;
    }

    const period: ManagedFinancialPeriod = {
      periodId: params.periodId,
      orgId: params.orgId,
      name: params.name,
      startDate: params.startDate,
      endDate: params.endDate,
      status: 'OPEN',
      openedBy: params.actor.actorId,
      openedAt: new Date().toISOString(),
      lockOverrideAuthorizedRoles: ['super_admin', 'ceo', 'finance'],
    };

    this.periodStore.set(period.periodId, period);
    FinancialLedgerService.logFinancialAudit(
      params.orgId,
      'OPEN_FINANCIAL_PERIOD',
      'ManagedFinancialPeriod',
      period.periodId,
      params.actor.actorId,
      params.actor.actorRole,
      `Opened financial period ${period.name} (${period.startDate} to ${period.endDate})`
    );

    return period;
  }

  /**
   * Check if date falls in a locked/closed period and enforce immutability
   */
  public static assertPeriodOpenForPosting(
    orgId: string,
    periodIdOrDate: string,
    actor?: { actorId: string; actorRole: string }
  ): void {
    const periods = Array.from(this.periodStore.values()).filter((p) => p.orgId === orgId);
    for (const period of periods) {
      const matchesId = period.periodId === periodIdOrDate;
      const matchesDate = periodIdOrDate >= period.startDate && periodIdOrDate <= period.endDate;
      if (matchesId || matchesDate) {
        if (period.status === 'CLOSED' || period.status === 'LOCKED') {
          // Check if actor has lock override authority
          if (actor && period.lockOverrideAuthorizedRoles.includes(actor.actorRole)) {
            // Authorized override for adjustments
            return;
          }
          throw new Error(
            `Period Lock Violation: Financial period '${period.periodId}' (${period.name}) is CLOSED/LOCKED. Direct mutations are prohibited.`
          );
        }
      }
    }
  }

  /**
   * Close a financial period with strict validation gate:
   * 1. All ledger transactions must be balanced
   * 2. No unresolved CRITICAL/HIGH discrepancies
   * 3. Comprehensive reconciliation must be RUN and PASS
   */
  public static closePeriod(params: {
    orgId: string;
    periodId: string;
    actor: { actorId: string; actorRole: string };
    forceOverride?: boolean;
  }): { success: boolean; period: ManagedFinancialPeriod; reconciliation: FinancialReconciliationRecord } {
    if (!['finance', 'super_admin', 'ceo', 'owner'].includes(params.actor.actorRole)) {
      throw new Error(`Unauthorized: Role '${params.actor.actorRole}' cannot close financial periods.`);
    }

    const period = this.periodStore.get(params.periodId);
    if (!period || period.orgId !== params.orgId) {
      throw new Error(`Financial period '${params.periodId}' not found.`);
    }

    if (period.status === 'CLOSED') {
      throw new Error(`Financial period '${params.periodId}' is already CLOSED.`);
    }

    // Step 1: Run comprehensive period close reconciliation
    const recon = this.runComprehensivePeriodReconciliation(params.orgId, params.periodId, params.actor);

    // Step 2: Gating rules
    const criticalDiscrepancies = recon.discrepancies.filter(
      (d) => (d.severity === 'CRITICAL' || d.severity === 'HIGH') && d.status === 'OPEN'
    );

    if (criticalDiscrepancies.length > 0 && !params.forceOverride) {
      period.status = 'CLOSING'; // Mark as closing in progress
      this.periodStore.set(period.periodId, period);

      FinancialLedgerService.logFinancialAudit(
        params.orgId,
        'PERIOD_CLOSE_REJECTED',
        'ManagedFinancialPeriod',
        period.periodId,
        params.actor.actorId,
        params.actor.actorRole,
        `Period close rejected for ${period.periodId}: ${criticalDiscrepancies.length} critical discrepancies detected.`
      );

      throw new Error(
        `Period Close Gating Failed: Cannot close period '${params.periodId}'. Found ${criticalDiscrepancies.length} unresolved critical discrepancies (Variance: ${recon.varianceInMinorUnits}). Resolve discrepancies before closing.`
      );
    }

    // Step 3: Successfully lock and close period
    period.status = 'CLOSED';
    period.closedBy = params.actor.actorId;
    period.closedAt = new Date().toISOString();
    period.closingVerificationId = recon.reconciliationId;
    this.periodStore.set(period.periodId, period);

    FinancialLedgerService.logFinancialAudit(
      params.orgId,
      'CLOSE_FINANCIAL_PERIOD',
      'ManagedFinancialPeriod',
      period.periodId,
      params.actor.actorId,
      params.actor.actorRole,
      `Successfully closed and locked period ${period.name} after verification ${recon.reconciliationId}`
    );

    return { success: true, period, reconciliation: recon };
  }

  /**
   * Reopen a closed period (Audit mandatory, restricted to CEO / Super Admin)
   */
  public static reopenPeriod(params: {
    orgId: string;
    periodId: string;
    reason: string;
    actor: { actorId: string; actorRole: string };
  }): ManagedFinancialPeriod {
    if (!['super_admin', 'ceo', 'owner'].includes(params.actor.actorRole)) {
      throw new Error(`Unauthorized: Reopening a locked period requires CEO or Super Admin authorization.`);
    }

    const period = this.periodStore.get(params.periodId);
    if (!period || period.orgId !== params.orgId) {
      throw new Error(`Financial period '${params.periodId}' not found.`);
    }

    period.status = 'OPEN';
    period.reopenedBy = params.actor.actorId;
    period.reopenedAt = new Date().toISOString();
    period.reopenReason = params.reason;
    this.periodStore.set(period.periodId, period);

    FinancialLedgerService.logFinancialAudit(
      params.orgId,
      'REOPEN_FINANCIAL_PERIOD',
      'ManagedFinancialPeriod',
      period.periodId,
      params.actor.actorId,
      params.actor.actorRole,
      `Reopened locked period ${period.periodId}. Reason: ${params.reason}`
    );

    return period;
  }

  public static getPeriods(orgId: string): ManagedFinancialPeriod[] {
    return Array.from(this.periodStore.values()).filter((p) => p.orgId === orgId);
  }

  public static getPeriodById(periodId: string, orgId: string): ManagedFinancialPeriod | undefined {
    const p = this.periodStore.get(periodId);
    if (!p || p.orgId !== orgId) return undefined;
    return p;
  }

  // ======================================================================
  // 2. MULTI-VECTOR RECONCILIATION ENGINES
  // ======================================================================

  /**
   * 1. Reconcile Orders ↔ Financial Ledger
   */
  public static reconcileOrdersWithLedger(params: {
    orgId: string;
    divisionId?: AppDivision | string;
    franchiseId?: string | null;
    orders: Array<{ orderId: string; expectedAmountInMinorUnits: number; divisionId: string; franchiseId?: string | null }>;
    actor: { actorId: string; actorRole: string };
  }): FinancialReconciliationRecord {
    const reconId = `rec-ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const discrepancies: FinancialDiscrepancy[] = [];
    const sourceReferenceIds: string[] = [];

    let totalExpected = 0;
    let totalActual = 0;

    for (const order of params.orders) {
      totalExpected += order.expectedAmountInMinorUnits;
      sourceReferenceIds.push(order.orderId);

      const matchingTxs = FinancialLedgerService.queryTransactions({
        orgId: params.orgId,
        transactionType: 'ORDER_FINALIZATION',
        user: { orgId: params.orgId, role: 'finance' },
      }).filter((tx) => tx.referenceId === order.orderId && tx.status === 'POSTED');

      if (matchingTxs.length === 0) {
        const disc: FinancialDiscrepancy = {
          discrepancyId: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          orgId: params.orgId,
          category: 'MISSING_LEDGER_ENTRY',
          severity: 'CRITICAL',
          referenceId: order.orderId,
          sourceEntity: 'Order',
          expectedAmountInMinorUnits: order.expectedAmountInMinorUnits,
          actualAmountInMinorUnits: 0,
          varianceInMinorUnits: order.expectedAmountInMinorUnits,
          currency: 'INR',
          description: `Order ${order.orderId} has no posted financial ledger transaction.`,
          detectedAt: new Date().toISOString(),
          status: 'OPEN',
        };
        discrepancies.push(disc);
        this.discrepancyStore.set(disc.discrepancyId, disc);
      } else if (matchingTxs.length > 1) {
        const actualSum = matchingTxs.reduce((s, t) => s + t.totalDebitInMinorUnits, 0);
        totalActual += actualSum;
        const disc: FinancialDiscrepancy = {
          discrepancyId: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          orgId: params.orgId,
          category: 'DUPLICATE_LEDGER_ENTRY',
          severity: 'HIGH',
          referenceId: order.orderId,
          sourceEntity: 'Order',
          expectedAmountInMinorUnits: order.expectedAmountInMinorUnits,
          actualAmountInMinorUnits: actualSum,
          varianceInMinorUnits: actualSum - order.expectedAmountInMinorUnits,
          currency: 'INR',
          description: `Order ${order.orderId} has ${matchingTxs.length} duplicate posted ledger entries.`,
          detectedAt: new Date().toISOString(),
          status: 'OPEN',
        };
        discrepancies.push(disc);
        this.discrepancyStore.set(disc.discrepancyId, disc);
      } else {
        const tx = matchingTxs[0];
        totalActual += tx.totalDebitInMinorUnits;
        if (tx.totalDebitInMinorUnits !== order.expectedAmountInMinorUnits) {
          const disc: FinancialDiscrepancy = {
            discrepancyId: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orgId: params.orgId,
            category: 'AMOUNT_MISMATCH',
            severity: 'HIGH',
            referenceId: order.orderId,
            sourceEntity: 'Order',
            expectedAmountInMinorUnits: order.expectedAmountInMinorUnits,
            actualAmountInMinorUnits: tx.totalDebitInMinorUnits,
            varianceInMinorUnits: tx.totalDebitInMinorUnits - order.expectedAmountInMinorUnits,
            currency: 'INR',
            description: `Order ${order.orderId} expected ${order.expectedAmountInMinorUnits} paise but ledger recorded ${tx.totalDebitInMinorUnits} paise.`,
            detectedAt: new Date().toISOString(),
            status: 'OPEN',
          };
          discrepancies.push(disc);
          this.discrepancyStore.set(disc.discrepancyId, disc);
        }
      }
    }

    const variance = totalActual - totalExpected;
    const status: ReconciliationStatus = discrepancies.length === 0 ? 'RECONCILED' : 'DISCREPANCY';

    const record: FinancialReconciliationRecord = {
      reconciliationId: reconId,
      orgId: params.orgId,
      divisionId: params.divisionId,
      franchiseId: params.franchiseId,
      reconciliationType: 'ORDERS_LEDGER',
      status,
      expectedTotalInMinorUnits: totalExpected,
      actualTotalInMinorUnits: totalActual,
      varianceInMinorUnits: variance,
      discrepancies,
      sourceReferenceIds,
      executionTimestamp: new Date().toISOString(),
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
    };

    this.reconciliationStore.set(reconId, record);
    return record;
  }

  /**
   * 2. Reconcile Royalties & Accruals ↔ Financial Ledger
   */
  public static reconcileRoyaltiesWithLedger(params: {
    orgId: string;
    franchiseId: string;
    periodId?: string;
    actor: { actorId: string; actorRole: string };
  }): FinancialReconciliationRecord {
    const reconId = `rec-roy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const discrepancies: FinancialDiscrepancy[] = [];
    const sourceReferenceIds: string[] = [];

    // Query all order transactions for this franchise
    const franchiseTxs = FinancialLedgerService.queryTransactions({
      orgId: params.orgId,
      franchiseId: params.franchiseId,
      transactionType: 'ORDER_FINALIZATION',
      user: { orgId: params.orgId, role: 'finance' },
    }).filter((t) => t.status === 'POSTED');

    const totalEligibleRevenue = franchiseTxs.reduce((sum, t) => sum + t.totalDebitInMinorUnits, 0);

    // Calculate expected royalty via deterministic engine
    const expectedCalc = FinancialLedgerService.calculateRoyalty({
      orgId: params.orgId,
      franchiseId: params.franchiseId,
      eligibleRevenueInMinorUnits: totalEligibleRevenue,
      model: 'tiered',
    });

    // Query posted royalty accrual entries in ledger
    const postedAccrualTxs = FinancialLedgerService.queryTransactions({
      orgId: params.orgId,
      franchiseId: params.franchiseId,
      transactionType: 'ROYALTY_ACCRUAL',
      user: { orgId: params.orgId, role: 'finance' },
    }).filter((t) => t.status === 'POSTED');

    const actualAccruedRoyalty = postedAccrualTxs.reduce((sum, t) => sum + t.totalDebitInMinorUnits, 0);
    const variance = actualAccruedRoyalty - expectedCalc.calculatedRoyaltyInMinorUnits;

    if (variance !== 0 && totalEligibleRevenue > 0) {
      const disc: FinancialDiscrepancy = {
        discrepancyId: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orgId: params.orgId,
        category: 'ROYALTY_MISMATCH',
        severity: 'HIGH',
        referenceId: params.franchiseId,
        sourceEntity: 'RoyaltyAccrual',
        expectedAmountInMinorUnits: expectedCalc.calculatedRoyaltyInMinorUnits,
        actualAmountInMinorUnits: actualAccruedRoyalty,
        varianceInMinorUnits: variance,
        currency: 'INR',
        description: `Franchise ${params.franchiseId} royalty accrual mismatch: expected ${expectedCalc.calculatedRoyaltyInMinorUnits} vs accrued ${actualAccruedRoyalty}.`,
        detectedAt: new Date().toISOString(),
        status: 'OPEN',
      };
      discrepancies.push(disc);
      this.discrepancyStore.set(disc.discrepancyId, disc);
    }

    const status: ReconciliationStatus = discrepancies.length === 0 ? 'RECONCILED' : 'DISCREPANCY';

    const record: FinancialReconciliationRecord = {
      reconciliationId: reconId,
      orgId: params.orgId,
      franchiseId: params.franchiseId,
      reconciliationType: 'ROYALTIES_LEDGER',
      periodId: params.periodId,
      status,
      expectedTotalInMinorUnits: expectedCalc.calculatedRoyaltyInMinorUnits,
      actualTotalInMinorUnits: actualAccruedRoyalty,
      varianceInMinorUnits: variance,
      discrepancies,
      sourceReferenceIds,
      executionTimestamp: new Date().toISOString(),
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
      metadata: { eligibleRevenueInMinorUnits: totalEligibleRevenue, model: expectedCalc.royaltyModel },
    };

    this.reconciliationStore.set(reconId, record);
    return record;
  }

  /**
   * 3. Reconcile Taxes ↔ Tax Liability Ledger
   */
  public static reconcileTaxesWithLedger(params: {
    orgId: string;
    periodId?: string;
    actor: { actorId: string; actorRole: string };
  }): FinancialReconciliationRecord {
    const reconId = `rec-tax-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const discrepancies: FinancialDiscrepancy[] = [];
    const sourceReferenceIds: string[] = [];

    const orderTxs = FinancialLedgerService.queryTransactions({
      orgId: params.orgId,
      transactionType: 'ORDER_FINALIZATION',
      user: { orgId: params.orgId, role: 'finance' },
    }).filter((t) => t.status === 'POSTED');

    let totalExpectedTax = 0;
    let totalActualTaxInLedger = 0;

    for (const tx of orderTxs) {
      sourceReferenceIds.push(tx.referenceId);
      const hsnCode = tx.metadata?.hsnSacCode || '998812';
      const effectiveDate = tx.timestamp || new Date().toISOString();
      const expectedTaxCalc = TaxEngineService.calculateTax(params.orgId, tx.totalDebitInMinorUnits, hsnCode, effectiveDate);
      const expectedTax = expectedTaxCalc.breakdown.totalTaxAmountInMinorUnits;
      totalExpectedTax += expectedTax;

      const taxEntry = tx.entries.find((e) => e.accountId === 'TAX_PAYABLE_GST');
      const actualTax = taxEntry ? taxEntry.creditInMinorUnits : 0;
      totalActualTaxInLedger += actualTax;

      if (actualTax !== expectedTax) {
        const disc: FinancialDiscrepancy = {
          discrepancyId: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          orgId: params.orgId,
          category: 'TAX_MISMATCH',
          severity: 'HIGH',
          referenceId: tx.referenceId,
          sourceEntity: 'TaxEngine',
          expectedAmountInMinorUnits: expectedTax,
          actualAmountInMinorUnits: actualTax,
          varianceInMinorUnits: actualTax - expectedTax,
          currency: 'INR',
          description: `Order ${tx.referenceId} expected GST ${expectedTax} but recorded ${actualTax}.`,
          detectedAt: new Date().toISOString(),
          status: 'OPEN',
        };
        discrepancies.push(disc);
        this.discrepancyStore.set(disc.discrepancyId, disc);
      }
    }

    const variance = totalActualTaxInLedger - totalExpectedTax;
    const status: ReconciliationStatus = discrepancies.length === 0 ? 'RECONCILED' : 'DISCREPANCY';

    const record: FinancialReconciliationRecord = {
      reconciliationId: reconId,
      orgId: params.orgId,
      reconciliationType: 'TAXES_LEDGER',
      periodId: params.periodId,
      status,
      expectedTotalInMinorUnits: totalExpectedTax,
      actualTotalInMinorUnits: totalActualTaxInLedger,
      varianceInMinorUnits: variance,
      discrepancies,
      sourceReferenceIds,
      executionTimestamp: new Date().toISOString(),
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
    };

    this.reconciliationStore.set(reconId, record);
    return record;
  }

  /**
   * 4. Comprehensive Period Close Reconciliation (Gate for Period Close)
   */
  public static runComprehensivePeriodReconciliation(
    orgId: string,
    periodId: string,
    actor: { actorId: string; actorRole: string }
  ): FinancialReconciliationRecord {
    const reconId = `rec-comp-${periodId}-${Date.now()}`;
    const discrepancies: FinancialDiscrepancy[] = [];
    const sourceReferenceIds: string[] = [];

    // Query all transactions in ledger for tenant
    const allTxs = FinancialLedgerService.queryTransactions({
      orgId,
      user: { orgId, role: 'finance' },
    });

    let totalDebit = 0;
    let totalCredit = 0;

    for (const tx of allTxs) {
      sourceReferenceIds.push(tx.transactionId);
      totalDebit += tx.totalDebitInMinorUnits;
      totalCredit += tx.totalCreditInMinorUnits;

      if (tx.totalDebitInMinorUnits !== tx.totalCreditInMinorUnits || !tx.isBalanced) {
        const disc: FinancialDiscrepancy = {
          discrepancyId: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          orgId,
          category: 'UNBALANCED_TRANSACTION',
          severity: 'CRITICAL',
          referenceId: tx.transactionId,
          sourceEntity: 'FinancialLedgerTransaction',
          expectedAmountInMinorUnits: tx.totalDebitInMinorUnits,
          actualAmountInMinorUnits: tx.totalCreditInMinorUnits,
          varianceInMinorUnits: Math.abs(tx.totalDebitInMinorUnits - tx.totalCreditInMinorUnits),
          currency: tx.currency,
          description: `Transaction ${tx.transactionId} is unbalance: Debit (${tx.totalDebitInMinorUnits}) != Credit (${tx.totalCreditInMinorUnits})`,
          detectedAt: new Date().toISOString(),
          status: 'OPEN',
        };
        discrepancies.push(disc);
        this.discrepancyStore.set(disc.discrepancyId, disc);
      }
    }

    // Check open unresolved discrepancies in store
    const openDiscs = Array.from(this.discrepancyStore.values()).filter(
      (d) => d.orgId === orgId && d.status === 'OPEN' && (d.severity === 'CRITICAL' || d.severity === 'HIGH')
    );

    for (const d of openDiscs) {
      if (!discrepancies.some((existing) => existing.discrepancyId === d.discrepancyId)) {
        discrepancies.push(d);
      }
    }

    const variance = Math.abs(totalDebit - totalCredit);
    const status: ReconciliationStatus = discrepancies.length === 0 && variance === 0 ? 'RECONCILED' : 'DISCREPANCY';

    const record: FinancialReconciliationRecord = {
      reconciliationId: reconId,
      orgId,
      reconciliationType: 'COMPREHENSIVE_PERIOD_CLOSE',
      periodId,
      status,
      expectedTotalInMinorUnits: totalDebit,
      actualTotalInMinorUnits: totalCredit,
      varianceInMinorUnits: variance,
      discrepancies,
      sourceReferenceIds,
      executionTimestamp: new Date().toISOString(),
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      metadata: { transactionCount: allTxs.length, openDiscrepanciesCount: discrepancies.length },
    };

    this.reconciliationStore.set(reconId, record);
    return record;
  }

  // ======================================================================
  // 3. CONTROLLED FINANCIAL ADJUSTMENTS & SEPARATION OF DUTY
  // ======================================================================

  /**
   * Request an adjustment
   */
  public static requestAdjustment(params: {
    orgId: string;
    divisionId: AppDivision | string;
    franchiseId?: string | null;
    branchId: string;
    amountInMinorUnits: number;
    currency?: string;
    debitAccountId: string;
    creditAccountId: string;
    reason: string;
    periodId: string;
    actor: { actorId: string; actorRole: string };
  }): FinancialAdjustmentRequest {
    if (!['finance', 'super_admin', 'ceo', 'owner', 'store_manager'].includes(params.actor.actorRole)) {
      throw new Error(`Unauthorized: Role '${params.actor.actorRole}' cannot request financial adjustments.`);
    }

    if (params.amountInMinorUnits <= 0) {
      throw new Error('Adjustment amount must be strictly greater than zero.');
    }

    if (!params.reason || params.reason.trim().length < 5) {
      throw new Error('Adjustment reason must be provided (minimum 5 characters).');
    }

    // Verify target period is not closed, or actor has authorization
    this.assertPeriodOpenForPosting(params.orgId, params.periodId, params.actor);

    const adjId = `adj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const adj: FinancialAdjustmentRequest = {
      adjustmentId: adjId,
      orgId: params.orgId,
      divisionId: params.divisionId,
      franchiseId: params.franchiseId,
      branchId: params.branchId,
      amountInMinorUnits: params.amountInMinorUnits,
      currency: params.currency || 'INR',
      debitAccountId: params.debitAccountId,
      creditAccountId: params.creditAccountId,
      reason: params.reason,
      periodId: params.periodId,
      requestedBy: params.actor.actorId,
      requesterRole: params.actor.actorRole,
      requestedAt: new Date().toISOString(),
      status: 'REQUESTED',
    };

    this.adjustmentStore.set(adjId, adj);
    FinancialLedgerService.logFinancialAudit(
      params.orgId,
      'REQUEST_FINANCIAL_ADJUSTMENT',
      'FinancialAdjustmentRequest',
      adjId,
      params.actor.actorId,
      params.actor.actorRole,
      `Requested adjustment of ${params.amountInMinorUnits} ${adj.currency} for reason: ${params.reason}`
    );

    return adj;
  }

  /**
   * Approve and execute adjustment with SEPARATION OF DUTY:
   * Requester CANNOT approve their own adjustment.
   */
  public static approveAdjustment(params: {
    orgId: string;
    adjustmentId: string;
    actor: { actorId: string; actorRole: string };
  }): { adjustment: FinancialAdjustmentRequest; transaction: FinancialLedgerTransaction } {
    if (!['finance', 'super_admin', 'ceo', 'owner'].includes(params.actor.actorRole)) {
      throw new Error(`Unauthorized: Approving adjustments requires Finance, CEO, or Super Admin role.`);
    }

    const adj = this.adjustmentStore.get(params.adjustmentId);
    if (!adj || adj.orgId !== params.orgId) {
      throw new Error(`Adjustment request '${params.adjustmentId}' not found.`);
    }

    if (adj.status !== 'REQUESTED') {
      throw new Error(`Adjustment '${params.adjustmentId}' cannot be approved in state '${adj.status}'.`);
    }

    // Separation of duty validation: Requester != Approver
    if (adj.requestedBy === params.actor.actorId) {
      throw new Error(
        `Separation of Duty Violation: Requester (${adj.requestedBy}) cannot self-approve adjustment '${params.adjustmentId}'.`
      );
    }

    adj.status = 'APPROVED';
    adj.approvedBy = params.actor.actorId;
    adj.approverRole = params.actor.actorRole;
    adj.approvedAt = new Date().toISOString();

    // Generate balanced double-entry compensating adjustment in financial ledger
    const txId = `ltx-adj-${adj.adjustmentId}`;
    const lines: FinancialLedgerLine[] = [
      {
        lineId: `line-adj-deb-${adj.adjustmentId}`,
        accountId: adj.debitAccountId as any,
        accountName: `Adjustment Debit (${adj.debitAccountId})`,
        debitInMinorUnits: adj.amountInMinorUnits,
        creditInMinorUnits: 0,
        description: `Approved adjustment: ${adj.reason}`,
      },
      {
        lineId: `line-adj-crd-${adj.adjustmentId}`,
        accountId: adj.creditAccountId as any,
        accountName: `Adjustment Credit (${adj.creditAccountId})`,
        debitInMinorUnits: 0,
        creditInMinorUnits: adj.amountInMinorUnits,
        description: `Approved adjustment: ${adj.reason}`,
      },
    ];

    const tx: FinancialLedgerTransaction = {
      transactionId: txId,
      orgId: adj.orgId,
      divisionId: adj.divisionId,
      franchiseId: adj.franchiseId || null,
      branchId: adj.branchId,
      transactionType: 'MANUAL_ADJUSTMENT',
      referenceId: adj.adjustmentId,
      currency: adj.currency,
      entries: lines,
      totalDebitInMinorUnits: adj.amountInMinorUnits,
      totalCreditInMinorUnits: adj.amountInMinorUnits,
      isBalanced: true,
      status: 'POSTED',
      actorId: params.actor.actorId,
      actorRole: params.actor.actorRole,
      timestamp: new Date().toISOString(),
      metadata: { adjustmentId: adj.adjustmentId, reason: adj.reason, approvedBy: adj.approvedBy },
    };

    const postedTx = FinancialLedgerService.postTransaction(tx);
    adj.status = 'EXECUTED';
    adj.executedLedgerTransactionId = postedTx.transactionId;
    this.adjustmentStore.set(adj.adjustmentId, adj);

    FinancialLedgerService.logFinancialAudit(
      params.orgId,
      'EXECUTE_FINANCIAL_ADJUSTMENT',
      'FinancialAdjustmentRequest',
      adj.adjustmentId,
      params.actor.actorId,
      params.actor.actorRole,
      `Executed adjustment ${adj.adjustmentId} posting balanced ledger transaction ${postedTx.transactionId}`
    );

    return { adjustment: adj, transaction: postedTx };
  }

  /**
   * Reject adjustment
   */
  public static rejectAdjustment(params: {
    orgId: string;
    adjustmentId: string;
    reason: string;
    actor: { actorId: string; actorRole: string };
  }): FinancialAdjustmentRequest {
    if (!['finance', 'super_admin', 'ceo', 'owner'].includes(params.actor.actorRole)) {
      throw new Error(`Unauthorized: Rejecting adjustments requires Finance, CEO, or Super Admin role.`);
    }

    const adj = this.adjustmentStore.get(params.adjustmentId);
    if (!adj || adj.orgId !== params.orgId) {
      throw new Error(`Adjustment request '${params.adjustmentId}' not found.`);
    }

    if (adj.status !== 'REQUESTED') {
      throw new Error(`Adjustment '${params.adjustmentId}' cannot be rejected in state '${adj.status}'.`);
    }

    adj.status = 'REJECTED';
    adj.rejectedBy = params.actor.actorId;
    adj.rejectionReason = params.reason;
    adj.rejectedAt = new Date().toISOString();
    this.adjustmentStore.set(adj.adjustmentId, adj);

    FinancialLedgerService.logFinancialAudit(
      params.orgId,
      'REJECT_FINANCIAL_ADJUSTMENT',
      'FinancialAdjustmentRequest',
      adj.adjustmentId,
      params.actor.actorId,
      params.actor.actorRole,
      `Rejected adjustment ${adj.adjustmentId}. Reason: ${params.reason}`
    );

    return adj;
  }

  public static getAdjustments(orgId: string): FinancialAdjustmentRequest[] {
    return Array.from(this.adjustmentStore.values()).filter((a) => a.orgId === orgId);
  }

  // ======================================================================
  // 4. FINANCIAL REPORTING & TRIAL BALANCE
  // ======================================================================

  public static generateTrialBalance(orgId: string): {
    orgId: string;
    accounts: Array<{ accountId: string; totalDebitInMinorUnits: number; totalCreditInMinorUnits: number; netBalanceInMinorUnits: number }>;
    totalDebitsInMinorUnits: number;
    totalCreditsInMinorUnits: number;
    isBalanced: boolean;
    generatedAt: string;
  } {
    const txs = FinancialLedgerService.queryTransactions({
      orgId,
      user: { orgId, role: 'finance' },
    });

    const accountMap: Map<string, { debit: number; credit: number }> = new Map();
    let grandDebit = 0;
    let grandCredit = 0;

    for (const tx of txs) {
      for (const entry of tx.entries) {
        const cur = accountMap.get(entry.accountId) || { debit: 0, credit: 0 };
        cur.debit += entry.debitInMinorUnits || 0;
        cur.credit += entry.creditInMinorUnits || 0;
        accountMap.set(entry.accountId, cur);
        grandDebit += entry.debitInMinorUnits || 0;
        grandCredit += entry.creditInMinorUnits || 0;
      }
    }

    const accounts = Array.from(accountMap.entries()).map(([accountId, val]) => ({
      accountId,
      totalDebitInMinorUnits: val.debit,
      totalCreditInMinorUnits: val.credit,
      netBalanceInMinorUnits: val.debit - val.credit,
    }));

    return {
      orgId,
      accounts,
      totalDebitsInMinorUnits: grandDebit,
      totalCreditsInMinorUnits: grandCredit,
      isBalanced: grandDebit === grandCredit,
      generatedAt: new Date().toISOString(),
    };
  }

  public static getDiscrepancies(orgId: string): FinancialDiscrepancy[] {
    return Array.from(this.discrepancyStore.values()).filter((d) => d.orgId === orgId);
  }

  public static getReconciliations(orgId: string): FinancialReconciliationRecord[] {
    return Array.from(this.reconciliationStore.values()).filter((r) => r.orgId === orgId);
  }
}
