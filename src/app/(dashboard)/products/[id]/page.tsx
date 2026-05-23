'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';

function ZoomModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div className="max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img src={src} alt="zoom" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const p = await productService.getById(id);
      setProduct(p);
    } catch {
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function handleProcessImages() {
    setProcessing(true);
    try {
      const res = await fetch(`/api/products/${id}/process-image`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
    } catch (err: any) {
      alert('Gagal proses gambar: ' + err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Hapus produk ini?')) return;
    try {
      await productService.delete(id);
      router.push('/products');
    } catch (err: any) {
      alert('Gagal hapus: ' + err.message);
    }
  }

  function downloadImage(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-2xl border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {zoomSrc && <ZoomModal src={zoomSrc} onClose={() => setZoomSrc(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/products')}
            className="text-xs text-white/30 hover:text-white/60 mb-2 transition-colors"
          >
            ← Kembali ke Library
          </button>
          <h1 className="text-3xl font-bold gradient-text">{product.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-white/40 capitalize bg-white/[0.04] px-2 py-0.5 rounded-full">
              {product.theme}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              product.status === 'ready' ? 'bg-success/10 text-success' :
              product.status === 'draft' ? 'bg-warning/10 text-warning' :
              'bg-white/[0.05] text-white/40'
            }`}>
              {product.status}
            </span>
            {product.image_status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                product.image_status === 'done' ? 'bg-success/10 text-success' :
                product.image_status === 'processing' ? 'bg-accent/10 text-accent animate-pulse' :
                product.image_status === 'failed' ? 'bg-danger/10 text-danger' :
                'bg-white/[0.05] text-white/40'
              }`}>
                {product.image_status === 'done' ? '✓ processed' : product.image_status}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleProcessImages}
            disabled={processing}
            className="px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm border border-accent/20 hover:bg-accent/20 transition-all disabled:opacity-40"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-accent/30 border-t-accent animate-spin" />
                Processing...
              </span>
            ) : 'Process Images'}
          </button>
          <button
            onClick={() => router.push(`/generate?product=${id}`)}
            className="btn-primary px-4 py-2 rounded-xl text-sm"
          >
            Buat Video
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 rounded-xl border border-danger/20 text-danger/60 text-sm hover:bg-danger/10 transition-all"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Original Images */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Foto Produk</h2>
          {product.images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {product.images.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-black/30 overflow-hidden border border-white/[0.04] group cursor-pointer relative"
                  onClick={() => setZoomSrc(url)}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white/0 group-hover:text-white/60 text-xs transition-colors">click zoom</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/[0.06] rounded-xl p-8 text-center">
              <p className="text-sm text-white/30">Tidak ada foto</p>
            </div>
          )}
        </div>

        {/* Processed Images */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">Hasil Processing</h2>

          {product.processed_images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {product.processed_images.map((url, i) => (
                <div key={i} className="group relative">
                  <div
                    className="aspect-square rounded-xl bg-black/30 overflow-hidden border border-white/[0.04] cursor-pointer"
                    onClick={() => setZoomSrc(url)}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => downloadImage(url, `${product.title}-processed-${i+1}.png`)}
                    className="absolute bottom-1.5 right-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white/70 hover:text-white text-[10px] px-2 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    ⤓
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/[0.06] rounded-xl p-6 text-center">
              <p className="text-sm text-white/30">Belum diproses</p>
              <p className="text-xs text-white/20 mt-1">Klik &quot;Process Images&quot; untuk remove background</p>
            </div>
          )}

          {/* Color Palette */}
          {product.color_palette?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/40">Color Palette</p>
                <p className="text-[10px] text-white/20">{product.color_palette.length} warna</p>
              </div>
              <div className="flex gap-2">
                {product.color_palette.map((c, i) => (
                  <div key={i} className="group relative">
                    <div
                      className="w-8 h-8 rounded-xl border border-white/10 cursor-pointer transition-transform hover:scale-110"
                      style={{ background: c }}
                      onClick={() => { navigator.clipboard.writeText(c); }}
                    />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold mb-2">Deskripsi</h2>
          <p className="text-sm text-white/50 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Meta */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Info</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/[0.02] rounded-xl p-3">
            <span className="text-white/30 text-[10px] uppercase tracking-wide">Dibuat</span>
            <p className="text-white/60 mt-1">{new Date(product.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-3">
            <span className="text-white/30 text-[10px] uppercase tracking-wide">Diupdate</span>
            <p className="text-white/60 mt-1">{new Date(product.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-3">
            <span className="text-white/30 text-[10px] uppercase tracking-wide">ID Produk</span>
            <p className="text-white/40 mt-1 font-mono text-[11px]">{product.id.slice(0, 12)}...</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-3 justify-end pb-8">
        <button
          onClick={() => router.push(`/generate?product=${id}`)}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm"
        >
          Buat Video dari Produk Ini
        </button>
      </div>
    </div>
  );
}
