import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

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
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen">
      
      {/* Header */}
      <section className="px-5 pt-5 pb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-widest font-sans flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">design_services</span>
            FABRIQ AI BOTIQUE STUDIO
          </span>
          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-slate-900">
            Book Private Master Tailor
          </h1>
          <p className="text-xs text-slate-500">
            Experience hand-measured haute couture fitting by our master Italian tailors.
          </p>
        </div>
      </section>

      {isBooked ? (
        /* Confirmation Screen */
        <section className="px-5 my-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-md text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              APPOINTMENT CONFIRMED
            </span>
            <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 mt-2">
              Master Fitting Reserved
            </h2>
            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
              Your fitting session for <span className="font-bold text-slate-900">{garmentType}</span> is confirmed for{' '}
              <span className="font-bold text-slate-900">{selectedDate}</span> at{' '}
              <span className="font-bold text-slate-900">
                {selectedLocation === 'atelier' ? 'FabriQ Flagship Studio Lounge' : 'Your Residence'}
              </span>.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 text-left space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Tailor:</span>
                <span className="font-bold text-slate-900">Master Tailor Marco V.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Division:</span>
                <span className="font-bold text-purple-800">FabriQ AI BotiQue</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-emerald-700">$0 (Complimentary VIP)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                Return to Home
              </button>
              <button
                onClick={() => onNavigate('my-orders')}
                className="flex-1 py-3 rounded-2xl bg-purple-100 text-purple-800 font-bold text-xs hover:bg-purple-200 transition-all cursor-pointer"
              >
                View Appointment
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Booking Form */
        <section className="px-5 space-y-5 my-2">
          
          {/* Garment Selection */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left cursor-pointer ${
                    garmentType === g
                      ? 'bg-purple-50 text-purple-900 border-purple-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Fitting Location */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fitting Location
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedLocation('atelier')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  selectedLocation === 'atelier'
                    ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600/30'
                    : 'bg-white border-slate-200 hover:border-purple-300'
                }`}
              >
                <span className="material-symbols-outlined text-purple-700 text-[24px]">storefront</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Flagship Studio</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">5th Ave Flagship Lounge</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedLocation('home')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  selectedLocation === 'home'
                    ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600/30'
                    : 'bg-white border-slate-200 hover:border-purple-300'
                }`}
              >
                <span className="material-symbols-outlined text-purple-700 text-[24px]">home_pin</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Private Residence</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Valet master tailor visit</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    selectedDate === slot
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
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
            className="w-full py-4 rounded-2xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined">event_available</span>
            <span>Confirm Tailor Reservation</span>
          </button>
        </section>
      )}

      <BottomNav activePath="boutique" onNavigate={onNavigate} />
    </div>
  );
};
