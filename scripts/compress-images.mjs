// public/ 配下の画像を Web 表示向けに最適化する。
// - 長辺 1600px を超える場合のみ縮小（表示は最大でも数百px幅のため十分）
// - JPEG は mozjpeg 品質82、PNG は圧縮強化＋パレット化
// - 変換後にサイズが小さくなった場合のみ上書き（増える場合は元のまま）
// 実行: node scripts/compress-images.mjs
import { readdirSync, statSync, renameSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOT = 'public';
const MAX = 1600;
const exts = new Set(['.jpg', '.jpeg', '.png']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (exts.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let before = 0, after = 0, changed = 0;

for (const f of files) {
  const orig = statSync(f).size;
  before += orig;
  const ext = extname(f).toLowerCase();
  const tmp = f + '.tmp';
  try {
    const img = sharp(f, { failOn: 'none' }).rotate();
    const meta = await img.metadata();
    if (meta.width > MAX || meta.height > MAX) {
      img.resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
    }
    if (ext === '.png') {
      await img.png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(tmp);
    } else {
      await img.jpeg({ quality: 82, mozjpeg: true }).toFile(tmp);
    }
    const newSize = statSync(tmp).size;
    if (newSize < orig) {
      renameSync(tmp, f);
      after += newSize;
      changed++;
    } else {
      unlinkSync(tmp);
      after += orig;
    }
  } catch (e) {
    try { unlinkSync(tmp); } catch {}
    after += orig;
    console.error('skip', f, e.message);
  }
}

const mb = (b) => (b / 1048576).toFixed(1);
console.log(`images: ${files.length} | optimized: ${changed}`);
console.log(`before: ${mb(before)} MB -> after: ${mb(after)} MB (saved ${mb(before - after)} MB, ${((1 - after / before) * 100).toFixed(0)}%)`);
