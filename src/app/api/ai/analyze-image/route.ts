import { NextRequest, NextResponse } from 'next/server';
import { router } from '@/lib/ai/router';
import { buildUserPrompt, buildSystemPrompt } from '@/lib/ai/prompt-engine';
import { initAIProviders } from '@/lib/ai/init';
import fs from 'fs';
import path from 'path';

initAIProviders();

/**
 * Convert image URL or path to base64 data string for Gemini vision API.
 * Supports: /uploads/xxx.jpg (local), /processed/xxx/xxx.png (local), or full http URLs
 */
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  // If it's a relative URL, resolve to local filesystem path
  if (imageUrl.startsWith('/')) {
    const filePath = path.join(process.cwd(), 'public', imageUrl);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(imageUrl).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return buffer.toString('base64');
  }

  // Full URL — fetch from network
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${imageUrl} (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const { images, product } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Images required' }, { status: 400 });
    }

    // Convert URLs to base64 for Gemini vision API
    const base64Images = await Promise.all(
      images.slice(0, 5).map((url: string) => imageUrlToBase64(url))
    );

    const systemPrompt = buildSystemPrompt('analyze-image');
    const userPrompt = buildUserPrompt({ task: 'analyze-image', product });

    const response = await router.execute('analyze-image', {
      images: base64Images,
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
