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
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  text: string;
  timestamp: string;
  examTip?: string;
}

const PRESET_PROMPTS = [
  'Explain the Shared Responsibility Model with a pizza analogy',
  'When should I choose Azure App Service over Virtual Machines?',
  'What is the difference between Availability Zones and Region Pairs?',
  'How do CanNotDelete and ReadOnly Resource Locks work?',
  'Explain composite SLA calculations with an example',
];

const PRESET_ANSWERS: Record<string, { answer: string; tip: string }> = {
  'pizza': {
    answer: `Here is the famous Pizza as a Service analogy for Azure cloud models:

• On-Premises (Traditional IT): Made at Home. You buy flour, cheese, toppings, own the oven, and wash the dining table.
• IaaS (Azure Virtual Machines): Take and Bake. The grocery store makes the dough and sauce, but you bake it in your oven and serve it. You manage OS patching, apps, and data.
• PaaS (Azure App Service): Pizza Delivered. The pizzeria prepares and bakes the pizza. You only provide the dining table and drinks. Microsoft manages physical servers and runtime; you manage code and data.
• SaaS (Microsoft 365): Dining Out at a Restaurant. You sit down, eat, and pay the bill. You don't manage any kitchen equipment.

In ALL models, you are ALWAYS responsible for the eaters (your Users/Identities) and the food consumed (your Data)!`,
    tip: 'On the AZ-900 exam, remember: Customer ALWAYS retains 100% responsibility for Data & Identities across all models.',
  },
  'app service': {
    answer: `Choose Azure App Service (PaaS) when you want to host web apps and APIs without the operational overhead of managing Windows or Linux operating systems, patching, or virtual network routing.

Choose Azure Virtual Machines (IaaS) when you require:
1. Custom OS configurations or legacy software requiring deep OS-level access.
2. Specific kernel drivers or software not supported in managed runtimes.
3. Full administrative control over the guest operating system.

Cost & Agility advantage: App Service provides automated autoscaling, SSL certificates, deployment slots, and 99.95%+ SLAs out-of-the-box.`,
    tip: 'If the question mentions "deploy web app with minimal administrative management", the answer is almost always Azure App Service.',
  },
  'availability zones': {
    answer: `Here is the crucial distinction:

1. Availability Zones:
• Physically separate datacenters within the SAME Azure region.
• Each zone has independent power, cooling, and network infrastructure.
• Designed to protect against local datacenter failures (e.g., generator failure, flooding in one building).

2. Region Pairs:
• Two Azure regions situated within the same geography located at least 300 miles apart (e.g., East US and West US).
• Designed to protect against regional disasters (e.g., hurricanes, major power grid blackouts).
• Microsoft coordinates planned updates sequentially so only one region of the pair is updated at any time.`,
    tip: 'Datacenter failure in same city = Availability Zones. Catastrophic weather disaster >300 miles = Region Pairs.',
  },
  'resource locks': {
    answer: `Azure Resource Locks prevent accidental deletion or unwanted modifications of critical cloud assets.

There are two lock tiers:
1. CanNotDelete: Authorized users can still read and modify (update) the resource, but CANNOT delete it.
2. ReadOnly: Authorized users can ONLY read the resource. They cannot delete OR modify settings.

Key Exam Rules:
• Locks override standard RBAC permissions (even a Subscription Owner cannot delete a locked resource until the lock is removed).
• Locks are inherited: A lock placed on a Resource Group automatically cascades to all child resources inside it!`,
    tip: 'CanNotDelete = Read + Write allowed, Delete blocked. ReadOnly = Read only, Write + Delete blocked.',
  },
  'composite sla': {
    answer: `When combining multiple Azure services in a workload architecture, the overall availability is calculated by multiplying each individual service's SLA.

Example:
• Azure App Service SLA = 99.95% (0.9995)
• Azure SQL Database SLA = 99.99% (0.9999)

Composite SLA = 99.95% × 99.99% = 99.94%

Key Takeaway: The composite availability percentage is ALWAYS lower than the individual service SLAs because adding interdependent components introduces additional points of potential failure.`,
    tip: 'On AZ-900, remember that composite SLA of multi-tier systems is calculated by multiplying SLAs, resulting in a lower overall percentage.',
  },
};

export default function StudyBuddyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'buddy',
      text: 'Hello! I am your CloudPrep AI Study Buddy. Ask me anything about the AZ-900 Microsoft Azure Fundamentals exam syllabus, or pick one of the high-frequency concept drills below!',
      timestamp: 'Just now',
      examTip: 'Tip: 700 / 1000 scaled score needed to pass. Architecture & Services is 35–40% of the exam.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const qLower = query.toLowerCase();
      let matched = PRESET_ANSWERS['app service'];

      if (qLower.includes('pizza') || qLower.includes('shared responsibility') || qLower.includes('iaas') || qLower.includes('paas')) {
        matched = PRESET_ANSWERS['pizza'];
      } else if (qLower.includes('zone') || qLower.includes('region') || qLower.includes('pair')) {
        matched = PRESET_ANSWERS['availability zones'];
      } else if (qLower.includes('lock') || qLower.includes('delete') || qLower.includes('readonly')) {
        matched = PRESET_ANSWERS['resource locks'];
      } else if (qLower.includes('sla') || qLower.includes('composite') || qLower.includes('uptime')) {
        matched = PRESET_ANSWERS['composite sla'];
      }

      const buddyMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'buddy',
        text: matched.answer,
        timestamp: 'Just now',
        examTip: matched.tip,
      };

      setMessages((prev) => [...prev, buddyMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)] lg:h-screen animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-1">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Cloud Tutor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            AI Study Buddy
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>AZ-900 Knowledge Base Online</span>
        </div>
      </div>

      {/* Preset Prompts Pills */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          Quick Ask:
        </span>
        {PRESET_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-colors"
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
                className={`max-w-2xl p-4 sm:p-5 rounded-2xl text-sm leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-sky-500/20 text-slate-100 border border-sky-500/30 rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {m.examTip && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Exam Drill:</strong> {m.examTip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>CloudPrep Buddy is crafting your explanation...</span>
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
          placeholder="Ask any Azure question (e.g. What is ExpressRoute vs VPN Gateway?)..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-sky-500/20"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
