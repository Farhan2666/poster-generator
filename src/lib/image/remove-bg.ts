import sharp from 'sharp';

/**
 * Standardize image for video processing — resize, optimize, no background removal.
 * Free, lightweight, works on Vercel serverless.
 */
export async function removeBackgroundFromImage(
  imageBuffer: Buffer,
  outputPath: string
): Promise<Buffer> {
  // Standardize: resize to max 1080px, convert to PNG, optimize
  const buffer = await sharp(imageBuffer)
    .resize(1080, 1920, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({ quality: 90 })
    .toBuffer();

  await sharp(buffer).png().toFile(outputPath);

  return buffer;
}
