import React, { useState } from 'react';
import { useAuth, ROLE_PROFILES } from '../context/AuthContext';
import { ScreenId, UserRole } from '../types';
import { TermsAndConditionsModal } from '../components/TermsAndConditionsModal';
import { FabriQAiLogoFramed } from '../components/FabriQAiLogoFramed';
import { BiometricAuthModal } from '../components/BiometricAuthModal';

interface RoleLoginProps {
  onNavigate: (screen: ScreenId) => void;
}

const ROLES_CONFIG: {
  role: UserRole;
  title: string;
  badge: string;
  icon: string;
  desc: string;
  targetDashboard: ScreenId;
  bgGradient: string;
}[] = [
  {
    role: 'customer',
    title: 'Customer Portal',
    badge: 'Prestige Member',
    icon: 'person',
    desc: 'Doorstep fabric care, garment vault, order tracking, and rate card.',
    targetDashboard: 'home',
    bgGradient: 'from-amber-50 to-orange-50 border-amber-200',
  },
  {
    role: 'pickup_executive',
    title: 'Pickup Executive Portal',
    badge: 'Logistics Fleet',
    icon: 'local_shipping',
    desc: 'Assigned customer pickup routes, geo-location tagging & bag intake.',
    targetDashboard: 'dashboard-store-manager',
    bgGradient: 'from-blue-50 to-indigo-50 border-blue-200',
  },
  {
    role: 'delivery_executive',
    title: 'Delivery Executive Portal',
    badge: 'Express Delivery',
    icon: 'two_wheeler',
    desc: 'Out for delivery manifest, cash/UPI collection & customer signature.',
    targetDashboard: 'dashboard-store-manager',
    bgGradient: 'from-emerald-50 to-teal-50 border-emerald-200',
  },
  {
    role: 'store_staff',
    title: 'Store Staff Portal',
    badge: 'Front Desk',
    icon: 'badge',
    desc: 'Garment intake counter, barcode RFID scanning & billing receipts.',
    targetDashboard: 'dashboard-store-manager',
    bgGradient: 'from-sky-50 to-cyan-50 border-sky-200',
  },
  {
    role: 'quality_inspector',
    title: 'Quality Inspector Portal',
    badge: 'Studio Hydrocarbon',
    icon: 'fact_check',
    desc: 'AI stain verification, fabric silk safety check & final packaging QC.',
    targetDashboard: 'dashboard-store-manager',
    bgGradient: 'from-purple-50 to-pink-50 border-purple-200',
  },
  {
    role: 'store_manager',
    title: 'Store Manager Portal',
    badge: 'Branch Manager',
    icon: 'storefront',
    desc: 'Live garment intake queue, RFID tagging, machine logs & dispatch.',
    targetDashboard: 'dashboard-store-manager',
    bgGradient: 'from-sky-50 to-blue-50 border-sky-200',
  },
  {
    role: 'area_manager',
    title: 'Area Manager Portal',
    badge: 'Cluster Overseer',
    icon: 'map',
    desc: 'Cluster store performance, inventory transfer & staff allocations.',
    targetDashboard: 'dashboard-owner',
    bgGradient: 'from-teal-50 to-emerald-50 border-teal-200',
  },
  {
    role: 'regional_manager',
    title: 'Regional Manager Portal',
    badge: 'Regional Director',
    icon: 'public',
    desc: 'Regional revenue, store expansions, regional pricing & SLAs.',
    targetDashboard: 'dashboard-owner',
    bgGradient: 'from-indigo-50 to-purple-50 border-indigo-200',
  },
  {
    role: 'mis',
    title: 'MIS Analytics Portal',
    badge: 'System & Database',
    icon: 'analytics',
    desc: 'Unified multi-dashboard feed, database stream, revenue reconciliation & exports.',
    targetDashboard: 'dashboard-mis',
    bgGradient: 'from-slate-100 to-amber-50/50 border-slate-300',
  },
  {
    role: 'finance',
    title: 'Finance Portal',
    badge: 'Accounts & GST',
    icon: 'account_balance_wallet',
    desc: 'GST tax invoices, revenue audits, bank payouts & operating expenses.',
    targetDashboard: 'dashboard-mis',
    bgGradient: 'from-amber-50 to-yellow-50 border-amber-200',
  },
  {
    role: 'inventory',
    title: 'Inventory Portal',
    badge: 'Supply Chain',
    icon: 'inventory_2',
    desc: 'Eco detergent stock levels, hanger inventory & reorder alerts.',
    targetDashboard: 'dashboard-store-manager',
    bgGradient: 'from-orange-50 to-amber-50 border-orange-200',
  },
  {
    role: 'franchise_owner',
    title: 'Franchise Owner Portal',
    badge: 'Franchise Partner',
    icon: 'store',
    desc: 'Franchise monthly royalty, store P&L, customer review metrics.',
    targetDashboard: 'dashboard-owner',
    bgGradient: 'from-emerald-50 to-teal-50 border-emerald-200',
  },
  {
    role: 'owner',
    title: 'Owner Portal',
    badge: 'Franchise P&L',
    icon: 'account_balance',
    desc: 'Multi-store revenue, operating margin, detergent usage & store yield.',
    targetDashboard: 'dashboard-owner',
    bgGradient: 'from-emerald-50 to-teal-50 border-emerald-200',
  },
  {
    role: 'ceo',
    title: 'CEO Portal',
    badge: 'Executive Suite',
    icon: 'crown',
    desc: 'Enterprise ARR, valuation, AI model precision, expansion roadmap & KPIs.',
    targetDashboard: 'dashboard-ceo',
    bgGradient: 'from-purple-50 to-slate-50 border-purple-200',
  },
  {
    role: 'super_admin',
    title: 'Super Admin Portal',
    badge: 'Root System',
    icon: 'admin_panel_settings',
    desc: 'Full system database access, security audit logs, cloud infrastructure.',
    targetDashboard: 'dashboard-ceo',
    bgGradient: 'from-slate-200 to-rose-50 border-slate-400',
  },
];

