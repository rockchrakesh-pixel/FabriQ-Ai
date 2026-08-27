import React, { useState, useEffect } from 'react';
import {
  RevenueLedgerEntry,
  PaymentReconciliationRecord,
  FinancialRefundAdjustment,
  FinancialPeriod,
  FranchiseSettlement,
  SettlementStatus,
  FranchiseFinancialStatement,
  BranchFinancialReport,
} from '../../types';

interface EnterpriseFinanceDashboardProps {
  userRole?: string;
  userOrgId?: string;
  userFranchiseId?: string;
  userBranchId?: string;
}

export const EnterpriseFinanceDashboard: React.FC<EnterpriseFinanceDashboardProps> = ({
  userRole = 'owner',
  userOrgId = 'org-fabriq-global',
  userFranchiseId = 'fr-hyd-01',
  userBranchId = 'b-hyd-bowenpally',
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'ledger' | 'settlements' | 'reconciliation' | 'refunds' | 'periods' | 'reports' | 'audit' | 'tax'
  >('overview');

  // Data state
  const [summary, setSummary] = useState<any>(null);
  const [ledgerEntries, setLedgerEntries] = useState<RevenueLedgerEntry[]>([]);
  const [settlements, setSettlements] = useState<FranchiseSettlement[]>([]);
  const [reconciliations, setReconciliations] = useState<PaymentReconciliationRecord[]>([]);
  const [refunds, setRefunds] = useState<FinancialRefundAdjustment[]>([]);
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [franchiseStatement, setFranchiseStatement] = useState<FranchiseFinancialStatement | null>(null);
  const [branchReport, setBranchReport] = useState<BranchFinancialReport | null>(null);
  const [divisionReport, setDivisionReport] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Phase 2F-2 Tax Data State
  const [taxClassifications, setTaxClassifications] = useState<any[]>([]);
  const [taxSchedules, setTaxSchedules] = useState<any[]>([]);
  const [taxAuditTrail, setTaxAuditTrail] = useState<any[]>([]);
  const [showNewClassModal, setShowNewClassModal] = useState<boolean>(false);
  const [newClassForm, setNewClassForm] = useState({
    code: '998833',
    codeType: 'SAC',
    description: 'Specialty Garment Alterations',
    category: 'Tailoring',
    serviceOrProduct: 'SERVICE',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal Forms
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const [newLedgerForm, setNewLedgerForm] = useState({
    transactionId: `txn-${Math.floor(1000 + Math.random() * 9000)}`,
    divisionId: 'laundry',
    franchiseId: userFranchiseId,
    branchId: userBranchId,
    isCorporateOwned: false,
    orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    serviceProductRef: 'Eco Dry Cleaning & Silk Spa Garments',
    paymentRef: `pay_Rzp${Math.floor(1000 + Math.random() * 9000)}`,
    currency: 'INR',
    grossAmountRupees: 20000, // ₹20,000
    discountAmountRupees: 1000,
    taxAmountRupees: 3420,
    financialPeriodId: '2026-08',
  });

  const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
  const [newRefundForm, setNewRefundForm] = useState({
    originalTransactionId: 'txn-9821',
    type: 'REFUND',
    amountRupees: 1500, // ₹1,500
    currency: 'INR',
    reason: 'Customer satisfaction alteration credit',
    financialPeriodId: '2026-08',
  });

  const [showReconModal, setShowReconModal] = useState<boolean>(false);
  const [newReconForm, setNewReconForm] = useState({
    paymentRef: `pay_Rzp${Math.floor(1000 + Math.random() * 9000)}`,
    orderRef: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    expectedAmountRupees: 16520, // ₹16,520
    receivedAmountRupees: 16520,
    currency: 'INR',
  });

  useEffect(() => {
    fetchFinanceData();
  }, [userRole, userFranchiseId, userBranchId]);

  const getHeaders = () => ({
    Authorization: 'Bearer mock-token',
    'x-user-role': userRole,
    'x-user-org-id': userOrgId,
    'x-user-franchise-id': userFranchiseId,
    'x-user-branch-id': userBranchId,
    'Content-Type': 'application/json',
  });

  const fetchFinanceData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const headers = getHeaders();
      const [
        resSum,
        resLedg,
        resStl,
        resRec,
        resRef,
        resPer,
        resFstmt,
        resBrep,
        resDrep,
        resAud,
        resTaxClass,
        resTaxSched,
        resTaxAud,
      ] = await Promise.all([
        fetch('/api/finance/dashboard-summary', { headers }),
        fetch('/api/finance/revenue-ledger', { headers }),
        fetch('/api/finance/settlements', { headers }),
        fetch('/api/finance/reconciliations', { headers }),
        fetch('/api/finance/refunds', { headers }).catch(() => null),
        fetch('/api/finance/periods', { headers }),
        fetch(`/api/finance/franchise-statement?franchiseId=${userFranchiseId}`, { headers }),
        fetch(`/api/finance/branch-report?branchId=${userBranchId}`, { headers }),
        fetch('/api/finance/division-report', { headers }),
        fetch('/api/finance/audit-trail', { headers }),
        fetch('/api/finance/tax/classifications', { headers }).catch(() => null),
        fetch('/api/finance/tax/schedules', { headers }).catch(() => null),
        fetch('/api/finance/tax/audit-trail', { headers }).catch(() => null),
      ]);

      if (resSum?.ok) setSummary((await resSum.json()).summary);
      if (resLedg?.ok) setLedgerEntries((await resLedg.json()).entries || []);
      if (resStl?.ok) setSettlements((await resStl.json()).settlements || []);
      if (resRec?.ok) setReconciliations((await resRec.json()).reconciliations || []);
      if (resPer?.ok) setPeriods((await resPer.json()).periods || []);
      if (resFstmt?.ok) setFranchiseStatement((await resFstmt.json()).statement);
      if (resBrep?.ok) setBranchReport((await resBrep.json()).report);
      if (resDrep?.ok) setDivisionReport((await resDrep.json()).divisionReport || []);
      if (resAud?.ok) setAuditLogs((await resAud.json()).auditTrail || []);
      if (resTaxClass?.ok) setTaxClassifications((await resTaxClass.json()).classifications || []);
      if (resTaxSched?.ok) setTaxSchedules((await resTaxSched.json()).schedules || []);
      if (resTaxAud?.ok) setTaxAuditTrail((await resTaxAud.json()).auditLogs || []);

    } catch (err: any) {
      console.error('Failed to fetch financial data:', err);
      setErrorMsg('Failed to load financial ledger data.');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (minorUnits: number, currency: string = 'INR') => {
    const symbolMap: Record<string, string> = {
      INR: '₹',
      USD: '$',
      GBP: '£',
      EUR: '€',
    };
    const symbol = symbolMap[currency] || currency;
    const major = minorUnits / 100;
    return `${symbol}${major.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 1. Create Revenue Entry
  const handleCreateLedgerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const grossMinor = Math.round(newLedgerForm.grossAmountRupees * 100);
      const discountMinor = Math.round(newLedgerForm.discountAmountRupees * 100);
      const taxMinor = Math.round(newLedgerForm.taxAmountRupees * 100);

      const payload = {
        transactionId: newLedgerForm.transactionId,
        divisionId: newLedgerForm.divisionId,
        franchiseId: newLedgerForm.isCorporateOwned ? null : newLedgerForm.franchiseId,
        branchId: newLedgerForm.branchId,
        isCorporateOwned: newLedgerForm.isCorporateOwned,
        orderId: newLedgerForm.orderId,
        serviceProductRef: newLedgerForm.serviceProductRef,
        paymentRef: newLedgerForm.paymentRef,
        currency: newLedgerForm.currency,
        grossAmountInMinorUnits: grossMinor,
        discountAmountInMinorUnits: discountMinor,
        taxAmountInMinorUnits: taxMinor,
        financialPeriodId: newLedgerForm.financialPeriodId,
      };

      const res = await fetch('/api/finance/revenue-ledger', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record revenue entry');

      if (data.idempotentRetried) {
        setSuccessMsg(`[IDEMPOTENCY] Transaction '${newLedgerForm.transactionId}' was already recorded. Returned cached entry.`);
      } else {
        setSuccessMsg(`Recorded revenue entry '${data.entry.ledgerId}' for Order ${data.entry.orderId}. Net Recognized: ${formatMoney(data.entry.netRevenueInMinorUnits, data.entry.currency)}`);
      }

      setShowLedgerModal(false);
      setNewLedgerForm((prev) => ({ ...prev, transactionId: `txn-${Math.floor(1000 + Math.random() * 9000)}` }));
      fetchFinanceData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 2. Submit Refund/Adjustment
  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const amountMinor = Math.round(newRefundForm.amountRupees * 100);

      const payload = {
        originalTransactionId: newRefundForm.originalTransactionId,
        type: newRefundForm.type,
        amountInMinorUnits: amountMinor,
        currency: newRefundForm.currency,
        reason: newRefundForm.reason,
        financialPeriodId: newRefundForm.financialPeriodId,
      };

      const res = await fetch('/api/finance/refunds', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process refund');

      if (data.adjustment.status === 'PENDING_APPROVAL') {
        setSuccessMsg(`Refund request '${data.adjustment.adjustmentId}' created and requires executive approval (> ₹10,000 threshold).`);
      } else {
        setSuccessMsg(`Refund '${data.adjustment.adjustmentId}' executed successfully for amount ${formatMoney(data.adjustment.amountInMinorUnits, data.adjustment.currency)}.`);
      }

      setShowRefundModal(false);
      fetchFinanceData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 3. Verify Payment Reconciliation
  const handleVerifyReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const expMinor = Math.round(newReconForm.expectedAmountRupees * 100);
      const recMinor = Math.round(newReconForm.receivedAmountRupees * 100);

      const payload = {
        paymentRef: newReconForm.paymentRef,
        orderRef: newReconForm.orderRef,
        expectedAmountInMinorUnits: expMinor,
        receivedAmountInMinorUnits: recMinor,
        currency: newReconForm.currency,
      };

      const res = await fetch('/api/finance/reconciliations/verify', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify payment reconciliation');

      if (data.reconciliation.reconciliationStatus === 'MATCHED') {
        setSuccessMsg(`Payment '${newReconForm.paymentRef}' verified and MATCHED perfectly!`);
      } else {
        setErrorMsg(`Payment discrepancy detected! Reconciliation status: MISMATCH (${data.reconciliation.mismatchReason})`);
      }

      setShowReconModal(false);
      fetchFinanceData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 4. Settlement State Transition
  const handleSettlementTransition = async (settlementId: string, targetStatus: SettlementStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/finance/settlements/${settlementId}/transition`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetStatus, reason: `State transition to ${targetStatus} executed by UI` }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transition settlement');

      setSuccessMsg(`Settlement '${settlementId}' status advanced to '${targetStatus}'.`);
      fetchFinanceData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 5. Period Status Toggle
  const handlePeriodStatusChange = async (periodId: string, targetStatus: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/finance/periods/${periodId}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update period status');

      setSuccessMsg(`Financial period '${periodId}' status set to '${targetStatus}'.`);
      fetchFinanceData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-6 font-sans">
      {/* Top Banner Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20">
              Phase 2D Financial Control
            </span>
            <span className="text-xs font-mono text-slate-400">Org: {userOrgId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise Finance, Settlement & Revenue Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative revenue ledger, payment reconciliations, period controls & multi-division reporting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowLedgerModal(true)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            + Record Revenue Entry
          </button>

          <button
            onClick={() => setShowRefundModal(true)}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            + Process Refund / Adj
          </button>

          <button
            onClick={() => setShowReconModal(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            + Reconcile Payment
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs flex justify-between items-center">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 font-bold ml-4">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="max-w-7xl mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-lg text-xs flex justify-between items-center">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex border-b border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Financial Summary', icon: '📈' },
          { id: 'ledger', label: 'Revenue Ledger', icon: '📖', count: ledgerEntries.length },
          { id: 'settlements', label: 'Settlements State Engine', icon: '💼', count: settlements.length },
          { id: 'reconciliation', label: 'Payment Reconciliation', icon: '⚖️', count: reconciliations.length },
          { id: 'refunds', label: 'Refunds & Adjustments', icon: '↩️', count: refunds.length },
          { id: 'periods', label: 'Accounting Periods', icon: '🔒', count: periods.length },
          { id: 'reports', label: 'Reports & Statements', icon: '📑' },
          { id: 'tax', label: 'Tax & HSN/SAC Engine', icon: '🏷️', count: taxSchedules.length },
          { id: 'audit', label: 'Financial Audit Trail', icon: '📜', count: auditLogs.length },
        ].map((tab) => (

          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1 bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full text-[10px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Tab Views */}
      <div className="max-w-7xl mx-auto">
        {/* TAB 1: FINANCIAL OVERVIEW */}
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 shadow-md">
                <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Total Gross Revenue</span>
                <span className="text-2xl font-extrabold text-white font-mono">
                  {formatMoney(summary.totalGrossRevenueInMinorUnits, summary.currency)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Across all division transactions</span>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/30 shadow-md">
                <span className="text-xs text-emerald-400 uppercase font-semibold block mb-1">Net Recognized Revenue</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {formatMoney(summary.totalNetRevenueInMinorUnits, summary.currency)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Post discounts & refunds</span>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-amber-500/30 shadow-md">
                <span className="text-xs text-amber-400 uppercase font-semibold block mb-1">Accrued Franchise Royalty</span>
                <span className="text-2xl font-extrabold text-amber-400 font-mono">
                  {formatMoney(summary.totalRoyaltyInMinorUnits, summary.currency)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Server-authoritative calculation</span>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-rose-500/30 shadow-md">
                <span className="text-xs text-rose-400 uppercase font-semibold block mb-1">Total Refunds Processed</span>
                <span className="text-2xl font-extrabold text-rose-400 font-mono">
                  {formatMoney(summary.totalRefundsInMinorUnits, summary.currency)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Pending approval: {summary.pendingRefundsCount}</span>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                  <span>Financial Period Control</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Active: {summary.activeFinancialPeriod}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Financial periods dictate permitted modifications. Closed periods block retro-active ledger tampering.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('periods')}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Manage Periods
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                  <span>Settlements Pending Action</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                    {summary.pendingSettlementsCount} Statements
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Review and advance settlements through the state transition matrix to READY_FOR_PAYOUT.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('settlements')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Review Settlements
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REVENUE LEDGER */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/90">
              <div>
                <h3 className="text-sm font-bold text-white">Controlled Enterprise Revenue Ledger</h3>
                <p className="text-xs text-slate-400">Append-only financial source of truth for all recognized sales.</p>
              </div>
              <button
                onClick={() => setShowLedgerModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
              >
                + Record Entry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-3">Ledger ID & Txn</th>
                    <th className="p-3">Division & Scope</th>
                    <th className="p-3">Service / Item Ref</th>
                    <th className="p-3">Gross / Net Revenue</th>
                    <th className="p-3">Accrued Royalty</th>
                    <th className="p-3">Period & Status</th>
                    <th className="p-3">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {ledgerEntries.map((e) => (
                    <tr key={e.ledgerId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-emerald-300 block">{e.ledgerId}</span>
                        <span className="text-slate-400 text-[11px]">Txn: {e.transactionId}</span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold capitalize text-white block">{e.divisionId}</span>
                        <span className="text-[11px] text-slate-400">
                          {e.isCorporateOwned ? 'Corporate Flagship' : `Franchise: ${e.franchiseId}`}
                        </span>
                      </td>

                      <td className="p-3 max-w-[200px] truncate" title={e.serviceProductRef}>
                        <span className="font-semibold text-slate-200 block">{e.serviceProductRef}</span>
                        <span className="text-[11px] text-slate-400">Order: {e.orderId || 'N/A'}</span>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-bold text-white">{formatMoney(e.netRevenueInMinorUnits, e.currency)}</div>
                        <div className="text-[10px] text-slate-400">
                          Gross: {formatMoney(e.grossAmountInMinorUnits, e.currency)}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-amber-300 font-bold">
                        {formatMoney(e.royaltyAmountInMinorUnits, e.currency)}
                      </td>

                      <td className="p-3">
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 uppercase block w-fit mb-1">
                          {e.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">Period: {e.financialPeriodId}</span>
                      </td>

                      <td className="p-3 text-[11px] text-slate-400">
                        {new Date(e.transactionDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: TAX & HSN/SAC SCHEDULE MANAGEMENT */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            {/* HSN/SAC Classification Master Cards */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    🏷️ HSN / SAC Master Classifications
                  </h3>
                  <p className="text-xs text-slate-400">
                    Versioned tax classification codes across products (HSN) and services (SAC).
                  </p>
                </div>
                <button
                  onClick={() => setShowNewClassModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition-all"
                >
                  + Add HSN / SAC Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taxClassifications.map((item) => (
                  <div key={item.classificationId} className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/60 shadow hover:border-emerald-500/40 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.codeType === 'HSN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                        {item.codeType} {item.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">v{item.version}</span>
                    </div>
                    <p className="text-xs font-semibold text-white mb-1">{item.description}</p>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Category: <span className="text-slate-300 font-medium">{item.category}</span></div>
                      <div>Applicability: <span className="text-slate-300 font-medium">{item.serviceOrProduct}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Tax Schedules Table */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-4">
              <div className="border-b border-slate-700/50 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  📊 Effective-Dated Tax Schedules & Version History
                </h3>
                <p className="text-xs text-slate-400">
                  Configurable GST, CGST, SGST, IGST schedules with effective date range protection and non-overlapping version rules.
                </p>
              </div>

              <div className="space-y-4">
                {taxSchedules.map((sched) => (
                  <div key={sched.taxScheduleId} className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{sched.name}</span>
                          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Code: {sched.classificationCode} ({sched.codeType})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{sched.description}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                        Active Version: v{sched.activeVersionNumber}
                      </span>
                    </div>

                    {/* Versions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase">
                          <tr>
                            <th className="p-2">Ver</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">CGST</th>
                            <th className="p-2">SGST</th>
                            <th className="p-2">IGST</th>
                            <th className="p-2">Effective Date Range</th>
                            <th className="p-2">Jurisdiction</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {sched.versions.map((v: any) => (
                            <tr key={v.versionId} className="hover:bg-slate-800/40">
                              <td className="p-2 font-bold font-mono text-emerald-400">v{v.versionNumber}</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${v.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="p-2 font-mono text-amber-300">{v.cgstRatePercent}%</td>
                              <td className="p-2 font-mono text-amber-300">{v.sgstRatePercent}%</td>
                              <td className="p-2 font-mono text-emerald-300 font-bold">{v.igstRatePercent}%</td>
                              <td className="p-2 font-mono text-slate-300 text-[11px]">
                                {new Date(v.effectiveFrom).toLocaleDateString()} → {v.effectiveTo ? new Date(v.effectiveTo).toLocaleDateString() : 'Indefinite'}
                              </td>
                              <td className="p-2 font-mono text-slate-400">{v.jurisdiction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Audit Trail */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white">📜 Tax Compliance Audit Trail</h3>
              <div className="space-y-2">
                {taxAuditTrail.map((audit) => (
                  <div key={audit.auditId} className="bg-slate-900/80 p-3 rounded border border-slate-700/50 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-amber-300 block">{audit.action} ({audit.entity})</span>
                      <span className="text-slate-300">{audit.changeSummary}</span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <div>Actor: {audit.actorId}</div>
                      <div>{new Date(audit.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* TAB 3: SETTLEMENTS STATE ENGINE */}
        {activeTab === 'settlements' && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/90">
              <div>
                <h3 className="text-sm font-bold text-white">Settlements State Engine</h3>
                <p className="text-xs text-slate-400">
                  State Matrix: DRAFT ➔ CALCULATED ➔ REVIEW_REQUIRED ➔ APPROVED ➔ READY_FOR_PAYOUT ➔ PAID ➔ RECONCILED.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-3">Settlement ID</th>
                    <th className="p-3">Franchise & Period</th>
                    <th className="p-3">Eligible Revenue</th>
                    <th className="p-3">Net Settlement</th>
                    <th className="p-3">State Status</th>
                    <th className="p-3">Advance State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {settlements.map((s) => (
                    <tr key={s.settlementId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-300">{s.settlementId}</td>

                      <td className="p-3">
                        <span className="font-semibold text-white block">{s.franchiseId}</span>
                        <span className="text-[11px] font-mono text-slate-400">{s.settlementPeriod}</span>
                      </td>

                      <td className="p-3 font-mono">{formatMoney(s.eligibleRevenueInMinorUnits, s.currency)}</td>

                      <td className="p-3 font-mono font-bold text-amber-400 text-sm">
                        {formatMoney(s.netSettlementInMinorUnits, s.currency)}
                      </td>

                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-amber-500/20 text-amber-300 border-amber-500/30">
                          {s.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {s.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSettlementTransition(s.settlementId, 'CALCULATED')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Calculate
                            </button>
                          )}
                          {s.status === 'CALCULATED' && (
                            <button
                              onClick={() => handleSettlementTransition(s.settlementId, 'REVIEW_REQUIRED')}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Require Review
                            </button>
                          )}
                          {(s.status === 'REVIEW_REQUIRED' || s.status === 'APPROVED') && (
                            <button
                              onClick={() => handleSettlementTransition(s.settlementId, 'APPROVED')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {s.status === 'APPROVED' && (
                            <button
                              onClick={() => handleSettlementTransition(s.settlementId, 'READY_FOR_PAYOUT')}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Ready Payout
                            </button>
                          )}
                          {s.status === 'READY_FOR_PAYOUT' && (
                            <button
                              onClick={() => handleSettlementTransition(s.settlementId, 'PAID')}
                              className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                          {s.status === 'PAID' && (
                            <button
                              onClick={() => handleSettlementTransition(s.settlementId, 'RECONCILED')}
                              className="px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Reconcile
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT RECONCILIATION */}
        {activeTab === 'reconciliation' && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/90">
              <div>
                <h3 className="text-sm font-bold text-white">Payment Reconciliation Foundation</h3>
                <p className="text-xs text-slate-400">Verifies gateway payment references against order expected totals.</p>
              </div>
              <button
                onClick={() => setShowReconModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold cursor-pointer"
              >
                + Verify Payment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-3">Payment Ref</th>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Expected Amount</th>
                    <th className="p-3">Received Amount</th>
                    <th className="p-3">Reconciliation Status</th>
                    <th className="p-3">Reconciled At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {reconciliations.map((r) => (
                    <tr key={r.reconciliationId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-300">{r.paymentRef}</td>
                      <td className="p-3 font-mono text-slate-200">{r.orderRef}</td>
                      <td className="p-3 font-mono">{formatMoney(r.expectedAmountInMinorUnits, r.currency)}</td>
                      <td className="p-3 font-mono font-bold">{formatMoney(r.receivedAmountInMinorUnits, r.currency)}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            r.reconciliationStatus === 'MATCHED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {r.reconciliationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {r.reconciledAt ? new Date(r.reconciledAt).toLocaleString() : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: REFUNDS & ADJUSTMENTS */}
        {activeTab === 'refunds' && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/90">
              <div>
                <h3 className="text-sm font-bold text-white">Controlled Refund & Adjustment Register</h3>
                <p className="text-xs text-slate-400">Compensating transaction logs preventing retro-active ledger mutation.</p>
              </div>
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold cursor-pointer"
              >
                + Process Refund
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-3">Adjustment ID</th>
                    <th className="p-3">Original Txn</th>
                    <th className="p-3">Type & Amount</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Requested By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {refunds.map((rf) => (
                    <tr key={rf.adjustmentId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-rose-300">{rf.adjustmentId}</td>
                      <td className="p-3 font-mono text-slate-200">{rf.originalTransactionId}</td>
                      <td className="p-3 font-mono font-bold text-rose-400">
                        {formatMoney(rf.amountInMinorUnits, rf.currency)}
                      </td>
                      <td className="p-3 text-slate-300 max-w-[200px] truncate">{rf.reason}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            rf.status === 'EXECUTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {rf.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{rf.requestedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ACCOUNTING PERIODS */}
        {activeTab === 'periods' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {periods.map((p) => (
              <div
                key={p.periodId}
                className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-md space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-extrabold text-white font-mono">Period: {p.periodId}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      p.status === 'OPEN'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : p.status === 'LOCKED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Start: <span className="text-slate-200">{new Date(p.startDate).toLocaleDateString()}</span></div>
                  <div>End: <span className="text-slate-200">{new Date(p.endDate).toLocaleDateString()}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex gap-2">
                  {p.status === 'OPEN' && (
                    <button
                      onClick={() => handlePeriodStatusChange(p.periodId, 'LOCKED')}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Lock Period
                    </button>
                  )}
                  {p.status === 'LOCKED' && (
                    <button
                      onClick={() => handlePeriodStatusChange(p.periodId, 'CLOSED')}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Close Period
                    </button>
                  )}
                  {p.status === 'CLOSED' && (
                    <span className="text-[11px] text-slate-500 font-mono text-center w-full block">
                      Period Closed (Immutable)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: REPORTS & STATEMENTS */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Franchise Financial Statement Card */}
            {franchiseStatement && (
              <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Franchise Financial Summary</span>
                  <span className="text-xs font-mono text-amber-400">{franchiseStatement.franchiseId}</span>
                </h3>

                <div className="space-y-2 text-xs bg-slate-900/60 p-4 rounded-lg border border-slate-700/40">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Sales:</span>
                    <span className="font-bold text-white">{formatMoney(franchiseStatement.grossSalesInMinorUnits, franchiseStatement.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discounts & Refunds:</span>
                    <span className="font-bold text-rose-400">-{formatMoney(franchiseStatement.discountsInMinorUnits + franchiseStatement.refundsInMinorUnits, franchiseStatement.currency)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-slate-300 font-semibold">Net Recognized Revenue:</span>
                    <span className="font-bold text-emerald-400">{formatMoney(franchiseStatement.netRevenueInMinorUnits, franchiseStatement.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accrued Royalty Liability:</span>
                    <span className="font-bold text-amber-300">{formatMoney(franchiseStatement.royaltyInMinorUnits, franchiseStatement.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Division Consolidated Report */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Consolidated Division Revenue</h3>
              <div className="space-y-3">
                {divisionReport.map((div) => (
                  <div key={div.divisionId} className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">{div.divisionName}</span>
                      <span className="text-[11px] text-slate-400">{div.transactionCount} Transactions</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-400 block">{formatMoney(div.netRevenueInMinorUnits)}</span>
                      <span className="text-[10px] text-amber-300">Royalty: {formatMoney(div.royaltyTotalsInMinorUnits)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/90">
              <h3 className="text-sm font-bold text-white">Append-Only Financial Audit Trail</h3>
              <p className="text-xs text-slate-400">Immutable audit records capturing all sensitive financial modifications.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity & ID</th>
                    <th className="p-3">Actor & Role</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.auditId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-bold text-amber-300">{log.auditId}</td>
                      <td className="p-3 font-bold text-white">{log.action}</td>
                      <td className="p-3 text-slate-300">
                        {log.entity}:{log.entityId}
                      </td>
                      <td className="p-3 text-slate-400">
                        {log.actorId} ({log.actorRole})
                      </td>
                      <td className="p-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: TAX & HSN/SAC SCHEDULE MANAGEMENT */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            {/* HSN/SAC Classification Master Cards */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    🏷️ HSN / SAC Master Classifications
                  </h3>
                  <p className="text-xs text-slate-400">
                    Versioned tax classification codes across products (HSN) and services (SAC).
                  </p>
                </div>
                <button
                  onClick={() => setShowNewClassModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition-all cursor-pointer"
                >
                  + Add HSN / SAC Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taxClassifications.map((item) => (
                  <div key={item.classificationId} className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/60 shadow hover:border-emerald-500/40 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.codeType === 'HSN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                        {item.codeType} {item.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">v{item.version}</span>
                    </div>
                    <p className="text-xs font-semibold text-white mb-1">{item.description}</p>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Category: <span className="text-slate-300 font-medium">{item.category}</span></div>
                      <div>Applicability: <span className="text-slate-300 font-medium">{item.serviceOrProduct}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Tax Schedules Table */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-4">
              <div className="border-b border-slate-700/50 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  📊 Effective-Dated Tax Schedules & Version History
                </h3>
                <p className="text-xs text-slate-400">
                  Configurable GST, CGST, SGST, IGST schedules with effective date range protection and non-overlapping version rules.
                </p>
              </div>

              <div className="space-y-4">
                {taxSchedules.map((sched) => (
                  <div key={sched.taxScheduleId} className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{sched.name}</span>
                          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Code: {sched.classificationCode} ({sched.codeType})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{sched.description}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                        Active Version: v{sched.activeVersionNumber}
                      </span>
                    </div>

                    {/* Versions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase">
                          <tr>
                            <th className="p-2">Ver</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">CGST</th>
                            <th className="p-2">SGST</th>
                            <th className="p-2">IGST</th>
                            <th className="p-2">Effective Date Range</th>
                            <th className="p-2">Jurisdiction</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {sched.versions.map((v: any) => (
                            <tr key={v.versionId} className="hover:bg-slate-800/40">
                              <td className="p-2 font-bold font-mono text-emerald-400">v{v.versionNumber}</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${v.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="p-2 font-mono text-amber-300">{v.cgstRatePercent}%</td>
                              <td className="p-2 font-mono text-amber-300">{v.sgstRatePercent}%</td>
                              <td className="p-2 font-mono text-emerald-300 font-bold">{v.igstRatePercent}%</td>
                              <td className="p-2 font-mono text-slate-300 text-[11px]">
                                {new Date(v.effectiveFrom).toLocaleDateString()} → {v.effectiveTo ? new Date(v.effectiveTo).toLocaleDateString() : 'Indefinite'}
                              </td>
                              <td className="p-2 font-mono text-slate-400">{v.jurisdiction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Audit Trail */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white">📜 Tax Compliance Audit Trail</h3>
              <div className="space-y-2">
                {taxAuditTrail.map((audit) => (
                  <div key={audit.auditId} className="bg-slate-900/80 p-3 rounded border border-slate-700/50 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-amber-300 block">{audit.action} ({audit.entity})</span>
                      <span className="text-slate-300">{audit.changeSummary}</span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <div>Actor: {audit.actorId}</div>
                      <div>{new Date(audit.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Record Revenue Entry */}

      {showLedgerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Record Revenue Ledger Entry</h3>
              <button onClick={() => setShowLedgerModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateLedgerEntry} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Transaction ID:</label>
                  <input
                    type="text"
                    value={newLedgerForm.transactionId}
                    onChange={(e) => setNewLedgerForm({ ...newLedgerForm, transactionId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Division:</label>
                  <select
                    value={newLedgerForm.divisionId}
                    onChange={(e) => setNewLedgerForm({ ...newLedgerForm, divisionId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  >
                    <option value="laundry">FabriQ AI</option>
                    <option value="boutique">FabriQ Boutique</option>
                    <option value="luxury_store">FabriQ Luxury Store</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Service / Product Description:</label>
                <input
                  type="text"
                  value={newLedgerForm.serviceProductRef}
                  onChange={(e) => setNewLedgerForm({ ...newLedgerForm, serviceProductRef: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Gross Amount (Major Units ₹):</label>
                  <input
                    type="number"
                    value={newLedgerForm.grossAmountRupees}
                    onChange={(e) => setNewLedgerForm({ ...newLedgerForm, grossAmountRupees: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Discount Amount (₹):</label>
                  <input
                    type="number"
                    value={newLedgerForm.discountAmountRupees}
                    onChange={(e) => setNewLedgerForm({ ...newLedgerForm, discountAmountRupees: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Process Refund */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Process Refund / Financial Adjustment</h3>
              <button onClick={() => setShowRefundModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateRefund} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Original Transaction ID:</label>
                <input
                  type="text"
                  value={newRefundForm.originalTransactionId}
                  onChange={(e) => setNewRefundForm({ ...newRefundForm, originalTransactionId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Refund Amount (Major Units ₹):</label>
                <input
                  type="number"
                  value={newRefundForm.amountRupees}
                  onChange={(e) => setNewRefundForm({ ...newRefundForm, amountRupees: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Reason:</label>
                <input
                  type="text"
                  value={newRefundForm.reason}
                  onChange={(e) => setNewRefundForm({ ...newRefundForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold"
                >
                  Submit Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Reconcile Payment */}
      {showReconModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Reconcile Payment Reference</h3>
              <button onClick={() => setShowReconModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleVerifyReconciliation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Payment Ref:</label>
                  <input
                    type="text"
                    value={newReconForm.paymentRef}
                    onChange={(e) => setNewReconForm({ ...newReconForm, paymentRef: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Order Ref:</label>
                  <input
                    type="text"
                    value={newReconForm.orderRef}
                    onChange={(e) => setNewReconForm({ ...newReconForm, orderRef: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Expected Amount (₹):</label>
                  <input
                    type="number"
                    value={newReconForm.expectedAmountRupees}
                    onChange={(e) => setNewReconForm({ ...newReconForm, expectedAmountRupees: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Received Amount (₹):</label>
                  <input
                    type="number"
                    value={newReconForm.receivedAmountRupees}
                    onChange={(e) => setNewReconForm({ ...newReconForm, receivedAmountRupees: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReconModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
                >
                  Verify Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
