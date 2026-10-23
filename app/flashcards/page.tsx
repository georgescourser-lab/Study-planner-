'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cloud,
  Wand2,
  RefreshCw,
  Save,
  Database,
  Award,
  BookOpen,
} from 'lucide-react';
import { fireCelebrationConfetti } from '@/lib/confetti';
import { FlashcardItem } from '@/types/study-plan';

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'f1',
    domain: 'Cloud Concepts',
    topic: 'Shared Responsibility',
    front: 'Under PaaS (e.g., Azure App Service), who is responsible for operating system patching?',
    back: 'Microsoft manages the physical hardware and OS patching. The customer only manages the application code and data.',
    examHint: 'In IaaS, customer patches OS. In PaaS, Microsoft patches OS.',
  },
  {
    id: 'f2',
    domain: 'Cloud Concepts',
    topic: 'CapEx vs OpEx',
    front: 'What is the fundamental difference between CapEx and OpEx?',
    back: 'CapEx (Capital Expenditure) requires upfront capital investment in physical hardware. OpEx (Operational Expenditure) is pay-as-you-go, consumption-based spending with no upfront infrastructure cost.',
    examHint: 'Cloud shifts IT financial planning from CapEx to OpEx.',
  },
  {
    id: 'f3',
    domain: 'Azure Architecture & Services',
    topic: 'Availability Zones',
    front: 'How many fault-isolated data centers exist inside a single Azure Availability Zone?',
    back: 'One or more physical datacenters, each equipped with independent power, cooling, and networking within the region.',
    examHint: 'Availability Zones protect against datacenter failures within the same region.',
  },
  {
    id: 'f4',
    domain: 'Azure Architecture & Services',
    topic: 'Networking',
    front: 'When should an organization choose Azure ExpressRoute over Azure VPN Gateway?',
    back: 'When dedicated, private, high-speed fiber connectivity is required that completely bypasses the public Internet.',
    examHint: 'ExpressRoute = private fiber (no public Internet). VPN Gateway = encrypted tunnel over public Internet.',
  },
  {
    id: 'f5',
    domain: 'Azure Architecture & Services',
    topic: 'Blob Storage Tiers',
    front: 'What are the four Azure Blob Storage access tiers and their minimum retention periods?',
    back: '1. Hot (immediate, frequent)\n2. Cool (30 days minimum)\n3. Cold (90 days minimum)\n4. Archive (180 days minimum, offline, takes hours to rehydrate)',
    examHint: 'Archive tier is offline and requires rehydration before accessing data.',
  },
  {
    id: 'f6',
    domain: 'Management & Governance',
    topic: 'Resource Locks',
    front: 'What is the inheritance behavior of a CanNotDelete Resource Lock applied to a Resource Group?',
    back: 'All resources inside the resource group automatically inherit the CanNotDelete lock and cannot be deleted until the lock is removed.',
    examHint: 'Locks applied at the parent level flow down to all child resources.',
  },
  {
    id: 'f7',
    domain: 'Management & Governance',
    topic: 'Azure Policy vs RBAC',
    front: 'What is the difference between Azure Policy and Azure Role-Based Access Control (RBAC)?',
    back: 'RBAC focuses on WHO has permissions to perform actions (User authorization). Azure Policy focuses on WHAT properties and rules deployed resources must comply with (Resource compliance).',
    examHint: 'RBAC = User Authorization. Policy = Resource Compliance & Governance.',
  },
];

