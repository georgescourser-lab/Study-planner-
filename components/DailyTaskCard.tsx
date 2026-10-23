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
  Lightbulb,
  Check,
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
  const [isExpanded, setIsExpanded] = useState(day.status === 'up-next' || day.dayNumber === 1);

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
      className={`rounded-xl transition-all duration-200 border ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800/80 opacity-90'
          : isUpNext
          ? 'bg-slate-900/80 border-sky-500/40 shadow-sm shadow-sky-500/5'
          : 'bg-slate-900/50 border-slate-800'
      }`}
    >
      {/* Card Header Row (Clickable to collapse/expand) */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Quick Complete Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleComplete(day.id)}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors border ${
              isCompleted
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'border-slate-700 hover:border-slate-500 text-transparent hover:text-slate-500'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Title and Meta */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-400">
                Day {day.dayNumber}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {day.scheduledDate}
              </span>
              <span className="text-slate-600">•</span>
              <span className={`text-[11px] px-2 py-0.2 rounded-full font-medium ${domainMeta.badgeClass}`}>
                {domainMeta.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400">
                {day.estimatedMinutes}m
              </span>

              {isRebalanced && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Rescheduled
                </span>
              )}
            </div>

            <h3
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-sm sm:text-base font-semibold cursor-pointer transition-colors ${
                isCompleted
                  ? 'text-slate-400 line-through'
                  : 'text-white hover:text-sky-300'
              }`}
            >
              {day.topicTitle}
            </h3>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span>{isExpanded ? 'Hide' : 'Details'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Steps Content */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-3.5 text-xs">
          {/* Step 1: Reading */}
          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">
                    Step 1: Concept Reading (~15 mins)
                  </span>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    {day.learningBlock.objective}
                  </p>
                </div>
              </div>

              <a
                href={msLearnUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors shrink-0 self-start sm:self-center"
              >
                <span>MS Learn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Step 2: Practice / Sandbox */}
          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
            <div className="flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div>
                  <span className="font-semibold text-slate-200">
                    Step 2: Hands-on Practice (~10 mins)
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    {day.learningBlock.sandboxExercise.title}
                  </p>
                </div>

                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  {day.learningBlock.sandboxExercise.steps.slice(0, 3).map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3: Active Recall Question */}
          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    Step 3: Quick Recall Check (~5 mins)
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {day.learningBlock.activeRecall.question}
                </p>

                {/* Input form */}
                <form onSubmit={handleAnswerSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Your answer..."
                    value={localAnswer}
                    onChange={(e) => {
                      setLocalAnswer(e.target.value);
                      onUpdateUserAnswer(day.id, e.target.value);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => onToggleRevealAnswer(day.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                  >
                    {day.isAnswerRevealed ? 'Hide' : 'Reveal'}
                  </button>
                </form>

                {/* Trainer Explanation */}
                {day.isAnswerRevealed && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
                    <p className="leading-relaxed">
                      {day.learningBlock.activeRecall.explanation}
                    </p>
                    <p className="text-sky-300 text-[11px] font-medium pt-1 border-t border-slate-800/60">
                      Key takeaway: {day.learningBlock.activeRecall.keyTakeaway}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Card Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Estimated: {day.estimatedMinutes} minutes
            </span>
            <button
              type="button"
              onClick={() => onToggleComplete(day.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isCompleted
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
              }`}
            >
              {isCompleted ? 'Mark as Incomplete' : 'Complete Topic'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
