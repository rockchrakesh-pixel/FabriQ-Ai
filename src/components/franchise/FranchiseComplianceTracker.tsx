import React, { useState } from 'react';

export type ComplianceAuditStatus = 'Compliant' | 'Action Required' | 'Past Due';

export interface AuditChecklistItem {
  id: string;
  auditName: string;
  category: 'Safety & Environment' | 'Equipment Safety' | 'Staff Certification' | 'Quality SLA' | 'Packaging & Retail';
  frequency: 'Quarterly' | 'Bi-Annual' | 'Annual' | 'Continuous SLA';
  dueDate: string;
  lastAuditedDate: string;
  auditor: string;
  status: ComplianceAuditStatus;
  notes: string;
}

const INITIAL_AUDITS: AuditChecklistItem[] = [
  {
    id: 'AUD-901',
    auditName: 'ISO 9001 Hydrocarbon Emission & Zero-Odor Solvent Tank Test',
    category: 'Safety & Environment',
    frequency: 'Quarterly',
    dueDate: 'Aug 10, 2026',
    lastAuditedDate: 'May 10, 2026',
    auditor: 'Pollution Control Board Inspector',
    status: 'Past Due',
    notes: 'Quarterly distillation pressure log overdue by 4 days. Schedule auditor visit.',
  },
  {
    id: 'AUD-902',
    auditName: 'Italian Vacuum Steam Table & High-Pressure Boiler Clearance',
    category: 'Equipment Safety',
    frequency: 'Bi-Annual',
    dueDate: 'Jan 28, 2027',
    lastAuditedDate: 'Jul 28, 2026',
    auditor: 'Firbimatic Certified Engineer',
    status: 'Compliant',
    notes: 'Passed all pressure and automatic cutoff safety thresholds with 100% score.',
  },
  {
    id: 'AUD-903',
    auditName: 'Master Spotter Silk & Couture Stain Care Staff Certification',
    category: 'Staff Certification',
    frequency: 'Annual',
    dueDate: 'Aug 25, 2026',
    lastAuditedDate: 'Aug 25, 2025',
    auditor: 'FabriQ AI Master Care Academy',
    status: 'Action Required',
    notes: 'Certification expires in 11 days. Complete online refresher module for 2 staff.',
  },
  {
    id: 'AUD-904',
    auditName: 'Municipal Trade License & Fire NOC Safety Verification',
    category: 'Safety & Environment',
    frequency: 'Annual',
    dueDate: 'Dec 15, 2026',
    lastAuditedDate: 'Dec 15, 2025',
    auditor: 'Municipal Fire Safety Department',
    status: 'Compliant',
    notes: 'Fire extinguishers inspected and certified. NOC valid through Dec 2026.',
  },
  {
    id: 'AUD-905',
    auditName: 'Customer Garment Re-Clean Defect Rate SLA Audit (≤ 2.5%)',
    category: 'Quality SLA',
    frequency: 'Continuous SLA',
    dueDate: 'Aug 31, 2026',
    lastAuditedDate: 'Aug 14, 2026',
    auditor: 'FabriQ Automated AI Counter ERP',
    status: 'Compliant',
    notes: 'Current re-clean defect rate is 0.8%, well within the 2.5% max threshold.',
  },
  {
    id: 'AUD-906',
    auditName: 'Eco Gold Monogram Velvet Hanger & Garment Cover Reserve Audit',
    category: 'Packaging & Retail',
    frequency: 'Quarterly',
    dueDate: 'Aug 20, 2026',
    lastAuditedDate: 'May 20, 2026',
    auditor: 'Boutique Operations Lead',
    status: 'Action Required',
    notes: 'Reserve buffer low for bridal saree garment covers. Place stock order.',
  },
];

