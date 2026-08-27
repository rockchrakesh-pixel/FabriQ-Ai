import React, { useState } from 'react';

export interface AuditTrigger {
  id: string;
  type: 'audit_pending' | 'compliance_threshold' | 'inventory_low' | 'sla_breach' | 'solvent_safety';
  title: string;
  storeName: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  description: string;
  thresholdValue?: string;
  currentValue?: string;
  actionRequired: string;
  status: 'pending' | 'acknowledged' | 'resolved';
}

const INITIAL_TRIGGERS: AuditTrigger[] = [
  {
    id: 'TRIG-801',
    type: 'audit_pending',
    title: 'Quarterly ISO 9001 Hydrocarbon Safety Audit Overdue',
    storeName: 'Mayfair Flagship Store #101',
    severity: 'critical',
    timestamp: '2 hours ago',
    description: 'Quarterly solvent distillation tank pressure test and zero-emission audit required before Aug 20, 2026.',
    thresholdValue: 'Passed Audit Required',
    currentValue: 'Audit Pending (Due in 5 Days)',
    actionRequired: 'Schedule On-Site Auditor Visit',
    status: 'pending',
  },
  {
    id: 'TRIG-802',
    type: 'compliance_threshold',
    title: 'Quality Score Dropped Below 92% SLA Threshold',
    storeName: 'South Kensington Atelier #102',
    severity: 'warning',
    timestamp: '5 hours ago',
    description: 'Garment re-cleaning requests reached 3.8% over the last 7 days (Threshold SLA: ≤ 2.5%).',
    thresholdValue: 'Max 2.5% Re-clean Rate',
    currentValue: '3.8% Re-clean Rate',
    actionRequired: 'Review Spotting Tech Training Logs',
    status: 'pending',
  },
  {
    id: 'TRIG-803',
    type: 'inventory_low',
    title: 'Eco Hydrocarbon Solvent Buffer Below Safety Minimum',
    storeName: 'Marylebone Care Hub #103',
    severity: 'warning',
    timestamp: '1 day ago',
    description: 'GreenEarth® Hydrocarbon solvent reserve is at 18 Liters (Minimum Threshold: 50 Liters).',
    thresholdValue: 'Min 50L Reserve',
    currentValue: '18L Reserve Remaining',
    actionRequired: 'Trigger Auto-Replenishment Order',
    status: 'pending',
  },
  {
    id: 'TRIG-804',
    type: 'sla_breach',
    title: 'Express 24H Turnaround Delay Risk',
    storeName: 'South Delhi Prestige Store #201',
    severity: 'info',
    timestamp: 'Yesterday',
    description: '4 VIP Express Couture orders approaching 20-hour processing time without final QC signoff.',
    thresholdValue: '100% On-time Express',
    currentValue: '4 Orders Pending QC',
    actionRequired: 'Reassign QC Senior Inspector',
    status: 'acknowledged',
  },
];

export const FranchiseNotificationTriggers: React.FC = () => {
  const [triggers, setTriggers] = useState<AuditTrigger[]>(INITIAL_TRIGGERS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const handleAcknowledge = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'acknowledged' } : t))
    );
    triggerBanner('Trigger acknowledged. Notification sent to HQ Operational Supervisor.');
  };

  const handleResolve = (id: string, actionName: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t))
    );
    triggerBanner(`Resolved: "${actionName}". Audit log updated in Central Firestore.`);
  };

  const triggerBanner = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const filteredTriggers = triggers.filter((t) => {
    if (filter === 'pending') return t.status === 'pending' || t.status === 'acknowledged';
    if (filter === 'resolved') return t.status === 'resolved';
    return true;
  });

  const criticalCount = triggers.filter((t) => t.severity === 'critical' && t.status !== 'resolved').length;
  const pendingCount = triggers.filter((t) => t.status === 'pending').length;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans">
      {/* Action Toast Banner */}
      {actionSuccessMessage && (
        <div className="bg-slate-900 text-amber-300 p-3 rounded-2xl border border-amber-400/50 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              OPERATIONAL AUDIT & COMPLIANCE TRIGGERS
            </span>
            {criticalCount > 0 && (
              <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                {criticalCount} Critical Action Required
              </span>
            )}
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
            Franchise Automated Compliance Alerts
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({triggers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Action Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'resolved'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved ({triggers.length - pendingCount})
          </button>
        </div>
      </div>

      {/* Trigger List */}
      <div className="space-y-3">
        {filteredTriggers.map((t) => {
          const isCritical = t.severity === 'critical';
          const isWarning = t.severity === 'warning';
          const isResolved = t.status === 'resolved';

          return (
            <div
              key={t.id}
              className={`rounded-2xl p-4 border transition-all ${
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : isCritical
                  ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold border ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isCritical
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : isWarning
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-slate-800 text-amber-300 border-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isResolved
                        ? 'task_alt'
                        : isCritical
                        ? 'warning'
                        : isWarning
                        ? 'report_problem'
                        : 'notifications_active'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{t.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-900">{t.storeName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-500 font-medium">{t.timestamp}</span>
                    </div>

                    <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900 text-sm mt-0.5">
                      {t.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.description}</p>

                    {/* Threshold vs Current Comparison Box */}
                    {t.thresholdValue && (
                      <div className="mt-2 flex items-center gap-3 text-[11px] bg-white/80 p-2 rounded-xl border border-slate-200 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-sans font-bold uppercase">Compliance SLA</span>
                          <span className="text-slate-800 font-bold">{t.thresholdValue}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div>
                          <span className="text-slate-400 block text-[9px] font-sans font-bold uppercase">Current Reading</span>
                          <span className={`font-bold ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                            {t.currentValue}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : t.status === 'acknowledged'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {t.status.toUpperCase()}
                  </span>

                  {!isResolved && (
                    <div className="flex items-center gap-1.5">
                      {t.status === 'pending' && (
                        <button
                          onClick={() => handleAcknowledge(t.id)}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(t.id, t.actionRequired)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        <span>{t.actionRequired}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
