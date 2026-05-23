import { AIProvider, Capability, AIResponse, AIOptions } from '../types';

export class DeepSeekProvider implements AIProvider {
  id = 'deepseek';

  constructor(private apiKey: string) {}

  getCapabilities(): Capability[] {
    return ['long_context', 'structured_output', 'cheap', 'indonesian_expert'];
  }

  async generateText(prompt: string, model: string, options?: AIOptions): Promise<AIResponse> {
    const url = 'https://api.deepseek.com/chat/completions';

    const res = await fetch(url, {
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
      throw new Error(`DeepSeek API error (${res.status}): ${err}`);
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
