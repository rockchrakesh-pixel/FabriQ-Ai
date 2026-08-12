import React from 'react';
import { ScreenId, UserRole } from '../types';
import { useAuth, ROLE_PROFILES } from '../context/AuthContext';

interface RbacGuardProps {
  screen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  children: React.ReactNode;
}

// Maps screen IDs to permitted user roles
const ROLE_PERMISSIONS: Partial<Record<ScreenId, UserRole[]>> = {
  'dashboard-customer': ['customer', 'super_admin'],
  'home': ['customer', 'store_staff', 'pickup_executive', 'delivery_executive', 'quality_inspector', 'store_manager', 'area_manager', 'regional_manager', 'mis', 'finance', 'inventory', 'franchise_owner', 'owner', 'ceo', 'super_admin'],
  'home-feedback': ['customer', 'super_admin'],
  'home-fabriq': ['customer', 'super_admin'],
  'dashboard-store-manager': ['store_manager', 'store_staff', 'pickup_executive', 'delivery_executive', 'quality_inspector', 'inventory', 'area_manager', 'regional_manager', 'franchise_owner', 'owner', 'ceo', 'super_admin'],
  'dashboard-owner': ['owner', 'franchise_owner', 'area_manager', 'regional_manager', 'ceo', 'super_admin'],
  'dashboard-ceo': ['ceo', 'super_admin'],
  'dashboard-mis': ['mis', 'finance', 'regional_manager', 'owner', 'ceo', 'super_admin'],
  'boutique-fitting': ['customer', 'super_admin'],
  'bespoke-tailor': ['customer', 'super_admin'],
  'concierge-chat': ['customer', 'super_admin'],
  'membership-plans': ['customer', 'super_admin'],
  'service-insights': ['store_manager', 'area_manager', 'regional_manager', 'mis', 'finance', 'franchise_owner', 'owner', 'ceo', 'super_admin'],
  'order-receipt': ['customer', 'store_staff', 'pickup_executive', 'delivery_executive', 'quality_inspector', 'store_manager', 'area_manager', 'regional_manager', 'mis', 'finance', 'inventory', 'franchise_owner', 'owner', 'ceo', 'super_admin'],
  'ai-fabric-advisor': ['store_staff', 'quality_inspector', 'store_manager', 'area_manager', 'regional_manager', 'mis', 'inventory', 'franchise_owner', 'owner', 'ceo', 'super_admin'],
};

// Screens that require 2-Step MFA verification before granting access
const MFA_PROTECTED_SCREENS: ScreenId[] = [
  'dashboard-store-manager',
  'dashboard-owner',
  'dashboard-ceo',
  'dashboard-mis',
  'account',
  'edit-profile',
  'concierge-chat',
  'membership-plans',
  'boutique-fitting',
  'bespoke-tailor',
];

export const RbacGuard: React.FC<RbacGuardProps> = ({ screen, onNavigate, children }) => {
  const { currentRole, profile, user, mfaEnabled, mfaVerifiedSession, triggerMfaChallenge } = useAuth();

  const allowedRoles = ROLE_PERMISSIONS[screen];
  const isRoleAuthorized = !allowedRoles || allowedRoles.includes(currentRole);

  // If role is authorized, check MFA verification status for protected routes
  if (isRoleAuthorized) {
    if (mfaEnabled && !mfaVerifiedSession && MFA_PROTECTED_SCREENS.includes(screen)) {
      const currentProf = profile || ROLE_PROFILES[currentRole];
      return (
        <div className="flex items-center justify-center min-h-[80vh] p-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[36px]">security</span>
            </div>

            <div>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest inline-block mb-2 border border-amber-400/30">
                MFA 2-STEP VERIFICATION REQUIRED
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white">
                Verification Required
              </h2>
              <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
                Firebase Authentication is configured with MFA enabled. OTP or Email verification is required before granting access to protected screen: <strong className="text-amber-300">{screen}</strong>.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Account Identity:</span>
                <span className="font-bold text-white">{currentProf.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Email Address:</span>
                <span className="font-mono text-amber-300 font-bold">{currentProf.email || user?.email || 'ananya@fabriq.ai'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Phone (SMS OTP):</span>
                <span className="font-mono text-amber-300 font-bold">{currentProf.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-t border-slate-700/60 pt-2">
                <span>MFA Status:</span>
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">gpp_maybe</span>
                  Pending OTP Verification
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => triggerMfaChallenge()}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Verify via OTP / Email Now</span>
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Determine user's primary assigned portal
  const getDefaultPortalForRole = (role: UserRole): ScreenId => {
    switch (role) {
      case 'store_manager':
      case 'store_staff':
      case 'pickup_executive':
      case 'delivery_executive':
      case 'quality_inspector':
      case 'inventory':
        return 'dashboard-store-manager';
      case 'owner':
      case 'franchise_owner':
      case 'area_manager':
      case 'regional_manager':
        return 'dashboard-owner';
      case 'ceo':
      case 'super_admin':
        return 'dashboard-ceo';
      case 'mis':
      case 'finance':
        return 'dashboard-mis';
      default:
        return 'home';
    }
  };

  const currentProf = profile || ROLE_PROFILES[currentRole];
  const userPortal = getDefaultPortalForRole(currentRole);

  const getPortalTitle = (s: ScreenId) => {
    switch (s) {
      case 'dashboard-owner': return 'Store Owner Dashboard';
      case 'dashboard-store-manager': return 'Store Manager Portal';
      case 'dashboard-ceo': return 'CEO Command Center';
      case 'dashboard-mis': return 'MIS Aggregated Portal';
      default: return 'Customer Portal';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-5 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-5 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-slate-900" />

        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[36px]">shield_lock</span>
        </div>

        <div>
          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
            RBAC ACCESS CONTROL MIDDLEWARE
          </span>
          <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
            Portal Access Restricted
          </h2>
          <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
            Your current account designation <strong className="text-slate-900 font-bold">({currentProf.tier})</strong> does not have permission to view the <strong className="text-slate-900 font-bold">{getPortalTitle(screen)}</strong>.
          </p>
        </div>

        {/* User Role Card Info */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={currentProf.avatarUrl}
              alt={currentProf.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
            />
            <div>
              <p className="text-xs font-bold text-slate-900">{currentProf.name}</p>
              <p className="text-[10px] text-amber-800 font-extrabold uppercase">{currentProf.tier}</p>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Assigned Portal:</span>
            <span className="font-bold text-slate-900">{getPortalTitle(userPortal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => onNavigate(userPortal)}
            className="flex-1 py-3 bg-slate-900 hover:bg-[#83633B] text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Return to My Portal</span>
          </button>

          <button
            onClick={() => onNavigate('role-login')}
            className="flex-1 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>Switch Persona</span>
          </button>
        </div>
      </div>
    </div>
  );
};
