import { NextResponse } from 'next/server';
import { getSavedQuizzesFromSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        quizzes: [],
        supabaseConfigured: false,
      });
    }

    const quizzes = await getSavedQuizzesFromSupabase();
    return NextResponse.json({
      success: true,
      quizzes,
      supabaseConfigured: true,
    });
  } catch (error: any) {
    console.warn('Fetch saved quizzes error (possibly table not migrated yet):', error?.message);
    const isTableMissing =
      error?.message?.includes('relation "public.saved_quizzes" does not exist') ||
      error?.code === '42P01' ||
      error?.code === 'PGRST204' ||
      error?.code === 'PGRST205';

    return NextResponse.json({
      success: false,
      quizzes: [],
      error: error?.message,
      isTableMissing,
    });
  }
}
