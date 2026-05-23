import { describe, it, expect } from 'vitest';
import sharp from 'sharp';

describe('extractDominantColors', () => {
  it('returns hex color strings from an image', async () => {
    const buffer = await sharp({
      create: { width: 10, height: 10, channels: 3, background: { r: 255, g: 0, b: 0 } },
    }).png().toBuffer();

    const { extractDominantColors } = await import('./color-extract');
    const colors = await extractDominantColors(buffer, 1);

    expect(colors).toHaveLength(1);
    expect(colors[0]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns up to requested color count', async () => {
    const buffer = await sharp({
      create: { width: 20, height: 20, channels: 3, background: { r: 100, g: 150, b: 200 } },
    }).png().toBuffer();

    const { extractDominantColors } = await import('./color-extract');
    const colors = await extractDominantColors(buffer, 3);

    expect(colors.length).toBeLessThanOrEqual(3);
    colors.forEach(c => expect(c).toMatch(/^#[0-9a-f]{6}$/));
  });
});
