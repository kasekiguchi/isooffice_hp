import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// GitHub Pages プロジェクトサイトとして公開する場合のベースパス。
// リポジトリ名に合わせて変更する（例: リポジトリ名が isooffice_hp なら '/isooffice_hp'）。
const BASE = '/isooffice_hp';

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
    allowHTML: true,
  },
});
