import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const PaymentSuccess: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen">
      <div className="px-5 flex flex-col items-center text-center pt-6">
        {/* Animated Check Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#9E7B4F]/10 scale-150 blur-xl animate-pulse"></div>
          <div className="relative w-20 h-20 rounded-2xl bg-[#9E7B4F] flex items-center justify-center shadow-xl">
            <span className="material-symbols-outlined text-[48px] text-white">
              check
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest font-sans mb-1">
          FABRIQ AI ORDER CONFIRMED
        </span>
        <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 mb-2">
          Pickup Scheduled Successfully!
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mb-6 font-sans leading-relaxed">
          Your order has been assigned to our nearest doorstep valet courier. Track progress live below.
        </p>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs w-full border border-slate-200 text-left mb-6 font-sans">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Order Ticket
              </p>
              <p className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900">#FBQ-8829</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Estimated Paid</p>
              <p className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-[#9E7B4F]">
                ₹999.00
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#9E7B4F] shrink-0">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Scheduled Valet Pickup Slot</p>
                <p className="text-xs font-bold text-slate-900">Today, 04:30 PM - 05:30 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#9E7B4F] shrink-0">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Pickup Location</p>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                  42 Berkeley Square, Suite 402, Mayfair
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={() => onNavigate('live-order-tracking')}
            className="w-full h-13 bg-[#9E7B4F] hover:bg-[#83633B] text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-sans"
          >
            <span>Track Valet Delivery Courier Live</span>
            <span className="material-symbols-outlined text-[18px]">
              near_me
            </span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="w-full h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer font-sans"
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      <BottomNav activePath="orders" onNavigate={onNavigate} />
    </div>
  );
};
