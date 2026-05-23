import { NextRequest, NextResponse } from 'next/server';
import { renderService } from '@/services/render.service';

export async function POST(req: NextRequest) {
  try {
    const { productId, templateId, variation, script } = await req.json();

    if (!productId || !script) {
      return NextResponse.json({ error: 'productId and script required' }, { status: 400 });
    }

    const result = await renderService.enqueue({
      productId,
      templateId,
      variation,
      script,
    });

    return NextResponse.json({
      video_id: result.videoId,
      status: 'queued',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
