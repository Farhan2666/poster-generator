'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';

const STATUS_FILTERS = ['ready', 'draft', 'archived'] as const;
const THEME_FILTERS = ['all', 'coquette', 'minimal', 'aesthetic', 'dark', 'custom'] as const;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ready');
  const [themeFilter, setThemeFilter] = useState('all');

  async function loadProducts(status?: string) {
    setLoading(true);
    try {
      const data = await productService.list({ status: status || 'ready' });
      setProducts(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts(statusFilter);
  }, [statusFilter]);

  const filtered = products.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (themeFilter !== 'all' && p.theme !== themeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Product Library</h1>
          <p className="text-white/40 mt-1">Kelola koleksi poster aesthetic kamu</p>
        </div>
        <Link
          href="/products/upload"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
        >
          <span>+</span> Upload Produk
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/20">C</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="input-field pl-8 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Theme Filter */}
          <div className="flex gap-1">
            {THEME_FILTERS.map(t => (
              <button
                key={t}
                onClick={() => setThemeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  themeFilter === t
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-danger">!</span>
          </div>
          <p className="text-white/50 text-sm">{error}</p>
          {error === 'Supabase not configured' && (
            <p className="text-white/20 text-xs mt-2">Gunakan fallback lokal (produk tersimpan di tmp/products.json)</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-white/40">Memuat produk...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
            <span className="text-3xl opacity-30">+</span>
          </div>
          <p className="text-white/50">Belum ada produk {statusFilter !== 'ready' ? `(status: ${statusFilter})` : ''}</p>
          <p className="text-white/20 text-sm mt-1">Upload produk pertama untuk memulai</p>
          <Link
            href="/products/upload"
            className="mt-5 px-5 py-2 rounded-xl bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.1] hover:text-white/80 transition-all"
          >
            Upload Sekarang
          </Link>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">{filtered.length} dari {products.length} produk</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="glass-card rounded-2xl overflow-hidden group"
              >
                <div className="h-44 bg-white/[0.02] flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">+</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium truncate group-hover:text-white transition-colors">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/30 capitalize">{product.theme}</span>
                    {product.color_palette?.length > 0 && (
                      <div className="flex gap-0.5">
                        {product.color_palette.slice(0, 3).map((c, i) => (
                          <span key={i} className="w-2 h-2 rounded-full border border-white/10" style={{ background: c }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      product.status === 'ready' ? 'bg-success/10 text-success' :
                      product.status === 'draft' ? 'bg-warning/10 text-warning' :
                      'bg-white/[0.05] text-white/40'
                    }`}>
                      {product.status}
                    </span>
                    {product.image_status === 'done' && (
                      <span className="text-[10px] text-white/20">processed</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* No results for active filters */}
      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-white/40">Tidak ada produk cocok dengan filter</p>
          <button onClick={() => { setSearch(''); setThemeFilter('all'); }} className="mt-3 text-xs text-accent hover:underline">
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
