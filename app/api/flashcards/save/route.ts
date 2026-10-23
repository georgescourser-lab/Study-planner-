import { NextResponse } from 'next/server';
import {
  saveFlashcardsToSupabase,
  getSavedFlashcardsFromSupabase,
  isSupabaseConfigured,
} from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, domain, topic, cards, masteredIds } = body;

    if (!title || !cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'Valid title and cards array are required' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured', fallbackToLocalStorage: true },
        { status: 503 }
      );
    }

    const saved = await saveFlashcardsToSupabase({
      title,
      domain: domain || 'Azure Architecture & Services',
      topic: topic || undefined,
      cards,
      mastered_ids: masteredIds || [],
    });

    return NextResponse.json({
      success: true,
      deck: saved,
      message: 'Flashcard deck saved to Supabase database!',
    });
  } catch (error: any) {
    console.error('Save Flashcards error:', error);
    const isTableMissing =
      error?.message?.includes('relation "public.saved_flashcards" does not exist') ||
      error?.code === '42P01' ||
      error?.code === 'PGRST204' ||
      error?.code === 'PGRST205';

    return NextResponse.json(
      {
        error: 'Failed to save flashcards to database',
        message: error?.message,
        isTableMissing,
      },
      { status: isTableMissing ? 409 : 500 }
    );
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, decks: [] });
    }

    const decks = await getSavedFlashcardsFromSupabase();
    return NextResponse.json({ success: true, decks });
  } catch (error: any) {
    console.warn('Fetch saved flashcards error:', error?.message);
    return NextResponse.json({ success: false, decks: [], error: error?.message });
  }
}
