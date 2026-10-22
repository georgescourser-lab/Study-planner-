'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { fireCelebrationConfetti } from '@/lib/confetti';

interface Question {
  id: string;
  domain: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  examTip: string;
}

const AZ900_QUESTIONS: Question[] = [
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

export default function PracticeQuizzesPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const filteredQuestions = AZ900_QUESTIONS.filter(
    (q) => selectedDomain === 'All' || q.domain === selectedDomain
  );

  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setAnsweredCount((prev) => prev + 1);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      fireCelebrationConfetti();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setAnsweredCount(0);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Official AZ-900 Practice Questions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AZ-900 Practice Quizzes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Test your knowledge with real exam scenarios and receive instant explanations.
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Score: </span>
            <span className="font-bold text-sky-400">{score}</span>
            <span className="text-slate-500"> / {answeredCount}</span>
          </div>

          <button
            onClick={handleResetQuiz}
            title="Reset Quiz"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Domain Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['All', 'Cloud Concepts', 'Azure Architecture & Services', 'Management & Governance'].map(
          (domain) => {
            const isSelected = selectedDomain === domain;
            return (
              <button
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  setCurrentIdx(0);
                  setSelectedOption(null);
                  setIsAnswerSubmitted(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {domain}
              </button>
            );
          }
        )}
      </div>

      {/* Question Card */}
      {currentQ ? (
        <div className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-slate-800 space-y-6">
          {/* Question Metadata */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="px-2.5 py-1 rounded-full font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {currentQ.domain}
            </span>
            <span className="text-slate-500">
              Question {currentIdx + 1} of {filteredQuestions.length}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optionStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

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

          {/* Explanation Box (Visible after submission) */}
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
                    <span>Incorrect. Correct Option: {String.fromCharCode(65 + currentQ.correctIndex)}</span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Exam Tip:</strong> {currentQ.examTip}
                </span>
              </div>
            </div>
          )}

          {/* Action Button Row */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Official AZ-900 Question Format
            </span>

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
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-sky-500/20 flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl glass-card border border-slate-800">
          <p className="text-slate-400">No questions found for this domain.</p>
        </div>
      )}
    </div>
  );
}
