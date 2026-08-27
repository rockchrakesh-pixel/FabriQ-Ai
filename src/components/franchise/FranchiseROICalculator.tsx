import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export type LocationTier = 'tier1_metro' | 'tier2_hub' | 'tier3_regional';
export type StoreModel = 'FOFO' | 'COFO' | 'MultiUnit';

export const FranchiseROICalculator: React.FC = () => {
  const [tier, setTier] = useState<LocationTier>('tier1_metro');
  const [model, setModel] = useState<StoreModel>('FOFO');
  const [garmentVolume, setGarmentVolume] = useState<number>(3200); // Garments per month
  const [aov, setAov] = useState<number>(950); // Average order value per garment
  const [customRent, setCustomRent] = useState<number>(180000); // Monthly rent
  const [staffCount, setStaffCount] = useState<number>(5);
  const [leadInquirySent, setLeadInquirySent] = useState(false);

  // Constants
  const initialCapitalSetup = tier === 'tier1_metro' ? 3800000 : tier === 'tier2_hub' ? 3000000 : 2200000;
  const staffSalaryPerPerson = 28000;
  const solventCostPerGarment = 85; // Solvents, tags, hanger packaging
  const utilitiesPowerCost = 65000;

  // Dynamic Calculations
  const grossMonthlyRevenue = garmentVolume * aov;
  const hqRoyaltyFee = grossMonthlyRevenue * 0.06; // 6%
  const hqTechAndMktgFee = grossMonthlyRevenue * 0.02 + grossMonthlyRevenue * 0.02; // 4%
  const totalStaffSalary = staffCount * staffSalaryPerPerson;
  const totalSolventCost = garmentVolume * solventCostPerGarment;
  const totalOperatingExpenses =
    customRent + totalStaffSalary + totalSolventCost + utilitiesPowerCost + hqRoyaltyFee + hqTechAndMktgFee;
  
  const estimatedMonthlyNetProfit = Math.max(0, grossMonthlyRevenue - totalOperatingExpenses);
  const netMarginPercent = grossMonthlyRevenue > 0 ? ((estimatedMonthlyNetProfit / grossMonthlyRevenue) * 100).toFixed(1) : '0.0';
  const paybackPeriodMonths = estimatedMonthlyNetProfit > 0 ? (initialCapitalSetup / estimatedMonthlyNetProfit).toFixed(1) : 'N/A';

  // Projection Data for Recharts
  const projectionData = [
    {
      volume: '1,500 Items',
      revenue: (1500 * aov) / 100000,
      netProfit: (Math.max(0, 1500 * aov - (customRent + totalStaffSalary + 1500 * solventCostPerGarment + utilitiesPowerCost + 1500 * aov * 0.1))) / 100000,
    },
    {
      volume: '3,200 Items (Current)',
      revenue: grossMonthlyRevenue / 100000,
      netProfit: estimatedMonthlyNetProfit / 100000,
    },
    {
      volume: '5,000 Items',
      revenue: (5000 * aov) / 100000,
      netProfit: (Math.max(0, 5000 * aov - (customRent + totalStaffSalary + 5000 * solventCostPerGarment + utilitiesPowerCost + 5000 * aov * 0.1))) / 100000,
    },
    {
      volume: '7,500 Items (Peak)',
      revenue: (7500 * aov) / 100000,
      netProfit: (Math.max(0, 7500 * aov - (customRent + totalStaffSalary + 7500 * solventCostPerGarment + utilitiesPowerCost + 7500 * aov * 0.1))) / 100000,
    },
  ];

  return (
    <div className="bg-slate-900 rounded-3xl p-5 border border-[#9E7B4F]/50 shadow-xl space-y-5 font-sans text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
            PROSPECTIVE FRANCHISE ROI PROJECTION TOOL
          </span>
          <h3 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white mt-1">
            Interactive Atelier Unit Economics & Payback Simulator
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Simulate monthly revenue, HQ royalty deductions, operating overheads, and estimated ROI payback.
          </p>
        </div>

        <button
          onClick={() => setLeadInquirySent(true)}
          disabled={leadInquirySent}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            {leadInquirySent ? 'check_circle' : 'send'}
          </span>
          <span>{leadInquirySent ? 'Inquiry Logged to HQ' : 'Request Official MoU Deck'}</span>
        </button>
      </div>

      {/* Input Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
            1. LOCATION TIER & OPERATING MODEL
          </span>

          {/* Location Tier Selection */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setTier('tier1_metro');
                setCustomRent(180000);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                tier === 'tier1_metro'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-extrabold block uppercase">Tier 1 Metro</span>
              <span className="text-xs font-bold block mt-0.5">Jubilee / Delhi</span>
              <span className="text-[9px] opacity-80 block">Setup: ₹38 Lakhs</span>
            </button>

            <button
              onClick={() => {
                setTier('tier2_hub');
                setCustomRent(110000);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                tier === 'tier2_hub'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-extrabold block uppercase">Tier 2 Hub</span>
              <span className="text-xs font-bold block mt-0.5">Vizag / Mohali</span>
              <span className="text-[9px] opacity-80 block">Setup: ₹30 Lakhs</span>
            </button>

            <button
              onClick={() => {
                setTier('tier3_regional');
                setCustomRent(65000);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                tier === 'tier3_regional'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-extrabold block uppercase">Tier 3 Town</span>
              <span className="text-xs font-bold block mt-0.5">Tier-3 City</span>
              <span className="text-[9px] opacity-80 block">Setup: ₹22 Lakhs</span>
            </button>
          </div>

          {/* Model Toggle */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Franchise Model:</span>
            <button
              onClick={() => setModel('FOFO')}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                model === 'FOFO' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
              }`}
            >
              FOFO (Franchise-Operated)
            </button>
            <button
              onClick={() => setModel('COFO')}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                model === 'COFO' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
              }`}
            >
              COFO (HQ-Managed Turnkey)
            </button>
          </div>

          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block pt-2">
            2. VOLUME & PRICING SLIDERS
          </span>

          {/* Garment Volume Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Monthly Garment Volume:</span>
              <span className="text-amber-300 font-bold">{garmentVolume.toLocaleString()} Garments</span>
            </div>
            <input
              type="range"
              min="1000"
              max="8000"
              step="100"
              value={garmentVolume}
              onChange={(e) => setGarmentVolume(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* AOV Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Average Order Value / Garment:</span>
              <span className="text-amber-300 font-bold">₹{aov} / Item</span>
            </div>
            <input
              type="range"
              min="500"
              max="2500"
              step="50"
              value={aov}
              onChange={(e) => setAov(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Custom Rent & Staff */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Atelier Rent (₹/Mo)</label>
              <input
                type="number"
                value={customRent}
                onChange={(e) => setCustomRent(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Staff Count (₹28k/head)</label>
              <input
                type="number"
                value={staffCount}
                onChange={(e) => setStaffCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none mt-1"
              />
            </div>
          </div>
        </div>

        {/* Calculated Results Box */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Gross Revenue</span>
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-amber-300 block mt-1">
                ₹{(grossMonthlyRevenue / 100000).toFixed(2)} Lakhs
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">₹{grossMonthlyRevenue.toLocaleString()} / Month</span>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Monthly Expenses</span>
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-rose-300 block mt-1">
                ₹{(totalOperatingExpenses / 100000).toFixed(2)} Lakhs
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Includes Rent, Solvents & HQ Royalty</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/50">
              <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider block">Net Monthly Profit</span>
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-emerald-400 block mt-1">
                ₹{(estimatedMonthlyNetProfit / 100000).toFixed(2)} Lakhs
              </span>
              <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">{netMarginPercent}% Net Margin</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/50">
              <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider block">Estimated Payback</span>
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white block mt-1">
                {paybackPeriodMonths} Months
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Capital Setup: ₹{(initialCapitalSetup / 100000).toFixed(0)} Lakhs</span>
            </div>
          </div>

          {/* Recharts Volume vs Profitability Chart */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              SCALABILITY CURVE: REVENUE VS NET PROFIT (₹ LAKHS)
            </span>
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="volume" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#9E7B4F', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="revenue" name="Gross Revenue (₹L)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" name="Net Profit (₹L)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
