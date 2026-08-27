import React, { useState } from 'react';

export const FranchiseRoyaltyWidget: React.FC = () => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const grossRevenue = 2890000; // August 2026
  const royaltyRate = 0.06; // 6%
  const marketingRate = 0.02; // 2%
  const techStackRate = 0.02; // 2%

  const royaltyAccrual = grossRevenue * royaltyRate; // ₹1,73,400
  const marketingAccrual = grossRevenue * marketingRate; // ₹57,800
  const techStackAccrual = grossRevenue * techStackRate; // ₹57,800
  const totalAccruedFees = royaltyAccrual + marketingAccrual + techStackAccrual; // ₹2,89,000
  const netRetainedRevenue = grossRevenue - totalAccruedFees; // ₹26,01,000

  const handleDownloadInvoice = () => {
    setDownloadNotice('August 2026 Royalty & Platform Fee Tax Invoice downloaded (PDF).');
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 border border-amber-400/40 shadow-xl space-y-4 font-sans text-white relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Toast Notice */}
      {downloadNotice && (
        <div className="bg-amber-400 text-slate-950 p-2.5 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{downloadNotice}</span>
          </div>
          <button onClick={() => setDownloadNotice(null)} className="text-slate-800 hover:text-slate-950">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              CURRENT MONTH ACCRUAL SUMMARY (AUG 2026)
            </span>
            <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Portal Billing
            </span>
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-1">
            Royalty Accruals vs Total Processed Revenue
          </h3>
        </div>

        <button
          onClick={handleDownloadInvoice}
          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">receipt</span>
          <span>Download Invoice Ledger</span>
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Processed Revenue */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase text-[9px]">Portal Processed Revenue</span>
            <span className="material-symbols-outlined text-amber-400 text-[18px]">payments</span>
          </div>
          <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white block mt-1">
            ₹{(grossRevenue / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
            ₹{grossRevenue.toLocaleString()} Total Orders Settled
          </span>
        </div>

        {/* Total Royalty Accrued */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-400/50">
          <div className="flex items-center justify-between text-amber-300 text-xs">
            <span className="font-bold uppercase text-[9px]">Total HQ Accrued Fees (10%)</span>
            <span className="material-symbols-outlined text-amber-300 text-[18px]">account_balance_wallet</span>
          </div>
          <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-amber-300 block mt-1">
            ₹{(totalAccruedFees / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[10px] text-amber-200 block mt-0.5">
            Auto-Debit Date: Aug 31, 2026
          </span>
        </div>

        {/* Net Retained Revenue */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span className="font-bold uppercase text-[9px]">Net Retained Franchise Revenue</span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          </div>
          <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-emerald-400 block mt-1">
            ₹{(netRetainedRevenue / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">
            90.0% Directly Retained by Atelier
          </span>
        </div>
      </div>

      {/* Visual Revenue Ratio Progress Bar */}
      <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">Revenue Distribution Breakdown:</span>
          <span className="text-amber-300">Retained: 90.0% | HQ Platform Fee: 10.0%</span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 w-[90%]" title="90% Net Retained Revenue" />
          <div className="h-full bg-amber-400 w-[6%]" title="6% Franchise Royalty" />
          <div className="h-full bg-sky-400 w-[2%]" title="2% Marketing Fund" />
          <div className="h-full bg-purple-400 w-[2%]" title="2% Tech Stack" />
        </div>

        {/* Itemized Fee Pillars */}
        <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[9px] font-bold uppercase">6% Franchise Royalty</span>
            <span className="font-bold text-amber-300">₹{royaltyAccrual.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[9px] font-bold uppercase">2% Central Marketing</span>
            <span className="font-bold text-sky-300">₹{marketingAccrual.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[9px] font-bold uppercase">2% FabriQ AI Tech Stack</span>
            <span className="font-bold text-purple-300">₹{techStackAccrual.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
