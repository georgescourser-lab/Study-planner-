'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Sidebar } from './Sidebar';
import { MobileNavbar } from './MobileNavbar';
import { MobileDrawer } from './MobileDrawer';
import { SettingsModal } from './SettingsModal';
import { Cloud } from 'lucide-react';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShellInner: React.FC<AppShellProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!user && !isLoading) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-800 selection:bg-sky-500/20 selection:text-sky-900 dark:bg-[#0b0f19] dark:text-slate-100 dark:selection:bg-sky-500/30 dark:selection:text-sky-200 relative">
      {isLoading && (
        <div className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300" role="status" aria-live="polite">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          Checking your session...
        </div>
      )}

      {/* 3. Main Workspace Layout */}
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Mobile Top Navbar */}
      <MobileNavbar
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Mobile Collapsible Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Main Workspace with left padding for desktop sidebar */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShellInner>{children}</AppShellInner>
      </AuthProvider>
    </ThemeProvider>
  );
};
