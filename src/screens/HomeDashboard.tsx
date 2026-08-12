import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useDivision } from '../context/DivisionContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { InstantBookingChatbotModal } from '../components/InstantBookingChatbotModal';
import { GoogleReviewDiscountTicker } from '../components/GoogleReviewDiscountTicker';
import { QuickScheduleWidget } from '../components/QuickScheduleWidget';
import { GarmentHealthSection } from '../components/GarmentHealthSection';
import { FabricCareAdvisorModal } from '../components/FabricCareAdvisorModal';
import { FabriQAiLogoFramed } from '../components/FabriQAiLogoFramed';
import { triggerHaptic } from '../lib/haptics';

import luxurySteamIronImg from '../assets/images/luxury_steam_iron_1785775317071.jpg';
const fabriqShoeSpaImg = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop';
import fabriqCarpetCleaningImg from '../assets/images/fabriq_carpet_cleaning_1786023022765.jpg';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

const HERO_SLIDES = [
  {
    id: 'dry_cleaning',
    title: '1. Premium Dry Cleaning',
    subtitle: 'Hydrocarbon zero-odor solvent for couture, sarees & designer wear',
    badge: 'ITALIAN SOLVENT CARE',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    actionText: 'Book Dry Cleaning',
    category: 'Dry Cleaning',
    priceTag: 'From ₹70',
    icon: 'dry_cleaning',
  },
  {
    id: 'wash_fold',
    title: '2. Wash & Fold • Pure Hydro',
    subtitle: 'Hypoallergenic organic eco-detergents for daily soft cottons',
    badge: 'ECO HYDROPURITY',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=1200&auto=format&fit=crop',
    actionText: 'Book Wash & Fold',
    category: 'Wash & Fold',
    priceTag: 'From ₹69/kg',
    icon: 'local_laundry_service',
  },
  {
    id: 'steam_ironing',
    title: '3. Italian Steam Ironing',
    subtitle: 'Vacuum suction board pressing for crisp formals & dresses',
    badge: 'VACUUM STEAM PRESS',
    image: luxurySteamIronImg,
    actionText: 'Book Steam Press',
    category: 'Steam Ironing',
    priceTag: 'From ₹15/pc',
    icon: 'iron',
  },
  {
    id: 'suit_care',
    title: '4. Luxury Suit Care & Bespoke Pressing',
    subtitle: 'Bespoke hand-finishing, lapel roll press & cedar wood hanger',
    badge: 'EXECUTIVE BESPOKE',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    actionText: 'Book Suit Care',
    category: 'Suit Care',
    priceTag: 'From ₹299',
    icon: 'styler',
  },
  {
    id: 'sneaker_leather',
    title: '5. Sneaker Spa & Leather Restoration',
    subtitle: 'Suede shampooing, sole whitening, conditioning & UV sanitization',
    badge: 'SNEAKER & LEATHER SPA',
    image: fabriqShoeSpaImg,
    actionText: 'Book Shoe & Leather Spa',
    category: 'Sneaker & Leather',
    priceTag: 'From ₹250',
    icon: 'steps',
  },
  {
    id: 'home_express',
    title: '6. Sofa, Carpet, Curtains & Express Valet',
    subtitle: 'In-home extraction cleaning & 4-Hour express doorstep return',
    badge: 'HOME CARE & EXPRESS',
    image: fabriqCarpetCleaningImg,
    actionText: 'Book Home Care & Express',
    category: 'Carpet & Sofa',
    priceTag: '4HR Return Available',
    icon: 'curtains',
  },
];

