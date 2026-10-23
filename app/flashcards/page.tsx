'use client';

import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { fireCelebrationConfetti } from '@/lib/confetti';

interface Flashcard {
  id: string;
  domain: string;
  front: string;
  back: string;
  examHint: string;
}

const FLASHCARDS: Flashcard[] = [
  {
    id: 'f1',
    domain: 'Cloud Concepts',
    front: 'Under PaaS (e.g., Azure App Service), who is responsible for operating system patching?',
    back: 'Microsoft manages the physical hardware and OS patching. The customer only manages the application code and data.',
    examHint: 'In IaaS, customer patches OS. In PaaS, Microsoft patches OS.',
  },
  {
    id: 'f2',
    domain: 'Cloud Concepts',
    front: 'What is the fundamental difference between CapEx and OpEx?',
    back: 'CapEx (Capital Expenditure) requires upfront capital investment in physical hardware. OpEx (Operational Expenditure) is pay-as-you-go, consumption-based spending with no upfront infrastructure cost.',
    examHint: 'Cloud shifts IT financial planning from CapEx to OpEx.',
  },
  {
    id: 'f3',
    domain: 'Architecture & Services',
    front: 'How many fault-isolated data centers exist inside a single Azure Availability Zone?',
    back: 'One or more physical datacenters, each equipped with independent power, cooling, and networking within the region.',
    examHint: 'Availability Zones protect against datacenter failures within the same region.',
  },
  {
    id: 'f4',
    domain: 'Architecture & Services',
    front: 'When should an organization choose Azure ExpressRoute over Azure VPN Gateway?',
    back: 'When dedicated, private, high-speed fiber connectivity is required that completely bypasses the public Internet.',
    examHint: 'ExpressRoute = private fiber (no public Internet). VPN Gateway = encrypted tunnel over public Internet.',
  },
  {
    id: 'f5',
    domain: 'Architecture & Services',
    front: 'What are the four Azure Blob Storage access tiers and their minimum retention periods?',
    back: '1. Hot (immediate, frequent)\n2. Cool (30 days minimum)\n3. Cold (90 days minimum)\n4. Archive (180 days minimum, offline, takes hours to rehydrate)',
    examHint: 'Archive tier is offline and requires rehydration before accessing data.',
  },
  {
    id: 'f6',
    domain: 'Management & Governance',
    front: 'What is the inheritance behavior of a CanNotDelete Resource Lock applied to a Resource Group?',
    back: 'All resources inside the resource group automatically inherit the CanNotDelete lock and cannot be deleted until the lock is removed.',
    examHint: 'Locks applied at the parent level flow down to all child resources.',
  },
  {
    id: 'f7',
    domain: 'Management & Governance',
    front: 'What is the difference between Azure Policy and Azure Role-Based Access Control (RBAC)?',
    back: 'RBAC focuses on WHO has permissions to perform actions (User actions). Azure Policy focuses on WHAT properties and rules deployed resources must comply with (Resource state).',
    examHint: 'RBAC = User Authorization. Policy = Resource Compliance & Governance.',
  },
];

export default function FlashcardsPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  const card = FLASHCARDS[currentIdx];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev < FLASHCARDS.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : FLASHCARDS.length - 1));
  };

  const handleMarkMastered = () => {
    if (!masteredIds.includes(card.id)) {
      setMasteredIds((prev) => [...prev, card.id]);
      fireCelebrationConfetti();
    }
    handleNext();
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Recall Flashcards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AZ-900 Core Concept Flashcards
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tap or click any flashcard to flip between the question and the explanation.
          </p>
        </div>

        {/* Mastery Count */}
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="text-slate-500">Mastered: </span>
          <span className="font-bold text-emerald-400">{masteredIds.length}</span>
          <span className="text-slate-500"> / {FLASHCARDS.length}</span>
        </div>
      </div>

      {/* Interactive Flashcard Container */}
      <div className="space-y-6">
        <div
          onClick={() => setIsFlipped((prev) => !prev)}
          className={`min-h-[300px] sm:min-h-[340px] p-8 sm:p-12 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col justify-between select-none relative group border ${
            isFlipped
              ? 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-sky-500/40 shadow-xl shadow-sky-500/10'
              : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl'
          }`}
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between text-xs">
            <span className="px-3 py-1 rounded-full font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              {card.domain}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 text-xs">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-sky-400" />
              <span>Click to {isFlipped ? 'Flip to Question' : 'Reveal Answer'}</span>
            </span>
          </div>

          {/* Card Body */}
          <div className="py-6 my-auto text-center space-y-4">
            {!isFlipped ? (
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                  Concept Prompt
                </span>
                <p className="text-xl sm:text-2xl font-bold text-white max-w-xl mx-auto leading-relaxed">
                  {card.front}
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-left max-w-xl mx-auto animate-in fade-in duration-200">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                  Answer Explanation
                </span>
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                  {card.back}
                </p>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Exam Takeaway:</strong> {card.examHint}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80">
            <span>Card {currentIdx + 1} of {FLASHCARDS.length}</span>
            {masteredIds.includes(card.id) && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mastered</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Navigation Controls */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleMarkMastered}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Know This!</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
