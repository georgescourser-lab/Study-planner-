'use client';

import React from 'react';
import { Cloud, Sliders, Zap, RotateCcw, ExternalLink, Sparkles, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  onOpenConfigure: () => void;
  onLoadJudgeDemo: () => void;
  onResetPlan: () => void;
  readinessScore: number;
  completedCount: number;
  totalDays: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenConfigure,
  onLoadJudgeDemo,
  onResetPlan,
  readinessScore,
  completedCount,
  totalDays,
}) => {
  const { user, openAuthModal, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-500/20 text-white">
            <Cloud className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                AZ-900 <span className="text-sky-400 font-extrabold">Vibe Planner</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                AI Adaptive
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Microsoft Certified: Azure Fundamentals Study Accelerator
            </p>
          </div>
        </div>

        {/* Quick Stats & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Progress Indicator */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{completedCount}/{totalDays} Days Done</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="font-semibold text-sky-400">
              {readinessScore}% Ready
            </div>
          </div>

          {/* Instant Judge Demo CTA */}
          <button
            onClick={onLoadJudgeDemo}
            title="Load instant pre-populated 7-day plan with 2 days completed for judges"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-amber-500/10"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="hidden xs:inline">Judge Demo</span>
            <span className="xs:hidden">Demo</span>
          </button>

          {/* Configure Plan Button */}
          <button
            onClick={onOpenConfigure}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all hover:border-sky-500/40"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Configure Plan</span>
          </button>

          {/* Official MS Learn Reference */}
          <a
            href="https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AZ-900 Hub</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* User Auth Profile or Sign In CTA */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {(user.fullName || user.email).slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden xl:inline text-slate-300 font-medium truncate max-w-[100px]">
                  {user.fullName?.split(' ')[0] || user.email.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={onResetPlan}
            title="Reset Plan to Default"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
