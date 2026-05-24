'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import AnimatedBackground from '@/components/layout/animated-background';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative">
      <AnimatedBackground />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto relative z-0">
        <div className="sticky top-0 z-20 lg:hidden flex items-center gap-2 p-3 glass border-b border-white/[0.04]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white/80 p-1"
            aria-label="Buka menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span className="text-sm font-semibold gradient-text">Poster AI</span>
        </div>
        <div className="p-4 sm:p-6">
          <div className="page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
