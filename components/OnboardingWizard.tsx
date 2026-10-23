'use client';

import React, { useState, useMemo } from 'react';
import { UserPreferences } from '@/types/study-plan';
import { Sparkles, Zap, Calendar, Clock, BarChart3, ChevronRight, CheckCircle2, Shield, X, AlertCircle } from 'lucide-react';

interface OnboardingWizardProps {
  initialPreferences: UserPreferences;
  onGeneratePlan: (prefs: UserPreferences) => void;
  onLoadJudgeDemo: () => void;
  onClose?: () => void;
  isExistingPlan?: boolean;
}

const CONFIDENCE_LEVEL_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: '1 = Beginner', color: 'text-rose-400', desc: 'No prior Azure exposure' },
  2: { text: '2 = Familiar', color: 'text-amber-400', desc: 'Read a few overview articles' },
  3: { text: '3 = Intermediate', color: 'text-sky-400', desc: 'Hands-on portal experience' },
  4: { text: '4 = Advanced', color: 'text-emerald-400', desc: 'Solid conceptual understanding' },
  5: { text: '5 = Exam Ready', color: 'text-purple-400', desc: 'Scoring 85%+ on mock tests' },
};

const CAPACITY_OPTIONS = [15, 30, 45, 60];

const AI_STEPS = [
  'Analyzing AZ-900 domain weights & syllabus guidelines...',
  'Prioritizing Architecture & Services (35–40% highest weight)...',
  'Injecting MS Learn references & interactive active recall drills...',
  'Finalizing personalized adaptive 7-day milestone roadmap...',
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialPreferences,
  onGeneratePlan,
  onLoadJudgeDemo,
  onClose,
  isExistingPlan = false,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(0);

  const [daysRemaining, setDaysRemaining] = useState(7);
  const [minDate, setMinDate] = useState('');

  // Calculate days remaining dynamically and safely
  React.useEffect(() => {
    try {
      const now = new Date();
      setMinDate(now.toISOString().split('T')[0]);
      if (!preferences.examDate) return;
      const target = new Date(preferences.examDate);
      now.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(diffDays, 1));
    } catch (e) {
      console.warn('Date calculation notice:', e);
    }
  }, [preferences.examDate]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setAiStepIndex(0);

    // Multi-step realistic loading animation
    const stepInterval = setInterval(() => {
      setAiStepIndex((prev) => {
        if (prev < AI_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            setIsGenerating(false);
            onGeneratePlan({
              ...preferences,
              hasCompletedOnboarding: true,
            });
          }, 450);
          return prev;
        }
      });
    }, 550);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto my-6 px-4">
      {/* Glow highlight */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-slate-100 shadow-xl">
        {/* Header with Close option if reconfiguring */}
        <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Study Plan Setup
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Set your target exam date, daily study time, and current topic confidence.
            </p>
          </div>

          {isExistingPlan && onClose && (
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* AI Generating Overlay */}
        {isGenerating ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/30 animate-pulse">
              <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-white">Synthesizing Adaptive Plan</h3>
              <p className="text-sm text-sky-400 font-medium min-h-[40px] transition-all duration-300">
                {AI_STEPS[aiStepIndex]}
              </p>
            </div>

            {/* Progress indicators */}
            <div className="w-full max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${((aiStepIndex + 1) / AI_STEPS.length) * 100}%` }}
              ></div>
            </div>

            <span className="text-xs text-slate-500">
              Step {aiStepIndex + 1} of {AI_STEPS.length}
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Target Exam Date */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  Target AZ-900 Exam Date
                </label>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Remaining
                </span>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={preferences.examDate}
                  min={minDate || undefined}
                  onChange={(e) =>
                    setPreferences({ ...preferences, examDate: e.target.value })
                  }
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Step 2: Daily Study Capacity */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Daily Study Capacity
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAPACITY_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setPreferences({ ...preferences, dailyCapacityMins: mins })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      preferences.dailyCapacityMins === mins
                        ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {mins === 60 ? '60+ mins' : `${mins} mins`}
                  </button>
                ))}
              </div>

              {/* Weekend toggle */}
              <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">2x study time on weekends</p>
                    <p className="text-[11px] text-slate-400">Double duration on Sat & Sun for deep architectural labs</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.weekendMultiplier}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        weekendMultiplier: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>

            {/* Step 3: Domain Confidence Sliders */}
            <div className="space-y-4 pt-1 border-t border-slate-800/80">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Domain Confidence & Self-Assessment
              </label>

              {/* Slider 1: Cloud Concepts */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Cloud Concepts</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      25–30% Exam Weight
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${CONFIDENCE_LEVEL_LABELS[preferences.confidenceLevels.cloudConcepts].color}`}>
                    {CONFIDENCE_LEVEL_LABELS[preferences.confidenceLevels.cloudConcepts].text}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.confidenceLevels.cloudConcepts}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      confidenceLevels: {
                        ...preferences.confidenceLevels,
                        cloudConcepts: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 (Beginner)</span>
                  <span>3 (Intermediate)</span>
                  <span>5 (Exam Ready)</span>
                </div>
              </div>

              {/* Slider 2: Architecture & Services (Highlighted High Priority) */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 shadow-sm shadow-amber-500/5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Azure Architecture & Services</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
                      35–40% High Priority
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${CONFIDENCE_LEVEL_LABELS[preferences.confidenceLevels.architectureServices].color}`}>
                    {CONFIDENCE_LEVEL_LABELS[preferences.confidenceLevels.architectureServices].text}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.confidenceLevels.architectureServices}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      confidenceLevels: {
                        ...preferences.confidenceLevels,
                        architectureServices: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 (Beginner)</span>
                  <span>3 (Intermediate)</span>
                  <span>5 (Exam Ready)</span>
                </div>
              </div>

              {/* Slider 3: Management & Governance */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Azure Management & Governance</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      30–35% Exam Weight
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${CONFIDENCE_LEVEL_LABELS[preferences.confidenceLevels.managementGovernance].color}`}>
                    {CONFIDENCE_LEVEL_LABELS[preferences.confidenceLevels.managementGovernance].text}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.confidenceLevels.managementGovernance}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      confidenceLevels: {
                        ...preferences.confidenceLevels,
                        managementGovernance: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 (Beginner)</span>
                  <span>3 (Intermediate)</span>
                  <span>5 (Exam Ready)</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
              {/* Primary CTA */}
              <button
                type="button"
                onClick={handleGenerate}
                className="flex-1 py-3 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-colors text-center"
              >
                Create Study Plan
              </button>

              {/* Sample Plan CTA */}
              <button
                type="button"
                onClick={onLoadJudgeDemo}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors text-center"
              >
                Load Sample Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
