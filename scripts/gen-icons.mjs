/**
 * Generates real binary PNG icons for the PWA manifest.
 * No external dependencies — uses Node.js built-in `zlib` for deflate.
 *
 * Design:
 *   • Outer background : #09090B  (ink black)
 *   • Rounded inner square : #D2E823  (acid yellow)
 *   • Center "K" glyph drawn pixel-by-pixel (5×7 bitmap font)
 *
 * Run: node scripts/gen-icons.mjs
 */

import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf  = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf   = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ── PNG builder ────────────────────────────────────────────────────────────
function makePNG(pixels, width, height) {
  // pixels: Uint8Array of RGBA (4 bytes per pixel, row-major)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA

  // Raw (unfiltered) scanlines: prepend 0x00 filter byte per row
  const rawRows = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawRows[y * (1 + width * 4)] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      rawRows[dst]     = pixels[src];
      rawRows[dst + 1] = pixels[src + 1];
      rawRows[dst + 2] = pixels[src + 2];
      rawRows[dst + 3] = pixels[src + 3];
    }
  }

  const idat = deflateSync(rawRows, { level: 9 });

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ── Icon renderer ──────────────────────────────────────────────────────────
// 5×7 bitmap for "K" (columns 0‥4, rows 0‥6)
const K_BITMAP = [
  [1,0,0,0,1],
  [1,0,0,1,0],
  [1,0,1,0,0],
  [1,1,0,0,0],
  [1,0,1,0,0],
  [1,0,0,1,0],
  [1,0,0,0,1],
];

function renderIcon(size) {
  const pixels = new Uint8Array(size * size * 4);

  const setBG  = [0x09, 0x09, 0x0B, 0xFF]; // #09090B
  const setAcid= [0xD2, 0xE8, 0x23, 0xFF]; // #D2E823
  const setInk = [0x09, 0x09, 0x0B, 0xFF]; // #09090B

  // Fill all with ink background
  for (let i = 0; i < size * size; i++) {
    pixels.set(setBG, i * 4);
  }

  // Draw a rounded-rect acid panel occupying 72% of the icon
  const pad   = Math.round(size * 0.14);
  const inner = size - pad * 2;
  const r     = Math.round(inner * 0.22); // corner radius

  for (let y = pad; y < pad + inner; y++) {
    for (let x = pad; x < pad + inner; x++) {
      const lx = x - pad, ly = y - pad;
      // Rounded corners: check if pixel is inside rounded rect
      let inside = true;
      if (lx < r && ly < r && (lx - r) ** 2 + (ly - r) ** 2 > r * r) inside = false;
      if (lx > inner - r - 1 && ly < r && (lx - (inner - r - 1)) ** 2 + (ly - r) ** 2 > r * r) inside = false;
      if (lx < r && ly > inner - r - 1 && (lx - r) ** 2 + (ly - (inner - r - 1)) ** 2 > r * r) inside = false;
      if (lx > inner - r - 1 && ly > inner - r - 1 && (lx - (inner - r - 1)) ** 2 + (ly - (inner - r - 1)) ** 2 > r * r) inside = false;

      if (inside) pixels.set(setAcid, (y * size + x) * 4);
    }
  }

  // Draw "K" glyph in the centre of the acid panel
  const glyphW   = 5;
  const glyphH   = 7;
  const cellSize = Math.max(1, Math.round(inner * 0.076)); // scale with icon
  const totalGW  = glyphW * cellSize;
  const totalGH  = glyphH * cellSize;
  const gx0      = pad + Math.round((inner - totalGW) / 2);
  const gy0      = pad + Math.round((inner - totalGH) / 2);

  for (let row = 0; row < glyphH; row++) {
    for (let col = 0; col < glyphW; col++) {
      if (!K_BITMAP[row][col]) continue;
      const px0 = gx0 + col * cellSize;
      const py0 = gy0 + row * cellSize;
      for (let dy = 0; dy < cellSize; dy++) {
        for (let dx = 0; dx < cellSize; dx++) {
          const px = px0 + dx, py = py0 + dy;
          if (px >= 0 && px < size && py >= 0 && py < size) {
            pixels.set(setInk, (py * size + px) * 4);
          }
        }
      }
    }
  }

  // Small acid dot accent (top-right of glyph area)
  const dotR  = Math.max(2, Math.round(inner * 0.055));
  const dotCx = gx0 + Math.round(totalGW * 0.82);
  const dotCy = gy0 - Math.round(dotR * 1.5);
  for (let dy = -dotR; dy <= dotR; dy++) {
    for (let dx = -dotR; dx <= dotR; dx++) {
      if (dx * dx + dy * dy <= dotR * dotR) {
        const px = dotCx + dx, py = dotCy + dy;
        if (px >= 0 && px < size && py >= 0 && py < size) {
          pixels.set(setInk, (py * size + px) * 4);
        }
      }
    }
  }

  return makePNG(pixels, size, size);
}

// ── Generate all sizes ─────────────────────────────────────────────────────
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of SIZES) {
  const buf = renderIcon(size);
  const path = join(iconsDir, `icon-${size}.png`);
  writeFileSync(path, buf);
  console.log(`✓ icon-${size}.png  (${buf.length} bytes, valid PNG)`);
}

console.log('\n✅ All icons written to public/icons/ — real binary PNG files.');
