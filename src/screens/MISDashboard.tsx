import React, { useState } from 'react';
import { useAuth, ROLE_PROFILES } from '../context/AuthContext';
import { ScreenId } from '../types';
import { ExportDataButton } from '../components/ExportDataButton';
import { HyderabadDemandHeatmap } from '../components/HyderabadDemandHeatmap';

interface MISDashboardProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MISDashboard: React.FC<MISDashboardProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cross_feed' | 'database' | 'export'>('overview');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const systemLogs = [
    {
      id: 'LOG-9081',
      time: '10:28:14 AM',
      module: 'Firestore Realtime DB',
      event: 'Order #FBQ-8829 status updated to In Washing',
      source: 'Store Manager Portal (Mayfair)',
      status: 'Synced',
    },
    {
      id: 'LOG-9082',
      time: '10:26:02 AM',
      module: 'Razorpay / Stripe Gateway',
      event: 'Payment of ₹1,850 confirmed for User CH Rakesh',
      source: 'Customer Portal',
      status: 'Success',
    },
    {
      id: 'LOG-9083',
      time: '10:21:40 AM',
      module: 'AI Stain Vision Model',
      event: 'Stain analysis completed: Red Wine on Italian Silk (Confidence: 99.6%)',
      source: 'Garment Tagging Station #02',
      status: 'Processed',
    },
    {
      id: 'LOG-9084',
      time: '10:15:10 AM',
      module: 'MIS Revenue Reconciliation',
      event: 'Daily Store Revenue Synced: 18 Franchise Locations',
      source: 'Owner & CEO Data Pipeline',
      status: 'Reconciled',
    },
  ];

  const handleExportData = (type: string) => {
    setDownloadSuccess(`Exporting ${type} Data Package... Saved as FabriQ_MIS_Report_2026.csv`);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-16 pb-28 bg-[#FAFAFC] text-slate-900 font-sans">
      {/* Top Banner: MIS Header */}
      <section className="px-5 pt-4 pb-2">
        <div className="bg-slate-900 border border-[#9E7B4F]/40 rounded-3xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                alt={profile?.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#9E7B4F]"
              />
              <div>
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">
                  MANAGEMENT INFORMATION SYSTEM (MIS) PORTAL
                </span>
                <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
                  {profile?.name || 'Priya Nair'}
                </h1>
                <p className="text-xs text-slate-300">
                  {profile?.storeLocation || 'Central Unified Data & Telemetry Engine'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ExportDataButton variant="compact" label="Export All Details" />
              <button
                onClick={() => onNavigate('role-login')}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                <span>Switch Role</span>
              </button>
            </div>
          </div>

          {/* Quick Telemetry Bar */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
            <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">DB Latency</span>
              <span className="font-bold text-emerald-400 text-sm">18 ms</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Data Health</span>
              <span className="font-bold text-sky-400 text-sm">100% Operational</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Syncs</span>
              <span className="font-bold text-amber-300 text-sm">5 Portals Live</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Reconciliation</span>
              <span className="font-bold text-white text-sm">100% Balanced</span>
            </div>
          </div>
        </div>
      </section>

      {/* MIS Tab Navigation */}
      <section className="px-5 my-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: '📊 All Dashboards Aggregated' },
            { id: 'cross_feed', label: '🔄 Live Cross-Role Telemetry' },
            { id: 'database', label: '🗄️ Database & System Logs' },
            { id: 'export', label: '📥 CSV / PDF Data Exporter' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs border border-[#9E7B4F]'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* UNIFIED MULTI-DASHBOARD CONSOLE */}
      <section className="px-5 my-2 space-y-4">
        {downloadSuccess && (
          <div className="bg-emerald-900 text-emerald-100 p-3.5 rounded-2xl text-xs font-bold border border-emerald-500 shadow-md flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-300 text-[18px]">check_circle</span>
              <span>{downloadSuccess}</span>
            </div>
          </div>
        )}

        {/* D3.js Geographic Heat Map Visualization for Hyderabad Service Areas */}
        <HyderabadDemandHeatmap />

        {/* Aggregate Cards Reflecting All 4 Other Roles */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                CENTRAL MIS DASHBOARD MATRIX
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Cross-System Data Consolidation
              </h2>
            </div>
            <button
              onClick={() => handleExportData('Full Unified System')}
              className="bg-[#9E7B4F] hover:bg-[#83633B] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              <span>Export MIS Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Customer Perspective */}
            <div
              onClick={() => onNavigate('home')}
              className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-extrabold text-[#83633B] uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded">
                  1. CUSTOMER DASHBOARD
                </span>
                <span className="text-xs font-bold text-slate-500 group-hover:text-[#9E7B4F]">
                  View ➔
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{ROLE_PROFILES.customer.name}</h3>
              <p className="text-xs text-slate-600 mt-1">
                Order #FBQ-8829 • Active Booking • 48 Garments Vaulted • Prestige Member
              </p>
            </div>

            {/* 2. Store Manager Perspective */}
            <div
              onClick={() => onNavigate('dashboard-store-manager')}
              className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-extrabold text-sky-800 uppercase tracking-wider bg-sky-200/80 px-2 py-0.5 rounded">
                  2. STORE MANAGER DASHBOARD
                </span>
                <span className="text-xs font-bold text-slate-500 group-hover:text-sky-700">
                  View ➔
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{ROLE_PROFILES.store_manager.name}</h3>
              <p className="text-xs text-slate-600 mt-1">
                Mayfair Flagship • 142 Pcs Intake Today • 8 active Drums • 98.4% QC Pass
              </p>
            </div>

            {/* 3. Owner Perspective */}
            <div
              onClick={() => onNavigate('dashboard-owner')}
              className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-200/80 px-2 py-0.5 rounded">
                  3. STORE OWNER DASHBOARD
                </span>
                <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-700">
                  View ➔
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{ROLE_PROFILES.owner.name}</h3>
              <p className="text-xs text-slate-600 mt-1">
                5 Franchise Stores • ₹67.5L Gross Revenue • 32.8% Net Margin
              </p>
            </div>

            {/* 4. CEO Perspective */}
            <div
              onClick={() => onNavigate('dashboard-ceo')}
              className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-extrabold text-purple-800 uppercase tracking-wider bg-purple-200/80 px-2 py-0.5 rounded">
                  4. CEO COMMAND CENTER
                </span>
                <span className="text-xs font-bold text-slate-500 group-hover:text-purple-700">
                  View ➔
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{ROLE_PROFILES.ceo.name}</h3>
              <p className="text-xs text-slate-600 mt-1">
                $14.2M Enterprise ARR • $48M Valuation • 99.4% AI Precision • Global Expansion
              </p>
            </div>
          </div>
        </div>

        {/* Realtime Audit Stream */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
            REALTIME MIS DATABASE AUDIT STREAM
          </span>
          <div className="space-y-2">
            {systemLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.id}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{log.time}</span>
                    <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {log.module}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium mt-0.5">{log.event}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full shrink-0">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
