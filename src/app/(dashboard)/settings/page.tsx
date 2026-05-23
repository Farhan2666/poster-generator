'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_settings');
      if (stored) setForm({ ...DEFAULT, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  function update<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem('app_settings', JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setForm(DEFAULT);
    localStorage.removeItem('app_settings');
    setSaved(true);
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
          <p className="text-xs text-white/30 mb-4">Disimpan di browser (localStorage). Tidak dikirim ke server lain.</p>

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
              <p className="text-[10px] text-white/20 mt-1">Untuk analyze-image dan scene (vision tasks)</p>
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
              <p className="text-[10px] text-white/20 mt-1">Untuk hook, script, cta (text tasks — termurah)</p>
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
              <p className="text-[10px] text-white/20 mt-1">Fallback jika provider lain error</p>
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
                <p className="text-xs text-white/30">Langsung proses (remove bg + color) setelah upload</p>
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
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Task Provider Mapping</h3>
          <p className="text-xs text-white/30 leading-relaxed">
            Konfigurasi mapping task ke provider ada di <code className="bg-black/30 px-1.5 py-0.5 rounded text-primary">config/ai.config.json</code>.
            Sistem akan otomatis fallback jika provider tidak memiliki capability yang diperlukan.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              ['analyze-image', 'Gemini (vision)'],
              ['hook', 'DeepSeek'],
              ['script', 'DeepSeek'],
              ['scene', 'Gemini (vision)'],
              ['cta', 'DeepSeek'],
            ].map(([task, provider]) => (
              <div key={task} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-primary/40" />
                <span className="text-white/40">{task}:</span>
                <span className="text-white/20">{provider}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} className="btn-primary flex-1 py-2.5 rounded-xl text-sm">
            {saved ? 'Tersimpan' : 'Simpan Pengaturan'}
          </button>
          <button onClick={handleReset} className="px-5 py-2.5 rounded-xl border border-white/[0.06] text-sm text-white/40 hover:text-white/60 transition-all">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
