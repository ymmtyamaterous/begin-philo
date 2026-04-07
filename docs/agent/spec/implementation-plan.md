# 実装計画書

> 本ドキュメントは、bphilo の機能実装を優先度・依存関係・工数を考慮してフェーズ分けした計画書です。
> 追加機能の詳細仕様は [spec-additional-features.md](./spec-additional-features.md) を参照。

---

## フェーズ概要

| フェーズ | 期間目安 | テーマ | DBスキーマ変更 |
|---------|---------|-------|--------------|
| **Phase A** | 1〜2週間 | 既存資産の活用・UI拡充 | なし |
| **Phase B** | 〜1ヶ月 | 軽微なAPI追加・新規ページ | 軽微（カラム追加のみ） |
| **Phase C** | 〜2ヶ月 | DBスキーマ追加・複雑な機能 | あり（テーブル追加） |

---

## Phase A — 既存データ・APIを活用した UX 改善

> DBスキーマ変更ゼロ。既存の API・データを使い切る。

### A-1. 関連コンテンツレコメンド

| 項目 | 内容 |
|------|------|
| 対象ページ | `/articles/:slug`（記事詳細）、`/philosophers/:slug`（哲学者詳細） |
| 仕様書 | [spec-additional-features.md#1](./spec-additional-features.md) |
| 作業内容 | ① `articles.get` の `relatedArticles` ロジック実装・`relatedPhilosophers` 追加<br>② `philosophers.get` に `relatedPhilosophers` 追加<br>③ 記事詳細・哲学者詳細ページに関連セクション UI 追加 |
| 影響範囲 | `packages/api/src/routers/articles.ts`<br>`packages/api/src/routers/philosophers.ts`<br>`apps/web/src/routes/articles/$slug.tsx`<br>`apps/web/src/routes/philosophers/$slug.tsx` |
| テスト | `articles.get` の relatedArticles 返却ロジックのユニットテスト |

---

### A-2. 読了時間フィルター

| 項目 | 内容 |
|------|------|
| 対象ページ | `/articles`（記事一覧） |
| 仕様書 | [spec-additional-features.md#2](./spec-additional-features.md) |
| 作業内容 | ① `articles.list` に `maxReadingTime` / `minReadingTime` パラメータ追加<br>② 記事一覧ページにフィルター UI（ボタングループ）追加 |
| 影響範囲 | `packages/api/src/routers/articles.ts`<br>`apps/web/src/routes/articles/index.tsx` |
| テスト | フィルターパラメータを使った `articles.list` のユニットテスト |

---

### A-3. 哲学者タイムライン

| 項目 | 内容 |
|------|------|
| 対象ページ | `/philosophers/timeline`（新規） |
| 仕様書 | [spec-additional-features.md#3](./spec-additional-features.md) |
| 作業内容 | ① `apps/web/src/routes/philosophers/timeline.tsx` 新規作成<br>② `philosophers.list`（全件取得）を使ったタイムライン UI 実装<br>③ ヘッダーナビ・哲学者一覧ページにタイムラインへのリンク追加 |
| 影響範囲 | `apps/web/src/routes/philosophers/timeline.tsx`（新規）<br>`apps/web/src/components/header.tsx`<br>`apps/web/src/routes/philosophers/index.tsx` |
| テスト | birth_year によるソート・グルーピングロジックのユニットテスト |

---

### A-4. 今日の一問（Daily Question）

| 項目 | 内容 |
|------|------|
| 対象ページ | `/`（トップページ）のセクション追加 |
| 仕様書 | [spec-additional-features.md#4](./spec-additional-features.md) |
| 作業内容 | ① 質問データ（30問）を `apps/web/src/data/daily-questions.ts` に定義<br>② 日付ベースの選択ロジックを実装<br>③ `DailyQuestion` コンポーネント新規作成<br>④ トップページ（`index.tsx`）のヒーロー直下に配置 |
| 影響範囲 | `apps/web/src/data/daily-questions.ts`（新規）<br>`apps/web/src/components/daily-question.tsx`（新規）<br>`apps/web/src/routes/index.tsx` |
| テスト | 日付ベース選択ロジックのユニットテスト（日付を固定してテスト） |

---

## Phase B — 軽微なAPI追加・新規ページ

> DBスキーマ変更は最小限（カラム追加・新規APIのみ）。

### B-1. 哲学者比較ページ

| 項目 | 内容 |
|------|------|
| 対象ページ | `/compare`（新規） |
| 仕様書 | [spec-additional-features.md#5](./spec-additional-features.md) |
| 作業内容 | ① `apps/web/src/routes/compare.tsx` 新規作成<br>② クエリパラメータ（`?a=slug&b=slug`）の読み取りと哲学者取得<br>③ 比較テーブル UI 実装<br>④ 哲学者一覧・詳細ページに「比較する」ボタン追加 |
| 影響範囲 | `apps/web/src/routes/compare.tsx`（新規）<br>`apps/web/src/routes/philosophers/index.tsx`<br>`apps/web/src/routes/philosophers/$slug.tsx` |
| テスト | クエリパラメータのバリデーションテスト |

---

### B-2. 用語集ポップオーバー（シームレスリンク）

| 項目 | 内容 |
|------|------|
| 対象ページ | 記事詳細・哲学者詳細・レッスン詳細 |
| 仕様書 | [spec-additional-features.md#6](./spec-additional-features.md) |
| 作業内容 | ① `glossary.get` API 新規追加<br>② `GlossaryPopover` コンポーネント新規作成（Radix UI `Popover` 使用）<br>③ `react-markdown` のリンクレンダラーをカスタマイズ（`/glossary#slug` 形式を検出）<br>④ TanStack Query でポップオーバー表示時に定義を遅延フェッチ |
| 影響範囲 | `packages/api/src/routers/glossary.ts`<br>`apps/web/src/components/glossary-popover.tsx`（新規）<br>Markdown レンダリング箇所（記事・レッスン・哲学者詳細） |
| テスト | `glossary.get` のユニットテスト |

---

### B-3. 名言集ページ

> spec-overview.md Phase 3 定義済み。APIは既に実装済み（`quotes.list`, `quotes.getRandom`）。UIページのみ未実装。

| 項目 | 内容 |
|------|------|
| 対象ページ | `/quotes`（新規） |
| 仕様書 | spec-overview.md Phase 3 |
| 作業内容 | ① `apps/web/src/routes/quotes/index.tsx` 新規作成<br>② 名言カード一覧（哲学者フィルター付き）UI 実装<br>③ ランダム名言表示セクションをトップページに追加<br>④ フッター・ヘッダーのナビゲーションに追加 |
| 影響範囲 | `apps/web/src/routes/quotes/index.tsx`（新規）<br>`apps/web/src/components/header.tsx`<br>`apps/web/src/components/footer.tsx`<br>`apps/web/src/routes/index.tsx` |
| テスト | なし（既存APIのみ使用） |

---

## Phase C — DBスキーマ追加・大規模実装

> DBマイグレーションが必要。実装前に十分なレビューを行うこと。

### C-1. 哲学クイズ

| 項目 | 内容 |
|------|------|
| 対象ページ | `/courses/:slug/:lessonSlug`（レッスン詳細に統合） |
| 仕様書 | [spec-additional-features.md#7](./spec-additional-features.md) |
| 作業内容 | ① DBマイグレーション: `quiz`, `quiz_option`, `user_quiz_result` テーブル追加<br>② Drizzle スキーマ作成（`packages/db/src/schema/quiz.ts`）<br>③ `packages/api/src/routers/quiz.ts` 新規作成<br>④ `courses.getLesson` に `hasQuiz` フラグ追加<br>⑤ レッスン完了後クイズモーダル UI 実装<br>⑥ シードデータ作成（各レッスンに2〜3問） |
| 影響範囲 | `packages/db/src/schema/quiz.ts`（新規）<br>`packages/api/src/routers/quiz.ts`（新規）<br>`packages/api/src/routers/courses.ts`<br>`apps/web/src/routes/courses/$slug/$lessonSlug.tsx` |
| テスト | `quiz.submit` のユニットテスト（正解/不正解の判定） |

---

### C-2. 記事のシリーズ機能

| 項目 | 内容 |
|------|------|
| 対象ページ | `/articles/:slug`（記事詳細に統合） |
| 仕様書 | [spec-additional-features.md#8](./spec-additional-features.md) |
| 作業内容 | ① DBマイグレーション: `article_series`, `article_series_item` テーブル追加<br>② Drizzle スキーマ作成（`packages/db/src/schema/article-series.ts`）<br>③ `articles.get` にシリーズ情報追加<br>④ 記事詳細ページにシリーズナビゲーション UI 追加<br>⑤ `/articles` 一覧でシリーズバッジ表示 |
| 影響範囲 | `packages/db/src/schema/article-series.ts`（新規）<br>`packages/api/src/routers/articles.ts`<br>`apps/web/src/routes/articles/$slug.tsx`<br>`apps/web/src/routes/articles/index.tsx` |
| テスト | `articles.get` のシリーズ情報返却ロジックのユニットテスト |

---

### C-3. 学習マップ（ビジュアル）

| 項目 | 内容 |
|------|------|
| 対象ページ | `/map`（新規） |
| 仕様書 | [spec-additional-features.md#9](./spec-additional-features.md) |
| 作業内容 | ① `@xyflow/react` パッケージ追加<br>② `packages/api/src/routers/map.ts` 新規作成<br>③ `apps/web/src/routes/map.tsx` 新規作成<br>④ グラフデータ生成ロジック実装（テーマ・哲学者・記事の関係を収集）<br>⑤ React Flow でノード/エッジ描画<br>⑥ ノードカスタムデザイン（テーマ/哲学者/記事で色分け） |
| 影響範囲 | `packages/api/src/routers/map.ts`（新規）<br>`apps/web/src/routes/map.tsx`（新規）<br>`apps/web/package.json`（依存追加） |
| テスト | `map.getData` のノード・エッジ生成ロジックのユニットテスト |

---

## 優先度サマリー

```
Phase A（すぐ着手可能）
  ├── A-1. 関連コンテンツレコメンド  ← 回遊率向上・直接的なUX改善
  ├── A-2. 読了時間フィルター        ← 実装コスト低・即効性高
  ├── A-3. 哲学者タイムライン        ← 差別化コンテンツ
  └── A-4. 今日の一問               ← コンセプト体現・実装コスト最小

Phase B（Phase A 完了後）
  ├── B-3. 名言集ページ             ← APIは既存・UIのみ
  ├── B-1. 哲学者比較ページ         ← 差別化・シェア誘発
  └── B-2. 用語集ポップオーバー     ← 学習体験の本質的な向上

Phase C（長期）
  ├── C-1. 哲学クイズ               ← 学習定着・コース完成度向上
  ├── C-2. 記事のシリーズ機能       ← コンテンツ充実後に有効
  └── C-3. 学習マップ               ← 最も複雑・コスト大
```

---

## 実装時の共通ルール

1. **テスト必須**: 各タスクで API ロジックのユニットテストを実装すること
2. **型安全**: oRPC の型定義を `packages/api` 側で完結させ、フロントエンドは推論を使う
3. **マイグレーション**: DBスキーマ変更は `drizzle-kit generate` → `drizzle-kit migrate` の手順を守る
4. **シード更新**: 新テーブル追加時は `packages/db/src/seed.ts` にサンプルデータを追加する
5. **スキーマ変更時**: `spec-database.md` を更新する
6. **API 追加時**: `spec-api.md` を更新する
