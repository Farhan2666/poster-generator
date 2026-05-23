import { AIProvider, Capability } from './types';

export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): AIProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`AI provider '${id}' tidak terdaftar. Tersedia: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return provider;
  }

  findByCapability(cap: Capability): AIProvider[] {
    return Array.from(this.providers.values()).filter(p =>
      p.getCapabilities().includes(cap)
    );
  }

  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}

export const registry = new AIProviderRegistry();
