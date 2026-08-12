import React, { useState } from 'react';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAcceptClick = () => {
    localStorage.setItem('fabriq_terms_accepted', 'true');
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-amber-400/60 flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-amber-400/40 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Terms"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-900 flex items-center justify-center shadow-lg shrink-0">
              <img
                src={fabriqLogo}
                alt="FabriQ AI Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block font-sans">
                LEGAL & SERVICE AGREEMENT
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
                FabriQ AI Terms & Conditions
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed flex-1">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 font-medium">
            <p className="font-bold text-sm mb-1 text-slate-900">Welcome to FabriQ AI Luxury Fabric Care</p>
            Please read these Terms and Conditions carefully before scheduling pickups, requesting garment care services, or utilizing the FabriQ AI digital platform.
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0">1</span>
              Service Scope & Garment Inspection
            </h3>
            <p>
              FabriQ AI provides premium laundry, dry cleaning, steam pressing, couture restoration, and bespoke garment care services. All garments are inspected using our proprietary AI fabric scanning technology upon arrival at our care studio. Any pre-existing damage, tears, missing buttons, or severe color fading detected during initial intake will be logged and communicated via customer notifications.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0">2</span>
              Pickup & Delivery Policy
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Free Doorstep Pickup & Drop is available within a 5 km radius for cart values of ₹799 and above.</li>
              <li>Free Doorstep Pickup & Drop is available within a 10 km extended radius for cart values of ₹2,599 and above.</li>
              <li>Customers must ensure an authorized person is present at the designated location during the agreed time slot.</li>
              <li>Re-pickup or re-delivery due to customer unavailability may incur a nominal door-step logistics fee.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0">3</span>
              Stain Removal & Garment Guarantee
            </h3>
            <p>
              While FabriQ AI uses eco-friendly solvents and advanced Italian steam technology to treat tough stains, 100% stain removal cannot be guaranteed on delicate or old set-in stains without risking fabric fiber integrity. Customers authorize our garment specialists to exercise professional judgment in treating stains safely.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0">4</span>
              Color Bleeding & Fabric Shrinkage Disclaimer
            </h3>
            <p>
              FabriQ AI follows international care label instructions strictly. However, we cannot accept responsibility for color bleeding or fabric shrinkage caused by poor dye quality or non-standard manufacturing of garments provided by third-party retailers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0">5</span>
              Liability Limit for Loss or Damage
            </h3>
            <p>
              In the rare event of lost or damaged garments due to studio operational fault, FabriQ AI liability is capped at 10 times the cleaning charge of that specific item or a maximum of ₹3,000 / $50 per garment, whichever is lower, unless declared under high-value couture insurance during booking.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0">6</span>
              Google Rating & Social Share Promo Offer (FABRIQ5OFF)
            </h3>
            <p>
              The 5% instant discount coupon code <span className="font-mono font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">FABRIQ5OFF</span> is applicable for customers who publish a 5-star review on Google Maps/Play Store or share an order screenshot on social media. The discount applies to care service subtotals and cannot be combined with non-stackable bulk corporate vouchers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0">7</span>
              Payments & Unclaimed Garments
            </h3>
            <p>
              Payments can be made via UPI, QR code scanning, Credit/Debit cards, Net Banking, or Cash upon delivery. Garments left unclaimed beyond 30 days from notification may be subject to monthly storage fees or donated to charity.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {showAcceptButton && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>I have read & agree to FabriQ AI Terms and Conditions</span>
            </label>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
            {showAcceptButton ? (
              <button
                onClick={handleAcceptClick}
                disabled={!agreed}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Accept & Proceed
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Close Agreement
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
