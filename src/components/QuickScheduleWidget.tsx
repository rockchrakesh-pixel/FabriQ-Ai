import React, { useState } from 'react';
import { useBranch } from '../context/BranchContext';
import { useNotifications } from '../context/NotificationContext';
import { useOrders } from '../context/OrderContext';
import { triggerHaptic } from '../lib/haptics';

interface QuickScheduleWidgetProps {
  onNavigate?: (screen: any) => void;
  onSuccess?: () => void;
}

export const QuickScheduleWidget: React.FC<QuickScheduleWidgetProps> = ({ onNavigate, onSuccess }) => {
  const { activeBranch } = useBranch();
  const { sendNotification } = useNotifications();
  const { addOrder } = useOrders();

  // Calendar dates generation (Today + next 6 days)
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return {
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      fullIso: d.toISOString().split('T')[0],
      isToday: i === 0,
    };
  });

  const [selectedDateIso, setSelectedDateIso] = useState<string>(dates[0].fullIso);
  const [selectedSlot, setSelectedSlot] = useState<string>('08:00 AM - 10:00 AM');
  const [serviceCategory, setServiceCategory] = useState<string>('Dry Cleaning & Steam Press');
  const [address, setAddress] = useState<string>(`Road No. 36, Jubilee Hills, ${activeBranch.city || 'Hyderabad'}`);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookedConfirmation, setBookedConfirmation] = useState<{ id: string; slot: string; date: string } | null>(null);

  const TIME_SLOTS = [
    { label: '08:00 AM - 10:00 AM', tag: 'Morning Express', icon: 'wb_twilight' },
    { label: '12:00 PM - 02:00 PM', tag: 'Midday Slot', icon: 'wb_sunny' },
    { label: '05:00 PM - 07:00 PM', tag: 'Evening Concierge', icon: 'nights_stay' },
    { label: '08:00 PM - 10:00 PM', tag: 'Late Night Express', icon: 'bedtime' },
  ];

  const SERVICE_OPTIONS = [
    'Dry Cleaning & Steam Press',
    'Silk Saree & Heritage Couture',
    'Wash, Dry & Fold (Per Kg)',
    'Shoe & Sneaker Spa',
    'Express 24-Hour Valet',
  ];

  const handleBookingConfirm = async () => {
    triggerHaptic();
    setIsSubmitting(true);

    const bookingId = `SCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const selectedDateObj = dates.find((d) => d.fullIso === selectedDateIso) || dates[0];
    const displayDate = `${selectedDateObj.dayName}, ${selectedDateObj.dateNum} ${selectedDateObj.monthName}`;

    setTimeout(async () => {
      // Save order to OrderContext
      try {
        await addOrder({
          orderCode: bookingId,
          customerName: 'Valet Client',
          customerPhone: '+91 98765 43210',
          items: [{ garmentName: serviceCategory, service: 'Scheduled Valet Pickup', qty: 1, price: 250 }],
          status: 'Received',
          stage: 'Valet Pickup Scheduled',
          priority: 'VIP Express',
          amount: 250,
          type: 'Online App Booking',
          paymentMode: 'Pay on Delivery',
          decision: 'Accepted',
          branchName: activeBranch.name,
          estReturnDate: displayDate,
        });
      } catch (e) {
        console.warn('Could not persist scheduled order to Firestore:', e);
      }

      sendNotification(
        'Concierge Pickup Scheduled! 🚗',
        `Your valet pickup for ${serviceCategory} is confirmed for ${displayDate} during ${selectedSlot}. Tracking ID: ${bookingId}.`,
        'order_confirmed',
        { orderId: bookingId, badgeText: 'SCHEDULED' }
      );

      setIsSubmitting(false);
      setBookedConfirmation({
        id: bookingId,
        slot: selectedSlot,
        date: displayDate,
      });

      if (onSuccess) onSuccess();
    }, 800);
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-md relative overflow-hidden my-4">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#9E7B4F] flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block font-sans">
              INSTANT CONCIERGE PICKUP
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 leading-tight">
              Quick Schedule Pickup Slot
            </h3>
          </div>
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Valet Ready</span>
        </span>
      </div>

      {bookedConfirmation ? (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-amber-400/50 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shrink-0">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                BOOKING CONFIRMED #{bookedConfirmation.id}
              </span>
              <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                Valet Assigned for {bookedConfirmation.date}
              </h4>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            Selected Time Window: <strong className="text-amber-300">{bookedConfirmation.slot}</strong>
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Location: {address} ({activeBranch.name})
          </p>

          <div className="flex items-center gap-2 pt-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('live-order-tracking')}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">near_me</span>
                <span>Track Valet Live</span>
              </button>
            )}
            <button
              onClick={() => setBookedConfirmation(null)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              Book Another
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Date Selector (Calendar horizontal scroll) */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2 font-sans">
              1. Select Preferred Date
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {dates.map((d) => {
                const isSelected = selectedDateIso === d.fullIso;
                return (
                  <button
                    key={d.fullIso}
                    onClick={() => {
                      triggerHaptic();
                      setSelectedDateIso(d.fullIso);
                    }}
                    className={`flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                      {d.dayName}
                    </span>
                    <span className="text-base font-extrabold my-0.5 font-['Libre_Caslon_Text',serif]">
                      {d.dateNum}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Time Slot Selection Chips */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2 font-sans">
              2. Select Time Window
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot.label;
                return (
                  <button
                    key={slot.label}
                    onClick={() => {
                      triggerHaptic();
                      setSelectedSlot(slot.label);
                    }}
                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#9E7B4F] text-white border-[#9E7B4F] shadow-sm'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="material-symbols-outlined text-[16px] opacity-90">
                        {slot.icon}
                      </span>
                      <span
                        className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-amber-300 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {slot.tag}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold block">{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Service Category & Address Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1 font-sans">
                Care Category
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#9E7B4F]"
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1 font-sans">
                Doorstep Pickup Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter flat no. / landmark"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#9E7B4F]"
              />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleBookingConfirm}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-400/40 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Scheduling Valet Pickup...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
                <span>Confirm Concierge Pickup Slot</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
