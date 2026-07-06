import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// GitHub Pages プロジェクトサイトとして公開する場合のベースパス。
// リポジトリ名に合わせて変更する（例: リポジトリ名が isooffice_hp なら '/isooffice_hp'）。
const BASE = '/isooffice_hp';

/**
 * Markdown 本文中のリンク・画像にベースパスを付与する rehype プラグイン。
 * - 相対パス（record/... 等）や root 絶対パス（/... ）に BASE を前置
 * - 旧サイトの .html パスを末尾スラッシュのディレクトリURLへ変換
 * - 外部URL・mailto・アンカー・BASE 済みはそのまま
 */
function rehypeBasePath() {
  const rewrite = (url) => {
    if (typeof url !== 'string' || url.length === 0) return url;
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(url)) return url;
    let u = url.replace(/index\.html$/, '').replace(/\.html($|#)/, '/$1');
    if (u === BASE || u.startsWith(BASE + '/')) return u;
    if (u.startsWith('/')) return BASE + u;
    return BASE + '/' + u;
  };
  const visit = (node) => {
    if (node.type === 'element' && node.properties) {
      if (node.tagName === 'a' && node.properties.href) node.properties.href = rewrite(node.properties.href);
      if ((node.tagName === 'img' || node.tagName === 'source') && node.properties.src)
        node.properties.src = rewrite(node.properties.src);
    }
    if (Array.isArray(node.children)) node.children.forEach(visit);
  };
  return () => (tree) => visit(tree);
}

// 公開先の GitHub Pages URL（オーナーに合わせて変更する）。
// 例: https://<org または user>.github.io
const SITE = 'https://kasekiguchi.github.io';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  output: 'static',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeBasePath()],
  },
});
