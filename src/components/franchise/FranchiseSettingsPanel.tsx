import React, { useState } from 'react';
import { triggerHaptic } from '../../lib/haptics';

export interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  category: 'inventory' | 'audit' | 'finance' | 'sla' | 'leads';
  enabled: boolean;
  channel: 'push' | 'sms' | 'email' | 'all';
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    id: 'low_stock',
    title: 'Low-Stock Safety Inventory Alerts',
    description: 'Instant notification when Hydrocare chemical, luxury hanger, or garment cover stock falls below 15%.',
    category: 'inventory',
    enabled: true,
    channel: 'push',
  },
  {
    id: 'audit_reminders',
    title: 'Franchise Compliance & Audit Reminders',
    description: 'Scheduled alerts for bi-weekly chemical safety, equipment maintenance, and ISO hygiene audits.',
    category: 'audit',
    enabled: true,
    channel: 'push',
  },
  {
    id: 'royalty_debit',
    title: 'Royalty Auto-Debit & Statement Notices',
    description: 'Real-time alerts prior to monthly 5% gross royalty auto-debit and invoice generation.',
    category: 'finance',
    enabled: true,
    channel: 'all',
  },
  {
    id: 'sla_breach',
    title: 'Quality SLA & Customer Re-Clean Breach Alerts',
    description: 'Urgent notifications if garment turnaround delays exceed 4 hours or re-cleaning exceeds 2%.',
    category: 'sla',
    enabled: true,
    channel: 'push',
  },
  {
    id: 'b2b_leads',
    title: 'Corporate & VIP Garment Lead Notifications',
    description: 'Instant alerts when luxury hotel or boutique concierge leads register for Banjara/Jubilee Hills.',
    category: 'leads',
    enabled: false,
    channel: 'push',
  },
];

export const FranchiseSettingsPanel: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(() => {
    try {
      const saved = localStorage.getItem('fabriq_franchise_notif_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [masterPush, setMasterPush] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const savePreferences = (updated: NotificationPreference[]) => {
    setPreferences(updated);
    try {
      localStorage.setItem('fabriq_franchise_notif_prefs', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTogglePref = (id: string) => {
    triggerHaptic('impactLight');
    const updated = preferences.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    savePreferences(updated);
    const toggledItem = updated.find((p) => p.id === id);
    if (toggledItem) {
      setToastMessage(
        `"${toggledItem.title}" updated to ${toggledItem.enabled ? 'ENABLED' : 'DISABLED'}.`
      );
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleChannelChange = (id: string, channel: NotificationPreference['channel']) => {
    triggerHaptic('selection');
    const updated = preferences.map((p) =>
      p.id === id ? { ...p, channel } : p
    );
    savePreferences(updated);
    setToastMessage(`Notification channel updated to ${channel.toUpperCase()}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleMaster = () => {
    triggerHaptic('notificationSuccess');
    const nextMaster = !masterPush;
    setMasterPush(nextMaster);
    const updated = preferences.map((p) => ({ ...p, enabled: nextMaster }));
    savePreferences(updated);
    setToastMessage(
      nextMaster
        ? 'All Franchise Owner push notifications turned ON.'
        : 'All Franchise Owner push notifications PAUSED.'
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-[#9E7B4F]/50 shadow-xl space-y-6 font-sans text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notice */}
      {toastMessage && (
        <div className="bg-amber-950 text-amber-200 border border-amber-400/50 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[18px]">notifications_active</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-amber-400 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              OWNER CONTROL CENTER
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              Real-time FCM Push Active
            </span>
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white mt-1">
            Franchisee Push Notification Preferences
          </h3>
          <p className="text-xs text-slate-300">
            Configure automated owner alerts for low chemical stock, compliance audits, SLA breaches & financial debits.
          </p>
        </div>

        {/* Master Switch Button */}
        <button
          onClick={handleToggleMaster}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md shrink-0 border ${
            masterPush
              ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {masterPush ? 'notifications_active' : 'notifications_off'}
          </span>
          <span>{masterPush ? 'All Push Alerts ON' : 'Pause All Alerts'}</span>
        </button>
      </div>

      {/* Notification Toggle Cards Grid */}
      <div className="space-y-4">
        {preferences.map((pref) => (
          <div
            key={pref.id}
            className={`p-4 rounded-2xl border transition-all ${
              pref.enabled
                ? 'bg-slate-950 border-amber-400/40 shadow-md'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      pref.enabled ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {pref.category === 'inventory'
                      ? 'inventory_2'
                      : pref.category === 'audit'
                      ? 'fact_check'
                      : pref.category === 'finance'
                      ? 'payments'
                      : pref.category === 'sla'
                      ? 'speed'
                      : 'contacts'}
                  </span>
                  <h4 className="font-bold text-white text-sm">{pref.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">{pref.description}</p>
              </div>

              {/* Right Controls: Channel Selector + Toggle Switch */}
              <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {/* Channel Dropdown */}
                <select
                  disabled={!pref.enabled}
                  value={pref.channel}
                  onChange={(e) =>
                    handleChannelChange(pref.id, e.target.value as NotificationPreference['channel'])
                  }
                  className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-mono disabled:opacity-40 focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="push">Mobile Push Only</option>
                  <option value="sms">SMS Priority</option>
                  <option value="email">Email Digest</option>
                  <option value="all">Push + SMS + Email</option>
                </select>

                {/* Toggle Switch Pill */}
                <button
                  type="button"
                  onClick={() => handleTogglePref(pref.id)}
                  className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    pref.enabled ? 'bg-amber-400' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-slate-950 w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      pref.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-amber-400 text-[16px]">security</span>
        <span>Notification tokens are encrypted and routed directly through FabriQ Operations Server.</span>
      </div>
    </div>
  );
};
