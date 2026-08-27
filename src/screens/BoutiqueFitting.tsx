import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { FabriQAiCrownLogo } from '../components/FabriQAiCrownLogo';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const BoutiqueFitting: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [selectedFabric, setSelectedFabric] = useState<string>('Italian Super 150s Wool');
  const [selectedStyle, setSelectedStyle] = useState<string>('Single-Breasted Notch');
  const [isScanActive, setIsScanActive] = useState<boolean>(false);
  const [scanCompleted, setScanCompleted] = useState<boolean>(true);
  const [profileVersion, setProfileVersion] = useState<number>(1);
  const [syncedMsg, setSyncedMsg] = useState<string>('Version 1 synced to Enterprise Cloud');

  const start3DFitScan = () => {
    setIsScanActive(true);
    setTimeout(async () => {
      setIsScanActive(false);
      setScanCompleted(true);
      const nextVer = profileVersion + 1;
      setProfileVersion(nextVer);
      setSyncedMsg(`Version ${nextVer} synced to Enterprise Cloud`);

      try {
        await fetch('/api/customer-measurements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token-boutique-patron',
          },
          body: JSON.stringify({
            customerId: 'cust-101',
            profileName: 'Bespoke Atelier Fit Profile',
            measurements: {
              chestCm: 102,
              waistCm: 84,
              sleeveCm: 65,
              shoulderCm: 46,
              neckCm: 39,
              inseamCm: 81,
            },
          }),
        });
      } catch {
        // Fallback for offline mode
      }
    }, 2500);
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
                <span className="material-symbols-outlined text-[14px]">checkroom</span>
                FABRIQ BOUTIQUE
              </span>
            </div>
            <FabriQAiCrownLogo size="sm" theme="navy" showSubtitle={false} />
          </div>

          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-[#FAF9F6]">
            3D Bespoke Fitting & Tailoring
          </h1>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
            Precision AI millimeter measurements and bespoke haute couture suit & bridal atelier.
          </p>
        </div>
      </section>

      {/* 3D Body Measurement Scan Card */}
      <section className="px-5 my-3">
        <div className="bg-[#0B1528] rounded-3xl p-6 border border-[#C29C6D]/30 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-black text-[#E5C07B] bg-[#070F1E] border border-[#C29C6D]/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                3D AI BODY SCANNER
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6] mt-2">
                Your Precision Fit Avatar
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center">
              <span className="material-symbols-outlined">3d_rotation</span>
            </div>
          </div>

          {/* Interactive Scan Display */}
          <div className="relative h-48 rounded-2xl bg-[#050A14] border border-[#C29C6D]/20 flex items-center justify-center text-white overflow-hidden my-3">
            {isScanActive ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-4xl text-[#D4AF37] animate-spin">
                  filter_center_focus
                </span>
                <span className="text-xs font-bold text-[#E5C07B]">Scanning 48 Key Body Nodes...</span>
                <div className="w-36 bg-[#0B1528] h-1.5 rounded-full overflow-hidden border border-[#C29C6D]/30">
                  <div className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] h-full w-[80%] animate-pulse"></div>
                </div>
              </div>
            ) : scanCompleted ? (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[28px]">verified</span>
                </div>
                <h4 className="font-bold text-sm text-[#FAF9F6]">Millimeter Precision Profile Ready (v{profileVersion})</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Chest: 102cm • Waist: 84cm • Sleeve: 65cm • Shoulder: 46cm
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/40">
                    100% Master Tailor Verified
                  </span>
                  <span className="text-[10px] text-[#E5C07B] font-medium bg-[#070F1E] px-2.5 py-0.5 rounded-full border border-[#C29C6D]/30">
                    {syncedMsg}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={start3DFitScan}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer hover:opacity-90"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                <span>Start 3D Fit Camera Scan</span>
              </button>
            )}
          </div>

          <div className="flex justify-between items-center text-xs pt-2">
            <span className="text-slate-400">Profile synced with Jubilee Hills Atelier</span>
            <button
              onClick={start3DFitScan}
              className="text-[#E5C07B] font-bold hover:underline cursor-pointer"
            >
              Recalibrate Scan
            </button>
          </div>
        </div>
      </section>

      {/* Fabric Selection Suite */}
      <section className="px-5 my-4">
        <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-[#FAF9F6] mb-3">
          Haute Couture Fabric Selection
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
                  ? 'bg-[#0E1B33] border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/30'
                  : 'bg-[#0B1528] border-[#C29C6D]/30 hover:border-[#D4AF37]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-[#0B1528] uppercase bg-[#E5C07B] px-2 py-0.5 rounded-md">
                    {fab.tag}
                  </span>
                  {selectedFabric === fab.name && (
                    <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">check_circle</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#FAF9F6] mt-2">{fab.name}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{fab.origin} • {fab.weight}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA to Book Tailor */}
      <section className="px-5 my-4">
        <div className="bg-[#0B1528] border-2 border-[#C29C6D]/40 text-[#FAF9F6] p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-widest">
              PRIVATE MASTER TAILOR APPOINTMENT
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6] mt-1">
              Ready to Craft Your Custom Bespoke Suit?
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Schedule a 1-on-1 fitting session at the FabriQ Atelier or in your private residence.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bespoke-tailor')}
            className="w-full sm:w-auto px-6 min-h-[44px] rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-98"
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
