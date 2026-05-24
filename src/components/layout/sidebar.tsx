'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/products', label: 'Produk', icon: '▣' },
  { href: '/generate', label: 'Buat Video', icon: '▶' },
  { href: '/templates', label: 'Template', icon: '◰' },
  { href: '/history', label: 'Riwayat', icon: '☰' },
  { href: '/settings', label: 'Pengaturan', icon: '⚙' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const nav = (
    <>
      <div className="px-3 mb-8 flex items-center justify-between">
        <Link href="/" className="block" onClick={onClose}>
          <h1 className="text-lg font-bold gradient-text">Poster AI</h1>
          <p className="text-xs text-white/30 mt-0.5 font-light tracking-wide">Video Generator</p>
        </Link>
        <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white/80 p-1">
          ✕
        </button>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-white font-medium shadow-lg shadow-primary/5'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`text-base transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pt-4 border-t border-white/[0.06] mt-auto">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
            P
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/60 font-medium truncate">Poster AI</p>
            <p className="text-[10px] text-white/20">MVP v1.0</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 min-h-screen glass flex-col py-6 px-3 border-r border-white/[0.04] z-10">
        {nav}
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="relative w-64 h-full glass flex flex-col py-6 px-3 z-10">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
