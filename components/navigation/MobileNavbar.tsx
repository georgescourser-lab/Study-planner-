'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud, Menu, X, Settings } from 'lucide-react';

interface MobileNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  isOpen,
  onToggle,
  onOpenSettings,
}) => {
  return (
    <header className="flex lg:hidden sticky top-0 z-40 w-full h-16 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 items-center justify-between">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg p-1"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
          <Cloud className="w-4 h-4" aria-hidden="true" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-base tracking-tight text-white">
            CloudPrep <span className="text-sky-400 font-extrabold">AI</span>
          </span>
        </div>
      </Link>

      {/* Action buttons on right */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open study settings"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
};
