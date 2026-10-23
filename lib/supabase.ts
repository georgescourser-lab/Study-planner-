import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

let cachedClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

/**
 * Checks whether Supabase URL and Keys are configured in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    (supabaseAnonKey || supabaseServiceKey)
  );
}

/**
 * Returns a Supabase client for standard requests.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return cachedClient;
}

/**
 * Returns a Supabase admin client using the service role key for backend API operations.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return cachedAdminClient;
}

/**
 * Diagnostic test that verifies Supabase connectivity and reports table status.
 */
export async function testSupabaseConnectivity(): Promise<{
  configured: boolean;
  connected: boolean;
  allTablesPresent?: boolean;
  missingTables?: string[];
  url: string;
  tables: Record<string, boolean>;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      url: supabaseUrl || 'Missing',
      tables: {},
      message: 'Supabase credentials not configured in environment variables.',
    };
  }

  const client = getSupabaseAdmin() || getSupabaseClient();
  if (!client) {
    return {
      configured: true,
      connected: false,
      url: supabaseUrl,
      tables: {},
      message: 'Failed to initialize Supabase client.',
    };
  }

  const tableNames = ['study_plans', 'study_tasks', 'saved_quizzes', 'saved_flashcards'];
  const tableStatus: Record<string, boolean> = {};
  let anyConnected = false;

  for (const t of tableNames) {
    try {
      const { error } = await client.from(t).select('id').limit(1);
      tableStatus[t] = !error;
      if (!error) anyConnected = true;
    } catch {
      tableStatus[t] = false;
    }
  }

  const missingTables = tableNames.filter((t) => !tableStatus[t]);
  const allConnected = missingTables.length === 0;

  return {
    configured: true,
    connected: anyConnected,
    allTablesPresent: allConnected,
    missingTables,
    url: supabaseUrl,
    tables: tableStatus,
    message: allConnected
      ? 'Successfully connected to Supabase database with all tables active.'
      : anyConnected
      ? `Connected to Supabase. Tables [${missingTables.join(', ')}] have not been created yet in Supabase SQL editor.`
      : 'Configured, but tables are unreachable or need to be created.',
  };
}

/**
 * Saves a quiz into the Supabase database.
 */
export async function saveQuizToSupabase(quiz: {
  title: string;
  domain: string;
  topic?: string;
  questions: any[];
  user_answers?: (number | null)[];
  score?: number;
  total_questions: number;
}) {
  const client = getSupabaseAdmin() || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await client
    .from('saved_quizzes')
    .insert([
      {
        title: quiz.title,
        domain: quiz.domain,
        topic: quiz.topic || null,
        questions: quiz.questions,
        user_answers: quiz.user_answers || [],
        score: quiz.score ?? 0,
        total_questions: quiz.total_questions,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Retrieves all saved quizzes from Supabase, ordered by newest first.
 */
export async function getSavedQuizzesFromSupabase() {
  const client = getSupabaseAdmin() || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await client
    .from('saved_quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
}

/**
 * Deletes a saved quiz by ID.
 */
export async function deleteSavedQuizFromSupabase(id: string) {
  const client = getSupabaseAdmin() || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available');
  }

  const { error } = await client.from('saved_quizzes').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return true;
}

/**
 * Saves a flashcard deck to Supabase.
 */
export async function saveFlashcardsToSupabase(deck: {
  title: string;
  domain: string;
  topic?: string;
  cards: any[];
  mastered_ids?: string[];
}) {
  const client = getSupabaseAdmin() || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await client
    .from('saved_flashcards')
    .insert([
      {
        title: deck.title,
        domain: deck.domain,
        topic: deck.topic || null,
        cards: deck.cards,
        mastered_ids: deck.mastered_ids || [],
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Retrieves all saved flashcard decks from Supabase.
 */
export async function getSavedFlashcardsFromSupabase() {
  const client = getSupabaseAdmin() || getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await client
    .from('saved_flashcards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
}

