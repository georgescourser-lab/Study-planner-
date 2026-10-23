import { NextResponse } from 'next/server';
import { testSupabaseConnectivity } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5);

  const supabaseTest = await testSupabaseConnectivity();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEngine: {
      geminiConfigured: hasGeminiKey,
      openAIConfigured: hasOpenAIKey,
      candidateModels: ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.5-flash'],
      activeProvider: hasGeminiKey ? 'gemini' : hasOpenAIKey ? 'openai' : 'expert-curriculum-engine (built-in)',
    },
    database: {
      supabaseConfigured: supabaseTest.configured,
      supabaseConnected: supabaseTest.connected,
      allTablesPresent: supabaseTest.allTablesPresent ?? false,
      missingTables: supabaseTest.missingTables ?? [],
      url: supabaseTest.url,
      tables: supabaseTest.tables,
      statusMessage: supabaseTest.message,
    },
    features: {
      aiStudyBuddy: true,
      aiQuizGenerator: true,
      quizDatabaseSave: supabaseTest.connected,
      aiFlashcardGenerator: true,
    },
  });
}
