'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Check,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { authMode, setAuthMode, signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        }
      } else {
        const res = await signUp(email, password, fullName);
        if (res.error) {
          setError(res.error);
        } else if (res.message) {
          setSuccessMessage(res.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#070b13] text-slate-100 relative lg:overflow-hidden flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[600px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header with prominent physical logo */}
      <header className="w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo.svg"
              alt="CloudPrep Logo"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform hover:scale-105 filter drop-shadow-[0_4px_16px_rgba(56,189,248,0.35)]"
            />
          </div>
        </div>
      </header>

      {/* Main Landing Area: Overview & Study Buddy on Left, Authentication on Right */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 flex items-center min-h-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Overview & Study Buddy Photo                 */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 xl:space-y-5">
            {/* Exam Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Microsoft Certified: Azure Fundamentals</span>
            </div>

            {/* Condensed Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Master AZ-900 with your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                  AI companion
                </span>
                .
              </h1>
            </div>

            {/* AI Study Buddy Visual */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-[#0e1626] to-[#070b14] shadow-2xl shadow-sky-950/40 group w-full max-w-md xl:max-w-lg">
              <div className="relative w-full aspect-[1275/1233] max-h-[250px] sm:max-h-[290px] xl:max-h-[320px] overflow-hidden flex items-center justify-center p-3 bg-slate-950/60">
                <img
                  src="/study-buddy.png"
                  alt="Study Buddy"
                  className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>2026 Curriculum Aligned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dynamic Schedule Rebalancer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Readiness Scoring</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Authentication Beside the Overview          */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-[#0c1220]/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl p-5 sm:p-6">
              {/* Mode Switch Tabs (Sign In is first option) */}
              <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'signin'
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'signup'
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mb-3.5">
                <h2 className="text-sm font-semibold text-white">
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {authMode === 'signin'
                    ? 'Enter your credentials to resume your progress.'
                    : 'Set up your profile to generate your study schedule.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{successMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-300">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                      className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </span>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In to Suite' : 'Create Study Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-2 sm:py-2.5 shrink-0 border-t border-slate-800/80 bg-[#070b13] text-center text-[11px] text-slate-500">
        <p>
          CloudPrep AZ-900 • Unofficial study companion. Microsoft and Azure are trademarks of the Microsoft group of companies.
        </p>
      </footer>
    </div>
  );
};
