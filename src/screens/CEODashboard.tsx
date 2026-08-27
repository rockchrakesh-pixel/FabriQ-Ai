import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { ScreenId, getDefaultPortalForRole } from '../types';
import { ExportDataButton } from '../components/ExportDataButton';
import { EnterprisePortalHeader } from '../components/EnterprisePortalHeader';
import { BusinessConfigCenter } from '../components/admin/BusinessConfigCenter';

interface CEODashboardProps {
  onNavigate: (screen: ScreenId) => void;
}

export const CEODashboard: React.FC<CEODashboardProps> = ({ onNavigate }) => {
  const { currentRole, profile } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();
  const [activeTab, setActiveTab] = useState<'metrics' | 'config' | 'pincodes' | 'coupons' | 'banners' | 'reviews' | 'users' | 'reports'>('metrics');

  // Component-level authorization check
  const isAuthorized = currentRole === 'ceo' || currentRole === 'super_admin';
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
              CEO Command Center Restricted
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Your role (<strong className="text-slate-900">{currentRole}</strong>) is not authorized to access global CEO executive controls.
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

  // Pincode Management State
  const [pincodes, setPincodes] = useState([
    { pincode: '500033', area: 'Jubilee Hills, Hyderabad', branch: 'Jubilee Hills Flagship Atelier (HYD-JUB-101)' },
    { pincode: '500034', area: 'Banjara Hills, Hyderabad', branch: 'Banjara Hills Luxury Care (HYD-BAN-102)' },
    { pincode: '500032', area: 'Gachibowli, Hyderabad', branch: 'Gachibowli Financial Hub (HYD-GAC-103)' },
    { pincode: '560038', area: 'Indiranagar, Bangalore', branch: 'Indiranagar 100ft Care Atelier (BLR-IND-201)' },
    { pincode: 'W1K 2RF', area: 'Mayfair, London', branch: 'Mayfair Flagship Store (LON-MAY-301)' },
  ]);
  const [newPin, setNewPin] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newBranch, setNewBranch] = useState('Jubilee Hills Flagship Atelier (HYD-JUB-101)');

  // Coupon Management State
  const [coupons, setCoupons] = useState([
    { code: 'FABRIQ50', type: 'percentage', discount: '50%', minAmount: 499, startDate: '2026-08-01', endDate: '2026-08-31', singleUse: true, enabled: true },
    { code: 'SUITCARE100', type: 'fixed', discount: '₹100', minAmount: 999, startDate: '2026-08-01', endDate: '2026-09-15', singleUse: true, enabled: true },
    { code: 'VIPWELCOME', type: 'percentage', discount: '20%', minAmount: 299, startDate: '2026-01-01', endDate: '2026-12-31', singleUse: true, enabled: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('15');
  const [newCouponMin, setNewCouponMin] = useState('399');

  // Banner Images State (Pixel Specs 1200x400)
  const [banners, setBanners] = useState([
    { id: 1, pos: 1, category: 'Dry Cleaning', dims: '1200x400 px', image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1200&auto=format&fit=crop', title: 'Italian Hydrocarbon Solvent Care' },
    { id: 2, pos: 2, category: 'Wash & Fold', dims: '1200x400 px', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=1200&auto=format&fit=crop', title: 'Eco Organic Cotton Wash' },
    { id: 3, pos: 3, category: 'Steam Ironing', dims: '1200x400 px', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop', title: 'Vacuum Suction Board Pressing' },
  ]);

  // Rate & Review Audit Log (Non-alterable per SRS mandate)
  const reviews = [
    { id: 'REV-901', customer: 'Priya Sharma', rating: 5, review: 'Absolute gold standard dry cleaning! My silk Kanjeevaram saree came back spotless with pristine fragrance.', date: '04 Aug 2026', branch: 'Jubilee Hills' },
    { id: 'REV-902', customer: 'Vikramaditya S.', rating: 5, review: 'Extremely quick 4-hour express valet delivery. Suit pressing was lapel-perfect.', date: '03 Aug 2026', branch: 'Banjara Hills' },
    { id: 'REV-903', customer: 'Arjun Mehta', rating: 4, review: 'Very courteous staff and seamless RFID live garment tracking app.', date: '02 Aug 2026', branch: 'Gachibowli' },
  ];

  // User Management
  const [users, setUsers] = useState([
    { id: 'USR-101', name: 'CH Rakesh', email: 'rakesh.ch@gmail.com', role: 'VIP Customer', status: 'Active', orders: 14 },
    { id: 'USR-102', name: 'Karan Mehra', email: 'karan.m@gmail.com', role: 'Customer', status: 'Active', orders: 6 },
    { id: 'USR-103', name: 'Rajesh Kumar', email: 'rajesh.k@fabriqai.com', role: 'Branch Store Manager', status: 'Active', orders: 142 },
    { id: 'USR-104', name: 'Siddharth V.', email: 'siddharth.v@gmail.com', role: 'Customer', status: 'Deactivated', orders: 1 },
  ]);

  const handleAddPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin && newArea) {
      setPincodes([...pincodes, { pincode: newPin, area: newArea, branch: newBranch }]);
      setNewPin('');
      setNewArea('');
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCouponCode) {
      setCoupons([
        ...coupons,
        {
          code: newCouponCode.toUpperCase(),
          type: 'percentage',
          discount: `${newCouponDiscount}%`,
          minAmount: parseInt(newCouponMin || '0'),
          startDate: '2026-08-01',
          endDate: '2026-12-31',
          singleUse: true,
          enabled: true,
        },
      ]);
      setNewCouponCode('');
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Deactivated' : 'Active' } : u))
    );
  };

  const toggleCouponState = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, enabled: !c.enabled } : c))
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-16 pb-28 bg-[#FAFAFC] text-slate-900 font-sans">
      <section className="px-5 pt-4 pb-2">
        <EnterprisePortalHeader
          portalTitle="CEO Executive Command Center"
          portalBadge="GLOBAL HQ • EXECUTIVE COMMAND"
          portalIcon="crown"
          activeScreen="dashboard-ceo"
          onNavigate={onNavigate}
        />

        {/* Executive Summary Core Cards */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">insights</span>
              <span>EXECUTIVE KPI SUMMARY</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Updated Real-Time • Multi-Tenant</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Revenue</span>
                <span className="material-symbols-outlined text-amber-600 text-[16px]">payments</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-['Libre_Caslon_Text',serif]">
                ₹52.4L
              </div>
              <div className="text-[9px] text-emerald-600 font-bold mt-0.5">+14.2% MoM</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Total Orders</span>
                <span className="material-symbols-outlined text-indigo-600 text-[16px]">shopping_bag</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-['Libre_Caslon_Text',serif]">
                {stats.totalOrders || 4280}
              </div>
              <div className="text-[9px] text-slate-500 font-bold mt-0.5">{stats.activeOrdersCount || 382} Active</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Active Customers</span>
                <span className="material-symbols-outlined text-sky-600 text-[16px]">group</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-['Libre_Caslon_Text',serif]">
                1,842
              </div>
              <div className="text-[9px] text-emerald-600 font-bold mt-0.5">78.4% Repeat</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">SLA Health</span>
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
              </div>
              <div className="text-base font-extrabold text-emerald-700 font-['Libre_Caslon_Text',serif]">
                99.4%
              </div>
              <div className="text-[9px] text-emerald-600 font-bold mt-0.5">0 Active Breaches</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Open Exceptions</span>
                <span className="material-symbols-outlined text-rose-600 text-[16px]">warning</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-['Libre_Caslon_Text',serif]">
                0
              </div>
              <div className="text-[9px] text-emerald-600 font-bold mt-0.5">All Clear</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Capacity</span>
                <span className="material-symbols-outlined text-purple-600 text-[16px]">factory</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-['Libre_Caslon_Text',serif]">
                71.8%
              </div>
              <div className="text-[9px] text-purple-700 font-bold mt-0.5">Optimal Load</div>
            </div>
          </div>
        </div>

        {/* The 3 Business Divisions Performance */}
        <div className="mb-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">storefront</span>
              <span>THREE ENTERPRISE BUSINESS DIVISIONS</span>
            </span>
            <span className="text-[10px] text-slate-400">Multi-Channel Revenue Share</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Division 1: FabriQ AI Laundry */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide bg-amber-200/60 px-2 py-0.5 rounded-md">
                    DIVISION 1
                  </span>
                  <span className="text-xs font-extrabold text-amber-900">54% Share</span>
                </div>
                <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 mt-1">
                  FabriQ AI — Laundry Care
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Eco-Hydrocarbon solvent dry cleaning, couture pressing & doorstep valet.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">₹28.3L Gross Rev</span>
                <span className="text-emerald-700 font-extrabold text-[11px]">99.8% SLA</span>
              </div>
            </div>

            {/* Division 2: FabriQ Atelier Boutique */}
            <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-purple-900 uppercase tracking-wide bg-purple-200/60 px-2 py-0.5 rounded-md">
                    DIVISION 2
                  </span>
                  <span className="text-xs font-extrabold text-purple-900">28% Share</span>
                </div>
                <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 mt-1">
                  FabriQ Atelier — Boutique & Bespoke
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  3D biometric fittings, master bespoke tailoring & couture custom alterations.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-purple-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">₹14.7L Gross Rev</span>
                <span className="text-emerald-700 font-extrabold text-[11px]">98.9% SLA</span>
              </div>
            </div>

            {/* Division 3: FabriQ Maison Luxury Store */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wide bg-emerald-200/60 px-2 py-0.5 rounded-md">
                    DIVISION 3
                  </span>
                  <span className="text-xs font-extrabold text-emerald-900">18% Share</span>
                </div>
                <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 mt-1">
                  FabriQ Maison — Luxury Cloth Store
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Heritage silk, imported Italian wool fabrics, luxury accessories & garment restoration.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">₹9.4L Gross Rev</span>
                <span className="text-emerald-700 font-extrabold text-[11px]">100% SLA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Enterprise Portals */}
        <div className="mb-3">
          <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-[15px]">apps</span>
            <span>ENTERPRISE QUICK ACCESS MODULES</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onNavigate('operations-center')}
              className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-2xl border border-amber-400/40 shadow-xs flex items-center gap-2.5 text-left cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">Ops Center (2H-6)</div>
                <div className="text-[10px] text-slate-300">SLA, Exceptions & QA</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('enterprise-analytics')}
              className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-2xl border border-amber-400/40 shadow-xs flex items-center gap-2.5 text-left cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[20px]">insights</span>
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">Enterprise Analytics</div>
                <div className="text-[10px] text-slate-300">BI, Cohorts & Economics</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('dashboard-owner')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs flex items-center gap-2.5 text-left cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Franchise & P&L</div>
                <div className="text-[10px] text-slate-500">Royalty & Statements</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('dashboard-mis')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs flex items-center gap-2.5 text-left cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[20px]">analytics</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Central MIS Telemetry</div>
                <div className="text-[10px] text-slate-500">Data Stream & Audit</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Admin Module Navigation Tabs */}
      <section className="px-5 my-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'metrics', label: '📊 Executive Metrics & Growth' },
            { id: 'config', label: '⚙️ Business Config Center' },
            { id: 'pincodes', label: '📍 Pincode & Branch Mapping' },
            { id: 'coupons', label: '🎟️ Coupon & Discount Rules' },
            { id: 'banners', label: '🖼️ Banner Images & Positions' },
            { id: 'reviews', label: '⭐ Rate & Reviews (Audit Log)' },
            { id: 'users', label: '👥 User Account Controls' },
            { id: 'reports', label: '📈 System Revenue & Sales Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* TAB: BUSINESS CONFIG CENTER */}
      {activeTab === 'config' && (
        <section className="px-5 my-2">
          <BusinessConfigCenter />
        </section>
      )}

      {/* TAB 1: EXECUTIVE PERFORMANCE METRICS */}
      {activeTab === 'metrics' && (
        <section className="px-5 my-2">
          <h3 className="text-xs font-extrabold text-[#9E7B4F] uppercase tracking-widest mb-2.5">
            ENTERPRISE PERFORMANCE METRICS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Today's Revenue</span>
              <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 block mt-1">₹1,84,500</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">+14.2% vs yesterday</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Monthly Revenue</span>
              <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-emerald-700 block mt-1">₹52,40,000</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Aug 2026 Target: 92%</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Yearly Revenue</span>
              <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-sky-700 block mt-1">₹6.18 Cr</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">YTD FY 2026-27</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Orders</span>
              <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 block mt-1">4,280</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">382 Orders Active</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Active Customers</span>
              <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-purple-700 block mt-1">2,850</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">88% VIP Repeat Rate</span>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: PINCODE MANAGEMENT */}
      {activeTab === 'pincodes' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                LOCATION RADIUS & BRANCH MAPPING
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Pincode Management
              </h2>
            </div>

            <form onSubmit={handleAddPincode} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pincode</label>
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 500081"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Neighborhood / City</label>
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g. Madhapur, Hyderabad"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  + Add & Map Pincode
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-2.5 rounded-l-xl">Pincode</th>
                    <th className="p-2.5">Area</th>
                    <th className="p-2.5">Mapped Store Branch</th>
                    <th className="p-2.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pincodes.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-amber-900">{p.pincode}</td>
                      <td className="p-2.5 font-bold text-slate-800">{p.area}</td>
                      <td className="p-2.5 text-slate-600 font-medium">{p.branch}</td>
                      <td className="p-2.5">
                        <button
                          onClick={() => setPincodes(pincodes.filter((_, i) => i !== idx))}
                          className="text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: COUPON MANAGEMENT */}
      {activeTab === 'coupons' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                PROMO & DISCOUNT ENGINE
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Coupon Management
              </h2>
            </div>

            <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Promo Code</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="e.g. FESTIVE25"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold uppercase"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  + Create Coupon Rule
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-2.5 rounded-l-xl">Coupon Code</th>
                    <th className="p-2.5">Discount</th>
                    <th className="p-2.5">Min Booking Amount</th>
                    <th className="p-2.5">Validity Range</th>
                    <th className="p-2.5">Single-Use Rule</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 rounded-r-xl">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-black text-amber-800">{c.code}</td>
                      <td className="p-2.5 font-bold text-slate-900">{c.discount}</td>
                      <td className="p-2.5 text-slate-700 font-mono">₹{c.minAmount}</td>
                      <td className="p-2.5 text-slate-500 text-[11px] font-mono">{c.startDate} to {c.endDate}</td>
                      <td className="p-2.5 font-bold text-slate-600">{c.singleUse ? '1 Time Per User' : 'Multi-use'}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${c.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {c.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => toggleCouponState(c.code)}
                          className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                        >
                          {c.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: BANNER IMAGES MANAGEMENT */}
      {activeTab === 'banners' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                CUSTOMER APP HOME BANNER MANAGER
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Banner Images (1200x400 PX Specified Standard)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video">
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-slate-900/90 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                      Position #{b.pos}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-slate-950/90 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                      {b.dims}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{b.title}</h4>
                    <p className="text-[10px] text-amber-800 font-extrabold mt-0.5">Linked Category: {b.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: RATE & REVIEWS AUDIT LOG */}
      {activeTab === 'reviews' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                  UNALTERABLE CUSTOMER REVIEWS LOG
                </span>
                <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                  Rate & Review Audit View
                </h2>
              </div>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-[10px] font-bold">
                🔒 SRS Mandate: Reviews Cannot Be Altered or Hidden
              </span>
            </div>

            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-slate-900">{r.customer}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{r.branch} Atelier</span>
                    </div>
                    <div className="flex items-center text-amber-400 text-xs">
                      {'★'.repeat(r.rating)}
                      <span className="text-slate-400 text-[10px] ml-1">({r.rating}.0 / 5)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 italic">"{r.review}"</p>
                  <span className="text-[9.5px] font-mono text-slate-400 block">{r.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 6: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                SYSTEM USERS & ACCESS MANAGEMENT
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Registered Users & Status
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-2.5 rounded-l-xl">User ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-800">{u.id}</td>
                      <td className="p-2.5 font-bold text-slate-900">{u.name}</td>
                      <td className="p-2.5 text-slate-600 font-mono">{u.email}</td>
                      <td className="p-2.5 font-medium text-amber-900">{u.role}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 7: SYSTEM REPORTS */}
      {activeTab === 'reports' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                  COMPREHENSIVE ANALYTICS & REVENUE AUDIT
                </span>
                <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                  System Reports (Branch-wise & Customer-wise)
                </h2>
              </div>
              <ExportDataButton label="Export PDF / Excel" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase">Customer Report</h4>
                <p className="text-[11px] text-slate-500">2,850 Total Accounts • 92% Active Retention</p>
                <button onClick={() => alert('Customer Report generated and downloaded!')} className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Download CSV</button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase">Branch Sales Report</h4>
                <p className="text-[11px] text-slate-500">Jubilee Hills: ₹19.5L • Banjara Hills: ₹14.2L</p>
                <button onClick={() => alert('Branch Sales Report generated and downloaded!')} className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Download CSV</button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase">Pickup & Delivery Report</h4>
                <p className="text-[11px] text-slate-500">100% On-time Valet Completion Rate</p>
                <button onClick={() => alert('Logistics Report generated and downloaded!')} className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Download CSV</button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
