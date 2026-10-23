'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  HelpCircle,
  Layers,
  Bot,
  BarChart3,
  Calendar,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Award,
} from 'lucide-react';
import { PlanState, DayPlan, UserPreferences } from '@/types/study-plan';
import { DEFAULT_USER_PREFERENCES, generateInitialMockPlan } from '@/lib/mock-az900-plan';

const STORAGE_KEY = 'az900_vibe_planner_state_v2';

export default function DashboardPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading dashboard state:', e);
    }

    // Default mock data if no storage
    setDays(generateInitialMockPlan());
    setPreferences(DEFAULT_USER_PREFERENCES);
    calcCountdown(DEFAULT_USER_PREFERENCES.examDate);
    setIsLoaded(true);
  }, []);

  // Completed count
  const completedCount = days.filter((d) => d.status === 'completed').length;
  const totalDays = days.length || 7;

  // Next up day
  const upNextDay = days.find((d) => d.status === 'up-next') || days.find((d) => d.status !== 'completed') || days[0];

  // Domain weights breakdown
  const cloudCount = days.filter((d) => d.domain === 'cloud-concepts').length;
  const archCount = days.filter((d) => d.domain === 'architecture-services').length;
  const mgmtCount = days.filter((d) => d.domain === 'management-governance').length;

  const cloudComp = days.filter((d) => d.domain === 'cloud-concepts' && d.status === 'completed').length;
  const archComp = days.filter((d) => d.domain === 'architecture-services' && d.status === 'completed').length;
  const mgmtComp = days.filter((d) => d.domain === 'management-governance' && d.status === 'completed').length;

  const cloudPct = cloudCount ? Math.round((cloudComp / cloudCount) * 100) : 0;
  const archPct = archCount ? Math.round((archComp / archCount) * 100) : 0;
  const mgmtPct = mgmtCount ? Math.round((mgmtComp / mgmtCount) * 100) : 0;

  const readinessScore = Math.min(
    100,
    Math.round(cloudPct * 0.275 + archPct * 0.375 + mgmtPct * 0.35)
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading AZ-900 Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/40 border border-sky-500/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Microsoft Azure Fundamentals (AZ-900)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              CloudPrep <span className="text-sky-400">AI</span> Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your personalized, AI-powered preparation command center. Adaptive daily micro-learning, active recall checkpoint drills, and domain mastery tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/planner"
              className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group"
            >
              <span>Open Study Planner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/quizzes"
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Quick Quiz Drill</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Exam Countdown */}
        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Exam Countdown</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {daysRemaining} <span className="text-sm font-semibold text-slate-400">Days</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target: {preferences.examDate}
            </p>
          </div>
        </div>

        {/* KPI 2: Overall Readiness */}
        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Exam Readiness</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white flex items-center gap-2">
              <span>{readinessScore}%</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                readinessScore >= 70 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {readinessScore >= 70 ? 'On Track' : 'In Progress'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              700 / 1000 minimum scaled pass mark
            </p>
          </div>
        </div>

        {/* KPI 3: Milestones Completed */}
        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Milestones Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {completedCount} <span className="text-sm font-semibold text-slate-400">/ {totalDays}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${(completedCount / Math.max(totalDays, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Daily Study Time */}
        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Target</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {preferences.dailyCapacityMins} <span className="text-sm font-semibold text-slate-400">Mins/day</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {preferences.weekendMultiplier ? '1.5x weekend boost active' : 'Consistent daily pacing'}
            </p>
          </div>
        </div>
      </div>

      {/* Up-Next Action Card */}
      {upNextDay && (
        <div className="p-6 rounded-2xl glass-panel-elevated border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Today&apos;s Up-Next Focus • Day {upNextDay.dayNumber}
              </span>
              <span className="text-xs text-slate-400">{upNextDay.scheduledDate}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {upNextDay.topicTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {upNextDay.learningBlock.objective}
            </p>
          </div>

          <Link
            href="/planner"
            className="px-5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Launch Today&apos;s Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Feature Exploration Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Study Suite Features
          </h2>
          <span className="text-xs text-slate-400">
            6 Specialized AZ-900 Prep Tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Study Planner */}
          <Link
            href="/planner"
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-sky-500/40 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                Adaptive Study Planner
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Day-by-day revision schedule with micro-learning, portal sandboxes, and the &ldquo;Life Happens&rdquo; automatic re-balancer.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:gap-2 transition-all">
              <span>View Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: Practice Quizzes */}
          <Link
            href="/quizzes"
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-amber-500/40 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                Practice Quizzes
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Realistic AZ-900 multiple-choice questions across all 3 domains with instant feedback and answer explanations.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:gap-2 transition-all">
              <span>Start Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3: Flashcards */}
          <Link
            href="/flashcards"
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                Interactive Flashcards
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active recall drills covering IaaS vs PaaS vs SaaS, SLAs, Storage Redundancy (LRS/ZRS/GRS), and Entra ID.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2 transition-all">
              <span>Drill Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4: AI Study Buddy */}
          <Link
            href="/study-buddy"
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-purple-500/40 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                AI Study Buddy
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask any Azure concept question. Receive clear, memorable explanations with real-world analogies.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:gap-2 transition-all">
              <span>Chat with Buddy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 5: Progress & Readiness */}
          <Link
            href="/readiness"
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-sky-500/40 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                Progress & Readiness
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Domain mastery breakdown, passing probability calculator, and pre-exam checklist.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:gap-2 transition-all">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 6: Official Study Guide */}
          <a
            href="https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-slate-200 transition-colors flex items-center gap-1.5">
                <span>Official MS Learn</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review official exam guidelines, skills measured, and access free Microsoft Learn modules.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-slate-300">
              <span>Visit Official Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>
      </div>

      {/* Official Domain Weights Breakdown */}
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Official AZ-900 Domain Breakdown</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Syllabus Standard
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress is automatically weighted to match Microsoft&apos;s real exam score weighting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Domain 1: Cloud Concepts */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-400">Cloud Concepts</span>
              <span className="text-slate-400">25–30% Weight</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full transition-all duration-500"
                style={{ width: `${cloudPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{cloudComp} of {cloudCount} Completed</span>
              <span>{cloudPct}%</span>
            </div>
          </div>

          {/* Domain 2: Architecture & Services */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400">Architecture & Services</span>
              <span className="text-amber-300 font-bold">35–40% (Heaviest)</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${archPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{archComp} of {archCount} Completed</span>
              <span>{archPct}%</span>
            </div>
          </div>

          {/* Domain 3: Management & Governance */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400">Management & Governance</span>
              <span className="text-slate-400">30–35% Weight</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${mgmtPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{mgmtComp} of {mgmtCount} Completed</span>
              <span>{mgmtPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
