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
    <header className="flex lg:hidden sticky top-0 z-40 w-full h-14 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 items-center justify-between">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2 outline-none rounded-lg"
      >
        <img
          src="/logo.svg"
          alt="CloudPrep Logo"
          className="w-7 h-7 object-contain"
        />

        <span className="font-bold text-sm tracking-tight text-white">
          CloudPrep <span className="text-sky-400 font-semibold">AZ-900</span>
        </span>
      </Link>

      {/* Action buttons on right */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open study settings"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
