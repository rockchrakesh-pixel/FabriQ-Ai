import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';
import { FabriQAiLogoFramed } from './FabriQAiLogoFramed';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signUp, resetPassword, triggerMfaChallenge } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email, password);
        setSuccessMsg('Email & password verified. Prompting Multi-Factor Authentication (MFA)...');
        setTimeout(() => {
          triggerMfaChallenge(() => {
            if (localStorage.getItem('fabriq_terms_accepted') !== 'true') {
              setShowTerms(true);
            } else {
              onClose();
            }
          });
        }, 600);
      } else if (mode === 'signup') {
        if (!email || !password || !name) {
          throw new Error('Please fill in your name, email, and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await signUp(email, password, name, phone);
        setSuccessMsg('Account created successfully! Prompting MFA 2-Step verification...');
        setTimeout(() => {
          triggerMfaChallenge(() => {
            setShowTerms(true);
          });
        }, 800);
      } else if (mode === 'reset') {
        if (!email) {
          throw new Error('Please enter your email address to receive a reset link.');
        }
        await resetPassword(email);
        setSuccessMsg(`Password reset email sent to ${email}. Check your inbox!`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'An error occurred during authentication.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try logging in instead.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F0F0F] border border-[#2A2A2A] rounded-3xl shadow-2xl overflow-hidden p-6 text-[#F2F2F2]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1A1A1A] text-gray-400 hover:text-white flex items-center justify-center border border-[#2A2A2A] transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <FabriQAiLogoFramed size="md" showSubtitle={true} className="mb-2" />
          <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#F2F2F2] mt-1">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <p className="text-[10px] text-[#C29C6D] uppercase tracking-widest mt-0.5 font-bold">
            BESPOKE FABRIC CARE & ATELIER ACCESS
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'reset' && (
          <div className="flex bg-[#161616] p-1 rounded-2xl border border-[#2A2A2A] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[#C29C6D] text-[#0A0A0A] shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-[#C29C6D] text-[#0A0A0A] shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. CH Rakesh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F2F2F2] placeholder-gray-600 focus:outline-none focus:border-[#C29C6D]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F2F2F2] placeholder-gray-600 focus:outline-none focus:border-[#C29C6D]"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs text-[#C29C6D] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F2F2F2] placeholder-gray-600 focus:outline-none focus:border-[#C29C6D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 text-[18px]">
                  call
                </span>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F2F2F2] placeholder-gray-600 focus:outline-none focus:border-[#C29C6D]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#C29C6D] hover:bg-[#d4b187] text-[#0A0A0A] font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Email'}
                </span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        {mode === 'reset' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Sign In
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#2A2A2A] text-center text-[11px] text-gray-500">
          Secured by Firebase Authentication • 256-Bit SSL Encryption
        </div>
      </div>

      <TermsAndConditionsModal
        isOpen={showTerms}
        onClose={() => {
          setShowTerms(false);
          onClose();
        }}
        onAccept={() => {
          setShowTerms(false);
          onClose();
        }}
        showAcceptButton={true}
      />
    </div>
  );
};
