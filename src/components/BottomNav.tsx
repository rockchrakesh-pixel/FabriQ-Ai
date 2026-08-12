import React from 'react';
import { ScreenId } from '../types';
import { useDivision } from '../context/DivisionContext';

interface BottomNavProps {
  activePath: 'home' | 'services' | 'schedule' | 'orders' | 'account' | 'book' | 'boutique' | 'cart';
  onNavigate: (screen: ScreenId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePath, onNavigate }) => {
  const { division } = useDivision();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-1">
        {/* Home */}
        <a
          href="#"
          data-path="home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 w-1/5 h-full transition-all duration-200 active:scale-90 ${
            activePath === 'home'
              ? 'text-[#9E7B4F] font-bold border-t-2 border-[#9E7B4F]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-all ${
              activePath === 'home'
                ? 'drop-shadow-[0_2px_8px_rgba(158,123,79,0.6)] scale-110 font-black'
                : 'active:scale-125'
            }`}
          >
            home
          </span>
          <span className="text-[12px] font-['Manrope',sans-serif]">Home</span>
        </a>

        {/* Services */}
        <a
          href="#"
          data-path="services"
          onClick={(e) => {
            e.preventDefault();
            if (division === 'boutique') {
              onNavigate('boutique-fitting');
            } else {
              onNavigate('service-catalog');
            }
          }}
          className={`flex flex-col items-center justify-center gap-0.5 w-1/5 h-full transition-all duration-200 active:scale-90 ${
            activePath === 'services' || activePath === 'boutique'
              ? 'text-[#9E7B4F] font-bold border-t-2 border-[#9E7B4F]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-all ${
              activePath === 'services' || activePath === 'boutique'
                ? 'drop-shadow-[0_2px_8px_rgba(158,123,79,0.6)] scale-110 font-black'
                : 'active:scale-125'
            }`}
          >
            {division === 'boutique' ? 'checkroom' : 'dry_cleaning'}
          </span>
          <span className="text-[12px] font-['Manrope',sans-serif]">
            {division === 'boutique' ? 'Fitting' : 'Services'}
          </span>
        </a>

        {/* Center CTA Book Button */}
        <a
          href="#"
          data-path="book"
          onClick={(e) => {
            e.preventDefault();
            if (division === 'boutique') {
              onNavigate('bespoke-tailor');
            } else {
              onNavigate('schedule-pickup');
            }
          }}
          className="flex flex-col items-center justify-center w-1/5 h-full group"
        >
          <div className="bg-[#9E7B4F] text-white p-1.5 rounded-full -mt-3 shadow-xl shadow-[#9E7B4F]/40 border-2 border-amber-300 ring-4 ring-amber-400/20 group-active:scale-90 transition-all flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[17px]">
              {division === 'boutique' ? 'design_services' : 'add'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#9E7B4F] font-['Manrope',sans-serif] mt-0.5">
            {division === 'boutique' ? 'Tailor' : 'Book'}
          </span>
        </a>

        {/* Orders */}
        <a
          href="#"
          data-path="orders"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('my-orders');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 w-1/5 h-full transition-all duration-200 active:scale-90 ${
            activePath === 'orders'
              ? 'text-[#9E7B4F] font-bold border-t-2 border-[#9E7B4F]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-all ${
              activePath === 'orders'
                ? 'drop-shadow-[0_2px_8px_rgba(158,123,79,0.6)] scale-110 font-black'
                : 'active:scale-125'
            }`}
          >
            local_shipping
          </span>
          <span className="text-[12px] font-['Manrope',sans-serif]">Orders</span>
        </a>

        {/* Profile */}
        <a
          href="#"
          data-path="account"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('account');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 w-1/5 h-full transition-all duration-200 active:scale-90 ${
            activePath === 'account'
              ? 'text-[#9E7B4F] font-bold border-t-2 border-[#9E7B4F]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-all ${
              activePath === 'account'
                ? 'drop-shadow-[0_2px_8px_rgba(158,123,79,0.6)] scale-110 font-black'
                : 'active:scale-125'
            }`}
          >
            person
          </span>
          <span className="text-[12px] font-['Manrope',sans-serif]">Profile</span>
        </a>
      </div>
    </nav>
  );
};
