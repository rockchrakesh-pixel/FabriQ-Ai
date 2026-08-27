import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export interface MonthlyFinancialRecord {
  month: string;
  grossRevenue: number;
  royaltyFee: number; // 6%
  marketingLevy: number; // 2%
  techStackFee: number; // 2%
  operatingExpenses: number;
  netProfit: number;
  marginPercent: number;
}

const FINANCIAL_HISTORY: MonthlyFinancialRecord[] = [
  {
    month: 'Mar 2026',
    grossRevenue: 1840000,
    royaltyFee: 110400,
    marketingLevy: 36800,
    techStackFee: 36800,
    operatingExpenses: 1120000,
    netProfit: 536000,
    marginPercent: 29.1,
  },
  {
    month: 'Apr 2026',
    grossRevenue: 2050000,
    royaltyFee: 123000,
    marketingLevy: 41000,
    techStackFee: 41000,
    operatingExpenses: 1210000,
    netProfit: 635000,
    marginPercent: 31.0,
  },
  {
    month: 'May 2026',
    grossRevenue: 2280000,
    royaltyFee: 136800,
    marketingLevy: 45600,
    techStackFee: 45600,
    operatingExpenses: 1310000,
    netProfit: 742000,
    marginPercent: 32.5,
  },
  {
    month: 'Jun 2026',
    grossRevenue: 2190000,
    royaltyFee: 131400,
    marketingLevy: 43800,
    techStackFee: 43800,
    operatingExpenses: 1280000,
    netProfit: 691000,
    marginPercent: 31.5,
  },
  {
    month: 'Jul 2026',
    grossRevenue: 2540000,
    royaltyFee: 152400,
    marketingLevy: 50800,
    techStackFee: 50800,
    operatingExpenses: 1420000,
    netProfit: 866000,
    marginPercent: 34.1,
  },
  {
    month: 'Aug 2026',
    grossRevenue: 2890000,
    royaltyFee: 173400,
    marketingLevy: 57800,
    techStackFee: 57800,
    operatingExpenses: 1540000,
    netProfit: 1061000,
    marginPercent: 36.7,
  },
];

export const FranchiseFinancialReports: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<MonthlyFinancialRecord>(FINANCIAL_HISTORY[5]); // Aug 2026
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const handleDownloadStatement = (month: string) => {
    setDownloadSuccessMessage(`GST & Royalty Statement for ${month} downloaded (PDF).`);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 border border-[#9E7B4F]/40 shadow-xl space-y-4 font-sans text-white relative overflow-hidden">
      {/* Toast Notification */}
      {downloadSuccessMessage && (
        <div className="bg-amber-400 text-slate-950 p-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download_done</span>
            <span>{downloadSuccessMessage}</span>
          </div>
          <button onClick={() => setDownloadSuccessMessage(null)} className="text-slate-800 hover:text-slate-950">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
            FRANCHISE FINANCIAL REPORTING & ROYALTIES
          </span>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-1">
            Monthly P&L, Royalty Ledger & Margin Analytics
          </h3>
        </div>

        <button
          onClick={() => handleDownloadStatement(selectedRecord.month)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          <span>Download Audit Ledger ({selectedRecord.month})</span>
        </button>
      </div>

      {/* Recharts Financial Breakdown Chart */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
        <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
          6-MONTH GROSS REVENUE VS ROYALTIES VS NET PROFIT (₹ IN LAKHS)
        </span>

        <div className="w-full h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={FINANCIAL_HISTORY.map((f) => ({
                month: f.month.split(' ')[0],
                gross: (f.grossRevenue / 100000).toFixed(2),
                royalty: ((f.royaltyFee + f.marketingLevy + f.techStackFee) / 100000).toFixed(2),
                netProfit: (f.netProfit / 100000).toFixed(2),
              }))}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#9E7B4F', borderRadius: '12px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="gross" name="Gross Revenue (₹L)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="netProfit" name="Net Profit (₹L)" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="royalty" name="HQ Royalty & Tech Fees (₹L)" fill="#38BDF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Month Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Gross Revenue</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-amber-300 block mt-0.5">
            ₹{selectedRecord.grossRevenue.toLocaleString()}
          </span>
          <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">100% Counter & App Settled</span>
        </div>

        <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">HQ Royalty (6%)</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-sky-300 block mt-0.5">
            ₹{selectedRecord.royaltyFee.toLocaleString()}
          </span>
          <span className="text-[9px] text-sky-400 font-medium block mt-0.5">+₹{(selectedRecord.marketingLevy + selectedRecord.techStackFee).toLocaleString()} Marketing & Tech</span>
        </div>

        <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Operating Costs</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-rose-300 block mt-0.5">
            ₹{selectedRecord.operatingExpenses.toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Rent, Salaries & Solvents</span>
        </div>

        <div className="bg-slate-800 p-3.5 rounded-2xl border border-amber-400/40">
          <span className="text-[9px] font-bold text-amber-300 uppercase block tracking-wider">Net Franchise Profit</span>
          <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-emerald-400 block mt-0.5">
            ₹{selectedRecord.netProfit.toLocaleString()}
          </span>
          <span className="text-[9px] text-emerald-300 font-black block mt-0.5">{selectedRecord.marginPercent}% Net Margin</span>
        </div>
      </div>

      {/* Historical Monthly Table */}
      <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-2">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
          MONTHLY ROYALTIES & TAX AUDIT TRAIL
        </span>

        <div className="space-y-2">
          {FINANCIAL_HISTORY.map((rec) => (
            <div
              key={rec.month}
              onClick={() => setSelectedRecord(rec)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                selectedRecord.month === rec.month
                  ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">receipt_long</span>
                <div>
                  <h4 className="font-bold text-xs text-white">{rec.month} Ledger</h4>
                  <span className="text-[10px] text-slate-400">Gross: ₹{rec.grossRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-sans">HQ Royalty (6%)</span>
                  <span className="font-bold text-sky-300">₹{rec.royaltyFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-sans">Net Profit</span>
                  <span className="font-bold text-emerald-400">₹{rec.netProfit.toLocaleString()}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadStatement(rec.month);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[10px] font-bold border border-slate-700 cursor-pointer"
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
