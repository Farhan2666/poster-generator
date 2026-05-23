import sharp from 'sharp';

interface DominantColor {
  hex: string;
  percentage: number;
}

export async function extractDominantColors(
  imageBuffer: Buffer,
  colorCount: number = 5
): Promise<string[]> {
  const { data, info } = await sharp(imageBuffer)
    .resize(100, 100, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: number[][] = [];
  for (let i = 0; i < data.length; i += 3) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  const clusters = kMeans(pixels, colorCount);

  const colors: DominantColor[] = clusters.map(cluster => ({
    hex: rgbToHex(cluster.center[0], cluster.center[1], cluster.center[2]),
    percentage: cluster.pixels.length / pixels.length,
  }));

  colors.sort((a, b) => b.percentage - a.percentage);

  return colors.map(c => c.hex);
}

function kMeans(pixels: number[][], k: number, maxIterations = 10): {
  center: number[];
  pixels: number[][];
}[] {
  const dim = 3;

  // Initialize centroids randomly from data points
  let centroids: number[][] = [];
  const usedIndices = new Set<number>();
  for (let i = 0; i < k; i++) {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * pixels.length);
    } while (usedIndices.has(idx));
    usedIndices.add(idx);
    centroids.push([...pixels[idx]]);
  }

  const clusters: Map<number, number[][]> = new Map();
  for (let iter = 0; iter < maxIterations; iter++) {
    clusters.clear();
    for (let i = 0; i < k; i++) clusters.set(i, []);

    // Assign each pixel to nearest centroid
    for (const pixel of pixels) {
      let minDist = Infinity;
      let nearest = 0;
      for (let i = 0; i < k; i++) {
        const dist = euclideanDistance(pixel, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
      clusters.get(nearest)!.push(pixel);
    }

    // Recalculate centroids
    let changed = false;
    for (let i = 0; i < k; i++) {
      const clusterPixels = clusters.get(i)!;
      if (clusterPixels.length === 0) continue;

      const newCenter = new Array(dim).fill(0);
      for (const pixel of clusterPixels) {
        for (let d = 0; d < dim; d++) newCenter[d] += pixel[d];
      }
      for (let d = 0; d < dim; d++) newCenter[d] /= clusterPixels.length;

      if (euclideanDistance(newCenter, centroids[i]) > 0.5) changed = true;
      centroids[i] = newCenter;
    }

    if (!changed) break;
  }

  return Array.from(clusters.entries()).map(([i, pixelList]) => ({
    center: centroids[i],
    pixels: pixelList,
  }));
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
