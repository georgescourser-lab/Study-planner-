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
  Layers,
  BookOpen,
} from 'lucide-react';
import { PlanState, DayPlan, UserPreferences } from '@/types/study-plan';
import { DEFAULT_USER_PREFERENCES, generateInitialMockPlan } from '@/lib/mock-az900-plan';

const STORAGE_KEY = 'az900_vibe_planner_state_v2';

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

export default function ProgressReadinessPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [checkedItems, setCheckedItems] = useState<string[]>(['c1', 'c2']);

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

  const totalTasks = days.length || 7;
  const completedTasks = days.filter((d) => d.status === 'completed').length;

  const cloudDays = days.filter((d) => d.domain === 'cloud-concepts');
  const archDays = days.filter((d) => d.domain === 'architecture-services');
  const mgmtDays = days.filter((d) => d.domain === 'management-governance');

  const cloudComp = cloudDays.filter((d) => d.status === 'completed').length;
  const archComp = archDays.filter((d) => d.status === 'completed').length;
  const mgmtComp = mgmtDays.filter((d) => d.status === 'completed').length;

  const cloudPct = cloudDays.length ? Math.round((cloudComp / cloudDays.length) * 100) : 0;
  const archPct = archDays.length ? Math.round((archComp / archDays.length) * 100) : 0;
  const mgmtPct = mgmtDays.length ? Math.round((mgmtComp / mgmtDays.length) * 100) : 0;

  const readinessScore = Math.min(
    100,
    Math.round(cloudPct * 0.275 + archPct * 0.375 + mgmtPct * 0.35)
  );

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
            Progress & Readiness Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Weighted assessment of your Azure exam readiness and key concept mastery.
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

      {/* Main Readiness Gauge Row */}
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
              Weighted against official Microsoft syllabus percentages.
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

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            {readinessScore >= 70 ? (
              <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Score predicts a strong probability of passing the AZ-900 exam.
              </span>
            ) : (
              <span className="text-amber-300 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Complete upcoming Architecture & Services milestones to reach the 70% threshold.
              </span>
            )}
          </div>
        </div>

        {/* Domain Mastery Breakdown */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>Domain Mastery Weighting</span>
          </h2>

          <div className="space-y-5">
            {/* Domain 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-sky-400">Cloud Concepts</span>
                  <span className="text-slate-500 ml-2">25–30% exam weight</span>
                </div>
                <span className="font-semibold text-slate-300">{cloudPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full transition-all duration-500"
                  style={{ width: `${cloudPct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                {cloudComp} of {cloudDays.length} sessions completed
              </span>
            </div>

            {/* Domain 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-400">Azure Architecture & Services</span>
                  <span className="text-amber-300/80 font-bold ml-2">35–40% (Heaviest Weight)</span>
                </div>
                <span className="font-semibold text-slate-300">{archPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${archPct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                {archComp} of {archDays.length} sessions completed
              </span>
            </div>

            {/* Domain 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-400">Azure Management & Governance</span>
                  <span className="text-slate-500 ml-2">30–35% exam weight</span>
                </div>
                <span className="font-semibold text-slate-300">{mgmtPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${mgmtPct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                {mgmtComp} of {mgmtDays.length} sessions completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Exam Day Readiness Checklist */}
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
