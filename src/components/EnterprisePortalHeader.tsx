import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ScreenId, getDefaultPortalForRole } from '../types';
import { ExportDataButton } from './ExportDataButton';

interface EnterprisePortalHeaderProps {
  portalTitle: string;
  portalBadge: string;
  portalIcon: string;
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  extraActions?: React.ReactNode;
}

export const EnterprisePortalHeader: React.FC<EnterprisePortalHeaderProps> = ({
  portalTitle,
  portalBadge,
  portalIcon,
  activeScreen,
  onNavigate,
  extraActions,
}) => {
  const { currentRole, profile } = useAuth();

  const navLinks: { id: ScreenId; label: string; icon: string; allowedRoles: string[] }[] = [
    {
      id: 'operations-center',
      label: 'Ops Command Center',
      icon: 'hub',
      allowedRoles: ['super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager', 'store_staff', 'quality_inspector', 'pickup_executive', 'delivery_executive', 'mis', 'finance', 'inventory'],
    },
    {
      id: 'enterprise-analytics',
      label: 'Enterprise Analytics',
      icon: 'insights',
      allowedRoles: ['super_admin', 'ceo', 'owner', 'franchise_owner', 'regional_manager', 'area_manager', 'store_manager', 'mis', 'finance'],
    },
    {
      id: 'dashboard-ceo',
      label: 'CEO Command',
      icon: 'crown',
      allowedRoles: ['ceo', 'super_admin'],
    },
    {
      id: 'dashboard-owner',
      label: 'Store Owner P&L',
      icon: 'account_balance',
      allowedRoles: ['owner', 'franchise_owner', 'area_manager', 'regional_manager', 'ceo', 'super_admin'],
    },
    {
      id: 'dashboard-store-manager',
      label: 'Store Operations',
      icon: 'storefront',
      allowedRoles: ['store_manager', 'store_staff', 'pickup_executive', 'delivery_executive', 'quality_inspector', 'inventory', 'area_manager', 'regional_manager', 'franchise_owner', 'owner', 'ceo', 'super_admin'],
    },
    {
      id: 'dashboard-mis',
      label: 'MIS Analytics',
      icon: 'analytics',
      allowedRoles: ['mis', 'finance', 'regional_manager', 'owner', 'ceo', 'super_admin'],
    },
  ];

  return (
    <div className="bg-slate-900 border border-[#9E7B4F]/40 rounded-3xl p-5 text-white shadow-xl mb-4 relative overflow-hidden">
      {/* Accent Background Glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#9E7B4F]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <img
            src={
              profile?.avatarUrl ||
              'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop'
            }
            alt={profile?.name || 'User'}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">{portalIcon}</span>
                <span>{portalBadge}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                Role: <strong className="text-amber-200">{currentRole.toUpperCase()}</strong>
              </span>
            </div>
            <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-1">
              {portalTitle}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
              <span>{profile?.name || 'Enterprise Executive'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-200">{profile?.storeLocation || 'Global Enterprise Network'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {extraActions}
          <ExportDataButton variant="compact" label="Export Data" />
          <button
            onClick={() => onNavigate('role-login')}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-colors"
            title="Switch Enterprise Role Persona"
          >
            <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
            <span>Switch Role</span>
          </button>
        </div>
      </div>

      {/* Standardized Navigation Tabs across All Enterprise Portals */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 pr-1">
          ENTERPRISE PORTALS:
        </span>

        {navLinks.map((link) => {
          const isPermitted = link.allowedRoles.includes(currentRole);
          const isActive = activeScreen === link.id;

          if (!isPermitted) return null;

          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-amber-400/30'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
