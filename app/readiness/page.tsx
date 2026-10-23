'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Layers,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Brain,
  Target,
} from 'lucide-react';
import { PlanState, DayPlan, UserPreferences } from '@/types/study-plan';
import { DEFAULT_USER_PREFERENCES, generateInitialMockPlan } from '@/lib/mock-az900-plan';

const STORAGE_KEY = 'az900_vibe_planner_state_v2';

// Domain name normalization helpers
const DOMAIN_ALIASES: Record<string, string> = {
  'Cloud Concepts': 'cloud-concepts',
  'Azure Architecture & Services': 'architecture-services',
  'Azure Architecture and Services': 'architecture-services',
  'Management & Governance': 'management-governance',
  'Management and Governance': 'management-governance',
  'cloud-concepts': 'cloud-concepts',
  'architecture-services': 'architecture-services',
  'management-governance': 'management-governance',
};

function normalizeDomain(raw: string | undefined | null): string | null {
  if (!raw) return null;
  return DOMAIN_ALIASES[raw.trim()] ?? null;
}

const EXAM_CHECKLIST = [
  { id: 'c1', label: 'Understand Shared Responsibility boundaries across IaaS, PaaS, SaaS' },
  { id: 'c2', label: 'Differentiate CapEx vs OpEx and consumption-based pricing' },
  { id: 'c3', label: 'Explain fault isolation in Availability Zones vs Region Pairs (>300 miles)' },
  { id: 'c4', label: 'Know compute differences: VMs vs App Services vs ACI vs AKS vs Functions' },
  { id: 'c5', label: 'Identify Blob Storage Tiers: Hot, Cool (30d), Cold (90d), Archive (180d)' },
  { id: 'c6', label: 'Compare ExpressRoute (private fiber) vs VPN Gateway (public internet)' },
  { id: 'c7', label: 'Distinguish RBAC (User permissions) vs Azure Policy (Resource compliance)' },
  { id: 'c8', label: 'Understand CanNotDelete and ReadOnly Resource Lock inheritance' },
  { id: 'c9', label: 'Calculate composite SLA availability for multi-tier applications' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedQuiz {
  id: string;
  title: string;
  domain?: string;
  topic?: string;
  score?: number;
  total_questions?: number;
  questions?: unknown[];
  created_at?: string;
}

interface SavedFlashcardDeck {
  id: string;
  title: string;
  domain?: string;
  cards?: unknown[];
  mastered_ids?: string[];
  masteredIds?: string[];
  created_at?: string;
}

// ─── Per-domain signals ────────────────────────────────────────────────────

interface DomainSignal {
  quizCorrect: number;
  quizTotal: number;
  flashMastered: number;
  flashTotal: number;
  quizAttempts: number;
  deckCount: number;
}

function emptySignal(): DomainSignal {
  return { quizCorrect: 0, quizTotal: 0, flashMastered: 0, flashTotal: 0, quizAttempts: 0, deckCount: 0 };
}

function domainPct(signal: DomainSignal): number {
  const quizAcc = signal.quizTotal > 0 ? signal.quizCorrect / signal.quizTotal : 0;
  const flashAcc = signal.flashTotal > 0 ? signal.flashMastered / signal.flashTotal : 0;

  if (signal.quizTotal === 0 && signal.flashTotal === 0) return 0;
  if (signal.quizTotal === 0) return Math.round(flashAcc * 100);
  if (signal.flashTotal === 0) return Math.round(quizAcc * 100);

  return Math.round(quizAcc * 0.6 * 100 + flashAcc * 0.4 * 100);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProgressReadinessPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [checkedItems, setCheckedItems] = useState<string[]>(['c1', 'c2']);

  // Practice data
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [savedDecks, setSavedDecks] = useState<SavedFlashcardDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load study plan from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PlanState = JSON.parse(saved);
        if (parsed.days && parsed.days.length > 0) {
          setDays(parsed.days);
          setPreferences(parsed.preferences || DEFAULT_USER_PREFERENCES);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading readiness state:', e);
    }
    setDays(generateInitialMockPlan());
  }, []);

  // Load practice data from Supabase APIs + localStorage fallback
  useEffect(() => {
    async function loadPracticeData() {
      setIsLoading(true);

      // ── Quizzes ──────────────────────────────────────────────────────────
      let quizzes: SavedQuiz[] = [];
      try {
        const res = await fetch('/api/quizzes/saved');
        const data = await res.json();
        if (data.quizzes && Array.isArray(data.quizzes) && data.quizzes.length > 0) {
          quizzes = data.quizzes;
        }
      } catch {/* network error */}

      // Merge with localStorage (avoids missing entries not yet synced to Supabase)
      try {
        const local = localStorage.getItem('az900_saved_quizzes');
        if (local) {
          const localQuizzes: SavedQuiz[] = JSON.parse(local);
          const existingIds = new Set(quizzes.map((q) => q.id));
          for (const lq of localQuizzes) {
            if (!existingIds.has(lq.id)) quizzes.push(lq);
          }
        }
      } catch {/* ignore */}

      // ── Flashcard Decks ───────────────────────────────────────────────────
      let decks: SavedFlashcardDeck[] = [];
      try {
        const res = await fetch('/api/flashcards/save');
        const data = await res.json();
        if (data.decks && Array.isArray(data.decks) && data.decks.length > 0) {
          decks = data.decks;
        }
      } catch {/* network error */}

      // Merge with localStorage
      try {
        const local = localStorage.getItem('az900_saved_flashcards');
        if (local) {
          const localDecks: SavedFlashcardDeck[] = JSON.parse(local);
          const existingIds = new Set(decks.map((d) => d.id));
          for (const ld of localDecks) {
            if (!existingIds.has(ld.id)) decks.push(ld);
          }
        }
      } catch {/* ignore */}

      setSavedQuizzes(quizzes);
      setSavedDecks(decks);
      setIsLoading(false);
    }

    loadPracticeData();
  }, []);

  // ── Build per-domain signals from saved data ────────────────────────────

  const signals: Record<string, DomainSignal> = {
    'cloud-concepts': emptySignal(),
    'architecture-services': emptySignal(),
    'management-governance': emptySignal(),
  };

  // Accumulate quiz data
  for (const quiz of savedQuizzes) {
    const domKey = normalizeDomain(quiz.domain);
    const score = quiz.score ?? 0;
    const total = quiz.total_questions ?? quiz.questions?.length ?? 0;
    if (total === 0) continue;

    if (domKey && signals[domKey]) {
      signals[domKey].quizCorrect += score;
      signals[domKey].quizTotal += total;
      signals[domKey].quizAttempts += 1;
    } else {
      // distribute equally across all domains if unknown
      for (const k of Object.keys(signals)) {
        signals[k].quizCorrect += score / 3;
        signals[k].quizTotal += total / 3;
        signals[k].quizAttempts += 1 / 3;
      }
    }
  }

  // Accumulate flashcard data
  for (const deck of savedDecks) {
    const domKey = normalizeDomain(deck.domain);
    const mastered = (deck.mastered_ids ?? deck.masteredIds ?? []).length;
    const total = deck.cards?.length ?? 0;
    if (total === 0) continue;

    if (domKey && signals[domKey]) {
      signals[domKey].flashMastered += mastered;
      signals[domKey].flashTotal += total;
      signals[domKey].deckCount += 1;
    } else {
      for (const k of Object.keys(signals)) {
        signals[k].flashMastered += mastered / 3;
        signals[k].flashTotal += total / 3;
        signals[k].deckCount += 1 / 3;
      }
    }
  }

  const hasPracticeData =
    savedQuizzes.length > 0 || savedDecks.length > 0;

  // ── Study-plan based domain completion (fallback context) ──────────────

  const cloudDays = days.filter((d) => d.domain === 'cloud-concepts');
  const archDays = days.filter((d) => d.domain === 'architecture-services');
  const mgmtDays = days.filter((d) => d.domain === 'management-governance');

  const cloudComp = cloudDays.filter((d) => d.status === 'completed').length;
  const archComp = archDays.filter((d) => d.status === 'completed').length;
  const mgmtComp = mgmtDays.filter((d) => d.status === 'completed').length;

  const cloudPlanPct = cloudDays.length ? Math.round((cloudComp / cloudDays.length) * 100) : 0;
  const archPlanPct = archDays.length ? Math.round((archComp / archDays.length) * 100) : 0;
  const mgmtPlanPct = mgmtDays.length ? Math.round((mgmtComp / mgmtDays.length) * 100) : 0;

  // ── Practice-based domain percentages ─────────────────────────────────

  const cloudPracticePct = domainPct(signals['cloud-concepts']);
  const archPracticePct = domainPct(signals['architecture-services']);
  const mgmtPracticePct = domainPct(signals['management-governance']);

  // ── Blended domain percentage: 50% practice + 50% plan (when data exists) ──

  const cloudPct = hasPracticeData
    ? Math.round(cloudPracticePct * 0.5 + cloudPlanPct * 0.5)
    : cloudPlanPct;
  const archPct = hasPracticeData
    ? Math.round(archPracticePct * 0.5 + archPlanPct * 0.5)
    : archPlanPct;
  const mgmtPct = hasPracticeData
    ? Math.round(mgmtPracticePct * 0.5 + mgmtPlanPct * 0.5)
    : mgmtPlanPct;

  // ── Overall readiness score (Microsoft exam weighting) ────────────────

  const readinessScore = Math.min(
    100,
    Math.round(cloudPct * 0.275 + archPct * 0.375 + mgmtPct * 0.35)
  );

  // ── Totals for stat cards ──────────────────────────────────────────────

  const totalQuizAttempts = savedQuizzes.length;
  const totalQuizCorrect = savedQuizzes.reduce((s, q) => s + (q.score ?? 0), 0);
  const totalQuizQuestions = savedQuizzes.reduce(
    (s, q) => s + (q.total_questions ?? q.questions?.length ?? 0),
    0
  );
  const overallQuizAcc =
    totalQuizQuestions > 0 ? Math.round((totalQuizCorrect / totalQuizQuestions) * 100) : null;

  const totalDecks = savedDecks.length;
  const totalFlashcards = savedDecks.reduce((s, d) => s + (d.cards?.length ?? 0), 0);
  const totalMastered = savedDecks.reduce(
    (s, d) => s + (d.mastered_ids ?? d.masteredIds ?? []).length,
    0
  );
  const overallFlashAcc =
    totalFlashcards > 0 ? Math.round((totalMastered / totalFlashcards) * 100) : null;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>AZ-900 Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Progress &amp; Readiness Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Exam readiness assessed from your practice quiz scores and flashcard mastery.
          </p>
        </div>

        <Link
          href="/planner"
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-sky-500/20 shrink-0"
        >
          <span>Continue Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Practice Activity Summary ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Quiz Attempts */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            Quiz Sessions
          </div>
          <div className="text-3xl font-black text-white">{isLoading ? '—' : totalQuizAttempts}</div>
          {overallQuizAcc !== null && (
            <div className="text-xs text-sky-300 font-semibold">{overallQuizAcc}% avg accuracy</div>
          )}
          {!isLoading && totalQuizAttempts === 0 && (
            <div className="text-xs text-slate-500">No quizzes yet</div>
          )}
        </div>

        {/* Questions Answered */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Questions Done
          </div>
          <div className="text-3xl font-black text-white">{isLoading ? '—' : totalQuizQuestions}</div>
          {totalQuizCorrect > 0 && (
            <div className="text-xs text-amber-300 font-semibold">{totalQuizCorrect} correct</div>
          )}
          {!isLoading && totalQuizQuestions === 0 && (
            <div className="text-xs text-slate-500">Take a quiz first</div>
          )}
        </div>

        {/* Flashcard Decks */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Flashcard Decks
          </div>
          <div className="text-3xl font-black text-white">{isLoading ? '—' : totalDecks}</div>
          {overallFlashAcc !== null && (
            <div className="text-xs text-emerald-300 font-semibold">{overallFlashAcc}% mastered</div>
          )}
          {!isLoading && totalDecks === 0 && (
            <div className="text-xs text-slate-500">No decks saved</div>
          )}
        </div>

        {/* Cards Mastered */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            Cards Mastered
          </div>
          <div className="text-3xl font-black text-white">{isLoading ? '—' : totalMastered}</div>
          {totalFlashcards > 0 && (
            <div className="text-xs text-purple-300 font-semibold">of {totalFlashcards} total</div>
          )}
          {!isLoading && totalFlashcards === 0 && (
            <div className="text-xs text-slate-500">Study flashcards</div>
          )}
        </div>
      </div>

      {/* ── No practice data nudge ─────────────────────────────────────────── */}
      {!isLoading && !hasPracticeData && (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1 text-sm text-amber-200">
            <span className="font-bold text-amber-300">No practice data yet.</span> Your readiness
            score below is based solely on study plan completion. Take practice quizzes or save
            flashcard decks to unlock a real, data-driven assessment.
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/quizzes"
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Take a Quiz
            </Link>
            <Link
              href="/flashcards"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Study Flashcards
            </Link>
          </div>
        </div>
      )}

      {/* ── Loading spinner ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
          <span>Loading your practice history…</span>
        </div>
      )}

      {/* ── Main Readiness Gauge Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Meter Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Overall Exam Readiness
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white pt-2">
              {readinessScore}%
            </div>
            <p className="text-xs text-slate-400">
              {hasPracticeData
                ? 'Weighted from quiz accuracy + flashcard mastery + plan completion.'
                : 'Based on study plan completion only.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Passing Threshold</span>
              <span className="text-emerald-400 font-bold">70% (700/1000)</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-700"
                style={{ width: `${readinessScore}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                style={{ left: '70%' }}
                title="70% passing mark"
              />
            </div>
          </div>

          {/* Score formula legend */}
          {hasPracticeData && (
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-sky-400" /> Quiz accuracy
                </span>
                <span className="text-sky-300 font-semibold">60% weight</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-400" /> Flashcard mastery
                </span>
                <span className="text-emerald-300 font-semibold">40% weight</span>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            {readinessScore >= 70 ? (
              <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Score predicts a strong probability of passing the AZ-900 exam.
              </span>
            ) : (
              <span className="text-amber-300 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Complete more practice quizzes &amp; master flashcards to reach 70%.
              </span>
            )}
          </div>
        </div>

        {/* Domain Mastery Breakdown */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span>Domain Mastery Weighting</span>
            </h2>
            {hasPracticeData && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Live from practice data
              </span>
            )}
          </div>

          <div className="space-y-6">
            {/* Domain 1 — Cloud Concepts */}
            <DomainBar
              label="Cloud Concepts"
              weight="25–30% exam weight"
              color="sky"
              pct={cloudPct}
              practicePct={hasPracticeData ? cloudPracticePct : null}
              planPct={cloudPlanPct}
              quizAttempts={Math.round(signals['cloud-concepts'].quizAttempts)}
              deckCount={Math.round(signals['cloud-concepts'].deckCount)}
              planCompleted={cloudComp}
              planTotal={cloudDays.length}
            />

            {/* Domain 2 — Architecture & Services */}
            <DomainBar
              label="Azure Architecture & Services"
              weight="35–40% (Heaviest Weight)"
              color="amber"
              pct={archPct}
              practicePct={hasPracticeData ? archPracticePct : null}
              planPct={archPlanPct}
              quizAttempts={Math.round(signals['architecture-services'].quizAttempts)}
              deckCount={Math.round(signals['architecture-services'].deckCount)}
              planCompleted={archComp}
              planTotal={archDays.length}
            />

            {/* Domain 3 — Management & Governance */}
            <DomainBar
              label="Azure Management & Governance"
              weight="30–35% exam weight"
              color="emerald"
              pct={mgmtPct}
              practicePct={hasPracticeData ? mgmtPracticePct : null}
              planPct={mgmtPlanPct}
              quizAttempts={Math.round(signals['management-governance'].quizAttempts)}
              deckCount={Math.round(signals['management-governance'].deckCount)}
              planCompleted={mgmtComp}
              planTotal={mgmtDays.length}
            />
          </div>
        </div>
      </div>

      {/* ── Saved Practice Sessions List ──────────────────────────────────── */}
      {hasPracticeData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz History */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              Quiz History
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                {totalQuizAttempts} sessions
              </span>
            </h2>

            {savedQuizzes.length === 0 ? (
              <p className="text-xs text-slate-500">No quizzes saved yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {savedQuizzes.map((quiz) => {
                  const total = quiz.total_questions ?? quiz.questions?.length ?? 0;
                  const acc = total > 0 ? Math.round(((quiz.score ?? 0) / total) * 100) : null;
                  return (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-200 truncate">{quiz.title}</p>
                        {quiz.domain && (
                          <p className="text-slate-500 text-[11px]">{quiz.domain}</p>
                        )}
                      </div>
                      {acc !== null && (
                        <span
                          className={`ml-3 shrink-0 font-bold ${
                            acc >= 70 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {acc}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/quizzes"
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold mt-1"
            >
              <span>Take another quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Flashcard Deck History */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Flashcard Decks
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                {totalDecks} decks
              </span>
            </h2>

            {savedDecks.length === 0 ? (
              <p className="text-xs text-slate-500">No decks saved yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {savedDecks.map((deck) => {
                  const mastered = (deck.mastered_ids ?? deck.masteredIds ?? []).length;
                  const total = deck.cards?.length ?? 0;
                  const acc = total > 0 ? Math.round((mastered / total) * 100) : null;
                  return (
                    <div
                      key={deck.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-200 truncate">{deck.title}</p>
                        {deck.domain && (
                          <p className="text-slate-500 text-[11px]">{deck.domain}</p>
                        )}
                      </div>
                      {acc !== null && (
                        <span
                          className={`ml-3 shrink-0 font-bold ${
                            acc >= 70 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {mastered}/{total}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/flashcards"
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold mt-1"
            >
              <span>Study flashcards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Interactive Exam Day Readiness Checklist ──────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Core AZ-900 Concept Checklist</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify your confidence on high-probability exam question topics.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
            {checkedItems.length} of {EXAM_CHECKLIST.length} Checked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {EXAM_CHECKLIST.map((item) => {
            const isChecked = checkedItems.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    isChecked
                      ? 'bg-sky-500 border-sky-400 text-slate-950'
                      : 'border-slate-700 bg-slate-950'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="flex-1 leading-relaxed">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DomainBar sub-component ────────────────────────────────────────────────

interface DomainBarProps {
  label: string;
  weight: string;
  color: 'sky' | 'amber' | 'emerald';
  pct: number;
  practicePct: number | null;
  planPct: number;
  quizAttempts: number;
  deckCount: number;
  planCompleted: number;
  planTotal: number;
}

const COLOR_MAP = {
  sky: { bar: 'bg-sky-400', text: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
  amber: { bar: 'bg-amber-400', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  emerald: { bar: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
};

function DomainBar({
  label,
  weight,
  color,
  pct,
  practicePct,
  planPct,
  quizAttempts,
  deckCount,
  planCompleted,
  planTotal,
}: DomainBarProps) {
  const c = COLOR_MAP[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className={`font-bold ${c.text}`}>{label}</span>
          <span className="text-slate-500 ml-2">{weight}</span>
        </div>
        <span className="font-semibold text-slate-300">{pct}%</span>
      </div>

      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <div
          className={`${c.bar} h-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Sub-signal pills */}
      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
        {practicePct !== null && (
          <>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${c.badge}`}>
              <HelpCircle className="w-2.5 h-2.5" />
              Quiz: {practicePct}%
              {quizAttempts > 0 && <span className="opacity-70">({quizAttempts} sessions)</span>}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 bg-purple-500/10 text-purple-300 border-purple-500/20">
              <Layers className="w-2.5 h-2.5" />
              Cards: {deckCount > 0 ? `${deckCount} decks` : 'none yet'}
            </span>
          </>
        )}
        <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 bg-slate-800/80 text-slate-400 border-slate-700">
          <BookOpen className="w-2.5 h-2.5" />
          Plan: {planCompleted}/{planTotal} sessions ({planPct}%)
        </span>
      </div>
    </div>
  );
}
