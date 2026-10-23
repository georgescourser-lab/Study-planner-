'use client';

import React, { useState, useEffect } from 'react';
import { Settings, X, Calendar, Clock, Zap, CheckCircle2, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';
import { DEFAULT_USER_PREFERENCES } from '@/lib/mock-az900-plan';
import { UserPreferences, PlanState } from '@/types/study-plan';

const STORAGE_KEY = 'az900_vibe_planner_state_v2';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);

  // Load existing preferences from localStorage on open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PlanState = JSON.parse(saved);
        if (parsed.preferences) {
          setPreferences(parsed.preferences);
        }
      }
    } catch (e) {
      console.warn('Error reading preferences from storage:', e);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let currentState: PlanState = {
        preferences,
        days: [],
      };
      if (saved) {
        const parsed = JSON.parse(saved);
        currentState = {
          ...parsed,
          preferences,
        };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
        // Optional dispatch storage event or window reload if needed
        window.dispatchEvent(new Event('storage'));
      }, 700);
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all saved study data and preferences to default?')) {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences(DEFAULT_USER_PREFERENCES);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-title" className="text-lg font-bold text-white tracking-tight">
                Study Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure your AZ-900 exam target & daily capacity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Options */}
        <div className="space-y-5 text-sm">
          {/* Target Exam Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              Target AZ-900 Exam Date
            </label>
            <input
              type="date"
              value={preferences.examDate}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, examDate: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 text-sm transition-colors"
            />
          </div>

          {/* Daily Study Capacity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              Daily Study Capacity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => {
                const selected = preferences.dailyCapacityMins === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, dailyCapacityMins: mins }))
                    }
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      selected
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm shadow-sky-500/20'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekend Multiplier Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Weekend Study Boost (1.5x)
              </span>
              <p className="text-[11px] text-slate-400">
                Allocate 50% more time on Saturdays & Sundays
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.weekendMultiplier}
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  weekendMultiplier: !prev.weekendMultiplier,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                preferences.weekendMultiplier ? 'bg-sky-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  preferences.weekendMultiplier ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* AI Engine Status */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  AI Schedule Engine
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Structured Outputs with Gemini / AZ-900 Engine
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm shadow-sky-500/30"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
