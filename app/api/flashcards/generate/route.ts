import { NextResponse } from 'next/server';
import { generateFlashcardsWithAI } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, domain, cardCount } = body;

    const result = await generateFlashcardsWithAI({
      topic: topic || undefined,
      domain: domain || undefined,
      cardCount: typeof cardCount === 'number' ? cardCount : undefined,
    });

    return NextResponse.json({
      success: true,
      cards: result.cards,
      source: result.source,
      totalCount: result.cards.length,
      topic: topic || 'Azure Core Concepts',
      domain: domain || 'Azure Architecture & Services',
    });
  } catch (error: any) {
    console.error('Flashcard Generation API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate flashcards',
        message: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
