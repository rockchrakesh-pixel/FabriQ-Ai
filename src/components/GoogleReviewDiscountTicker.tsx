import React, { useState } from 'react';
import { FabriQAiLogoFramed } from './FabriQAiLogoFramed';

interface GoogleReviewDiscountTickerProps {
  onApplyDiscount?: (code: string) => void;
}

export const GoogleReviewDiscountTicker: React.FC<GoogleReviewDiscountTickerProps> = ({
  onApplyDiscount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FABRIQ5OFF');
    setCopied(true);
    if (onApplyDiscount) {
      onApplyDiscount('FABRIQ5OFF');
    }
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      {/* Flashing Scrolling Banner */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 text-amber-300 py-2.5 px-3 border-y border-amber-500/50 shadow-md overflow-hidden cursor-pointer group hover:bg-slate-900 transition-colors relative z-30"
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto overflow-x-hidden">
          {/* Static Flashing Badge */}
          <div className="shrink-0 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-[14px]">stars</span>
            <span>5% OFF OFFER</span>
          </div>

          {/* Marquee Text */}
          <div className="flex-1 whitespace-nowrap overflow-hidden relative">
            <div className="inline-block animate-marquee group-hover:pause text-xs font-bold tracking-wide text-amber-200">
              <span className="text-white font-extrabold">🌟 LOG IN & RATE 5 STARS ON GOOGLE OR PLEASE SHARE THE SCREENSHOT IN SOCIAL MEDIA PLATFORMS</span>
              <span className="mx-2 text-amber-400">•</span>
              <span className="text-amber-300 font-black underline">GET INSTANT 5% DISCOUNT ON YOUR NEXT CARE ORDER!</span>
              <span className="mx-2 text-amber-400">•</span>
              <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono text-[11px] border border-amber-400/40">
                CODE: FABRIQ5OFF
              </span>
              <span className="mx-3 text-amber-400">•</span>
              <span className="text-white font-extrabold">🌟 LOG IN & RATE 5 STARS ON GOOGLE OR PLEASE SHARE THE SCREENSHOT IN SOCIAL MEDIA PLATFORMS</span>
              <span className="mx-2 text-amber-400">•</span>
              <span className="text-amber-300 font-black underline">GET INSTANT 5% DISCOUNT ON YOUR NEXT CARE ORDER!</span>
            </div>
          </div>

          {/* CTA Arrow */}
          <div className="shrink-0 flex items-center gap-1 text-[11px] font-extrabold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
            <span>CLAIM 5% OFF</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* 5-Star Review & Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-amber-400/60 flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-amber-400/40 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              <div className="flex items-center gap-3">
                <FabriQAiLogoFramed size="md" showSubtitle={true} />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <span className="material-symbols-outlined text-amber-500 text-[16px]">verified</span>
                  <span>5% Instant Discount Offer</span>
                </div>
                <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
                  Rate FabriQ AI & Save 5%
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Log in & rate 5 stars on Google OR share your order screenshot on social media platforms to unlock an instant 5% discount!
                </p>
              </div>

              {/* Action Buttons to Rate / Share */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setHasRated(true)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-center transition-all group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-amber-500 text-[28px] mb-1 group-hover:scale-110 transition-transform">
                    star
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">Rate on Google</span>
                  <span className="text-[10px] text-slate-500">5-Star Review ⭐</span>
                </a>

                <button
                  onClick={() => {
                    setHasRated(true);
                    alert('Screenshot shared! Promo coupon FABRIQ5OFF activated.');
                  }}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-center transition-all group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-purple-600 text-[28px] mb-1 group-hover:scale-110 transition-transform">
                    share
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">Social Media</span>
                  <span className="text-[10px] text-slate-500">Share Screenshot 📸</span>
                </button>
              </div>

              {/* Coupon Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-amber-400/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-300 font-bold uppercase tracking-wider">
                    PROMO COUPON CODE
                  </span>
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    5% DISCOUNT
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-amber-400/30">
                  <span className="font-mono text-lg font-black text-amber-300 tracking-widest">
                    FABRIQ5OFF
                  </span>

                  <button
                    onClick={handleCopyCode}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                {copied && (
                  <p className="text-[11px] text-emerald-400 font-bold text-center">
                    ✨ Coupon FABRIQ5OFF copied & 5% discount applied!
                  </p>
                )}
              </div>

              {/* Close / Apply Action */}
              <button
                onClick={() => {
                  handleCopyCode();
                  setIsModalOpen(false);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Claim 5% Discount & Return</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
