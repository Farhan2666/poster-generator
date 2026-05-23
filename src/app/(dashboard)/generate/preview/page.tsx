'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VariationTabs from '@/components/generate/variation-tabs';

interface VariationData {
  variation: string;
  hook: string;
  scenes: { time: string; visual_description: string; voice_text: string; subtitle_text: string; duration_seconds: number }[];
  cta: string;
}

export default function PreviewPage() {
  const router = useRouter();
  const [variations, setVariations] = useState<VariationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<{ video_id: string } | null>(null);
  const [renderStatus, setRenderStatus] = useState<{ status: string; progress: number } | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('generate_result');
      if (saved) {
        const parsed = JSON.parse(saved);
        setVariations(parsed.variations || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  // Poll render status
  useEffect(() => {
    if (!renderResult?.video_id) return;
    const id = renderResult.video_id;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/render/${id}/status`);
        const data = await res.json();
        setRenderStatus(data);
        if (data.status === 'done' || data.status === 'failed' || data.status === 'unknown') {
          clearInterval(poll);
        }
      } catch {
        clearInterval(poll);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [renderResult]);

  async function handleRender(variation: string) {
    setRendering(true);
    setRenderStatus(null);
    try {
      const saved = JSON.parse(sessionStorage.getItem('generate_result') || '{}');
      const res = await fetch('/api/generate/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: saved.productId,
          templateId: saved.templateId,
          variation,
          script: variations.find(v => v.variation === variation),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRenderResult(data);
    } catch (err: any) {
      alert('Render gagal: ' + err.message);
    } finally {
      setRendering(false);
    }
  }

  async function handleRegenerate() {
    try {
      const saved = JSON.parse(sessionStorage.getItem('generate_result') || '{}');
      const res = await fetch('/api/generate/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: saved.productId,
          templateId: saved.templateId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.variations) {
        setVariations(data.variations);
        sessionStorage.setItem('generate_result', JSON.stringify({
          ...saved,
          variations: data.variations,
        }));
      }
    } catch (err: any) {
      alert('Regenerate gagal: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 rounded-2xl border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
          <p className="text-white/40">Memuat preview...</p>
        </div>
      </div>
    );
  }

  if (renderResult) {
    const isDone = renderStatus?.status === 'done';
    const isFailed = renderStatus?.status === 'failed';
    const progress = renderStatus?.progress ?? 0;

    return (
      <div className="max-w-xl mx-auto space-y-8 pt-12">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            isDone ? 'bg-success/10' : isFailed ? 'bg-danger/10' : 'bg-accent/10'
          }`}>
            <span className={`text-2xl ${isDone ? 'text-success' : isFailed ? 'text-danger' : 'text-accent'}`}>
              {isDone ? 'OK' : isFailed ? 'X' : '...'}
            </span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">
            {isDone ? 'Render Berhasil!' : isFailed ? 'Render Gagal' : 'Memproses Render...'}
          </h1>
          <p className="text-white/40 mt-1">
            {isDone ? 'Video siap didownload' : isFailed ? 'Coba render ulang' : 'Video sedang di-render'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-5">
          {!isDone && !isFailed && (
            <div className="space-y-3">
              <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/30">{progress}%</p>
            </div>
          )}

          <div className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-xs text-white/30 mb-1">Video ID</p>
            <p className="text-sm font-mono text-white/50">{renderResult.video_id}</p>
          </div>

          {isDone && (
            <button
              onClick={() => router.push('/history')}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm"
            >
              Lihat Riwayat Render
            </button>
          )}

          {isFailed && (
            <button
              onClick={() => { setRenderResult(null); setRenderStatus(null); }}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!variations.length) {
    return (
      <div className="max-w-xl mx-auto space-y-8 pt-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text">Preview</h1>
          <p className="text-white/40 mt-1">Belum ada script yang di-generate</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center">
          <button
            onClick={() => router.push('/generate')}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm"
          >
            Kembali ke Generate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Preview Script</h1>
        <p className="text-white/40 mt-1">Pilih variasi konten yang paling cocok, lalu render</p>
      </div>

      <VariationTabs
        variations={variations}
        onRender={handleRender}
        onRegenerate={handleRegenerate}
      />

      {rendering && (
        <div className="glass-card rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm text-white/50">Mengirim ke antrian render...</p>
          </div>
        </div>
      )}
    </div>
  );
}
