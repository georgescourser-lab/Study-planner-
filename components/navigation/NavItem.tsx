'use client';

import React from 'react';
import Link from 'next/link';
import { NavItemConfig } from './nav-config';

interface NavItemProps {
  item: NavItemConfig;
  isActive: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      title={item.description}
      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
        isActive
          ? 'bg-sky-500/10 text-sky-400 font-semibold shadow-sm shadow-sky-500/5'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {/* Active accent pill on left border */}
      {isActive && (
        <span
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-400 shadow-sm shadow-sky-400/50"
          aria-hidden="true"
        />
      )}

      {/* Icon with smooth color transition */}
      <Icon
        className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
          isActive
            ? 'text-sky-400'
            : 'text-slate-400 group-hover:text-slate-200'
        }`}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="flex-1 truncate">{item.label}</span>

      {/* Optional Badge */}
      {item.badge && (
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
            item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
};
