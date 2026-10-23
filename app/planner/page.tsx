'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DayPlan, UserPreferences, PlanState } from '@/types/study-plan';
import {
  DEFAULT_USER_PREFERENCES,
  generateInitialMockPlan,
  generateJudgeDemoPlan,
} from '@/lib/mock-az900-plan';
import { fireCelebrationConfetti } from '@/lib/confetti';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { ReadinessHeader } from '@/components/ReadinessHeader';
import { FilterBar, FilterOption } from '@/components/FilterBar';
import { DailyTaskCard } from '@/components/DailyTaskCard';
import { Toast } from '@/components/Toast';
import {
  Sparkles,
  Calendar,
  Zap,
  RefreshCw,
  Sliders,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';

const STORAGE_KEY = 'az900_vibe_planner_state_v2';

export default function StudyPlannerPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [toastInfo, setToastInfo] = useState<{
    show: boolean;
    title: string;
    sub?: string;
  } | null>(null);
  const [isRebalancing, setIsRebalancing] = useState(false);

  // 1. Load from localStorage or initialize
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PlanState = JSON.parse(saved);
        if (parsed.days && parsed.days.length > 0) {
          setDays(parsed.days);
          setPreferences(parsed.preferences || DEFAULT_USER_PREFERENCES);
          setShowOnboarding(!parsed.preferences?.hasCompletedOnboarding);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage plan state:', e);
    }

    // Default: fallback to initial plan
    const initialDays = generateInitialMockPlan();
    setDays(initialDays);
    setPreferences(DEFAULT_USER_PREFERENCES);
    setShowOnboarding(false);
    setIsLoaded(true);
  }, []);

  // 2. Sync to localStorage
  useEffect(() => {
    if (!isLoaded || days.length === 0) return;
    try {
      const stateToSave: PlanState = {
        preferences,
        days,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [days, preferences, isLoaded]);

  // Handle Generate Plan from Wizard
  const handleGeneratePlan = async (newPrefs: UserPreferences) => {
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate: newPrefs.examDate,
          dailyMinutes: newPrefs.dailyCapacityMins,
          confidenceScores: {
            cloud_concepts: newPrefs.confidenceLevels.cloudConcepts,
            architecture_services: newPrefs.confidenceLevels.architectureServices,
            management_governance: newPrefs.confidenceLevels.managementGovernance,
          },
          weekendMultiplier: newPrefs.weekendMultiplier,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.days && data.days.length > 0) {
          setPreferences(newPrefs);
          setDays(data.days);
          setShowOnboarding(false);
          setToastInfo({
            show: true,
            title: 'Roadmap Generated! ✨',
            sub: data.summary || `Personalized ${data.days.length}-day plan optimized for your AZ-900 exam on ${newPrefs.examDate}.`,
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Backend plan generation error, falling back locally:', err);
    }

    // Local fallback in case of offline / network issue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const generated = generateInitialMockPlan(today);

    // Apply capacity & weekend multiplier adjustments
    const adjustedDays = generated.map((day) => {
      let duration = newPrefs.dailyCapacityMins;
      const d = new Date(today);
      d.setDate(d.getDate() + (day.dayNumber - 1));
      const dayOfWeek = d.getDay();
      if (newPrefs.weekendMultiplier && (dayOfWeek === 0 || dayOfWeek === 6)) {
        duration = Math.round(duration * 1.5);
      }
      return {
        ...day,
        estimatedMinutes: duration,
      };
    });

    setPreferences(newPrefs);
    setDays(adjustedDays);
    setShowOnboarding(false);

    setToastInfo({
      show: true,
      title: 'Roadmap Generated! ✨',
      sub: `Personalized 7-day plan optimized for your AZ-900 exam on ${newPrefs.examDate}.`,
    });
  };

  // Handle Instant Judge Demo CTA
  const handleLoadJudgeDemo = () => {
    const demoPlan = generateJudgeDemoPlan();
    const demoPrefs: UserPreferences = {
      ...DEFAULT_USER_PREFERENCES,
      hasCompletedOnboarding: true,
    };
    setDays(demoPlan);
    setPreferences(demoPrefs);
    setShowOnboarding(false);

    // Trigger celebration confetti
    fireCelebrationConfetti();

    setToastInfo({
      show: true,
      title: '⚡ Instant Judge Demo Plan Loaded!',
      sub: 'Day 1 & Day 2 completed. Progress bars and readiness metrics are now dynamically live for demonstration.',
    });
  };

  // Reset Plan
  const handleResetPlan = () => {
    if (window.confirm('Reset study plan and restart onboarding?')) {
      const initialDays = generateInitialMockPlan();
      setDays(initialDays);
      setPreferences(DEFAULT_USER_PREFERENCES);
      setShowOnboarding(true);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Toggle Day Completion
  const handleToggleComplete = (dayId: string) => {
    let nowCompleted = false;

    setDays((prevDays) => {
      const nextDays = prevDays.map((d) => {
        if (d.id === dayId) {
          const isComp = d.status === 'completed';
          nowCompleted = !isComp;
          const newStatus = (!isComp ? 'completed' : 'pending') as DayPlan['status'];
          const completedAt = !isComp ? new Date().toISOString() : undefined;

          // Dispatch asynchronous update to backend API
          fetch(`/api/tasks/${dayId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, completedAt }),
          }).catch((err) => console.warn('Task status update notice:', err));

          return {
            ...d,
            status: newStatus,
            completedAt,
          };
        }
        return d;
      });

      // Automatically update the next pending item to 'up-next'
      let foundUpNext = false;
      return nextDays.map((d) => {
        if (d.status === 'completed') return d;
        if (!foundUpNext) {
          foundUpNext = true;
          return { ...d, status: 'up-next' as DayPlan['status'] };
        }
        return {
          ...d,
          status: d.status === 'rebalanced' ? 'rebalanced' : ('pending' as DayPlan['status']),
        };
      });
    });

    if (nowCompleted) {
      fireCelebrationConfetti();
    }
  };

  // Save active recall user answer
  const handleUpdateUserAnswer = (dayId: string, answer: string) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, userAnswer: answer } : d))
    );

    // Dispatch update to backend
    fetch(`/api/tasks/${dayId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAnswer: answer }),
    }).catch((err) => console.warn('Task answer update notice:', err));
  };

  // Toggle active recall explanation
  const handleToggleRevealAnswer = (dayId: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const nextVal = !d.isAnswerRevealed;
          fetch(`/api/tasks/${dayId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isAnswerRevealed: nextVal }),
          }).catch((err) => console.warn('Reveal update notice:', err));

          return { ...d, isAnswerRevealed: nextVal };
        }
        return d;
      })
    );
  };

  // "Life Happens" Re-balancer Action
  const handleRebalance = async () => {
    setIsRebalancing(true);

    try {
      const response = await fetch('/api/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.days && data.days.length > 0) {
          setDays(data.days);
          setIsRebalancing(false);
          setToastInfo({
            show: true,
            title: 'Schedule Re-balanced! ⚡',
            sub: data.message || 'Missed topic smoothly redistributed across your remaining days without breaking your exam deadline.',
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Backend rebalance error, falling back locally:', e);
    }

    // Local fallback
    setDays((prevDays) => {
      // Find the first uncompleted day (either 'up-next' or 'pending')
      const firstPendingIdx = prevDays.findIndex((d) => d.status !== 'completed');

      if (firstPendingIdx === -1) {
        return prevDays;
      }

      // Shift pending tasks or mark current pending day as rebalanced
      const updated = prevDays.map((d, idx) => {
        if (idx < firstPendingIdx) {
          return d;
        }

        if (idx === firstPendingIdx) {
          return {
            ...d,
            status: 'rebalanced' as const,
            scheduledDate: `${d.scheduledDate} (Catch-up)`,
            estimatedMinutes: Math.min(d.estimatedMinutes + 10, 60),
          };
        }

        return {
          ...d,
          estimatedMinutes: Math.min(d.estimatedMinutes + 5, 55),
        };
      });

      return updated;
    });

    setIsRebalancing(false);

    setToastInfo({
      show: true,
      title: 'Schedule Re-balanced! ⚡',
      sub: 'Missed topic smoothly redistributed across your remaining days without breaking your exam deadline.',
    });
  };

  // Counts for filters
  const filterCounts = useMemo(() => {
    const all = days.length;
    const completed = days.filter((d) => d.status === 'completed').length;
    const pending = days.filter((d) => d.status !== 'completed').length;
    const cloudConcepts = days.filter((d) => d.domain === 'cloud-concepts').length;
    const architectureServices = days.filter((d) => d.domain === 'architecture-services').length;
    const managementGovernance = days.filter((d) => d.domain === 'management-governance').length;

    return {
      all,
      completed,
      pending,
      cloudConcepts,
      architectureServices,
      managementGovernance,
    };
  }, [days]);

  // Filtered days list
  const filteredDays = useMemo(() => {
    return days.filter((day) => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'pending') return day.status !== 'completed';
      if (currentFilter === 'completed') return day.status === 'completed';
      if (currentFilter === 'cloud-concepts') return day.domain === 'cloud-concepts';
      if (currentFilter === 'architecture-services') return day.domain === 'architecture-services';
      if (currentFilter === 'management-governance') return day.domain === 'management-governance';
      return true;
    });
  }, [days, currentFilter]);

  if (!isLoaded) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
          <span className="text-sm">Loading Study Planner...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header with Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Revision Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AZ-900 Study Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalized, day-by-day roadmap weighted by official Azure Fundamentals exam domains.
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Judge Demo Preset */}
          <button
            onClick={handleLoadJudgeDemo}
            title="Load instant pre-populated plan with 2 days completed for demonstration"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-sm shadow-amber-500/10"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Judge Demo</span>
          </button>

          {/* Configure Plan */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Reconfigure Plan</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetPlan}
            title="Reset Plan to Default"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-slate-800 hover:border-rose-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* View 1: Onboarding Wizard (Modal or Page view) */}
      {showOnboarding ? (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <OnboardingWizard
            initialPreferences={preferences}
            onGeneratePlan={handleGeneratePlan}
            onLoadJudgeDemo={handleLoadJudgeDemo}
            onClose={() => setShowOnboarding(false)}
            isExistingPlan={days.length > 0 && preferences.hasCompletedOnboarding}
          />
        </div>
      ) : (
        /* View 2: Interactive Study Dashboard */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* A. Top Executive KPI & Readiness Header */}
          <ReadinessHeader
            days={days}
            preferences={preferences}
            onRebalance={handleRebalance}
            isRebalancing={isRebalancing}
          />

          {/* B. Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Daily Action Milestones</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {filteredDays.length} of {days.length} Days Visible
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Bite-sized micro-learning with hands-on labs and active recall drills.
              </p>
            </div>

            <FilterBar
              currentFilter={currentFilter}
              onSelectFilter={setCurrentFilter}
              counts={filterCounts}
            />
          </div>

          {/* Timeline of Bite-Sized Daily Action Cards */}
          <div className="space-y-6">
            {filteredDays.length === 0 ? (
              <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Days Match This Filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try switching filters or check &ldquo;All Days&rdquo; to view your entire roadmap.
                </p>
                <button
                  onClick={() => setCurrentFilter('all')}
                  className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs font-semibold transition-colors"
                >
                  View All Days
                </button>
              </div>
            ) : (
              filteredDays.map((day) => (
                <DailyTaskCard
                  key={day.id}
                  day={day}
                  onToggleComplete={handleToggleComplete}
                  onUpdateUserAnswer={handleUpdateUserAnswer}
                  onToggleRevealAnswer={handleToggleRevealAnswer}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastInfo && toastInfo.show && (
        <Toast
          message={toastInfo.title}
          subMessage={toastInfo.sub}
          onClose={() => setToastInfo(null)}
        />
      )}
    </div>
  );
}
