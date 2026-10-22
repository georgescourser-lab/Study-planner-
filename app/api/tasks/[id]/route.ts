import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await req.json();
    const { status, userAnswer, isAnswerRevealed, completedAt } = body;

    const supabase = getSupabaseAdmin();

    if (supabase && isSupabaseConfigured() && taskId) {
      const updatePayload: Record<string, any> = {};

      if (status !== undefined) updatePayload.status = status;
      if (userAnswer !== undefined) updatePayload.user_answer = userAnswer;
      if (isAnswerRevealed !== undefined) updatePayload.is_answer_revealed = isAnswerRevealed;
      if (completedAt !== undefined) updatePayload.completed_at = completedAt;

      const { data, error } = await supabase
        .from('study_tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.warn('Supabase task update notice:', error.message);
      } else {
        return NextResponse.json({ success: true, task: data });
      }
    }

    return NextResponse.json({
      success: true,
      taskId,
      updated: { status, userAnswer, isAnswerRevealed, completedAt },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update study task.' },
      { status: 500 }
    );
  }
}
