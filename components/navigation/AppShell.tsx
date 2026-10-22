'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNavbar } from './MobileNavbar';
import { MobileDrawer } from './MobileDrawer';
import { SettingsModal } from './SettingsModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* 1. Desktop Fixed Sidebar */}
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* 2. Mobile Compact Top Navbar */}
      <MobileNavbar
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 3. Mobile Collapsible Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 5. Main Workspace Container with left padding for desktop sidebar */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};
