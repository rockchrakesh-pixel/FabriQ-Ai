import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { FabriQAiLogoFramed } from '../components/FabriQAiLogoFramed';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const FabriQAiHomeDashboard: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#0A0A0A] text-[#F2F2F2] min-h-screen">
      {/* Editorial Header */}
      <section className="px-5 pt-6 pb-4 flex flex-col items-center text-center">
        <FabriQAiLogoFramed size="lg" showSubtitle={true} className="mb-2" />
        <p className="text-xs text-[#C29C6D] uppercase tracking-widest mt-1 font-extrabold">
          AI-POWERED BESPOKE GARMENT RESTORATION & ATELIER
        </p>
      </section>

      {/* Main Feature Banner */}
      <section className="px-5 mb-6">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#2A2A2A]">
          <img
            src="/src/assets/images/luxury_steam_iron_1785775317071.jpg"
            alt="FabriQ AI Precision Care Service"
            className="w-full h-48 object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent p-5 flex flex-col justify-end">
            <span className="text-[10px] text-[#C29C6D] font-bold uppercase tracking-widest mb-1">
              Active Garment Treatment
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-xl text-[#F2F2F2] font-semibold mb-2">
              Silk Restoration & Stain Scan
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('live-order-tracking')}
                className="bg-[#C29C6D] text-[#0A0A0A] px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#d4b187] transition-colors cursor-pointer"
              >
                Track Order
              </button>
              <button
                onClick={() => onNavigate('service-catalog')}
                className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F2F2F2] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              >
                View Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons Row */}
      <section className="px-5 mb-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('schedule-pickup')}
          className="bg-[#121212] border border-[#2A2A2A] text-white p-4 rounded-2xl text-left shadow-lg flex flex-col justify-between min-h-[110px] group active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#C29C6D]/20 border border-[#C29C6D]/30 flex items-center justify-center text-[#C29C6D]">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
          <div>
            <div className="font-['Libre_Caslon_Text',serif] font-semibold text-sm text-[#F2F2F2]">
              Schedule Pickup
            </div>
            <div className="text-[10px] text-[#A0A0A0]">Fast Valet Dispatch</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('service-catalog')}
          className="bg-[#121212] text-[#F2F2F2] p-4 rounded-2xl text-left shadow-lg border border-[#2A2A2A] flex flex-col justify-between min-h-[110px] group active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#C29C6D]">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <div>
            <div className="font-['Libre_Caslon_Text',serif] font-semibold text-sm text-[#F2F2F2]">
              View Services
            </div>
            <div className="text-[10px] text-[#A0A0A0]">Full Fabric Menu</div>
          </div>
        </button>
      </section>

      <BottomNav activePath="home" onNavigate={onNavigate} />
    </div>
  );
};
