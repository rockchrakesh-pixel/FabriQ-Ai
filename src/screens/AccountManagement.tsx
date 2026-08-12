import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { TermsAndConditionsModal } from '../components/TermsAndConditionsModal';
import { useNotifications } from '../context/NotificationContext';
import { FULL_CATALOG, ServiceImage } from './ServiceCatalog';
import { db, doc, getDoc, setDoc } from '../lib/firebase';
import {
  getBrandingSettings,
  updateBrandingSettings,
  subscribeBrandingSettings,
  BrandingSettings,
} from '../lib/assetManager';
import { AdminImageProcessor } from '../components/AdminImageProcessor';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AccountManagement: React.FC<ScreenProps> = ({ onNavigate }) => {
  const {
    user,
    profile,
    logout,
    resetPassword,
    mfaEnabled,
    mfaMethod,
    mfaRecoveryCodes,
    toggleMfa,
    triggerMfaChallenge,
    generateNewRecoveryCodes,
  } = useAuth();
  const { sendNotification } = useNotifications();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [codesList, setCodesList] = useState<string[]>(mfaRecoveryCodes);

  // Store Manager Branding Controls State
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(getBrandingSettings());
  const [isAdminProcessorOpen, setIsAdminProcessorOpen] = useState(false);

  React.useEffect(() => {
    return subscribeBrandingSettings(() => {
      setBrandingSettings(getBrandingSettings());
    });
  }, []);

  // FabriQ Rewards Firestore State
  const [rewardsPoints, setRewardsPoints] = useState<number>(2450);
  const [rewardsTier, setRewardsTier] = useState<string>('Gold Prestige Tier');
  const [rewardsLoading, setRewardsLoading] = useState<boolean>(true);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState<{
    smsOrderUpdates: boolean;
    emailReceipts: boolean;
    valetPickupAlerts: boolean;
    promoOffers: boolean;
    serviceReminders: boolean;
  }>({
    smsOrderUpdates: true,
    emailReceipts: true,
    valetPickupAlerts: true,
    promoOffers: true,
    serviceReminders: true,
  });

  // Saved Favorites State & Selection
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<string | null>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fabriq_favorite_services');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync Rewards, Notification Prefs & Favorites with Firestore
  React.useEffect(() => {
    const fetchUserData = async () => {
      const userId = user?.uid || profile?.id || 'customer_demo_uid';
      try {
        // Fetch Favorites
        const favDocRef = doc(db, 'user_favorites', userId);
        const favSnap = await getDoc(favDocRef);
        if (favSnap.exists()) {
          const data = favSnap.data();
          if (data && data.favorites) {
            setFavoritesMap(data.favorites);
            localStorage.setItem('fabriq_favorite_services', JSON.stringify(data.favorites));
          }
        }

        // Fetch Rewards
        const rewardsRef = doc(db, 'user_rewards', userId);
        const rewardsSnap = await getDoc(rewardsRef);
        if (rewardsSnap.exists()) {
          const rData = rewardsSnap.data();
          if (rData?.points !== undefined) setRewardsPoints(rData.points);
          if (rData?.tier) setRewardsTier(rData.tier);
        } else {
          // Initialize user rewards doc in Firestore
          await setDoc(rewardsRef, {
            userId,
            points: 2450,
            tier: 'Gold Prestige Tier',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }

        // Fetch Notification Preferences
        const notifRef = doc(db, 'user_notification_prefs', userId);
        const notifSnap = await getDoc(notifRef);
        if (notifSnap.exists()) {
          const nData = notifSnap.data();
          if (nData?.prefs) setNotifPrefs(nData.prefs);
        }
      } catch (err) {
        console.warn('Firestore user account data sync fallback:', err);
      } finally {
        setRewardsLoading(false);
      }
    };
    fetchUserData();
  }, [user, profile]);

  const toggleNotifPref = async (key: keyof typeof notifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      const userId = user?.uid || profile?.id || 'customer_demo_uid';
      const notifRef = doc(db, 'user_notification_prefs', userId);
      await setDoc(notifRef, { prefs: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore notification preference save fallback:', err);
    }
    sendNotification(
      'Notification Preferences Updated',
      `Your preference for ${String(key)} has been saved to Firestore.`,
      'system'
    );
  };

  const handleRedeemPoints = async (cost: number, perkName: string) => {
    if (rewardsPoints < cost) {
      sendNotification('Insufficient Loyalty Points', `You need ${cost} points to redeem ${perkName}.`, 'system');
      return;
    }
    const newBal = rewardsPoints - cost;
    setRewardsPoints(newBal);
    try {
      const userId = user?.uid || profile?.id || 'customer_demo_uid';
      const rewardsRef = doc(db, 'user_rewards', userId);
      await setDoc(rewardsRef, { points: newBal, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore points update fallback:', err);
    }
    sendNotification(
      'Loyalty Reward Redeemed!',
      `Successfully redeemed ${perkName} for ${cost} points. New balance: ${newBal} pts.`,
      'system'
    );
  };

  const toggleFavorite = async (itemId: string) => {
    const next = { ...favoritesMap, [itemId]: !favoritesMap[itemId] };
    setFavoritesMap(next);
    try {
      localStorage.setItem('fabriq_favorite_services', JSON.stringify(next));
      const userId = user?.uid || 'customer_demo_uid';
      const favDocRef = doc(db, 'user_favorites', userId);
      await setDoc(favDocRef, { favorites: next, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore favorite update fallback:', err);
    }
    sendNotification(
      next[itemId] ? 'Saved to Favorites (Firestore)' : 'Removed from Favorites',
      next[itemId] ? 'Item saved to your Firestore account profile.' : 'Item removed from your favorites.',
      'system'
    );
  };

  const favoriteItems = FULL_CATALOG.filter((item) => favoritesMap[item.id]);

  // Laundry preferences state
  const [starchLevel, setStarchLevel] = useState<'Medium' | 'Light' | 'No Starch'>('Medium');
  const [foldType, setFoldType] = useState<'Hanger' | 'Folded'>('Hanger');
  const [fragrance, setFragrance] = useState<'Organic Lavender' | 'Unscented'>('Organic Lavender');

  const handleSignOut = async () => {
    await logout();
    sendNotification('Signed Out', 'You have been safely signed out of your account.', 'system');
  };

  const handleToggleMfa = async (enabled: boolean) => {
    await toggleMfa(enabled, mfaMethod);
    sendNotification(
      enabled ? 'MFA Enabled' : 'MFA Disabled',
      enabled
        ? 'Multi-Factor Authentication is now actively safeguarding your account.'
        : 'Multi-Factor Authentication has been turned off.',
      'system'
    );
  };

  const handleMethodChange = async (method: 'authenticator' | 'sms' | 'email') => {
    await toggleMfa(true, method);
    sendNotification(
      'MFA Method Updated',
      `Primary 2-step verification method set to ${method.toUpperCase()}.`,
      'system'
    );
  };

  const handleRegenerateCodes = () => {
    const updated = generateNewRecoveryCodes();
    setCodesList(updated);
    sendNotification('Recovery Codes Regenerated', 'Your emergency backup codes have been refreshed.', 'system');
  };

  const handleTriggerReset = async () => {
    if (user?.email) {
      await resetPassword(user.email);
      setResetSent(true);
      sendNotification(
        'Password Reset Sent',
        `A secure password reset link was dispatched to ${user.email}.`,
        'system'
      );
    } else {
      setAuthMode('reset');
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto pb-36 pt-20 sm:pt-24 bg-[#FAFAFC] text-slate-900 font-sans">
      {/* Profile Header */}
      <div className="px-5 flex flex-col items-center pt-8 pb-6 bg-white border-b border-slate-200 shadow-2xs">
        {/* Brand Logo Highlight Badge */}
        <div className="flex items-center gap-2 mb-4 bg-slate-900 border border-[#9E7B4F]/40 px-3.5 py-1.5 rounded-full shadow-xs">
          <img
            src={fabriqLogo}
            alt="FabriQ Ai Crest"
            className="w-5 h-5 rounded-md object-cover"
          />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-sans">
            FabriQ Ai VIP Member Profile
          </span>
        </div>

        <div className="relative group">
          <img
            alt={profile?.name || 'User Profile'}
            className="w-24 h-24 rounded-full object-cover border-2 border-[#9E7B4F] shadow-md ring-4 ring-[#9E7B4F]/20"
            src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'}
          />
          <button
            onClick={() => onNavigate('update-profile-picture')}
            className="absolute bottom-0 right-0 z-20 bg-[#9E7B4F] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-[#83633B] transition-all cursor-pointer font-bold"
            aria-label="Edit Profile"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </button>
        </div>
        <div className="mt-3 text-center">
          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
            {profile?.role && profile.role !== 'customer' ? profile?.tier : (profile?.name || 'CH Rakesh')}
          </h1>
          <p className="text-xs font-bold text-[#9E7B4F] uppercase tracking-widest mt-0.5 font-sans flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">badge</span>
            <span>Designation: {profile?.tier || 'VIP PRESTIGE MEMBER'}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">{profile?.email || 'rakesh.ch@fabriq.ai'} • {profile?.storeLocation || 'Jubilee Hills'}</p>
        </div>

        {/* Auth status banner */}
        {!user ? (
          <div className="mt-4 w-full bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-600 mb-2 font-sans">Sign in to sync your garment orders & laundry preferences across devices.</p>
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthOpen(true);
              }}
              className="bg-[#9E7B4F] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#83633B] transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Sign In / Register</span>
            </button>
          </div>
        ) : (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Authenticated Account</span>
          </div>
        )}
      </div>

      {/* Subscription Status Card */}
      <div className="px-5 my-6">
        <div className="bg-slate-900 rounded-3xl p-5 relative overflow-hidden shadow-xl text-white border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1 font-sans">
                FABRIQ VIP CLUB TIER
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
                {profile?.tier || 'Prestige Membership'}
              </h2>
            </div>
            <span className="bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 uppercase tracking-wider font-sans">
              ACTIVE
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-sans">Renewal Date</span>
              <p className="text-xs font-bold text-white font-sans">Nov 12, 2026</p>
            </div>
            <button
              onClick={() => onNavigate('membership-plans')}
              className="flex items-center gap-1 text-amber-300 text-xs font-bold hover:underline transition-opacity cursor-pointer font-sans"
            >
              <span>Manage Plan</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* FABRIQ REWARDS COMPONENT (FIRESTORE SYNCED) */}
      <div className="px-5 mb-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 rounded-3xl p-5 border border-amber-400/40 shadow-xl text-white space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-start border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">workspace_premium</span>
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest font-sans">
                  FABRIQ LOYALTY REWARDS
                </span>
              </div>
              <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
                My Rewards & Tier Status
              </h3>
            </div>
            <span className="bg-amber-400/20 border border-amber-400/50 text-amber-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-sans">
              {rewardsTier}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 font-sans uppercase block">Points Balance</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-['Libre_Caslon_Text',serif] text-3xl font-black text-amber-300">
                  {rewardsLoading ? '...' : rewardsPoints.toLocaleString()}
                </span>
                <span className="text-xs text-amber-200 font-bold">PTS</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans uppercase block">Next Tier Goal</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white">
                  3,000
                </span>
                <span className="text-xs text-slate-400">PTS</span>
              </div>
              <p className="text-[9.5px] text-amber-300/80 mt-0.5 font-sans">
                {Math.max(0, 3000 - rewardsPoints)} pts to Platinum
              </p>
            </div>
          </div>

          {/* Progress Bar to Platinum */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-300 font-sans">
              <span>Gold Tier</span>
              <span>Platinum Tier</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-amber-400/30">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-200 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (rewardsPoints / 3000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Redeemable Reward Perks */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block font-sans">
              🎁 INSTANT REWARD REDEMPTION (FIRESTORE)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleRedeemPoints(500, '₹100 Off Voucher')}
                disabled={rewardsPoints < 500}
                className="bg-white/10 hover:bg-amber-400 hover:text-slate-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-slate-950 text-[11px]">₹100 Order Discount</p>
                  <span className="text-[9.5px] text-amber-300 group-hover:text-slate-900 block">500 Loyalty Points</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-amber-400 group-hover:text-slate-950">
                  redeem
                </span>
              </button>

              <button
                onClick={() => handleRedeemPoints(300, 'Free Valet Express')}
                disabled={rewardsPoints < 300}
                className="bg-white/10 hover:bg-amber-400 hover:text-slate-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-slate-950 text-[11px]">Free Valet Express</p>
                  <span className="text-[9.5px] text-amber-300 group-hover:text-slate-900 block">300 Loyalty Points</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-amber-400 group-hover:text-slate-950">
                  local_shipping
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION PREFERENCES SECTION (TOGGLES-BASED FIRESTORE SYNC) */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">notifications_active</span>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest font-sans">
                  COMMUNICATION SETTINGS
                </span>
              </div>
              <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Notification Preferences
              </h3>
            </div>
            <span className="bg-amber-100 text-[#83633B] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-sans">
              SMS & Email
            </span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {/* SMS Order Updates */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#83633B] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">SMS Order Updates</p>
                  <p className="text-[10px] text-slate-500">Instant SMS when laundry status changes or courier arrives</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotifPref('smsOrderUpdates')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  notifPrefs.smsOrderUpdates ? 'bg-[#9E7B4F]' : 'bg-slate-300'
                }`}
                title="Toggle SMS Order Updates"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifPrefs.smsOrderUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Email Receipts */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#83633B] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">Email Tax Invoices & Receipts</p>
                  <p className="text-[10px] text-slate-500">Receive downloadable PDF tax receipts on order completion</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotifPref('emailReceipts')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  notifPrefs.emailReceipts ? 'bg-[#9E7B4F]' : 'bg-slate-300'
                }`}
                title="Toggle Email Receipts"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifPrefs.emailReceipts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Valet GPS Alerts */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#83633B] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[18px]">my_location</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">Valet Pickup & Live GPS Alerts</p>
                  <p className="text-[10px] text-slate-500">Real-time alerts when valet captain approaches doorstep</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotifPref('valetPickupAlerts')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  notifPrefs.valetPickupAlerts ? 'bg-[#9E7B4F]' : 'bg-slate-300'
                }`}
                title="Toggle Valet GPS Alerts"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifPrefs.valetPickupAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Promo Offers */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#83633B] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[18px]">percent</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">VIP Promotional Offers & Discounts</p>
                  <p className="text-[10px] text-slate-500">Exclusive member promo codes, discounts and flash deals</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotifPref('promoOffers')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  notifPrefs.promoOffers ? 'bg-[#9E7B4F]' : 'bg-slate-300'
                }`}
                title="Toggle Promotional Offers"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifPrefs.promoOffers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Service & Fabric Care Reminders */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#83633B] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">Service & Garment Care Reminders</p>
                  <p className="text-[10px] text-slate-500">Automated alerts for seasonal wardrobe refresh, suit & silk care</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotifPref('serviceReminders')}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  notifPrefs.serviceReminders ? 'bg-[#9E7B4F]' : 'bg-slate-300'
                }`}
                title="Toggle Service Reminders"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notifPrefs.serviceReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Garment Care Stats */}
      <div className="px-5 flex gap-3 mb-6">
        <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="material-symbols-outlined text-[#9E7B4F] mb-1">dry_cleaning</span>
          <p className="text-[10px] text-slate-500 uppercase font-bold font-sans">Care Credits</p>
          <p className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
            {profile?.credits ?? 12}
          </p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="material-symbols-outlined text-[#9E7B4F] mb-1">loyalty</span>
          <p className="text-[10px] text-slate-500 uppercase font-bold font-sans">Garments Restored</p>
          <p className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
            {profile?.garmentsSaved ?? 48}
          </p>
        </div>
      </div>

      {/* SAVED FAVORITES SECTION */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="material-symbols-outlined text-rose-500 text-[18px]">favorite</span>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest font-sans">
                  SAVED FAVORITES ({favoriteItems.length})
                </span>
              </div>
              <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                My Favorite Garments & Services
              </h3>
            </div>
            <button
              onClick={() => onNavigate('service-catalog')}
              className="text-xs font-bold text-[#9E7B4F] hover:underline flex items-center gap-1 font-sans cursor-pointer"
            >
              <span>View Catalog</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {favoriteItems.length === 0 ? (
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 text-center">
              <span className="material-symbols-outlined text-amber-500 text-3xl mb-1 block">favorite_border</span>
              <p className="text-xs font-bold text-slate-800 font-sans">No Favorites Saved Yet</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-3 font-sans leading-relaxed">
                Explore our Rate Card and tap the ❤️ heart icon on any garment to save it here for instant re-ordering.
              </p>
              <button
                onClick={() => onNavigate('service-catalog')}
                className="bg-[#9E7B4F] hover:bg-[#83633B] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <span className="material-symbols-outlined text-[15px]">local_laundry_service</span>
                <span>Browse Service Catalog</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favoriteItems.map((item) => {
                const isSelected = selectedFavoriteId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFavoriteId(isSelected ? null : item.id)}
                    className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#9E7B4F] bg-amber-50/80 shadow-md ring-2 ring-[#9E7B4F]/30'
                        : 'border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 left-3 bg-[#9E7B4F] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs font-sans flex items-center gap-1 z-10">
                        <span className="material-symbols-outlined text-[10px]">check_circle</span>
                        Selected Favorite
                      </span>
                    )}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative border border-slate-200 shadow-2xs">
                      <ServiceImage
                        src={item.image}
                        alt={item.name}
                        category={item.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-extrabold uppercase text-[#9E7B4F] tracking-wider block font-sans">
                        {item.categoryLabel}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs truncate font-sans">{item.name}</h4>
                      <p className="text-[11px] font-black text-slate-800 mt-0.5 font-sans">
                        ₹{item.price} <span className="text-[9px] font-normal text-slate-500">{item.unit ? `/ ${item.unit}` : '/ pc'}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-all cursor-pointer"
                        title="Remove from Favorites"
                      >
                        <span className="material-symbols-outlined text-[16px]">favorite</span>
                      </button>
                      <button
                        onClick={() => onNavigate('service-catalog')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs font-sans ${
                          isSelected
                            ? 'bg-[#9E7B4F] text-white hover:bg-[#83633B]'
                            : 'bg-slate-900 text-amber-300 hover:bg-[#9E7B4F] hover:text-white'
                        }`}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FabriQ Style Laundry Preferences Section */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest font-sans">
              FABRIQ CUSTOM PREFERENCES
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 mt-0.5">
              Default Garment Care Options
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {/* Starch Level */}
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">Shirt Starch Preference</label>
              <div className="flex gap-2">
                {(['Medium', 'Light', 'No Starch'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStarchLevel(s)}
                    className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                      starchLevel === s
                        ? 'bg-[#9E7B4F] text-white border-[#9E7B4F] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Packaging Fold */}
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">Packaging Type</label>
              <div className="flex gap-2">
                {(['Hanger', 'Folded'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFoldType(f)}
                    className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                      foldType === f
                        ? 'bg-[#9E7B4F] text-white border-[#9E7B4F] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f} Pressing
                  </button>
                ))}
              </div>
            </div>

            {/* Fragrance */}
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">Eco Fragrance</label>
              <div className="flex gap-2">
                {(['Organic Lavender', 'Unscented'] as const).map((scent) => (
                  <button
                    key={scent}
                    onClick={() => setFragrance(scent)}
                    className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                      fragrance === scent
                        ? 'bg-[#9E7B4F] text-white border-[#9E7B4F] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {scent}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Factor Authentication (MFA / 2FA) Section */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="material-symbols-outlined text-[18px] text-[#9E7B4F]">verified_user</span>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest font-sans">
                  SECURITY & AUTHENTICATION
                </span>
              </div>
              <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                2-Step Multi-Factor Authentication (MFA)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans border ${
                  mfaEnabled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {mfaEnabled ? '✓ MFA ACTIVE' : '✕ MFA DISABLED'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Protect your FabriQ account and enterprise portals against unauthorized logins by requiring a secondary verification step (SMS OTP, Email, or Authenticator App).
          </p>

          {/* MFA Activation Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">shield_lock</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block font-sans">Enforce MFA Guard</span>
                <span className="text-[11px] text-slate-500 font-sans">Prompt 2nd factor on login & role switch</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleMfa(!mfaEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                mfaEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Primary Method Selection */}
          {mfaEnabled && (
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-sans">
                Primary 2FA Factor Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleMethodChange('sms')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer font-sans ${
                    mfaMethod === 'sms'
                      ? 'border-[#9E7B4F] bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#9E7B4F] block mb-1">
                    sms
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">SMS OTP</span>
                  <span className="text-[10px] text-slate-500 block">To Phone</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('email')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer font-sans ${
                    mfaMethod === 'email'
                      ? 'border-[#9E7B4F] bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#9E7B4F] block mb-1">
                    mark_email_read
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">Email OTP</span>
                  <span className="text-[10px] text-slate-500 block">To Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('authenticator')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer font-sans ${
                    mfaMethod === 'authenticator'
                      ? 'border-[#9E7B4F] bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#9E7B4F] block mb-1">
                    phone_iphone
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">Auth App</span>
                  <span className="text-[10px] text-slate-500 block">TOTP Passcode</span>
                </button>
              </div>

              {/* Recovery Codes Action & Test MFA */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                  <span>{showRecoveryCodes ? 'Hide Recovery Codes' : 'View Emergency Backup Codes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerMfaChallenge()}
                  className="bg-[#9E7B4F] hover:bg-[#83633B] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Test MFA Challenge Now</span>
                </button>
              </div>

              {/* Recovery Codes Grid */}
              {showRecoveryCodes && (
                <div className="p-4 bg-slate-900 text-amber-300 rounded-2xl border border-[#9E7B4F]/40 space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                      EMERGENCY BACKUP RECOVERY CODES
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateCodes}
                      className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      <span>Regenerate Codes</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Keep these codes stored safely. Each code can be used once if you lose access to your phone or authenticator app.
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold">
                    {codesList.map((code, idx) => (
                      <div key={idx} className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 text-center text-white">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STORE MANAGER BRANDING & ASSET PROCESSING CONTROLS */}
      <div className="px-5 mb-6">
        <div className="bg-slate-900 border border-amber-400/30 rounded-3xl p-5 text-slate-100 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <span className="material-symbols-outlined text-[20px]">center_focus_strong</span>
              </div>
              <div>
                <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-widest font-mono">
                  STORE MANAGER STUDIO
                </span>
                <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                  Global Branding & Asset Controls
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsAdminProcessorOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Catalog Studio</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Control global catalog presentation. Toggle the 'FabriQ' luxury watermark overlay and automated model face shielding across all product thumbnails.
          </p>

          <div className="space-y-2.5 pt-1 font-sans">
            {/* Global Watermark Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/90 border border-slate-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-300 text-[20px]">watermark</span>
                <div>
                  <p className="font-bold text-slate-100 text-xs">Global 'FabriQ' Watermark</p>
                  <p className="text-[10px] text-slate-400">Overlay luxury semi-transparent watermark on catalog images</p>
                </div>
              </div>
              <button
                onClick={() => updateBrandingSettings({ watermarkVisible: !brandingSettings.watermarkVisible })}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  brandingSettings.watermarkVisible ? 'bg-amber-400' : 'bg-slate-700'
                }`}
                title="Toggle Global Watermark"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    brandingSettings.watermarkVisible ? 'translate-x-5 bg-slate-950' : 'translate-x-0 bg-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* Global Face Mask Shield Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/90 border border-slate-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-300 text-[20px]">face_retouching_off</span>
                <div>
                  <p className="font-bold text-slate-100 text-xs">Model Face Removal Shield</p>
                  <p className="text-[10px] text-slate-400">Automatically mask model faces to focus strictly on apparel details</p>
                </div>
              </div>
              <button
                onClick={() => updateBrandingSettings({ strictFaceMasking: !brandingSettings.strictFaceMasking })}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  brandingSettings.strictFaceMasking ? 'bg-amber-400' : 'bg-slate-700'
                }`}
                title="Toggle Face Mask Shield"
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    brandingSettings.strictFaceMasking ? 'translate-x-5 bg-slate-950' : 'translate-x-0 bg-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* Global Brand Label Tag Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/90 border border-slate-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-300 text-[20px]">label</span>
                <div>
                  <p className="font-bold text-slate-100 text-xs">Garment Collar Brand Tag</p>
                  <p className="text-[10px] text-slate-400">Display 'FabriQ' luxury tag badge on image bottom-left</p>
                </div>
              </div>
              <button
                onClick={() => updateBrandingSettings({ brandTagVisible: !brandingSettings.brandTagVisible })}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  brandingSettings.brandTagVisible ? 'bg-amber-400' : 'bg-slate-700'
                }`}
                title="Toggle Brand Label Tag"
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    brandingSettings.brandTagVisible ? 'translate-x-5 bg-slate-950' : 'translate-x-0 bg-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* Hidden QA Mode Verification Inspector Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-red-950/40 border border-red-500/40 mt-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-400 text-[20px]">policy</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-red-200 text-xs">QA Mode Red-Box Inspection</p>
                    <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded font-mono">QA INSPECTOR</span>
                  </div>
                  <p className="text-[10px] text-red-300/80">Draw red bounding box on thumbnails missing branding or headless face mask</p>
                </div>
              </div>
              <button
                onClick={() => updateBrandingSettings({ qaModeEnabled: !brandingSettings.qaModeEnabled })}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  brandingSettings.qaModeEnabled ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-700'
                }`}
                title="Toggle QA Mode Inspection"
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform ${
                    brandingSettings.qaModeEnabled ? 'translate-x-5 bg-white' : 'translate-x-0 bg-slate-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences & Security Actions */}
      <div className="px-5 space-y-3 mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
          ACCOUNT & SECURITY
        </h3>

        {resetSent && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 font-sans font-bold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Password reset link sent to your email!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('update-profile-picture')}
            className="bg-white rounded-2xl p-4 flex flex-col items-start gap-2 shadow-xs border border-slate-200 hover:border-[#9E7B4F] transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#9E7B4F]">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </div>
            <span className="text-xs font-bold text-slate-900 font-sans">Profile Photo</span>
          </button>

          <button
            onClick={() => onNavigate('service-address')}
            className="bg-white rounded-2xl p-4 flex flex-col items-start gap-2 shadow-xs border border-slate-200 hover:border-[#9E7B4F] transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#9E7B4F]">
              <span className="material-symbols-outlined text-[18px]">map</span>
            </div>
            <span className="text-xs font-bold text-slate-900 font-sans">Saved Addresses</span>
          </button>

          <button
            onClick={handleTriggerReset}
            className="bg-white rounded-2xl p-4 flex flex-col items-start gap-2 shadow-xs border border-slate-200 hover:border-[#9E7B4F] transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#9E7B4F]">
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            </div>
            <span className="text-xs font-bold text-slate-900 font-sans">Reset Password</span>
          </button>

          <button
            onClick={() => setIsTermsOpen(true)}
            className="bg-white rounded-2xl p-4 flex flex-col items-start gap-2 shadow-xs border border-slate-200 hover:border-[#9E7B4F] transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#9E7B4F]">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </div>
            <span className="text-xs font-bold text-slate-900 font-sans">Terms & Conditions</span>
          </button>
        </div>

        {user && (
          <button
            onClick={handleSignOut}
            className="w-full mt-4 bg-rose-50 border border-rose-200 text-rose-700 font-bold py-3 rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-sans"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        )}
      </div>

      <BottomNav activePath="account" onNavigate={onNavigate} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        showAcceptButton={true}
      />

      <AdminImageProcessor
        isOpen={isAdminProcessorOpen}
        onClose={() => setIsAdminProcessorOpen(false)}
      />
    </div>
  );
};
