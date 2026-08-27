import React, { useState } from 'react';
import { triggerHaptic } from '../lib/haptics';

interface BoutiqueCheckInQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  memberTier?: string;
}

const STORES = [
  { id: 'jubilee', name: 'Jubilee Hills Flagship Atelier', city: 'Hyderabad', concierge: 'Aisha V.' },
  { id: 'delhi', name: 'Connaught Place Luxury Lounge', city: 'New Delhi', concierge: 'Vikram S.' },
  { id: 'mumbai', name: 'Bandra West Heritage Boutique', city: 'Mumbai', concierge: 'Ananya R.' },
  { id: 'bengaluru', name: 'Indiranagar FabriQ Hub', city: 'Bengaluru', concierge: 'Karthik N.' },
];

export const BoutiqueCheckInQRModal: React.FC<BoutiqueCheckInQRModalProps> = ({
  isOpen,
  onClose,
  customerName = 'Arjun Sharma',
  memberTier = 'Platinum Atelier Member',
}) => {
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [checkedInState, setCheckedInState] = useState<null | {
    storeName: string;
    concierge: string;
    time: string;
    welcomeMsg: string;
  }>(null);
  const [beverage, setBeverage] = useState('Italian Espresso');

  if (!isOpen) return null;

  const handleSimulateCheckIn = () => {
    triggerHaptic('notificationSuccess');
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCheckedInState({
      storeName: selectedStore.name,
      concierge: selectedStore.concierge,
      time: checkInTime,
      welcomeMsg: `Welcome to ${selectedStore.name}, ${customerName}! Your dedicated Senior Garment Specialist ${selectedStore.concierge} has been notified and a complimentary ${beverage} is being prepared at the VIP lounge.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-[#9E7B4F]/50 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative overflow-hidden font-sans">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold tracking-widest uppercase">
            <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
            <span>DIGITAL BOUTIQUE EXPRESS CHECK-IN</span>
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white mt-1">
            VIP Boutique Check-In Pass
          </h3>
          <p className="text-xs text-slate-300">
            Scan your pass at store door scanner or check-in below for concierge welcome service.
          </p>
        </div>

        {/* Checked-In Notification Screen */}
        {checkedInState ? (
          <div className="bg-slate-950 p-5 rounded-2xl border border-amber-400/60 space-y-4 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                CHECK-IN CONFIRMED AT {checkedInState.time}
              </span>
              <h4 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
                {checkedInState.storeName}
              </h4>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                <span>Personalized Concierge Alert Sent</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "{checkedInState.welcomeMsg}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono pt-1">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block font-bold">Assigned Specialist</span>
                <span className="text-amber-300 font-bold">{checkedInState.concierge}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase block font-bold">Lounge Welcome Refreshment</span>
                <span className="text-emerald-400 font-bold">{beverage}</span>
              </div>
            </div>

            <button
              onClick={() => setCheckedInState(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Scan Again / Change Location
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR Code Pass Display */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative p-3 bg-white rounded-2xl border-4 border-amber-400 shadow-xl">
                {/* Simulated High Resolution QR Code */}
                <div className="w-40 h-40 bg-slate-900 p-2 rounded-lg flex flex-col items-center justify-center text-amber-400 space-y-1">
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 bg-slate-950 rounded">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i * 7 + 3) % 2 === 0 ? 'bg-amber-400' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-slate-900 px-2 py-0.5 rounded border border-amber-400 text-[9px] font-black text-amber-300">
                    FABRIQ VIP
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-300 block">{customerName}</span>
                <span className="text-[10px] text-slate-400 font-mono block">{memberTier} • ID #VIP-9042</span>
              </div>
            </div>

            {/* Store & Beverage Preference Controls */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  1. Select Boutique Location:
                </label>
                <select
                  value={selectedStore.id}
                  onChange={(e) => {
                    const st = STORES.find((s) => s.id === e.target.value);
                    if (st) setSelectedStore(st);
                  }}
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  2. VIP Lounge Beverage Preference:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Italian Espresso', 'Organic Earl Grey', 'Sparkling Mineral'].map((bev) => (
                    <button
                      key={bev}
                      type="button"
                      onClick={() => setBeverage(bev)}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        beverage === bev
                          ? 'bg-amber-400 text-slate-950 border-amber-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {bev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Scanner Check-In Action */}
            <button
              onClick={handleSimulateCheckIn}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Tap to Check-In at {selectedStore.name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
