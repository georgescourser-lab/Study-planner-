import { NextResponse } from 'next/server';
import { saveQuizToSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, domain, topic, questions, userAnswers, score, totalQuestions } = body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Valid title and questions array are required' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: 'Supabase is not configured',
          fallbackToLocalStorage: true,
        },
        { status: 503 }
      );
    }

    const savedRecord = await saveQuizToSupabase({
      title,
      domain: domain || 'Azure Architecture & Services',
      topic: topic || undefined,
      questions,
      user_answers: userAnswers || [],
      score: typeof score === 'number' ? score : 0,
      total_questions: totalQuestions || questions.length,
    });

    return NextResponse.json({
      success: true,
      quiz: savedRecord,
      message: 'Quiz saved successfully to Supabase database!',
    });
  } catch (error: any) {
    console.error('Save Quiz error:', error);
    const isTableMissing =
      error?.message?.includes('relation "public.saved_quizzes" does not exist') ||
      error?.code === '42P01' ||
      error?.code === 'PGRST204' ||
      error?.code === 'PGRST205';

    return NextResponse.json(
      {
        error: 'Failed to save quiz to database',
        message: error?.message || 'Database error',
        isTableMissing,
        tableNotice: isTableMissing
          ? 'The "saved_quizzes" table has not been created yet in Supabase. Please run the migration in supabase/schema.sql.'
          : undefined,
      },
      { status: isTableMissing ? 409 : 500 }
    );
  }
}
