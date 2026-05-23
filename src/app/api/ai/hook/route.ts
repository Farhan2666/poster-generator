import { NextRequest, NextResponse } from 'next/server';
import { router } from '@/lib/ai/router';
import { buildUserPrompt, buildSystemPrompt } from '@/lib/ai/prompt-engine';
import { initAIProviders } from '@/lib/ai/init';

initAIProviders();

export async function POST(req: NextRequest) {
  try {
    const { variation, product, analysis } = await req.json();

    const validVariations = ['hard_selling', 'soft_selling', 'aesthetic'];
    const v = validVariations.includes(variation) ? variation : 'soft_selling';

    const systemPrompt = buildSystemPrompt('hook', v);
    const userPrompt = buildUserPrompt({
      task: 'hook', variation: v as any, product, analysis
    });

    const response = await router.execute('hook', {
      prompt: `${systemPrompt}\n\n${userPrompt}`,
    });

    let hook;
    try {
      const cleaned = response.text.replace(/```json?/g, '').replace(/```/g, '').trim();
      hook = JSON.parse(cleaned);
    } catch {
      hook = { hook: response.text.trim(), style: v };
    }

    return NextResponse.json({
      ...hook,
      variation: v,
      usage: response.usage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
