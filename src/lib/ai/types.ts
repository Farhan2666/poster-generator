export type Capability =
  | 'vision'
  | 'long_context'
  | 'structured_output'
  | 'cheap'
  | 'fast'
  | 'indonesian_expert';

export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeoutMs?: number;
}

export interface AIResponse {
  text: string;
  raw?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  id: string;
  getCapabilities(): Capability[];
  generateText(prompt: string, model: string, options?: AIOptions): Promise<AIResponse>;
  analyzeImage?(images: string[], prompt: string, model: string, options?: AIOptions): Promise<AIResponse>;
}

export interface TaskConfig {
  provider: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIConfig {
  tasks: Record<string, TaskConfig>;
  fallbackStrategy: {
    maxRetries: number;
    fallbackProvider: string;
    fallbackModel: string;
    timeoutMs: number;
  };
}

export type AITask = 'analyze-image' | 'hook' | 'script' | 'scene' | 'cta';
