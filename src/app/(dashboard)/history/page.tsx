'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type HistoryVideo = {
  id: string;
  variation: string;
  status: string;
  progress: number;
  duration_sec: number;
  output_url: string;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-success/10 text-success',
  processing: 'bg-accent/10 text-accent',
  queued: 'bg-warning/10 text-warning',
  failed: 'bg-danger/10 text-danger',
};

export default function HistoryPage() {
  const [videos, setVideos] = useState<HistoryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('videos')
        .select('id, variation, status, progress, duration_sec, output_url, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setVideos(data as any);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Riwayat</h1>
        <p className="text-white/40 mt-1">Video yang sudah di-render</p>
      </div>

      {!supabase ? (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
            <span className="text-3xl opacity-30">☰</span>
          </div>
          <p className="text-white/50">Set Supabase dulu</p>
          <p className="text-white/20 text-sm mt-1">Tambah SUPABASE_URL dan SUPABASE_ANON_KEY di .env.local</p>
        </div>
      ) : loading ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-white/40">Memuat...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
            <span className="text-3xl opacity-30">☰</span>
          </div>
          <p className="text-white/50">Belum ada riwayat</p>
          <Link href="/generate" className="mt-5 btn-primary px-5 py-2 rounded-xl text-sm">
            Buat Video Pertama
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Mobile card list */}
          <div className="block sm:hidden divide-y divide-white/[0.04]">
            {videos.map(v => (
              <div key={v.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-white/40">{v.id.slice(0, 8)}...</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[v.status] || 'bg-white/[0.05] text-white/40'}`}>
                    {v.status}{v.status === 'processing' && ` ${v.progress}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 capitalize">{v.variation?.replace(/_/g, ' ')}</span>
                  <span className="text-white/30">{v.duration_sec || '-'}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">{new Date(v.created_at).toLocaleDateString('id-ID')}</span>
                  {v.output_url ? (
                    <a href={v.output_url} target="_blank" className="text-accent text-xs hover:underline">Download</a>
                  ) : (
                    <span className="text-white/20 text-xs">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <table className="hidden sm:table w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/30 text-xs">
                <th className="text-left p-4 font-medium">Video</th>
                <th className="text-left p-4 font-medium">Variasi</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Durasi</th>
                <th className="text-left p-4 font-medium">Tanggal</th>
                <th className="text-right p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white/70 font-mono text-[11px]">{v.id.slice(0, 8)}...</td>
                  <td className="p-4 capitalize text-white/60">{v.variation?.replace(/_/g, ' ')}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[v.status] || 'bg-white/[0.05] text-white/40'}`}>
                      {v.status}
                      {v.status === 'processing' && ` ${v.progress}%`}
                    </span>
                  </td>
                  <td className="p-4 text-white/40">{v.duration_sec || '-'}s</td>
                  <td className="p-4 text-white/30 text-xs">{new Date(v.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 text-right">
                    {v.output_url ? (
                      <a href={v.output_url} target="_blank" className="text-accent text-xs hover:underline">
                        Download
                      </a>
                    ) : (
                      <span className="text-white/20 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