const SUGGESTED_CARD_TOPICS = [
  'Azure Blob Storage Redundancy (LRS, ZRS, GRS)',
  'Microsoft Entra ID vs Active Directory',
  'CanNotDelete & ReadOnly Resource Locks',
  'Azure Functions vs Logic Apps vs WebJobs',
  'Composite SLA Formulas & Downtime Limits',
  'Azure Policy & Initiatives',
  'Cloud Models: IaaS vs PaaS vs SaaS',
];

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardItem[]>(DEFAULT_FLASHCARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [deckTitle, setDeckTitle] = useState('AZ-900 Core Concept Flashcards');

  // AI Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('Azure Architecture & Services');
  const [cardCount, setCardCount] = useState(5);
  const [cardSource, setCardSource] = useState<'gemini' | 'curriculum-engine' | 'preset'>('preset');

  // Supabase Save States
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const card = cards[currentIdx] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleMarkMastered = () => {
    if (card && !masteredIds.includes(card.id)) {
      const updated = [...masteredIds, card.id];
      setMasteredIds(updated);
      fireCelebrationConfetti();
      if (updated.length === cards.length) {
        setTimeout(() => fireCelebrationConfetti(), 400);
      }
    }
    handleNext();
  };

  const handleGenerateCards = async (overrideTopic?: string) => {
    const topicToUse = overrideTopic || customTopic.trim() || 'Azure Architecture & Services';
    setIsGenerating(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          domain: selectedDomain,
          cardCount,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.cards) && data.cards.length > 0) {
        setCards(data.cards);
        setCurrentIdx(0);
        setIsFlipped(false);
        setMasteredIds([]);
        setDeckTitle(`AI Deck: ${topicToUse}`);
        setCardSource(data.source);
        fireCelebrationConfetti();
      }
    } catch (err) {
      console.error('Failed to generate flashcards:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDeckToDatabase = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const payload = {
      title: deckTitle,
      domain: selectedDomain,
      topic: customTopic || 'Active Recall Deck',
      cards,
      masteredIds,
    };

    try {
      const res = await fetch('/api/flashcards/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSaveStatus('Flashcard deck saved to Supabase database!');
        fireCelebrationConfetti();
      } else {
        // Fallback to local storage
        const local = localStorage.getItem('az900_saved_flashcards');
        const existing = local ? JSON.parse(local) : [];
        localStorage.setItem(
          'az900_saved_flashcards',
          JSON.stringify([{ ...payload, id: `local_${Date.now()}` }, ...existing])
        );
        setSaveStatus(
          data.isTableMissing
            ? 'Deck cached locally! (To save to Supabase cloud, run the updated script in supabase/schema.sql).'
            : 'Deck saved locally!'
        );
      }
    } catch {
      const local = localStorage.getItem('az900_saved_flashcards');
      const existing = local ? JSON.parse(local) : [];
      localStorage.setItem(
        'az900_saved_flashcards',
        JSON.stringify([{ ...payload, id: `local_${Date.now()}` }, ...existing])
      );
      setSaveStatus('Deck saved locally for offline review!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Recall Flashcards • AI Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{deckTitle}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate custom flashcard decks on any Azure topic with Gemini AI, flip to test recall, and save decks to database.
          </p>
        </div>

        {/* Mastery Count Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500">Mastered: </span>
            <span className="font-bold text-emerald-400">{masteredIds.length}</span>
            <span className="text-slate-500"> / {cards.length}</span>
          </div>

          <button
            onClick={handleSaveDeckToDatabase}
            disabled={isSaving}
            title="Save Deck to Database"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Save className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* AI FLASHCARD GENERATOR CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Generate Flashcard Deck with AI</h3>
              <p className="text-xs text-slate-400">
                Type any topic or select a suggested domain to generate custom active-recall drills.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="Cloud Concepts">Cloud Concepts</option>
              <option value="Azure Architecture & Services">Architecture & Services</option>
              <option value="Management & Governance">Management & Governance</option>
            </select>

            <select
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value={5}>5 Cards</option>
              <option value={8}>8 Cards</option>
              <option value={10}>10 Cards</option>
            </select>
          </div>
        </div>

        {/* Input & Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter flashcard topic (e.g. ExpressRoute, Blob Redundancy, Entra ID, Resource Locks)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />

          <button
            type="button"
            onClick={() => handleGenerateCards()}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Cards...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Deck</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Topic Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">Suggested:</span>
          {SUGGESTED_CARD_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomTopic(topic);
                handleGenerateCards(topic);
              }}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-white border border-slate-800/80 whitespace-nowrap transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Interactive Flashcard Container */}
      {card && (
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
                <span>Click to {isFlipped ? 'Flip to Prompt' : 'Reveal Answer'}</span>
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
                  {card.examHint && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Exam Takeaway:</strong> {card.examHint}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80">
              <span>
                Card {currentIdx + 1} of {cards.length}
              </span>
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
      )}
    </div>
  );
}
