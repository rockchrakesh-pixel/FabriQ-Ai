import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const HomeDashboardWithFeedback: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#fcf9f8] min-h-screen">
      {/* Welcome */}
      <section className="px-5 pt-6 pb-4">
        <span className="text-[#775a19] text-xs font-semibold tracking-widest uppercase">
          WELCOME BACK TO PREMIUM FABRI<span className="text-[#775a19]">Q</span> CARE
        </span>
      </section>

      {/* Active Status Card */}
      <section className="px-5 mb-6">
        <div className="bg-[#000e27] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-[#adc7fb] uppercase">Current Status</span>
                <h3 className="font-['Libre_Caslon_Text',serif] text-xl text-white font-semibold">
                  1 Order in Cleaning
                </h3>
              </div>
              <div className="bg-[#775a19]/20 p-2 rounded-full">
                <span className="material-symbols-outlined text-[#ffdea5]">auto_awesome</span>
              </div>
            </div>
            <div className="w-full bg-[#2c4773]/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#ffdea5] h-full w-[65%] rounded-full"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#adc7fb]">Est. Delivery: Tomorrow, 6:00 PM</span>
              <button
                onClick={() => onNavigate('live-order-tracking')}
                className="flex items-center gap-1 text-xs font-semibold text-[#ffdea5]"
              >
                Track Order <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fast booking */}
      <section className="px-5 mb-4">
        <div className="bg-[#ffdea5]/20 p-4 rounded-2xl flex items-center justify-between border border-[#775a19]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffdea5] flex items-center justify-center text-[#261900]">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div>
              <span className="text-xs text-[#44474f] uppercase tracking-widest">Smart Scheduling</span>
              <div className="text-sm font-bold text-[#000e27]">Next available in 45 mins</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('schedule-pickup')}
            className="bg-[#000e27] text-white px-4 py-2 rounded-full text-xs font-semibold"
          >
            Book Fast
          </button>
        </div>
      </section>

      {/* Schedule Pickup */}
      <section className="px-5 mb-6">
        <button
          onClick={() => onNavigate('schedule-pickup')}
          className="w-full bg-[#e5e2e1] p-4 rounded-2xl flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#000e27] flex items-center justify-center text-[#ffdea5]">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div>
              <div className="font-['Libre_Caslon_Text',serif] text-xl font-semibold text-[#000e27]">
                Schedule Pickup
              </div>
              <div className="text-xs text-[#44474f]">Next available: Today, 2:00 PM</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#775a19]">arrow_forward_ios</span>
        </button>
      </section>

      {/* Feedback Option Card */}
      <section className="px-5 mb-6">
        <button
          onClick={() => onNavigate('concierge-chat')}
          className="w-full bg-[#f6f3f2] p-4 rounded-2xl border border-[#775a19]/20 flex items-center justify-between text-left group active:scale-[0.98] transition-transform shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ffdea5]/30 flex items-center justify-center text-[#775a19]">
              <span className="material-symbols-outlined">rate_review</span>
            </div>
            <div>
              <h4 className="font-['Libre_Caslon_Text',serif] text-lg text-[#000e27] font-semibold">
                Share Your Experience
              </h4>
              <p className="text-xs text-[#44474f]">Help us improve our premium fabric care.</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#775a19] transition-transform group-hover:translate-x-1">
            chevron_right
          </span>
        </button>
      </section>

      <BottomNav activePath="home" onNavigate={onNavigate} />
    </div>
  );
};
