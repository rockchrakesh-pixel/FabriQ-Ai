import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const BoutiqueFitting: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [selectedFabric, setSelectedFabric] = useState<string>('Italian Super 150s Wool');
  const [selectedStyle, setSelectedStyle] = useState<string>('Single-Breasted Notch');
  const [isScanActive, setIsScanActive] = useState<boolean>(false);
  const [scanCompleted, setScanCompleted] = useState<boolean>(true);

  const start3DFitScan = () => {
    setIsScanActive(true);
    setTimeout(() => {
      setIsScanActive(false);
      setScanCompleted(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen">
      
      {/* Header Banner */}
      <section className="px-5 pt-5 pb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-widest font-sans flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">checkroom</span>
            FABRIQ AI BOTIQUE • DIVISION 2
          </span>
          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-slate-900">
            3D Bespoke Fitting & Tailoring
          </h1>
          <p className="text-xs text-slate-500">
            Precision AI millimeter measurements and bespoke haute couture suit & gown studio.
          </p>
        </div>
      </section>

      {/* 3D Body Measurement Scan Card */}
      <section className="px-5 my-3">
        <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                3D AI BODY SCANNER
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
                Your Precision Fit Avatar
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <span className="material-symbols-outlined">3d_rotation</span>
            </div>
          </div>

          {/* Interactive Scan Display */}
          <div className="relative h-48 rounded-2xl bg-gradient-to-b from-purple-950 to-slate-900 flex items-center justify-center text-white overflow-hidden my-3">
            {isScanActive ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-4xl text-purple-400 animate-spin">
                  filter_center_focus
                </span>
                <span className="text-xs font-bold text-purple-300">Scanning 48 Key Body Nodes...</span>
                <div className="w-36 bg-purple-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full w-[80%] animate-pulse"></div>
                </div>
              </div>
            ) : scanCompleted ? (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[28px]">verified</span>
                </div>
                <h4 className="font-bold text-sm text-white">Millimeter Precision Profile Ready</h4>
                <p className="text-[11px] text-purple-200 mt-0.5">
                  Chest: 102cm • Waist: 84cm • Sleeve: 65cm • Shoulder: 46cm
                </p>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  100% Master Tailor Verified
                </span>
              </div>
            ) : (
              <button
                onClick={start3DFitScan}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                <span>Start 3D Fit Camera Scan</span>
              </button>
            )}
          </div>

          <div className="flex justify-between items-center text-xs pt-2">
            <span className="text-slate-500">Last updated: Today</span>
            <button
              onClick={start3DFitScan}
              className="text-purple-700 font-bold hover:underline"
            >
              Recalibrate Scan
            </button>
          </div>
        </div>
      </section>

      {/* Fabric Selection Suite */}
      <section className="px-5 my-4">
        <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 mb-3">
          Luxury Fabric Selection
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Italian Super 150s Wool', origin: 'Loro Piana, Italy', weight: '240g/m', tag: 'Classic Suiting' },
            { name: 'Pure Mulberry Silk Satin', origin: 'Como, Italy', weight: '180g/m', tag: 'Evening Gowns' },
            { name: 'Bespoke Velvet Jacquard', origin: 'Lyon, France', weight: '310g/m', tag: 'Gala & Tuxedo' },
            { name: 'Scottish Cashmere & Wool', origin: 'Edinburgh, UK', weight: '290g/m', tag: 'Overcoats' },
          ].map((fab) => (
            <div
              key={fab.name}
              onClick={() => setSelectedFabric(fab.name)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedFabric === fab.name
                  ? 'bg-purple-50/80 border-purple-700 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-purple-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-100/70 px-2 py-0.5 rounded-md">
                    {fab.tag}
                  </span>
                  {selectedFabric === fab.name && (
                    <span className="material-symbols-outlined text-purple-700 text-[18px]">check_circle</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{fab.name}</h4>
                <p className="text-xs text-slate-500">{fab.origin} • {fab.weight}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA to Book Tailor */}
      <section className="px-5 my-4">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              PRIVATE MASTER TAILOR APPOINTMENT
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-1">
              Ready to Craft Your Custom Bespoke Suit?
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Schedule a 1-on-1 fitting session at the FabriQ AI Studio or in your private residence.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bespoke-tailor')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#9E7B4F] hover:bg-[#83633B] text-white font-bold text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Book Tailor Session</span>
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
          </button>
        </div>
      </section>

      <BottomNav activePath="boutique" onNavigate={onNavigate} />
    </div>
  );
};
