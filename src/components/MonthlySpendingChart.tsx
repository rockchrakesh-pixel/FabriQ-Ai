import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

// Data for Customer 6-Month Fabric Care Expenditure
const CUSTOMER_SPENDING_DATA = [
  { month: 'Mar', expenditure: 2150, dryCleaning: 1200, suitCouture: 450, washFold: 300, shoeSpa: 200, itemsCount: 6 },
  { month: 'Apr', expenditure: 2800, dryCleaning: 1500, suitCouture: 650, washFold: 400, shoeSpa: 250, itemsCount: 8 },
  { month: 'May', expenditure: 3250, dryCleaning: 1800, suitCouture: 800, washFold: 350, shoeSpa: 300, itemsCount: 10 },
  { month: 'Jun', expenditure: 2900, dryCleaning: 1400, suitCouture: 700, washFold: 500, shoeSpa: 300, itemsCount: 9 },
  { month: 'Jul', expenditure: 3950, dryCleaning: 2100, suitCouture: 1100, washFold: 450, shoeSpa: 300, itemsCount: 12 },
  { month: 'Aug', expenditure: 4600, dryCleaning: 2400, suitCouture: 1300, washFold: 500, shoeSpa: 400, itemsCount: 14 },
];

// Data for Owner 6-Month Franchise Financial Trends (in ₹ Thousands)
const OWNER_FRANCHISE_DATA = [
  { month: 'Mar', grossRevenue: 4820, operatingExpense: 3150, netProfit: 1670, storeCount: 4 },
  { month: 'Apr', grossRevenue: 5280, operatingExpense: 3420, netProfit: 1860, storeCount: 4 },
  { month: 'May', grossRevenue: 5840, operatingExpense: 3710, netProfit: 2130, storeCount: 5 },
  { month: 'Jun', grossRevenue: 6120, operatingExpense: 3880, netProfit: 2240, storeCount: 5 },
  { month: 'Jul', grossRevenue: 6790, operatingExpense: 4200, netProfit: 2590, storeCount: 5 },
  { month: 'Aug', grossRevenue: 7450, operatingExpense: 4580, netProfit: 2870, storeCount: 6 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isOwner?: boolean;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isOwner }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-amber-400/50 p-3 rounded-2xl shadow-xl text-white font-sans text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-extrabold text-amber-300 text-sm border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{label} 2026</span>
          <span className="text-[10px] font-mono text-slate-400">FabriQ AI Analytics</span>
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold font-mono text-amber-200">
              ₹{Number(entry.value).toLocaleString()} {isOwner ? 'K' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// CUSTOMER SPENDING TRENDS COMPONENT
export const CustomerSpendingChart: React.FC<{ onNavigate?: (screen: any) => void }> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'total' | 'category'>('total');
  const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false);

  const total6MonthSpend = CUSTOMER_SPENDING_DATA.reduce((acc, curr) => acc + curr.expenditure, 0);
  const avgMonthlySpend = Math.round(total6MonthSpend / CUSTOMER_SPENDING_DATA.length);
  const totalItemsProcessed = CUSTOMER_SPENDING_DATA.reduce((acc, curr) => acc + curr.itemsCount, 0);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 font-sans relative overflow-hidden">
      {/* Decorative Gold Glow Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              WARDROBE FINANCIAL TELEMETRY
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              6 Months Trend
            </span>
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
            Monthly Care Expenditure
          </h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'total'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Curve
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'category'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Category Split
          </button>
        </div>
      </div>

      {/* Key Metric Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-amber-400/30">
          <span className="text-[9px] font-bold text-amber-300 uppercase block tracking-wider">6-Mo Total Spend</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-white block mt-0.5">
            ₹{total6MonthSpend.toLocaleString()}
          </span>
          <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">+22% MoM Care Value</span>
        </div>

        <div className="bg-amber-50 text-slate-900 p-3 rounded-2xl border border-amber-200/80">
          <span className="text-[9px] font-bold text-[#83633B] uppercase block tracking-wider">Avg Monthly Spend</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 block mt-0.5">
            ₹{avgMonthlySpend.toLocaleString()}
          </span>
          <span className="text-[9px] text-amber-800 font-medium block mt-0.5">~₹{Math.round(avgMonthlySpend/7)} / Garment</span>
        </div>

        <div className="bg-slate-50 text-slate-900 p-3 rounded-2xl border border-slate-200">
          <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Garments Maintained</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 block mt-0.5">
            {totalItemsProcessed} Items
          </span>
          <span className="text-[9px] text-slate-600 font-medium block mt-0.5">Zero Hydrocarbon Odor</span>
        </div>

        <div className="bg-emerald-50 text-emerald-950 p-3 rounded-2xl border border-emerald-200">
          <span className="text-[9px] font-bold text-emerald-800 uppercase block tracking-wider">VIP Club Savings</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-emerald-800 block mt-0.5">
            ₹2,250 Saved
          </span>
          <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">15% Tier Cashback</span>
        </div>
      </div>

      {/* Recharts Chart Visualization */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'total' ? (
            <AreaChart data={CUSTOMER_SPENDING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9E7B4F" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#9E7B4F" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="expenditure"
                name="Fabric Care Spend"
                stroke="#9E7B4F"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#customerGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={CUSTOMER_SPENDING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="dryCleaning" name="Dry Cleaning" stackId="a" fill="#0F172A" radius={[0, 0, 0, 0]} />
              <Bar dataKey="suitCouture" name="Suit Care & Steam" stackId="a" fill="#9E7B4F" radius={[0, 0, 0, 0]} />
              <Bar dataKey="washFold" name="Wash & Fold" stackId="a" fill="#38BDF8" radius={[0, 0, 0, 0]} />
              <Bar dataKey="shoeSpa" name="Shoe & Leather Spa" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Franchise Model Opportunity Teaser Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 border border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                FABRIQ AI FRANCHISE NETWORK
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">18-Month ROI</span>
            </div>
            <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-sm text-white mt-0.5">
              Own a High-Margin FabriQ AI Luxury Atelier Franchise
            </h4>
            <p className="text-[11px] text-slate-300">
              FOFO & COFO Models • Automated AI Counter ERP • Hydrocarbon Zero-Odor Tech
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFranchiseModalOpen(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">business_center</span>
          <span>Explore Franchise Partnership</span>
        </button>
      </div>

      {/* Franchise Opportunity Modal */}
      {isFranchiseModalOpen && (
        <FranchiseOpportunityModal onClose={() => setIsFranchiseModalOpen(false)} />
      )}
    </div>
  );
};

// OWNER & FRANCHISE NETWORK SPENDING / REVENUE TRENDS COMPONENT
export const OwnerFranchiseSpendingChart: React.FC = () => {
  const [selectedFranchiseFilter, setSelectedFranchiseFilter] = useState<'all' | 'revenue' | 'expense' | 'profit'>('all');
  const [isFranchiseApplyOpen, setIsFranchiseApplyOpen] = useState(false);

  const total6MonthRev = OWNER_FRANCHISE_DATA.reduce((acc, curr) => acc + curr.grossRevenue, 0);
  const total6MonthExp = OWNER_FRANCHISE_DATA.reduce((acc, curr) => acc + curr.operatingExpense, 0);
  const total6MonthProfit = OWNER_FRANCHISE_DATA.reduce((acc, curr) => acc + curr.netProfit, 0);
  const profitMargin = ((total6MonthProfit / total6MonthRev) * 100).toFixed(1);

  return (
    <div className="bg-slate-900 rounded-3xl p-5 border border-[#9E7B4F]/40 shadow-xl space-y-4 font-sans text-white relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              FRANCHISE NETWORK P&L TELEMETRY
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              6 Flagship Ateliers Live
            </span>
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-1">
            Monthly Revenue & Expenditure Trends
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFranchiseApplyOpen(true)}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_business</span>
            <span>+ Add Franchise Unit</span>
          </button>
        </div>
      </div>

      {/* Key Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">6-Mo Gross Network Rev</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-amber-300 block mt-0.5">
            ₹{(total6MonthRev / 100).toFixed(2)} Cr
          </span>
          <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">+18.4% MoM Growth</span>
        </div>

        <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">6-Mo Operating Expenses</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-rose-300 block mt-0.5">
            ₹{(total6MonthExp / 100).toFixed(2)} Cr
          </span>
          <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Solvents, Power & Staff</span>
        </div>

        <div className="bg-slate-800/90 p-3 rounded-2xl border border-amber-400/40">
          <span className="text-[9px] font-bold text-amber-300 uppercase block tracking-wider">Net Franchise Profit</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-emerald-400 block mt-0.5">
            ₹{(total6MonthProfit / 100).toFixed(2)} Cr
          </span>
          <span className="text-[9px] text-emerald-300 font-extrabold block mt-0.5">{profitMargin}% Net Margin</span>
        </div>

        <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Royalty & Tech Share</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-sky-300 block mt-0.5">
            ₹{((total6MonthRev * 0.08) / 100).toFixed(2)} Cr
          </span>
          <span className="text-[9px] text-sky-400 font-bold block mt-0.5">6% Royalty + 2% Tech Stack</span>
        </div>
      </div>

      {/* Recharts Chart Visualization */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={OWNER_FRANCHISE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(val) => `₹${val}K`}
            />
            <Tooltip content={<CustomChartTooltip isOwner />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#CBD5E1' }} />
            <Area
              type="monotone"
              dataKey="grossRevenue"
              name="Gross Franchise Revenue (₹K)"
              stroke="#F59E0B"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
            <Area
              type="monotone"
              dataKey="operatingExpense"
              name="Operating Expenses (₹K)"
              stroke="#F43F5E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expenseGrad)"
            />
            <Area
              type="monotone"
              dataKey="netProfit"
              name="Net Franchise Profit (₹K)"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#profitGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Franchise Business Model Specification Suite */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-amber-400/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">corporate_fare</span>
            <div>
              <h4 className="font-['Libre_Caslon_Text',serif] text-sm font-bold text-white">
                FabriQ AI Franchise Economics & Unit Breakdown
              </h4>
              <p className="text-[11px] text-slate-400">Standardized FOFO & COFO Franchise Specifications</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-500/30">
            Payback Window: ~18 Months
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">1. FOFO Model</span>
            <p className="font-bold text-white">Franchise Owned • Franchise Operated</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Full operational autonomy with FabriQ AI Counter ERP, automated GPS valet dispatch, and central marketing support.
            </p>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">2. COFO Model</span>
            <p className="font-bold text-white">Company Owned • Franchise Operated</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Turnkey store infrastructure setup by FabriQ AI HQ; franchisee manages daily customer intake and quality inspection.
            </p>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">3. Capital & Royalty</span>
            <p className="font-bold text-white">₹35 Lakhs setup • 6% Royalty</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Includes Hydrocarbon zero-odor dry cleaning machinery, Italian steam vacuum press, and footwear spa station.
            </p>
          </div>
        </div>
      </div>

      {/* Franchise Application Modal */}
      {isFranchiseApplyOpen && (
        <FranchiseOpportunityModal onClose={() => setIsFranchiseApplyOpen(false)} />
      )}
    </div>
  );
};

// REUSABLE FRANCHISE OPPORTUNITY & ONBOARDING MODAL
export const FranchiseOpportunityModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Hyderabad',
    preferredModel: 'FOFO',
    investmentBudget: '₹35 - ₹50 Lakhs',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {!submitted ? (
          <>
            <div>
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                FRANCHISE EXPANSION INQUIRY
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white mt-1">
                Partner with FabriQ AI
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Bring India's premier luxury fabric care, garment restoration & sneaker spa franchise to your city.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singhania"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Target City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad / Delhi NCR"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Franchise Model *</label>
                  <select
                    value={formData.preferredModel}
                    onChange={(e) => setFormData({ ...formData, preferredModel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="FOFO">FOFO (Franchise Owned & Operated)</option>
                    <option value="COFO">COFO (Company Owned & Operated)</option>
                    <option value="MULTI_UNIT">Multi-Unit Regional Franchise</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Investment Budget *</label>
                  <select
                    value={formData.investmentBudget}
                    onChange={(e) => setFormData({ ...formData, investmentBudget: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="₹25 - ₹35 Lakhs">₹25 - ₹35 Lakhs</option>
                    <option value="₹35 - ₹50 Lakhs">₹35 - ₹50 Lakhs</option>
                    <option value="₹50 Lakhs+">₹50 Lakhs+ (Flagship Hub)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>Included Franchise Package:</span>
                  <span>100% Turnkey Support</span>
                </div>
                <p>• Hydrocarbon solvent dry cleaning plant & Italian steam press</p>
                <p>• Full integration with FabriQ AI Counter ERP & Valet Dispatch</p>
                <p>• Staff training, garment care certification & brand signage</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Submit Franchise Inquiry</span>
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <div>
              <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white">
                Franchise Inquiry Received!
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-sm mx-auto">
                Thank you <strong className="text-amber-300">{formData.name}</strong>. Our Global Franchise Expansion Director will contact you at <strong className="text-amber-300">{formData.phone}</strong> within 24 hours.
              </p>
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-xs text-slate-300 max-w-sm mx-auto font-mono">
              Reference ID: FBQ-FRANCHISE-{Math.floor(100000 + Math.random() * 900000)}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
