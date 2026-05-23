import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({
      videosToday: 0,
      totalVideos: 0,
      totalProducts: 0,
      totalTemplates: 5,
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [videosToday, totalVideos, totalProducts] = await Promise.all([
    supabaseAdmin
      .from('videos')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabaseAdmin
      .from('videos')
      .select('id', { count: 'exact', head: true }),
    supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'archived'),
  ]);

  return NextResponse.json({
    videosToday: videosToday.count ?? 0,
    totalVideos: totalVideos.count ?? 0,
    totalProducts: totalProducts.count ?? 0,
    totalTemplates: 5,
  });
}
