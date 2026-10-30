/**
 * Builds every size of the FINDDOME logo from the one supplied master
 * (src/assets/brand/finddome-logo-source.png, a flat image on white).
 *
 * 1. "Colour to alpha": the white background becomes transparency, edge pixels
 *    keep their true colour (no white halo on the cream page), and the glass of
 *    the lens turns faintly translucent, so the logo sits on cream, white or navy.
 * 2. Trimmed to its content, then written as:
 *      src/assets/brand/finddome-logo.png        1400 px wide master used by <Image>
 *      src/assets/brand/finddome-logo-light.png  wordmark recoloured cream, for navy
 *      src/assets/brand/finddome-mark.png        the lens only (square, transparent)
 *      public/brand/*  and public/favicon*, apple-touch-icon, icons for the manifest
 *
 * Run: node scripts/build-brand.mjs
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const at = (...p) => path.join(root, ...p);
const SOURCE = at('src/assets/brand/finddome-logo-source.png');

/** Cream used in the site's dark areas (tokens.css --cream). */
const CREAM = [244, 244, 242];

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const out = Buffer.alloc(data.length);
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  // Alpha from the darkest channel: white -> 0, any saturated colour -> opaque.
  const a = Math.min(1, Math.max((255 - r) / 255, (255 - g) / 255, (255 - b) / 255) * 1.0);
  if (a < 0.004) { out[i + 3] = 0; continue; }
  // Un-premultiply against white.
  out[i] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - a)) / a)));
  out[i + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - a)) / a)));
  out[i + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - a)) / a)));
  out[i + 3] = Math.round(a * 255);
}
const raw = { raw: { width: W, height: H, channels: 4 } };
const full = sharp(out, raw);
const trimmed = await full.trim({ threshold: 2 }).png().toBuffer({ resolveWithObject: true });
const T = trimmed.info;
console.log('trimmed', T.width, T.height);

await fs.mkdir(at('public/brand'), { recursive: true });

// Master used by <Image>: 1400 wide covers a 2x display of a 700 px logo.
const master = await sharp(trimmed.data).resize({ width: 1400 }).png({ compressionLevel: 9 }).toBuffer();
await fs.writeFile(at('src/assets/brand/finddome-logo.png'), master);
for (const w of [200, 400]) {
  await sharp(trimmed.data).resize({ width: w }).png({ compressionLevel: 9 }).toFile(at(`public/brand/finddome-logo-${w}.png`));
}

// The wordmark is the blue lettering under the lens. Measured on the 1592 x 988 source:
// the lens is an ellipse (centre 710,382; radii 420,360), the handle ends about y 775
// where ".com" begins, the lettering starts near y 700. A pixel is lettering when it
// is blue, below y 700, outside the lens interior and not part of the handle.
const offX = trimmed.info.trimOffsetLeft ? -trimmed.info.trimOffsetLeft : 0;
const offY = trimmed.info.trimOffsetTop ? -trimmed.info.trimOffsetTop : 0;
const { data: td, info: ti } = await sharp(trimmed.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const TW = ti.width, TH = ti.height;
const isBlue = (p) => td[p + 3] > 8 && td[p + 2] > td[p] + 25 && td[p] < 150;
const text = new Uint8Array(TW * TH);
for (let y = 0; y < TH; y++) {
  const sy = y + offY;
  if (sy < 700) continue;
  for (let x = 0; x < TW; x++) {
    const sx = x + offX;
    const inLens = ((sx - 710) / 399) ** 2 + ((sy - 382) / 342) ** 2 < 1; // inner 95% of the ring
    if (inLens) continue;
    if (sx > 1120 && sy < 775) continue; // handle
    if (isBlue((y * TW + x) * 4)) text[y * TW + x] = 1;
  }
}

// Light variant: the wordmark in cream, for navy backgrounds.
{
  const o = Buffer.from(td);
  for (let k = 0; k < TW * TH; k++) if (text[k]) { o[k * 4] = CREAM[0]; o[k * 4 + 1] = CREAM[1]; o[k * 4 + 2] = CREAM[2]; }
  await sharp(o, { raw: { width: TW, height: TH, channels: 4 } }).resize({ width: 1400 }).png({ compressionLevel: 9 }).toFile(at('src/assets/brand/finddome-logo-light.png'));
}

// The mark: the whole magnifier without the wordmark, as a transparent square.
const markPix = Buffer.from(td);
for (let k = 0; k < TW * TH; k++) if (text[k]) markPix[k * 4 + 3] = 0;
const mTop = 0, mLeft = Math.round(TW * 0.1), mW = TW - mLeft;
let mH = Math.round(TH * 0.9);
const lens = await sharp(markPix, { raw: { width: TW, height: TH, channels: 4 } }).extract({ left: mLeft, top: mTop, width: mW, height: mH }).png().toBuffer();
const trimmedMark = await sharp(lens).trim({ threshold: 2 }).png().toBuffer({ resolveWithObject: true });
const side = Math.max(trimmedMark.info.width, trimmedMark.info.height);
const mark = await sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: trimmedMark.data, left: Math.round((side - trimmedMark.info.width) / 2), top: Math.round((side - trimmedMark.info.height) / 2) }])
  .png().toBuffer();
await fs.writeFile(at('src/assets/brand/finddome-mark.png'), await sharp(mark).resize(512, 512).png().toBuffer());

const square = async (size, { pad = 0.08, bg = { r: 255, g: 255, b: 255, alpha: 0 } } = {}) => {
  const inner = Math.round(size * (1 - pad * 2));
  const m = await sharp(mark).resize(inner, inner).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: m, left: Math.round((size - inner) / 2), top: Math.round((size - inner) / 2) }]).png().toBuffer();
};
const white = { r: 255, g: 255, b: 255, alpha: 1 };
await fs.writeFile(at('public/favicon-16.png'), await square(16, { pad: 0.02 }));
await fs.writeFile(at('public/favicon-32.png'), await square(32, { pad: 0.02 }));
await fs.writeFile(at('public/favicon-48.png'), await square(48, { pad: 0.03 }));
await fs.writeFile(at('public/apple-touch-icon.png'), await square(180, { pad: 0.1, bg: white }));
await fs.writeFile(at('public/icon-192.png'), await square(192, { pad: 0.1, bg: white }));
await fs.writeFile(at('public/icon-512.png'), await square(512, { pad: 0.1, bg: white }));
await fs.writeFile(at('public/brand/finddome-mark-512.png'), await sharp(mark).resize(512, 512).png().toBuffer());

// favicon.ico: three PNG frames (16, 32, 48) in an ICO container.
const frames = await Promise.all([16, 32, 48].map((s) => fs.readFile(at(`public/favicon-${s}.png`))));
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
let offset = 6 + 16 * frames.length;
const dir = frames.map((f, i) => {
  const s = [16, 32, 48][i];
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(f.length, 8); e.writeUInt32LE(offset, 12);
  offset += f.length; return e;
});
await fs.writeFile(at('public/favicon.ico'), Buffer.concat([header, ...dir, ...frames]));
console.log('done');
