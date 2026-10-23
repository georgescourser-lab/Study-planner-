'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from './nav-config';
import { NavItem } from './NavItem';

interface SidebarProps {
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 xl:w-72 bg-[#090d16] border-r border-slate-800/80 z-30 select-none"
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80">
        <Link
          href="/"
          className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg p-1"
        >
          {/* Simple Cloud Icon - No Microsoft Logo */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            <Cloud className="w-5 h-5" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
                CloudPrep <span className="text-sky-400 font-extrabold">AI</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              AZ-900 Exam Prep
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Study Suite
          </span>
          <nav className="space-y-1" aria-label="Study Suite">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                />
              );
            })}
          </nav>
        </div>

        {/* Quick Study Tip Badge */}
        <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-sky-400">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AZ-900 Exam Rule</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Target 700/1000 to pass. Architecture & Services is the highest-weight domain (35–40%).
          </p>
        </div>
      </div>

      {/* Bottom Section: Settings & Unofficial Disclaimer */}
      <div className="p-3.5 border-t border-slate-800/80 space-y-3 bg-[#070b13]">
        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
            <span>Settings & Preferences</span>
          </div>
          <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
            Edit
          </span>
        </button>

        {/* Unofficial AZ-900 Study Tool Label */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1.5 text-slate-300 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Unofficial AZ-900 Study Tool</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Not affiliated with Microsoft
          </p>
        </div>
      </div>
    </aside>
  );
};
