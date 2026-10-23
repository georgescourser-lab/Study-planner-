'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Award,
  Database,
  Save,
  BookOpen,
  Trash2,
  Clock,
  Layers,
  Wand2,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import { fireCelebrationConfetti } from '@/lib/confetti';
import { QuizQuestion, SavedQuiz } from '@/types/study-plan';

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    domain: 'Cloud Concepts',
    question: 'Under the Azure Shared Responsibility Model, which component is ALWAYS the customer\'s sole responsibility across IaaS, PaaS, and SaaS?',
    options: [
      'Operating system patching and updates',
      'Data and identity & access management',
      'Physical datacenter security and power',
      'Virtual network infrastructure',
    ],
    correctIndex: 1,
    explanation: 'Regardless of the cloud deployment model (IaaS, PaaS, or SaaS), the customer ALWAYS maintains 100% responsibility for protecting their data and managing identity/access credentials.',
    examTip: 'High-probability question on the exam! Remember: Customer ALWAYS owns Data and Identities.',
  },
  {
    id: 'q2',
    domain: 'Azure Architecture & Services',
    question: 'What is the primary architectural purpose of an Azure Availability Zone?',
    options: [
      'To provide geographical disaster recovery across distances greater than 300 miles',
      'To protect workloads against single physical datacenter failures within the same region with independent power, cooling, and networking',
      'To automatically migrate on-premises Hyper-V virtual machines to Azure',
      'To eliminate all operational costs for virtual machine workloads',
    ],
    correctIndex: 1,
    explanation: 'An Availability Zone is made up of one or more physical datacenters equipped with independent power, cooling, and networking within an Azure region. They protect against datacenter-level outages.',
    examTip: 'Datacenter failure = Availability Zones. Regional disaster (>300 miles) = Region Pairs.',
  },
  {
    id: 'q3',
    domain: 'Azure Architecture & Services',
    question: 'A company wants to run serverless, event-driven code without provisioning or managing any virtual servers or runtimes. Which Azure service should they deploy?',
    options: [
      'Azure Virtual Machines',
      'Azure Virtual Desktop (AVD)',
      'Azure Functions',
      'Azure Kubernetes Service (AKS)',
    ],
    correctIndex: 2,
    explanation: 'Azure Functions is an event-driven serverless compute platform. You pay only for execution time without configuring VMs or container clusters.',
    examTip: 'Key buzzword: "Event-driven serverless compute" -> Azure Functions.',
  },
  {
    id: 'q4',
    domain: 'Management & Governance',
    question: 'An administrator needs to prevent a critical production Azure SQL database from being accidentally deleted, even by users who hold the Owner role. What feature should they configure?',
    options: [
      'Azure Role-Based Access Control (RBAC) Reader role',
      'CanNotDelete Resource Lock',
      'Azure Network Security Group (NSG) outbound deny rule',
      'Conditional Access Multi-Factor Authentication',
    ],
    correctIndex: 1,
    explanation: 'A CanNotDelete resource lock prevents authorized users (including Subscription and Resource Group Owners) from deleting the resource until the lock is explicitly removed.',
    examTip: 'CanNotDelete allows read/modify but blocks deletion. ReadOnly blocks both deletion and modification.',
  },
  {
    id: 'q5',
    domain: 'Management & Governance',
    question: 'Which tool allows administrators to enforce company compliance standards, such as restricting resource deployments exclusively to the "East US" region?',
    options: [
      'Azure Policy',
      'Azure Monitor',
      'Microsoft Entra ID',
      'Azure Service Health',
    ],
    correctIndex: 0,
    explanation: 'Azure Policy enforces governance rules, evaluates resource compliance across subscriptions, and can prevent non-compliant resources (like disallowed regions) from being deployed.',
    examTip: 'RBAC handles WHO has permissions. Azure Policy enforces WHAT properties resources must comply with.',
  },
  {
    id: 'q6',
    domain: 'Azure Architecture & Services',
    question: 'Which storage redundancy option replicates data three times across three separate Availability Zones within the primary region?',
    options: [
      'Locally Redundant Storage (LRS)',
      'Zone-Redundant Storage (ZRS)',
      'Geo-Redundant Storage (GRS)',
      'Read-Access Geo-Zone-Redundant Storage (RA-GZRS)',
    ],
    correctIndex: 1,
    explanation: 'Zone-Redundant Storage (ZRS) copies data synchronously across three Azure Availability Zones in the primary region, providing high availability against datacenter failures.',
    examTip: 'LRS = 3 copies in 1 DC; ZRS = 3 copies across 3 Zones in primary region; GRS = 3 primary + 3 secondary region.',
  },
];

