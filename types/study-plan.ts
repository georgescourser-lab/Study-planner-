export type DomainType = 
  | 'cloud-concepts' 
  | 'architecture-services' 
  | 'management-governance' 
  | 'final-review';

export type TaskStatus = 'completed' | 'up-next' | 'pending' | 'rebalanced';

export interface MicroLearningBlock {
  title: string;
  durationMins: number;
  objective: string;
  msLearnSearchTerm: string;
  sandboxExercise: {
    title: string;
    description: string;
    steps: string[];
  };
  activeRecall: {
    question: string;
    explanation: string;
    keyTakeaway: string;
  };
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  scheduledDate: string; // ISO format or formatted string
  domain: DomainType;
  domainWeight: string; // e.g. "25-30%"
  topicTitle: string;
  topicSubtitle: string;
  estimatedMinutes: number;
  status: TaskStatus;
  rebalancedFromDay?: number;
  learningBlock: MicroLearningBlock;
  userAnswer?: string;
  isAnswerRevealed?: boolean;
  completedAt?: string;
}

export interface UserPreferences {
  examDate: string;
  dailyCapacityMins: number;
  weekendMultiplier: boolean;
  confidenceLevels: {
    cloudConcepts: number; // 1-5
    architectureServices: number; // 1-5
    managementGovernance: number; // 1-5
  };
  hasCompletedOnboarding: boolean;
}

export interface PlanState {
  preferences: UserPreferences;
  days: DayPlan[];
  lastRebalancedAt?: string;
}
