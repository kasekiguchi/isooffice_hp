# 東京都市大学 横浜キャンパス ISO事務局 サイト（isooffice_hp）

旧サイト <https://www.comm.tcu.ac.jp/isooffice/>（手書きの静的HTML）を、
**Astro** でモダン・レスポンシブに再構築し、**GitHub Pages** で公開するプロジェクトです。
`diversity_hp` と同じ構成・デプロイ方式に揃えています。

## なぜ Astro か

- 旧サイトは古い jQuery / lightbox2 / html5shiv や `http://` 参照（混在コンテンツ）を含み、
  レスポンシブ非対応だった。これらを撤去し、HTTPS 強制・レスポンシブ設計・軽量な静的出力に刷新。
- チームに `diversity_hp` の知見と GitHub Pages デプロイ資産がある。
- 完全な静的サイトのため GitHub Pages（静的ホスティング）と相性が良い。

## 開発

```bash
npm install
npm run dev      # http://localhost:4321/isooffice_hp/
npm run build    # dist/ に静的出力
npm run preview  # ビルド結果をローカル確認
```

## ディレクトリ

```
src/
  layouts/Base.astro         共通レイアウト（ヘッダー/ナビ/フッター）
  components/Nav.astro        レスポンシブ・グローバルナビ（モバイルはハンバーガー）
  components/TopicArticle.astro  お知らせ1件の表示
  styles/global.css           デザインシステム（環境グリーン基調）
  content.config.ts           Content Collections スキーマ
  content/topics/*.md          お知らせ記事（1記事1ファイル）
  data/*.js                    各セクションの構造化データ（movies/research/manual）
  pages/                       各ページ（index.astro ほか）
public/                       画像・PDF などの静的アセット（picture/ ほか）
scripts/                      画像圧縮・移行スクリプト
```

## お知らせ（トピックス）の更新

diversity_hp と同じ **Content Collections**（1記事＝1 Markdown ファイル）方式。
`src/content/topics/YYYY-MM-DD.md` を新規作成するだけで記事が追加される
（スキーマは `src/content.config.ts`）。

```markdown
---
title: "記事タイトル"
date: "2026-07-07"          # ISO形式（並び順に使用）
images:                      # 記事下部のギャラリー（任意）
  - src: "picture/foo.jpg"
    alt: "説明"
# archive: true             # 過去のトピックス(/topics/)に載せる場合
# fiscalYear: "2026年度"     # アーカイブの年度見出し
---

本文を **Markdown** で記述。内部リンク（例 `[データ](record/data/)`）や画像には
ビルド時に自動でベースパスが付与される（`astro.config.mjs` の rehype プラグイン）。
```

- 画像は `public/picture/` に置き、`picture/ファイル名` で参照する。
- 最新のお知らせ（`archive` 無し）はトップページに日付降順で表示。
- `archive: true` の記事は `/topics/` に `fiscalYear` ごとにまとめて表示。

## デプロイ

`main` ブランチへ push すると `.github/workflows/deploy.yml` が
`astro build` → GitHub Pages へ自動デプロイする。

公開先を変える場合は `astro.config.mjs` の `SITE` と `BASE`（リポジトリ名）を修正する。

## 移植状況

- [x] プロジェクト土台・レスポンシブデザイン・デプロイ設定
- [x] トップページ（お知らせ 23件、画像33点）
- [x] 環境方針（日本語 / English / 中文 / 各学部案内）
- [x] 組織（組織体系・ISO組織体制・環境委員会・環境側面の表）
- [x] 記録（記録トップ・電力等データ・キャンパス基礎データ・報告書・動画64本）
- [x] 年間計画
- [x] 研究（研究成果一覧）
- [x] 環境マニュアル（2026年度版の条項⇔別表対応表＋過去版PDF）
- [x] 過去のトピックス（2021〜2024年度アーカイブ 計49件、`/topics/`）
- [x] 全ページ build 成功・内部リンク／アセット参照のリンク切れゼロ（322参照検証）
- [ ] 画像・PDF の最適化（`public/record/` が約119MBあり要圧縮）

計 18 ページ。元サイトのミラーは `mirror/`（git 管理外）に保存＝移植時の参照元。

### 補足：元サイト由来の要対応事項

- 以下は**元サイトの時点で404**（リンク切れ）だったため、リンクを外しています。ファイルが用意でき次第、`public/` に配置してリンクを復活できます。
  - `pdf/2026ISOガイダンス_1.pdf` / `_2.pdf`（トップの新入生ガイダンス記事）
  - `research/pdf/2014/2014-139-rijal.pdf`（研究成果一覧の1件）
- 旧サイトの古い外部トラッカー（`projectgama.analytics.qlook.net`、HTTP）・古い jQuery/lightbox2/html5shiv は撤去済み。