export const FranchiseComplianceTracker: React.FC = () => {
  const [audits, setAudits] = useState<AuditChecklistItem[]>(INITIAL_AUDITS);
  const [filter, setFilter] = useState<'All' | ComplianceAuditStatus>('All');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleResolveAudit = (id: string, newStatus: ComplianceAuditStatus, message: string) => {
    setAudits((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredAudits = audits.filter((a) => (filter === 'All' ? true : a.status === filter));

  const compliantCount = audits.filter((a) => a.status === 'Compliant').length;
  const actionRequiredCount = audits.filter((a) => a.status === 'Action Required').length;
  const pastDueCount = audits.filter((a) => a.status === 'Past Due').length;
  const complianceScorePercent = Math.round((compliantCount / audits.length) * 100);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="bg-slate-900 text-amber-300 p-3 rounded-2xl border border-amber-400/50 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Compliance Scorecard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            MANDATORY OPERATIONAL COMPLIANCE TRACKER
          </span>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
            Visual Atelier Audit & Safety Checklist
          </h3>
        </div>

        {/* Status Pill Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'All' ? 'bg-slate-900 text-amber-300 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({audits.length})
          </button>
          <button
            onClick={() => setFilter('Compliant')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'Compliant' ? 'bg-slate-900 text-amber-300 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Compliant ({compliantCount})
          </button>
          <button
            onClick={() => setFilter('Action Required')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'Action Required' ? 'bg-slate-900 text-amber-300 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Action Req ({actionRequiredCount})
          </button>
          <button
            onClick={() => setFilter('Past Due')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'Past Due' ? 'bg-slate-900 text-amber-300 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Due ({pastDueCount})
          </button>
        </div>
      </div>

      {/* Compliance Health Overview Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              ATELIER COMPLIANCE SCORE: {complianceScorePercent}%
            </span>
            {pastDueCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                {pastDueCount} Past Due Audit
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            {compliantCount} of {audits.length} mandatory operational safety & quality audits passed in current quarter.
          </p>
          {/* Progress Bar */}
          <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden flex mt-2">
            <div className="bg-emerald-400 h-full" style={{ width: `${(compliantCount / audits.length) * 100}%` }} />
            <div className="bg-amber-400 h-full" style={{ width: `${(actionRequiredCount / audits.length) * 100}%` }} />
            <div className="bg-rose-500 h-full" style={{ width: `${(pastDueCount / audits.length) * 100}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Compliant</span>
            <span className="font-bold text-emerald-400 text-lg">{compliantCount}</span>
          </div>
          <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Action Needed</span>
            <span className="font-bold text-amber-300 text-lg">{actionRequiredCount}</span>
          </div>
          <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-rose-500/50">
            <span className="text-[9px] text-rose-300 block font-bold uppercase">Past Due</span>
            <span className="font-bold text-rose-400 text-lg">{pastDueCount}</span>
          </div>
        </div>
      </div>

      {/* Audit Checklist Items */}
      <div className="space-y-3">
        {filteredAudits.map((item) => {
          const isCompliant = item.status === 'Compliant';
          const isActionReq = item.status === 'Action Required';
          const isPastDue = item.status === 'Past Due';

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 border transition-all ${
                isPastDue
                  ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                  : isActionReq
                  ? 'bg-amber-50/80 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                      isCompliant
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isActionReq
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCompliant ? 'task_alt' : isActionReq ? 'warning' : 'dangerous'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-slate-400">{item.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase">{item.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-500 font-medium">Frequency: {item.frequency}</span>
                    </div>

                    <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900 text-sm mt-0.5">
                      {item.auditName}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.notes}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>Auditor: <strong className="text-slate-800">{item.auditor}</strong></span>
                      <span>Last Audited: <strong className="text-slate-800">{item.lastAuditedDate}</strong></span>
                      <span>Due Date: <strong className={isPastDue ? 'text-rose-700 font-bold' : 'text-slate-800'}>{item.dueDate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Status Badge & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isCompliant
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isActionReq
                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                        : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    }`}
                  >
                    {item.status}
                  </span>

                  {!isCompliant && (
                    <button
                      onClick={() =>
                        handleResolveAudit(
                          item.id,
                          'Compliant',
                          `Audit ${item.id} verified and updated to COMPLIANT.`
                        )
                      }
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">fact_check</span>
                      <span>{isPastDue ? 'Schedule Urgent Auditor' : 'Complete & Sign Off'}</span>
                    </button>
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
