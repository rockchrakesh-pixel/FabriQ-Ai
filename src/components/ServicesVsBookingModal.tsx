import React, { useState } from 'react';

interface ServicesVsBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService?: (serviceName: string) => void;
}

export const ServicesVsBookingModal: React.FC<ServicesVsBookingModalProps> = ({
  isOpen,
  onClose,
  onSelectService,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'booking'>('services');

  if (!isOpen) return null;

  const SERVICES_LIST = [
    {
      id: 'wash_fold',
      title: 'Wash & Fold',
      badge: 'EVERYDAY ESSENTIAL',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: 'local_laundry_service',
      turnaround: '24 Hours',
      process: 'Gentle 30°C eco-wash with hypoallergenic liquid detergents, tumble dried & hand folded.',
      bestFor: 'T-Shirts, Pyjamas, Gym Clothes, Everyday Cotton Wear & Socks.',
      equipment: 'Front-load Commercial Washer + Temperature Controlled Dryer',
      multiplier: '1.0x Base Rate',
    },
    {
      id: 'wash_iron',
      title: 'Wash & Iron',
      badge: 'MOST POPULAR',
      color: 'bg-[#9E7B4F]/10 text-[#83633B] border-[#9E7B4F]/30',
      icon: 'dry_cleaning',
      turnaround: '24 Hours',
      process: 'Eco-wash + Fabric Softener rinse + Italian Vacuum Steam Press + Cedar Hanger.',
      bestFor: 'Formal Shirts, Office Trousers, Daily Kurtas, T-Shirts & Jeans.',
      equipment: 'Vacuum Steam Press Table + Micro-filtered Soft Water Wash',
      multiplier: '1.2x Base Rate',
    },
    {
      id: 'steam_iron',
      title: 'Steam Iron Only',
      badge: 'EXPRESS TOUCH-UP',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: 'iron',
      turnaround: '12-24 Hours',
      process: 'Crisp hand steam ironing with lapel roll preservation and zero fabric shine.',
      bestFor: 'Freshly laundered garments, suits needing quick touch-up, party wear.',
      equipment: 'High-Pressure Italian Steam Boiler (Zero Shine Head)',
      multiplier: '0.4x Base Rate',
    },
    {
      id: 'dry_cleaning',
      title: 'Hydrocarbon Dry Cleaning',
      badge: 'FABRIC PROTECT',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: 'cleaning_services',
      turnaround: '48 Hours',
      process: '100% Waterless solvent distillation wash @ 18°C, stain pretreatment, zero shrinkage.',
      bestFor: 'Suits, Blazers, Silk Sarees, Woolen Jackets, Designer Wear & Ties.',
      equipment: 'German K4 Hydrocarbon Dry Cleaning Machine',
      multiplier: '1.8x Base Rate',
    },
    {
      id: 'premium_care',
      title: 'Atelier Premium Care',
      badge: 'VIP LUXURY',
      color: 'bg-amber-50 text-amber-900 border-amber-300',
      icon: 'workspace_premium',
      turnaround: '48-72 Hours',
      process: '1-on-1 Specialist hand care, UV stain inspection, custom packaging & garment cover.',
      bestFor: 'Bridal Lehengas, Heavy Sherwanis, Cashmere Coat, Couture Gowns.',
      equipment: 'Master Artisan Hand Spotting Table + Archival Packing',
      multiplier: '2.5x Base Rate',
    },
    {
      id: 'shoe_bag_spa',
      title: 'Shoe & Bag Spa',
      badge: 'SPECIALITY CARE',
      color: 'bg-purple-50 text-purple-900 border-purple-200',
      icon: 'do_not_step',
      turnaround: '48-72 Hours',
      process: 'Deep foam extraction wash, leather conditioning, sole whitening & UV germ chamber.',
      bestFor: 'Sneakers, Suede Boots, Leather Handbags, Backpacks & Travel Luggage.',
      equipment: 'Ultrasonic Cleaner + UV-C Sanitization Vault',
      multiplier: 'Flat Rate per Item',
    },
  ];

  const BOOKING_OPTIONS = [
    {
      id: 'standard_doorstep',
      title: 'Standard Doorstep Valet',
      badge: 'FREE DELIVERY',
      icon: 'local_shipping',
      turnaround: '24 - 48 Hours',
      fee: 'FREE (Orders ₹399+)',
      details: 'Our doorstep valet arrives at your designated 2-hour pickup slot with tamper-evident laundry bags.',
      perks: ['Free Return Delivery', 'Real-Time Driver Tracking', 'Digital Weight Verification'],
    },
    {
      id: 'express_valet',
      title: 'Express 12-Hour Valet',
      badge: 'VIP SPEED',
      icon: 'bolt',
      turnaround: 'Guaranteed < 12 Hours',
      fee: '+ ₹149 Express Surcharge',
      details: 'Fast-tracked processing in dedicated priority washing batch with instant valet dispatch.',
      perks: ['Same-Day Pickup & Return', 'Dedicated Express Slot', 'SMS/WhatsApp Milestones'],
    },
    {
      id: 'scheduled_pickup',
      title: 'Scheduled Time-Slot Booking',
      badge: 'CONVENIENT',
      icon: 'schedule',
      turnaround: 'Flexible Pick & Return',
      fee: 'Standard Rates Apply',
      details: 'Select precise 1-hour windows for valet collection that fit seamlessly into your day.',
      perks: ['1-Hour Arrival Precision', 'Calendar Sync', 'Contactless Doorstep Bag Drop'],
    },
    {
      id: 'store_dropoff',
      title: 'Self Store Drop-Off',
      badge: 'SAVE 15%',
      icon: 'storefront',
      turnaround: '24 Hours',
      fee: '15% Discount Applied',
      details: 'Drop your laundry at any of our flagship FabriQ store locations across the city.',
      perks: ['Instant 15% Rate Card Discount', 'Express Counter Service', 'In-Person Consultation'],
    },
    {
      id: 'subscription_member',
      title: 'Prestige VIP Subscription',
      badge: 'BEST VALUE',
      icon: 'card_membership',
      turnaround: 'Priority 18 Hours',
      fee: '₹999 / Month (15 Credits)',
      details: 'Monthly care membership including free monthly credits, zero valet fees, and complimentary garment bags.',
      perks: ['15 Garment Credits Included', 'Zero Valet Fees Ever', '10% Extra Off Dry Cleaning'],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">compare_arrows</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-sans">
              FABRIQ CARE & LOGISTICS GUIDE
            </span>
          </div>

          <h2 className="font-['Libre_Caslon_Text',serif] text-xl sm:text-2xl font-bold text-white">
            Care Services vs. Booking Options
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
            Understand the differences between garment care methods and flexible valet delivery choices.
          </p>

          {/* Toggle Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-2xl mt-4 border border-slate-700">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-amber-500 to-[#9E7B4F] text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">dry_cleaning</span>
              <span>1. Garment Care Services (6)</span>
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-gradient-to-r from-amber-500 to-[#9E7B4F] text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>2. Booking & Valet Options (5)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {activeTab === 'services' ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">info</span>
                <p>
                  <strong>Care Services</strong> define <em>how</em> your clothes are cleaned, treated, and finished in our atelier facilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES_LIST.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${srv.color}`}>
                          {srv.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>
                          {srv.turnaround}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">{srv.icon}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{srv.title}</h3>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3">
                        {srv.process}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 uppercase font-mono text-[9px] block">Best For</span>
                        <span className="font-semibold text-slate-800">{srv.bestFor}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400 font-mono text-[9px]">Rate Structure:</span>
                        <span className="font-extrabold text-[#9E7B4F]">{srv.multiplier}</span>
                      </div>

                      {onSelectService && (
                        <button
                          onClick={() => {
                            onSelectService(srv.title);
                            onClose();
                          }}
                          className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-[#9E7B4F] text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Select {srv.title}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-xs text-purple-950 flex items-start gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[18px] shrink-0 mt-0.5">local_shipping</span>
                <p>
                  <strong>Booking Options</strong> control <em>when and how</em> your items are picked up and delivered to your doorstep.
                </p>
              </div>

              <div className="space-y-3">
                {BOOKING_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                          <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{opt.title}</h3>
                            <span className="text-[9px] font-black px-2 py-0.5 bg-amber-100 text-[#83633B] rounded-full uppercase tracking-wider">
                              {opt.badge}
                            </span>
                          </div>
                          <span className="text-xs text-[#9E7B4F] font-bold font-mono block mt-0.5">
                            {opt.fee} • {opt.turnaround}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3 font-sans">
                      {opt.details}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      {opt.perks.map((perk, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-sans">
            Need custom assistance? Chat with our Concierge Valet.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-[#83633B] text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Got It, Close
          </button>
        </div>

      </div>
    </div>
  );
};
