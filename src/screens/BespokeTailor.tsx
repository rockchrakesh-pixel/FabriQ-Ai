import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { FabriQAiCrownLogo } from '../components/FabriQAiCrownLogo';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const BespokeTailor: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [selectedLocation, setSelectedLocation] = useState<'atelier' | 'home'>('atelier');
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow, 2:00 PM');
  const [garmentType, setGarmentType] = useState<string>('2-Piece Bespoke Suit');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const handleBooking = () => {
    setIsBooked(true);
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen font-sans">
      
      {/* Header Banner */}
      <section className="px-5 pt-5 pb-3">
        <div className="bg-[#0B1528] rounded-3xl p-6 border-2 border-[#C29C6D]/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#E5C07B] text-[#0B1528] font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                DIVISION 02
              </span>
              <span className="text-[10px] text-[#E5C07B] font-extrabold uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">design_services</span>
                FABRIQ BOUTIQUE
              </span>
            </div>
            <FabriQAiCrownLogo size="sm" theme="navy" showSubtitle={false} />
          </div>

          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-[#FAF9F6]">
            Book Private Master Tailor
          </h1>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
            Experience hand-measured haute couture fitting by our master Italian tailors.
          </p>
        </div>
      </section>

      {isBooked ? (
        /* Confirmation Screen */
        <section className="px-5 my-4 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
          <div className="bg-[#0B1528] rounded-3xl p-6 border-2 border-[#C29C6D]/40 shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-700/40">
              APPOINTMENT CONFIRMED
            </span>
            <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-[#FAF9F6] mt-3">
              Master Fitting Reserved
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              Your fitting session for <span className="font-bold text-[#E5C07B]">{garmentType}</span> is confirmed for{' '}
              <span className="font-bold text-white">{selectedDate}</span> at{' '}
              <span className="font-bold text-[#FAF9F6]">
                {selectedLocation === 'atelier' ? 'FabriQ Flagship Studio Lounge' : 'Your Residence'}
              </span>.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-[#070F1E] text-left space-y-2 text-xs border border-[#C29C6D]/30">
              <div className="flex justify-between">
                <span className="text-slate-400">Tailor:</span>
                <span className="font-bold text-[#FAF9F6]">Master Tailor Marco V.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Division:</span>
                <span className="font-bold text-[#E5C07B]">FabriQ Boutique</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consultation Fee:</span>
                <span className="font-bold text-emerald-400">₹0 (Complimentary VIP)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="flex-1 py-3.5 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/40 text-slate-200 font-bold text-xs hover:border-[#D4AF37] transition-all cursor-pointer min-h-[44px]"
              >
                Return to Home
              </button>
              <button
                onClick={() => onNavigate('my-orders')}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs hover:opacity-95 transition-all cursor-pointer min-h-[44px]"
              >
                View Appointment
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Booking Form */
        <section className="px-5 space-y-4 my-2 max-w-2xl mx-auto w-full">
          
          {/* Garment Selection */}
          <div className="bg-[#0B1528] p-5 rounded-3xl border border-[#C29C6D]/30 shadow-md">
            <label className="block text-xs font-bold text-[#E5C07B] uppercase tracking-wider mb-3">
              Select Couture Garment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                '2-Piece Bespoke Suit',
                'Haute Couture Evening Gown',
                'Tuxedo & Dinner Jacket',
              ].map((g) => (
                <button
                  key={g}
                  onClick={() => setGarmentType(g)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left cursor-pointer min-h-[44px] ${
                    garmentType === g
                      ? 'bg-[#0E1B33] text-[#E5C07B] border-[#D4AF37] shadow-xs ring-1 ring-[#D4AF37]/30'
                      : 'bg-[#070F1E] text-slate-300 border-[#C29C6D]/30 hover:border-[#D4AF37]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Fitting Location */}
          <div className="bg-[#0B1528] p-5 rounded-3xl border border-[#C29C6D]/30 shadow-md">
            <label className="block text-xs font-bold text-[#E5C07B] uppercase tracking-wider mb-3">
              Fitting Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedLocation('atelier')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer min-h-[44px] ${
                  selectedLocation === 'atelier'
                    ? 'bg-[#0E1B33] border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    : 'bg-[#070F1E] border-[#C29C6D]/30 hover:border-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-[#E5C07B] text-[24px]">storefront</span>
                <div>
                  <h4 className="font-bold text-xs text-[#FAF9F6]">Flagship Atelier Lounge</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Jubilee Hills Flagship Suite</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedLocation('home')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer min-h-[44px] ${
                  selectedLocation === 'home'
                    ? 'bg-[#0E1B33] border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    : 'bg-[#070F1E] border-[#C29C6D]/30 hover:border-[#D4AF37]'
                }`}
              >
                <span className="material-symbols-outlined text-[#E5C07B] text-[24px]">home_pin</span>
                <div>
                  <h4 className="font-bold text-xs text-[#FAF9F6]">Private Residence</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Valet master tailor visit</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="bg-[#0B1528] p-5 rounded-3xl border border-[#C29C6D]/30 shadow-md">
            <label className="block text-xs font-bold text-[#E5C07B] uppercase tracking-wider mb-3">
              Available Fitting Slots
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'Today, 4:00 PM',
                'Tomorrow, 11:00 AM',
                'Tomorrow, 2:00 PM',
                'Friday, 10:00 AM',
                'Friday, 3:30 PM',
                'Saturday, 1:00 PM',
              ].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedDate(slot)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer min-h-[44px] ${
                    selectedDate === slot
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black border-[#D4AF37] shadow-xs'
                      : 'bg-[#070F1E] text-slate-300 border-[#C29C6D]/30 hover:border-[#D4AF37]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleBooking}
            className="w-full min-h-[48px] py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            <span>Confirm Tailor Reservation</span>
          </button>
        </section>
      )}

      <BottomNav activePath="boutique" onNavigate={onNavigate} />
    </div>
  );
};
