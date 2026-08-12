import React from 'react';
import { useDivision } from '../context/DivisionContext';
import { ScreenId } from '../types';

interface DivisionSelectorModalProps {
  onNavigate?: (screen: ScreenId) => void;
}

export const DivisionSelectorModal: React.FC<DivisionSelectorModalProps> = ({ onNavigate }) => {
  const { division, setDivision, showSelectorModal, setShowSelectorModal } = useDivision();

  if (!showSelectorModal) return null;

  const handleSelectDivision = (selectedDiv: 'laundry' | 'boutique' | 'luxury_store') => {
    setDivision(selectedDiv as any);
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white border border-amber-200/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden p-6 sm:p-8 text-slate-800">
        
        {/* Top Header Monogram Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9E7B4F] via-[#C29C6D] to-[#E3C396] flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/10 mb-3 border border-white">
            <span className="font-['Libre_Caslon_Text',serif]">F</span>
          </div>
          <span className="text-[11px] font-bold text-[#9E7B4F] uppercase tracking-[0.25em] font-sans">
            WELCOME TO FABRIQ AI
          </span>
          <h2 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Choose Your FabriQ Division
          </h2>
          <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
            Select your specialized luxury care experience. You can switch between divisions anytime from the navigation header.
          </p>
        </div>

        {/* The Three Division Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-4">
          
          {/* Division 1: FabriQ AI Premium Laundry Care */}
          <div
            onClick={() => handleSelectDivision('laundry')}
            className={`group relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              division === 'laundry'
                ? 'bg-gradient-to-b from-amber-50/80 to-white border-[#C29C6D] shadow-xl ring-2 ring-[#C29C6D]/20'
                : 'bg-white border-slate-200 hover:border-[#C29C6D] hover:shadow-lg'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#9E7B4F] border border-amber-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">dry_cleaning</span>
                </div>
                <span className="text-[9px] font-bold text-[#9E7B4F] bg-amber-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DIV 1
                </span>
              </div>

              <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                FabriQ AI
              </h3>
              <p className="text-[11px] font-semibold text-[#9E7B4F] mt-0.5">
                Premium Laundry Care
              </p>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Hydrocarbon eco-dry cleaning, silk & cashmere spa, and valet delivery.
              </p>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl bg-[#9E7B4F] group-hover:bg-[#83633B] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1">
              <span>Laundry Care</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Division 2: FabriQ AI Boutique - Luxury Fit */}
          <div
            onClick={() => handleSelectDivision('boutique')}
            className={`group relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              division === 'boutique'
                ? 'bg-gradient-to-b from-amber-50/80 to-white border-[#C29C6D] shadow-xl ring-2 ring-[#C29C6D]/20'
                : 'bg-white border-slate-200 hover:border-[#C29C6D] hover:shadow-lg'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-700 border border-purple-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">checkroom</span>
                </div>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DIV 2
                </span>
              </div>

              <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                FabriQ BotiQue
              </h3>
              <p className="text-[11px] font-semibold text-purple-700 mt-0.5">
                3D Bespoke Fit
              </p>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                AI 3D body fitting scan, bespoke tuxedo tailoring & haute couture.
              </p>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl bg-slate-900 group-hover:bg-purple-900 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1">
              <span>3D Fitting</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Division 3: FabriQ AI Luxury Cloth Store */}
          <div
            onClick={() => handleSelectDivision('luxury_store')}
            className={`group relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              division === 'luxury_store'
                ? 'bg-gradient-to-b from-amber-50/80 to-white border-[#C29C6D] shadow-xl ring-2 ring-[#C29C6D]/20'
                : 'bg-white border-slate-200 hover:border-[#C29C6D] hover:shadow-lg'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DIV 3
                </span>
              </div>

              <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Luxury Cloth Store
              </h3>
              <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                Shirts, Jeans, Kurthas & Shoes
              </p>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Buy ready-to-wear FabriQ brand shirts, t-shirts, jeans, kurthas, and shoes.
              </p>
            </div>

            <button className="mt-4 w-full py-2 rounded-xl bg-emerald-800 group-hover:bg-emerald-900 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1">
              <span>Enter Store</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center flex items-center justify-between text-[11px] text-slate-400">
          <span>FabriQ AI • Pure White & Gold Edition</span>
          <button
            onClick={() => setShowSelectorModal(false)}
            className="text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Continue with current selection
          </button>
        </div>

      </div>
    </div>
  );
};