export const RoleLogin: React.FC<RoleLoginProps> = ({ onNavigate }) => {
  const { login, switchRole, triggerMfaChallenge, mfaEnabled, mfaMethod } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');
  const [pendingNavigate, setPendingNavigate] = useState<ScreenId | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  const proceedNavigation = (targetDashboard: ScreenId) => {
    if (localStorage.getItem('fabriq_terms_accepted') !== 'true') {
      setPendingNavigate(targetDashboard);
      setShowTerms(true);
    } else {
      onNavigate(targetDashboard);
    }
  };

  const handleQuickLogin = (role: UserRole, targetDashboard: ScreenId) => {
    setIsLoading(true);
    setTimeout(() => {
      switchRole(role);
      setIsLoading(false);
      triggerMfaChallenge(() => proceedNavigation(targetDashboard));
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const config = ROLES_CONFIG.find((r) => r.role === selectedRole);
      login(email || ROLE_PROFILES[selectedRole].email, password || 'password123', selectedRole);
      setIsLoading(false);
      triggerMfaChallenge(() => proceedNavigation(config ? config.targetDashboard : 'home'));
    }, 500);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-16 pb-28 bg-[#FAFAFC] text-slate-900 font-sans">
      {/* Hero Branding Header */}
      <div className="px-5 pt-8 pb-8 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950 text-white border-b border-[#9E7B4F]/40 shadow-xl">
        <div className="max-w-xl mx-auto text-center space-y-4">
          {/* Prominent High-Impact Logo Crest */}
          <div className="flex flex-col items-center justify-center gap-2">
            <FabriQAiLogoFramed size="lg" showSubtitle={true} className="mb-1" />
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-300">
              <span className="material-symbols-outlined text-[14px]">security</span>
              <span>2FA / Multi-Factor Authentication (MFA) Protected</span>
            </div>
          </div>

          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Role-Based Enterprise Portals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Select your enterprise persona below to access customized operational, financial, executive, or customer dashboards.
          </p>

          {/* Mode Switcher Pills */}
          <div className="flex flex-wrap justify-center items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 mt-2">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-[#9E7B4F] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ 1-Click Role Access
            </button>
            <button
              onClick={() => setShowBiometric(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">fingerprint</span>
              <span>Biometric Vault Login</span>
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-[#9E7B4F] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔒 Password
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-5 mt-6 space-y-6">
        {activeTab === 'quick' ? (
          /* 1-Click Persona Cards */
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest">
                SELECT ENTERPRISE PERSONA
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                5 Active Dashboards Ready
              </span>
            </div>

            {ROLES_CONFIG.map((item) => {
              const prof = ROLE_PROFILES[item.role];
              return (
                <div
                  key={item.role}
                  className={`bg-white rounded-2xl p-4 border shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 ${item.bgGradient}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={prof.avatarUrl}
                        alt={prof.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-2xs">
                        <span className="material-symbols-outlined text-[13px]">
                          {item.icon}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 truncate">
                          {item.title.replace(' Portal', '')}
                        </h3>
                        <span className="bg-slate-900 text-[#9E7B4F] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#9E7B4F] font-semibold truncate mt-0.5">
                        Designation: {prof.tier}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickLogin(item.role, item.targetDashboard)}
                    disabled={isLoading}
                    className="shrink-0 bg-[#9E7B4F] hover:bg-[#83633B] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Login</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Form Login */
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Role Portal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES_CONFIG.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.role);
                      setEmail(ROLE_PROFILES[r.role].email);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedRole === r.role
                        ? 'border-[#9E7B4F] bg-amber-50/80 font-bold text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[16px] text-[#9E7B4F]">
                        {r.icon}
                      </span>
                      <span className="truncate">{r.badge}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {ROLE_PROFILES[r.role].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                value={email || ROLE_PROFILES[selectedRole].email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#9E7B4F] outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#9E7B4F] outline-none text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl shadow-md border border-[#9E7B4F]/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-amber-300">lock_open</span>
                  <span className="text-xs uppercase tracking-wider">
                    Authenticate as {ROLE_PROFILES[selectedRole].name}
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security & System Status Banner */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-[#9E7B4F]/40 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9E7B4F]/20 text-amber-300 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="text-xs">
            <span className="font-bold text-amber-300 uppercase tracking-wider block text-[10px]">
              SECURE FABRIQ AI OAUTH & DATA PIPELINE
            </span>
            <p className="text-slate-300 font-medium mt-0.5">
              All 5 roles share unified real-time Firestore synchronization. Actions in Store Manager update MIS, Owner, and CEO dashboards instantaneously.
            </p>
          </div>
        </div>
      </div>

      <TermsAndConditionsModal
        isOpen={showTerms}
        onClose={() => {
          setShowTerms(false);
          if (pendingNavigate) onNavigate(pendingNavigate);
        }}
        onAccept={() => {
          setShowTerms(false);
          if (pendingNavigate) onNavigate(pendingNavigate);
        }}
        showAcceptButton={true}
      />

      <BiometricAuthModal
        isOpen={showBiometric}
        onClose={() => setShowBiometric(false)}
        onSuccess={(method) => {
          setShowBiometric(false);
          handleQuickLogin('customer', 'home');
        }}
        clientName="Prestige Member"
      />
    </div>
  );
};
