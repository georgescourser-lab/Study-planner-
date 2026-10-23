'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Cloud,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  User,
  BookOpen,
  Compass,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  text: string;
  timestamp: string;
  examTip?: string;
  msLearnQuery?: string;
  relatedTopics?: string[];
  source?: 'gemini' | 'curriculum-engine';
}

const PRESET_TOPICS = [
  { label: 'All Topics', topic: '' },
  { label: 'Shared Responsibility', topic: 'Cloud Computing Models & Shared Responsibility' },
  { label: 'CapEx vs. OpEx', topic: 'CapEx vs. OpEx & Cloud Economics' },
  { label: 'Availability Zones', topic: 'Regions, Availability Zones & Region Pairs' },
  { label: 'VM vs App Service', topic: 'Azure Compute: Virtual Machines vs App Services' },
  { label: 'Storage Tiers', topic: 'Azure Blob Storage Tiers (Hot, Cool, Cold, Archive)' },
  { label: 'ExpressRoute', topic: 'Azure Networking & ExpressRoute' },
  { label: 'Resource Locks', topic: 'Azure Resource Manager & Resource Locks' },
  { label: 'Entra ID & RBAC', topic: 'Microsoft Entra ID & RBAC' },
  { label: 'Azure Policy', topic: 'Azure Policy & Governance' },
  { label: 'Composite SLA', topic: 'Composite SLA Calculations & Availability' },
];

const PRESET_PROMPTS = [
  'Explain the Shared Responsibility Model with a pizza analogy',
  'When should I choose Azure App Service over Virtual Machines?',
  'What is the difference between Availability Zones and Region Pairs?',
  'How do CanNotDelete and ReadOnly Resource Locks work?',
  'Explain composite SLA calculations with an example',
  'What are the minimum retention periods for Azure Blob Storage tiers?',
];

type ResponseBlock =
  | { type: 'paragraph' | 'heading' | 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g).filter(Boolean);

  return tokens.map((token, index) => {
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      return <strong key={index} className="font-semibold text-white">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={index} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[0.9em] text-sky-200">{token.slice(1, -1)}</code>;
    }
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{token}</React.Fragment>;
  });
}

