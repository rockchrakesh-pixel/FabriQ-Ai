import React, { useState, useEffect } from 'react';
import {
  VersionedFranchiseAgreement,
  CommercialRevenueEvent,
  RoyaltyCalculationResult,
  FranchiseSettlement,
  SettlementStatus,
  RoyaltyModel,
  CommercialEventType,
} from '../../types';

interface FranchiseCommercialDashboardProps {
  userRole?: string;
  userOrgId?: string;
  userFranchiseId?: string;
}

export const FranchiseCommercialDashboard: React.FC<FranchiseCommercialDashboardProps> = ({
  userRole = 'owner',
  userOrgId = 'org-fabriq-global',
  userFranchiseId = 'fr-hyd-01',
}) => {
  const [activeTab, setActiveTab] = useState<'agreements' | 'events' | 'simulator' | 'settlements' | 'audit'>('agreements');

  // State
  const [agreements, setAgreements] = useState<VersionedFranchiseAgreement[]>([]);
  const [events, setEvents] = useState<CommercialRevenueEvent[]>([]);
  const [settlements, setSettlements] = useState<FranchiseSettlement[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals & Forms
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [newVersionForm, setNewVersionForm] = useState({
    franchiseId: 'fr-hyd-01',
    agreementId: 'agr_fr-hyd-01',
    version: '2.0',
    royaltyModel: 'tiered' as RoyaltyModel,
    royaltyPercentage: 7.0,
    flatFeeInMinorUnits: 500000,
    currency: 'INR',
    effectiveDate: new Date().toISOString().split('T')[0],
    territory: 'Telangana & Andhra Pradesh',
  });

  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [newEventForm, setNewEventForm] = useState({
    idempotencyKey: `idemp-demo-${Date.now()}`,
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    isCorporateOwned: false,
    orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    eventType: 'SERVICE_SALE' as CommercialEventType,
    grossAmountInRupees: 25000, // ₹25,000
    discountAmountInRupees: 1000,
    taxAmountInRupees: 4320,
    currency: 'INR',
    source: 'POS_TERMINAL',
  });

  // Simulator State
  const [simForm, setSimForm] = useState({
    grossRevenueRupees: 1500000, // ₹15 Lakhs
    isCorporateOwned: false,
    franchiseId: 'fr-hyd-01',
    currency: 'INR',
    agreementVersionId: 'agr_fr-hyd-01_v1.1',
  });
  const [simResult, setSimResult] = useState<RoyaltyCalculationResult | null>(null);

  // Status Modal
  const [disputeModalSettlementId, setDisputeModalSettlementId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');

  useEffect(() => {
    fetchCommercialData();
  }, [userFranchiseId]);

  const fetchCommercialData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Mock authorization headers
      const headers = {
        Authorization: 'Bearer mock-token',
        'x-user-role': userRole,
        'x-user-org-id': userOrgId,
        'x-user-franchise-id': userFranchiseId,
        'Content-Type': 'application/json',
      };

      const [resAgr, resEvt, resStl] = await Promise.all([
        fetch('/api/commercial/agreements', { headers }),
        fetch('/api/commercial/events', { headers }),
        fetch('/api/commercial/settlements', { headers }),
      ]);

      if (resAgr.ok) {
        const data = await resAgr.json();
        setAgreements(data.agreements || []);
      }
      if (resEvt.ok) {
        const data = await resEvt.json();
        setEvents(data.events || []);
      }
      if (resStl.ok) {
        const data = await resStl.json();
        setSettlements(data.settlements || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch commercial data:', err);
      setErrorMsg('Failed to load commercial royalty data.');
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting money minor units (paise/pence -> ₹/£/$/€)
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

  // 1. Issue New Version
  const handleIssueVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        ...newVersionForm,
        flatFeeInMinorUnits: newVersionForm.flatFeeInMinorUnits,
        tieredSlabs:
          newVersionForm.royaltyModel === 'tiered'
            ? [
                { slabId: 's1', minAmountInMinorUnits: 0, maxAmountInMinorUnits: 100000000, ratePercentage: 5.0 },
                { slabId: 's2', minAmountInMinorUnits: 100000000, maxAmountInMinorUnits: 250000000, ratePercentage: 7.0 },
                { slabId: 's3', minAmountInMinorUnits: 250000000, maxAmountInMinorUnits: null, ratePercentage: 9.0 },
              ]
            : undefined,
      };

      const res = await fetch('/api/commercial/agreements/version', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-token',
          'x-user-role': userRole,
          'x-user-org-id': userOrgId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue new agreement version');
      }

      setSuccessMsg(`Successfully issued Agreement Version ${data.agreement.version} (${data.agreement.agreementVersionId})`);
      setShowVersionModal(false);
      fetchCommercialData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 2. Record Revenue Event
  const handleRecordEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const grossMinor = Math.round(newEventForm.grossAmountInRupees * 100);
      const discountMinor = Math.round(newEventForm.discountAmountInRupees * 100);
      const taxMinor = Math.round(newEventForm.taxAmountInRupees * 100);

      const payload = {
        idempotencyKey: newEventForm.idempotencyKey,
        divisionId: newEventForm.divisionId,
        franchiseId: newEventForm.isCorporateOwned ? null : newEventForm.franchiseId,
        branchId: newEventForm.branchId,
        isCorporateOwned: newEventForm.isCorporateOwned,
        orderId: newEventForm.orderId,
        eventType: newEventForm.eventType,
        grossAmountInMinorUnits: grossMinor,
        discountAmountInMinorUnits: discountMinor,
        taxAmountInMinorUnits: taxMinor,
        currency: newEventForm.currency,
        source: newEventForm.source,
      };

      const res = await fetch('/api/commercial/events', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-token',
          'x-user-role': userRole,
          'x-user-org-id': userOrgId,
          'x-user-franchise-id': userFranchiseId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record revenue event');
      }

      if (data.idempotentRetried) {
        setSuccessMsg(`[IDEMPOTENCY TRIGGERED] Event for key '${newEventForm.idempotencyKey}' was already processed. Returned existing record.`);
      } else {
        setSuccessMsg(`Successfully recorded commercial event '${data.event.eventId}' for Order ${data.event.orderId}. Royalty: ${formatMoney(data.royaltyCalculation?.calculatedRoyaltyInMinorUnits || 0, data.event.currency)}`);
      }

      setShowEventModal(false);
      // Reset idempotency key for next test
      setNewEventForm((prev) => ({ ...prev, idempotencyKey: `idemp-demo-${Date.now()}` }));
      fetchCommercialData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 3. Run Simulator
  const handleRunSimulator = () => {
    setErrorMsg(null);
    try {
      const grossMinor = Math.round(simForm.grossRevenueRupees * 100);

      const mockEvt: CommercialRevenueEvent = {
        eventId: 'evt-sim-temp',
        idempotencyKey: `idemp-sim-${Date.now()}`,
        orgId: userOrgId,
        divisionId: 'laundry',
        franchiseId: simForm.isCorporateOwned ? null : simForm.franchiseId,
        branchId: 'b-sim-01',
        isCorporateOwned: simForm.isCorporateOwned,
        orderId: 'ORD-SIMULATOR',
        eventType: 'SERVICE_SALE',
        grossAmountInMinorUnits: grossMinor,
        discountAmountInMinorUnits: 0,
        taxAmountInMinorUnits: 0,
        netAmountInMinorUnits: grossMinor,
        eligibleRevenueInMinorUnits: grossMinor,
        currency: simForm.currency,
        timestamp: new Date().toISOString(),
        source: 'SIMULATOR',
        agreementVersionId: simForm.agreementVersionId,
        createdAt: new Date().toISOString(),
      };

      const selectedAgreement = agreements.find((a) => a.agreementVersionId === simForm.agreementVersionId);

      // Check currency mismatch
      if (!simForm.isCorporateOwned && selectedAgreement && selectedAgreement.currency !== simForm.currency) {
        throw new Error(`Currency mismatch! Event currency (${simForm.currency}) != Agreement currency (${selectedAgreement.currency})`);
      }

      // Calculate server-side logic locally for instant simulator feedback
      if (mockEvt.isCorporateOwned || !mockEvt.franchiseId) {
        setSimResult({
          calculationId: `calc_sim_${Date.now()}`,
          eventId: mockEvt.eventId,
          orgId: mockEvt.orgId,
          franchiseId: null,
          branchId: mockEvt.branchId,
          agreementVersionId: null,
          agreementVersion: null,
          royaltyModel: 'none_corporate',
          eligibleRevenueInMinorUnits: grossMinor,
          calculatedRoyaltyInMinorUnits: 0,
          currency: mockEvt.currency,
          isCorporateOwned: true,
          breakdown: {
            model: 'Corporate-Owned Branch (isCorporateOwned = true) — Royalty is strictly ZERO.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const agr = selectedAgreement || agreements[0];
      let calcRoyalty = 0;
      let effectiveRate = 0;
      const slabBreakdown: any[] = [];

      if (agr.royaltyModel === 'fixed_percentage') {
        calcRoyalty = Math.round((grossMinor * agr.royaltyPercentage) / 100);
        effectiveRate = agr.royaltyPercentage;
      } else if (agr.royaltyModel === 'tiered') {
        const slabs = agr.tieredSlabs || [
          { slabId: 's1', minAmountInMinorUnits: 0, maxAmountInMinorUnits: 100000000, ratePercentage: 5.0 },
          { slabId: 's2', minAmountInMinorUnits: 100000000, maxAmountInMinorUnits: 250000000, ratePercentage: 7.0 },
          { slabId: 's3', minAmountInMinorUnits: 250000000, maxAmountInMinorUnits: null, ratePercentage: 9.0 },
        ];

        for (const slab of slabs) {
          const slabMin = slab.minAmountInMinorUnits;
          const slabMax = slab.maxAmountInMinorUnits || Number.POSITIVE_INFINITY;

          if (grossMinor > slabMin) {
            const taxablePart = Math.min(grossMinor, slabMax) - slabMin;
            if (taxablePart > 0) {
              const slabRoy = Math.round((taxablePart * slab.ratePercentage) / 100);
              calcRoyalty += slabRoy;
              slabBreakdown.push({
                slabId: slab.slabId,
                minMinor: slabMin,
                maxMinor: slab.maxAmountInMinorUnits,
                ratePercentage: slab.ratePercentage,
                taxableAmountInMinor: taxablePart,
                royaltyInMinor: slabRoy,
              });
            }
          }
        }
        effectiveRate = grossMinor > 0 ? Number(((calcRoyalty / grossMinor) * 100).toFixed(2)) : 0;
      } else if (agr.royaltyModel === 'flat_fee') {
        calcRoyalty = agr.flatFeeInMinorUnits || 500000;
      }

      setSimResult({
        calculationId: `calc_sim_${Date.now()}`,
        eventId: mockEvt.eventId,
        orgId: mockEvt.orgId,
        franchiseId: mockEvt.franchiseId,
        branchId: mockEvt.branchId,
        agreementVersionId: agr.agreementVersionId,
        agreementVersion: agr.version,
        royaltyModel: agr.royaltyModel,
        eligibleRevenueInMinorUnits: grossMinor,
        calculatedRoyaltyInMinorUnits: calcRoyalty,
        currency: mockEvt.currency,
        isCorporateOwned: false,
        breakdown: {
          model: `Governed by Version ${agr.version} (${agr.royaltyModel})`,
          effectiveRatePercentage: effectiveRate,
          slabBreakdown,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 4. Generate Settlement
  const handleGenerateSettlement = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/commercial/settlements/generate', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-token',
          'x-user-role': userRole,
          'x-user-org-id': userOrgId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          franchiseId: userFranchiseId,
          settlementPeriod: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01_${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-30`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate settlement statement');
      }

      setSuccessMsg(`Generated draft settlement statement '${data.settlement.settlementId}' for period ${data.settlement.settlementPeriod}`);
      fetchCommercialData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 5. Settlement Status Advance
  const handleUpdateSettlementStatus = async (settlementId: string, nextStatus: SettlementStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/commercial/settlements/${settlementId}/status`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-token',
          'x-user-role': userRole,
          'x-user-org-id': userOrgId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nextStatus,
          disputeReason: nextStatus === 'DISPUTED' ? disputeReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settlement status');
      }

      setSuccessMsg(`Settlement '${settlementId}' status advanced to ${nextStatus}`);
      setDisputeModalSettlementId(null);
      setDisputeReason('');
      fetchCommercialData();
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
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20">
              Phase 2C Commercial Engine
            </span>
            <span className="text-xs font-mono text-slate-400">Org: {userOrgId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Franchise Commercial & Royalty Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Versioned commercial terms, progressive marginal royalty calculations, normalized revenue events & settlement workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEventModal(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            + Record Revenue Event
          </button>

          <button
            onClick={() => setShowVersionModal(true)}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            + Issue Agreement Version
          </button>

          <button
            onClick={handleGenerateSettlement}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            ⚡ Generate Draft Settlement
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
          { id: 'agreements', label: 'Commercial Agreements', icon: '📜', count: agreements.length },
          { id: 'events', label: 'Revenue Event Ledger', icon: '📊', count: events.length },
          { id: 'simulator', label: 'Royalty Simulator', icon: '🧮' },
          { id: 'settlements', label: 'Settlement Workflow', icon: '💼', count: settlements.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-400 font-bold'
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
        {/* TAB 1: COMMERCIAL AGREEMENTS */}
        {activeTab === 'agreements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agreements.map((agr) => {
                const isActive = agr.status === 'active';
                return (
                  <div
                    key={agr.agreementVersionId}
                    className={`bg-slate-800/80 rounded-xl p-5 border transition-all ${
                      isActive ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-slate-700/50 opacity-75'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Version {agr.version}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {agr.status}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          ID: {agr.agreementVersionId}
                        </span>
                      </div>
                      <span className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded text-amber-300 font-bold">
                        {agr.currency}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-700/40">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Royalty Model:</span>
                        <span className="font-semibold text-amber-300 capitalize">{agr.royaltyModel.replace('_', ' ')}</span>
                      </div>

                      {agr.royaltyModel === 'fixed_percentage' && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Fixed Rate:</span>
                          <span className="font-bold text-white">{agr.royaltyPercentage}%</span>
                        </div>
                      )}

                      {agr.royaltyModel === 'flat_fee' && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Flat Fee / Period:</span>
                          <span className="font-bold text-white">
                            {formatMoney(agr.flatFeeInMinorUnits || 500000, agr.currency)}
                          </span>
                        </div>
                      )}

                      {agr.royaltyModel === 'tiered' && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50">
                          <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                            Progressive Marginal Slabs:
                          </span>
                          <div className="space-y-1 font-mono text-[11px]">
                            {agr.tieredSlabs?.map((s) => (
                              <div key={s.slabId} className="flex justify-between bg-slate-800/80 px-2 py-0.5 rounded">
                                <span>
                                  {formatMoney(s.minAmountInMinorUnits, agr.currency)} –{' '}
                                  {s.maxAmountInMinorUnits ? formatMoney(s.maxAmountInMinorUnits, agr.currency) : '∞'}
                                </span>
                                <span className="font-bold text-emerald-400">{s.ratePercentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t border-slate-700/50">
                        <span className="text-slate-400">Settlement Frequency:</span>
                        <span className="font-semibold capitalize text-slate-200">{agr.settlementFrequency}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Effective Date:</span>
                        <span className="font-mono text-slate-300">{new Date(agr.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Franchise: <strong className="text-slate-300">{agr.franchiseId}</strong></span>
                      <span>Scope: <strong className="text-slate-300">{agr.applicableDivisions.length} Divisions</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COMMERCIAL REVENUE EVENT LEDGER */}
        {activeTab === 'events' && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/90">
              <div>
                <h3 className="text-sm font-bold text-white">Normalized Revenue Event Stream</h3>
                <p className="text-xs text-slate-400">Auditable, idempotent commercial event entries across all divisions.</p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                {events.length} Events Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-3">Event ID & Order</th>
                    <th className="p-3">Type & Division</th>
                    <th className="p-3">Branch & Scope</th>
                    <th className="p-3">Gross / Net Revenue</th>
                    <th className="p-3">Agreement Version</th>
                    <th className="p-3">Idempotency Key</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {events.map((e) => (
                    <tr key={e.eventId} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-amber-300 block">{e.eventId}</span>
                        <span className="text-slate-400 text-[11px]">Order: {e.orderId}</span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded block w-fit mb-1 ${
                            e.eventType.includes('REFUND') || e.eventType.includes('RETURN')
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {e.eventType}
                        </span>
                        <span className="text-[11px] capitalize text-slate-400">{e.divisionId}</span>
                      </td>

                      <td className="p-3">
                        {e.isCorporateOwned ? (
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                            Corporate Flagship
                          </span>
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-200 block">{e.franchiseId}</span>
                            <span className="text-[11px] text-slate-400">{e.branchId}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-bold text-white">{formatMoney(e.netAmountInMinorUnits, e.currency)}</div>
                        <div className="text-[10px] text-slate-400">
                          Gross: {formatMoney(e.grossAmountInMinorUnits, e.currency)}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        {e.agreementVersionId ? (
                          <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {e.agreementVersionId}
                          </span>
                        ) : (
                          <span className="text-slate-500">N/A (Corporate)</span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-[10px] text-slate-400 truncate max-w-[140px]" title={e.idempotencyKey}>
                        {e.idempotencyKey}
                      </td>

                      <td className="p-3 text-[11px] text-slate-400">
                        {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ROYALTY SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🧮</span>
                <span>Authoritative Server Royalty Simulator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Test royalty output against corporate vs franchise branches, tiered progressive slabs, and currency matching.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Revenue Amount (in ₹ Major Units):</label>
                  <input
                    type="number"
                    value={simForm.grossRevenueRupees}
                    onChange={(e) => setSimForm({ ...simForm, grossRevenueRupees: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Converted integer minor units: {Math.round(simForm.grossRevenueRupees * 100)} paise
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded border border-slate-700/50">
                  <input
                    type="checkbox"
                    id="simCorporate"
                    checked={simForm.isCorporateOwned}
                    onChange={(e) => setSimForm({ ...simForm, isCorporateOwned: e.target.checked })}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <label htmlFor="simCorporate" className="text-slate-300 font-semibold cursor-pointer">
                    Is Corporate-Owned Branch? (isCorporateOwned = true)
                  </label>
                </div>

                {!simForm.isCorporateOwned && (
                  <>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Select Governing Agreement Version:</label>
                      <select
                        value={simForm.agreementVersionId}
                        onChange={(e) => setSimForm({ ...simForm, agreementVersionId: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      >
                        {agreements.map((a) => (
                          <option key={a.agreementVersionId} value={a.agreementVersionId}>
                            Version {a.version} ({a.royaltyModel}) — Franchise {a.franchiseId} [{a.currency}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Transaction Currency:</label>
                      <select
                        value={simForm.currency}
                        onChange={(e) => setSimForm({ ...simForm, currency: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      >
                        <option value="INR">INR (Paise)</option>
                        <option value="USD">USD (Cents) — [Test Currency Mismatch]</option>
                        <option value="GBP">GBP (Pence)</option>
                        <option value="EUR">EUR (Cents)</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  onClick={handleRunSimulator}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Run Authoritative Royalty Calculation Engine ⚡
                </button>
              </div>
            </div>

            {/* Simulation Results Card */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center justify-between">
                  <span>Calculation Result Output</span>
                  {simResult && (
                    <span className="text-[10px] font-mono text-slate-400">ID: {simResult.calculationId}</span>
                  )}
                </h3>

                {simResult ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 text-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                        Calculated Royalty Amount
                      </span>
                      <span className="text-3xl font-extrabold text-amber-400 font-mono">
                        {formatMoney(simResult.calculatedRoyaltyInMinorUnits, simResult.currency)}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Revenue Base: {formatMoney(simResult.eligibleRevenueInMinorUnits, simResult.currency)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-700/40">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Royalty Model Applied:</span>
                        <span className="font-bold text-white capitalize">{simResult.royaltyModel.replace('_', ' ')}</span>
                      </div>

                      {simResult.breakdown.effectiveRatePercentage !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Effective Royalty Rate:</span>
                          <span className="font-bold text-emerald-400">{simResult.breakdown.effectiveRatePercentage}%</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-slate-400">Governing Agreement:</span>
                        <span className="font-mono text-amber-300">{simResult.agreementVersionId || 'None (Corporate Branch)'}</span>
                      </div>

                      {simResult.breakdown.slabBreakdown && simResult.breakdown.slabBreakdown.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <span className="text-[11px] font-bold text-amber-300 block mb-2">
                            Marginal Progressive Slab Breakdown:
                          </span>
                          <div className="space-y-1.5 font-mono text-[11px]">
                            {simResult.breakdown.slabBreakdown.map((sb, idx) => (
                              <div key={idx} className="bg-slate-800 p-2 rounded flex justify-between items-center">
                                <div>
                                  <span className="text-slate-300 block">Slab @ {sb.ratePercentage}%</span>
                                  <span className="text-[10px] text-slate-400">
                                    Taxable: {formatMoney(sb.taxableAmountInMinor, simResult.currency)}
                                  </span>
                                </div>
                                <span className="font-bold text-emerald-400">
                                  {formatMoney(sb.royaltyInMinor, simResult.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center p-6 border border-dashed border-slate-700 rounded-lg">
                    Configure revenue parameters and click 'Run Authoritative Royalty Calculation Engine' to see deterministic breakdown.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTLEMENT WORKFLOW */}
        {activeTab === 'settlements' && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/90">
              <div>
                <h3 className="text-sm font-bold text-white">Franchise Settlement Statements</h3>
                <p className="text-xs text-slate-400">
                  Lifecycle workflow: DRAFT ➔ CALCULATED ➔ REVIEWED ➔ APPROVED ➔ PAID ➔ RECONCILED.
                </p>
              </div>

              <button
                onClick={handleGenerateSettlement}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-all cursor-pointer"
              >
                + Generate Statement
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-3">Settlement ID</th>
                    <th className="p-3">Period & Agreement</th>
                    <th className="p-3">Eligible Revenue</th>
                    <th className="p-3">Net Royalty Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {settlements.map((s) => {
                    const statusColorMap: Record<string, string> = {
                      DRAFT: 'bg-slate-700 text-slate-300 border-slate-600',
                      CALCULATED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                      REVIEWED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                      APPROVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                      PAID: 'bg-green-500/20 text-green-300 border-green-500/30',
                      RECONCILED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                      DISPUTED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                    };

                    return (
                      <tr key={s.settlementId} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-300">{s.settlementId}</td>

                        <td className="p-3">
                          <span className="font-semibold text-white block">{s.settlementPeriod}</span>
                          <span className="text-[11px] font-mono text-slate-400">Ver: {s.agreementVersion}</span>
                        </td>

                        <td className="p-3 font-mono">
                          {formatMoney(s.eligibleRevenueInMinorUnits, s.currency)}
                        </td>

                        <td className="p-3 font-mono font-bold text-amber-400 text-sm">
                          {formatMoney(s.netSettlementInMinorUnits, s.currency)}
                        </td>

                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusColorMap[s.status] || ''}`}>
                            {s.status}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {s.status === 'DRAFT' && (
                              <button
                                onClick={() => handleUpdateSettlementStatus(s.settlementId, 'APPROVED')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded cursor-pointer"
                              >
                                Approve
                              </button>
                            )}

                            {s.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateSettlementStatus(s.settlementId, 'PAID')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}

                            {s.status !== 'DISPUTED' && s.status !== 'RECONCILED' && (
                              <button
                                onClick={() => {
                                  setDisputeModalSettlementId(s.settlementId);
                                  setDisputeReason('Royalty calculation dispute requested by franchisee.');
                                }}
                                className="px-2 py-1 bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-bold rounded cursor-pointer"
                              >
                                Dispute
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Issue Agreement Version */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Issue Versioned Commercial Agreement</h3>
              <button onClick={() => setShowVersionModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueVersion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Franchise ID:</label>
                  <input
                    type="text"
                    value={newVersionForm.franchiseId}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, franchiseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Version Number:</label>
                  <input
                    type="text"
                    value={newVersionForm.version}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, version: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Royalty Model:</label>
                <select
                  value={newVersionForm.royaltyModel}
                  onChange={(e) => setNewVersionForm({ ...newVersionForm, royaltyModel: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                >
                  <option value="tiered">Tiered (Progressive Marginal Slabs)</option>
                  <option value="fixed_percentage">Fixed Percentage</option>
                  <option value="flat_fee">Flat Fee per Period</option>
                </select>
              </div>

              {newVersionForm.royaltyModel === 'fixed_percentage' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Royalty Percentage (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVersionForm.royaltyPercentage}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, royaltyPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Currency:</label>
                  <select
                    value={newVersionForm.currency}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, currency: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Effective Date:</label>
                  <input
                    type="date"
                    value={newVersionForm.effectiveDate}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, effectiveDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
                >
                  Issue Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Revenue Event */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Record Normalized Revenue Event</h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Idempotency Key (Prevents Duplicates):</label>
                <input
                  type="text"
                  value={newEventForm.idempotencyKey}
                  onChange={(e) => setNewEventForm({ ...newEventForm, idempotencyKey: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-amber-300 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Order ID:</label>
                  <input
                    type="text"
                    value={newEventForm.orderId}
                    onChange={(e) => setNewEventForm({ ...newEventForm, orderId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Event Type:</label>
                  <select
                    value={newEventForm.eventType}
                    onChange={(e) => setNewEventForm({ ...newEventForm, eventType: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  >
                    <option value="SERVICE_SALE">SERVICE_SALE</option>
                    <option value="PRODUCT_SALE">PRODUCT_SALE</option>
                    <option value="REFUND">REFUND</option>
                    <option value="RETURN">RETURN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Division:</label>
                  <select
                    value={newEventForm.divisionId}
                    onChange={(e) => setNewEventForm({ ...newEventForm, divisionId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  >
                    <option value="laundry">FabriQ AI (Laundry)</option>
                    <option value="boutique">FabriQ Boutique</option>
                    <option value="luxury_store">FabriQ Luxury Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Gross Revenue Amount (₹):</label>
                  <input
                    type="number"
                    value={newEventForm.grossAmountInRupees}
                    onChange={(e) => setNewEventForm({ ...newEventForm, grossAmountInRupees: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded"
                >
                  Record Event & Test Idempotency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Raise Dispute */}
      {disputeModalSettlementId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-rose-400">Raise Settlement Dispute</h3>
            <p className="text-xs text-slate-400">
              Provide a reason for placing settlement '{disputeModalSettlementId}' into DISPUTED status.
            </p>

            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
              placeholder="State reason for dispute..."
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDisputeModalSettlementId(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateSettlementStatus(disputeModalSettlementId, 'DISPUTED')}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded text-xs"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
