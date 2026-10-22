import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/navigation/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CloudPrep AI | AZ-900 Study Suite',
  description:
    'Modern AI-powered Personal Study Planner, Practice Quizzes, and Flashcards for the Microsoft Azure Fundamentals (AZ-900) certification exam.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased azure-mesh-bg text-slate-100 min-h-screen selection:bg-sky-500/30 selection:text-sky-200`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
