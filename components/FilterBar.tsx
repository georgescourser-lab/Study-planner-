'use client';

import React from 'react';

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
  const tabs: { id: FilterOption; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'completed', label: 'Done', count: counts.completed },
    { id: 'cloud-concepts', label: 'Concepts', count: counts.cloudConcepts },
    { id: 'architecture-services', label: 'Architecture', count: counts.architectureServices },
    { id: 'management-governance', label: 'Governance', count: counts.managementGovernance },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectFilter(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] ${
                isActive ? 'text-sky-400 font-semibold' : 'text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
