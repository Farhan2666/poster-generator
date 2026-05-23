import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { Scene } from '@/types/video';

const TEMP_DIR = path.join(process.cwd(), 'tmp', 'render');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'renders');

const TEMPLATE_BG_COLORS: Record<string, string[][]> = {
  'coquette-pink-room': [['#fce4ec', '#f8bbd0', '#f48fb1'], ['#ffffff', '#fce4ec', '#f8bbd0']],
  'minimal-korea-room': [['#f5f5f5', '#e0e0e0', '#bdbdbd'], ['#ffffff', '#f5f5f5', '#eeeeee']],
  'pinterest-bedroom': [['#fff3e0', '#ffe0b2', '#ffcc80'], ['#ffffff', '#fff3e0', '#ffe0b2']],
  'study-desk-aesthetic': [['#efebe9', '#d7ccc8', '#bcaaa4'], ['#ffffff', '#efebe9', '#d7ccc8']],
  'warm-bedroom': [['#fff8e1', '#ffecb3', '#ffe082'], ['#ffffff', '#fff8e1', '#ffecb3']],
};

export class RenderEngineService {
  async renderVideo(params: {
    productImageUrl: string;
    templateId: string;
    scenes: Scene[];
    hook: string;
    cta: string;
    variation: string;
  }): Promise<{ outputUrl: string; frameCount: number; totalDurationSec: number }> {
    const renderId = crypto.randomUUID();
    const renderDir = path.join(TEMP_DIR, renderId);
    const frameDir = path.join(renderDir, 'frames');
    const videoPath = path.join(OUTPUT_DIR, `${renderId}.mp4`);
    const storyboardPath = path.join(OUTPUT_DIR, `${renderId}-storyboard.jpg`);

    fs.mkdirSync(frameDir, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Download product image
    const productImgPath = path.join(renderDir, 'product.png');
    const res = await fetch(params.productImageUrl);
    if (!res.ok) throw new Error(`Failed to fetch product image: ${res.status}`);
    fs.writeFileSync(productImgPath, Buffer.from(await res.arrayBuffer()));

    // Get processed product (with transparency already removed bg hopefully)
    const productBuffer = fs.readFileSync(productImgPath);

    // Generate a scene intro frame (hook frame)
    const bgColors = TEMPLATE_BG_COLORS[params.templateId] || TEMPLATE_BG_COLORS['coquette-pink-room'];
    const fps = 24;

    const frames: string[] = [];

    // Hook frame (3 seconds)
    const hookFramePath = path.join(frameDir, 'frame-0000.png');
    await this.generateTextFrame(hookFramePath, params.hook, bgColors[0], params.variation);
    for (let i = 0; i < fps * 3; i++) {
      const p = path.join(frameDir, `frame-${String(i).padStart(6, '0')}.png`);
      fs.copyFileSync(hookFramePath, p);
      frames.push(p);
    }

    // Scene frames
    let frameIdx = fps * 3;
    for (const scene of params.scenes) {
      const durationFrames = Math.max(fps, Math.round((scene.duration_seconds || 3) * fps));
      const sceneFramePath = path.join(frameDir, `scene-${frameIdx}.png`);
      await this.generateSceneFrame(sceneFramePath, productBuffer, scene, bgColors[frameIdx % bgColors.length]);
      for (let i = 0; i < durationFrames; i++) {
        const p = path.join(frameDir, `frame-${String(frameIdx).padStart(6, '0')}.png`);
        fs.copyFileSync(sceneFramePath, p);
        frames.push(p);
        frameIdx++;
      }
    }

    // CTA frame (3 seconds)
    const ctaFramePath = path.join(frameDir, `cta-${frameIdx}.png`);
    await this.generateTextFrame(ctaFramePath, params.cta, bgColors[bgColors.length - 1], 'cta');
    for (let i = 0; i < fps * 3; i++) {
      const p = path.join(frameDir, `frame-${String(frameIdx).padStart(6, '0')}.png`);
      fs.copyFileSync(ctaFramePath, p);
      frames.push(p);
      frameIdx++;
    }

    // Generate storyboard (first frame of each scene)
    const storyboardImages = [hookFramePath];
    for (const scene of params.scenes) {
      const sceneIdx = params.scenes.indexOf(scene);
      storyboardImages.push(path.join(frameDir, `scene-${fps * 3 + sceneIdx * fps}.png`));
    }
    storyboardImages.push(ctaFramePath);

    await this.compositeStoryboard(storyboardImages, storyboardPath);

    // Try FFmpeg for video
    const totalFrames = frames.length;
    let videoUrl = '';

    try {
      execSync(
        `ffmpeg -y -framerate ${fps} -i "${path.join(frameDir, 'frame-%06d.png')}" -c:v libx264 -pix_fmt yuv420p -preset fast "${videoPath}" 2>&1`,
        { timeout: 60000, stdio: 'pipe' }
      );
      videoUrl = `/renders/${renderId}.mp4`;
    } catch {
      // FFmpeg not available — output as image sequence via storyboard
      videoUrl = `/renders/${renderId}-storyboard.jpg`;
    }

    // Cleanup temp frames
    fs.rmSync(renderDir, { recursive: true, force: true });

    const totalSec = Math.round(totalFrames / fps);

    return {
      outputUrl: videoUrl,
      frameCount: totalFrames,
      totalDurationSec: totalSec,
    };
  }

  private async generateTextFrame(
    outputPath: string,
    text: string,
    colors: string[],
    label: string
  ): Promise<void> {
    const w = 1080;
    const h = 1920;

    const svgText = await this.buildTextOverlay(text, w, h, label);

    await sharp({
      create: { width: w, height: h, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .composite([
        { input: this.generateGradient(w, h, colors), blend: 'over' },
        { input: Buffer.from(svgText), top: 0, left: 0 },
      ])
      .png()
      .toFile(outputPath);
  }

  private async generateSceneFrame(
    outputPath: string,
    productBuffer: Buffer,
    scene: Scene,
    colors: string[]
  ): Promise<void> {
    const w = 1080;
    const h = 1920;

    // Scale product to fit within 80% of width, centered
    const productMaxW = Math.round(w * 0.75);
    const productImg = sharp(productBuffer);
    const productMeta = await productImg.metadata();
    const scale = Math.min(productMaxW / (productMeta.width || w), (h * 0.4) / (productMeta.height || h));
    const pW = Math.round((productMeta.width || w) * scale);
    const pH = Math.round((productMeta.height || h) * scale);

    const resizedProduct = await sharp(productBuffer).resize(pW, pH, { fit: 'inside' }).png().toBuffer();

    // Product centered slightly above middle
    const productX = Math.round((w - pW) / 2);
    const productY = Math.round(h * 0.25);

    // Subtitle bar at bottom
    const subtitleSvg = await this.buildSubtitleOverlay(scene.subtitle_text, w);

    await sharp({
      create: { width: w, height: h, channels: 3, background: { r: 20, g: 20, b: 30 } },
    })
      .composite([
        { input: this.generateGradient(w, h, colors), blend: 'over' },
        { input: resizedProduct, top: productY, left: productX },
        { input: Buffer.from(subtitleSvg), top: 0, left: 0 },
      ])
      .png()
      .toFile(outputPath);
  }

  private generateGradient(w: number, h: number, colors: string[]): Buffer {
    const stops = colors.map((c, i) => {
      const p = Math.round((i / (colors.length - 1)) * 100);
      return `<stop offset="${p}%" stop-color="${c}" stop-opacity="0.15"/>`;
    }).join('');

    const svg = `<svg width="${w}" height="${h}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          ${stops}
        </linearGradient>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.3)"/>
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg)"/>
      <rect width="${w}" height="${h}" fill="url(#vignette)"/>
    </svg>`;

    return Buffer.from(svg);
  }

  private async buildTextOverlay(text: string, w: number, h: number, label: string): Promise<string> {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const test = currentLine ? currentLine + ' ' + word : word;
      if (test.length > 25) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 80;
    const totalTextH = lines.length * lineHeight;
    const startY = Math.round((h - totalTextH) / 2);

    const textSpans = lines.map((line, i) =>
      `<tspan x="${w / 2}" dy="${i === 0 ? 0 : lineHeight}">${this.escapeXml(line)}</tspan>`
    ).join('');

    return `<svg width="${w}" height="${h}">
      <rect x="0" y="${startY - 40}" width="${w}" height="${totalTextH + 80}" fill="rgba(0,0,0,0.4)" rx="20"/>
      <text x="${w / 2}" y="${startY + 60}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="52" font-weight="bold" letter-spacing="2">
        ${textSpans}
      </text>
    </svg>`;
  }

  private async buildSubtitleOverlay(text: string, w: number): Promise<string> {
    if (!text) return '<svg width="0" height="0"></svg>';
    const h = 120;
    const y = 1920 - h - 40;

    return `<svg width="${w}" height="1920">
      <rect x="40" y="${y}" width="${w - 80}" height="${h}" fill="rgba(0,0,0,0.5)" rx="16"/>
      <text x="${w / 2}" y="${y + h / 2 + 10}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="36" font-weight="500">
        ${this.escapeXml(text)}
      </text>
    </svg>`;
  }

  private async compositeStoryboard(frames: string[], outputPath: string): Promise<void> {
    const cols = 3;
    const rows = Math.ceil(frames.length / cols);
    const thumbW = 360;
    const thumbH = 640;
    const gap = 10;
    const totalW = cols * thumbW + (cols - 1) * gap;
    const totalH = rows * thumbH + (rows - 1) * gap;

    const composites = await Promise.all(frames.map(async (fp, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        input: await sharp(fp).resize(thumbW, thumbH, { fit: 'cover' }).png().toBuffer(),
        top: row * (thumbH + gap),
        left: col * (thumbW + gap),
      };
    }));

    await sharp({
      create: { width: totalW, height: totalH, channels: 3, background: { r: 10, g: 10, b: 20 } },
    })
      .composite(composites)
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

export const renderEngineService = new RenderEngineService();
