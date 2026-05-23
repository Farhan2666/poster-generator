export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface GenerateFullResponse {
  variations: Array<{
    variation: string;
    hook: string;
    scenes: import('./video').Scene[];
    cta: string;
  }>;
}

export interface RenderStatusResponse {
  video_id: string;
  status: string;
  progress: number;
  output_url?: string;
}
