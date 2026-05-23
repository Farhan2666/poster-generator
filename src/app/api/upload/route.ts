import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const name = `${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
      urls.push(`/uploads/${name}`);
    }

    return NextResponse.json({ urls });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
