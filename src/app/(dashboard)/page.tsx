'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  videosToday: number;
  totalVideos: number;
  totalProducts: number;
  totalTemplates: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTarget, setDailyTarget] = useState(2);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.dailyTarget) setDailyTarget(parsed.dailyTarget);
      }
    } catch { /* ignore */ }

    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { key: 'videosToday', label: 'Video Hari Ini', suffix: `/ ${dailyTarget} target`, gradient: 'from-primary to-accent', icon: '>' },
    { key: 'totalVideos', label: 'Total Video', suffix: 'seumur hidup', gradient: 'from-accent to-success', icon: 'D' },
    { key: 'totalProducts', label: 'Produk', suffix: 'terdaftar', gradient: 'from-warning to-danger', icon: '#' },
    { key: 'totalTemplates', label: 'Template', suffix: 'siap pakai', gradient: 'from-primary to-warning', icon: '?' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-white/40 mt-1">Ringkasan aktivitas video generator kamu</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        {STAT_CARDS.map((card) => {
          const value = stats ? String((stats as any)[card.key] ?? 0) : loading ? '...' : '0';
          return (
            <div key={card.key} className="glass-card rounded-2xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <p className="text-white/40 text-xs font-medium tracking-wide uppercase">{card.label}</p>
                <span className="text-lg opacity-40 group-hover:opacity-70 transition-opacity">{card.icon}</span>
              </div>
              <p className="text-4xl font-bold tracking-tight">
                {value}
                <span className="text-sm font-normal text-white/20 ml-1">{card.suffix}</span>
              </p>
              <div className={`h-0.5 w-full rounded-full bg-gradient-to-r ${card.gradient} mt-4 opacity-40 group-hover:opacity-70 transition-opacity`} />
            </div>
          );
        })}
      </div>

      {/* Quick Action */}
      <div className="glass-card rounded-2xl p-7 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-0">
          <h2 className="text-lg font-semibold">Mulai Membuat Video</h2>
          <p className="text-white/40 text-sm mt-1 mb-5">Upload produk, pilih template, dan biarkan AI membuatkan video marketing.</p>
          <Link
            href="/products/upload"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <span>+</span> Upload Produk Baru
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Aktivitas Terakhir</h2>
          <Link href="/history" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Lihat semua {'>'}
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
            <span className="text-2xl opacity-30">-</span>
          </div>
          <p className="text-white/40 text-sm">Belum ada aktivitas</p>
          <p className="text-white/20 text-xs mt-1">Mulai dengan upload produk pertama!</p>
        </div>
      </div>
    </div>
  );
}
