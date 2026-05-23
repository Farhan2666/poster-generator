import { NextRequest, NextResponse } from 'next/server';
import { renderService } from '@/services/render.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const status = await renderService.getStatus(id);

  if (!status) {
    return NextResponse.json({
      video_id: id,
      status: 'unknown',
      progress: 0,
    });
  }

  return NextResponse.json({
    video_id: id,
    ...status,
  });
}
