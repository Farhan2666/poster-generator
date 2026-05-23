import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { productId, templateId, script } = await req.json();

    if (!script) {
      return NextResponse.json({ error: 'script required' }, { status: 400 });
    }

    return NextResponse.json({
      storyboard_urls: [],
      message: 'Preview generation placeholder',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
