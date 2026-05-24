import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { productId, templateId, images: reqImages } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    // Auto-fetch images from Supabase if not provided in request
    let images = reqImages;
    if (!images || images.length === 0) {
      if (supabaseAdmin) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('images, processed_images')
          .eq('id', productId)
          .single();

        if (product) {
          // Prefer processed images, fallback to originals
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

    const result = await aiService.generateFull(productId, templateId, images);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
