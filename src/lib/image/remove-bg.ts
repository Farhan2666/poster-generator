import { removeBackground } from '@imgly/background-removal';
import sharp from 'sharp';

export async function removeBackgroundFromImage(
  imageBuffer: Buffer,
  outputPath: string
): Promise<Buffer> {
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });

  const result = await removeBackground(blob, {
    model: 'isnet_quint8',
    output: { format: 'image/png' },
  });

  const buffer = Buffer.from(await result.arrayBuffer());

  await sharp(buffer).png().toFile(outputPath);

  return buffer;
}
