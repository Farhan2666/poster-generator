import { NextRequest, NextResponse } from 'next/server';
import { router } from '@/lib/ai/router';
import { buildUserPrompt, buildSystemPrompt } from '@/lib/ai/prompt-engine';
import { initAIProviders } from '@/lib/ai/init';

initAIProviders();

export async function POST(req: NextRequest) {
  try {
    const { variation, hook, script } = await req.json();

    const validVariations = ['hard_selling', 'soft_selling', 'aesthetic'];
    const v = validVariations.includes(variation) ? variation : 'soft_selling';

    const systemPrompt = buildSystemPrompt('cta', v);
    const context = [
      hook ? `Hook: ${typeof hook === 'string' ? hook : (hook.hook || hook.text || '')}` : '',
      script ? `Script: ${typeof script === 'string' ? script : JSON.stringify(script).slice(0, 500)}` : '',
    ].filter(Boolean).join('\n');

    const response = await router.execute('cta', {
      prompt: `${systemPrompt}\n\n${context}`,
    });

    let cta;
    try {
      const cleaned = response.text.replace(/```json?/g, '').replace(/```/g, '').trim();
      cta = JSON.parse(cleaned);
    } catch {
      cta = { cta: response.text.trim() };
    }

    return NextResponse.json({
      ...cta,
      variation: v,
      usage: response.usage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
