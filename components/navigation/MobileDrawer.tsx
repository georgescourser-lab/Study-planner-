'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, X, Settings, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { NAV_ITEMS } from './nav-config';
import { NavItem } from './NavItem';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggleButton } from '@/contexts/ThemeContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Drawer"
    >
      {/* Backdrop with fade-in */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container with slide-in animation */}
      <div className="fixed top-0 bottom-0 left-0 w-4/5 max-w-xs bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 outline-none"
          >
            <img
              src="/logo.svg"
              alt="CloudPrep Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-base tracking-tight text-white">
              CloudPrep <span className="text-sky-400 font-extrabold">AI</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Navigation
            </span>
            <nav className="space-y-1" aria-label="Mobile Navigation">
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
                    onClick={onClose}
                  />
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Auth, Settings & Disclaimer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3 dark:border-slate-800 dark:bg-[#070b13]">
          <ThemeToggleButton />
          {user ? (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {(user.fullName || user.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {user.fullName || user.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Azure Candidate
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Preferences</span>
            </div>
            <span className="text-[10px] text-slate-500">Edit</span>
          </button>

          {/* Unofficial AZ-900 Study Tool Label */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Unofficial AZ-900 Study Tool</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Not affiliated with Microsoft
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
