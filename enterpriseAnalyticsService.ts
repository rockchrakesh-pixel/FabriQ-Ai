import { LoggerService } from './loggerService';
import { WorkflowEngineService, OrderWorkflowEntity, GarmentTraceabilityUnit } from './workflowEngine';
import { FinancialLedgerService, FinancialLedgerTransaction } from './financialLedgerService';
import { OrderInventoryService, OrderInventoryRequirement } from './orderInventoryService';
import { backgroundQueueService } from './backgroundQueueService';
import { MOCK_ITEMS, MOCK_STOCK } from '../routes/inventory';
import {
  AppDivision,
  AnalyticsQueryFilters,
  ExecutiveAnalyticsSummary,
  OperationalKpis,
  DivisionAnalyticsComparison,
  UnitEconomicsMetrics,
  CustomerCohortMetrics,
  InventoryConsumptionMetrics,
} from '../../src/types';

// Immutable Analytics Audit Log Store
export interface AnalyticsAuditRecord {
  auditId: string;
  orgId: string;
  actorId: string;
  actorRole: string;
  action: 'QUERY_EXECUTIVE_ANALYTICS' | 'EXPORT_ANALYTICS_REPORT' | 'ENQUEUE_ANALYTICS_SNAPSHOT' | 'COMPILE_COHORT_ANALYSIS';
  reportType: string;
  filters: Partial<AnalyticsQueryFilters>;
  timestamp: string;
  correlationId?: string;
}

const ANALYTICS_AUDIT_LOG: AnalyticsAuditRecord[] = [];

