import React, { useState } from 'react';
import { ScreenId, UserRole, getDefaultPortalForRole } from '../types';
import { useAuth, ROLE_PROFILES } from '../context/AuthContext';

interface DemoPersonaSwitcherProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const PERSONAS: { role: UserRole; label: string; badge: string; icon: string; category: string }[] = [
  { role: 'customer', label: 'VIP Customer', badge: 'Prestige Member', icon: 'person', category: 'Consumer' },
  { role: 'ceo', label: 'CEO Suite', badge: 'Executive Board', icon: 'crown', category: 'Executive' },
  { role: 'super_admin', label: 'Super Admin', badge: 'Full Platform Admin', icon: 'admin_panel_settings', category: 'Executive' },
  { role: 'owner', label: 'Store Owner', badge: 'Franchise Partner', icon: 'account_balance', category: 'Franchise' },
  { role: 'franchise_owner', label: 'Franchise Owner', badge: 'Territory Licensee', icon: 'storefront', category: 'Franchise' },
  { role: 'regional_manager', label: 'Regional Manager', badge: 'Regional Director', icon: 'public', category: 'Management' },
  { role: 'area_manager', label: 'Area Manager', badge: 'Cluster Overseer', icon: 'map', category: 'Management' },
  { role: 'store_manager', label: 'Store Manager', badge: 'Branch Operations', icon: 'store', category: 'Operations' },
  { role: 'quality_inspector', label: 'Quality Inspector', badge: 'QC & Rework Station', icon: 'fact_check', category: 'Operations' },
  { role: 'mis', label: 'MIS Analytics', badge: 'Data & Telemetry', icon: 'analytics', category: 'Finance & BI' },
  { role: 'finance', label: 'Finance Officer', badge: 'Ledger & GST', icon: 'account_balance_wallet', category: 'Finance & BI' },
  { role: 'inventory', label: 'Inventory Lead', badge: 'Supply Chain Hub', icon: 'inventory_2', category: 'Supply Chain' },
  { role: 'pickup_executive', label: 'Pickup Executive', badge: 'Valet Fleet Intake', icon: 'local_shipping', category: 'Field Fleet' },
  { role: 'delivery_executive', label: 'Delivery Executive', badge: 'Express Courier', icon: 'two_wheeler', category: 'Field Fleet' },
];

export const DemoPersonaSwitcher: React.FC<DemoPersonaSwitcherProps> = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentRole, switchRole } = useAuth();

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    const target = getDefaultPortalForRole(role);
    onNavigate(target);
    setIsOpen(false);
  };

  const currentProf = ROLE_PROFILES[currentRole];

  return (
    <div className="fixed bottom-4 right-4 z-[999] font-['Manrope',sans-serif]">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/95 hover:bg-slate-900 text-amber-300 rounded-full shadow-2xl border-2 border-amber-500/60 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 group"
        title="Quick Role/Persona Switcher for Testing & Review"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="material-symbols-outlined text-[16px] text-amber-400 group-hover:rotate-45 transition-transform">
          swap_horiz
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-wider">
          Persona: <strong className="text-white">{currentProf?.tier || currentRole}</strong>
        </span>
        <span className="material-symbols-outlined text-[14px] text-slate-400">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Modal / Dropdown Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 max-h-[80vh] bg-slate-950 border-2 border-amber-500/50 rounded-3xl shadow-2xl p-4 overflow-y-auto text-white animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">badge</span>
              <div>
                <h3 className="font-['Libre_Caslon_Text',serif] text-sm font-bold text-white">
                  Demo Persona Switcher
                </h3>
                <p className="text-[10px] text-slate-400">
                  Switch roles instantly to verify role-based access
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {PERSONAS.map((p) => {
              const isSelected = currentRole === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => handleSelectRole(p.role)}
                  className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{p.icon}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{p.label}</span>
                        {p.role === 'customer' && (
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-sm uppercase">
                            Consumer
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{p.badge}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500">
              RBAC authorization is strictly enforced in every view and API call.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
