'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  HelpCircle,
  Layers,
  Bot,
  Calendar,
  ArrowRight,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PlanState, DayPlan, UserPreferences } from '@/types/study-plan';
import { DEFAULT_USER_PREFERENCES, generateInitialMockPlan } from '@/lib/mock-az900-plan';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'az900_vibe_planner_state_v2';

export default function HomePage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [daysRemaining, setDaysRemaining] = useState(7);

  useEffect(() => {
    const calcCountdown = (dateStr: string) => {
      const target = new Date(dateStr);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      const diff = target.getTime() - now.getTime();
      setDaysRemaining(Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1));
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PlanState = JSON.parse(saved);
        if (parsed.days && parsed.days.length > 0) {
          setDays(parsed.days);
          const prefs = parsed.preferences || DEFAULT_USER_PREFERENCES;
          setPreferences(prefs);
          calcCountdown(prefs.examDate);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading dashboard state:', e);
    }

    setDays(generateInitialMockPlan());
    setPreferences(DEFAULT_USER_PREFERENCES);
    calcCountdown(DEFAULT_USER_PREFERENCES.examDate);
  }, []);

  const completedCount = days.filter((d) => d.status === 'completed').length;
  const totalDays = days.length || 7;

  const upNextDay =
    days.find((d) => d.status === 'up-next') ||
    days.find((d) => d.status !== 'completed') ||
    days[0];

  const cloudCount = days.filter((d) => d.domain === 'cloud-concepts').length;
  const archCount = days.filter((d) => d.domain === 'architecture-services').length;
  const mgmtCount = days.filter((d) => d.domain === 'management-governance').length;

  const cloudComp = days.filter(
    (d) => d.domain === 'cloud-concepts' && d.status === 'completed'
  ).length;
  const archComp = days.filter(
    (d) => d.domain === 'architecture-services' && d.status === 'completed'
  ).length;
  const mgmtComp = days.filter(
    (d) => d.domain === 'management-governance' && d.status === 'completed'
  ).length;

  const cloudPct = cloudCount ? Math.round((cloudComp / cloudCount) * 100) : 0;
  const archPct = archCount ? Math.round((archComp / archCount) * 100) : 0;
  const mgmtPct = mgmtCount ? Math.round((mgmtComp / mgmtCount) * 100) : 0;

  const readinessScore = Math.min(
    100,
    Math.round(cloudPct * 0.275 + archPct * 0.375 + mgmtPct * 0.35)
  );

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            AZ-900 Study Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Target exam date: {preferences.examDate} • {daysRemaining} days remaining
          </p>
        </div>

        <Link
          href="/planner"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors self-start sm:self-center"
        >
          <span>Open Study Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Authenticated Student Status Card */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            Welcome back, <strong className="text-white font-semibold">{user?.fullName || user?.email}</strong>
          </span>
        </div>
        <span className="text-[11px] text-sky-400 font-medium">Cloud Sync Active</span>
      </div>

      {/* KPI Stats Row (Clean 3-column layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Days Remaining */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Exam Countdown</span>
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {daysRemaining} <span className="text-xs font-normal text-slate-400">days left</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Exam target: {preferences.examDate}
          </div>
        </div>

        {/* KPI 2: Overall Readiness */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Readiness Score</span>
            <Target className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-2">
            <span>{readinessScore}%</span>
            <span className="text-xs font-normal text-slate-400">
              {readinessScore >= 70 ? 'On track to pass' : 'In progress'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Progress */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Completed Topics</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {completedCount} <span className="text-xs font-normal text-slate-400">/ {totalDays} topics</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {Math.round((completedCount / Math.max(totalDays, 1)) * 100)}% of roadmap finished
          </div>
        </div>
      </div>

      {/* Up Next Topic Card (Clean 1-row focus) */}
      {upNextDay && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-sky-400">Next Topic</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Day {upNextDay.dayNumber}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{upNextDay.estimatedMinutes} mins</span>
            </div>
            <h2 className="text-base font-semibold text-white">
              {upNextDay.topicTitle}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl line-clamp-1">
              {upNextDay.learningBlock.objective}
            </p>
          </div>

          <Link
            href="/planner"
            className="px-4 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Continue Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Study Tools Grid (Clean 4-card compact grid) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">
          Study Tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tool 1: Planner */}
          <Link
            href="/planner"
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors">
                Study Planner
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Day-by-day study roadmap with active recall and schedule re-balancer.
            </p>
          </Link>

          {/* Tool 2: Quizzes */}
          <Link
            href="/quizzes"
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors">
                Practice Quizzes
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multiple-choice practice questions mapped to official AZ-900 topics.
            </p>
          </Link>

          {/* Tool 3: Flashcards */}
          <Link
            href="/flashcards"
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Flashcards
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quick definition cards covering compute, storage, and identity.
            </p>
          </Link>

          {/* Tool 4: AI Study Buddy */}
          <Link
            href="/study-buddy"
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-purple-300 transition-colors">
                AI Study Buddy
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask questions and get concise explanations with Azure analogies.
            </p>
          </Link>
        </div>
      </div>

      {/* Domain Mastery Summary (Clean 3-meter row) */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">Exam Domain Progress</span>
          <span className="text-slate-500">Official syllabus weights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Domain 1 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Cloud Concepts (25-30%)</span>
              <span className="font-medium text-slate-400">{cloudPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full rounded-full" style={{ width: `${cloudPct}%` }} />
            </div>
          </div>

          {/* Domain 2 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Architecture & Services (35-40%)</span>
              <span className="font-medium text-slate-400">{archPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${archPct}%` }} />
            </div>
          </div>

          {/* Domain 3 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Management & Governance (30-35%)</span>
              <span className="font-medium text-slate-400">{mgmtPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${mgmtPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