function BuddyResponse({ text }: { text: string }) {
  const blocks: ResponseBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    const content = paragraph.join(' ').trim();
    if (content) blocks.push({ type: 'paragraph', text: content });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: 'list', ...list });
    list = null;
  };

  for (const rawLine of text.replace(/```[\w-]*\s*/g, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || /^\s*[-*_]{3,}\s*$/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', text: heading[1].replace(/\s*#+$/, '') });
      continue;
    }

    const bullet = line.match(/^(?:[-*+]\s+|\u2022\s+)(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet || numbered)![1]);
      continue;
    }

    flushList();
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      blocks.push({ type: 'quote', text: quote[1] });
      continue;
    }

    // Treat plain-text section labels as headings too.
    if (line.endsWith(':') && line.length < 90) {
      flushParagraph();
      blocks.push({ type: 'heading', text: line.slice(0, -1) });
      continue;
    }

    paragraph.push(line);
  }
  flushParagraph();
  flushList();

  return (
    <div className="space-y-3 text-[14px] leading-7 text-slate-200 sm:text-[15px]">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <h3 key={index} className="pt-1 text-sm font-bold tracking-wide text-sky-200">{renderInlineFormatting(block.text)}</h3>;
        }
        if (block.type === 'list') {
          const List = block.ordered ? 'ol' : 'ul';
          return (
            <List key={index} className={`${block.ordered ? 'list-decimal' : 'list-disc'} space-y-1.5 pl-5 marker:text-sky-400`}>
              {block.items.map((item, itemIndex) => <li key={itemIndex} className="pl-1">{renderInlineFormatting(item)}</li>)}
            </List>
          );
        }
        if (block.type === 'quote') {
          return <blockquote key={index} className="border-l-2 border-sky-400/60 pl-3 text-slate-300">{renderInlineFormatting(block.text)}</blockquote>;
        }
        return <p key={index}>{renderInlineFormatting(block.text)}</p>;
      })}
    </div>
  );
}
export default function StudyBuddyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'buddy',
      text: 'Hello! I am your CloudPrep AI Study Buddy powered by Google Gemini and Supabase. Ask me anything about the AZ-900 Microsoft Azure Fundamentals exam syllabus, search across any Azure topic, or pick one of the high-yield drills below!',
      timestamp: 'Just now',
      examTip: 'Tip: 700 / 1000 scaled score needed to pass. Architecture & Services is 35–40% of the exam.',
      relatedTopics: ['Cloud Computing Models', 'Availability Zones', 'Resource Locks', 'Blob Storage Tiers'],
      source: 'gemini',
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const history = messages
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      const res = await fetch('/api/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          topic: selectedTopic || undefined,
          history,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const buddyMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'buddy',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          examTip: data.examTip,
          msLearnQuery: data.msLearnQuery,
          relatedTopics: data.relatedTopics,
          source: data.source,
        };
        setMessages((prev) => [...prev, buddyMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'buddy',
          text: `I encountered a problem retrieving the answer: ${data.message || 'Please try again.'}`,
          timestamp: 'Just now',
          examTip: 'Check your API configuration or network connection.',
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'buddy',
        text: `Unable to connect to the AI tutor service. Please check your connection.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-4rem)] lg:h-screen animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-1">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Cloud Tutor • Gemini & Supabase Connected</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>AZ-900 AI Study Buddy</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
              Live Topic Search
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Ready</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Gemini 3.5 AI</span>
          </div>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-slate-900/80">
        <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          Focus Topic:
        </span>
        {PRESET_TOPICS.map((t, i) => {
          const isSelected = selectedTopic === t.topic;
          return (
            <button
              key={i}
              onClick={() => setSelectedTopic(t.topic)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Preset Prompts Pills */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Quick Ask:
        </span>
        {PRESET_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-colors disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl sm:max-w-3xl p-4 sm:p-5 rounded-2xl text-sm leading-relaxed space-y-3.5 ${
                  isUser
                    ? 'bg-sky-500/20 text-slate-100 border border-sky-500/30 rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Source Badge if Buddy */}
                {!isUser && m.source && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800/60">
                    <span className="inline-flex items-center gap-1 text-purple-400 font-medium">
                      <Sparkles className="w-3 h-3" />
                      {m.source === 'gemini' ? 'Google Gemini 3.5 AI' : 'AZ-900 Knowledge Engine'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                )}

                <div className="max-w-none">
                  {isUser ? <p className="whitespace-pre-wrap leading-6">{m.text}</p> : <BuddyResponse text={m.text} />}
                </div>

                {m.examTip && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>AZ-900 Exam Drill:</strong> {m.examTip}
                    </span>
                  </div>
                )}

                {/* MS Learn & Related Topics */}
                {m.msLearnQuery && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/60 text-xs">
                    <a
                      href={`https://learn.microsoft.com/en-us/search/?terms=${encodeURIComponent(m.msLearnQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900 text-sky-300 border border-sky-800/40 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Learn Docs: &quot;{m.msLearnQuery}&quot;</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                )}

                {m.relatedTopics && m.relatedTopics.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Explore next:</span>
                    {m.relatedTopics.map((rel, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(`Tell me more about ${rel}`)}
                        className="px-2.5 py-0.5 rounded-md bg-slate-800/70 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1"
                      >
                        <span>{rel}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            </div>
            <span>CloudPrep AI is searching the AZ-900 knowledge base and synthesizing your answer...</span>
          </div>
        )}
      </div>

      {/* Input Form at Bottom */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedTopic
              ? `Ask anything about "${selectedTopic}"...`
              : 'Search or ask any AZ-900 topic (e.g. ExpressRoute vs VPN Gateway, Blob tiers, CanNotDelete locks)...'
          }
          disabled={isTyping}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-sky-500/20"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
