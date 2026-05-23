'use client';

import { useState } from 'react';
import { Scene } from '@/types/video';

interface VariationData {
  variation: string;
  hook: string;
  scenes: Scene[];
  cta: string;
}

const VARIATION_META: Record<string, { label: string; desc: string; gradient: string; glow: string }> = {
  hard_selling: {
    label: 'Hard Selling',
    desc: 'Urgen, FOMO, langsung',
    gradient: 'from-danger/20 to-warning/10',
    glow: 'shadow-danger/10',
  },
  soft_selling: {
    label: 'Soft Selling',
    desc: 'Lifestyle, storytelling',
    gradient: 'from-accent/20 to-success/10',
    glow: 'shadow-accent/10',
  },
  aesthetic: {
    label: 'Aesthetic Style',
    desc: 'Visual-first, minimal teks',
    gradient: 'from-primary/20 to-accent/10',
    glow: 'shadow-primary/10',
  },
};

export default function VariationTabs({
  variations,
  onRender,
  onRegenerate,
}: {
  variations: VariationData[];
  onRender: (variation: string) => void;
  onRegenerate: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = variations[activeIdx];

  if (!variations.length) return null;

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-3">
        {variations.map((v, i) => {
          const meta = VARIATION_META[v.variation];
          const isActive = i === activeIdx;
          return (
            <button
              key={v.variation}
              onClick={() => setActiveIdx(i)}
              className={`flex-1 p-4 rounded-xl border text-left transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-br ${meta?.gradient} border-white/[0.12] ${meta?.glow}`
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-white/50'}`}>
                {meta?.label || v.variation}
              </p>
              <p className="text-xs text-white/30 mt-0.5">{meta?.desc}</p>
              {isActive && (
                <div className="h-0.5 rounded-full bg-gradient-to-r from-primary to-accent mt-3" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Variation */}
      {active && (
        <div className="glass-card rounded-2xl p-6 space-y-6">
          {/* Hook */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Hook</span>
              <span className="text-[10px] text-white/20">detik 0-3</span>
            </div>
            <p className="text-xl font-bold text-accent leading-snug">
              &ldquo;{active.hook}&rdquo;
            </p>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Scenes */}
          <div>
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider block mb-3">
              Scene Flow ({active.scenes.length} scene)
            </span>
            <div className="space-y-2">
              {active.scenes.map((scene, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                  <div className="w-14 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center text-[10px] text-white/30 shrink-0 font-mono">
                    {scene.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60">{scene.visual_description}</p>
                    {scene.voice_text && (
                      <p className="text-xs text-white/40 mt-1">
                        <span className="text-accent/60">VO:</span> {scene.voice_text}
                      </p>
                    )}
                    {scene.subtitle_text && (
                      <p className="text-[11px] text-white/30 mt-0.5">
                          <span className="text-primary/60">TX:</span> {scene.subtitle_text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* CTA */}
          <div>
            <span className="text-[10px] font-semibold text-warning uppercase tracking-wider">Call to Action</span>
            <p className="text-base font-semibold mt-1">{active.cta}</p>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>T {active.scenes.reduce((acc, s) => acc + (s.duration_seconds || 3), 0)} detik</span>
            <span>SC {active.scenes.length} scene</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onRender(active.variation)}
          className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <span>{'>'}</span> Render {VARIATION_META[active.variation]?.label || active.variation}
        </button>
        <button
          onClick={onRegenerate}
          className="px-5 py-2.5 rounded-xl border border-white/[0.06] text-sm text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-all bg-white/[0.02]"
        >
          Regenerate All
        </button>
      </div>
    </div>
  );
}
