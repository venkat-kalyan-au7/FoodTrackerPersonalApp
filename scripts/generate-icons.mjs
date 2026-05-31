import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(dir, "../apps/web/public");
mkdirSync(OUT, { recursive: true });

function iconSvg(size) {
  const r = Math.round(size * 0.22);
  const fs = Math.round(size * 0.38);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/></linearGradient></defs><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/><text x="${size/2}" y="${Math.round(size*0.615)}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${fs}" fill="white" text-anchor="middle">CT</text></svg>`;
}

function maskableSvg(size) {
  const fs = Math.round(size * 0.32);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#g)"/><text x="${size/2}" y="${Math.round(size*0.585)}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${fs}" fill="white" text-anchor="middle">CT</text></svg>`;
}

function toPng(svgStr, size) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: "width", value: size } });
  return resvg.render().asPng();
}

const icons = [
  { file: "pwa-64x64.png",                size: 64,  fn: iconSvg },
  { file: "pwa-192x192.png",              size: 192, fn: iconSvg },
  { file: "pwa-512x512.png",              size: 512, fn: iconSvg },
  { file: "maskable-icon-512x512.png",    size: 512, fn: maskableSvg },
  { file: "apple-touch-icon-180x180.png", size: 180, fn: iconSvg },
];

for (const { file, size, fn } of icons) {
  const buf = toPng(fn(size), size);
  writeFileSync(join(OUT, file), buf);
  console.log(`✓ ${file} (${(buf.length/1024).toFixed(1)} KB)`);
}

writeFileSync(join(OUT, "favicon.svg"), iconSvg(100));
console.log("✓ favicon.svg");
