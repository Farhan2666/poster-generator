import { AIProvider, Capability, AIResponse, AIOptions } from '../types';

export class OpenAIProvider implements AIProvider {
  id = 'openai';

  constructor(private apiKey: string) {}

  getCapabilities(): Capability[] {
    return ['vision', 'long_context', 'structured_output', 'fast'];
  }

  async generateText(prompt: string, model: string, options?: AIOptions): Promise<AIResponse> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? 2000,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content ?? '',
      raw: data,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }
}
