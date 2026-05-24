import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { router } from '@/lib/ai/router';
import { AIResponse, AIOptions } from '@/lib/ai/types';
import { initAIProviders } from '@/lib/ai/init';

/**
 * Execute an AI task using either a per-user API key or the global provider.
 * If apiKey is provided, creates a temporary GeminiProvider and uses it directly.
 */
export async function executeWithKey(
  task: string,
  input: { prompt?: string; images?: string[]; model?: string; options?: AIOptions },
  apiKey?: string
): Promise<AIResponse> {
  // Ensure global providers are registered
  initAIProviders();

  if (apiKey) {
    const provider = new GeminiProvider(apiKey);
    if ((task === 'analyze-image' || task === 'scene') && input.images) {
      return await provider.analyzeImage(input.images, input.prompt || '', input.model || 'gemini-2.0-flash', input.options);
    }
    return await provider.generateText(input.prompt || '', input.model || 'gemini-2.0-flash', input.options);
  }

  // Fallback to global router
  return await router.execute(task as any, input);
}
