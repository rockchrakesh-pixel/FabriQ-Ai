import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { ScreenId, getDefaultPortalForRole } from '../types';
import { EnterprisePortalHeader } from '../components/EnterprisePortalHeader';
import { OwnerFranchiseSpendingChart } from '../components/MonthlySpendingChart';
import { FranchiseeHub } from '../components/franchise/FranchiseeHub';
import { BusinessConfigCenter } from '../components/admin/BusinessConfigCenter';

interface OwnerDashboardProps {
  onNavigate: (screen: ScreenId) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onNavigate }) => {
  const { currentRole, profile } = useAuth();
  const { getStats } = useOrders();
  const stats = getStats();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'this_month' | 'quarter' | 'ytd'>('this_month');
  const [showConfigCenter, setShowConfigCenter] = useState(false);

  // Component-level authorization check
  const isAuthorized = ['owner', 'franchise_owner', 'area_manager', 'regional_manager', 'ceo', 'super_admin'].includes(currentRole);
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center font-sans">
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">shield_lock</span>
          </div>
          <div>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
              ROLE RESTRICTION ENFORCED
            </span>
            <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
              Store Owner Portal Restricted
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Your role (<strong className="text-slate-900">{currentRole}</strong>) is restricted from viewing franchise owner financial P&L metrics.
            </p>
          </div>
          <button
            onClick={() => onNavigate(getDefaultPortalForRole(currentRole))}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Return to Assigned Portal</span>
          </button>
        </div>
      </div>
    );
  }

  const stores = [
    {
      id: 'store-1',
      name: 'Mayfair Flagship Store',
      location: 'Mayfair, London',
      revenue: '₹18,45,000',
      orders: '1,240',
      margin: '34.2%',
      status: 'Top Performer',
    },
    {
      id: 'store-2',
      name: 'South Kensington Atelier',
      location: 'South Kensington, London',
      revenue: '₹14,20,000',
      orders: '980',
      margin: '31.8%',
      status: 'Steady',
    },
    {
      id: 'store-3',
      name: 'Marylebone Care Hub',
      location: 'Marylebone, London',
      revenue: '₹12,80,000',
      orders: '850',
      margin: '29.5%',
      status: 'High Volume',
    },
    {
      id: 'store-4',
      name: 'South Delhi Prestige Store',
      location: 'Greater Kailash, Delhi NCR',
      revenue: '₹22,10,000',
      orders: '1,890',
      margin: '36.0%',
      status: 'Fastest Growth',
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pt-16 pb-28 bg-[#FAFAFC] text-slate-900 font-sans">
      <section className="px-5 pt-4 pb-2">
        <EnterprisePortalHeader
          portalTitle="Store Owner P&L & Franchise Portal"
          portalBadge="FRANCHISE OWNER • FINANCIAL SUITE"
          portalIcon="account_balance"
          activeScreen="dashboard-owner"
          onNavigate={onNavigate}
          extraActions={
            <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {[
                { id: 'this_month', label: 'This Month' },
                { id: 'quarter', label: 'Q3 2026' },
                { id: 'ytd', label: 'YTD 2026' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTimeframe(tf.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedTimeframe === tf.id
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          }
        />
      </section>

      {/* Financial KPIs Overview Grid */}
      <section className="px-5 my-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Live Firestore Revenue</span>
          <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 block mt-1">
            ₹{stats.totalRevenue.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
            <span className="material-symbols-outlined text-[12px]">trending_up</span> Real-time Sync
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Active Orders</span>
          <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-emerald-700 block mt-1">
            {stats.activeOrdersCount} Active
          </span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{stats.pendingCount} Pending Acceptance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Orders</span>
          <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 block mt-1">
            {stats.totalOrders} Orders
          </span>
          <span className="text-[10px] text-amber-600 font-bold block mt-0.5">{stats.expressOrdersCount} Express VIP</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Online vs Counter</span>
          <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-sky-700 block mt-1">
            {stats.onlineOrdersCount} : {stats.offlineOrdersCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">App : Walk-In POS</span>
        </div>
      </section>

      {/* Franchisee Hub Suite (Performance, Onboarding, Inventory Sync, Audits & Financials) */}
      <section className="px-5 my-3">
        <FranchiseeHub onNavigate={onNavigate} />
      </section>

      {/* Recharts Monthly Spending Trends & Franchise Revenue Visualization */}
      <section className="px-5 my-3">
        <OwnerFranchiseSpendingChart />
      </section>

      {/* Multi-Store Comparison Table */}
      <section className="px-5 my-3">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                FRANCHISE STORE YIELD & MARGINS
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Individual Store Performance
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {stores.map((s) => (
              <div
                key={s.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900">
                      {s.name}
                    </h3>
                    <span className="bg-amber-100 text-[#83633B] text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{s.location}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Monthly Revenue</span>
                    <span className="font-bold text-slate-900 text-sm">{s.revenue}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Net Margin</span>
                    <span className="font-bold text-emerald-700 text-sm">{s.margin}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Expense Breakdown */}
      <section className="px-5 my-3">
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-[#9E7B4F]/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">
              MONTHLY OPERATING EXPENSE ALLOCATION
            </span>
            <button
              onClick={() => setShowConfigCenter(!showConfigCenter)}
              className="px-3 py-1.5 min-h-[36px] bg-amber-400 text-slate-900 rounded-xl text-xs font-bold hover:bg-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              <span>{showConfigCenter ? 'Hide Business Config' : 'Manage Business Config'}</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">Staff Salaries</span>
              <span className="font-bold text-white text-sm">₹18,20,000</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">Eco Solvents</span>
              <span className="font-bold text-white text-sm">₹8,40,000</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">Electricity & Steam</span>
              <span className="font-bold text-white text-sm">₹6,10,000</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">Store Leases</span>
              <span className="font-bold text-white text-sm">₹12,50,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Business Configuration Center (Owner / Admin) */}
      {showConfigCenter && (
        <section className="px-5 my-3">
          <BusinessConfigCenter />
        </section>
      )}
    </div>
  );
};
