import { NextResponse } from 'next/server';
import { generatePracticeQuizWithAI } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, domain, questionCount } = body;

    const result = await generatePracticeQuizWithAI({
      topic: topic || undefined,
      domain: domain || undefined,
      questionCount: typeof questionCount === 'number' ? questionCount : undefined,
    });

    return NextResponse.json({
      success: true,
      questions: result.questions,
      source: result.source,
      totalCount: result.questions.length,
      topic: topic || 'All Core Objectives',
      domain: domain || 'All Domains',
    });
  } catch (error: any) {
    console.error('Quiz Generation API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate quiz',
        message: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
