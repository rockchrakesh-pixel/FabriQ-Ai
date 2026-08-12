import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MembershipPlans: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen">
      <div className="px-5 pt-6 pb-4 text-center">
        <span className="text-[11px] font-bold text-[#9E7B4F] uppercase tracking-widest block mb-1 font-sans">
          FABRIQ AI VIP CARE CLUB
        </span>
        <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
          Membership & Care Subscription
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
          Unlock complimentary express pickup, white-glove cedar packaging, and monthly laundry credits.
        </p>
      </div>

      {/* Tier 1 Card: Prestige Plan */}
      <div className="px-5 mb-5">
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border-2 border-[#9E7B4F] relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-sans">
                MOST POPULAR • SAVE 25%
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-0.5">
                Prestige Care Tier
              </h3>
            </div>
            <div className="text-right">
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-amber-300">
                ₹999
              </span>
              <span className="text-[10px] text-slate-400 block font-sans">/ month</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-slate-300 my-4 font-sans">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-300 text-[18px]">check_circle</span>
              <span>15 Free Garment Care Credits Every Month</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-300 text-[18px]">check_circle</span>
              <span>White-Glove Cedar Bag Finish Included</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-300 text-[18px]">check_circle</span>
              <span>Free Doorstep Valet Pickup & Delivery</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigate('payment-success')}
            className="w-full py-3.5 bg-[#9E7B4F] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#83633B] transition-colors cursor-pointer"
          >
            Join Prestige Club
          </button>
        </div>
      </div>

      {/* Tier 2 Card: Heritage Couture */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-[#9E7B4F] font-bold uppercase tracking-widest font-sans">
                ULTIMATE LUXURY
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-0.5">
                Heritage Couture Tier
              </h3>
            </div>
            <div className="text-right">
              <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
                ₹1999
              </span>
              <span className="text-[10px] text-slate-500 block font-sans">/ month</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-slate-600 my-4 font-sans">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">check_circle</span>
              <span>Unlimited Garment Inspection & AI Scan</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">check_circle</span>
              <span>Dedicated Master Tailor & Express 12h Dispatch</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigate('payment-success')}
            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Choose Heritage Tier
          </button>
        </div>
      </div>

      <BottomNav activePath="account" onNavigate={onNavigate} />
    </div>
  );
};
