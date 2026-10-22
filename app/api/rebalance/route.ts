import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { DayPlan } from '@/types/study-plan';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, days: clientDays, missedDayNumber } = body;

    let daysToRebalance: DayPlan[] = clientDays || [];

    const supabase = getSupabaseAdmin();

    // 1. If days not passed directly in payload, fetch from Supabase by planId
    if ((!daysToRebalance || daysToRebalance.length === 0) && planId && supabase && isSupabaseConfigured()) {
      const { data: dbTasks, error } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('plan_id', planId)
        .order('day_number', { ascending: true });

      if (error) {
        throw error;
      }

      if (dbTasks && dbTasks.length > 0) {
        const { supabaseTaskToDayPlan } = await import('@/lib/study-plan-mapper');
        daysToRebalance = dbTasks.map(supabaseTaskToDayPlan);
      }
    }

    if (!daysToRebalance || daysToRebalance.length === 0) {
      return NextResponse.json(
        { error: 'No days provided or found to rebalance.' },
        { status: 400 }
      );
    }

    // 2. Identify the missed or first pending day
    let targetIndex = -1;
    if (typeof missedDayNumber === 'number') {
      targetIndex = daysToRebalance.findIndex((d) => d.dayNumber === missedDayNumber);
    } else {
      targetIndex = daysToRebalance.findIndex((d) => d.status !== 'completed');
    }

    if (targetIndex === -1) {
      return NextResponse.json({
        success: true,
        days: daysToRebalance,
        message: 'All daily milestones are already completed! No rebalancing needed.',
      });
    }

    // 3. Life Happens Rebalancing Algorithm:
    // Redistribute the pending topic across remaining days without overwhelming daily capacity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rebalancedDays: DayPlan[] = daysToRebalance.map((day, idx) => {
      // Completed days in the past remain untouched
      if (idx < targetIndex) {
        return day;
      }

      // The missed day itself is marked as rebalanced catch-up
      if (idx === targetIndex) {
        const missedTopic = day.topicTitle;
        return {
          ...day,
          status: 'rebalanced' as const,
          rebalancedFromDay: day.dayNumber,
          scheduledDate: `${day.scheduledDate.split(' ')[0]} (Catch-up)`,
          estimatedMinutes: Math.min(day.estimatedMinutes + 10, 60),
          topicSubtitle: `[Catch-up Session] ${day.topicSubtitle}`,
          learningBlock: {
            ...day.learningBlock,
            durationMins: Math.min(day.learningBlock.durationMins + 10, 60),
            objective: `Streamlined catch-up drill: ${day.learningBlock.objective}`,
          },
        };
      }

      // Remaining future days absorb a mild +5 min buffer to reinforce mastery
      return {
        ...day,
        estimatedMinutes: Math.min(day.estimatedMinutes + 5, 55),
        learningBlock: {
          ...day.learningBlock,
          durationMins: Math.min(day.learningBlock.durationMins + 5, 55),
        },
      };
    });

    // 4. Update in Supabase if active
    if (planId && supabase && isSupabaseConfigured()) {
      try {
        const targetDay = rebalancedDays[targetIndex];
        await supabase
          .from('study_tasks')
          .update({
            status: 'rebalanced',
            rebalanced_from_day: targetDay.dayNumber,
            estimated_minutes: targetDay.estimatedMinutes,
          })
          .eq('plan_id', planId)
          .eq('day_number', targetDay.dayNumber);

        // Update subsequent tasks estimated minutes
        for (let i = targetIndex + 1; i < rebalancedDays.length; i++) {
          const d = rebalancedDays[i];
          await supabase
            .from('study_tasks')
            .update({
              estimated_minutes: d.estimatedMinutes,
            })
            .eq('plan_id', planId)
            .eq('day_number', d.dayNumber);
        }
      } catch (dbErr) {
        console.warn('Supabase rebalance update warning:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      planId,
      rebalancedDayNumber: daysToRebalance[targetIndex]?.dayNumber,
      days: rebalancedDays,
      message: '⚡ Life Happens: Schedule re-balanced! Missed session redistributed smoothly without moving your exam date.',
    });
  } catch (error: any) {
    console.error('Error rebalancing schedule:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to rebalance schedule.' },
      { status: 500 }
    );
  }
}
