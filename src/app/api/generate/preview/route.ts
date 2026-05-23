import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';

const TEMP_DIR = path.join(process.cwd(), 'tmp', 'previews');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'previews');

export async function POST(req: NextRequest) {
  try {
    const { productId, templateId, script } = await req.json();

    if (!script?.scenes?.length) {
      return NextResponse.json({ error: 'script with scenes required' }, { status: 400 });
    }

    fs.mkdirSync(TEMP_DIR, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const previewId = crypto.randomUUID();
    const urls: string[] = [];

    // Get product image
    let productImageUrl = '';
    if (productId) {
      const productsPath = path.join(process.cwd(), 'tmp', 'products.json');
      if (fs.existsSync(productsPath)) {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        const p = products.find((x: any) => x.id === productId);
        productImageUrl = p?.processed_images?.[0] || p?.images?.[0] || '';
      }
    }

    let productBuffer: Buffer | null = null;
    if (productImageUrl) {
      const imgPath = path.join(process.cwd(), 'public', productImageUrl);
      if (fs.existsSync(imgPath)) {
        productBuffer = fs.readFileSync(imgPath);
      } else if (productImageUrl.startsWith('http')) {
        try {
          const res = await fetch(productImageUrl);
          productBuffer = Buffer.from(await res.arrayBuffer());
        } catch { /* ignore */ }
      }
    }

    for (let i = 0; i < Math.min(script.scenes.length, 5); i++) {
      const scene = script.scenes[i];
      const outputName = `preview-${previewId}-scene-${i}.jpg`;
      const outputPath = path.join(OUTPUT_DIR, outputName);

      const w = 540;
      const h = 960;

      const composites: sharp.OverlayOptions[] = [];

      // Background gradient
      composites.push({
        input: Buffer.from(
          `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#1a1a2e"/><rect width="${w}" height="${h}" fill="url(#g)"/><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e91e6333"/><stop offset="100%" stop-color="#9c27b033"/></linearGradient></defs></svg>`
        ),
      });

      // Product image centered
      if (productBuffer) {
        const pm = await sharp(productBuffer).metadata();
        const scale = Math.min((w * 0.6) / (pm.width || w), (h * 0.35) / (pm.height || h));
        const pw = Math.round((pm.width || w) * scale);
        const ph = Math.round((pm.height || h) * scale);
        composites.push({
          input: await sharp(productBuffer).resize(pw, ph, { fit: 'inside' }).png().toBuffer(),
          top: Math.round(h * 0.15),
          left: Math.round((w - pw) / 2),
        });
      }

      // Scene info overlay
      const sub = scene.subtitle_text || '';
      composites.push({
        input: Buffer.from(
          `<svg width="${w}" height="${h}">
            <rect x="20" y="${h - 100}" width="${w - 40}" height="70" rx="12" fill="rgba(0,0,0,0.5)"/>
            <text x="${w / 2}" y="${h - 55}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="22">${sub.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
            <text x="30" y="40" fill="rgba(255,255,255,0.5)" font-family="sans-serif" font-size="14">Scene ${i + 1} - ${scene.time}</text>
          </svg>`
        ),
      });

      await sharp({ create: { width: w, height: h, channels: 3, background: { r: 26, g: 26, b: 46 } } })
        .composite(composites)
        .jpeg({ quality: 70 })
        .toFile(outputPath);

      urls.push(`/previews/${outputName}`);
    }

    return NextResponse.json({ storyboard_urls: urls, preview_id: previewId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
