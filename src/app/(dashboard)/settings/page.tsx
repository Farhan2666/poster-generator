'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/auth-client';

interface SettingsForm {
  geminiKey: string;
  deepseekKey: string;
  openaiKey: string;
  dailyTarget: number;
  autoProcessImages: boolean;
  defaultTheme: string;
}

const DEFAULT: SettingsForm = {
  geminiKey: '',
  deepseekKey: '',
  openaiKey: '',
  dailyTarget: 2,
  autoProcessImages: true,
  defaultTheme: 'aesthetic',
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_preferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        setForm(prev => ({ ...prev, ...prefs }));
      }
    } catch { /* ignore */ }

    // Load API keys from Supabase profile
    loadApiKeys();
  }, []);

  async function loadApiKeys() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('gemini_api_key, deepseek_api_key, openai_api_key')
        .eq('id', user.id)
        .single();

      if (profile) {
        setForm(prev => ({
          ...prev,
          geminiKey: profile.gemini_api_key || '',
          deepseekKey: profile.deepseek_api_key || '',
          openaiKey: profile.openai_api_key || '',
        }));
      }
    } catch (err: any) {
      console.warn('Gagal load API keys:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    // Save preferences to localStorage (non-sensitive)
    const prefs = {
      dailyTarget: form.dailyTarget,
      autoProcessImages: form.autoProcessImages,
      defaultTheme: form.defaultTheme,
    };
    localStorage.setItem('app_preferences', JSON.stringify(prefs));

    // Save API keys to Supabase profile
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Kamu harus login dulu');
        setSaving(false);
        return;
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          gemini_api_key: form.geminiKey,
          deepseek_api_key: form.deepseekKey,
          openai_api_key: form.openaiKey,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm(DEFAULT);
    localStorage.removeItem('app_preferences');
    setSaved(true);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Pengaturan</h1>
          <p className="text-white/40 mt-1">Memuat pengaturan...</p>
        </div>
        <div className="glass-card rounded-2xl p-7 flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Pengaturan</h1>
        <p className="text-white/40 mt-1">Konfigurasi aplikasi dan API keys</p>
      </div>

      <div className="glass-card rounded-2xl p-7 space-y-7">
        {/* API Keys */}
        <div>
          <h2 className="font-semibold mb-1">API Keys AI</h2>
          <p className="text-xs text-white/30 mb-4">
            Disimpan di akun kamu. Setiap user punya API key masing-masing.
          </p>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Gemini API Key</label>
              <input
                type="password"
                value={form.geminiKey}
                onChange={e => update('geminiKey', e.target.value)}
                placeholder="AIzaSy..."
                className="input-field font-mono text-sm"
              />
              <p className="text-[10px] text-white/20 mt-1">Untuk analyze-image, hook, script, cta</p>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">DeepSeek API Key</label>
              <input
                type="password"
                value={form.deepseekKey}
                onChange={e => update('deepseekKey', e.target.value)}
                placeholder="sk-..."
                className="input-field font-mono text-sm"
              />
              <p className="text-[10px] text-white/20 mt-1">Opsional — fallback provider</p>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">OpenAI API Key (fallback)</label>
              <input
                type="password"
                value={form.openaiKey}
                onChange={e => update('openaiKey', e.target.value)}
                placeholder="sk-proj-..."
                className="input-field font-mono text-sm"
              />
              <p className="text-[10px] text-white/20 mt-1">Opsional — fallback jika provider lain error</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* Preferences */}
        <div>
          <h2 className="font-semibold mb-4">Preferensi</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Target Video per Hari</p>
                <p className="text-xs text-white/30">Target harian di dashboard</p>
              </div>
              <input
                type="number"
                min={1}
                max={20}
                value={form.dailyTarget}
                onChange={e => update('dailyTarget', Number(e.target.value))}
                className="input-field w-20 text-center"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Auto-process Images</p>
                <p className="text-xs text-white/30">Langsung proses setelah upload</p>
              </div>
              <button
                onClick={() => update('autoProcessImages', !form.autoProcessImages)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form.autoProcessImages ? 'bg-primary' : 'bg-white/[0.1]'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                  form.autoProcessImages ? 'left-[26px]' : 'left-[2px]'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2">Tema Default</label>
              <div className="flex gap-2">
                {['coquette', 'minimal', 'aesthetic', 'dark', 'custom'].map(t => (
                  <button
                    key={t}
                    onClick={() => update('defaultTheme', t)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                      form.defaultTheme === t
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* Info */}
        <div className="bg-white/[0.02] rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Cara Kerja API Key</h3>
          <p className="text-xs text-white/30 leading-relaxed">
            API key disimpan di akun kamu dan digunakan otomatis saat generate video.
            Setiap user punya API key masing-masing, jadi kamu ga perlu sharing key.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Menyimpan...
              </>
            ) : saved ? (
              'Tersimpan'
            ) : (
              'Simpan Pengaturan'
            )}
          </button>
          <button onClick={handleReset} className="px-5 py-2.5 rounded-xl border border-white/[0.06] text-sm text-white/40 hover:text-white/60 transition-all">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
