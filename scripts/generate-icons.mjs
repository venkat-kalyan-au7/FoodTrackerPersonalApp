/**
 * Generates PWA icons (192x192, 512x512, 180x180) as valid PNG files
 * using only Node.js built-ins (zlib). No external dependencies.
 * Icon: green rounded-square with "CT" text in white.
 */
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../apps/web/public");
mkdirSync(OUT, { recursive: true });

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function makePng(size, rgbaFn) {
  // Build raw pixel data: each row = filter byte (0) + RGBA per pixel
  const rowBytes = 1 + size * 4;
  const raw = Buffer.alloc(size * rowBytes);
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = rgbaFn(x, y, size);
      const off = y * rowBytes + 1 + x * 4;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const compressed = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ─── pixel function ───────────────────────────────────────────────────────────
// Renders: dark-green rounded square background + "CT" glyphs in white
// We embed a tiny bitmap font for C and T (5×7 pixels per glyph)

const GLYPHS = {
  C: [
    0b01110,
    0b10001,
    0b10000,
    0b10000,
    0b10000,
    0b10001,
    0b01110,
  ],
  T: [
    0b11111,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
  ],
};

function renderIcon(x, y, size) {
  const pad = size * 0.12;
  const r   = size * 0.22; // corner radius

  // Is inside rounded rect?
  const cx = x - size / 2 + 0.5;
  const cy = y - size / 2 + 0.5;
  const rx = size / 2 - pad;
  const ry = size / 2 - pad;
  const qx = Math.max(0, Math.abs(cx) - rx + r);
  const qy = Math.max(0, Math.abs(cy) - ry + r);
  const inside = (qx * qx + qy * qy) <= r * r;

  if (!inside) return [0, 0, 0, 0]; // transparent

  // Green background (linear gradient approximation)
  const t = y / size;
  const bg_r = Math.round(22  + t * 4);
  const bg_g = Math.round(163 - t * 20);
  const bg_b = Math.round(74  - t * 10);

  // Glyph rendering — scale bitmap glyphs to fit
  const glyphW = 5, glyphH = 7;
  const gap    = Math.round(size * 0.04);
  const scale  = Math.round(size / 22);
  const totalW = glyphW * scale * 2 + gap;
  const startX = Math.round((size - totalW) / 2);
  const startY = Math.round((size - glyphH * scale) / 2);

  const glyphPixel = (gx, gy, glyph) => {
    const col = Math.floor(gx / scale);
    const row = Math.floor(gy / scale);
    if (row < 0 || row >= glyphH || col < 0 || col >= glyphW) return false;
    return (glyph[row] >> (glyphW - 1 - col)) & 1;
  };

  const lx = x - startX;
  const ly = y - startY;

  const inC = lx >= 0 && lx < glyphW * scale && ly >= 0 && ly < glyphH * scale;
  const inT = lx >= glyphW * scale + gap && lx < totalW && ly >= 0 && ly < glyphH * scale;

  if (inC && glyphPixel(lx, ly, GLYPHS.C)) return [255, 255, 255, 255];
  if (inT && glyphPixel(lx - glyphW * scale - gap, ly, GLYPHS.T)) return [255, 255, 255, 255];

  return [bg_r, bg_g, bg_b, 255];
}

for (const size of [192, 512, 180]) {
  const buf = makePng(size, renderIcon);
  const name = size === 180 ? "apple-touch-icon.png" : `pwa-${size}x${size}.png`;
  writeFileSync(join(OUT, name), buf);
  console.log(`✓ ${name} (${buf.length} bytes)`);
}

// Also write a minimal favicon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#16a34a"/>
  <text x="50" y="62" font-family="sans-serif" font-weight="bold" font-size="42" fill="white" text-anchor="middle">CT</text>
</svg>`;
writeFileSync(join(OUT, "favicon.svg"), svg);
console.log("✓ favicon.svg");
console.log("\nAll PWA assets generated in apps/web/public/");
