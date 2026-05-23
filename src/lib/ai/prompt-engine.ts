import { AITask } from './types';

interface PromptContext {
  task: AITask;
  variation?: 'hard_selling' | 'soft_selling' | 'aesthetic';
  product?: {
    title: string;
    description: string;
    theme: string;
  };
  template?: {
    name: string;
    room_type: string;
    color_palette: string[];
  };
  analysis?: {
    dominant_colors: string[];
    aesthetic_style: string;
    scene_suggestions: string[];
  };
  existingScript?: string;
  sceneIndex?: number;
}

const STYLE_GUIDES: Record<string, string> = {
  hard_selling: 'Tone: Urgen, FOMO, langsung. Hook dalam 3 detik. CTA eksplisit. Fokus ke promosi.',
  soft_selling: 'Tone: Lifestyle, storytelling, natural. Fokus transformasi ruangan. CTA subtle.',
  aesthetic: 'Tone: Visual, artsy, minimal teks. Biarkan visual berbicara. Hook opsional.',
};

export function buildSystemPrompt(task: AITask, variation?: string): string {
  const base = 'Kamu adalah expert TikTok marketing spesialis produk poster dinding aesthetic.';

  const taskInstructions: Record<AITask, string> = {
    'analyze-image': `Analisis gambar poster dinding:
- Warna dominan (max 5 hex)
- Gaya estetik (coquette, minimal, aesthetic, dark, dll)
- Objek terdeteksi
- Saran tipe ruangan yang cocok

Output JSON. Gunakan Bahasa Indonesia.`,

    'hook': `${base}
${variation ? STYLE_GUIDES[variation] : ''}

Buat hook TikTok yang menarik dalam Bahasa Indonesia.
- Hook dalam 3 detik pertama
- Maksimal 15 kata
- Output JSON: { "hook": "...", "style": "..." }`,

    'script': `${base}
${variation ? STYLE_GUIDES[variation] : ''}

Buat script video TikTok 9:16 untuk poster dinding.
Aturan:
- Durasi total: 15-25 detik
- Bahasa Indonesia natural
- Output JSON: { "scenes": [{ "time": "0:00-0:03", "visual_description": "...", "voice_text": "...", "subtitle_text": "...", "duration_seconds": 3 }], "total_duration_seconds": 20 }
- Maksimal 6 scene`,

    'scene': `${base}
Refine scene spesifik untuk video TikTok poster dinding.
Fokus pada deskripsi visual: pencahayaan, angle kamera, atmosfer, posisi produk.
Output JSON: { "visual_description": "...", "camera_angle": "...", "mood": "..." }`,

    'cta': `Buat Call-to-Action untuk video TikTok poster dinding.
${variation ? STYLE_GUIDES[variation] : ''}
- 1 kalimat pendek
- Natural, jangan "link di bio" terus
- Output JSON: { "cta": "..." }`,
  };

  return taskInstructions[task] || base;
}

export function buildUserPrompt(ctx: PromptContext): string {
  const sections: string[] = [];

  if (ctx.product) {
    sections.push(`PRODUK:\nNama: ${ctx.product.title}\nDeskripsi: ${ctx.product.description}\nTema: ${ctx.product.theme}`);
  }

  if (ctx.analysis) {
    sections.push(`ANALISIS GAMBAR:\nWarna: ${ctx.analysis.dominant_colors.join(', ')}\nGaya: ${ctx.analysis.aesthetic_style}\nSaran ruangan: ${ctx.analysis.scene_suggestions.join(', ')}`);
  }

  if (ctx.template) {
    sections.push(`TEMPLATE RUANGAN:\n${ctx.template.name} (${ctx.template.room_type})\nPalet: ${ctx.template.color_palette.join(', ')}`);
  }

  if (ctx.variation) {
    sections.push(`GAYA KONTEN: ${ctx.variation.replace('_', ' ').toUpperCase()}`);
  }

  if (ctx.existingScript) {
    sections.push(`SCRIPT SAAT INI:\n${ctx.existingScript}`);
  }

  if (ctx.sceneIndex !== undefined) {
    sections.push(`REFINE SCENE INDEX: ${ctx.sceneIndex}`);
  }

  return sections.join('\n\n');
}
