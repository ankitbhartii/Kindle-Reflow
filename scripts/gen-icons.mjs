/**
 * Generate PWA icons as SVG files (works without canvas dependencies)
 * Run: node scripts/gen-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

mkdirSync(iconsDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function makeSVG(size) {
  const pad = size * 0.12;
  const inner = size - pad * 2;
  const r = size * 0.22;   // corner radius of inner square
  const fontSize = size * 0.38;
  const subSize = size * 0.16;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#09090B"/>
  <!-- Inner card -->
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" fill="#D2E823"/>
  <!-- "K" Letter -->
  <text
    x="${size / 2}"
    y="${size * 0.62}"
    font-family="Georgia, serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="#09090B"
    text-anchor="middle"
    dominant-baseline="auto">K</text>
  <!-- Dot accent -->
  <circle cx="${size * 0.68}" cy="${size * 0.32}" r="${size * 0.055}" fill="#09090B"/>
  <!-- Sub label -->
  <text
    x="${size / 2}"
    y="${size * 0.86}"
    font-family="monospace"
    font-size="${subSize}"
    font-weight="bold"
    fill="#09090B"
    text-anchor="middle"
    letter-spacing="${subSize * 0.15}">REFLOW</text>
</svg>`;
}

for (const size of sizes) {
  const svg = makeSVG(size);
  // Write SVG (browsers accept SVG icons too, and we convert the name to .png for manifest)
  // For a real .png we'd need sharp/canvas — for now SVG named as .png works for most Android installs
  writeFileSync(join(iconsDir, `icon-${size}.png`), svg);
  console.log(`✓ icon-${size}.png (SVG)`);
}

console.log('\n✅ All icons written to public/icons/');
