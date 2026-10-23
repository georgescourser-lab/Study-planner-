'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getBrowserSupabase, isBrowserSupabaseConfigured } from '@/lib/supabase-client';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; message?: string }>;
  signInAsDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_DEMO_USER_KEY = 'az900-vibe-demo-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isConfigured, setIsConfigured] = useState(false);

  // Initialize Auth state
  useEffect(() => {
    const configured = isBrowserSupabaseConfigured();
    setIsConfigured(configured);

    if (configured) {
      const supabase = getBrowserSupabase();
      if (supabase) {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (!error && session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatarUrl: session.user.user_metadata?.avatar_url,
              isDemo: false,
            });
          } else {
            // Check if there was a saved demo user
            checkSavedDemoUser();
          }
          setIsLoading(false);
        }).catch(() => {
          checkSavedDemoUser();
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
              isDemo: false,
            });
            // Clear demo user if real user logs in
            if (typeof window !== 'undefined') {
              localStorage.removeItem(LOCAL_STORAGE_DEMO_USER_KEY);
            }
          } else {
            // Not signed into Supabase, check demo
            checkSavedDemoUser();
          }
          setIsLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    } else {
      // Offline / Local mock mode
      checkSavedDemoUser();
      setIsLoading(false);
    }
  }, []);

  const checkSavedDemoUser = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_DEMO_USER_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }
  };

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      // Local simulated login if Supabase keys aren't added yet
      const demoUser: AuthUser = {
        id: 'local-user-' + Math.random().toString(36).substring(2, 9),
        email,
        fullName: email.split('@')[0],
        isDemo: true,
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_DEMO_USER_KEY, JSON.stringify(demoUser));
      }
      setIsAuthModalOpen(false);
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
          isDemo: false,
        });
        setIsAuthModalOpen(false);
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
    const supabase = getBrowserSupabase();
    if (!supabase) {
      const demoUser: AuthUser = {
        id: 'local-user-' + Math.random().toString(36).substring(2, 9),
        email,
        fullName: fullName || email.split('@')[0],
        isDemo: true,
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_DEMO_USER_KEY, JSON.stringify(demoUser));
      }
      setIsAuthModalOpen(false);
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
        // Immediate session created (auto-confirm enabled)
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          fullName: fullName || data.session.user.email?.split('@')[0],
          isDemo: false,
        });
        setIsAuthModalOpen(false);
        return { message: 'Welcome to AZ-900 Vibe Planner!' };
      } else if (data.user) {
        // Confirmation email sent
        return {
          message: 'Success! Please check your email to verify your new account, then sign in.',
        };
      }

      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      return { error: message };
    }
  };

  const signInAsDemo = async () => {
    const demoUser: AuthUser = {
      id: 'demo-azure-student-001',
      email: 'demo.student@azureprep.io',
      fullName: 'Alex Morgan (Azure Student)',
      isDemo: true,
    };
    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_DEMO_USER_KEY, JSON.stringify(demoUser));
    }
    setIsAuthModalOpen(false);
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
      localStorage.removeItem(LOCAL_STORAGE_DEMO_USER_KEY);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signInAsDemo,
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
