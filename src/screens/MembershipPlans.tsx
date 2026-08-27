import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { FabriQAiCrownLogo } from '../components/FabriQAiCrownLogo';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MembershipPlans: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen font-sans">
      <div className="px-5 pt-6 pb-4 max-w-2xl mx-auto w-full">
        <div className="bg-[#0B1528] rounded-3xl p-6 border-2 border-[#C29C6D]/40 shadow-xl relative overflow-hidden text-center">
          <div className="flex justify-center mb-2">
            <FabriQAiCrownLogo size="sm" theme="navy" showSubtitle={false} />
          </div>
          <span className="text-[11px] font-black text-[#E5C07B] uppercase tracking-widest block mb-1">
            ✦ FabriQ VIP CARE CLUB ✦
          </span>
          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-[#FAF9F6]">
            Membership & Care Privileges
          </h1>
          <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Unlock complimentary express valet pickup, white-glove cedar packaging, and monthly garment care credits.
          </p>
        </div>
      </div>

      {/* Tier 1 Card: Prestige Plan */}
      <div className="px-5 mb-4 max-w-2xl mx-auto w-full">
        <div className="bg-[#0B1528] text-white rounded-3xl p-6 shadow-xl border-2 border-[#D4AF37] relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-[#E5C07B] font-extrabold uppercase tracking-widest bg-[#070F1E] border border-[#C29C6D]/40 px-2.5 py-0.5 rounded-full">
                MOST POPULAR • SAVE 25%
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6] mt-2">
                Prestige Care Tier
              </h3>
            </div>
            <div className="text-right">
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-[#E5C07B]">
                ₹999
              </span>
              <span className="text-[10px] text-slate-400 block">/ month</span>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300 my-5">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">check_circle</span>
              <span>15 Free Garment Care Credits Every Month</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">check_circle</span>
              <span>White-Glove Cedar Bag Finish Included</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">check_circle</span>
              <span>Free Doorstep Valet Pickup & Delivery</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigate('payment-success')}
            className="w-full min-h-[48px] py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-98"
          >
            Join Prestige Club
          </button>
        </div>
      </div>

      {/* Tier 2 Card: Heritage Couture */}
      <div className="px-5 mb-6 max-w-2xl mx-auto w-full">
        <div className="bg-[#0B1528] rounded-3xl p-6 shadow-md border border-[#C29C6D]/40">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-[#E5C07B] font-extrabold uppercase tracking-widest bg-[#070F1E] border border-[#C29C6D]/40 px-2.5 py-0.5 rounded-full">
                ULTIMATE LUXURY
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6] mt-2">
                Heritage Couture Tier
              </h3>
            </div>
            <div className="text-right">
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-[#FAF9F6]">
                ₹1,999
              </span>
              <span className="text-[10px] text-slate-400 block">/ month</span>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300 my-5">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">check_circle</span>
              <span>Unlimited Garment Inspection & AI Care Scan</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">check_circle</span>
              <span>Dedicated Master Tailor & Express 12h Dispatch</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigate('payment-success')}
            className="w-full min-h-[48px] py-3.5 bg-[#070F1E] hover:bg-[#0E1B33] text-slate-200 border border-[#C29C6D]/40 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-98"
          >
            Choose Heritage Tier
          </button>
        </div>
      </div>

      <BottomNav activePath="account" onNavigate={onNavigate} />
    </div>
  );
};
