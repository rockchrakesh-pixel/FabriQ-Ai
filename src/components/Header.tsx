import React, { useState } from 'react';
import { ScreenId } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useDivision } from '../context/DivisionContext';
import { useBranch } from '../context/BranchContext';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../lib/haptics';
import { ScrollProgressBar } from './ScrollProgressBar';
import { AuthModal } from './AuthModal';
import { InstantBookingChatbotModal } from './InstantBookingChatbotModal';
import { GeminiStudioModal } from './GeminiStudioModal';
import { BranchSelectorModal } from './BranchSelectorModal';
import { FabriQAiLogoFramed } from './FabriQAiLogoFramed';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  title,
  showBack,
  onBack,
  onOpenOnboarding,
}) => {
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const { user, profile, currentRole } = useAuth();
  const { division, setShowSelectorModal } = useDivision();
  const { activeBranch, setShowBranchModal } = useBranch();
  const { theme, toggleTheme } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isGeminiStudioOpen, setIsGeminiStudioOpen] = useState(false);
  const [isLogoZoomed, setIsLogoZoomed] = useState(false);
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fabriq_cart_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.reduce((a: number, b: any) => a + (b.qty || 1), 0);
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  React.useEffect(() => {
    const syncCart = () => {
      try {
        const saved = localStorage.getItem('fabriq_cart_items');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCartCount(parsed.reduce((a: number, b: any) => a + (b.qty || 1), 0));
            return;
          }
        }
      } catch {
        // ignore
      }
      setCartCount(0);
    };
    syncCart();
    const interval = setInterval(syncCart, 1000);
    window.addEventListener('storage', syncCart);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  return (
    <>
      <ScrollProgressBar />
      <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-[#0F0F18]/95 backdrop-blur-xl pt-safe border-b border-[#9E7B4F]/30 shadow-xs transition-all duration-300">
        <div className="h-14 px-3 sm:px-5 flex items-center justify-between max-w-7xl mx-auto gap-2">
          
          {/* Left section: Back button (if available) + ALWAYS VISIBLE BRAND LOGO */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {showBack && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  if (onBack) onBack(); else onNavigate('home');
                }}
                className="btn-press w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                aria-label="Back"
                title="Go Back"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
            )}

            <div className="shrink-0 flex items-center">
              <FabriQAiLogoFramed
                size="md"
                showSubtitle={true}
                onClick={() => {
                  triggerHaptic('medium');
                  onNavigate('home');
                }}
              />
            </div>

            {/* Division Switcher Selector Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowSelectorModal(true);
              }}
              className={`btn-press flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all border shadow-xs cursor-pointer ${
                division === 'laundry'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-[#83633B] dark:text-amber-300 border-amber-200/80 dark:border-amber-700/60 hover:bg-amber-100'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
              }`}
              title="Click to Switch Division"
            >
              <span className="material-symbols-outlined text-[14px]">
                {division === 'laundry' ? 'dry_cleaning' : 'checkroom'}
              </span>
              <span className="hidden xl:inline">
                {division === 'laundry' ? 'Laundry' : 'BotiQue'}
              </span>
              <span className="material-symbols-outlined text-[13px] text-slate-400">unfold_more</span>
            </button>

            {/* Multi-Branch Selector Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowBranchModal(true);
              }}
              className="btn-press flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-amber-300 hover:bg-slate-800 rounded-full text-[11px] font-bold border border-amber-400/50 shadow-2xs cursor-pointer"
              title="Select Store Branch Network"
            >
              <span className="material-symbols-outlined text-[14px] text-amber-400">storefront</span>
              <span className="truncate max-w-[90px] sm:max-w-[120px] font-sans">
                {activeBranch.city}
              </span>
              <span className="material-symbols-outlined text-[13px] text-amber-300/80">expand_more</span>
            </button>
          </div>

          {/* Right section: AI Fabric Advisor, Theme Toggle, Search, Cart & Profile */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* AI Fabric Advisor Shortcut Button (Only for Operational & Staff Roles, Hidden for Customers) */}
            {currentRole !== 'customer' && (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onNavigate('ai-fabric-advisor');
                }}
                className="btn-press px-2 py-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-full shadow-xs text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-amber-300"
                title="Launch AI Fabric Advisor for Stain Analysis & Fabric Care"
              >
                <span className="material-symbols-outlined text-[15px]">dry_cleaning</span>
                <span className="hidden lg:inline">AI Fabric Advisor</span>
              </button>
            )}

            {/* Instant AI Booking Chatbot Button */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsChatbotOpen(true);
              }}
              className="btn-press px-2 py-1 bg-slate-900 text-amber-300 hover:text-white rounded-full border border-amber-400/80 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Instant AI Booking Chatbot"
            >
              <span className="material-symbols-outlined text-[14px] text-amber-300">smart_toy</span>
              <span className="hidden xl:inline">AI Chatbot</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn-press p-1.5 rounded-full bg-amber-50 dark:bg-slate-800 text-[#83633B] dark:text-amber-300 border border-amber-200 dark:border-amber-400/30 hover:brightness-110 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Service Search */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onNavigate('service-catalog');
              }}
              className="btn-press p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Search Services Catalog"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onNavigate('cart');
              }}
              className="btn-press relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Shopping Cart"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-slate-200 text-slate-600 font-bold text-[8px] rounded-full flex items-center justify-center border border-white">
                  0
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-1.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center px-1 border-2 border-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* App Entrance Walkthrough Button */}
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#83633B] rounded-full border border-amber-300 text-[12px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title="Launch App Entrance, Service Slides & OTP Walkthrough"
              >
                <span className="material-symbols-outlined text-[14px] text-[#9E7B4F]">border_color</span>
                <span className="hidden lg:inline">App Entrance</span>
              </button>
            )}

            {/* Role Switcher Button */}
            <button
              onClick={() => onNavigate('role-login')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-full border border-[#9E7B4F]/50 text-[12px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Switch Roles & Dashboards (Customer, Manager, Owner, CEO, MIS)"
            >
              <span className="material-symbols-outlined text-[14px] text-amber-400">admin_panel_settings</span>
              <span className="hidden md:inline">Roles</span>
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => onNavigate('account')}
              className="group relative focus:outline-none flex items-center gap-1.5 pl-1 cursor-pointer"
              aria-label="Account Management"
            >
              <img
                alt={profile?.name || 'User Profile'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#9E7B4F]/40 group-hover:ring-[#9E7B4F] transition-all"
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Instant AI Booking Chatbot Modal */}
      <InstantBookingChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Gemini AI Intelligence Studio Suite Modal */}
      <GeminiStudioModal
        isOpen={isGeminiStudioOpen}
        onClose={() => setIsGeminiStudioOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode="login"
      />

      {/* Branch Selector Modal */}
      <BranchSelectorModal />
    </>
  );
};
