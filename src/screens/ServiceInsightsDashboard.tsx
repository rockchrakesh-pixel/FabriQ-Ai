import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ServiceInsightsDashboard: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen">
      <section className="px-5 pt-6 pb-4">
        <span className="text-[11px] font-bold text-[#9E7B4F] uppercase tracking-widest block mb-1 font-sans">
          WARDROBE ANALYTICAL DASHBOARD
        </span>
        <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
          Garment Service Insights
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
          Your garment care habits, eco-impact savings, and fabric preservation trends.
        </p>
      </section>

      {/* Usage Chart Card */}
      <section className="px-5 mb-5">
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
              Garments Care Activity
            </span>
            <div className="flex gap-3 text-xs font-sans">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9E7B4F]"></span> Dry Clean
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Wash & Fold
              </span>
            </div>
          </div>

          <div className="relative h-40 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-200">
            {/* Bars */}
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-[#9E7B4F]/80 rounded-t-lg h-[50%] transition-all"></div>
              <span className="text-[11px] text-slate-500 font-sans">Oct</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-[#9E7B4F]/80 rounded-t-lg h-[70%] transition-all"></div>
              <span className="text-[11px] text-slate-500 font-sans">Nov</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-[#9E7B4F]/80 rounded-t-lg h-[45%] transition-all"></div>
              <span className="text-[11px] text-slate-500 font-sans">Dec</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-slate-900 rounded-t-lg h-[85%] transition-all relative">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full"></div>
              </div>
              <span className="text-[11px] font-bold text-slate-900 font-sans">Jan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="px-5 grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 text-white rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between">
            <span className="material-symbols-outlined text-amber-400 text-[24px]">workspace_premium</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-sans font-bold">Annual Savings</p>
            <h3 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-amber-300">
              $185
            </h3>
          </div>
        </div>

        <div className="bg-amber-50 text-[#83633B] rounded-3xl p-5 flex flex-col justify-between border border-amber-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <span className="material-symbols-outlined text-[#9E7B4F] text-[24px]">eco</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-[#83633B] uppercase tracking-wider mb-0.5 font-sans font-bold">Water Conserved</p>
            <div className="flex items-baseline gap-1">
              <h3 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
                1,420
              </h3>
              <span className="text-xs font-bold font-sans">Liters</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Services */}
      <section className="px-5 mb-6">
        <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 mb-3">
          Most Frequent Services
        </h3>
        <div className="bg-white rounded-3xl p-4 space-y-3 border border-slate-200 shadow-xs font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold text-xs shrink-0">
                85%
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Dry Cleaning & Couture Press</p>
                <p className="text-[11px] text-slate-500">Suits, Blazers & Silk Sarees</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                65%
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Organic Wash & Fold</p>
                <p className="text-[11px] text-slate-500">Daily Cotton Essentials</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
          </div>
        </div>
      </section>

      {/* Tip */}
      <section className="px-5">
        <div className="bg-amber-50/70 rounded-2xl p-4 flex gap-3 items-start border border-amber-200 font-sans">
          <span className="material-symbols-outlined text-[#9E7B4F] text-[20px]">lightbulb</span>
          <div>
            <p className="text-xs font-bold text-slate-900 mb-0.5">FabriQ Care Optimization Tip</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              You're utilizing Eco Dry Clean 20% more this month. Join our Prestige Club to get 15 free credits and save an extra $25/month.
            </p>
          </div>
        </div>
      </section>

      <BottomNav activePath="services" onNavigate={onNavigate} />
    </div>
  );
};
