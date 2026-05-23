export type Variation = 'hard_selling' | 'soft_selling' | 'aesthetic';
export type VideoStatus = 'queued' | 'processing' | 'preview' | 'done' | 'failed';

export interface Video {
  id: string;
  product_id: string;
  template_id: string;
  variation: Variation;
  script: Script;
  voice_url?: string;
  music_url?: string;
  output_url?: string;
  duration_sec?: number;
  status: VideoStatus;
  progress: number;
  error_log?: string;
  created_at: string;
  updated_at: string;
}

export interface Script {
  hook: string;
  scenes: Scene[];
  cta: string;
  total_duration_seconds: number;
}

export interface Scene {
  time: string;
  visual_description: string;
  voice_text: string;
  subtitle_text: string;
  duration_seconds: number;
}
