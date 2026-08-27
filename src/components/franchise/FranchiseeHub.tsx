import React, { useState } from 'react';
import { FranchiseNotificationTriggers } from './FranchiseNotificationTriggers';
import { FranchiseeOnboardingWalkthrough } from './FranchiseeOnboardingWalkthrough';
import { FranchiseInventorySync } from './FranchiseInventorySync';
import { FranchiseFinancialReports } from './FranchiseFinancialReports';
import { FranchiseRoyaltyWidget } from './FranchiseRoyaltyWidget';
import { FranchiseComplianceTracker } from './FranchiseComplianceTracker';
import { FranchiseROICalculator } from './FranchiseROICalculator';
import { FranchiseSettingsPanel } from './FranchiseSettingsPanel';
import { FranchiseProfileFoundation } from './FranchiseProfileFoundation';
import { EnterpriseInventoryDashboard } from '../inventory/EnterpriseInventoryDashboard';
import { FranchiseCommercialDashboard } from './FranchiseCommercialDashboard';
import { EnterpriseFinanceDashboard } from '../finance/EnterpriseFinanceDashboard';
import { EnterpriseProcurementDashboard } from '../procurement/EnterpriseProcurementDashboard';

export interface FranchiseLead {
  id: string;
  name: string;
  contact: string;
  type: 'Franchise Partner Inquiry' | 'Corporate Hotel Account' | 'VIP Garment Concierge';
  city: string;
  budgetOrVolume: string;
  status: 'New' | 'Contacted' | 'Site Inspection' | 'MoU Signed';
  receivedDate: string;
}

const INITIAL_LEADS: FranchiseLead[] = [
  {
    id: 'LEAD-701',
    name: 'Taj Krishna Hyderabad (Luxury Suite Concierge)',
    contact: '+91 40 6666 2323',
    type: 'Corporate Hotel Account',
    city: 'Banjara Hills, Hyderabad',
    budgetOrVolume: '150 Garments / Day',
    status: 'Site Inspection',
    receivedDate: 'Yesterday',
  },
  {
    id: 'LEAD-702',
    name: 'Dr. Siddharth Singhania',
    contact: '+91 98490 11223',
    type: 'Franchise Partner Inquiry',
    city: 'Jubilee Hills, Hyderabad',
    budgetOrVolume: '₹50 Lakhs Flagship Budget',
    status: 'New',
    receivedDate: 'Today, 10:30 AM',
  },
  {
    id: 'LEAD-703',
    name: 'Anita Dongre Flagship Boutique',
    contact: '+91 99887 65432',
    type: 'VIP Garment Concierge',
    city: 'Gachibowli, Hyderabad',
    budgetOrVolume: 'Wedding Bridal Care',
    status: 'MoU Signed',
    receivedDate: 'Aug 10, 2026',
  },
];

