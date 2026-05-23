import { NextRequest, NextResponse } from 'next/server';
import { router } from '@/lib/ai/router';
import { buildUserPrompt, buildSystemPrompt } from '@/lib/ai/prompt-engine';
import { initAIProviders } from '@/lib/ai/init';

initAIProviders();

export async function POST(req: NextRequest) {
  try {
    const { images, product } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Images required' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt('analyze-image');
    const userPrompt = buildUserPrompt({ task: 'analyze-image', product });

    const response = await router.execute('analyze-image', {
      images: images.slice(0, 5),
      prompt: `${systemPrompt}\n\n${userPrompt}`,
    });

    let analysis;
    try {
      const cleaned = response.text.replace(/```json?/g, '').replace(/```/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = { raw: response.text };
    }

    return NextResponse.json({
      analysis,
      usage: response.usage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
