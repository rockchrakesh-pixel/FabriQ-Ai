import React, { useState } from 'react';
import { useBranch } from '../context/BranchContext';
import { FabriQAiLogoFramed } from './FabriQAiLogoFramed';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  category?: string;
}

interface OnlineBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onPaymentSuccess?: () => void;
}

export const OnlineBillingModal: React.FC<OnlineBillingModalProps> = ({
  isOpen,
  onClose,
  items,
  onPaymentSuccess,
}) => {
  const { activeBranch } = useBranch();
  const [paymentMethod, setPaymentMethod] = useState<'qr_upi' | 'card' | 'netbanking' | 'pay_at_store'>('qr_upi');
  const [couponCode, setCouponCode] = useState('FABRIQ5OFF');
  const [isDiscountApplied, setIsDiscountApplied] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const subtotal = rawSubtotal > 0 ? rawSubtotal : 250; // default sample if empty
  const discountAmount = isDiscountApplied ? Math.round(subtotal * 0.05) : 0;
  const taxes = Math.round((subtotal - discountAmount) * 0.05); // 5% GST/VAT
  const grandTotal = subtotal - discountAmount + taxes;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'FABRIQ5OFF' || couponCode.trim().toUpperCase() === 'FABRIQ5STAR') {
      setIsDiscountApplied(true);
      alert('✨ 5% Discount Coupon applied successfully!');
    } else {
      alert('Invalid coupon code. Try FABRIQ5OFF for 5% discount.');
    }
  };

  const handleCompletePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(`🎉 Payment of ₹${grandTotal} Successful via ${paymentMethod.toUpperCase()}!\nOrder sent to ${activeBranch.name}.`);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-amber-400/60 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-amber-400/40 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex items-center gap-3">
            <FabriQAiLogoFramed size="md" showSubtitle={true} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Branch & Order Summary */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider">
                DESPATCH BRANCH
              </span>
              <span className="bg-amber-100 text-[#83633B] font-bold text-[10px] px-2 py-0.5 rounded-full">
                {activeBranch.city}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">{activeBranch.name}</p>

            <div className="border-t border-slate-200 pt-2 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                GARMENTS IN BILL
              </span>
              {items.length > 0 ? (
                <div className="space-y-1">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between text-xs text-slate-700 font-medium">
                      <span>{it.qty}x {it.name}</span>
                      <span className="font-bold">₹{it.price * it.qty}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Custom Express Garment Care Package</p>
              )}
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">loyalty</span>
                Promo Coupon Code
              </span>
              {isDiscountApplied && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  5% SAVINGS ACTIVE
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter FABRIQ5OFF"
                className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('qr_upi')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  paymentMethod === 'qr_upi'
                    ? 'bg-slate-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-amber-400 text-[22px]">qr_code_2</span>
                <div>
                  <span className="text-xs font-bold block">UPI & Instant QR</span>
                  <span className="text-[10px] opacity-80">GPay, PhonePe, Paytm</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-slate-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-amber-400 text-[22px]">credit_card</span>
                <div>
                  <span className="text-xs font-bold block">Credit / Debit</span>
                  <span className="text-[10px] opacity-80">Visa, Mastercard</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'bg-slate-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-amber-400 text-[22px]">account_balance</span>
                <div>
                  <span className="text-xs font-bold block">Net Banking</span>
                  <span className="text-[10px] opacity-80">HDFC, ICICI, SBI</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('pay_at_store')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  paymentMethod === 'pay_at_store'
                    ? 'bg-slate-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-amber-400 text-[22px]">payments</span>
                <div>
                  <span className="text-xs font-bold block">Pay On Drop-Off</span>
                  <span className="text-[10px] opacity-80">Cash / Card at Store</span>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Detail Section according to tab */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-amber-400/40 space-y-4">
            {paymentMethod === 'qr_upi' && (
              <div className="flex flex-col items-center text-center space-y-3">
                <span className="text-[11px] text-amber-300 font-extrabold uppercase tracking-widest">
                  SCAN & PAY VIA ANY UPI APP
                </span>

                {/* QR CODE CANVAS BOX */}
                <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400 relative group">
                  <svg className="w-44 h-44" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    {/* Corner Squares */}
                    <rect x="5" y="5" width="25" height="25" fill="#0F172A" />
                    <rect x="8" y="8" width="19" height="19" fill="white" />
                    <rect x="11" y="11" width="13" height="13" fill="#0F172A" />

                    <rect x="70" y="5" width="25" height="25" fill="#0F172A" />
                    <rect x="73" y="8" width="19" height="19" fill="white" />
                    <rect x="76" y="11" width="13" height="13" fill="#0F172A" />

                    <rect x="5" y="70" width="25" height="25" fill="#0F172A" />
                    <rect x="8" y="73" width="19" height="19" fill="white" />
                    <rect x="11" y="76" width="13" height="13" fill="#0F172A" />

                    {/* QR Matrix Random Code Art */}
                    <rect x="35" y="10" width="8" height="8" fill="#D97706" />
                    <rect x="48" y="10" width="8" height="8" fill="#0F172A" />
                    <rect x="35" y="22" width="12" height="8" fill="#0F172A" />
                    <rect x="52" y="22" width="10" height="12" fill="#D97706" />

                    <rect x="10" y="35" width="12" height="12" fill="#D97706" />
                    <rect x="25" y="38" width="8" height="18" fill="#0F172A" />
                    <rect x="38" y="38" width="20" height="8" fill="#0F172A" />
                    <rect x="62" y="35" width="12" height="12" fill="#D97706" />
                    <rect x="80" y="35" width="10" height="20" fill="#0F172A" />

                    <rect x="38" y="52" width="12" height="12" fill="#D97706" />
                    <rect x="54" y="52" width="16" height="10" fill="#0F172A" />
                    <rect x="75" y="60" width="15" height="12" fill="#D97706" />

                    <rect x="35" y="72" width="15" height="15" fill="#0F172A" />
                    <rect x="55" y="75" width="18" height="18" fill="#D97706" />
                    <rect x="78" y="78" width="12" height="12" fill="#0F172A" />
                  </svg>
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all flex items-center justify-center">
                    <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow uppercase">
                      FabriQ AI Official
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs font-mono font-bold text-amber-300">UPI ID: fabriqai@upi</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Supports Google Pay • PhonePe • Paytm • BHIM</p>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-amber-300 font-bold uppercase block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-amber-300 font-bold uppercase block mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-amber-300 font-bold uppercase block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-2">
                <label className="text-[10px] text-amber-300 font-bold uppercase block">
                  Select Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'pay_at_store' && (
              <div className="text-center py-2 space-y-1">
                <span className="material-symbols-outlined text-amber-400 text-[32px]">store</span>
                <p className="text-xs font-bold text-white">Pay Upon Garment Drop-Off or Delivery</p>
                <p className="text-[10px] text-slate-300">You can pay with Cash, UPI, or Card when visiting the store or upon driver collection.</p>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {isDiscountApplied && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>5% Promo Discount (FABRIQ5OFF)</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxes & Eco Wash Fee</span>
              <span>₹{taxes}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-base pt-1 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="font-['Libre_Caslon_Text',serif] text-xl text-amber-700">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={handleCompletePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isProcessing ? (
              <span>Processing Payment...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Confirm Booking & Pay ₹{grandTotal}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
