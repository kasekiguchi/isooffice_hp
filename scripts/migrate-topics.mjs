// 既存の JS データ配列（topics.js / topics-archive.js）を
// Content Collections（src/content/topics/*.md）へ一括変換する。
// 実行: node scripts/migrate-topics.mjs
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { topics } from '../src/data/topics.js';
import { archive } from '../src/data/topics-archive.js';

const OUT = 'src/content/topics';
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

// "2026.6.17" -> "2026-06-17"
function toISO(d) {
  const m = String(d).trim().match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

// HTML 文字列 -> Markdown
function toMarkdown(html) {
  let s = html || '';
  s = s.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gis, (_m, u, t) => `[${t.replace(/<[^>]*>/g, '').trim()}](${u})`);
  s = s.replace(/<strong>(.*?)<\/strong>/gis, '**$1**');
  s = s.replace(/<font[^>]*>(.*?)<\/font>/gis, '$1');
  s = s.replace(/<br\s*\/?>/gi, '  \n'); // Markdown hard break
  s = s.replace(/<[^>]+>/g, '');         // strip remaining tags
  s = s.replace(/[ \t]*\n/g, '  \n');    // keep hard breaks
  return s.trim();
}

function yaml(str) {
  return JSON.stringify(str); // JSON scalar is valid YAML
}

const used = new Map();
function slugFor(iso) {
  const n = (used.get(iso) || 0) + 1;
  used.set(iso, n);
  return n === 1 ? iso : `${iso}-${n}`;
}

function write(item, { archive = false, fiscalYear } = {}) {
  const iso = toISO(item.date);
  if (!iso) {
    console.warn('skip (bad date):', item.date, item.title);
    return 0;
  }
  const slug = slugFor(iso);
  const fm = [
    '---',
    `title: ${yaml(item.title)}`,
    `date: ${yaml(iso)}`,
  ];
  if (item.images && item.images.length) {
    fm.push('images:');
    for (const im of item.images) fm.push(`  - src: ${yaml(im.src)}\n    alt: ${yaml(im.alt || '')}`);
  }
  if (archive) {
    fm.push('archive: true');
    if (fiscalYear) fm.push(`fiscalYear: ${yaml(fiscalYear)}`);
  }
  fm.push('---', '');
  const body = toMarkdown(item.body);
  writeFileSync(`${OUT}/${slug}.md`, fm.join('\n') + '\n' + body + '\n', 'utf-8');
  return 1;
}

let n = 0;
for (const t of topics) n += write(t, { archive: false });
for (const yr of archive) for (const t of yr.topics) n += write(t, { archive: true, fiscalYear: yr.year });

console.log(`wrote ${n} markdown files to ${OUT}/`);
