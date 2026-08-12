import React, { useState } from 'react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  defaultService = 'Dry Cleaning / Laundry Pickup',
}) => {
  const [selectedService, setSelectedService] = useState(defaultService);
  const [address, setAddress] = useState('42 Berkeley Square, Suite 402, Mayfair');
  const [slot, setSlot] = useState('Today (Within 2 Hours)');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello FabriQ Ai! I would like to book a service pickup.\n\n` +
        `• *Service*: ${selectedService}\n` +
        `• *Pickup Address*: ${address}\n` +
        `• *Preferred Slot*: ${slot}\n` +
        (notes ? `• *Special Instructions*: ${notes}\n` : '') +
        `\nPlease confirm my valet courier booking.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">chat</span>
            </div>
            <div>
              <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Direct Courier Booking
              </h3>
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <span>Official Concierge Support:</span>
                <span className="font-mono text-slate-900">1800-202-0000</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Form */}
        <div className="space-y-4 py-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Select Care Package / Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
            >
              <option value="₹15 Steam Ironing (Self Drop/Pickup)">
                🔥 ₹15 / Pc Steam Ironing (Self Drop / Pickup)
              </option>
              <option value="₹999 Combo Package (10kg Wash & Iron + 2 DC Free)">
                🌟 ₹999 Combo (10kg Wash & Iron + 2 DC Free)
              </option>
              <option value="₹1499 Combo Package (12kg Wash & Iron + 3 DC + Curtain Free)">
                🌟 ₹1499 Combo (12kg Wash & Iron + Curtain Free)
              </option>
              <option value="₹1999 Combo Package (18kg Wash & Iron + 4 DC + Carpet Free)">
                🌟 ₹1999 Combo (18kg Wash & Iron + Carpet Free)
              </option>
              <option value="Dry Cleaning (Shirts ₹70, Trousers ₹80, Suit ₹360, Kurta ₹100)">
                Dry Cleaning (Shirts ₹70, Trousers ₹80, Suits ₹360)
              </option>
              <option value="Wash & Fold Laundry (₹65/kg)">Wash & Fold Laundry (₹65/kg)</option>
              <option value="Shoe & Sneaker Spa (₹250/pair)">Shoe & Sneaker Spa (₹250/pair)</option>
              <option value="Curtains & Carpet Cleaning">Curtains & Carpet Cleaning</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Pickup Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Preferred Time Slot
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
            >
              <option value="Today (Within 2 Hours)">Today (Express - Within 2 Hours)</option>
              <option value="Today Evening (4 PM - 7 PM)">Today Evening (4:00 PM - 7:00 PM)</option>
              <option value="Tomorrow Morning (9 AM - 12 PM)">Tomorrow Morning (9:00 AM - 12:00 PM)</option>
              <option value="Tomorrow Evening (4 PM - 7 PM)">Tomorrow Evening (4:00 PM - 7:00 PM)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Light starch on formal shirts, hanger delivery"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
            />
          </div>
        </div>

        {/* Hotline notice */}
        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 mb-4 text-[11px] text-amber-900 font-sans flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">phone_in_talk</span>
          <p>
            <strong>Note:</strong> Feel free to chat before ordering! If not responded to immediately, please call FabriQ directly at <a href="tel:18002020000" className="font-bold underline">1800-202-0000</a> or <a href="tel:+919876543210" className="font-bold underline">+91 98765 43210</a>.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Confirm & Send Booking</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
