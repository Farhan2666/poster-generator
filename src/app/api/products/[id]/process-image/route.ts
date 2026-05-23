import { NextRequest, NextResponse } from 'next/server';
import { imageProcessingService } from '@/services/image-processing.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await imageProcessingService.processProduct(id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
