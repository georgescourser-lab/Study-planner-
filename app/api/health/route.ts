import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5);
  const supabaseReady = isSupabaseConfigured();

  let supabaseConnected = false;
  let supabaseMessage = 'Not configured (runs in resilient demo mode)';

  if (supabaseReady) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.from('study_plans').select('count', { count: 'exact', head: true });
        if (!error) {
          supabaseConnected = true;
          supabaseMessage = 'Connected and verified successfully';
        } else {
          supabaseMessage = `Configured, but connection check returned: ${error.message}`;
        }
      }
    } catch (e: any) {
      supabaseMessage = `Configured, error: ${e?.message}`;
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEngine: {
      geminiConfigured: hasGeminiKey,
      openAIConfigured: hasOpenAIKey,
      activeProvider: hasGeminiKey ? 'gemini' : hasOpenAIKey ? 'openai' : 'expert-curriculum-engine (built-in)',
    },
    database: {
      supabaseConfigured: supabaseReady,
      supabaseConnected,
      statusMessage: supabaseMessage,
    },
  });
}
