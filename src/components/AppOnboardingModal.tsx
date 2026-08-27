import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ScreenId } from '../types';
import { FabriQAiLogoFramed } from './FabriQAiLogoFramed';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

interface AppOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
}

type OnboardingStep = 'splash' | 'slides' | 'otp' | 'profile';

export const AppOnboardingModal: React.FC<AppOnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { updateProfileData } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('splash');
  const [currentSlide, setCurrentSlide] = useState(0);

  // OTP Form State
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phoneInput, setPhoneInput] = useState('9876543210');
  const [emailInput, setEmailInput] = useState('rakesh.ch@fabriq.ai');
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4', '5', '6']);

  // Profile Form State
  const [profileName, setProfileName] = useState('CH Rakesh');
  const [profileCity, setProfileCity] = useState('Jubilee Hills, Hyderabad');
  const [preferredDivision, setPreferredDivision] = useState<'laundry' | 'boutique'>('laundry');

  if (!isOpen) return null;

  const slides = [
    {
      title: '🧺 Everyday Laundry By KG',
      subtitle: 'Min 3 KG • Eco Organic Detergent • 24h Turnaround',
      description: 'Transparent fixed pricing for everyday apparel. Hygienically washed, steam pressed or neatly folded.',
      badge: 'MEN, WOMEN & KIDS EXCLUSIVE',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=600&auto=format&fit=crop',
      rates: [
        { label: 'Men / Women Wash & Fold', price: '₹89 / KG' },
        { label: 'Men / Women Wash & Iron', price: '₹129 / KG' },
        { label: 'Kids Wash & Fold', price: '₹79 / KG' },
        { label: 'Kids Wash & Iron', price: '₹109 / KG' },
      ],
    },
    {
      title: '👔 ₹15 Self-Drop Steam Iron & Dry Cleaning',
      subtitle: 'Crisp Steam Press • Hydrocarbon Silk Care • Shoe Restoration',
      description: 'Drop off at any store branch for ₹15 crisp steam ironing or request doorstep pickup for suits, sarees and lehengas.',
      badge: 'SELF-DROP SPECIAL ₹15',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=600&auto=format&fit=crop',
      rates: [
        { label: 'Steam Ironing (Self Drop)', price: '₹15 / pc' },
        { label: 'Suits & Blazers Dry Clean', price: '₹249+' },
        { label: 'Silk Saree Premium Care', price: '₹199+' },
        { label: 'Sneaker & Shoe Spa', price: '₹299+' },
      ],
    },
    {
      title: '👗 BotiQue & 3D Fitting Suite',
      subtitle: 'Bespoke Tailoring • Doorstep Master Fitting • Alterations',
      description: 'Design custom garments, schedule doorstep Master Tailor visits, and visualize fit in our 3D digital fitting suite.',
      badge: 'LUXURY TAILORING',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop',
      rates: [
        { label: 'Blouse Custom Stitching', price: '₹899+' },
        { label: 'Anarkali & Gown Tailoring', price: '₹1499+' },
        { label: 'Suit Alteration & Fitting', price: '₹349+' },
        { label: 'Master Tailor Doorstep Visit', price: 'FREE' },
      ],
    },
    {
      title: '🚚 Instant Doorstep Pickup & Real-Time Tracking',
      subtitle: 'Express 24h Delivery • Live GPS Fleet • Zero Contact',
      description: 'Our certified delivery captain arrives at your doorstep in convenient time slots with eco-friendly garment hampers.',
      badge: 'FREE PICKUP > ₹799 (5km) / ₹2599 (10km)',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
      rates: [
        { label: 'Free 5km Radius Pickup', price: 'Free > ₹799' },
        { label: 'Free 10km Radius Pickup', price: 'Free > ₹2599' },
        { label: 'Express Delivery (12h)', price: '₹99 Add-on' },
        { label: 'Hydrocarbon Eco Wash', price: 'Included' },
        { label: 'Garment Stain Guarantee', price: '100% Protected' },
      ],
    },
  ];

  const handleGenerateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpGenerated(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('profile');
  };

  const handleFinishProfile = (skip: boolean = false) => {
    if (!skip) {
      updateProfileData({
        name: profileName,
        address: profileCity,
      });
    }
    localStorage.setItem('hasCompletedFabriqOnboarding', 'true');
    onClose();
    onNavigate('home');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* TOP APP BAR HEADER */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2">
            <FabriQAiLogoFramed size="xs" showSubtitle={true} />
            <span className="text-xs font-bold text-amber-300 border-l border-amber-400/30 pl-2">
              App Entrance
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
            title="Exit Preview"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: ENTRANCE / BRAND LOGO SPLASH SCREEN */}
        {step === 'splash' && (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-[420px] relative">
            {/* Ambient Gold Halo */}
            <div className="absolute w-48 h-48 rounded-full bg-amber-500/15 blur-2xl pointer-events-none animate-pulse"></div>

            {/* BRAND LOGO HIGHLIGHT */}
            <div className="relative mb-6 group cursor-pointer" onClick={() => setStep('slides')}>
              <FabriQAiLogoFramed size="xl" showSubtitle={true} className="mb-2" />
              <span className="inline-block mt-2 bg-amber-400 text-slate-950 text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                Official App Entrance • Tap to Tour
              </span>
            </div>

            <p className="text-xs text-amber-200/90 font-medium max-w-xs mb-6 leading-relaxed">
              Luxury Garment Care, Hydrocarbon Eco Wash, Laundry By KG & Bespoke BotiQue Fitting.
            </p>

            <div className="flex items-center gap-2 mb-8 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-full text-[10px] text-slate-300">
              <span className="material-symbols-outlined text-[14px] text-amber-400">download</span>
              <span>Available on Android PlayStore & iOS App Store</span>
            </div>

            <button
              onClick={() => setStep('slides')}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-[#9E7B4F] to-amber-500 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>EXPLORE SERVICES WALKTHROUGH</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* STEP 2: SERVICES SLIDES WALKTHROUGH */}
        {step === 'slides' && (
          <div className="p-5 sm:p-6 bg-slate-50 flex flex-col justify-between min-h-[440px]">
            <div>
              {/* Slide Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-amber-100 text-[#83633B] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">
                  {slides[currentSlide].badge}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  SLIDE {currentSlide + 1} OF {slides.length}
                </span>
              </div>

              {/* Slide Image */}
              <div className="relative h-36 rounded-2xl overflow-hidden mb-3 border border-slate-200 shadow-xs">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-3 flex flex-col justify-end">
                  <h2 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white drop-shadow-sm">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-[10px] text-amber-200 font-medium">
                    {slides[currentSlide].subtitle}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                {slides[currentSlide].description}
              </p>

              {/* Rates Breakdown Box */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-1.5 mb-4">
                <span className="text-[9px] font-extrabold text-[#83633B] uppercase tracking-wider block mb-1">
                  HIGHLIGHTED RATES IN THIS CATEGORY:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {slides[currentSlide].rates.map((r, i) => (
                    <div key={i} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block truncate">{r.label}</span>
                      <span className="font-extrabold text-slate-900 text-xs">{r.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation & Dots Controls */}
            <div>
              {/* Dots */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-6 bg-[#9E7B4F]' : 'w-2 bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {currentSlide > 0 && (
                  <button
                    onClick={() => setCurrentSlide((prev) => prev - 1)}
                    className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
                
                {currentSlide < slides.length - 1 ? (
                  <button
                    onClick={() => setCurrentSlide((prev) => prev + 1)}
                    className="flex-1 py-3.5 bg-slate-900 text-amber-300 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#9E7B4F] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>NEXT SERVICE SLIDE</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setStep('otp')}
                    className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-[#9E7B4F] text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg"
                  >
                    <span>CONTINUE TO OTP VERIFICATION</span>
                    <span className="material-symbols-outlined text-[18px]">phonelink_ring</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PHONE NUMBER / EMAIL OTP GENERATION */}
        {step === 'otp' && (
          <div className="p-6 bg-white text-slate-900">
            <div className="text-center mb-5">
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block mb-0.5">
                SECURE ACCESS PORTAL
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
                Enter Phone Number or Email
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We will generate a 6-digit OTP code to instantly log you in.
              </p>
            </div>

            {/* Toggle Method */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-4">
              <button
                onClick={() => { setAuthMethod('phone'); setOtpGenerated(false); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMethod === 'phone' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                📱 Mobile Phone (SMS)
              </button>
              <button
                onClick={() => { setAuthMethod('email'); setOtpGenerated(false); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMethod === 'email' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                ✉️ Email ID
              </button>
            </div>

            {!otpGenerated ? (
              <form onSubmit={handleGenerateOtp} className="space-y-4">
                {authMethod === 'phone' ? (
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">
                      Mobile Number:
                    </label>
                    <div className="flex gap-2">
                      <span className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 flex items-center">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Enter 10-digit phone number"
                        required
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. name@domain.com"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-[#9E7B4F] text-amber-300 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                  <span>GENERATE OTP CODE</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 block">
                    ✅ OTP Sent successfully to {authMethod === 'phone' ? `+91 ${phoneInput}` : emailInput}
                  </span>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-[10px] text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                      CODE: 1 2 3 4 5 6
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpDigits(['1', '2', '3', '4', '5', '6'])}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">content_paste</span>
                      Auto-Fill Code
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-2 text-center">
                    Enter 6-Digit OTP:
                  </label>
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const newDigits = [...otpDigits];
                          newDigits[idx] = e.target.value;
                          setOtpDigits(newDigits);
                        }}
                        className="w-10 h-11 bg-slate-50 border-2 border-amber-400 rounded-xl text-center font-bold text-base text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-[#9E7B4F] text-amber-300 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>VERIFY OTP & CONTINUE</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setOtpGenerated(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline font-bold cursor-pointer"
                  >
                    Change Phone / Email ID
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 4: PROFILE COMPLETION OR SKIP */}
        {step === 'profile' && (
          <div className="p-6 bg-white text-slate-900">
            <div className="text-center mb-5">
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block mb-0.5">
                WELCOME TO FABRIQ AI
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
                Complete Profile
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Help us customize your doorstep laundry & boutique experience.
              </p>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Delivery Address / City:</label>
                <input
                  type="text"
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Preferred Primary Division:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredDivision('laundry')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      preferredDivision === 'laundry'
                        ? 'bg-amber-50 border-amber-400 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs">🧺 Laundry By KG & Care</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredDivision('boutique')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      preferredDivision === 'boutique'
                        ? 'bg-purple-50 border-purple-400 text-purple-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs">👗 BotiQue & 3D Fitting</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleFinishProfile(false)}
                className="w-full py-3.5 bg-slate-900 hover:bg-[#9E7B4F] text-amber-300 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>SAVE PROFILE & START USING APP</span>
              </button>

              <button
                onClick={() => handleFinishProfile(true)}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
