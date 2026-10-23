import { NextResponse } from 'next/server';
import { askStudyBuddyTopic, searchAZ900Topics } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, topic, history } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    const response = await askStudyBuddyTopic({
      topic: topic || undefined,
      question: question.trim(),
      history: Array.isArray(history) ? history : undefined,
    });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error('Study Buddy API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate answer',
        message: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const results = searchAZ900Topics(q);
  return NextResponse.json({
    topics: results,
  });
}
