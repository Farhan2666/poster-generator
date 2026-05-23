import { removeBackgroundFromImage, extractDominantColors } from '@/lib/image';
import { supabaseAdmin } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const TEMP_DIR = path.join(process.cwd(), 'tmp', 'processing');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'processed');

export class ImageProcessingService {
  async processProduct(productId: string): Promise<{
    processedImages: string[];
    colorPalette: string[];
  }> {
    if (!supabaseAdmin) {
      return this.processLocal(productId);
    }
    return this.processWithSupabase(productId);
  }

  private async processLocal(productId: string): Promise<{
    processedImages: string[];
    colorPalette: string[];
  }> {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    fs.mkdirSync(path.join(PUBLIC_DIR, productId), { recursive: true });

    // Try reading product from filesystem fallback
    let product: any = { images: [] };
    const productPath = path.join(TEMP_DIR, `${productId}.json`);

    // Create a dummy product if needed — images come from the request
    const productDataPath = path.join(process.cwd(), 'tmp', 'products', `${productId}.json`);
    if (fs.existsSync(productDataPath)) {
      product = JSON.parse(fs.readFileSync(productDataPath, 'utf-8'));
    }

    const processedImages: string[] = [];
    let allColors: string[] = [];

    for (const imageUrl of product.images || []) {
      const imgPath = await this.downloadImage(imageUrl);
      const outputName = `${crypto.randomUUID()}.png`;
      const outputPath = path.join(TEMP_DIR, outputName);

      await removeBackgroundFromImage(
        fs.readFileSync(imgPath),
        outputPath
      );

      const colors = await extractDominantColors(fs.readFileSync(outputPath));
      allColors = [...allColors, ...colors];

      // Copy to public so it's accessible via /processed/{productId}/{outputName}
      const publicPath = path.join(PUBLIC_DIR, productId, outputName);
      fs.copyFileSync(outputPath, publicPath);
      processedImages.push(`/processed/${productId}/${outputName}`);

      fs.unlinkSync(imgPath);
    }

    const uniqueColors = [...new Set(allColors)].slice(0, 5);

    // Save result metadata
    const meta = { processed_images: processedImages, color_palette: uniqueColors, image_status: 'done' as const };
    fs.writeFileSync(productDataPath, JSON.stringify({ ...product, ...meta }, null, 2));

    return { processedImages, colorPalette: uniqueColors };
  }

  private async processWithSupabase(productId: string): Promise<{
    processedImages: string[];
    colorPalette: string[];
  }> {
    const { data: product, error } = await supabaseAdmin!
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !product) throw new Error('Product not found');

    await supabaseAdmin!
      .from('products')
      .update({ image_status: 'processing' })
      .eq('id', productId);

    fs.mkdirSync(TEMP_DIR, { recursive: true });

    const processedImages: string[] = [];
    let allColors: string[] = [];

    try {
      for (const imageUrl of product.images || []) {
        const imgPath = await this.downloadImage(imageUrl);
        const outputName = `${crypto.randomUUID()}.png`;
        const outputPath = path.join(TEMP_DIR, outputName);

        await removeBackgroundFromImage(
          fs.readFileSync(imgPath),
          outputPath
        );

        const colors = await extractDominantColors(fs.readFileSync(outputPath));
        allColors = [...allColors, ...colors];

        const url = await this.uploadProcessed(productId, outputName, outputPath);
        processedImages.push(url);

        fs.unlinkSync(imgPath);
      }

      const uniqueColors = [...new Set(allColors)].slice(0, 5);

      await supabaseAdmin!
        .from('products')
        .update({
          processed_images: processedImages,
          color_palette: uniqueColors,
          image_status: 'done',
          status: 'ready',
        })
        .eq('id', productId);

      return { processedImages, colorPalette: uniqueColors };
    } catch (err) {
      await supabaseAdmin!
        .from('products')
        .update({ image_status: 'failed' })
        .eq('id', productId);
      throw err;
    }
  }

  private async downloadImage(url: string): Promise<string> {
    const ext = url.endsWith('.png') ? '.png' : '.jpg';
    const outputPath = path.join(TEMP_DIR, `download-${crypto.randomUUID()}${ext}`);

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  }

  private async uploadProcessed(
    productId: string,
    fileName: string,
    filePath: string
  ): Promise<string> {
    const buffer = fs.readFileSync(filePath);

    const { data } = await supabaseAdmin!.storage
      .from('product-images')
      .upload(`processed/${productId}/${fileName}`, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    const { data: publicUrl } = supabaseAdmin!.storage
      .from('product-images')
      .getPublicUrl(`processed/${productId}/${fileName}`);

    return publicUrl.publicUrl;
  }
}

export const imageProcessingService = new ImageProcessingService();