export const FranchiseeHub: React.FC<{ onNavigate?: (screen: any) => void }> = () => {
  const [hubTab, setHubTab] = useState<
    | 'profile_foundation'
    | 'kpis_leads'
    | 'finance'
    | 'procurement'
    | 'commercial'
    | 'royalty'
    | 'audits'
    | 'roi'
    | 'onboarding'
    | 'inventory'
    | 'financials'
    | 'settings'
  >('profile_foundation');
  const [leads, setLeads] = useState<FranchiseLead[]>(INITIAL_LEADS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleUpdateLeadStatus = (leadId: string, nextStatus: FranchiseLead['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );
    setActionNotice(`Lead ${leadId} updated to status "${nextStatus}".`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="w-full space-y-4 font-sans">
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

      {/* Primary Franchisee Hub Navigation Tabs */}
      <div className="bg-slate-900 rounded-3xl p-2 border border-[#9E7B4F]/50 shadow-md flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setHubTab('profile_foundation')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'profile_foundation'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">domain</span>
          <span>Franchise Architecture Profile</span>
        </button>

        <button
          onClick={() => setHubTab('kpis_leads')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'kpis_leads'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
          <span>Hub KPIs & Leads</span>
        </button>

        <button
          onClick={() => setHubTab('finance')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'finance'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
          <span>Enterprise Finance & Ledger</span>
        </button>

        <button
          onClick={() => setHubTab('procurement')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'procurement'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          <span>Procurement & Supply Chain</span>
        </button>

        <button
          onClick={() => setHubTab('commercial')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'commercial'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Commercial & Royalty Engine</span>
        </button>

        <button
          onClick={() => setHubTab('royalty')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'royalty'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Royalty Accruals</span>
        </button>

        <button
          onClick={() => setHubTab('audits')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'audits'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Compliance Tracker</span>
        </button>

        <button
          onClick={() => setHubTab('roi')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'roi'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">calculate</span>
          <span>ROI Projection Tool</span>
        </button>

        <button
          onClick={() => setHubTab('onboarding')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'onboarding'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          <span>Onboarding & Certs</span>
        </button>

        <button
          onClick={() => setHubTab('inventory')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'inventory'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory</span>
          <span>Stock & Order Sync</span>
        </button>

        <button
          onClick={() => setHubTab('financials')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'financials'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
          <span>Financial Reports</span>
        </button>

        <button
          onClick={() => setHubTab('settings')}
          className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            hubTab === 'settings'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
          <span>Push Settings</span>
        </button>
      </div>

      {/* TAB CONTENT 0: FRANCHISE ARCHITECTURE FOUNDATION */}
      {hubTab === 'profile_foundation' && <FranchiseProfileFoundation />}

      {/* TAB CONTENT 0.5: COMMERCIAL & ROYALTY ENGINE */}
      {hubTab === 'commercial' && <FranchiseCommercialDashboard />}

      {/* TAB CONTENT 1: KPIS & LEAD MANAGEMENT */}
      {hubTab === 'kpis_leads' && (
        <div className="space-y-4">
          {/* Top Performance Scorecard */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  FRANCHISE PARTNER PERFORMANCE SCORECARD
                </span>
                <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
                  Franchise Operational Health & Performance Scorecard
                </h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase border border-emerald-300">
                Grade A+ • Top 5% Network Atelier
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-amber-400/40">
                <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider block">Operational Audit Score</span>
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white block mt-0.5">
                  96.8 / 100
                </span>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">ISO 9001 Hydrocarbon Compliant</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">On-Time Delivery SLA</span>
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 block mt-0.5">
                  99.2%
                </span>
                <span className="text-[9px] text-slate-600 font-medium block mt-0.5">Avg Turnaround: 18.4 Hours</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Re-Clean Defect Rate</span>
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-emerald-700 block mt-0.5">
                  0.8%
                </span>
                <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Target SLA ≤ 2.5%</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Customer Satisfaction</span>
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-amber-600 block mt-0.5">
                  4.95 ★
                </span>
                <span className="text-[9px] text-slate-600 font-medium block mt-0.5">1,240 Verified Reviews</span>
              </div>
            </div>
          </div>

          {/* Lead Management Section */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                  INBOUND FRANCHISE & VIP ACCOUNTS
                </span>
                <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                  Lead Management Pipeline
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <span className="material-symbols-outlined text-[20px]">person_search</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{lead.id}</span>
                        <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase">{lead.type}</span>
                      </div>

                      <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900 text-sm mt-0.5">
                        {lead.city} • <span className="text-emerald-700">{lead.budgetOrVolume}</span>
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Contact: <strong className="text-slate-800">{lead.contact}</strong> • Received {lead.receivedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleUpdateLeadStatus(lead.id, e.target.value as FranchiseLead['status'])
                      }
                      className="bg-slate-900 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer shadow-xs"
                    >
                      <option value="New">New Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Site Inspection">Site Inspection</option>
                      <option value="MoU Signed">MoU Signed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT FINANCE & LEDGER */}
      {hubTab === 'finance' && <EnterpriseFinanceDashboard />}

      {/* TAB CONTENT PROCUREMENT & SUPPLY CHAIN */}
      {hubTab === 'procurement' && <EnterpriseProcurementDashboard />}

      {/* TAB CONTENT 2: ROYALTY ACCRUAL SUMMARY WIDGET */}
      {hubTab === 'royalty' && <FranchiseRoyaltyWidget />}

      {/* TAB CONTENT 3: VISUAL COMPLIANCE CHECKLIST & NOTIFICATION TRIGGERS */}
      {hubTab === 'audits' && (
        <div className="space-y-4">
          <FranchiseComplianceTracker />
          <FranchiseNotificationTriggers />
        </div>
      )}

      {/* TAB CONTENT 4: INTERACTIVE ROI PROJECTION SIMULATOR */}
      {hubTab === 'roi' && <FranchiseROICalculator />}

      {/* TAB CONTENT 5: ONBOARDING & CERTIFICATIONS */}
      {hubTab === 'onboarding' && <FranchiseeOnboardingWalkthrough />}

      {/* TAB CONTENT 6: INVENTORY & ORDERS */}
      {hubTab === 'inventory' && (
        <div className="space-y-6">
          <EnterpriseInventoryDashboard />
          <FranchiseInventorySync />
        </div>
      )}

      {/* TAB CONTENT 7: FINANCIAL REPORTS & ROYALTIES */}
      {hubTab === 'financials' && (
        <div className="space-y-4">
          <FranchiseRoyaltyWidget />
          <FranchiseFinancialReports />
        </div>
      )}

      {/* TAB CONTENT 8: PUSH NOTIFICATION SETTINGS PANEL */}
      {hubTab === 'settings' && <FranchiseSettingsPanel />}
    </div>
  );
};
