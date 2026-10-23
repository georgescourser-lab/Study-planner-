'use client';

import React from 'react';
import { Keyboard } from 'lucide-react';

export interface ShortcutItem {
  keys: string[];
  label: string;
  active?: boolean;
}

interface KeyboardNavigatorBarProps {
  shortcuts: ShortcutItem[];
  title?: string;
  className?: string;
}

export const KeyboardNavigatorBar: React.FC<KeyboardNavigatorBarProps> = ({
  shortcuts,
  title = 'Keyboard Navigator',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs shadow-inner ${className}`}
      aria-label="Keyboard shortcuts navigator"
    >
      <div className="flex items-center gap-2 text-slate-400 font-medium">
        <Keyboard className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          {title}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-slate-300">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-150 ${
              shortcut.active
                ? 'bg-sky-500/25 border border-sky-400/60 text-sky-100 shadow-sm shadow-sky-500/30 scale-105'
                : 'bg-slate-900/90 border border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1">
              {shortcut.keys.map((k, kIdx) => (
                <React.Fragment key={kIdx}>
                  {kIdx > 0 && <span className="text-slate-500 text-[10px]">/</span>}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-[10px] font-mono font-bold text-slate-200 shadow-sm">
                    {k}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
            <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">
              {shortcut.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
