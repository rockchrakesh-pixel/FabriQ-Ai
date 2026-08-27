import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranch, Branch } from '../context/BranchContext';
import {
  BranchOperationalConfig,
  DynamicServiceDefinition,
  getBranchConfig,
  saveBranchConfig,
  getDynamicServiceDefinitions,
  saveDynamicServiceDefinitions,
  subscribeEnterpriseConfig,
} from '../lib/enterpriseConfigManager';
import { triggerHaptic } from '../lib/haptics';
import { useNotifications } from '../context/NotificationContext';

interface EnterpriseConfigProps {
  onClose?: () => void;
  targetBranchId?: string;
}

export const EnterpriseConfiguration: React.FC<EnterpriseConfigProps> = ({
  onClose,
  targetBranchId,
}) => {
  const { currentRole, user, profile } = useAuth();
  const { branches, activeBranch } = useBranch();
  const { sendNotification } = useNotifications();

  // Role permissions
  const canSwitchBranch = ['super_admin', 'ceo', 'owner', 'regional_manager', 'area_manager'].includes(
    currentRole
  );

  const initialBranchId =
    targetBranchId || (canSwitchBranch ? activeBranch.id : (profile as any)?.branchId || activeBranch.id);

  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId);
  const selectedBranchObj =
    branches.find((b) => b.id === selectedBranchId) || activeBranch;

  // Active Tab within Configuration Panel
  const [configTab, setConfigTab] = useState<'branch' | 'turnaround' | 'hours' | 'services'>('branch');

  // Form states
  const [branchConfig, setBranchConfig] = useState<BranchOperationalConfig>(() =>
    getBranchConfig(selectedBranchId, selectedBranchObj.name)
  );
  const [servicesList, setServicesList] = useState<DynamicServiceDefinition[]>(() =>
    getDynamicServiceDefinitions()
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when selectedBranchId changes
  useEffect(() => {
    const freshBranch = branches.find((b) => b.id === selectedBranchId) || activeBranch;
    setBranchConfig(getBranchConfig(selectedBranchId, freshBranch.name));
  }, [selectedBranchId, branches, activeBranch]);

  // Subscribe to external updates
  useEffect(() => {
    return subscribeEnterpriseConfig(() => {
      const freshBranch = branches.find((b) => b.id === selectedBranchId) || activeBranch;
      setBranchConfig(getBranchConfig(selectedBranchId, freshBranch.name));
      setServicesList(getDynamicServiceDefinitions());
    });
  }, [selectedBranchId, branches, activeBranch]);

  const handleBranchChange = (branchId: string) => {
    triggerHaptic('light');
    setSelectedBranchId(branchId);
    setStatusMessage(null);
  };

  const handleSaveAll = async () => {
    triggerHaptic('medium');
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const actor = profile?.name || user?.email || currentRole.toUpperCase();
      
      const resBranch = await saveBranchConfig(branchConfig, actor);
      const resServices = await saveDynamicServiceDefinitions(servicesList, actor);

      if (resBranch && resServices) {
        setStatusMessage({
          type: 'success',
          text: `Branch settings & service turnaround successfully updated for ${selectedBranchObj.name}!`,
        });
        sendNotification(
          'Enterprise Configuration Updated',
          `Operational availability and service turnaround times published for ${selectedBranchObj.name}.`,
          'system'
        );
        triggerHaptic('heavy');
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to update branch configuration. Please check network logs.',
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e?.message || 'Error occurred while saving configurations.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceFieldChange = (
    id: string,
    field: keyof DynamicServiceDefinition,
    value: any
  ) => {
    setServicesList((prev) =>
      prev.map((srv) => (srv.id === id ? { ...srv, [field]: value } : srv))
    );
  };

  return (
    <div className="bg-[#0B1528] rounded-3xl border-2 border-[#C29C6D]/40 shadow-2xl p-5 sm:p-7 text-[#FAF9F6] font-sans w-full max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C29C6D]/20 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#E5C07B] text-[#0B1528] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest">
              ENTERPRISE RBAC SCOPED
            </span>
            <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">tune</span>
              ADMIN CONFIGURATION
            </span>
          </div>
          <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-[#FAF9F6]">
            Branch & Service Operational Matrix
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Configure atelier addresses, service turnaround SLAs, and daily booking availability windows.
          </p>
        </div>

        {/* Branch Scoper */}
        <div className="flex items-center gap-2">
          {canSwitchBranch ? (
            <div className="flex flex-col">
              <label className="text-[9px] font-bold text-[#E5C07B] uppercase tracking-wider mb-1">
                Target Atelier Scope
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="bg-[#070F1E] border border-[#C29C6D]/50 text-[#E5C07B] text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-[#D4AF37] cursor-pointer min-h-[44px]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-[#070F1E] border border-[#C29C6D]/30 px-3.5 py-2 rounded-xl text-xs">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Assigned Branch</span>
              <span className="font-bold text-[#E5C07B]">{selectedBranchObj.name}</span>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#070F1E] border border-[#C29C6D]/30 text-slate-300 hover:text-white hover:border-[#D4AF37] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close configuration"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#C29C6D]/20 pb-2">
        {[
          { id: 'branch', label: 'Branch Details & Contact', icon: 'storefront' },
          { id: 'turnaround', label: 'Service Turnaround SLAs', icon: 'timer' },
          { id: 'hours', label: 'Operational Availability Hours', icon: 'schedule' },
          { id: 'services', label: 'Service Catalog Metadata', icon: 'category' },
        ].map((tab) => {
          const isActive = configTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setConfigTab(tab.id as any);
              }}
              className={`px-4 min-h-[44px] rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] shadow-md font-black'
                  : 'bg-[#070F1E] text-slate-300 border border-[#C29C6D]/30 hover:border-[#D4AF37]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500 text-rose-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: BRANCH DETAILS & CONTACT */}
      {configTab === 'branch' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                Branch Atelier Name
              </label>
              <input
                type="text"
                value={branchConfig.branchName}
                onChange={(e) => setBranchConfig({ ...branchConfig, branchName: e.target.value })}
                className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                Operational Status
              </label>
              <select
                value={branchConfig.operatingStatus}
                onChange={(e) =>
                  setBranchConfig({
                    ...branchConfig,
                    operatingStatus: e.target.value as any,
                  })
                }
                className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Active">Active & Taking Orders</option>
                <option value="Under Maintenance">Under Maintenance (Offline Mode)</option>
                <option value="Temporary Closed">Temporarily Closed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                Address Line 1 (Street & Landmark)
              </label>
              <input
                type="text"
                value={branchConfig.addressLine1}
                onChange={(e) => setBranchConfig({ ...branchConfig, addressLine1: e.target.value })}
                className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                Address Line 2 (Area & Locality)
              </label>
              <input
                type="text"
                value={branchConfig.addressLine2}
                onChange={(e) => setBranchConfig({ ...branchConfig, addressLine2: e.target.value })}
                className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                  City
                </label>
                <input
                  type="text"
                  value={branchConfig.city}
                  onChange={(e) => setBranchConfig({ ...branchConfig, city: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                  State
                </label>
                <input
                  type="text"
                  value={branchConfig.state}
                  onChange={(e) => setBranchConfig({ ...branchConfig, state: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                  Pincode
                </label>
                <input
                  type="text"
                  value={branchConfig.pincode}
                  onChange={(e) => setBranchConfig({ ...branchConfig, pincode: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                Direct Phone Hotline
              </label>
              <input
                type="text"
                value={branchConfig.phone}
                onChange={(e) => setBranchConfig({ ...branchConfig, phone: e.target.value })}
                className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider block">
                Atelier Concierge Email
              </label>
              <input
                type="email"
                value={branchConfig.email}
                onChange={(e) => setBranchConfig({ ...branchConfig, email: e.target.value })}
                className="w-full bg-[#070F1E] border border-[#C29C6D]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE TURNAROUND SLAS */}
      {configTab === 'turnaround' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Define guaranteed customer delivery return windows (in hours) calculated from doorstep intake.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FAF9F6]">Standard Wash & Iron</span>
                <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">local_laundry_service</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={6}
                  max={72}
                  value={branchConfig.turnaroundStandardHours}
                  onChange={(e) =>
                    setBranchConfig({
                      ...branchConfig,
                      turnaroundStandardHours: parseInt(e.target.value) || 24,
                    })
                  }
                  className="w-24 bg-[#0B1528] border border-[#C29C6D]/50 text-[#E5C07B] text-base font-black px-3 py-2 rounded-xl text-center focus:border-[#D4AF37]"
                />
                <span className="text-xs text-slate-300 font-bold">Hours SLA</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Default baseline: 24 hours</span>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FAF9F6]">Haute Couture Dry Clean</span>
                <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">dry_cleaning</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={12}
                  max={96}
                  value={branchConfig.turnaroundDryCleanHours}
                  onChange={(e) =>
                    setBranchConfig({
                      ...branchConfig,
                      turnaroundDryCleanHours: parseInt(e.target.value) || 48,
                    })
                  }
                  className="w-24 bg-[#0B1528] border border-[#C29C6D]/50 text-[#E5C07B] text-base font-black px-3 py-2 rounded-xl text-center focus:border-[#D4AF37]"
                />
                <span className="text-xs text-slate-300 font-bold">Hours SLA</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Default baseline: 48 hours</span>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FAF9F6]">VIP Express Overdrive</span>
                <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">bolt</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={4}
                  max={24}
                  value={branchConfig.turnaroundExpressHours}
                  onChange={(e) =>
                    setBranchConfig({
                      ...branchConfig,
                      turnaroundExpressHours: parseInt(e.target.value) || 12,
                    })
                  }
                  className="w-24 bg-[#0B1528] border border-[#C29C6D]/50 text-[#E5C07B] text-base font-black px-3 py-2 rounded-xl text-center focus:border-[#D4AF37]"
                />
                <span className="text-xs text-slate-300 font-bold">Hours SLA</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Fast-track priority queue</span>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FAF9F6]">Bespoke Tailoring & Alteration</span>
                <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">design_services</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={24}
                  max={168}
                  value={branchConfig.turnaroundTailoringHours}
                  onChange={(e) =>
                    setBranchConfig({
                      ...branchConfig,
                      turnaroundTailoringHours: parseInt(e.target.value) || 72,
                    })
                  }
                  className="w-24 bg-[#0B1528] border border-[#C29C6D]/50 text-[#E5C07B] text-base font-black px-3 py-2 rounded-xl text-center focus:border-[#D4AF37]"
                />
                <span className="text-xs text-slate-300 font-bold">Hours SLA</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Master artisan fitting window</span>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FAF9F6]">Leather Spa & Restoration</span>
                <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">shopping_bag</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={48}
                  max={240}
                  value={branchConfig.turnaroundRestorationHours}
                  onChange={(e) =>
                    setBranchConfig({
                      ...branchConfig,
                      turnaroundRestorationHours: parseInt(e.target.value) || 96,
                    })
                  }
                  className="w-24 bg-[#0B1528] border border-[#C29C6D]/50 text-[#E5C07B] text-base font-black px-3 py-2 rounded-xl text-center focus:border-[#D4AF37]"
                />
                <span className="text-xs text-slate-300 font-bold">Hours SLA</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Curing & conditioning timeline</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL AVAILABILITY HOURS */}
      {configTab === 'hours' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-3">
              <span className="text-xs font-extrabold text-[#E5C07B] uppercase tracking-wider block">
                Weekday Store Operations (Mon - Sat)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={branchConfig.weekdayOpeningTime}
                    onChange={(e) =>
                      setBranchConfig({ ...branchConfig, weekdayOpeningTime: e.target.value })
                    }
                    className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={branchConfig.weekdayClosingTime}
                    onChange={(e) =>
                      setBranchConfig({ ...branchConfig, weekdayClosingTime: e.target.value })
                    }
                    className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#E5C07B] uppercase tracking-wider block">
                  Sunday Operations
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branchConfig.isSundayOpen}
                    onChange={(e) =>
                      setBranchConfig({ ...branchConfig, isSundayOpen: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <span className="text-xs font-bold text-slate-300">Open on Sunday</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">
                    Weekend Open
                  </label>
                  <input
                    type="text"
                    value={branchConfig.weekendOpeningTime}
                    onChange={(e) =>
                      setBranchConfig({ ...branchConfig, weekendOpeningTime: e.target.value })
                    }
                    disabled={!branchConfig.isSundayOpen}
                    className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">
                    Weekend Close
                  </label>
                  <input
                    type="text"
                    value={branchConfig.weekendClosingTime}
                    onChange={(e) =>
                      setBranchConfig({ ...branchConfig, weekendClosingTime: e.target.value })
                    }
                    disabled={!branchConfig.isSundayOpen}
                    className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2">
              <span className="text-xs font-extrabold text-[#E5C07B] uppercase tracking-wider block">
                Daily Valet Doorstep Cutoff
              </span>
              <p className="text-[11px] text-slate-400">
                Bookings created after this time are scheduled for morning pickup the next day.
              </p>
              <input
                type="text"
                value={branchConfig.valetPickupCutoffTime}
                onChange={(e) =>
                  setBranchConfig({ ...branchConfig, valetPickupCutoffTime: e.target.value })
                }
                className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2.5 text-xs text-white font-bold"
              />
            </div>

            <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2">
              <span className="text-xs font-extrabold text-[#E5C07B] uppercase tracking-wider block">
                Same-Day Dispatch Cutoff
              </span>
              <p className="text-[11px] text-slate-400">
                Guarantees evening valet delivery for orders processed before this threshold.
              </p>
              <input
                type="text"
                value={branchConfig.sameDayDeliveryCutoffTime}
                onChange={(e) =>
                  setBranchConfig({ ...branchConfig, sameDayDeliveryCutoffTime: e.target.value })
                }
                className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2.5 text-xs text-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE CATALOG METADATA */}
      {configTab === 'services' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Dynamically configure service titles, pricing formulas, and eligibility parameters synced in real time to customer catalog screens.
          </p>

          <div className="space-y-3">
            {servicesList.map((srv) => (
              <div
                key={srv.id}
                className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#E5C07B] text-[#0B1528]">
                      {srv.category}
                    </span>
                    <input
                      type="text"
                      value={srv.name}
                      onChange={(e) => handleServiceFieldChange(srv.id, 'name', e.target.value)}
                      className="bg-[#0B1528] border border-[#C29C6D]/40 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={srv.isActive}
                      onChange={(e) => handleServiceFieldChange(srv.id, 'isActive', e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37]"
                    />
                    <span className={`text-xs font-bold ${srv.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {srv.isActive ? 'Active Service' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <textarea
                  rows={2}
                  value={srv.description}
                  onChange={(e) => handleServiceFieldChange(srv.id, 'description', e.target.value)}
                  className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                />

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-[#E5C07B] block uppercase mb-1">
                      Base Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={srv.basePrice}
                      onChange={(e) =>
                        handleServiceFieldChange(srv.id, 'basePrice', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-[#E5C07B] block uppercase mb-1">
                      Turnaround (Hrs)
                    </label>
                    <input
                      type="number"
                      value={srv.turnaroundHours}
                      onChange={(e) =>
                        handleServiceFieldChange(srv.id, 'turnaroundHours', parseInt(e.target.value) || 24)
                      }
                      className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-[#E5C07B] block uppercase mb-1">
                      Express Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={srv.expressPriceMultiplier}
                      onChange={(e) =>
                        handleServiceFieldChange(
                          srv.id,
                          'expressPriceMultiplier',
                          parseFloat(e.target.value) || 1.5
                        )
                      }
                      className="w-full bg-[#0B1528] border border-[#C29C6D]/40 rounded-xl p-2 text-xs font-bold text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#C29C6D]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          Last saved: {new Date(branchConfig.updatedAt).toLocaleString()} by {branchConfig.updatedBy}
        </span>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              triggerHaptic('light');
              setBranchConfig(getBranchConfig(selectedBranchId, selectedBranchObj.name));
              setServicesList(getDynamicServiceDefinitions());
              setStatusMessage({ type: 'success', text: 'Settings reset to last saved state.' });
            }}
            className="flex-1 sm:flex-none px-4 min-h-[44px] rounded-2xl bg-[#070F1E] border border-[#C29C6D]/40 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 min-h-[44px] rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSaving ? 'sync' : 'save'}
            </span>
            <span>{isSaving ? 'Publishing Matrix...' : 'Save & Publish Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
