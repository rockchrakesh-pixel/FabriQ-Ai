import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { triggerHaptic } from '../lib/haptics';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ConfirmServiceAddon: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[#C29C6D]/30 bg-[#0B1528]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('service-catalog');
            }}
            className="w-10 h-10 min-h-[44px] flex items-center justify-center rounded-full bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/40 hover:border-[#D4AF37] transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-wider font-sans">
              ADD-ON SELECTION
            </span>
            <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
              Confirm Special Add-on
            </h1>
          </div>
        </div>
      </div>

      {/* Order Context Card */}
      <div className="px-5 my-4 max-w-2xl mx-auto w-full">
        <div className="bg-[#0B1528] p-4 rounded-2xl flex items-center justify-between shadow-md border border-[#C29C6D]/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              Order Reference
            </span>
            <span className="font-['Libre_Caslon_Text',serif] text-sm font-bold text-[#FAF9F6]">#TUM-FBQ-8829</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#070F1E] rounded-full border border-[#C29C6D]/40">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            <span className="text-xs font-bold text-[#E5C07B] font-sans">Customizing Care</span>
          </div>
        </div>
      </div>

      {/* Add-on Main Detail Section */}
      <div className="px-5 mb-4 max-w-2xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-[#0B1528] shadow-md border border-[#C29C6D]/40">
          <div className="h-44 w-full relative">
            <img
              src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=800&auto=format&fit=crop"
              alt="White-Glove Cedar Finish"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent"></div>
          </div>
          <div className="p-5 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
                White-Glove Cedar Bag Finish
              </h2>
              <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#E5C07B]">
                +₹120
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Aromatic natural cedar oil infusion and breathable protective garment bag for long-term closet preservation.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="px-5 mb-4 max-w-2xl mx-auto w-full">
        <div className="bg-[#0B1528] p-4 rounded-2xl border border-[#C29C6D]/40 flex flex-col gap-2 shadow-md font-sans">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Garments Care Total</span>
            <span className="font-bold text-white">₹999.00</span>
          </div>
          <div className="flex justify-between text-xs text-[#E5C07B] font-bold">
            <span>Cedar Finish Add-on</span>
            <span>+₹120.00</span>
          </div>
          <div className="h-px bg-[#C29C6D]/20 my-1"></div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#FAF9F6]">Revised Total</span>
            <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-[#E5C07B]">
              ₹1,119.00
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 space-y-3 max-w-2xl mx-auto w-full">
        <button
          onClick={() => {
            triggerHaptic('heavy');
            onNavigate('payment-success');
          }}
          className="w-full min-h-[48px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-98"
        >
          <span>Confirm & Append to Active Booking</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigate('cart');
          }}
          className="w-full min-h-[44px] bg-[#0B1528] text-slate-300 border border-[#C29C6D]/40 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#0E1B33] hover:text-white transition-colors cursor-pointer font-sans"
        >
          Skip Add-on
        </button>
      </div>

      <BottomNav activePath="cart" onNavigate={onNavigate} />
    </div>
  );
};
