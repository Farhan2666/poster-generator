'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';

const THEMES = ['coquette', 'minimal', 'aesthetic', 'dark', 'custom'] as const;

export default function UploadProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<string>('aesthetic');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFiles(prev => [...prev, ...arr]);
    setPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError('');

    try {
      let imageUrls: string[] = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || 'Upload gagal');
        }
        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls;
      }

      await productService.create({
        title: title.trim(),
        description: description.trim(),
        theme: theme as any,
        images: imageUrls,
      });

      router.push('/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Upload Produk</h1>
        <p className="text-white/40 mt-1">Tambah produk poster baru ke library</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-7 space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Nama Produk</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Misal: Poster Coquette 16pcs"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Deskripsi</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ceritakan sedikit tentang produk ini..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Tema</label>
          <div className="flex gap-2 flex-wrap">
            {THEMES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-4 py-1.5 rounded-xl text-sm capitalize transition-all ${
                  theme === t
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20'
                    : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/[0.12] hover:text-white/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Foto Produk</label>
          <div
            className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center hover:border-primary/40 transition-all cursor-pointer group"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl opacity-30">+</span>
            </div>
            <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Klik untuk pilih foto produk</p>
            <p className="text-xs text-white/20 mt-1">JPEG, PNG, WebP. Maks 10MB per file</p>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((url, i) => (
                <div key={i} className="relative group/preview">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="btn-primary w-full py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Upload & Simpan...
            </>
          ) : (
            'Simpan Produk'
          )}
        </button>
      </form>
    </div>
  );
}
