'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton browser-side Supabase client with auth persistence enabled.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project');
  const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your-anon-key');

  if (!isValidUrl || !isValidKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'az900-vibe-auth-token',
      },
    });
  }

  return browserClient;
}

export function isBrowserSupabaseConfigured(): boolean {
  const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project');
  const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your-anon-key');
  return Boolean(isValidUrl && isValidKey);
}
