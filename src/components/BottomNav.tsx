import React from 'react';
import { ScreenId } from '../types';
import { useDivision } from '../context/DivisionContext';
import { triggerHaptic } from '../lib/haptics';

interface BottomNavProps {
  activePath: 'home' | 'services' | 'schedule' | 'orders' | 'account' | 'book' | 'boutique' | 'cart';
  onNavigate: (screen: ScreenId) => void;
}

/**
 * BottomNav: Canonical customer bottom navigation for FabriQ.
 * Minimum 44px touch target heights, Deep Navy (#0B1528) luxury background,
 * metallic gold highlights, and seamless viewport ergonomics.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activePath, onNavigate }) => {
  const { division } = useDivision();

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    if (division === 'boutique') {
      onNavigate('boutique-fitting');
    } else if (division === 'luxury_store') {
      onNavigate('luxury-store');
    } else {
      onNavigate('service-catalog');
    }
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    window.dispatchEvent(new CustomEvent('fabriq_nav_step', { detail: 'categories' }));
    onNavigate('home');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-[#0B1528]/95 backdrop-blur-xl border-t-2 border-[#C29C6D]/40 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] font-sans">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-3">
        {/* 1. Home */}
        <button
          onClick={(e) => {
            e.preventDefault();
            triggerHaptic('light');
            window.dispatchEvent(new CustomEvent('fabriq_nav_step', { detail: 'landing' }));
            onNavigate('home');
          }}
          className={`flex flex-col items-center justify-center gap-1 w-1/5 min-h-[44px] py-1 transition-all duration-200 cursor-pointer ${
            activePath === 'home'
              ? 'text-[#FAF9F6] font-bold border-t-2 border-[#D4AF37] -mt-[2px]'
              : 'text-slate-400 hover:text-[#FAF9F6]'
          }`}
          aria-label="Home"
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${
              activePath === 'home' ? 'text-[#D4AF37]' : 'text-slate-400'
            }`}
          >
            home
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold">Home</span>
        </button>

        {/* 2. Services */}
        <button
          onClick={handleServicesClick}
          className={`flex flex-col items-center justify-center gap-1 w-1/5 min-h-[44px] py-1 transition-all duration-200 cursor-pointer ${
            activePath === 'services' || activePath === 'boutique'
              ? 'text-[#FAF9F6] font-bold border-t-2 border-[#D4AF37] -mt-[2px]'
              : 'text-slate-400 hover:text-[#FAF9F6]'
          }`}
          aria-label="Services"
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${
              activePath === 'services' || activePath === 'boutique' ? 'text-[#D4AF37]' : 'text-slate-400'
            }`}
          >
            {division === 'boutique' ? 'checkroom' : division === 'luxury_store' ? 'shopping_bag' : 'dry_cleaning'}
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold">
            {division === 'boutique' ? 'Fitting' : division === 'luxury_store' ? 'Store' : 'Services'}
          </span>
        </button>

        {/* 3. Center Book CTA */}
        <button
          onClick={handleBookClick}
          className="flex flex-col items-center justify-center w-1/5 min-h-[44px] group cursor-pointer"
          aria-label="Book Garment Care"
        >
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] p-2.5 rounded-full -mt-5 shadow-[0_4px_16px_rgba(212,175,55,0.4)] border-2 border-[#0B1528] group-hover:scale-105 group-active:scale-95 transition-all flex items-center justify-center font-black">
            <span className="material-symbols-outlined text-[20px] text-[#0B1528]">
              {division === 'boutique' ? 'design_services' : division === 'luxury_store' ? 'shopping_cart' : 'add'}
            </span>
          </div>
          <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-wider mt-0.5">
            {division === 'boutique' ? 'Tailor' : division === 'luxury_store' ? 'Shop' : 'Book'}
          </span>
        </button>

        {/* 4. Orders */}
        <button
          onClick={(e) => {
            e.preventDefault();
            triggerHaptic('light');
            onNavigate('my-orders');
          }}
          className={`flex flex-col items-center justify-center gap-1 w-1/5 min-h-[44px] py-1 transition-all duration-200 cursor-pointer ${
            activePath === 'orders'
              ? 'text-[#FAF9F6] font-bold border-t-2 border-[#D4AF37] -mt-[2px]'
              : 'text-slate-400 hover:text-[#FAF9F6]'
          }`}
          aria-label="My Orders"
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${
              activePath === 'orders' ? 'text-[#D4AF37]' : 'text-slate-400'
            }`}
          >
            receipt_long
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold">Orders</span>
        </button>

        {/* 5. Account */}
        <button
          onClick={(e) => {
            e.preventDefault();
            triggerHaptic('light');
            onNavigate('account');
          }}
          className={`flex flex-col items-center justify-center gap-1 w-1/5 min-h-[44px] py-1 transition-all duration-200 cursor-pointer ${
            activePath === 'account'
              ? 'text-[#FAF9F6] font-bold border-t-2 border-[#D4AF37] -mt-[2px]'
              : 'text-slate-400 hover:text-[#FAF9F6]'
          }`}
          aria-label="Account Management"
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${
              activePath === 'account' ? 'text-[#D4AF37]' : 'text-slate-400'
            }`}
          >
            person
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold">Account</span>
        </button>
      </div>
    </nav>
  );
};
