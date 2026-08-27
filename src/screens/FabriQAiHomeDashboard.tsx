import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { FabriQAiCrownLogo } from '../components/FabriQAiCrownLogo';
import luxurySteamIronImg from '../assets/images/luxury_steam_iron_1785775317071.jpg';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const FabriQAiHomeDashboard: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen">
      {/* Editorial Header */}
      <section className="px-5 pt-6 pb-4 flex flex-col items-center text-center">
        <FabriQAiCrownLogo size="md" theme="navy" showSubtitle={true} className="mb-2" />
        <p className="text-xs text-[#E5C07B] uppercase tracking-widest mt-1 font-extrabold">
          AI-POWERED BESPOKE GARMENT RESTORATION & ATELIER
        </p>
      </section>

      {/* Main Feature Banner */}
      <section className="px-5 mb-6 max-w-xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C29C6D]/40">
          <img
            src={luxurySteamIronImg}
            alt="FabriQ AI Precision Care Service"
            className="w-full h-52 object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/60 to-transparent p-5 flex flex-col justify-end">
            <span className="text-[10px] text-[#E5C07B] font-bold uppercase tracking-widest mb-1">
              Signature Garment Treatment
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-xl text-[#FAF9F6] font-semibold mb-3">
              Italian Vacuum Steam Press & Hydrocarbon Care
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('cart')}
                className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] px-4 py-2.5 rounded-xl text-xs font-black shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                BOOK GARMENT CARE
              </button>
              <button
                onClick={() => onNavigate('service-catalog')}
                className="bg-[#070F1E] border border-[#C29C6D]/50 text-[#E5C07B] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0E1B33] transition-colors cursor-pointer"
              >
                View Catalog
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons Row */}
      <section className="px-5 mb-6 grid grid-cols-2 gap-3 max-w-xl mx-auto w-full">
        <button
          onClick={() => onNavigate('cart')}
          className="bg-[#0B1528] border border-[#C29C6D]/40 text-white p-4 rounded-2xl text-left shadow-lg flex flex-col justify-between min-h-[110px] group active:scale-[0.98] transition-all cursor-pointer hover:border-[#D4AF37]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#070F1E] border border-[#C29C6D]/40 flex items-center justify-center text-[#E5C07B]">
            <span className="material-symbols-outlined text-[18px]">dry_cleaning</span>
          </div>
          <div>
            <div className="font-['Libre_Caslon_Text',serif] font-bold text-sm text-[#FAF9F6]">
              Book Garment Care
            </div>
            <div className="text-[10px] text-[#E5C07B]">Instant Valet Dispatch</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('service-catalog')}
          className="bg-[#0B1528] text-white p-4 rounded-2xl text-left shadow-lg border border-[#C29C6D]/40 flex flex-col justify-between min-h-[110px] group active:scale-[0.98] transition-all cursor-pointer hover:border-[#D4AF37]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#070F1E] border border-[#C29C6D]/40 flex items-center justify-center text-[#E5C07B]">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <div>
            <div className="font-['Libre_Caslon_Text',serif] font-bold text-sm text-[#FAF9F6]">
              View Services
            </div>
            <div className="text-[10px] text-slate-400">Complete Care Menu</div>
          </div>
        </button>
      </section>

      <BottomNav activePath="home" onNavigate={onNavigate} />
    </div>
  );
};
