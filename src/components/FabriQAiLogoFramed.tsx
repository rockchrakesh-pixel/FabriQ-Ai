import React, { useState } from 'react';
import { FabriQAiCrownLogo } from './FabriQAiCrownLogo';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

interface FabriQAiLogoFramedProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  onClick?: () => void;
  className?: string;
  enableModalOnClick?: boolean;
  variant?: 'light' | 'dark' | 'auto' | 'navy';
}

export const FabriQAiLogoFramed: React.FC<FabriQAiLogoFramedProps> = ({
  size = 'md',
  showSubtitle = true,
  onClick,
  className = '',
  enableModalOnClick = true,
  variant = 'auto',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dimensions = {
    xs: 'h-[26px] min-w-[26px]',
    sm: 'h-[34px] min-w-[34px]',
    md: 'h-[42px] min-w-[42px]',
    lg: 'h-[54px] min-w-[54px]',
    xl: 'h-[68px] min-w-[68px]',
  };

  const titleSizes = {
    xs: 'text-sm sm:text-base',
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (enableModalOnClick) {
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative inline-flex items-center gap-2 cursor-pointer transition-all duration-300 ${className}`}
        title="Click to view FabriQ AI Official Brand Guarantee & Rate Card"
      >
        {/* GOLD FOIL ARCHED FRAME AROUND LOGO WITH NAVY / WHITE ACCENT */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-white dark:bg-[#0B1528] p-1 border-2 border-[#C29C6D] shadow-[0_2px_12px_rgba(194,156,109,0.35)] ring-1 ring-[#C29C6D]/50 transition-all duration-300 flex flex-col items-center justify-center shrink-0 ${
            isHovered ? 'scale-105 shadow-[0_4px_22px_rgba(194,156,109,0.6)] ring-[#C29C6D] border-[#d4b187]' : ''
          }`}
        >
          {/* Subtle Corner Gold Sparkle Accents */}
          <span className="absolute top-0.5 right-0.5 text-[8px] text-[#C29C6D] pointer-events-none select-none">✨</span>
          
          <img
            src={fabriqLogo}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/fabriq_ai_logo_1785771380575.jpg';
            }}
            alt="FabriQ AI Official Logo"
            className={`${dimensions[size]} w-auto object-contain transition-transform duration-300 ${
              isHovered ? 'scale-105' : ''
            }`}
          />
        </div>

        {showSubtitle && (
          <div className="flex flex-col text-left justify-center">
            {/* MINI CROWN ON TOP OF TYPOGRAPHY */}
            <svg
              viewBox="0 0 100 65"
              className="w-4 h-3 text-[#C29C6D] filter drop-shadow-xs -mb-0.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 52 L90 52 L88 62 L12 62 Z"
                fill="#C29C6D"
              />
              <path
                d="M12 52 L8 28 L28 42 L50 14 L72 42 L92 28 L88 52 Z"
                fill="#D4AF37"
                stroke="#FFF1B8"
                strokeWidth="1.5"
              />
              <circle cx="8" cy="27" r="3" fill="#FFF9E6" />
              <circle cx="28" cy="41" r="2.5" fill="#FFF9E6" />
              <circle cx="50" cy="13" r="3.5" fill="#FFF9E6" />
              <circle cx="72" cy="41" r="2.5" fill="#FFF9E6" />
              <circle cx="92" cy="27" r="3" fill="#FFF9E6" />
            </svg>

            <div className="flex items-center gap-1 leading-none">
              <span
                className={`font-['Libre_Caslon_Text',serif] font-bold tracking-tight ${titleSizes[size]} ${
                  variant === 'light'
                    ? 'text-[#FAF9F6]'
                    : variant === 'navy'
                    ? 'text-[#0B1528]'
                    : 'text-[#0B1528] dark:text-[#FAF9F6]'
                }`}
              >
                Fabri
                <span className="font-extrabold text-[#D4AF37] dark:text-[#E5C07B] drop-shadow-xs ml-[0.5px]">
                  Q
                </span>
              </span>
            </div>
            <span
              className={`text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-widest leading-snug mt-0.5 ${
                variant === 'light'
                  ? 'text-[#C29C6D]'
                  : 'text-[#83633B] dark:text-[#C29C6D]'
              }`}
            >
              PREMIUM FABRIC CARE & LIFESTYLE
            </span>
          </div>
        )}
      </div>

      {/* FULL FABRIQ AI BRAND GUARANTEE DIAGRAM MODAL (MATCHING UPLOADED DESIGN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400/80 overflow-hidden my-8 animate-scaleUp">
            
            {/* Modal Header & Close Button */}
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-amber-400/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">verified</span>
                <div>
                  <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-amber-300">
                    FabriQ Ai Official Brand Guarantee
                  </h3>
                  <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
                    Premium Fabric Care Standard & Service Spectrum
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* FULL BRANDED DIAGRAM CONTENT (REPLICATING THE ATTACHED DESIGN) */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-center bg-radial from-amber-50/50 to-white">
              
              {/* TOP EMBLEM & BRAND HEADER */}
              <div className="relative flex flex-col items-center justify-center space-y-2 py-2">
                
                {/* Arched Hanger Frame & Logo */}
                <div className="relative p-4 rounded-3xl bg-white shadow-xl border-2 border-amber-400/90 ring-4 ring-amber-100 flex flex-col items-center justify-center max-w-[280px] mx-auto">
                  
                  {/* Decorative Arch */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-2" />
                  
                  <img
                    src={fabriqLogo}
                    alt="FabriQ AI Official Logo"
                    className="h-28 w-auto object-contain"
                  />
                  
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-2" />
                </div>

                <div className="mt-3">
                  <h2 className="font-['Libre_Caslon_Text',serif] text-3xl font-extrabold text-slate-950 tracking-tight">
                    Fabri<span className="text-[#83633B]">Q</span> <span className="text-[#0F172A]">Ai</span>
                  </h2>
                  <p className="text-xs font-black text-[#83633B] uppercase tracking-[0.25em] mt-1">
                    PREMIUM FABRIC CARE
                  </p>
                </div>
              </div>

              {/* SERVICE SPECTRUM ROW (6 ICONS MATCHING UPLOADED DESIGN) */}
              <div className="border-t border-b border-amber-200/80 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                <div className="flex flex-col items-center p-2 rounded-xl bg-white shadow-xs border border-amber-100">
                  <span className="material-symbols-outlined text-amber-600 text-2xl mb-1">local_laundry_service</span>
                  <span className="text-[10px] font-extrabold text-slate-900 uppercase">LAUNDRY</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white shadow-xs border border-amber-100">
                  <span className="material-symbols-outlined text-amber-600 text-2xl mb-1">dry_cleaning</span>
                  <span className="text-[10px] font-extrabold text-slate-900 uppercase">DRY CLEAN</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white shadow-xs border border-amber-100">
                  <span className="material-symbols-outlined text-amber-600 text-2xl mb-1">iron</span>
                  <span className="text-[10px] font-extrabold text-slate-900 uppercase">STEAM IRONING</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white shadow-xs border border-amber-100">
                  <span className="material-symbols-outlined text-amber-600 text-2xl mb-1">inventory_2</span>
                  <span className="text-[10px] font-extrabold text-slate-900 uppercase">FOLD & PACK</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white shadow-xs border border-amber-100">
                  <span className="material-symbols-outlined text-amber-600 text-2xl mb-1">steps</span>
                  <span className="text-[10px] font-extrabold text-slate-900 uppercase">SHOE CARE</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white shadow-xs border border-amber-100">
                  <span className="material-symbols-outlined text-amber-600 text-2xl mb-1">view_agenda</span>
                  <span className="text-[10px] font-extrabold text-slate-900 uppercase">CARPET & RUG</span>
                </div>
              </div>

              {/* 4 ECO & SAFETY BADGES */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-900 text-white border border-amber-400/40 shadow-xs">
                  <span className="material-symbols-outlined text-amber-400 text-2xl mb-1">verified_user</span>
                  <h4 className="text-xs font-bold uppercase text-amber-300">SAFE CARE</h4>
                  <p className="text-[9px] text-slate-300 mt-0.5">For Every Fabric</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 text-white border border-amber-400/40 shadow-xs">
                  <span className="material-symbols-outlined text-amber-400 text-2xl mb-1">eco</span>
                  <h4 className="text-xs font-bold uppercase text-amber-300">ECO FRIENDLY</h4>
                  <p className="text-[9px] text-slate-300 mt-0.5">Green Organic Cleaning</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 text-white border border-amber-400/40 shadow-xs">
                  <span className="material-symbols-outlined text-amber-400 text-2xl mb-1">schedule</span>
                  <h4 className="text-xs font-bold uppercase text-amber-300">ON TIME</h4>
                  <p className="text-[9px] text-slate-300 mt-0.5">Every Single Time</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 text-white border border-amber-400/40 shadow-xs">
                  <span className="material-symbols-outlined text-amber-400 text-2xl mb-1">clean_hands</span>
                  <h4 className="text-xs font-bold uppercase text-amber-300">HYGIENIC</h4>
                  <p className="text-[9px] text-slate-300 mt-0.5">Deep Microbe Clean</p>
                </div>
              </div>

              {/* 4 QUALITY COMMITMENT PILLARS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-amber-200">
                <div className="text-center p-2">
                  <span className="material-symbols-outlined text-amber-600 text-xl">diamond</span>
                  <p className="text-[10px] font-black uppercase text-slate-900 mt-1">QUALITY YOU TRUST</p>
                </div>
                <div className="text-center p-2">
                  <span className="material-symbols-outlined text-amber-600 text-xl">favorite</span>
                  <p className="text-[10px] font-black uppercase text-slate-900 mt-1">CARE WE PROVIDE</p>
                </div>
                <div className="text-center p-2">
                  <span className="material-symbols-outlined text-amber-600 text-xl">workspace_premium</span>
                  <p className="text-[10px] font-black uppercase text-slate-900 mt-1">EXPERTISE WE DELIVER</p>
                </div>
                <div className="text-center p-2">
                  <span className="material-symbols-outlined text-amber-600 text-xl">groups</span>
                  <p className="text-[10px] font-black uppercase text-slate-900 mt-1">SATISFACTION GUARANTEED</p>
                </div>
              </div>

              {/* FOOTER BANNER */}
              <div className="bg-slate-950 text-white p-3 rounded-2xl border border-amber-400/50 flex flex-col items-center justify-center gap-1">
                <span className="text-xs font-black text-amber-300 tracking-[0.3em] uppercase">
                  FRESH • CLEAN • CARE
                </span>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                  🚚 PICKUP & DELIVERY ON TIME, EVERY TIME
                </p>
              </div>

            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 text-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-slate-900 text-amber-300 font-bold text-xs shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Brand Card
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
