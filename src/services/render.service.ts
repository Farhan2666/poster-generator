import { supabaseAdmin } from '@/lib/supabase';
import { Variation, Scene } from '@/types/video';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const PRODUCTS_FILE = path.join(process.cwd(), 'tmp', 'products.json');

function readLocalProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

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

    this.processRender(videoId, params);

    return { videoId };
  }

  private async processRender(
    videoId: string,
    params: { productId: string; templateId: string; variation: Variation; script: any }
  ): Promise<void> {
    try {
      await this.updateStatus(videoId, { status: 'processing', progress: 5 });

      // Get product image
      let productImageUrl = '';
      if (supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('products')
          .select('processed_images, images')
          .eq('id', params.productId)
          .single();
        productImageUrl = data?.processed_images?.[0] || data?.images?.[0] || '';
      } else {
        const products = readLocalProducts();
        const p = products.find((x: any) => x.id === params.productId);
        productImageUrl = p?.processed_images?.[0] || p?.images?.[0] || '';
      }

      if (!productImageUrl) throw new Error('No product image found');

      await this.updateStatus(videoId, { progress: 15 });

      // Dynamic import to avoid build-time dependency issues
      const { renderEngineService } = await import('./render-engine.service');

      const scenes = params.script?.scenes || [];
      const result = await renderEngineService.renderVideo({
        productImageUrl: productImageUrl.startsWith('http') ? productImageUrl : `http://localhost:3000${productImageUrl}`,
        templateId: params.templateId,
        scenes,
        hook: params.script?.hook || '',
        cta: params.script?.cta || '',
        variation: params.variation,
      });

      await this.updateStatus(videoId, {
        status: 'done',
        progress: 100,
        output_url: result.outputUrl,
        duration_sec: result.totalDurationSec,
      });
    } catch (err: any) {
      await this.updateStatus(videoId, {
        status: 'failed',
        progress: 0,
        error_log: err.message,
      });
    }
  }

  private async updateStatus(
    videoId: string,
    data: { status?: string; progress?: number; output_url?: string; duration_sec?: number; error_log?: string }
  ): Promise<void> {
    if (supabaseAdmin) {
      await supabaseAdmin.from('videos').update(data).eq('id', videoId);
    }
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
