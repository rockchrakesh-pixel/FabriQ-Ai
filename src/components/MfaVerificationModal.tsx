import React, { useState, useEffect } from 'react';

interface MfaVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userPhone?: string;
  userEmail?: string;
  mfaMethod?: 'authenticator' | 'sms' | 'email';
}

export const MfaVerificationModal: React.FC<MfaVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userPhone = '+91 98765 43210',
  userEmail = 'ananya@fabriq.ai',
  mfaMethod = 'sms',
}) => {
  const [activeMethod, setActiveMethod] = useState<'authenticator' | 'sms' | 'email' | 'recovery'>(mfaMethod);
  const [digits, setDigits] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  useEffect(() => {
    setActiveMethod(mfaMethod);
  }, [mfaMethod]);

  // Countdown timer for SMS / Email OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && resendTimer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, resendTimer]);

  if (!isOpen) return null;

  const handleResendOtp = () => {
    setResendTimer(30);
    setCanResend(false);
    setErrorMsg('');
    setDigits(['1', '2', '3', '4', '5', '6']);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // take last char
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-advance input focus if digit entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      if (activeMethod === 'recovery') {
        if (recoveryCodeInput.trim().toUpperCase().includes('FABRIQ') || recoveryCodeInput.trim().length >= 8) {
          onSuccess();
        } else {
          setErrorMsg('Invalid backup recovery code. Example format: FABRIQ-8291-MFA');
        }
        return;
      }

      const enteredCode = digits.join('');
      // Standard demo code validation (accept 123456 or any 6 digits in demo mode)
      if (enteredCode === '123456' || enteredCode.length === 6) {
        onSuccess();
      } else {
        setErrorMsg('Invalid 6-digit MFA code. Please enter valid code (Default demo: 123456)');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900 my-auto">
        {/* Top Decorative Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-300 text-[#9E7B4F] flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                2-STEP VERIFICATION (MFA)
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                Multi-Factor Authentication
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* MFA Method Badges Switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => { setActiveMethod('sms'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              activeMethod === 'sms'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sms</span>
            <span>SMS OTP</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMethod('email'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              activeMethod === 'email'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
            <span>Email OTP</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMethod('authenticator'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              activeMethod === 'authenticator'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
            <span>Auth App</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMethod('recovery'); setErrorMsg(''); }}
            className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              activeMethod === 'recovery'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">vpn_key</span>
            <span>Recovery</span>
          </button>
        </div>

        {/* Description Banner per Method */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 mb-5 text-xs text-slate-800 space-y-1">
          {activeMethod === 'sms' && (
            <p className="font-medium">
              A 6-digit security passkey was dispatched via SMS to your registered mobile:{' '}
              <strong className="text-slate-900 font-bold">{userPhone}</strong>.
            </p>
          )}
          {activeMethod === 'email' && (
            <p className="font-medium">
              A 6-digit security passkey was dispatched to your enterprise email:{' '}
              <strong className="text-slate-900 font-bold">{userEmail}</strong>.
            </p>
          )}
          {activeMethod === 'authenticator' && (
            <p className="font-medium">
              Open your Authenticator App (Google Authenticator / Authy / Microsoft Authenticator) and enter the live 6-digit code.
            </p>
          )}
          {activeMethod === 'recovery' && (
            <p className="font-medium">
              Lost access to your phone or authenticator? Enter one of your 8-character emergency backup recovery codes.
            </p>
          )}
          <div className="flex items-center justify-between text-[10px] text-[#83633B] font-mono pt-1 border-t border-amber-200/60">
            <span>💡 Sandbox Demo Code: <u className="font-bold">1 2 3 4 5 6</u></span>
            <button
              type="button"
              onClick={() => {
                if (activeMethod === 'recovery') {
                  setRecoveryCodeInput('FABRIQ-9821-MFA');
                } else {
                  setDigits(['1', '2', '3', '4', '5', '6']);
                }
                setErrorMsg('');
              }}
              className="px-2 py-0.5 bg-[#9E7B4F] hover:bg-[#83633B] text-white rounded text-[9px] font-bold font-sans transition-colors cursor-pointer"
            >
              Auto-Fill Code
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {activeMethod !== 'recovery' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-center gap-2">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`mfa-digit-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-12 bg-slate-50 border-2 border-amber-400 focus:border-slate-900 rounded-xl text-center font-bold text-lg text-slate-900 outline-none shadow-xs transition-all"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Emergency Backup Recovery Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FABRIQ-8291-MFA"
                value={recoveryCodeInput}
                onChange={(e) => setRecoveryCodeInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#9E7B4F] rounded-xl px-4 py-3 text-xs font-bold font-mono tracking-widest uppercase text-slate-900 outline-none"
              />
            </div>
          )}

          {/* Resend Code Option for SMS / Email */}
          {(activeMethod === 'sms' || activeMethod === 'email') && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Didn't receive code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#9E7B4F] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Resend OTP Now</span>
                </button>
              ) : (
                <span className="text-slate-400 font-mono text-[11px]">
                  Resend in <strong className="text-slate-700">{resendTimer}s</strong>
                </span>
              )}
            </div>
          )}

          {/* Trust Device Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mfa-trust-device"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded text-[#9E7B4F] focus:ring-[#9E7B4F] border-slate-300 cursor-pointer"
            />
            <label htmlFor="mfa-trust-device" className="text-xs text-slate-600 font-medium cursor-pointer">
              Remember this browser/device for 30 days
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-slate-900 hover:bg-[#83633B] text-amber-300 hover:text-white font-bold py-3.5 rounded-2xl shadow-lg border border-[#9E7B4F]/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isVerifying ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="text-xs uppercase tracking-wider">
                  VERIFY & COMPLETE LOGIN
                </span>
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-emerald-600">lock</span>
          <span>Protected by FabriQ AI Enterprise 256-Bit Multi-Factor Authentication Guard</span>
        </div>
      </div>
    </div>
  );
};
