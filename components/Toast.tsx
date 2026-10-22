'use client';

import React, { useEffect } from 'react';
import { RefreshCw, CheckCircle2, X, Zap } from 'lucide-react';

interface ToastProps {
  message: string;
  subMessage?: string;
  type?: 'success' | 'rebalance' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  subMessage,
  type = 'rebalance',
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl glass-panel-elevated border border-amber-500/40 shadow-2xl shadow-amber-500/10 flex items-start gap-3.5 text-white">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <Zap className="w-5 h-5 fill-amber-400" />
        </div>

        <div className="flex-1 pr-2">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            {message}
          </h4>
          {subMessage && (
            <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
              {subMessage}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
