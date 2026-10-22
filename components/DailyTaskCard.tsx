'use client';

import React, { useState } from 'react';
import { DayPlan } from '@/types/study-plan';
import { DOMAIN_METADATA } from '@/lib/mock-az900-plan';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Wrench,
  Brain,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Target,
  Send,
  Lightbulb,
} from 'lucide-react';

interface DailyTaskCardProps {
  day: DayPlan;
  onToggleComplete: (dayId: string) => void;
  onUpdateUserAnswer: (dayId: string, answer: string) => void;
  onToggleRevealAnswer: (dayId: string) => void;
}

export const DailyTaskCard: React.FC<DailyTaskCardProps> = ({
  day,
  onToggleComplete,
  onUpdateUserAnswer,
  onToggleRevealAnswer,
}) => {
  const [localAnswer, setLocalAnswer] = useState(day.userAnswer || '');
  const [isSandboxExpanded, setIsSandboxExpanded] = useState(true);
  const [isRecallExpanded, setIsRecallExpanded] = useState(true);

  const domainMeta = DOMAIN_METADATA[day.domain];
  const isCompleted = day.status === 'completed';
  const isUpNext = day.status === 'up-next';
  const isRebalanced = day.status === 'rebalanced';

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserAnswer(day.id, localAnswer);
    if (!day.isAnswerRevealed) {
      onToggleRevealAnswer(day.id);
    }
  };

  const msLearnUrl = `https://learn.microsoft.com/en-us/search/?terms=${encodeURIComponent(
    day.learningBlock.msLearnSearchTerm
  )}`;

  return (
    <div
      className={`rounded-2xl transition-all duration-300 relative overflow-hidden border ${
        isCompleted
          ? 'bg-slate-900/60 border-emerald-500/30 shadow-md shadow-emerald-500/5'
          : isUpNext
          ? 'bg-slate-900/90 border-sky-500/60 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/30'
          : isRebalanced
          ? 'bg-slate-900/70 border-amber-500/40 shadow-md shadow-amber-500/5'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Visual Accent Glow for Up-Next */}
      {isUpNext && (
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      )}

      {/* Top Banner for Rebalanced Day */}
      {isRebalanced && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
          <span className="flex items-center gap-1.5 font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Re-balanced: Adjusted schedule to prevent study burnout
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 px-2 py-0.5 rounded">
            Rescheduled
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-5">
        {/* 1. Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Day Badge */}
            <span
              className={`px-3 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isUpNext
                  ? 'bg-sky-500 text-white font-extrabold shadow-sm shadow-sky-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              Day {day.dayNumber}
            </span>

            {/* Scheduled Date */}
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {day.scheduledDate}
            </span>

            {/* Domain Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${domainMeta.badgeClass}`}>
              {domainMeta.name} ({day.domainWeight})
            </span>

            {/* Estimated Duration */}
            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
              {day.estimatedMinutes} mins
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Completed ✅
              </span>
            ) : isUpNext ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                Up Next 🎯
              </span>
            ) : isRebalanced ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                Re-balanced 🔄
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                <Clock className="w-3.5 h-3.5" />
                Pending
              </span>
            )}
          </div>
        </div>

        {/* 2. Topic Title & Subtitle */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {day.topicTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {day.topicSubtitle}
          </p>
        </div>

        {/* 3. Three Actionable Micro-Learning Blocks */}
        <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
          {/* STEP 1: Read & Watch (15m) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      📖 Step 1: Read & Watch
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      (~15 mins)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                    {day.learningBlock.objective}
                  </p>
                </div>
              </div>

              {/* External MS Learn Search Button */}
              <a
                href={msLearnUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all hover:scale-[1.02] shrink-0"
              >
                <span>Search on MS Learn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* STEP 2: Hands-On Sandbox (10m) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSandboxExpanded(!isSandboxExpanded)}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      🛠️ Step 2: Hands-On Sandbox
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      (~10 mins)
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                    {day.learningBlock.sandboxExercise.title}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                className="p-1 rounded text-slate-400 hover:text-white"
                aria-label="Toggle Sandbox steps"
              >
                {isSandboxExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {isSandboxExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 pl-1 sm:pl-3 space-y-2 text-xs text-slate-300">
                <p className="text-xs text-slate-400 italic">
                  {day.learningBlock.sandboxExercise.description}
                </p>
                <div className="space-y-1.5 mt-2">
                  {day.learningBlock.sandboxExercise.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 leading-normal">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Active Recall Checkpoint (5m) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/25">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsRecallExpanded(!isRecallExpanded)}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      🧠 Step 3: Active Recall Checkpoint
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      (~5 mins)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                    Official Exam Style Question
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="p-1 rounded text-slate-400 hover:text-white"
                aria-label="Toggle Recall Question"
              >
                {isRecallExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {isRecallExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
                {/* Checkpoint Question Callout */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{day.learningBlock.activeRecall.question}</span>
                </div>

                {/* Input for user before revealing */}
                <form onSubmit={handleAnswerSubmit} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type your quick answer before revealing..."
                      value={localAnswer}
                      onChange={(e) => {
                        setLocalAnswer(e.target.value);
                        onUpdateUserAnswer(day.id, e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-3 pr-20 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <span>Save</span>
                      <Send className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </form>

                {/* Reveal Trainer Explanation Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => onToggleRevealAnswer(day.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>
                      {day.isAnswerRevealed
                        ? 'Hide Trainer Explanation'
                        : 'Reveal Trainer Explanation'}
                    </span>
                  </button>
                  {localAnswer && !day.isAnswerRevealed && (
                    <span className="text-[11px] text-slate-400">
                      Answer saved! Reveal to verify.
                    </span>
                  )}
                </div>

                {/* Trainer Explanation Body */}
                {day.isAnswerRevealed && (
                  <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs space-y-2 animate-fadeIn">
                    <div>
                      <span className="font-bold text-sky-300 block mb-1">
                        💡 Trainer Explanation:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {day.learningBlock.activeRecall.explanation}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-sky-900/60 flex items-start gap-2 text-sky-200">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">Exam Key Takeaway:</strong>{' '}
                        {day.learningBlock.activeRecall.keyTakeaway}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Card Footer: "Mark Day Complete ✅" */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {isCompleted ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Completed! Ready for the next exam topic.
              </span>
            ) : isUpNext ? (
              <span className="text-sky-400 font-medium">
                🎯 Recommended for today&apos;s study session.
              </span>
            ) : (
              <span>Estimated time: {day.estimatedMinutes} minutes</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleComplete(day.id)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all duration-200 flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isCompleted ? 'Completed (Click to Reopen)' : 'Mark Day Complete ✅'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
