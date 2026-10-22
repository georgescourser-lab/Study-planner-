import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseTaskToDayPlan } from '@/lib/study-plan-mapper';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const supabase = getSupabaseAdmin();

    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured yet.' },
        { status: 503 }
      );
    }

    const { data: plan, error: planError } = await supabase
      .from('study_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Study plan not found.' },
        { status: 404 }
      );
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number', { ascending: true });

    if (tasksError) {
      return NextResponse.json(
        { error: tasksError.message },
        { status: 500 }
      );
    }

    const dayPlans = (tasks || []).map(supabaseTaskToDayPlan);

    return NextResponse.json({
      success: true,
      plan,
      days: dayPlans,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch plan.' },
      { status: 500 }
    );
  }
}
