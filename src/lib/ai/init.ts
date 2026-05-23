import { registry } from './registry';
import { GeminiProvider } from './providers/gemini';
import { DeepSeekProvider } from './providers/deepseek';
import { OpenAIProvider } from './providers/openai';

export function initAIProviders(): void {
  if (registry.getAllProviders().length > 0) return;

  if (process.env.GEMINI_API_KEY) {
    registry.register(new GeminiProvider(process.env.GEMINI_API_KEY));
  }

  if (process.env.DEEPSEEK_API_KEY) {
    registry.register(new DeepSeekProvider(process.env.DEEPSEEK_API_KEY));
  }

  if (process.env.OPENAI_API_KEY) {
    registry.register(new OpenAIProvider(process.env.OPENAI_API_KEY));
  }

  if (registry.getAllProviders().length === 0) {
    console.warn('[AI] Tidak ada API key terdaftar. AI endpoints akan error.');
  }
}
