'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
  RotateCcw,
  Cpu,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_USER_PREFERENCES } from '@/lib/mock-az900-plan';
import { UserPreferences, PlanState } from '@/types/study-plan';

const STORAGE_KEY = 'az900_vibe_planner_state_v2';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PlanState = JSON.parse(saved);
        if (parsed.preferences) {
          setPreferences(parsed.preferences);
        }
      }
    } catch (e) {
      console.warn('Error reading settings from storage:', e);
    }
  }, []);

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
      setTimeout(() => setIsSaved(false), 2000);
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
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span>Preferences & Constraints</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Study Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your AZ-900 target exam date and daily learning capacity.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-slate-800 space-y-6">
        <div className="space-y-6">
          {/* Target Exam Date */}
          <div className="space-y-2">
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
              className="w-full max-w-md px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 text-sm transition-colors"
            />
            <p className="text-xs text-slate-500">
              The AI automatically recalculates days remaining and weights your schedule against this deadline.
            </p>
          </div>

          {/* Daily Study Capacity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              Daily Study Capacity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md">
              {[15, 30, 45, 60].map((mins) => {
                const selected = preferences.dailyCapacityMins === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, dailyCapacityMins: mins }))
                    }
                    className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                      selected
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm shadow-sky-500/20'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {mins} Mins
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekend Multiplier Switch */}
          <div className="max-w-xl flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Weekend Study Multiplier (1.5x)
              </span>
              <p className="text-[11px] text-slate-400">
                Automatically allocate 50% extra capacity on Saturdays and Sundays.
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
          <div className="max-w-xl p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  AI Schedule Engine
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Google Gemini / Azure Fundamentals Curriculum Engine
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Operational
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Study Data</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-md shadow-sky-500/30"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
