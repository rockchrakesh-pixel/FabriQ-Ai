import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useDivision } from '../context/DivisionContext';
import { useBranch } from '../context/BranchContext';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../lib/haptics';
import { ScrollProgressBar } from './ScrollProgressBar';
import { DivisionSelectorModal } from './DivisionSelectorModal';
import { BranchSelectorModal } from './BranchSelectorModal';
import { InstantBookingChatbotModal } from './InstantBookingChatbotModal';

export interface GlobalHeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showDivisionSelector?: boolean;
  showBranchSelector?: boolean;
}

/**
 * GlobalHeader: Canonical customer-facing and enterprise navigation header for FabriQ.
 * Enforces exact FabriQ brand wordmark ("Fabri" Milky White + "Q" Metallic Gold),
 * Deep Navy surface (#0B1528), metallic gold accent divider, and seamless contextual navigation.
 */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  currentScreen,
  onNavigate,
  title,
  showBack,
  onBack,
  showDivisionSelector = true,
  showBranchSelector = true,
}) => {
  const { unreadCount } = useNotifications();
  const { currentRole } = useAuth();
  const { division, setShowSelectorModal } = useDivision();
  const { activeBranch, setShowBranchModal } = useBranch();
  const { theme, toggleTheme } = useTheme();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
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

  useEffect(() => {
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

  const isCustomerPortal =
    ['home', 'service-catalog', 'cart', 'my-orders', 'account', 'service-address', 'payment-success', 'order-receipt', 'order-tracking', 'live-order-tracking', 'boutique-fitting', 'bespoke-tailor', 'luxury-store', 'membership-plans', 'confirm-addon'].includes(
      currentScreen
    );

  const getDivisionLabel = () => {
    switch (division) {
      case 'boutique':
        return 'Boutique';
      case 'luxury_store':
        return 'Cloth Store';
      case 'laundry':
      default:
        return 'Laundry';
    }
  };

  const getDivisionIcon = () => {
    switch (division) {
      case 'boutique':
        return 'checkroom';
      case 'luxury_store':
        return 'shopping_bag';
      case 'laundry':
      default:
        return 'dry_cleaning';
    }
  };

  const shouldShowBack = showBack !== undefined ? showBack : currentScreen !== 'home';

  return (
    <>
      <ScrollProgressBar />
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1528]/95 backdrop-blur-xl border-b-2 border-[#C29C6D]/40 shadow-xl transition-all duration-300">
        {/* Subtle Gold Gradient Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-90 pointer-events-none" />

        <div className="h-16 px-3 sm:px-6 flex items-center justify-between max-w-7xl mx-auto gap-2 w-full min-w-0">
          {/* Left section: Back button & FabriQ Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            {shouldShowBack && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  if (onBack) onBack();
                  else onNavigate('home');
                }}
                className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#070F1E] text-[#FAF9F6] hover:text-[#D4AF37] border border-[#C29C6D]/40 hover:border-[#D4AF37] transition-all cursor-pointer shadow-md shrink-0 active:scale-95"
                aria-label="Back to Home or Previous Page"
                title="Go Back"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            )}

            {/* FabriQ Canonical Wordmark */}
            <div
              onClick={() => {
                triggerHaptic('medium');
                onNavigate('home');
              }}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              title="FabriQ — Return to Home"
            >
              {/* Luxury Crown Emblem */}
              <div className="w-8 h-8 rounded-xl bg-[#070F1E] border border-[#C29C6D]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] transition-all shadow-xs">
                <svg viewBox="0 0 100 65" className="w-5 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 52 L90 52 L88 62 L12 62 Z" fill="#C29C6D" />
                  <path d="M12 52 L8 28 L28 42 L50 14 L72 42 L92 28 L88 52 Z" fill="#D4AF37" stroke="#FFF1B8" strokeWidth="1.5" />
                  <circle cx="8" cy="27" r="3" fill="#FFF9E6" />
                  <circle cx="28" cy="41" r="2.5" fill="#FFF9E6" />
                  <circle cx="50" cy="13" r="3.5" fill="#FFF9E6" />
                  <circle cx="72" cy="41" r="2.5" fill="#FFF9E6" />
                  <circle cx="92" cy="27" r="3" fill="#FFF9E6" />
                </svg>
              </div>

              {/* Exact Brand Typographic Wordmark: Milky White 'Fabri' + Metallic Gold 'Q' */}
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline">
                  <span className="font-['Libre_Caslon_Text',serif] text-xl sm:text-2xl font-bold tracking-tight text-[#FAF9F6]">
                    Fabri
                  </span>
                  <span className="font-['Libre_Caslon_Text',serif] text-xl sm:text-2xl font-black text-[#D4AF37] ml-[0.5px]">
                    Q
                  </span>
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-extrabold uppercase tracking-[0.2em] text-[#C29C6D] mt-0.5">
                  LUXURY CARE
                </span>
              </div>
            </div>

            {/* Division Switcher Pill (Optional / Contextual) */}
            {showDivisionSelector && isCustomerPortal && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowSelectorModal(true);
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-bold transition-all border border-[#C29C6D]/40 bg-[#070F1E] text-[#E5C07B] hover:border-[#D4AF37] shadow-sm cursor-pointer"
                title="Switch Division (Laundry, Boutique, Cloth Store)"
              >
                <span className="material-symbols-outlined text-[16px]">{getDivisionIcon()}</span>
                <span>{getDivisionLabel()}</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">unfold_more</span>
              </button>
            )}

            {/* Branch Selector Pill */}
            {showBranchSelector && isCustomerPortal && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowBranchModal(true);
                }}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] bg-[#070F1E] text-[#FAF9F6] hover:text-[#D4AF37] rounded-xl text-xs font-medium border border-[#C29C6D]/30 shadow-sm cursor-pointer"
                title="Select Store Branch"
              >
                <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">storefront</span>
                <span className="truncate max-w-[110px]">{activeBranch.city}</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
              </button>
            )}
          </div>

          {/* Center Title (when on dedicated screen) */}
          {title && (
            <div className="hidden sm:flex items-center justify-center min-w-0 px-2">
              <span className="font-['Libre_Caslon_Text',serif] text-sm md:text-base font-bold text-[#FAF9F6] truncate">
                {title}
              </span>
            </div>
          )}

          {/* Right Action Navigation Bar: Home, Services, Orders, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop Navigation Links for Customer Journey */}
            <div className="hidden xl:flex items-center gap-1 border-r border-[#C29C6D]/20 pr-2 mr-1">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentScreen === 'home'
                    ? 'bg-[#070F1E] text-[#D4AF37] border border-[#C29C6D]/50 shadow-xs'
                    : 'text-slate-300 hover:text-[#FAF9F6] hover:bg-[#070F1E]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                <span>Home</span>
              </button>

              <button
                onClick={() => onNavigate('service-catalog')}
                className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentScreen === 'service-catalog'
                    ? 'bg-[#070F1E] text-[#D4AF37] border border-[#C29C6D]/50 shadow-xs'
                    : 'text-slate-300 hover:text-[#FAF9F6] hover:bg-[#070F1E]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dry_cleaning</span>
                <span>Services</span>
              </button>

              <button
                onClick={() => onNavigate('my-orders')}
                className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentScreen === 'my-orders'
                    ? 'bg-[#070F1E] text-[#D4AF37] border border-[#C29C6D]/50 shadow-xs'
                    : 'text-slate-300 hover:text-[#FAF9F6] hover:bg-[#070F1E]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>Orders</span>
              </button>

              <button
                onClick={() => onNavigate('account')}
                className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentScreen === 'account'
                    ? 'bg-[#070F1E] text-[#D4AF37] border border-[#C29C6D]/50 shadow-xs'
                    : 'text-slate-300 hover:text-[#FAF9F6] hover:bg-[#070F1E]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                <span>Account</span>
              </button>
            </div>

            {/* Quick Search Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onNavigate('service-catalog');
              }}
              className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-[#FAF9F6] rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-all cursor-pointer"
              title="Search Services Catalog"
              aria-label="Search Services"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Cart Button with Live Item Count */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onNavigate('cart');
              }}
              className="relative w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FAF9F6] rounded-2xl bg-[#070F1E] border border-[#C29C6D]/40 hover:border-[#D4AF37] transition-all cursor-pointer"
              title="Shopping Cart"
              aria-label="View Cart"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scaleUp">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Account / Profile Shortcut Button for Mobile/Tablet */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onNavigate('account');
              }}
              className="xl:hidden w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-[#FAF9F6] rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-all cursor-pointer"
              title="My Account"
              aria-label="Account"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-2xl bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-all cursor-pointer flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Division Selector Modal */}
      <DivisionSelectorModal />

      {/* Branch Selector Modal */}
      <BranchSelectorModal />

      {/* Instant AI Booking Chatbot Modal */}
      <InstantBookingChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onNavigate={(screen) => {
          setIsChatbotOpen(false);
          onNavigate(screen);
        }}
      />
    </>
  );
};
