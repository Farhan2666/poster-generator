import { NextRequest, NextResponse } from 'next/server';
import { buildUserPrompt, buildSystemPrompt } from '@/lib/ai/prompt-engine';
import { executeWithKey } from '@/lib/ai/execute-with-key';

export async function POST(req: NextRequest) {
  try {
    const { variation, product, template, analysis, hook, apiKey } = await req.json();

    const validVariations = ['hard_selling', 'soft_selling', 'aesthetic'];
    const v = validVariations.includes(variation) ? variation : 'soft_selling';

    const systemPrompt = buildSystemPrompt('script', v);
    const userPrompt = buildUserPrompt({
      task: 'script', variation: v as any, product, template, analysis,
    });

    const hookContext = hook ? `\n\nHOOK:\n${typeof hook === 'string' ? hook : (hook.hook || hook.text || '')}` : '';

    const response = await executeWithKey('script', {
      prompt: `${systemPrompt}\n\n${userPrompt}${hookContext}`,
    }, apiKey);

    let script;
    try {
      const cleaned = response.text.replace(/```json?/g, '').replace(/```/g, '').trim();
      script = JSON.parse(cleaned);
    } catch {
      script = { scenes: [], total_duration_seconds: 20 };
    }

    return NextResponse.json({
      ...script,
      variation: v,
      usage: response.usage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
