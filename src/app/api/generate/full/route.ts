import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { createClient } from '@/lib/supabase/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { productId, templateId, images: reqImages } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    // --- Get authenticated user's API key ---
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Kamu harus login dulu' }, { status: 401 });
    }

    // Fetch per-user Gemini API key from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('gemini_api_key')
      .eq('id', user.id)
      .single();

    const userApiKey = profile?.gemini_api_key;

    if (!userApiKey) {
      return NextResponse.json(
        { error: 'Belum ada Gemini API key. Set di halaman Pengaturan > API Keys AI' },
        { status: 400 }
      );
    }
    // ---

    // Auto-fetch images from Supabase if not provided in request
    let images = reqImages;
    if (!images || images.length === 0) {
      const supabaseAdmin = (await import('@/lib/supabase')).supabaseAdmin;
      if (supabaseAdmin) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('images, processed_images')
          .eq('id', productId)
          .single();

        if (product) {
          images = product.processed_images?.length > 0
            ? product.processed_images
            : product.images;
        }
      }

      if (!images || images.length === 0) {
        return NextResponse.json(
          { error: 'Tidak ada gambar produk — upload foto dulu atau process images' },
          { status: 400 }
        );
      }
    }

    const result = await aiService.generateFull(productId, templateId, images, userApiKey);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
