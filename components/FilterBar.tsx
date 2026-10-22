'use client';

import React from 'react';
import { DomainType, TaskStatus } from '@/types/study-plan';
import { Filter, Layers, CheckCircle2, Clock, Cloud, Server, ShieldCheck } from 'lucide-react';

export type FilterOption = 
  | 'all' 
  | 'pending' 
  | 'completed' 
  | 'cloud-concepts' 
  | 'architecture-services' 
  | 'management-governance';

interface FilterBarProps {
  currentFilter: FilterOption;
  onSelectFilter: (filter: FilterOption) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    cloudConcepts: number;
    architectureServices: number;
    managementGovernance: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onSelectFilter,
  counts,
}) => {
  const tabs: { id: FilterOption; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'All Days',
      count: counts.all,
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'pending',
      label: 'Pending',
      count: counts.pending,
      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: 'cloud-concepts',
      label: 'Cloud Concepts',
      count: counts.cloudConcepts,
      icon: <Cloud className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      id: 'architecture-services',
      label: 'Architecture & Services',
      count: counts.architectureServices,
      icon: <Server className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'management-governance',
      label: 'Management & Governance',
      count: counts.managementGovernance,
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  return (
    <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
