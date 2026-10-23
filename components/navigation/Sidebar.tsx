'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, Settings } from 'lucide-react';
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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 text-slate-950 font-bold">
            <Cloud className="w-4 h-4 text-slate-950" aria-hidden="true" />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-sky-300 transition-colors">
              CloudPrep <span className="text-sky-400 font-semibold">AZ-900</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Study Planner
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
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

      {/* Bottom Section: Settings */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b13]">
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group outline-none"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
            <span>Settings</span>
          </div>
          <span className="text-[10px] text-slate-600">Preferences</span>
        </button>
      </div>
    </aside>
  );
};
