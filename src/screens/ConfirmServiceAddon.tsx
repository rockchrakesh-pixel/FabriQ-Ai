import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { triggerHaptic } from '../lib/haptics';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ConfirmServiceAddon: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] dark:bg-[#0B0B10] text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F0F18]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('service-catalog');
            }}
            className="btn-press w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-wider font-sans">
              ADD-ON SELECTION
            </span>
            <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 dark:text-white">
              Confirm Special Add-on
            </h1>
          </div>
        </div>
      </div>

      {/* Order Context Card */}
      <div className="px-5 my-4">
        <div className="card-press bg-white dark:bg-[#12121C] p-4 rounded-2xl flex items-center justify-between shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
              Order Reference
            </span>
            <span className="font-['Libre_Caslon_Text',serif] text-sm font-bold text-slate-900 dark:text-white">#TUM-FBQ-8829</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-full border border-amber-200 dark:border-amber-800">
            <span className="w-2 h-2 rounded-full bg-[#9E7B4F] animate-pulse"></span>
            <span className="text-xs font-bold text-[#83633B] dark:text-amber-300 font-sans">Customizing Care</span>
          </div>
        </div>
      </div>

      {/* Add-on Main Detail Section */}
      <div className="px-5 mb-4">
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#12121C] shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="h-40 w-full relative">
            <img
              src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=800&auto=format&fit=crop"
              alt="White-Glove Cedar Finish"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#12121C] via-transparent to-transparent"></div>
          </div>
          <div className="p-5 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 dark:text-white">
                White-Glove Cedar Bag Finish
              </h2>
              <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#9E7B4F]">
                +₹120
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Aromatic natural cedar oil infusion and breathable protective garment bag for long-term closet preservation.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="px-5 mb-4">
        <div className="bg-white dark:bg-[#12121C] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 shadow-xs font-sans">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>Garments Care Total</span>
            <span className="font-bold text-slate-900 dark:text-white">₹999.00</span>
          </div>
          <div className="flex justify-between text-xs text-[#9E7B4F] font-bold">
            <span>Cedar Finish Add-on</span>
            <span>+₹120.00</span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Revised Total</span>
            <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 dark:text-white">
              ₹1,119.00
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 space-y-3">
        <button
          onClick={() => {
            triggerHaptic('heavy');
            onNavigate('payment-success');
          }}
          className="btn-press w-full py-3.5 bg-gradient-to-r from-[#9E7B4F] to-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
        >
          <span>Confirm & Append to Active Booking</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigate('cart');
          }}
          className="btn-press w-full py-3 bg-white dark:bg-[#12121C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer font-sans"
        >
          Skip Add-on
        </button>
      </div>

      <BottomNav activePath="cart" onNavigate={onNavigate} />
    </div>
  );
};
