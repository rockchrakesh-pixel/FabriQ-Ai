import React, { useState } from 'react';
import { ScreenId } from '../types';
import { useDivision } from '../context/DivisionContext';

interface PrototypeBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const SCREENS: { id: ScreenId; name: string }[] = [
  { id: 'role-login', name: '🔑 Multi-Role SSO Login' },
  { id: 'home', name: '1. Customer Dashboard' },
  { id: 'dashboard-store-manager', name: '2. Store Manager Portal' },
  { id: 'dashboard-owner', name: '3. Store Owner Dashboard' },
  { id: 'dashboard-ceo', name: '4. CEO Command Center' },
  { id: 'dashboard-mis', name: '5. MIS Aggregated Portal' },
  { id: 'boutique-fitting', name: '6. Div 2: 3D Boutique Fitting' },
  { id: 'bespoke-tailor', name: '7. Div 2: Book Master Tailor' },
  { id: 'service-catalog', name: '8. Service Rate Card Menu' },
  { id: 'my-orders', name: '9. My Orders' },
  { id: 'order-tracking', name: '10. Order Tracking' },
  { id: 'live-order-tracking', name: '11. Live Order Tracking Map' },
  { id: 'service-insights', name: '12. Service Insights' },
  { id: 'account', name: '13. Account & Profile' },
  { id: 'concierge-chat', name: '14. Concierge Support Chat' },
  { id: 'membership-plans', name: '15. Membership Subscription' },
  { id: 'payment-success', name: '16. Payment Success' },
  { id: 'service-address', name: '17. Service Address' },
  { id: 'confirm-addon', name: '18. Confirm Add-on' },
  { id: 'select-photo', name: '19. Select Photo' },
  { id: 'update-profile-picture', name: '20. Update Profile Picture' },
  { id: 'home-feedback', name: '21. Home with Feedback' },
  { id: 'home-fabriq', name: '22. FabriQ Ai - Home' },
];

export const PrototypeBar: React.FC<PrototypeBarProps> = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setShowSelectorModal } = useDivision();

  return (
    <div className="fixed top-16 right-3 z-[60] text-xs font-['Manrope',sans-serif]">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowSelectorModal(true)}
          className="bg-[#9E7B4F] text-white px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1 hover:bg-[#83633B] transition-all cursor-pointer font-bold text-[11px]"
          title="Switch Division Modal"
        >
          <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
          <span className="hidden sm:inline">Divisions</span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white text-slate-800 px-2.5 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-[#9E7B4F]">map</span>
          <span className="font-semibold hidden sm:inline text-xs">Screens</span>
          <span className="bg-amber-100 text-[#83633B] font-bold px-1.5 py-0.5 rounded-full text-[10px]">
            {SCREENS.length}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-[75vh] overflow-y-auto z-[70] animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-2 py-1 mb-1 border-b border-slate-100">
            <span className="font-bold text-[#9E7B4F] uppercase tracking-wider text-[10px]">
              Jump to Screen
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <div className="space-y-0.5">
            {SCREENS.map((scr) => (
              <button
                key={scr.id}
                onClick={() => {
                  onNavigate(scr.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between text-[11px] cursor-pointer ${
                  currentScreen === scr.id
                    ? 'bg-[#9E7B4F] text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{scr.name}</span>
                {currentScreen === scr.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
