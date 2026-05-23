import { AIProvider, Capability, AIResponse, AIOptions } from '../types';

export class GeminiProvider implements AIProvider {
  id = 'gemini';

  constructor(private apiKey: string) {}

  getCapabilities(): Capability[] {
    return ['vision', 'long_context', 'structured_output', 'indonesian_expert'];
  }

  async generateText(prompt: string, model: string, options?: AIOptions): Promise<AIResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options?.maxTokens ?? 2000,
          temperature: options?.temperature ?? 0.7,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
      raw: data,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }

  async analyzeImage(images: string[], prompt: string, model: string, options?: AIOptions): Promise<AIResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: prompt },
      ...images.map(img => ({
        inlineData: { mimeType: 'image/jpeg' as const, data: img }
      })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: options?.maxTokens ?? 1000,
          temperature: options?.temperature ?? 0.3,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini Vision API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
      raw: data,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }
}
