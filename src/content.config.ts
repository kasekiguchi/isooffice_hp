import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// お知らせ（トピックス）。1記事＝1 Markdown ファイル。
// 新規記事は src/content/topics/YYYY-MM-DD.md を作成する。
const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    date: z.string(), // ISO: YYYY-MM-DD
    // 記事下部にギャラリー表示する画像（public/ 配下の相対パス）
    images: z
      .array(z.object({ src: z.string(), alt: z.string().default('') }))
      .default([]),
    // アーカイブ（過去のトピックス /topics/）に表示する場合 true
    archive: z.boolean().default(false),
    // アーカイブの年度見出し（例: "2024年度"）
    fiscalYear: z.string().optional(),
  }),
});

export const collections = { topics };