const SUGGESTED_TOPICS = [
  'Shared Responsibility Model',
  'CapEx vs. OpEx Cloud Economics',
  'Availability Zones vs Region Pairs',
  'Azure Blob Storage Tiers (Hot, Cool, Cold, Archive)',
  'VMs vs App Service vs Azure Functions',
  'CanNotDelete & ReadOnly Resource Locks',
  'Microsoft Entra ID vs Active Directory',
  'Azure Policy & Regulatory Compliance Initiatives',
  'ExpressRoute vs VPN Gateway',
  'Composite SLA Calculations',
];

export default function PracticeQuizzesPage() {
  const [activeTab, setActiveTab] = useState<'take-quiz' | 'saved-reviews'>('take-quiz');
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // AI Generator Form States
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');
  const [questionCount, setQuestionCount] = useState(5);
  const [activeQuizTitle, setActiveQuizTitle] = useState('Official AZ-900 Core Objectives Quiz');
  const [quizSource, setQuizSource] = useState<'gemini' | 'curriculum-engine' | 'preset'>('preset');

  // Supabase Persistence States
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [reviewingQuiz, setReviewingQuiz] = useState<any | null>(null);

  // Load Saved Quizzes from Supabase on mount
  useEffect(() => {
    loadSavedQuizzes();
  }, []);

  const loadSavedQuizzes = async () => {
    setIsLoadingSaved(true);
    try {
      const res = await fetch('/api/quizzes/saved');
      const data = await res.json();
      if (data.quizzes && Array.isArray(data.quizzes)) {
        setSavedQuizzes(data.quizzes);
      } else {
        // Fallback to local storage if database table not yet queried
        const local = localStorage.getItem('az900_saved_quizzes');
        if (local) {
          setSavedQuizzes(JSON.parse(local));
        }
      }
    } catch {
      const local = localStorage.getItem('az900_saved_quizzes');
      if (local) {
        setSavedQuizzes(JSON.parse(local));
      }
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleGenerateQuiz = async (overrideTopic?: string) => {
    const topicToUse = overrideTopic || customTopic.trim() || 'Azure Architecture & Services';
    setIsGenerating(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          domain: selectedDomain === 'All Domains' ? undefined : selectedDomain,
          questionCount,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setScore(0);
        setAnsweredCount(0);
        setUserAnswers(new Array(data.questions.length).fill(null));
        setActiveQuizTitle(`AI Practice Quiz: ${topicToUse}`);
        setQuizSource(data.source);
        setActiveTab('take-quiz');
        fireCelebrationConfetti();
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setAnsweredCount((prev) => prev + 1);

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIdx] = selectedOption;
    setUserAnswers(updatedAnswers);

    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      fireCelebrationConfetti();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setAnsweredCount(0);
    setUserAnswers(new Array(questions.length).fill(null));
    setSaveStatus(null);
  };

  const handleSaveQuizToDatabase = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const quizPayload = {
      title: activeQuizTitle,
      domain: selectedDomain || 'Azure Architecture & Services',
      topic: customTopic || 'Core Objectives',
      questions,
      userAnswers,
      score,
      totalQuestions: questions.length,
    };

    try {
      const res = await fetch('/api/quizzes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizPayload),
      });

      const data = await res.json();

      if (data.success) {
        setSaveStatus('Saved to Supabase database! You can review it anytime in the Saved Reviews tab.');
        fireCelebrationConfetti();
        loadSavedQuizzes();
      } else {
        // Fallback to local storage if table missing or database returned notice
        const local = localStorage.getItem('az900_saved_quizzes');
        const existing = local ? JSON.parse(local) : [];
        const newRecord = {
          ...quizPayload,
          id: `local_${Date.now()}`,
          created_at: new Date().toISOString(),
          storedLocally: true,
        };
        const updated = [newRecord, ...existing];
        localStorage.setItem('az900_saved_quizzes', JSON.stringify(updated));
        setSavedQuizzes(updated);
        setSaveStatus(
          data.isTableMissing
            ? 'Saved to Local Cache! (To save to Supabase cloud, run the updated script in supabase/schema.sql).'
            : 'Saved to Local Storage!'
        );
      }
    } catch {
      // Local storage fallback
      const local = localStorage.getItem('az900_saved_quizzes');
      const existing = local ? JSON.parse(local) : [];
      const newRecord = {
        ...quizPayload,
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        storedLocally: true,
      };
      const updated = [newRecord, ...existing];
      localStorage.setItem('az900_saved_quizzes', JSON.stringify(updated));
      setSavedQuizzes(updated);
      setSaveStatus('Saved to offline storage for review!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedQuiz = async (id: string) => {
    try {
      await fetch(`/api/quizzes/saved/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const updated = savedQuizzes.filter((q) => q.id !== id);
    setSavedQuizzes(updated);
    localStorage.setItem('az900_saved_quizzes', JSON.stringify(updated));
    if (reviewingQuiz?.id === id) {
      setReviewingQuiz(null);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Practice Exams & Supabase Persistence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>AZ-900 Practice Quizzes</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate customized AI practice quizzes on any Azure topic, score yourself, and save your results to the database for review.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveTab('take-quiz');
              setReviewingQuiz(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'take-quiz' && !reviewingQuiz
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Quiz Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('saved-reviews')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved-reviews'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved Reviews ({savedQuizzes.length})</span>
          </button>
        </div>
      </div>

      {/* AI QUIZ GENERATOR CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Generate Custom AI Quiz</h3>
              <p className="text-xs text-slate-400">
                Choose any syllabus topic or let Gemini generate questions based on official exam objectives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="All Domains">All Domains</option>
              <option value="Cloud Concepts">Cloud Concepts (25-30%)</option>
              <option value="Azure Architecture & Services">Architecture & Services (35-40%)</option>
              <option value="Management & Governance">Management & Governance (30-35%)</option>
            </select>

            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={8}>8 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>
        </div>

        {/* Topic Input & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter any topic (e.g. Azure Blob Tiers, CanNotDelete locks, ExpressRoute, Entra ID)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />

          <button
            type="button"
            onClick={() => handleGenerateQuiz()}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Topic Suggested Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">Suggested:</span>
          {SUGGESTED_TOPICS.map((top, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomTopic(top);
                handleGenerateQuiz(top);
              }}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-white border border-slate-800/80 whitespace-nowrap transition-colors"
            >
              {top}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: SAVED QUIZZES REVIEW TAB */}
      {activeTab === 'saved-reviews' && !reviewingQuiz && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Saved Quizzes in Database for Review</span>
            </h2>
            <button
              onClick={loadSavedQuizzes}
              disabled={isLoadingSaved}
              className="text-xs text-sky-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSaved ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {savedQuizzes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold">No saved quizzes found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate or take an AZ-900 quiz above, then click &quot;Save Quiz to Database&quot; to review your answers, score, and explanations here.
              </p>
              <button
                onClick={() => setActiveTab('take-quiz')}
                className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold"
              >
                Go to Quiz Simulator
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {quiz.domain || 'All Domains'}
                      </span>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(quiz.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {quiz.title}
                    </h3>

                    {quiz.topic && (
                      <p className="text-xs text-slate-400">
                        Topic: <span className="text-slate-300 font-medium">{quiz.topic}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-white">
                        Score: {quiz.score ?? 0} / {quiz.total_questions || quiz.questions?.length || 5}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReviewingQuiz(quiz)}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSavedQuiz(quiz.id)}
                        title="Delete quiz"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: REVIEWING A SPECIFIC SAVED QUIZ */}
      {reviewingQuiz && (
        <div className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-slate-800 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reviewing Saved Quiz from Supabase Database</span>
              </div>
              <h2 className="text-xl font-bold text-white">{reviewingQuiz.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400">Recorded Score: </span>
                <span className="font-bold text-sky-400">{reviewingQuiz.score ?? 0}</span>
                <span className="text-slate-500"> / {reviewingQuiz.questions?.length}</span>
              </div>

              <button
                onClick={() => setReviewingQuiz(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white transition-colors"
              >
                Close Review
              </button>
            </div>
          </div>

          {/* List of Questions in Review Mode */}
          <div className="space-y-6">
            {reviewingQuiz.questions?.map((q: QuizQuestion, idx: number) => {
              const userAns = reviewingQuiz.user_answers?.[idx] ?? reviewingQuiz.userAnswers?.[idx];
              const isUserCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Question {idx + 1}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        isUserCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isUserCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-white">{q.question}</p>

                  <div className="space-y-2 pt-1">
                    {q.options?.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      const isUserChoice = optIdx === userAns;

                      let style = 'bg-slate-900 border-slate-800 text-slate-400 opacity-60';
                      if (isCorrect) {
                        style = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isUserChoice && !isCorrect) {
                        style = 'bg-rose-500/20 border-rose-500 text-rose-200 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <p className="leading-relaxed">
                      <strong className="text-white">Explanation:</strong> {q.explanation}
                    </p>
                    {q.examTip && (
                      <p className="text-amber-300">
                        <strong className="text-amber-400">Exam Tip:</strong> {q.examTip}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: ACTIVE QUIZ SIMULATOR */}
      {activeTab === 'take-quiz' && !reviewingQuiz && (
        <div className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-slate-800 space-y-6">
          {/* Header row with Title and Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {currentQ?.domain || 'Azure Fundamentals'}
                </span>
                {quizSource === 'gemini' && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                    ✨ Gemini 3.5 Generated
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{activeQuizTitle}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400">Score: </span>
                <span className="font-bold text-sky-400">{score}</span>
                <span className="text-slate-500"> / {answeredCount}</span>
              </div>

              <button
                onClick={handleResetQuiz}
                title="Restart Quiz"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Metadata & Number */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question <strong className="text-white">{currentIdx + 1}</strong> of{' '}
              <strong className="text-white">{questions.length}</strong>
            </span>

            {/* Progress bar */}
            <div className="w-32 sm:w-48 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Prompt */}
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ?.question}
          </h2>

          {/* Options List */}
          <div className="space-y-3 pt-1">
            {currentQ?.options?.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optionStyle =
                'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

              if (isSelected && !isAnswerSubmitted) {
                optionStyle = 'bg-sky-500/15 border-sky-500/50 text-sky-200 shadow-sm shadow-sky-500/10';
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
                } else if (isSelected) {
                  optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                } else {
                  optionStyle = 'opacity-50 border-slate-800 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start gap-3.5 ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 mt-0.5">{opt}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Visible after answer submission) */}
          {isAnswerSubmitted && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {selectedOption === currentQ.correctIndex ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct Answer!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <XCircle className="w-4 h-4" />
                    <span>
                      Incorrect. Correct Option: {String.fromCharCode(65 + currentQ.correctIndex)}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              {currentQ.examTip && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Official Exam Tip:</strong> {currentQ.examTip}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Save Status Notification */}
          {saveStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* Bottom Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {/* Save Quiz to Database Button */}
            <button
              type="button"
              onClick={handleSaveQuizToDatabase}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Save Quiz to Database for Review</span>
                </>
              )}
            </button>

            {/* Answer / Next Button */}
            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-sky-500/20"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  currentIdx < questions.length - 1
                    ? handleNextQuestion
                    : handleResetQuiz
                }
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5"
              >
                <span>
                  {currentIdx < questions.length - 1 ? 'Next Question' : 'Restart Quiz'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
