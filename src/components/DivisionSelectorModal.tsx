import React from 'react';
import { useDivision } from '../context/DivisionContext';
import { ScreenId } from '../types';
import { FabriQAiCrownLogo } from './FabriQAiCrownLogo';

interface DivisionSelectorModalProps {
  onNavigate?: (screen: ScreenId) => void;
}

export const DivisionSelectorModal: React.FC<DivisionSelectorModalProps> = ({ onNavigate }) => {
  const { division, setDivision, showSelectorModal, setShowSelectorModal } = useDivision();

  if (!showSelectorModal) return null;

  const handleSelectDivision = (selectedDiv: 'laundry' | 'boutique' | 'luxury_store') => {
    setDivision(selectedDiv);
    setShowSelectorModal(false);
    if (onNavigate) {
      if (selectedDiv === 'boutique') {
        onNavigate('boutique-fitting');
      } else if (selectedDiv === 'luxury_store') {
        onNavigate('luxury-store');
      } else {
        onNavigate('home');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#050A14]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0B1528] border-2 border-[#C29C6D]/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden p-6 sm:p-8 text-[#FAF9F6]">
        {/* Close Button */}
        <button
          onClick={() => setShowSelectorModal(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#070F1E] border border-[#C29C6D]/30 text-slate-300 hover:text-white flex items-center justify-center hover:border-[#D4AF37] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Top Header Monogram Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2">
            <FabriQAiCrownLogo size="sm" theme="navy" showSubtitle={false} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#070F1E] border border-[#C29C6D]/40 text-[10px] font-black uppercase tracking-[0.25em] text-[#E5C07B] mb-2">
            <span>ONE BRAND • THREE DIVISIONS</span>
          </div>
          <h2 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-[#FAF9F6]">
            Choose Your Fabri<span className="text-[#D4AF37]">Q</span> Division
          </h2>
          <p className="text-xs text-slate-300 max-w-md mt-1.5 leading-relaxed">
            Select your specialized luxury care or fashion experience. You can switch between divisions anytime from the navigation header.
          </p>
        </div>

        {/* The Three Division Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-4">
          {/* Division 1: FabriQ AI Premium Laundry Care */}
          <div
            onClick={() => handleSelectDivision('laundry')}
            className={`group relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              division === 'laundry'
                ? 'bg-[#0E1B33] border-[#D4AF37] shadow-xl ring-2 ring-[#D4AF37]/20'
                : 'bg-[#070F1E] border-[#C29C6D]/30 hover:border-[#D4AF37] hover:shadow-lg'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">dry_cleaning</span>
                </div>
                <span className="text-[9px] font-black text-[#0B1528] bg-[#E5C07B] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DIV 01
                </span>
              </div>

              <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6] group-hover:text-[#E5C07B] transition-colors">
                Fabri<span className="text-[#D4AF37]">Q</span> AI Laundry
              </h3>
              <p className="text-[11px] font-bold text-[#E5C07B] mt-0.5">
                Premium Laundry & Fabric Care
              </p>

              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                Hydrocarbon eco-dry cleaning, Italian vacuum steam pressing & 4-hr turnaround.
              </p>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer">
              <span>Explore Laundry</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Division 2: FabriQ Boutique */}
          <div
            onClick={() => handleSelectDivision('boutique')}
            className={`group relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              division === 'boutique'
                ? 'bg-[#0E1B33] border-[#D4AF37] shadow-xl ring-2 ring-[#D4AF37]/20'
                : 'bg-[#070F1E] border-[#C29C6D]/30 hover:border-[#D4AF37] hover:shadow-lg'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">checkroom</span>
                </div>
                <span className="text-[9px] font-black text-[#0B1528] bg-[#E5C07B] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DIV 02
                </span>
              </div>

              <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6] group-hover:text-[#E5C07B] transition-colors">
                Fabri<span className="text-[#D4AF37]">Q</span> Boutique
              </h3>
              <p className="text-[11px] font-bold text-[#E5C07B] mt-0.5">
                Luxury Boutique & Custom Wear
              </p>

              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                3D body scan tailoring, bespoke suits, royal bridal fitting & alterations.
              </p>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer">
              <span>Explore Boutique</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Division 3: FabriQ Luxury Cloth Store */}
          <div
            onClick={() => handleSelectDivision('luxury_store')}
            className={`group relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              division === 'luxury_store'
                ? 'bg-[#0E1B33] border-[#D4AF37] shadow-xl ring-2 ring-[#D4AF37]/20'
                : 'bg-[#070F1E] border-[#C29C6D]/30 hover:border-[#D4AF37] hover:shadow-lg'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                </div>
                <span className="text-[9px] font-black text-[#0B1528] bg-[#E5C07B] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DIV 03
                </span>
              </div>

              <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6] group-hover:text-[#E5C07B] transition-colors">
                Fabri<span className="text-[#D4AF37]">Q</span> Luxury Cloth Store
              </h3>
              <p className="text-[11px] font-bold text-[#E5C07B] mt-0.5">
                Ready-to-Wear Luxury Apparel
              </p>

              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                Ready-to-wear Giza cotton shirts, Japanese selvedge denim & leather footwear.
              </p>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer">
              <span>Explore Store</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-[#C29C6D]/20 text-center flex items-center justify-between text-[11px] text-slate-400">
          <span>FabriQ AI Master Ecosystem</span>
          <button
            onClick={() => setShowSelectorModal(false)}
            className="text-[#E5C07B] hover:text-white underline font-medium cursor-pointer"
          >
            Continue with current selection
          </button>
        </div>
      </div>
    </div>
  );
};
