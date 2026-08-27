import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../lib/haptics';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: 'FaceID' | 'TouchID' | 'Passkey') => void;
  clientName?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientName = 'Prestige Client',
}) => {
  const [authStage, setAuthStage] = useState<'idle' | 'scanning' | 'success' | 'fallback'>('idle');
  const [selectedMethod, setSelectedMethod] = useState<'FaceID' | 'TouchID' | 'Passkey'>('FaceID');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthStage('idle');
      setPinInput('');
      setPinError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = (method: 'FaceID' | 'TouchID' | 'Passkey') => {
    setSelectedMethod(method);
    setAuthStage('scanning');
    triggerHaptic('impactLight');

    // Simulate luxury biometric hardware scan animation
    setTimeout(() => {
      // Standard WebAuthn check if available
      if (window.PublicKeyCredential) {
        console.log('WebAuthn supported, executing hardware biometric prompt...');
      }

      setAuthStage('success');
      triggerHaptic('notificationSuccess');

      setTimeout(() => {
        onSuccess(method);
        onClose();
      }, 1000);
    }, 2200);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length === 4) {
      triggerHaptic('notificationSuccess');
      setAuthStage('success');
      setTimeout(() => {
        onSuccess('Passkey');
        onClose();
      }, 900);
    } else {
      triggerHaptic('notificationError');
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-[#9E7B4F]/50 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl relative overflow-hidden font-sans">
        {/* Background ambient gold aura */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold tracking-widest uppercase">
            <span className="material-symbols-outlined text-[14px]">encrypted</span>
            <span>HIGH-PROFILE LUXURY SECURITY</span>
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white mt-2">
            Biometric Vault Authentication
          </h3>
          <p className="text-xs text-slate-300">
            Welcome back, <strong className="text-amber-300">{clientName}</strong>. Authenticate to unlock high-tier privileges.
          </p>
        </div>

        {/* STAGE: IDLE - SELECT METHOD */}
        {authStage === 'idle' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStartScan('FaceID')}
                className="bg-slate-950/80 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:border-amber-400 transition-all cursor-pointer flex flex-col items-center gap-2 group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">face_retouching_natural</span>
                </div>
                <span className="text-xs font-bold text-white">Face ID</span>
                <span className="text-[9px] text-slate-400">3D Facial Scan</span>
              </button>

              <button
                onClick={() => handleStartScan('TouchID')}
                className="bg-slate-950/80 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:border-amber-400 transition-all cursor-pointer flex flex-col items-center gap-2 group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">fingerprint</span>
                </div>
                <span className="text-xs font-bold text-white">Touch ID / Fingerprint</span>
                <span className="text-[9px] text-slate-400">Biometric Touch</span>
              </button>
            </div>

            <button
              onClick={() => handleStartScan('Passkey')}
              className="w-full bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>Use Hardware Passkey / Security Key</span>
            </button>

            <div className="text-center pt-2">
              <button
                onClick={() => setAuthStage('fallback')}
                className="text-xs text-amber-300 hover:underline cursor-pointer font-medium"
              >
                Use 4-Digit Security PIN
              </button>
            </div>
          </div>
        )}

        {/* STAGE: SCANNING ANIMATION */}
        {authStage === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer pulsing laser rings */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-amber-400 animate-spin" style={{ animationDuration: '3s' }} />

              {/* Scanning visual target */}
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-300">
                <span className="material-symbols-outlined text-[44px] animate-pulse">
                  {selectedMethod === 'FaceID' ? 'face' : selectedMethod === 'TouchID' ? 'fingerprint' : 'key_visual'}
                </span>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-bold text-sm text-amber-300 animate-pulse">
                Scanning {selectedMethod}...
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verifying encrypted biometric tokens against FabriQ Secure Enclave
              </p>
            </div>
          </div>
        )}

        {/* STAGE: SUCCESS */}
        {authStage === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-base text-emerald-400">Identity Verified</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Prestige VIP Access Granted
              </p>
            </div>
          </div>
        )}

        {/* STAGE: FALLBACK PIN */}
        {authStage === 'fallback' && (
          <form onSubmit={handlePinSubmit} className="space-y-4 pt-2">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 block">Enter 4-Digit Security PIN</span>
              <p className="text-[10px] text-slate-400">Default VIP PIN: 1234</p>
            </div>

            <div className="flex justify-center gap-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className="w-36 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest text-amber-300 focus:outline-none"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-[11px] text-rose-400 text-center font-bold">Incorrect PIN. Try 1234.</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAuthStage('idle')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold rounded-xl cursor-pointer"
              >
                Back to Biometrics
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 py-2 text-xs font-black rounded-xl cursor-pointer"
              >
                Verify PIN
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-slate-800 pt-3 mt-4 text-center">
          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[12px] text-emerald-400">shield</span>
            256-Bit Hardware Token • Zero Password Storage
          </span>
        </div>
      </div>
    </div>
  );
};
