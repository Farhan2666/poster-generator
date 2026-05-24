import { Variation, Scene } from '@/types/video';

interface AnalysisResult {
  dominant_colors: string[];
  aesthetic_style: string;
  scene_suggestions: string[];
  [key: string]: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class AIService {
  async analyzeImage(productId: string, images: string[], apiKey?: string) {
    const res = await fetch(`${BASE_URL}/api/ai/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images, apiKey }),
    });
    return res.json() as Promise<{ analysis: AnalysisResult }>;
  }

  async generateHook(productId: string, variation: Variation, analysis?: AnalysisResult, apiKey?: string) {
    const res = await fetch(`${BASE_URL}/api/ai/hook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variation, analysis, apiKey }),
    });
    return res.json() as Promise<{ hook: string }>;
  }

  async generateScript(productId: string, templateId: string, variation: Variation, analysis?: AnalysisResult, hook?: string, apiKey?: string) {
    const res = await fetch(`${BASE_URL}/api/ai/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variation, analysis, hook, apiKey }),
    });
    return res.json() as Promise<{ scenes: Scene[]; total_duration_seconds: number }>;
  }

  async generateCta(variation: Variation, hook?: string, script?: any, apiKey?: string) {
    const res = await fetch(`${BASE_URL}/api/ai/cta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variation, hook, script, apiKey }),
    });
    return res.json() as Promise<{ cta: string }>;
  }

  async generateFull(productId: string, templateId: string, images?: string[], apiKey?: string) {
    const variations: Variation[] = ['hard_selling', 'soft_selling', 'aesthetic'];

    if (!images || images.length === 0) {
      throw new Error('generateFull membutuhkan array images untuk analisis produk');
    }

    const analysis = await this.analyzeImage(productId, images, apiKey);

    const results = await Promise.all(
      variations.map(async (variation) => {
        const [hookRes, scriptRes] = await Promise.all([
          this.generateHook(productId, variation, analysis.analysis, apiKey),
          this.generateScript(productId, templateId, variation, analysis.analysis, apiKey),
        ]);
        const ctaRes = await this.generateCta(variation, hookRes.hook, scriptRes, apiKey);
        return {
          variation,
          hook: hookRes.hook,
          scenes: scriptRes.scenes,
          cta: ctaRes.cta,
        };
      })
    );

    return { variations: results };
  }
}

export const aiService = new AIService();
