import { Variation, Scene } from '@/types/video';

interface AnalysisResult {
  dominant_colors: string[];
  aesthetic_style: string;
  scene_suggestions: string[];
  [key: string]: any;
}

export class AIService {
  async analyzeImage(productId: string, images: string[]) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    });
    return res.json() as Promise<{ analysis: AnalysisResult }>;
  }

  async generateHook(productId: string, variation: Variation, analysis?: AnalysisResult) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/hook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variation, analysis }),
    });
    return res.json() as Promise<{ hook: string }>;
  }

  async generateScript(productId: string, templateId: string, variation: Variation, analysis?: AnalysisResult, hook?: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variation, analysis, hook }),
    });
    return res.json() as Promise<{ scenes: Scene[]; total_duration_seconds: number }>;
  }

  async generateCta(variation: Variation, hook?: string, script?: any) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/cta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variation, hook, script }),
    });
    return res.json() as Promise<{ cta: string }>;
  }

  async generateFull(productId: string, templateId: string) {
    const variations: Variation[] = ['hard_selling', 'soft_selling', 'aesthetic'];

    const analysis = await this.analyzeImage(productId, []);

    const results = await Promise.all(
      variations.map(async (variation) => {
        const [hookRes, scriptRes] = await Promise.all([
          this.generateHook(productId, variation, analysis.analysis),
          this.generateScript(productId, templateId, variation, analysis.analysis),
        ]);
        const ctaRes = await this.generateCta(variation, hookRes.hook, scriptRes);
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
