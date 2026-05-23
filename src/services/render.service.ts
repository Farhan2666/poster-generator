import { supabaseAdmin } from '@/lib/supabase';
import { Variation } from '@/types/video';
import crypto from 'crypto';

export class RenderService {
  async enqueue(params: {
    productId: string;
    templateId: string;
    variation: Variation;
    script: any;
  }): Promise<{ videoId: string }> {
    const videoId = crypto.randomUUID();

    if (supabaseAdmin) {
      await supabaseAdmin.from('videos').insert({
        id: videoId,
        product_id: params.productId,
        template_id: params.templateId,
        variation: params.variation,
        script: params.script,
        status: 'queued',
        progress: 0,
      });
    }

    // Simulate async render
    this.simulateRender(videoId);

    return { videoId };
  }

  private async simulateRender(videoId: string): Promise<void> {
    if (!supabaseAdmin) return;

    await supabaseAdmin
      .from('videos')
      .update({ status: 'processing', progress: 10 })
      .eq('id', videoId);

    // Simulate progress
    for (let p = 20; p <= 90; p += 10) {
      await new Promise(r => setTimeout(r, 1500));
      await supabaseAdmin
        .from('videos')
        .update({ progress: p })
        .eq('id', videoId);
    }

    await supabaseAdmin
      .from('videos')
      .update({
        status: 'done',
        progress: 100,
        output_url: 'https://example.com/video.mp4',
        duration_sec: 20,
      })
      .eq('id', videoId);
  }

  async getStatus(videoId: string): Promise<{
    status: string;
    progress: number;
    output_url?: string;
  } | null> {
    if (!supabaseAdmin) return null;

    const { data } = await supabaseAdmin
      .from('videos')
      .select('status, progress, output_url')
      .eq('id', videoId)
      .single();

    return data;
  }
}

export const renderService = new RenderService();
