'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getBrowserSupabase, isBrowserSupabaseConfigured } from '@/lib/supabase-client';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = 'az900-vibe-authenticated-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isConfigured, setIsConfigured] = useState(false);

  // Initialize Auth state
  useEffect(() => {
    const configured = isBrowserSupabaseConfigured();
    setIsConfigured(configured);

    if (configured) {
      const supabase = getBrowserSupabase();
      if (supabase) {
        // 1. Get initial Supabase session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (!error && session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatarUrl: session.user.user_metadata?.avatar_url,
            });
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }).catch(() => {
          setUser(null);
          setIsLoading(false);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatarUrl: session.user.user_metadata?.avatar_url,
            });
          } else {
            setUser(null);
          }
          setIsLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    } else {
      // Local session check if Supabase key is still pending
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!email || !password) {
      return { error: 'Please enter both email and password.' };
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      // Fallback local authenticated session
      const authedUser: AuthUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        fullName: email.split('@')[0],
      };
      setUser(authedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(authedUser));
      }
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        });
      }

      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      return { error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error?: string; message?: string }> => {
    if (!email || !password) {
      return { error: 'Please enter both email and password.' };
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      const authedUser: AuthUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        fullName: fullName || email.split('@')[0],
      };
      setUser(authedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(authedUser));
      }
      return { message: 'Account created successfully!' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          fullName: fullName || data.session.user.email?.split('@')[0],
        });
        return { message: 'Account created successfully!' };
      } else if (data.user) {
        return {
          message: 'Account created! Please check your email to verify your address, then sign in.',
        };
      }

      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      return { error: message };
    }
  };

  const signOut = async () => {
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore network errors on signout
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
    setUser(null);
    setAuthMode('signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        authMode,
        setAuthMode,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
