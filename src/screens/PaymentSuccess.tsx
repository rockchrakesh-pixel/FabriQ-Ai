import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { GoldDustAnimation } from '../components/GoldDustAnimation';
import { triggerHaptic } from '../lib/haptics';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const PaymentSuccess: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [showGoldDust, setShowGoldDust] = useState(true);

  useEffect(() => {
    triggerHaptic('success');
  }, []);

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen font-sans relative overflow-hidden">
      {/* Luxury Gold Dust CSS Particle Animation on Order Success */}
      <GoldDustAnimation active={showGoldDust} durationMs={4500} particleCount={45} />

      <div className="px-5 flex flex-col items-center text-center pt-6 max-w-md mx-auto w-full">
        {/* Animated Gold Check Icon with Shimmer Halo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/25 scale-150 blur-xl animate-pulse" />
          <div className="relative w-22 h-22 rounded-3xl bg-gradient-to-tr from-[#0B1528] via-[#111C30] to-[#1C2C4E] border-2 border-[#C29C6D] flex items-center justify-center shadow-2xl">
            <span className="material-symbols-outlined text-[46px] text-[#E5C07B]">
              verified
            </span>
          </div>
        </div>

        <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-[0.25em] mb-2 px-3 py-1 rounded-full bg-[#0B1528] border border-[#C29C6D]/40">
          ✨ FABRIQ ORDER CONFIRMED ✨
        </span>
        <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-[#FAF9F6] mb-2">
          Garment Care Booked Successfully!
        </h1>
        <p className="text-xs text-slate-300 max-w-xs mb-6 leading-relaxed font-medium">
          Your order has been assigned to our nearest doorstep valet courier. Track progress live below.
        </p>

        {/* Order Details Card */}
        <div className="bg-[#0B1528] rounded-3xl p-5 shadow-xl w-full border-2 border-[#C29C6D]/40 text-left mb-6 font-sans">
          <div className="flex justify-between items-start border-b border-[#C29C6D]/20 pb-3 mb-3">
            <div>
              <p className="text-[10px] text-[#E5C07B] uppercase tracking-widest font-black">
                Order Ticket
              </p>
              <p className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6]">
                #FBQ-8829
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Payment Status
              </p>
              <p className="font-['Libre_Caslon_Text',serif] text-base font-bold text-emerald-400">
                Verified Paid
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#070F1E] flex items-center justify-center text-[#E5C07B] shrink-0 border border-[#C29C6D]/40">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Confirmed Service Pickup Slot
                </p>
                <p className="text-xs font-bold text-[#FAF9F6]">
                  Today, 04:30 PM - 05:30 PM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#070F1E] flex items-center justify-center text-[#E5C07B] shrink-0 border border-[#C29C6D]/40">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Doorstep Pickup Address
                </p>
                <p className="text-xs font-bold text-[#FAF9F6] truncate max-w-[240px]">
                  Jubilee Hills Atelier Hub, Road No. 36
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onNavigate('live-order-tracking');
            }}
            className="w-full min-h-[48px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
          >
            <span>Track Valet Delivery Courier Live</span>
            <span className="material-symbols-outlined text-[18px]">near_me</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('my-orders');
            }}
            className="w-full min-h-[44px] rounded-2xl bg-[#0B1528] border border-[#C29C6D]/40 flex items-center justify-center text-xs font-bold text-[#FAF9F6] hover:bg-[#0E1B33] hover:border-[#D4AF37] cursor-pointer transition-all"
          >
            View Order In Care Log
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('home');
            }}
            className="w-full min-h-[44px] text-center text-xs font-bold text-slate-400 hover:text-[#E5C07B] pt-1 cursor-pointer transition-colors"
          >
            Return to Home Dashboard
          </button>
        </div>

        {/* Bottom Centered Statement */}
        <div className="mt-8 text-center">
          <p className="text-[11px] font-bold text-[#E5C07B] uppercase tracking-widest">
            ✦ FABRIQ LUXURY PROMISE • ZERO SHRINKAGE GUARANTEE ✦
          </p>
        </div>
      </div>

      <BottomNav activePath="orders" onNavigate={onNavigate} />
    </div>
  );
};
