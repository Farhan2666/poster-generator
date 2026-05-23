import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';

export async function POST(req: NextRequest) {
  try {
    const { productId, templateId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    const result = await aiService.generateFull(productId, templateId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
