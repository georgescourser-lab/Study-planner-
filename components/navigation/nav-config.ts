import {
  LayoutDashboard,
  CalendarDays,
  HelpCircle,
  Layers,
  Bot,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

export interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
  description: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Exam countdown, readiness overview, and daily focus',
  },
  {
    label: 'Study Planner',
    href: '/planner',
    icon: CalendarDays,
    badge: 'Adaptive',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    description: 'Personalized day-by-day roadmap with Life Happens re-balancer',
  },
  {
    label: 'Practice Quizzes',
    href: '/quizzes',
    icon: HelpCircle,
    badge: 'AZ-900',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Domain-specific question drills with instant explanations',
  },
  {
    label: 'Flashcards',
    href: '/flashcards',
    icon: Layers,
    description: 'Active recall flip cards for high-yield cloud definitions',
  },
  {
    label: 'AI Study Buddy',
    href: '/study-buddy',
    icon: Bot,
    badge: 'AI',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Ask Azure concept questions with clear analogies',
  },
  {
    label: 'Progress & Readiness',
    href: '/readiness',
    icon: BarChart3,
    description: 'Domain mastery analytics and exam day readiness predictor',
  },
];