export const HomeDashboard: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { division, setShowSelectorModal } = useDivision();
  const { activeBranch, setShowBranchModal, detectGPSLocation, isDetectingGPS } = useBranch();
  const { profile, currentRole } = useAuth();
  const { getUserOrders } = useOrders();
  const userOrdersList = getUserOrders(profile?.email || profile?.name);
  const activeOrder = userOrdersList.find((o) => o.status !== 'Delivered' && o.status !== 'Cancelled') || userOrdersList[0];
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppService, setWhatsAppService] = useState('');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFabricAdvisorOpen, setIsFabricAdvisorOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showLaunchMarquee, setShowLaunchMarquee] = useState(true);
  const [showMoreSection, setShowMoreSection] = useState(false);


  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  const openWhatsAppWith = (serviceName: string) => {
    setWhatsAppService(serviceName);
    setIsWhatsAppOpen(true);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen font-sans relative">
      {/* Temporary 'FabriQ Go-Live' Marquee Notification Bar */}
      {showLaunchMarquee && (
        <div className="bg-gradient-to-r from-amber-500 via-slate-900 to-amber-600 text-amber-300 py-1.5 px-3 flex items-center justify-between shadow-md border-b border-amber-400/40 text-[11px] font-bold overflow-hidden relative">
          <div className="flex items-center gap-2 shrink-0 bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider shadow-xs z-10">
            <span>✨ GO-LIVE OFFER</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap mx-2 relative w-full">
            <div className="inline-block animate-marquee tracking-wide text-white font-medium">
              <span>🚀 <strong className="text-amber-300">Free Doorstep Pickup & Drop</strong>: 5 km radius on ₹799+ | 10 km extended radius on ₹2,599+</span>
              <span className="mx-4 text-amber-400">•</span>
              <span>⚡ <strong className="text-amber-300">24-Hour Express Hydrocarbon Care</strong> Available</span>
              <span className="mx-4 text-amber-400">•</span>
              <span>🌟 <strong className="text-amber-300">₹15 Steam Ironing</strong> Self Drop Option</span>
              <span className="mx-4 text-amber-400">•</span>
              <span>💎 Claim <strong className="text-amber-300">50% OFF</strong> with Code <u className="decoration-amber-400 font-extrabold text-amber-300">FABRIQ50</u></span>
            </div>
          </div>

          <button
            onClick={() => setShowLaunchMarquee(false)}
            className="shrink-0 w-5 h-5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10 ml-1"
            title="Dismiss Announcement"
          >
            <span className="material-symbols-outlined text-[13px]">close</span>
          </button>
        </div>
      )}

      {/* Gold & White Scrolling Offer Marquee Banner */}
      <GoogleReviewDiscountTicker

        onApplyDiscount={(code) => {
          openWhatsAppWith(`Claim 5% Discount Code: ${code}`);
        }}
      />

      {/* Sleek Compact Header (Reduced height by ~20% for above-the-fold content) */}
      <section className="px-5 pt-2 pb-1.5">
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 text-white rounded-2xl px-3.5 py-2.5 shadow-lg border border-[#9E7B4F]/40">
          <div className="flex items-center gap-2.5">
            {/* Framed Arched Gold Brand Logo */}
            <FabriQAiLogoFramed size="sm" variant="light" showSubtitle={true} />
            <div className="hidden sm:flex flex-col pl-2 border-l border-amber-400/30 justify-center">
              <span className="bg-amber-400/20 text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-amber-400/40 w-max mb-0.5">
                {division === 'laundry' ? 'LUXURY CARE' : 'BOTIQUE FIT'}
              </span>
              <p className="text-[10.5px] text-slate-300 font-medium">
                Welcome, <span className="text-amber-300 font-bold">{profile?.name || 'Valued Guest'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSelectorModal(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
            title="Switch Division"
          >
            <span className="material-symbols-outlined text-[13px]">
              {division === 'laundry' ? 'dry_cleaning' : 'checkroom'}
            </span>
            <span>Switch</span>
            <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
          </button>
        </div>
      </section>

      {/* GPS AUTO-DETECTION & STORE BRANCH CARD */}
      <section className="px-5 my-1.5">
        <div className="bg-white rounded-2xl p-3 border border-amber-400/40 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              onClick={() => detectGPSLocation()}
              className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/50 cursor-pointer hover:bg-slate-800 transition-colors"
              title="Detect my GPS Location"
            >
              <span className={`material-symbols-outlined text-[18px] ${isDetectingGPS ? 'animate-spin' : ''}`}>
                my_location
              </span>
            </div>

            <div className="min-w-0 flex-1" onClick={() => setShowBranchModal(true)}>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold text-[#9E7B4F] uppercase tracking-wider">
                  NEAREST FABRIQ AI STORE
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1 py-0.2 rounded uppercase">
                  {activeBranch.city}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                <span>{activeBranch.name}</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-sans truncate">{activeBranch.address}</p>
            </div>
          </div>

          <button
            onClick={() => setShowBranchModal(true)}
            className="bg-amber-50 text-[#83633B] px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-0.5 border border-amber-200 shrink-0 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <span>Change</span>
            <span className="material-symbols-outlined text-[13px]">expand_more</span>
          </button>
        </div>
      </section>

      {/* QUICK ACTIONS STRIP: TRACK MY ORDER, BOOK VALET & MORE DRAWER */}
      <section className="px-5 my-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onNavigate('live-order-tracking')}
            className="p-2.5 bg-slate-900 text-white rounded-2xl border border-amber-400/40 shadow-md hover:bg-slate-800 transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold mb-1">
              <span className="material-symbols-outlined text-[18px] animate-pulse">location_on</span>
            </div>
            <div className="text-left">
              <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider block">GPS</span>
              <span className="text-[11px] font-bold text-white block leading-tight">Live Track</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('schedule-pickup')}
            className="p-2.5 bg-gradient-to-br from-amber-500 to-[#9E7B4F] text-slate-950 rounded-2xl border border-amber-300 shadow-md hover:from-amber-400 hover:to-[#83633B] transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-300 flex items-center justify-center font-bold mb-1">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
            <div className="text-left">
              <span className="text-[8px] font-black text-slate-900 uppercase tracking-wider block">VALET</span>
              <span className="text-[11px] font-black text-slate-950 block leading-tight">Book Pickup</span>
            </div>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setShowMoreSection(true);
            }}
            className="p-2.5 bg-white dark:bg-[#12121C] text-slate-900 dark:text-white rounded-2xl border border-[#9E7B4F]/40 shadow-md hover:border-[#9E7B4F] transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#9E7B4F] dark:text-amber-300 flex items-center justify-center font-bold mb-1">
              <span className="material-symbols-outlined text-[18px]">apps</span>
            </div>
            <div className="text-left">
              <span className="text-[8px] font-black text-[#9E7B4F] uppercase tracking-wider block">MORE</span>
              <span className="text-[11px] font-bold block leading-tight">Atelier Tools</span>
            </div>
          </button>
        </div>
      </section>

      {/* ROTATING LUXURY SERVICE CATEGORY HERO BANNERS */}
      <section className="px-5 my-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest">
              FEATURED LUXURY SERVICES (1 TO 6)
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {currentSlideIndex + 1} / {HERO_SLIDES.length}
          </span>
        </div>

        {/* Main Banner Card */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/70 shadow-xl group bg-slate-900 transition-all">
          {/* Main Slide Image */}
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/20" />

            {/* Slide Category Badge & Price Tag */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
              <div className="bg-slate-900/95 text-amber-400 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-amber-400/60 tracking-wider shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{currentSlide.badge}</span>
              </div>
              <div className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                {currentSlide.priceTag}
              </div>
            </div>

            {/* Manual Slide Controls (Previous & Next Arrows) */}
            <div className="absolute inset-y-0 left-2 right-2 flex justify-between items-center pointer-events-none">
              <button
                onClick={() => setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer pointer-events-auto"
                title="Previous Service Banner"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer pointer-events-auto"
                title="Next Service Banner"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Slide Indicators Dots */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-full border border-white/10">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIndex ? 'bg-amber-400 w-4' : 'bg-white/40 w-2'
                  }`}
                />
              ))}
            </div>

            {/* Slide Text Content Overlay */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h3 className="font-['Libre_Caslon_Text',serif] text-base sm:text-lg font-bold text-white drop-shadow-md leading-tight">
                {currentSlide.title}
              </h3>
              <p className="text-[11px] text-amber-200/90 font-sans line-clamp-1 mb-2">
                {currentSlide.subtitle}
              </p>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem('fabriq_preselected_service', currentSlide.category);
                    onNavigate('schedule-pickup');
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer fabriq-glow"
                >
                  <span>{currentSlide.actionText}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>

                <button
                  onClick={() => openWhatsAppWith(`Inquire: ${currentSlide.title}`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                  title="Instant Chat Inquiry"
                >
                  <span className="material-symbols-outlined text-[15px]">chat</span>
                  <span className="hidden xs:inline">Instant Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EASY CUSTOMER BANNER SELECTION STRIP (6 Quick Selector Pills) */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border shadow-2xs ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-900 to-amber-950 text-amber-300 border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                }`}
              >
                <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-amber-400' : 'text-[#9E7B4F]'}`}>
                  {slide.icon}
                </span>
                <span>{slide.category}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* FABRIQ CLUB MEMBERSHIP & LOYALTY CARD */}
      <section className="px-5 my-3">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-4 border border-amber-400/50 shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:10px_10px] opacity-20 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold shadow-inner shrink-0">
              <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">
                  FABRIQ CLUB • GOLD TIER
                </span>
                <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                  VIP ACTIVE
                </span>
              </div>
              <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                1,250 Reward Points
              </h4>
              <p className="text-[10px] text-slate-300">
                10% Off All Dry Cleaning + Priority Express Slots
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('membership-plans')}
            className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer border border-amber-300"
          >
            Redeem
          </button>
        </div>
      </section>

      {/* HIGHLIGHT BANNER: ₹15 SELF DROP & PICKUP STEAM IRONING */}
      <section className="px-5 my-3">
        <div className="bg-gradient-to-r from-amber-600 via-[#9E7B4F] to-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden border border-amber-300/40">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
                🔥 SPECIAL SELF DROP OFFER
              </span>
              <span className="text-amber-200 text-xs font-bold">Instant Express Service</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Libre_Caslon_Text',serif] text-3xl font-black text-amber-200">
                  ₹15
                </span>
                <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                  per piece (Shirt or Pant)
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-1 font-medium">
                Instant Vacuum Steam Ironing on Self Drop & Self Pickup at Store.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => openWhatsAppWith('₹15 Steam Ironing (Self Drop/Pickup)')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Book ₹15 Offer</span>
              </button>
              <button
                onClick={() => onNavigate('service-catalog')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FABRIQ CARE SERVICES GRID */}
      <section className="px-5 my-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
            {division === 'laundry' ? 'FabriQ Garment Care Services' : 'BotiQue Fit Suite'}
          </h3>
          <button
            onClick={() => onNavigate('service-catalog')}
            className="text-xs font-bold text-[#9E7B4F] hover:underline cursor-pointer"
          >
            Full Rate Card →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Service 1: Dry Cleaning */}
          <button
            onClick={() => {
              localStorage.setItem('fabriq_preselected_service', 'Dry Cleaning');
              onNavigate('service-catalog');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#9E7B4F] shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">dry_cleaning</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                From ₹70
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                Dry Cleaning
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Suits, Sarees & Jackets</p>
            </div>
          </button>

          {/* Service 2: Wash & Iron */}
          <button
            onClick={() => {
              localStorage.setItem('fabriq_preselected_service', 'Wash & Iron');
              onNavigate('service-catalog');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#9E7B4F] shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">local_laundry_service</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                From ₹69
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                Wash & Iron
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Everyday Cottons & Formals</p>
            </div>
          </button>

          {/* Service 3: FabriQ AI Luxury Cloth Store */}
          <button
            onClick={() => onNavigate('luxury-store')}
            className="bg-gradient-to-br from-slate-900 to-[#12121C] text-white p-3.5 rounded-2xl border-2 border-[#9E7B4F] shadow-md hover:border-amber-400 transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">checkroom</span>
              </div>
              <span className="text-[9px] font-black text-slate-950 bg-gradient-to-r from-amber-400 to-[#C29C6D] px-2 py-0.5 rounded-md uppercase tracking-wider">
                STORE
              </span>
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-xs text-amber-300 group-hover:text-amber-200 transition-colors">
                FabriQ Luxury Store
              </h4>
              <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">Shirts, Jeans, Kurthas & Shoes</p>
            </div>
          </button>

          {/* Service 4: Combo Packages */}
          <button
            onClick={() => {
              localStorage.setItem('fabriq_preselected_service', 'Combo Packages');
              onNavigate('service-catalog');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#9E7B4F] shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                From ₹999
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                Combo Packages
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">10kg, 12kg & 18kg Bundles</p>
            </div>
          </button>

          {/* Service 5: Shoe Care */}
          <button
            onClick={() => {
              localStorage.setItem('fabriq_preselected_service', 'Shoe Care');
              onNavigate('service-catalog');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#9E7B4F] shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">steps</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                From ₹250
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                Shoe Care
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Sneaker & Leather Spa</p>
            </div>
          </button>

          {/* Service 6: Premium Care */}
          <button
            onClick={() => {
              localStorage.setItem('fabriq_preselected_service', 'Premium Care');
              onNavigate('service-catalog');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#9E7B4F] shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">diamond</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                From ₹299
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                Premium Care
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Silk Sarees & Couture</p>
            </div>
          </button>

          {/* Service 7: Home Care */}
          <button
            onClick={() => {
              localStorage.setItem('fabriq_preselected_service', 'Home Care');
              onNavigate('service-catalog');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#9E7B4F] shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">curtains</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                From ₹149
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                Home Care
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Curtains, Carpets & Bedding</p>
            </div>
          </button>

          {/* Service 8: Others */}
          <button
            onClick={() => {
              localStorage.setItem('fabriq_preselected_service', 'Others');
              onNavigate('service-catalog');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#9E7B4F] shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[118px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9E7B4F] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                From ₹49
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#9E7B4F] transition-colors">
                Others
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Bags, Leather & Accessories</p>
            </div>
          </button>
        </div>
      </section>

      {/* SPECIAL COMBO PACKAGES SECTION */}
      <section className="px-5 my-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest block">
              FABRIQ SPECIAL COMBOS
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 dark:text-white">
              Value Wash & Dry Cleaning Bundles
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {/* Combo 1: ₹999 */}
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-[#9E7B4F] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-amber-100 text-[#83633B] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  STARTER COMBO
                </span>
                <h4 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
                  10 kg Wash & Iron
                </h4>
              </div>
              <div className="text-right">
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-black text-[#9E7B4F]">
                  ₹999
                </span>
              </div>
            </div>

            <ul className="my-3 space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <span>10 kg Wash & Steam Iron Laundry</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-[#9E7B4F]">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">card_giftcard</span>
                <span>+ 2 Basic Garments Dry Cleaning FREE!</span>
              </li>
            </ul>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => openWhatsAppWith('₹999 Combo Package (10kg Wash & Iron + 2 DC Free)')}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Instant Chat Booking"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
              </button>
              <button
                onClick={() => onNavigate('service-catalog')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Order Online
              </button>
            </div>
          </div>

          {/* Combo 2: ₹1499 */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-md relative overflow-hidden border-2 border-[#9E7B4F]">
            <div className="absolute top-0 right-0 bg-[#9E7B4F] text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              POPULAR CHOICE
            </div>

            <div className="flex justify-between items-start pt-1">
              <div>
                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block">
                  FAMILY LAUNDRY COMBO
                </span>
                <h4 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-0.5">
                  12 kg Wash & Iron
                </h4>
              </div>
              <div className="text-right">
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-black text-amber-300">
                  ₹1499
                </span>
              </div>
            </div>

            <ul className="my-3 space-y-1.5 text-xs text-slate-200 font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-300 text-[18px]">check_circle</span>
                <span>12 kg Wash & Steam Iron Laundry</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-amber-300">
                <span className="material-symbols-outlined text-amber-300 text-[18px]">card_giftcard</span>
                <span>+ 3 Basic Garments Dry Cleaning FREE!</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-amber-300">
                <span className="material-symbols-outlined text-amber-300 text-[18px]">card_giftcard</span>
                <span>+ 1 Basic Window Curtain (4x4 Sized) FREE!</span>
              </li>
            </ul>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => openWhatsAppWith('₹1499 Combo Package (12kg Wash & Iron + 3 DC + Curtain Free)')}
                className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Instant Chat Booking"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
              </button>
              <button
                onClick={() => onNavigate('service-catalog')}
                className="px-4 py-2.5 bg-[#9E7B4F] hover:bg-[#83633B] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Order Online
              </button>
            </div>
          </div>

          {/* Combo 3: ₹1999 */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-[#9E7B4F] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ULTIMATE HOME COMBO
                </span>
                <h4 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
                  18 kg Wash & Iron
                </h4>
              </div>
              <div className="text-right">
                <span className="font-['Libre_Caslon_Text',serif] text-2xl font-black text-[#9E7B4F]">
                  ₹1999
                </span>
              </div>
            </div>

            <ul className="my-3 space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <span>18 kg Wash & Steam Iron Laundry</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-[#9E7B4F]">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">card_giftcard</span>
                <span>+ 4 Basic Garments Dry Cleaning FREE!</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-[#9E7B4F]">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">card_giftcard</span>
                <span>+ 1 Basic Carpet Curtain Cleaning FREE!</span>
              </li>
            </ul>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => openWhatsAppWith('₹1999 Combo Package (18kg Wash & Iron + 4 DC + Carpet Free)')}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Instant Chat Booking"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
              </button>
              <button
                onClick={() => onNavigate('service-catalog')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Order Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK RATE CARD LIST HIGHLIGHT */}
      <section className="px-5 my-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest block">
                STANDARD RATE CARD
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Popular Garment Cleaning Prices
              </h3>
            </div>
            <button
              onClick={() => onNavigate('service-catalog')}
              className="text-xs font-bold text-[#9E7B4F] hover:underline"
            >
              See All
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">check</span>
                <span className="font-bold text-slate-800">Shirt (Formal / Casual)</span>
              </div>
              <span className="font-black text-slate-900">₹70</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">check</span>
                <span className="font-bold text-slate-800">Trousers / Pants</span>
              </div>
              <span className="font-black text-slate-900">₹80</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">check</span>
                <span className="font-bold text-slate-800">Two-Piece Suit (Jacket + Pant)</span>
              </div>
              <span className="font-black text-slate-900">₹360</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">check</span>
                <span className="font-bold text-slate-800">Kurta (Men / Women)</span>
              </div>
              <span className="font-black text-slate-900">₹100</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">check</span>
                <span className="font-bold text-slate-800">Jacket / Hoodie</span>
              </div>
              <span className="font-black text-slate-900">₹170</span>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECT ACTION BUTTONS GRID */}
      <section className="px-5 my-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('service-catalog')}
          className="bg-slate-900 text-white p-4 rounded-2xl text-left shadow-md flex flex-col justify-between h-28 hover:bg-slate-800 transition-colors cursor-pointer border border-amber-400/40"
        >
          <div className="w-9 h-9 rounded-xl bg-[#9E7B4F] text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-200">
              Schedule Valet Pickup
            </h4>
            <p className="text-[11px] text-slate-300">Free Doorstep Pickup</p>
          </div>
        </button>

        {currentRole !== 'customer' && (
          <button
            onClick={() => setIsFabricAdvisorOpen(true)}
            className="bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 text-white p-4 rounded-2xl text-left shadow-md flex flex-col justify-between h-28 hover:brightness-110 transition-all cursor-pointer border border-amber-400/50"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <span>Fabric Care Advisor</span>
                <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
              </h4>
              <p className="text-[11px] text-slate-200">Gemini Stain & Fiber Protocol</p>
            </div>
          </button>
        )}

        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="bg-emerald-600 text-white p-4 rounded-2xl text-left shadow-md flex flex-col justify-between h-28 hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Instant Chat Booking
            </h4>
            <p className="text-[11px] text-emerald-100">Direct Courier Confirmation</p>
          </div>
        </button>
      </section>

      {/* QUICK SCHEDULE FEATURE WIDGET */}
      <section className="px-5">
        <QuickScheduleWidget onNavigate={onNavigate} />
      </section>

      {/* GARMENT HEALTH & PRESERVATION STATISTICS SECTION */}
      <section className="px-5">
        <GarmentHealthSection />
      </section>

      {/* FABRIC CARE ADVISOR MODAL (Non-customer roles only) */}
      {currentRole !== 'customer' && (
        <FabricCareAdvisorModal
          isOpen={isFabricAdvisorOpen}
          onClose={() => setIsFabricAdvisorOpen(false)}
        />
      )}

      {/* TRUST BADGES GRID */}
      <section className="px-5 my-6">
        <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200/80 shadow-2xs">
          <div className="text-center mb-3">
            <span className="text-[10px] font-extrabold text-[#83633B] uppercase tracking-widest block">
              THE FABRIQ AI LUXURY PROMISE
            </span>
            <h4 className="font-['Libre_Caslon_Text',serif] text-sm font-bold text-slate-900 mt-0.5">
              Guaranteed Excellence in Every Garment
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[26px]">verified_user</span>
              <h5 className="font-bold text-xs text-slate-900 mt-1">SAFE CARE</h5>
              <p className="text-[10px] text-slate-500 font-sans">Zero Shrinkage Guarantee</p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[26px]">eco</span>
              <h5 className="font-bold text-xs text-slate-900 mt-1">ECO HYDRO SOLVENT</h5>
              <p className="text-[10px] text-slate-500 font-sans">Hypoallergenic & Zero Odor</p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[26px]">electric_bolt</span>
              <h5 className="font-bold text-xs text-slate-900 mt-1">EXPRESS VALET</h5>
              <p className="text-[10px] text-slate-500 font-sans">4-Hour Doorstep Return</p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[26px]">iron</span>
              <h5 className="font-bold text-xs text-slate-900 mt-1">STEAM VACUUM PRESS</h5>
              <p className="text-[10px] text-slate-500 font-sans">Italian Vacuum Boarding</p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[26px]">sanitizer</span>
              <h5 className="font-bold text-xs text-slate-900 mt-1">UV SANITIZATION</h5>
              <p className="text-[10px] text-slate-500 font-sans">99.9% Germ Shield</p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[26px]">stars</span>
              <h5 className="font-bold text-xs text-slate-900 mt-1">4.9★ RATED</h5>
              <p className="text-[10px] text-slate-500 font-sans">15,000+ Happy Guests</p>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        defaultService={whatsAppService || 'Dry Cleaning / Laundry Pickup'}
      />

      {/* Floating Symbol for AI Instant Booking */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2.5 items-end">
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsChatbotOpen(true);
          }}
          className="relative px-3.5 py-2.5 rounded-full bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-amber-300 flex items-center gap-2 shadow-2xl border-2 border-amber-400 hover:scale-105 transition-all cursor-pointer ring-4 ring-amber-400/30 fabriq-glow group"
          title="AI Instant Booking Chatbot"
        >
          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
            🤖
          </div>
          <div className="text-left font-sans">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 block leading-tight">AI ASSISTANT</span>
            <span className="text-xs font-extrabold text-white block leading-tight">Instant AI Booking</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping shrink-0" />
        </button>
      </div>

      <InstantBookingChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Slide-out 'More' Drawer Modal for Secondary Navigation & Tools */}
      {showMoreSection && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => {
              triggerHaptic('light');
              setShowMoreSection(false);
            }}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0F0F18] h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto p-5 animate-slideLeft border-l border-[#9E7B4F]/30">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 border border-amber-400/50 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[18px]">menu_open</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#9E7B4F] uppercase tracking-wider block">
                      FABRIQ AI ATELIER
                    </span>
                    <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 dark:text-white">
                      More Navigation & Tools
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowMoreSection(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="py-4 space-y-2">
                <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest block font-sans px-1">
                  ATELIER MANAGEMENT & METRICS
                </span>

                <button
                  onClick={() => {
                    setShowMoreSection(false);
                    onNavigate('dashboard-ceo');
                  }}
                  className="btn-press w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">insights</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">CEO Strategic Analytics</h4>
                      <p className="text-[10px] text-slate-500 font-sans">Revenue growth & franchise metrics</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <button
                  onClick={() => {
                    setShowMoreSection(false);
                    onNavigate('dashboard-mis');
                  }}
                  className="btn-press w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-purple-500 text-[20px]">analytics</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">MIS Operational Control</h4>
                      <p className="text-[10px] text-slate-500 font-sans">Live plant telemetry & store status</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <button
                  onClick={() => {
                    setShowMoreSection(false);
                    onNavigate('dashboard-store-manager');
                  }}
                  className="btn-press w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">storefront</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Store Counter Terminal</h4>
                      <p className="text-[10px] text-slate-500 font-sans">Branch intake & customer POS</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <button
                  onClick={() => {
                    setShowMoreSection(false);
                    onNavigate('dashboard-owner');
                  }}
                  className="btn-press w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#9E7B4F] text-[20px]">admin_panel_settings</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Franchise Owner Portal</h4>
                      <p className="text-[10px] text-slate-500 font-sans">Multi-unit operations & profit reports</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest block font-sans px-1">
                    CLIENT CARE & CONCIERGE
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowMoreSection(false);
                    onNavigate('concierge-chat');
                  }}
                  className="btn-press w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-500 text-[20px]">support_agent</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">VIP Concierge Support</h4>
                      <p className="text-[10px] text-slate-500 font-sans">24/7 Personal Garment Care Specialist</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>

                <button
                  onClick={() => {
                    setShowMoreSection(false);
                    onNavigate('membership-plans');
                  }}
                  className="btn-press w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">workspace_premium</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Atelier Membership Subscriptions</h4>
                      <p className="text-[10px] text-slate-500 font-sans">Gold, Platinum & Royal Privilege Tier</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest font-sans">
                FABRIQ AI • PREMIUM FABRIC CARE
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Version 3.4.0 • Eco-Friendly Dry Cleaning</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav activePath="home" onNavigate={onNavigate} />
    </div>
  );
};
