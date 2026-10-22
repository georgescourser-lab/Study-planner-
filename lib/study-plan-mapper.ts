import { DayPlan, DomainType, TaskStatus } from '@/types/study-plan';

export const DOMAIN_WEIGHT_LABELS: Record<DomainType, string> = {
  'cloud-concepts': '25–30%',
  'architecture-services': '35–40%',
  'management-governance': '30–35%',
  'final-review': 'Exams & SLA',
};

export const DOMAIN_DISPLAY_NAMES: Record<DomainType, string> = {
  'cloud-concepts': 'Cloud Concepts',
  'architecture-services': 'Azure Architecture & Services',
  'management-governance': 'Azure Management & Governance',
  'final-review': 'Final Review & Readiness',
};

/**
 * Normalizes any freeform domain title into a standardized DomainType key.
 */
export function normalizeDomainKey(rawDomain: string): DomainType {
  const lower = (rawDomain || '').toLowerCase();
  if (lower.includes('review') || lower.includes('exam') || lower.includes('practice')) {
    return 'final-review';
  }
  if (lower.includes('arch') || lower.includes('service') || lower.includes('compute') || lower.includes('network')) {
    return 'architecture-services';
  }
  if (lower.includes('gov') || lower.includes('manage') || lower.includes('cost') || lower.includes('policy')) {
    return 'management-governance';
  }
  return 'cloud-concepts';
}

/**
 * Maps a Supabase study_tasks row into the DayPlan format expected by the UI.
 */
export function supabaseTaskToDayPlan(row: any): DayPlan {
  const domainKey = (row.domain_key as DomainType) || normalizeDomainKey(row.domain);
  const status: TaskStatus = (row.status as TaskStatus) || 'pending';

  const steps = Array.isArray(row.sandbox_steps) && row.sandbox_steps.length > 0
    ? row.sandbox_steps
    : [
        'Open the Azure Portal (portal.azure.com) or Azure Cloud Shell sandbox.',
        row.sandbox_task || 'Perform step-by-step verification in the Azure resource manager.',
        'Review the created resource blade, settings, tags, and metrics.',
      ];

  return {
    id: row.id,
    dayNumber: Number(row.day_number),
    scheduledDate: row.scheduled_date,
    domain: domainKey,
    domainWeight: DOMAIN_WEIGHT_LABELS[domainKey] || '25–30%',
    topicTitle: row.topic_title,
    topicSubtitle: row.topic_subtitle || row.action_item || 'Core AZ-900 conceptual and hands-on milestone',
    estimatedMinutes: Number(row.estimated_minutes) || 30,
    status: status,
    rebalancedFromDay: row.rebalanced_from_day || undefined,
    userAnswer: row.user_answer || undefined,
    isAnswerRevealed: Boolean(row.is_answer_revealed),
    completedAt: row.completed_at || undefined,
    learningBlock: {
      title: row.topic_title,
      durationMins: Number(row.estimated_minutes) || 30,
      objective: row.action_item || 'Master this AZ-900 milestone with active learning.',
      msLearnSearchTerm: row.ms_learn_search_term || `AZ-900 ${row.topic_title}`,
      sandboxExercise: {
        title: `${row.topic_title} - Hands-On Sandbox`,
        description: row.sandbox_task || 'Hands-on exploration in Azure Portal or conceptual comparison.',
        steps: steps,
      },
      activeRecall: {
        question: row.checkpoint_question || 'What is the primary benefit of this Azure service?',
        explanation: row.checkpoint_answer || 'Key explanation for AZ-900 exam readiness.',
        keyTakeaway: row.key_takeaway || 'High-probability question topic for AZ-900 exam day.',
      },
    },
  };
}

/**
 * Maps a generated DayPlan into a database row format for Supabase insertion.
 */
export function dayPlanToSupabaseRow(planId: string, day: DayPlan) {
  return {
    id: day.id.includes('-') && day.id.length >= 32 ? day.id : undefined, // let Postgres generate uuid if client-generated id isn't uuid
    plan_id: planId,
    day_number: day.dayNumber,
    scheduled_date: day.scheduledDate.split(' ')[0], // clean date string
    domain: DOMAIN_DISPLAY_NAMES[day.domain] || day.domain,
    domain_key: day.domain,
    topic_title: day.topicTitle,
    topic_subtitle: day.topicSubtitle,
    action_item: day.learningBlock.objective,
    sandbox_task: day.learningBlock.sandboxExercise.description,
    sandbox_steps: day.learningBlock.sandboxExercise.steps,
    ms_learn_search_term: day.learningBlock.msLearnSearchTerm,
    checkpoint_question: day.learningBlock.activeRecall.question,
    checkpoint_answer: day.learningBlock.activeRecall.explanation,
    key_takeaway: day.learningBlock.activeRecall.keyTakeaway,
    estimated_minutes: day.estimatedMinutes,
    status: day.status,
    user_answer: day.userAnswer || null,
    is_answer_revealed: Boolean(day.isAnswerRevealed),
    completed_at: day.completedAt || null,
    rebalanced_from_day: day.rebalancedFromDay || null,
  };
}