export function recordAnalyticsAuditLog(
  orgId: string,
  actorId: string,
  actorRole: string,
  action: AnalyticsAuditRecord['action'],
  reportType: string,
  filters: Partial<AnalyticsQueryFilters>,
  correlationId?: string
): AnalyticsAuditRecord {
  const record: AnalyticsAuditRecord = {
    auditId: `audit-analytics-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orgId,
    actorId,
    actorRole,
    action,
    reportType,
    filters,
    timestamp: new Date().toISOString(),
    correlationId,
  };
  ANALYTICS_AUDIT_LOG.push(record);
  LoggerService.info(`[Analytics Audit] ${action} on ${reportType} by ${actorId} (${actorRole})`, {
    auditId: record.auditId,
    orgId,
    action,
    reportType,
  });
  return record;
}

export function getAnalyticsAuditLogs(orgId: string): AnalyticsAuditRecord[] {
  return ANALYTICS_AUDIT_LOG.filter((l) => l.orgId === orgId);
}

export function clearAnalyticsAuditLogs(): void {
  ANALYTICS_AUDIT_LOG.length = 0;
}

export class EnterpriseAnalyticsService {
  /**
   * Enforce Server-Side Authorization & Multi-Tenant Isolation
   */
  public static validateAccess(
    user: { orgId: string; role: string; franchiseId?: string | null; branchId?: string },
    target: AnalyticsQueryFilters
  ): void {
    if (!user) {
      throw new Error('Authentication required for enterprise analytics access.');
    }

    if (user.role === 'customer') {
      throw new Error('Access denied: Customer role is prohibited from accessing enterprise analytics.');
    }

    if (user.orgId !== target.orgId) {
      throw new Error(`Cross-tenant analytics access violation: User org '${user.orgId}' !== Target org '${target.orgId}'`);
    }

    if (user.role === 'franchise_owner') {
      if (!user.franchiseId) {
        throw new Error('Franchise owner missing franchise identifier.');
      }
      if (target.franchiseId && target.franchiseId !== user.franchiseId) {
        throw new Error(`Franchise isolation violation: Cannot access analytics for franchise '${target.franchiseId}'`);
      }
    }

    if ((user.role === 'store_manager' || user.role === 'store_staff') && user.branchId) {
      if (target.branchId && target.branchId !== user.branchId) {
        throw new Error(`Branch isolation violation: Cannot access analytics for branch '${target.branchId}'`);
      }
    }
  }

  /**
   * Helper to filter orders by query parameters
   */
  private static getScopedOrders(filters: AnalyticsQueryFilters): OrderWorkflowEntity[] {
    const allOrders = WorkflowEngineService.listOrdersByTenant(filters.orgId, filters.branchId);
    return allOrders.filter((order) => {
      if (filters.divisionId && order.divisionId !== filters.divisionId) return false;
      if (filters.franchiseId && order.franchiseId !== filters.franchiseId) return false;
      if (filters.startDate && new Date(order.createdTimestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(order.createdTimestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  }

  /**
   * Helper to filter ledger transactions
   */
  private static getScopedTransactions(filters: AnalyticsQueryFilters, userRole = 'super_admin'): FinancialLedgerTransaction[] {
    try {
      const txs = FinancialLedgerService.queryTransactions({
        orgId: filters.orgId,
        divisionId: filters.divisionId as string,
        franchiseId: filters.franchiseId,
        branchId: filters.branchId,
        user: { orgId: filters.orgId, role: userRole, franchiseId: filters.franchiseId, branchId: filters.branchId },
      });
      return txs.filter((tx) => {
        if (filters.startDate && new Date(tx.timestamp) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(tx.timestamp) > new Date(filters.endDate)) return false;
        return true;
      });
    } catch {
      return [];
    }
  }

  /**
   * 1. Executive Summary Analytics
   */
  public static getExecutiveSummary(
    filters: AnalyticsQueryFilters,
    user?: { orgId: string; role: string; userId?: string; franchiseId?: string | null; branchId?: string }
  ): ExecutiveAnalyticsSummary {
    if (user) this.validateAccess(user, filters);

    const orders = this.getScopedOrders(filters);
    const transactions = this.getScopedTransactions(filters, user?.role);

    // Revenue calculation from double-entry ledger with fallback to orders
    let totalRevenue = 0;
    let totalTaxCollected = 0;
    let totalRoyaltiesAccrued = 0;

    for (const tx of transactions) {
      if (tx.status === 'POSTED') {
        if (tx.transactionType === 'ORDER_FINALIZATION') {
          for (const line of tx.entries) {
            if (line.accountId === 'SALES_REVENUE') totalRevenue += line.creditInMinorUnits;
            if (line.accountId === 'TAX_PAYABLE_GST') totalTaxCollected += line.creditInMinorUnits;
          }
        } else if (tx.transactionType === 'ROYALTY_ACCRUAL') {
          for (const line of tx.entries) {
            if (line.accountId === 'ROYALTY_EXPENSE') totalRoyaltiesAccrued += line.debitInMinorUnits;
          }
        }
      }
    }

    if (totalRevenue === 0 && orders.length > 0) {
      totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmountInMinorUnits || 0), 0);
      totalTaxCollected = orders.reduce((sum, o) => sum + (o.taxAmountInMinorUnits || 0), 0);
    }

    // Orders breakdown
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.currentState === 'COMPLETED' || o.currentState === 'DELIVERED').length;
    const cancelledOrders = orders.filter((o) => o.currentState === 'CANCELLED').length;
    const activeOrders = totalOrders - completedOrders - cancelledOrders;

    // Unique active customers
    const uniqueCustomers = new Set(orders.map((o) => o.customerId));
    const activeCustomersCount = uniqueCustomers.size;

    // Average Order Value
    const averageOrderValueInMinorUnits = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Quality & SLA Compliance
    let totalGarments = 0;
    let passedGarments = 0;
    let reworkGarments = 0;
    let onTimeOrders = 0;

    for (const order of orders) {
      if (!order.slaBreached) onTimeOrders++;
      for (const item of order.items || []) {
        totalGarments++;
        if (item.qualityStatus === 'PASSED') passedGarments++;
        if (item.qualityStatus === 'FAILED' || item.qualityStatus === 'REWORK_REQUIRED') reworkGarments++;
      }
    }

    const slaComplianceRate = totalOrders > 0 ? Number(((onTimeOrders / totalOrders) * 100).toFixed(1)) : 100;
    const garmentQualityPassRate = totalGarments > 0 ? Number(((passedGarments / totalGarments) * 100).toFixed(1)) : 100;
    const reworkRate = totalGarments > 0 ? Number(((reworkGarments / totalGarments) * 100).toFixed(1)) : 0;

    // Gross Margin Percentage (Estimated direct cost 32% + royalties)
    const directCost = Math.round(totalRevenue * 0.32) + totalRoyaltiesAccrued;
    const grossMargin = totalRevenue > 0 ? Number((((totalRevenue - directCost) / totalRevenue) * 100).toFixed(1)) : 68.0;

    if (user && user.userId) {
      recordAnalyticsAuditLog(filters.orgId, user.userId, user.role, 'QUERY_EXECUTIVE_ANALYTICS', 'Executive Summary', filters);
    }

    return {
      orgId: filters.orgId,
      timeframe: filters.timeframe || 'this_month',
      totalRevenueInMinorUnits: totalRevenue,
      totalGrossMarginPercentage: Math.max(0, grossMargin),
      totalOrders,
      completedOrders,
      activeOrders,
      cancelledOrders,
      averageOrderValueInMinorUnits,
      activeCustomersCount,
      slaComplianceRate,
      garmentQualityPassRate,
      reworkRate,
      totalTaxCollectedInMinorUnits: totalTaxCollected,
      totalRoyaltiesAccruedInMinorUnits: totalRoyaltiesAccrued,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 2. Operational KPIs & Garment Traceability
   */
  public static getOperationalKpiMetrics(
    filters: AnalyticsQueryFilters,
    user?: { orgId: string; role: string; userId?: string; franchiseId?: string | null; branchId?: string }
  ): OperationalKpis {
    if (user) this.validateAccess(user, filters);

    const orders = this.getScopedOrders(filters);

    let totalGarments = 0;
    const garmentsByStage: Record<string, number> = {
      INTAKE: 0,
      SORTED: 0,
      HYDROCARBON_CLEANING: 0,
      STEAM_FINISHING: 0,
      QUALITY_INSPECTION: 0,
      REWORK_SPOTTING: 0,
      PACKAGING: 0,
      DISPATCH_READY: 0,
    };

    let inspectedCount = 0;
    let passedCount = 0;
    let failedCount = 0;
    let reworkRequiredCount = 0;
    let onTimeOrders = 0;
    let breachedOrders = 0;
    let totalTargetHours = 0;

    const reworkBreakdownByCategory: Record<string, number> = {};

    for (const order of orders) {
      if (order.slaBreached) {
        breachedOrders++;
      } else {
        onTimeOrders++;
      }
      totalTargetHours += order.slaTargetHours || 24;

      for (const item of order.items || []) {
        totalGarments++;
        const stage = item.currentStage || 'INTAKE';
        garmentsByStage[stage] = (garmentsByStage[stage] || 0) + 1;

        if (item.qualityStatus && item.qualityStatus !== 'PENDING') {
          inspectedCount++;
          if (item.qualityStatus === 'PASSED') passedCount++;
          if (item.qualityStatus === 'FAILED') failedCount++;
          if (item.qualityStatus === 'REWORK_REQUIRED') reworkRequiredCount++;

          if (item.qualityStatus === 'FAILED' || item.qualityStatus === 'REWORK_REQUIRED') {
            const cat = item.category || 'general_apparel';
            reworkBreakdownByCategory[cat] = (reworkBreakdownByCategory[cat] || 0) + 1;
          }
        }
      }
    }

    const totalOrdersTracked = orders.length;
    const firstPassYieldRate = inspectedCount > 0 ? Number(((passedCount / inspectedCount) * 100).toFixed(1)) : 100;
    const reworkRate = inspectedCount > 0 ? Number((((failedCount + reworkRequiredCount) / inspectedCount) * 100).toFixed(1)) : 0;
    const slaCompliancePercentage = totalOrdersTracked > 0 ? Number(((onTimeOrders / totalOrdersTracked) * 100).toFixed(1)) : 100;
    const averageTurnaroundTargetHours = totalOrdersTracked > 0 ? Number((totalTargetHours / totalOrdersTracked).toFixed(1)) : 24.0;

    return {
      orgId: filters.orgId,
      totalGarmentsProcessed: totalGarments,
      garmentsByStage,
      qualityMetrics: {
        totalInspected: inspectedCount,
        passedCount,
        failedCount,
        reworkRequiredCount,
        firstPassYieldRate,
        reworkRate,
      },
      slaMetrics: {
        totalOrdersTracked,
        onTimeOrders,
        breachedOrders,
        slaCompliancePercentage,
        averageTurnaroundTargetHours,
      },
      reworkBreakdownByCategory,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 3. Cross-Division Performance Comparison
   */
  public static getDivisionComparison(
    filters: AnalyticsQueryFilters,
    user?: { orgId: string; role: string; userId?: string; franchiseId?: string | null; branchId?: string }
  ): DivisionAnalyticsComparison[] {
    if (user) this.validateAccess(user, filters);

    const divisions: Array<{ id: AppDivision; name: string }> = [
      { id: 'laundry', name: 'Hydrocarbon & Organic Laundry Atelier' },
      { id: 'boutique', name: 'Haute Couture Boutique & Custom Tailoring' },
      { id: 'luxury_store', name: 'Heritage Luxury Apparel & Leather Care' },
    ];

    const results: DivisionAnalyticsComparison[] = [];

    for (const div of divisions) {
      const divFilter: AnalyticsQueryFilters = { ...filters, divisionId: div.id };
      const orders = this.getScopedOrders(divFilter);
      const orderCount = orders.length;
      const completedOrderCount = orders.filter((o) => o.currentState === 'COMPLETED' || o.currentState === 'DELIVERED').length;
      const revenueInMinorUnits = orders.reduce((sum, o) => sum + (o.totalAmountInMinorUnits || 0), 0);
      const averageOrderValueInMinorUnits = orderCount > 0 ? Math.round(revenueInMinorUnits / orderCount) : 0;

      let onTimeCount = 0;
      let totalItems = 0;
      let reworkItems = 0;
      const customerSet = new Set<string>();

      for (const order of orders) {
        if (!order.slaBreached) onTimeCount++;
        if (order.customerId) customerSet.add(order.customerId);
        for (const item of order.items || []) {
          totalItems++;
          if (item.qualityStatus === 'FAILED' || item.qualityStatus === 'REWORK_REQUIRED') reworkItems++;
        }
      }

      const slaComplianceRate = orderCount > 0 ? Number(((onTimeCount / orderCount) * 100).toFixed(1)) : 100;
      const reworkRate = totalItems > 0 ? Number(((reworkItems / totalItems) * 100).toFixed(1)) : 0;

      // Division specific baseline margins
      const baseMargin = div.id === 'luxury_store' ? 42.5 : div.id === 'boutique' ? 38.0 : 34.2;

      results.push({
        divisionId: div.id,
        divisionName: div.name,
        orderCount,
        completedOrderCount,
        revenueInMinorUnits,
        grossMarginPercentage: baseMargin,
        averageOrderValueInMinorUnits,
        slaComplianceRate,
        reworkRate,
        activeCustomers: customerSet.size,
      });
    }

    return results;
  }

  /**
   * 4. Unit Economics & Gross Margin Analyzer
   */
  public static getUnitEconomics(
    filters: AnalyticsQueryFilters,
    user?: { orgId: string; role: string; userId?: string; franchiseId?: string | null; branchId?: string }
  ): UnitEconomicsMetrics {
    if (user) this.validateAccess(user, filters);

    const orders = this.getScopedOrders(filters);
    const totalOrdersProcessed = orders.length;

    let totalGarments = 0;
    let totalRevenue = 0;
    let totalTax = 0;

    for (const order of orders) {
      totalRevenue += order.totalAmountInMinorUnits || 0;
      totalTax += order.taxAmountInMinorUnits || 0;
      totalGarments += (order.items || []).length;
    }

    const averageRevenuePerGarmentInMinorUnits = totalGarments > 0 ? Math.round(totalRevenue / totalGarments) : 0;
    // Material cost estimation based on chemical/packaging BOM
    const averageMaterialCostPerGarmentInMinorUnits = totalGarments > 0 ? Math.round(averageRevenuePerGarmentInMinorUnits * 0.12) : 0;
    const averageRoyaltyPerOrderInMinorUnits = totalOrdersProcessed > 0 ? Math.round((totalRevenue * 0.08) / totalOrdersProcessed) : 0;
    const averageGrossMarginPerOrderInMinorUnits =
      totalOrdersProcessed > 0 ? Math.round((totalRevenue * 0.65) / totalOrdersProcessed) : 0;

    return {
      orgId: filters.orgId,
      totalGarmentsProcessed: totalGarments,
      totalOrdersProcessed,
      averageRevenuePerGarmentInMinorUnits,
      averageMaterialCostPerGarmentInMinorUnits,
      averageRoyaltyPerOrderInMinorUnits,
      averageGrossMarginPerOrderInMinorUnits,
      grossMarginPercentage: 65.0,
      taxCollectedInMinorUnits: totalTax,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 5. Customer Cohorts, Retention & LTV
   */
  public static getCustomerCohorts(
    filters: AnalyticsQueryFilters,
    user?: { orgId: string; role: string; userId?: string; franchiseId?: string | null; branchId?: string }
  ): CustomerCohortMetrics {
    if (user) this.validateAccess(user, filters);

    const orders = this.getScopedOrders(filters);

    const customerOrderCounts: Map<string, number> = new Map();
    const customerTotalSpend: Map<string, number> = new Map();
    const customerDivisions: Map<string, Set<string>> = new Map();

    for (const order of orders) {
      const cid = order.customerId;
      customerOrderCounts.set(cid, (customerOrderCounts.get(cid) || 0) + 1);
      customerTotalSpend.set(cid, (customerTotalSpend.get(cid) || 0) + (order.totalAmountInMinorUnits || 0));

      if (!customerDivisions.has(cid)) {
        customerDivisions.set(cid, new Set());
      }
      customerDivisions.get(cid)!.add(order.divisionId);
    }

    const totalUniqueCustomers = customerOrderCounts.size;
    let repeatCustomerCount = 0;
    let multiDivisionCustomers = 0;
    let vipCount = 0;
    let regularCount = 0;
    let occasionalCount = 0;

    let totalLtvSum = 0;

    for (const [cid, count] of customerOrderCounts.entries()) {
      const spend = customerTotalSpend.get(cid) || 0;
      totalLtvSum += spend;

      if (count >= 2) repeatCustomerCount++;
      if ((customerDivisions.get(cid)?.size || 0) >= 2) multiDivisionCustomers++;

      if (spend >= 500000 || count >= 5) {
        vipCount++;
      } else if (count >= 2) {
        regularCount++;
      } else {
        occasionalCount++;
      }
    }

    const repeatCustomerRate = totalUniqueCustomers > 0 ? Number(((repeatCustomerCount / totalUniqueCustomers) * 100).toFixed(1)) : 0;
    const averageCustomerLtvInMinorUnits = totalUniqueCustomers > 0 ? Math.round(totalLtvSum / totalUniqueCustomers) : 0;
    const multiDivisionAdoptionRate =
      totalUniqueCustomers > 0 ? Number(((multiDivisionCustomers / totalUniqueCustomers) * 100).toFixed(1)) : 0;

    return {
      orgId: filters.orgId,
      totalUniqueCustomers,
      repeatCustomerCount,
      repeatCustomerRate,
      averageCustomerLtvInMinorUnits,
      multiDivisionAdoptionRate,
      customerSpendingTiers: {
        vipCount,
        regularCount,
        occasionalCount,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 6. Inventory & Consumption Analytics
   */
  public static getInventoryConsumptionAnalytics(
    filters: AnalyticsQueryFilters,
    user?: { orgId: string; role: string; userId?: string; franchiseId?: string | null; branchId?: string }
  ): InventoryConsumptionMetrics {
    if (user) this.validateAccess(user, filters);

    const requirements = OrderInventoryService.listRequirementsByTenant(filters.orgId, filters.branchId);

    const totalRequirementsGenerated = requirements.length;
    const fulfilledRequirementsCount = requirements.filter((r) => r.status === 'CONSUMED' || r.status === 'RESERVED').length;
    const shortageIncidentsCount = requirements.filter((r) => r.status === 'SHORT').length;

    // Stock value computation from items
    const scopedItems = MOCK_ITEMS.filter((i) => i.orgId === filters.orgId);
    let totalStockValue = 0;
    for (const item of scopedItems) {
      const stock = MOCK_STOCK.find((s) => s.itemId === item.itemId);
      const qty = stock && typeof stock.currentQuantity === 'number' ? stock.currentQuantity : 50;
      const unitCost = typeof item.unitCost === 'number' ? item.unitCost : 850;
      totalStockValue += qty * unitCost * 100;
    }

    const consumptionVelocityScore =
      totalRequirementsGenerated > 0
        ? Number(((fulfilledRequirementsCount / totalRequirementsGenerated) * 10).toFixed(1))
        : 8.5;

    return {
      orgId: filters.orgId,
      totalStockItemsCount: scopedItems.length,
      totalStockValueInMinorUnits: totalStockValue,
      totalRequirementsGenerated,
      fulfilledRequirementsCount,
      shortageIncidentsCount,
      consumptionVelocityScore,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 7. Asynchronous Analytics Snapshot Generation
   */
  public static enqueueAnalyticsSnapshotJob(
    filters: AnalyticsQueryFilters,
    actor: { actorId: string; actorRole: string; orgId: string; franchiseId?: string | null; branchId?: string }
  ): { jobId: string; status: string } {
    this.validateAccess({ orgId: actor.orgId, role: actor.actorRole, franchiseId: actor.franchiseId, branchId: actor.branchId }, filters);

    const job = backgroundQueueService.enqueueJob(
      'analytics_snapshot_generation',
      {
        filters,
        requestedBy: actor.actorId,
        requestedRole: actor.actorRole,
        requestedAt: new Date().toISOString(),
      },
      {
        orgId: filters.orgId,
        divisionId: filters.divisionId as string,
        franchiseId: filters.franchiseId || undefined,
        branchId: filters.branchId,
      },
      { maxRetries: 2, correlationId: `snap-${Date.now()}` }
    );

    recordAnalyticsAuditLog(
      filters.orgId,
      actor.actorId,
      actor.actorRole,
      'ENQUEUE_ANALYTICS_SNAPSHOT',
      'Async Snapshot Compilation',
      filters,
      job.correlationId
    );

    return {
      jobId: job.jobId,
      status: job.status,
    };
  }

  /**
   * 8. Export Analytics Data
   */
  public static generateExport(
    filters: AnalyticsQueryFilters,
    format: 'json' | 'csv',
    actor: { actorId: string; actorRole: string; orgId: string; franchiseId?: string | null; branchId?: string }
  ): { exportId: string; format: string; payload: string; recordCount: number } {
    const userAccess = { orgId: actor.orgId, role: actor.actorRole, userId: actor.actorId, franchiseId: actor.franchiseId, branchId: actor.branchId };
    this.validateAccess(userAccess, filters);

    const summary = this.getExecutiveSummary(filters, userAccess);
    const kpis = this.getOperationalKpiMetrics(filters, userAccess);
    const divisions = this.getDivisionComparison(filters, userAccess);

    const exportId = `exp-analytics-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let payload = '';

    if (format === 'csv') {
      const rows = [
        'Metric,Value',
        `Org ID,${summary.orgId}`,
        `Total Revenue (Minor Units),${summary.totalRevenueInMinorUnits}`,
        `Total Orders,${summary.totalOrders}`,
        `Completed Orders,${summary.completedOrders}`,
        `Active Customers,${summary.activeCustomersCount}`,
        `SLA Compliance Rate (%),${summary.slaComplianceRate}`,
        `Garment Quality Pass Rate (%),${summary.garmentQualityPassRate}`,
        `Total Garments Processed,${kpis.totalGarmentsProcessed}`,
        `First Pass Yield (%),${kpis.qualityMetrics.firstPassYieldRate}`,
      ];
      for (const div of divisions) {
        rows.push(`Division: ${div.divisionName} Revenue,${div.revenueInMinorUnits}`);
      }
      payload = rows.join('\n');
    } else {
      payload = JSON.stringify({ summary, kpis, divisions, exportedAt: new Date().toISOString() }, null, 2);
    }

    recordAnalyticsAuditLog(
      filters.orgId,
      actor.actorId,
      actor.actorRole,
      'EXPORT_ANALYTICS_REPORT',
      `Analytics Report (${format.toUpperCase()})`,
      filters
    );

    return {
      exportId,
      format,
      payload,
      recordCount: divisions.length + 8,
    };
  }
}
