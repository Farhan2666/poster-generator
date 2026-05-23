import { registry, AIProviderRegistry } from './registry';
import { getAIConfig } from './config';
import { AIResponse, AIOptions, AITask } from './types';

export class AIRouter {
  constructor(private registry: AIProviderRegistry) {}

  async execute(task: AITask, input: {
    prompt?: string;
    images?: string[];
    model?: string;
    options?: AIOptions;
  }): Promise<AIResponse> {
    const config = getAIConfig();
    const taskConfig = config.tasks[task];

    if (!taskConfig) {
      throw new Error(`Task '${task}' tidak ditemukan di konfigurasi`);
    }

    const providerId = taskConfig.provider;
    const model = input.model || taskConfig.model;
    const options = { ...taskConfig, ...input.options };

    try {
      const provider = this.registry.getProvider(providerId);
      const capabilities = provider.getCapabilities();

      // Validasi capability untuk task yang butuh vision
      if ((task === 'analyze-image' || task === 'scene') && !capabilities.includes('vision')) {
        // Cari fallback provider dengan vision
        const visionProviders = this.registry.findByCapability('vision');
        if (visionProviders.length > 0) {
          const fallbackProvider = visionProviders[0];
          if (fallbackProvider.analyzeImage && input.images) {
            return await fallbackProvider.analyzeImage(input.images, input.prompt || '', model, options);
          }
        }
        throw new Error(`Task '${task}' butuh kemampuan vision, tapi provider '${providerId}' tidak mendukung`);
      }

      // Eksekusi sesuai task
      if (task === 'analyze-image' || task === 'scene') {
        if (provider.analyzeImage && input.images) {
          return await provider.analyzeImage(input.images, input.prompt || '', model, options);
        }
        // Fallback: provider tidak punya analyzeImage, kirim sebagai text
        return await provider.generateText(input.prompt || '', model, options);
      }

      return await provider.generateText(input.prompt || '', model, options);
    } catch (err: any) {
      // Fallback strategy
      const fallback = config.fallbackStrategy;
      if (fallback.fallbackProvider && fallback.fallbackProvider !== providerId) {
        try {
          const fallbackProv = this.registry.getProvider(fallback.fallbackProvider);
          return await fallbackProv.generateText(
            input.prompt || '',
            fallback.fallbackModel,
            { ...options, maxTokens: fallback.timeoutMs }
          );
        } catch {}
      }
      throw err;
    }
  }
}

export const router = new AIRouter(registry);
