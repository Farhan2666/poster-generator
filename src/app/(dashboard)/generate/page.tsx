'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';

const TEMPLATES = [
  { id: 'coquette-pink-room', name: 'Coquette Pink Room', type: 'pink_bedroom', colors: ['#f8bbd0', '#f06292', '#ec407a'] },
  { id: 'minimal-korea-room', name: 'Minimal Korea Room', type: 'korea_minimal', colors: ['#f5f5f5', '#e0e0e0', '#bdbdbd'] },
  { id: 'pinterest-bedroom', name: 'Pinterest Bedroom', type: 'pinterest_bedroom', colors: ['#ffe0b2', '#ffab91', '#a5d6a7'] },
  { id: 'study-desk-aesthetic', name: 'Study Desk Aesthetic', type: 'study_desk', colors: ['#d7ccc8', '#a1887f', '#8d6e63'] },
  { id: 'warm-bedroom', name: 'Warm Bedroom', type: 'warm_bedroom', colors: ['#ffcc80', '#ffb74d', '#fff9c4'] },
];

export default function GeneratePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    productService.list()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    if (!selectedProduct || !selectedTemplate) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/generate/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, templateId: selectedTemplate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sessionStorage.setItem('generate_result', JSON.stringify({
        ...data,
        productId: selectedProduct,
        templateId: selectedTemplate,
      }));

      router.push('/generate/preview');
    } catch (err: any) {
      alert('Gagal generate: ' + err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Buat Video Baru</h1>
        <p className="text-white/40 mt-1">Pilih produk dan template, AI akan membuatkan 3 variasi konten</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold mb-1">1. Pilih Produk</h2>
          <p className="text-xs text-white/30 mb-4">Produk yang akan dipromosikan</p>
          {loading ? (
            <p className="text-sm text-white/40">Memuat...</p>
          ) : products.length === 0 ? (
            <div className="border-2 border-dashed border-white/[0.06] rounded-xl p-6 text-center">
              <p className="text-sm text-white/30">Belum ada produk</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedProduct === p.id
                      ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/5'
                      : 'border-white/[0.06] bg-black/20 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                          <span className="text-sm opacity-30">IMG</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-white/30 capitalize">{p.theme}</p>
                    </div>
                    {selectedProduct === p.id && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold mb-1">2. Pilih Template</h2>
          <p className="text-xs text-white/30 mb-4">Mockup room untuk video</p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTemplate === tpl.id
                    ? 'border-accent/50 bg-accent/5 shadow-lg shadow-accent/5'
                    : 'border-white/[0.06] bg-black/20 hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{
                    background: `linear-gradient(135deg, ${tpl.colors[0]}, ${tpl.colors[2]})`
                  }}>
                    <span className="text-xs opacity-40">◰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tpl.name}</p>
                    <p className="text-xs text-white/30 capitalize">{tpl.type.replace(/_/g, ' ')}</p>
                  </div>
                  {selectedTemplate === tpl.id && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-accent animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/40">
            {!selectedProduct && !selectedTemplate && 'Pilih produk dan template untuk memulai'}
            {selectedProduct && !selectedTemplate && 'Sekarang pilih template ruangan'}
            {!selectedProduct && selectedTemplate && 'Pilih produk yang akan dipromosikan'}
            {selectedProduct && selectedTemplate && 'Siap! AI akan generate 3 variasi konten sekaligus'}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedProduct || !selectedTemplate || generating}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              AI Sedang Bekerja...
            </>
          ) : (
            <>
              <span>{'>'}</span> Generate Script
            </>
          )}
        </button>
      </div>
    </div>
  );
}
