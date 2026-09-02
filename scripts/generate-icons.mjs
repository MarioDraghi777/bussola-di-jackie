// Genera le icone PWA (192, 512, maskable-512) disegnando un semplice pin
// a pixel, senza librerie grafiche pesanti o servizi online: solo pngjs,
// puro JS, zero dipendenze native. Il colore di sfondo è pieno fino al
// bordo (richiesto per le icone maskable) e il glifo sta dentro la "safe
// zone" all'80% di raggio dal centro.
import { PNG } from 'pngjs';
import { mkdirSync, createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');
mkdirSync(OUT_DIR, { recursive: true });

const BACKGROUND = { r: 0x2a, g: 0x78, b: 0xd6 }; // blu del brand (--fam-1)
const GLYPH = { r: 0xff, g: 0xff, b: 0xff };

function pointInCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function sign(ax, ay, bx, by, cx, cy) {
  return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = sign(px, py, ax, ay, bx, by);
  const d2 = sign(px, py, bx, by, cx, cy);
  const d3 = sign(px, py, cx, cy, ax, ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function generateIcon(size, { maskable }) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;

  // La testa del pin sta un po' sopra il centro per lasciare spazio alla punta.
  const headCy = size * 0.42;
  const headR = size * (maskable ? 0.16 : 0.19);
  const holeR = headR * 0.42;

  const tipY = size * (maskable ? 0.72 : 0.82);
  const baseY = headCy + headR * 0.7;
  const baseHalfWidth = headR * 0.62;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      const inHead = pointInCircle(x, y, cx, headCy, headR);
      const inHole = pointInCircle(x, y, cx, headCy, holeR);
      const inTip = pointInTriangle(x, y, cx - baseHalfWidth, baseY, cx + baseHalfWidth, baseY, cx, tipY);

      const isGlyph = (inHead && !inHole) || inTip;
      const color = isGlyph ? GLYPH : BACKGROUND;

      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = 255; // sempre opaco: richiesto per maskable e per apple-touch-icon
    }
  }

  return png;
}

function writePng(png, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUT_DIR, filename);
    const stream = createWriteStream(filePath);
    png.pack().pipe(stream);
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

const targets = [
  { size: 192, filename: 'icon-192.png', maskable: false },
  { size: 512, filename: 'icon-512.png', maskable: false },
  { size: 512, filename: 'icon-maskable-512.png', maskable: true },
];

for (const t of targets) {
  const png = generateIcon(t.size, { maskable: t.maskable });
  const filePath = await writePng(png, t.filename);
  console.log('generata', filePath);
}
