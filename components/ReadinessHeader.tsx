'use client';

import React from 'react';
import { DayPlan, UserPreferences } from '@/types/study-plan';
import { Calendar, Target, Award, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

interface ReadinessHeaderProps {
  days: DayPlan[];
  preferences: UserPreferences;
  onRebalance: () => void;
  isRebalancing: boolean;
}

export const ReadinessHeader: React.FC<ReadinessHeaderProps> = ({
  days,
  preferences,
  onRebalance,
  isRebalancing,
}) => {
  // 1. Calculate Countdown
  const targetDate = new Date(preferences.examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

  const formattedExamDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // 2. Calculate Domain Mastery
  const domainStats = {
    'cloud-concepts': { total: 0, completed: 0 },
    'architecture-services': { total: 0, completed: 0 },
    'management-governance': { total: 0, completed: 0 },
  };

  days.forEach((day) => {
    if (day.domain in domainStats) {
      domainStats[day.domain as keyof typeof domainStats].total += 1;
      if (day.status === 'completed') {
        domainStats[day.domain as keyof typeof domainStats].completed += 1;
      }
    }
  });

  const getDomainPercent = (domain: keyof typeof domainStats) => {
    const s = domainStats[domain];
    return s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
  };

  const cloudPercent = getDomainPercent('cloud-concepts');
  const archPercent = getDomainPercent('architecture-services');
  const mgmtPercent = getDomainPercent('management-governance');

  // Overall Weighted Score (27.5% Cloud, 37.5% Architecture, 35% Management)
  const weightedScore = Math.min(
    100,
    Math.round(cloudPercent * 0.275 + archPercent * 0.375 + mgmtPercent * 0.35)
  );

  const completedDaysCount = days.filter((d) => d.status === 'completed').length;
  const rebalancedDaysCount = days.filter((d) => d.status === 'rebalanced').length;

  return (
    <div className="space-y-4">
      {/* Rebalance Active Notice (clean, quiet) */}
      {rebalancedDaysCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Schedule adjusted: missed session redistributed evenly across remaining days.</span>
          </div>
          <span className="text-slate-400 font-medium">Auto-balanced</span>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Exam Target */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Exam Date</span>
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Target: {formattedExamDate}</p>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            {completedDaysCount} of {days.length} topics finished
          </div>
        </div>

        {/* Card 2: Readiness Score */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Exam Readiness</span>
            <Target className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
              <span>{weightedScore}%</span>
              <span className="text-xs font-normal text-slate-400">
                {weightedScore >= 70 ? 'Ready to pass' : 'Study in progress'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${weightedScore}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            Pass mark: 700 / 1000
          </div>
        </div>

        {/* Card 3: Domain Breakdown & Rebalancer */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Domain Progress</span>
            <button
              type="button"
              onClick={onRebalance}
              disabled={isRebalancing}
              title="Redistribute missed sessions"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRebalancing ? 'animate-spin' : ''}`} />
              <span>{isRebalancing ? 'Adjusting...' : 'Missed a day?'}</span>
            </button>
          </div>

          <div className="space-y-1.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Concepts (25-30%)</span>
              <span className="font-medium text-slate-200">{cloudPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Architecture (35-40%)</span>
              <span className="font-medium text-slate-200">{archPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Management (30-35%)</span>
              <span className="font-medium text-slate-200">{mgmtPercent}%</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            Weighted by official exam syllabus
          </div>
        </div>
      </div>
    </div>
  );
};
