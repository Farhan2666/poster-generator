import { NextRequest, NextResponse } from 'next/server';
import { router } from '@/lib/ai/router';
import { buildUserPrompt, buildSystemPrompt } from '@/lib/ai/prompt-engine';
import { initAIProviders } from '@/lib/ai/init';

initAIProviders();

export async function POST(req: NextRequest) {
  try {
    const { sceneIndex, existingScript, product, template } = await req.json();

    if (sceneIndex === undefined) {
      return NextResponse.json({ error: 'sceneIndex required' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt('scene');
    const userPrompt = buildUserPrompt({
      task: 'scene', product, template, existingScript, sceneIndex,
    });

    const response = await router.execute('scene', {
      prompt: `${systemPrompt}\n\n${userPrompt}`,
    });

    let scene;
    try {
      const cleaned = response.text.replace(/```json?/g, '').replace(/```/g, '').trim();
      scene = JSON.parse(cleaned);
    } catch {
      scene = { visual_description: response.text.trim(), camera_angle: 'front', mood: 'neutral' };
    }

    return NextResponse.json({
      scene_index: sceneIndex,
      ...scene,
      usage: response.usage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
