/**
 * Generates PNG app icons for Google Play Store / PWA
 * Uses pure Node.js (no external deps) via zlib deflate
 */
import { createWriteStream, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT_DIR = '/home/runner/workspace/client/public/icons';

// Hyrise Crown brand color: #00539F (blue) with white "H" letter
const BG_R = 0x00, BG_G = 0x53, BG_B = 0x9F;

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function writeUint32BE(val) {
  return Buffer.from([(val >>> 24) & 0xFF, (val >>> 16) & 0xFF, (val >>> 8) & 0xFF, val & 0xFF]);
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = writeUint32BE(data.length);
  const crcData = Buffer.concat([typeBuf, data]);
  const crc = writeUint32Be(crc32(crcData));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function writeUint32Be(val) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(val, 0);
  return b;
}

function generatePNG(size) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const ihdrChunk = pngChunk('IHDR', ihdr);

  // Build raw image data (filter byte + RGB per row)
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      // Background color
      let r = BG_R, g = BG_G, b = BG_B;

      // Draw white circle padding (rounded look)
      const cx = size / 2, cy = size / 2, radius = size * 0.45;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Outside circle — still background (square icon is fine)
        r = BG_R; g = BG_G; b = BG_B;
      } else {
        // Inside — draw a white "H" letter
        const lx = x / size, ly = y / size;
        // Left bar of H: x 0.25-0.38
        const leftBar = lx >= 0.25 && lx <= 0.38 && ly >= 0.20 && ly <= 0.80;
        // Right bar of H: x 0.62-0.75
        const rightBar = lx >= 0.62 && lx <= 0.75 && ly >= 0.20 && ly <= 0.80;
        // Middle crossbar: y 0.45-0.55
        const crossbar = lx >= 0.25 && lx <= 0.75 && ly >= 0.45 && ly <= 0.55;

        if (leftBar || rightBar || crossbar) {
          r = 255; g = 255; b = 255; // white letter
        }
      }

      const offset = 1 + x * 3;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = deflateSync(rawData);
  const idatChunk = pngChunk('IDAT', compressed);
  const iendChunk = pngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const size of SIZES) {
  const png = generatePNG(size);
  const path = `${OUT_DIR}/icon-${size}x${size}.png`;
  createWriteStream(path).end(png);
  console.log(`✅ Generated ${path} (${png.length} bytes)`);
}

// Also generate screenshots placeholder (1080x1920)
const screenshotsDir = '/home/runner/workspace/client/public/screenshots';
mkdirSync(screenshotsDir, { recursive: true });
for (const name of ['home-screenshot', 'compare-screenshot']) {
  const png = generatePNG(512); // smaller for speed, PWABuilder rescales
  createWriteStream(`${screenshotsDir}/${name}.png`).end(png);
  console.log(`✅ Generated screenshot: ${name}.png`);
}

console.log('\n✅ All icons generated successfully!');
