'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, Settings, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { NAV_ITEMS } from './nav-config';
import { NavItem } from './NavItem';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AZ';
  };

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
          <img
            src="/logo.svg"
            alt="CloudPrep Logo"
            className="w-8 h-8 object-contain"
          />

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

      {/* Bottom Section: User Auth & Settings */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b13] space-y-2">
        {/* User Account / Sign In State */}
        {user ? (
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                {getInitials(user.fullName, user.email)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user.fullName || user.email.split('@')[0]}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[10px] text-slate-400 truncate">
                    Azure Candidate
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              aria-label="Sign out of account"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group outline-none"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            <span>Settings</span>
          </div>
          <span className="text-[10px] text-slate-600">Preferences</span>
        </button>
      </div>
    </aside>
  );
};
