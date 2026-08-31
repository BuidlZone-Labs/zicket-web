import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const imagesToOptimize = [
  { input: 'public/Herosection.png', output: 'public/Herosection.webp', quality: 85 },
  { input: 'public/images/hero-img.png', output: 'public/images/hero-img.webp', quality: 80 },
  { input: 'public/images/bg.png', output: 'public/images/bg.webp', quality: 80 },
  { input: 'public/images/suya.png', output: 'public/images/suya.webp', quality: 80 },
  { input: 'public/images/solana-summar.png', output: 'public/images/solana-summar.webp', quality: 80 },
  { input: 'public/images/discover.png', output: 'public/images/discover.webp', quality: 85 },
  { input: 'public/images/mask.png', output: 'public/images/mask.webp', quality: 85 },
  { input: 'public/images/wallet.png', output: 'public/images/wallet.webp', quality: 85 },
  { input: 'public/images/News1.jpg', output: 'public/images/News1.webp', quality: 80 },
  { input: 'public/images/News2.jpg', output: 'public/images/News2.webp', quality: 80 },
  { input: 'public/images/News-3.jpg', output: 'public/images/News-3.webp', quality: 80 },
  { input: 'public/images/avatar1.jpg', output: 'public/images/avatar1.webp', quality: 80 },
  { input: 'public/images/avatar2.jpg', output: 'public/images/avatar2.webp', quality: 80 },
  { input: 'public/images/avatar3.jpg', output: 'public/images/avatar3.webp', quality: 80 },
];

// Add explore images (1.png through 14.png)
for (let i = 1; i <= 14; i++) {
  imagesToOptimize.push({
    input: `public/images/explore/${i}.png`,
    output: `public/images/explore/${i}.webp`,
    quality: 80,
  });
}

async function run() {
  console.log('Starting image optimization...');
  const results = [];

  for (const item of imagesToOptimize) {
    const inputPath = path.join(rootDir, item.input);
    const outputPath = path.join(rootDir, item.output);

    if (!fs.existsSync(inputPath)) {
      console.warn(`File not found: ${item.input}`);
      continue;
    }

    const inputStats = fs.statSync(inputPath);
    await sharp(inputPath)
      .webp({ quality: item.quality })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    results.push({
      file: item.input,
      originalSize: (inputStats.size / 1024).toFixed(1) + ' KB',
      optimizedSize: (outputStats.size / 1024).toFixed(1) + ' KB',
      reduction: `${reduction}%`,
    });

    console.log(`Optimized ${item.input}: ${inputStats.size} B -> ${outputStats.size} B (${reduction}% reduction)`);
  }

  console.table(results);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
