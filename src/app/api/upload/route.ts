import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const isVercel = !!process.env.VERCEL;
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Simpan file upload — otomatis pilih storage yang tepat:
 * - Vercel + Supabase key tersedia → Supabase Storage
 * - Lokal (dev) → filesystem public/uploads/
 * - Vercel tanpa Supabase → /tmp/ (ephemeral, hanya sesi ini)
 */
async function saveFile(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  // Priority 1: Supabase Storage (untuk Vercel/production)
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(`uploads/${filename}`, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn('[upload] Supabase storage error, fallback ke local:', error.message);
    } else {
      const { data: publicUrl } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(`uploads/${filename}`);
      return publicUrl.publicUrl; // Full URL, bisa langsung dipake
    }
  }

  // Priority 2: Local filesystem (dev)
  try {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, filename), buffer);
    return `/uploads/${filename}`;
  } catch (err: any) {
    console.warn('[upload] Local filesystem error:', err.message);
  }

  // Priority 3: /tmp/ (Vercel fallback — ephemeral)
  try {
    const tmpDir = '/tmp/uploads';
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, filename), buffer);
    return `/tmp/uploads/${filename}`;
  } catch (err: any) {
    throw new Error(`Gagal menyimpan file: ${err.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const name = `${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await saveFile(name, buffer, file.type || `image/${ext}`);
      urls.push(url);
    }

    return NextResponse.json({ urls });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
