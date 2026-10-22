import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { generateStudyPlanWithAI, ConfidenceScores } from '@/lib/ai-generator';
import { supabaseTaskToDayPlan, normalizeDomainKey, DOMAIN_WEIGHT_LABELS } from '@/lib/study-plan-mapper';
import { DayPlan } from '@/types/study-plan';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      examDate,
      dailyMinutes = 30,
      confidenceScores = { cloud_concepts: 3, architecture_services: 2, management_governance: 3 },
      weekendMultiplier = true,
    } = body;

    if (!examDate) {
      return NextResponse.json(
        { error: 'examDate is required (YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    // 1. Calculate Days Remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const rawDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.min(Math.max(rawDays, 3), 30);

    // Normalize confidence scores
    const normalizedConfidence: ConfidenceScores = {
      cloud_concepts: Number(confidenceScores.cloud_concepts || confidenceScores.cloudConcepts || 3),
      architecture_services: Number(confidenceScores.architecture_services || confidenceScores.architectureServices || 2),
      management_governance: Number(confidenceScores.management_governance || confidenceScores.managementGovernance || 3),
    };

    // 2. Generate Plan with AI Engine (Gemini -> OpenAI -> Expert Fallback)
    const aiResult = await generateStudyPlanWithAI({
      daysRemaining,
      dailyMinutes: Number(dailyMinutes) || 30,
      confidenceScores: normalizedConfidence,
      weekendMultiplier: Boolean(weekendMultiplier),
    });

    const generatedTasks = aiResult.tasks;

    // 3. Format Day Plans for Frontend & Database
    const planId = crypto.randomUUID();
    const formattedDayPlans: DayPlan[] = generatedTasks.map((t, idx) => {
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + idx);
      const isoDate = taskDate.toISOString().split('T')[0];

      let minutes = Number(dailyMinutes) || 30;
      const dayOfWeek = taskDate.getDay();
      if (weekendMultiplier && (dayOfWeek === 0 || dayOfWeek === 6)) {
        minutes = Math.round(minutes * 1.5);
      }

      const domainKey = normalizeDomainKey(t.domain);
      const isFirstDay = idx === 0;

      return {
        id: crypto.randomUUID(),
        dayNumber: t.day_number || idx + 1,
        scheduledDate: isoDate,
        domain: domainKey,
        domainWeight: DOMAIN_WEIGHT_LABELS[domainKey] || '25–30%',
        topicTitle: t.topic_title,
        topicSubtitle: t.topic_subtitle || t.action_item || 'Core AZ-900 conceptual & practical milestone',
        estimatedMinutes: minutes,
        status: isFirstDay ? 'up-next' : 'pending',
        learningBlock: {
          title: t.topic_title,
          durationMins: minutes,
          objective: t.action_item || 'Master this AZ-900 objective through micro-learning.',
          msLearnSearchTerm: t.ms_learn_search_term || `AZ-900 ${t.topic_title}`,
          sandboxExercise: {
            title: `${t.topic_title} - Hands-On Sandbox`,
            description: t.sandbox_task || 'Hands-on portal task or conceptual architecture analysis.',
            steps: t.sandbox_steps || [
              'Open the Azure Portal (portal.azure.com) or Azure Sandbox.',
              t.sandbox_task || 'Verify the service configuration and deployment blade.',
              'Review monitoring, security, and access controls for this resource.',
            ],
          },
          activeRecall: {
            question: t.checkpoint_question || 'What is the primary role of this Azure service?',
            explanation: t.checkpoint_answer || 'Key insight for passing the AZ-900 exam.',
            keyTakeaway: t.key_takeaway || 'High-probability question topic for AZ-900.',
          },
        },
      };
    });

    // 4. Optionally Store in Supabase if configured
    let savedPlanRecord = null;
    let savedTasksCount = 0;
    const supabase = getSupabaseAdmin();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: planRecord, error: planError } = await supabase
          .from('study_plans')
          .insert({
            id: planId,
            exam_date: examDate,
            daily_minutes: dailyMinutes,
            weekend_multiplier: weekendMultiplier,
            confidence_scores: normalizedConfidence,
          })
          .select()
          .single();

        if (planError) {
          console.warn('Supabase plan insertion warning:', planError);
        } else {
          savedPlanRecord = planRecord;

          // Prepare database rows
          const rowsToInsert = formattedDayPlans.map((dp) => ({
            id: dp.id,
            plan_id: planId,
            day_number: dp.dayNumber,
            scheduled_date: dp.scheduledDate,
            domain: t_to_domain_name(dp.domain),
            domain_key: dp.domain,
            topic_title: dp.topicTitle,
            topic_subtitle: dp.topicSubtitle,
            action_item: dp.learningBlock.objective,
            sandbox_task: dp.learningBlock.sandboxExercise.description,
            sandbox_steps: dp.learningBlock.sandboxExercise.steps,
            ms_learn_search_term: dp.learningBlock.msLearnSearchTerm,
            checkpoint_question: dp.learningBlock.activeRecall.question,
            checkpoint_answer: dp.learningBlock.activeRecall.explanation,
            key_takeaway: dp.learningBlock.activeRecall.keyTakeaway,
            estimated_minutes: dp.estimatedMinutes,
            status: dp.status,
          }));

          const { data: insertedTasks, error: tasksError } = await supabase
            .from('study_tasks')
            .insert(rowsToInsert)
            .select();

          if (tasksError) {
            console.warn('Supabase tasks insertion warning:', tasksError);
          } else if (insertedTasks) {
            savedTasksCount = insertedTasks.length;
          }
        }
      } catch (dbErr) {
        console.warn('Database persistence skipped or failed gracefully:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      planId: savedPlanRecord?.id || planId,
      daysRemaining,
      source: aiResult.source,
      persistedInSupabase: Boolean(savedPlanRecord),
      days: formattedDayPlans,
      summary: `Successfully generated adaptive ${daysRemaining}-day AZ-900 roadmap using ${aiResult.source}.`,
    });
  } catch (error: any) {
    console.error('Error generating AZ-900 study plan:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate study plan.' },
      { status: 500 }
    );
  }
}

function t_to_domain_name(key: string): string {
  switch (key) {
    case 'cloud-concepts':
      return 'Cloud Concepts';
    case 'architecture-services':
      return 'Azure Architecture & Services';
    case 'management-governance':
      return 'Management & Governance';
    case 'final-review':
      return 'Final Review';
    default:
      return 'Cloud Concepts';
  }
}
