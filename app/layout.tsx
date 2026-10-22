import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AZ-900 Vibe Planner | AI Microsoft Azure Study Roadmap',
  description: 'AI-powered Personal Study Planner for the Microsoft Azure Fundamentals (AZ-900) certification exam with adaptive re-balancing and active recall.',
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
        {children}
      </body>
    </html>
  );
}
