# 追加機能仕様書

> 既存の仕様書（spec-overview.md / spec-api.md / spec-database.md / spec-ui.md）に未記載の新機能を定義する。

---

## 目次

1. [関連コンテンツレコメンド](#1-関連コンテンツレコメンド)
2. [読了時間フィルター](#2-読了時間フィルター)
3. [哲学者タイムライン](#3-哲学者タイムライン)
4. [今日の一問（Daily Question）](#4-今日の一問daily-question)
5. [哲学者比較ページ](#5-哲学者比較ページ)
6. [用語集ポップオーバー（シームレスリンク）](#6-用語集ポップオーバーシームレスリンク)
7. [哲学クイズ](#7-哲学クイズ)
8. [記事のシリーズ機能](#8-記事のシリーズ機能)
9. [学習マップ（ビジュアル）](#9-学習マップビジュアル)

---

## 1. 関連コンテンツレコメンド

### 概要

記事詳細・哲学者詳細ページの末尾に、閲覧中のコンテンツと関連するコンテンツを自動表示する。

> 備考: `articles.get` のレスポンスに `relatedArticles` フィールドが既に存在するが、ロジックの詳細と哲学者詳細での関連表示は未定義のため、ここで仕様化する。

### 関連ロジック

| 起点 | 関連コンテンツ | 選定基準 |
|------|--------------|---------|
| 記事詳細 | 関連記事（最大4件） | 同じテーマを持つ記事を優先。次に同じ哲学者の記事。最後に新着記事で補完 |
| 記事詳細 | 関連哲学者（最大2件） | 同記事に紐付く哲学者 + 同テーマに多く登場する哲学者 |
| 哲学者詳細 | 関連哲学者（最大3件） | 同じ `region`・時代（`birth_year` 差が150年以内）の哲学者 |
| 哲学者詳細 | 関連記事（最大4件） | 既存の `articles` フィールドを流用（哲学者詳細APIに含まれる） |

### API 変更

#### `articles.get` 出力への追加

```typescript
relatedArticles: Array<{
  id: string;
  slug: string;
  title: string;
  tag: string;
  readingTime: number;
}>;  // 既存フィールドのロジックを明確化（最大4件）

relatedPhilosophers: Array<{  // 新規追加
  id: string;
  slug: string;
  name: string;
  initial: string;
  shortBio: string;
}>;
```

#### `philosophers.get` 出力への追加

```typescript
relatedPhilosophers: Array<{  // 新規追加
  id: string;
  slug: string;
  name: string;
  initial: string;
  era: string;
  region: string;
  shortBio: string;
}>;
```

### UI

```
┌──────────────────────────────────────────┐
│ この記事に関連する記事                    │
├──────────────┬──────────────┬────────────┤
│ [記事カード] │ [記事カード] │ [記事カード] │ [記事カード] │
└──────────────┴──────────────┴────────────┘
```

- 記事詳細ページ本文の直下に配置
- モバイルでは横スクロール（overflow-x: scroll）カルーセル表示

---

## 2. 読了時間フィルター

### 概要

記事一覧ページ（`/articles`）に読了時間によるフィルタリング機能を追加する。

### フィルター選択肢

| ラベル | 条件 |
|-------|------|
| すべて | 制限なし（デフォルト） |
| 5分以内 | `reading_time <= 5` |
| 10分以内 | `reading_time <= 10` |
| 10分以上 | `reading_time > 10` |

### API 変更

#### `articles.list` 入力パラメータへの追加

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `maxReadingTime` | `number` | 任意 | この分数以内の記事のみ返す |
| `minReadingTime` | `number` | 任意 | この分数以上の記事のみ返す |

### UI

```
[すべて] [5分以内] [10分以内] [10分以上]
（既存の themeSlug フィルターの横に並べる）
```

---

## 3. 哲学者タイムライン

### 概要

哲学者を時代軸（生年順）でビジュアル表示するページ。哲学の歴史的な流れと哲学者間の時代的関係を直感的に把握できる。

### ルート

`/philosophers/timeline`

### データソース

既存の `philosopher` テーブルの `birth_year` / `death_year` を使用。DBスキーマ変更なし。

### API

既存の `philosophers.list` を流用（`limit: 100` で全件取得）。

### UI レイアウト

```
┌────────────────────────────────────────────────────────┐
│ Philosophers Timeline — 哲学の流れ                      │
│ [西洋] [東洋] [すべて]  フィルター                       │
├────────────────────────────────────────────────────────┤
│ 紀元前600 ┤                                             │
│ 紀元前500 ┤ ●ソクラテス (紀元前470-399)                  │
│ 紀元前400 ┤   ●プラトン (紀元前428-348)                  │
│ 紀元前300 ┤     ●アリストテレス (紀元前384-322)           │
│          ┤ ●孔子 (紀元前551-479) [東洋]                  │
│   ...    ┤                                              │
│ 1800年代 ┤              ●ニーチェ (1844-1900)            │
└────────────────────────────────────────────────────────┘
```

- 縦軸: 年代
- 横軸: 地域グループ（西洋左 / 東洋右）
- 哲学者名をクリックすると `/philosophers/:slug` へ遷移
- モバイルでは縦スクロール、年代は折りたたみ可能

### 表示仕様

- 地域フィルター: `western` / `eastern` / すべて
- 生年不明の哲学者は「時代不詳」セクションに表示
- 各カードには name / era / shortBio（ホバー時）を表示

---

## 4. 今日の一問（Daily Question）

### 概要

トップページ（`/`）に毎日変わる哲学的な問いを表示する。ユーザーが「問いを持つことから始まる」というサイトコンセプトを体現するセクション。

### 仕組み

- 質問リストをフロントエンドのコード（または DB テーブル）に保持
- `Math.floor(Date.now() / 86400000) % questions.length` で当日のインデックスを決定
- サーバーAPIは不要（クライアントサイドで完結）。将来 DB 管理する場合は `daily_question` テーブルを追加する。

### 質問リスト（初期）

```
1. 「善い人生とは何か？」（アリストテレス的問い）
2. 「知ることができるとはどういうことか？」（認識論）
3. 「自由意志は存在するか？」（自由論）
4. 「死を恐れる必要はあるか？」（エピクロス的問い）
5. 「美しいとはどういう状態か？」（美学）
6. 「正義は相対的か、普遍的か？」（倫理学）
7. 「言語がなければ思考できるか？」（言語哲学）
8. 「時間は流れるものか、それとも存在するものか？」（時間論）
9. 「他者の心を知ることはできるか？」（心の哲学）
10. 「自分とは何か？」（個人同一性）
（全30問を初期データとして用意する）
```

### UI

```
┌──────────────────────────────────────────┐
│ Today's Question                         │
│ 今日の問い                               │
│                                          │
│ 「善い人生とは何か？」                   │
│                                          │
│ — アリストテレスが問い続けたテーマ        │
│ [このテーマを探索する →]                  │
└──────────────────────────────────────────┘
```

- トップページのヒーローセクション直下に配置
- 日付ベースで毎日自動更新
- 「このテーマを探索する」リンクは関連テーマ・記事へ誘導

---

## 5. 哲学者比較ページ

### 概要

2人の哲学者の思想・時代・地域・主要著作を並べて比較する。入門者が思想の違いを理解しやすくする。

### ルート

`/compare?a=:slugA&b=:slugB`

### データソース

既存の `philosophers.get` を2回呼び出す。DBスキーマ変更なし。

### API 変更

なし（既存の `philosophers.get` を2回呼び出す）。

### UI レイアウト

```
┌───────────────────────────────────────────────────────┐
│ [哲学者を選択...]    VS    [哲学者を選択...]           │
├───────────────────────────────────────────────────────┤
│            ソクラテス  |  プラトン                     │
├────────────────────────┼──────────────────────────────┤
│ 時代        紀元前470-399 | 紀元前428-348              │
│ 地域        古代ギリシャ  | 古代ギリシャ               │
│ 主要思想  [タグ][タグ] | [タグ][タグ][タグ]           │
│ 主要著作  ソクラテスの弁明 | 国家, パイドン            │
│ 関連テーマ [倫理学]    | [存在論][政治哲学]           │
└───────────────────────────────────────────────────────┘
```

- URLのクエリパラメータで哲学者を指定（シェア可能）
- プルダウンで哲学者を変更できる
- モバイルでは上下に並べる（縦比較）

---

## 6. 用語集ポップオーバー（シームレスリンク）

### 概要

記事本文・哲学者詳細の Markdown レンダリング内で哲学専門用語が登場した際、別ページに遷移せずにポップオーバー（吹き出し）で定義を表示する。

### 仕組み

1. Markdown レンダリング（`react-markdown`）のカスタムコンポーネントで `<abbr>` タグや特定のリンク形式（`[用語名](/glossary#slug)`）を検出
2. Radix UI の `Popover` コンポーネントを使ってホバー/クリック時に定義を表示
3. `glossary.get` API を呼び出して定義を取得（初回のみ、以降はキャッシュ）

### 新規 API

#### `glossary.get`

| 項目 | 内容 |
|------|------|
| 認証 | 不要 |
| 入力 | `{ term: string }` — 用語名（完全一致） |

**出力**:

```typescript
{
  id: string;
  term: string;
  reading: string;
  definition: string;
  detail: string | null;
  philosopher: { id: string; name: string; slug: string } | null;
  theme: { id: string; name: string; slug: string } | null;
}
```

### Markdown 記法

記事・レッスン本文で以下の記法を使用することで、自動的にポップオーバー対象になる：

```markdown
[弁証法](/glossary#benshouhou) という概念は...
```

### UI

```
「[弁証法]」 ← クリック/ホバー
       ↓
 ┌─────────────────────────┐
 │ 弁証法（べんしょうほう）  │
 │ 対立するものの相互作用を  │
 │ 通じて高次の統合を目指す  │
 │ 思考法。                 │
 │                          │
 │ [用語集で詳しく見る →]   │
 └─────────────────────────┘
```

---

## 7. 哲学クイズ

### 概要

学習コースのレッスン完了後に、そのレッスン内容に関する4択クイズを提示する。理解度確認と学習の定着を支援する。

### DBスキーマ追加

#### `quiz`（クイズ問題）

```sql
CREATE TABLE quiz (
  id          TEXT PRIMARY KEY,
  lesson_id   TEXT NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,  -- 問題文
  explanation TEXT,           -- 解説文（正解後に表示）
  "order"     INTEGER NOT NULL,  -- レッスン内の表示順
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX quiz_lesson_id_idx ON quiz(lesson_id);
```

#### `quiz_option`（選択肢）

```sql
CREATE TABLE quiz_option (
  id         TEXT PRIMARY KEY,
  quiz_id    TEXT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,          -- 選択肢テキスト
  is_correct INTEGER NOT NULL DEFAULT 0,  -- 正解フラグ（0/1）
  "order"    INTEGER NOT NULL,           -- 表示順
  created_at INTEGER NOT NULL
);

CREATE INDEX quiz_option_quiz_id_idx ON quiz_option(quiz_id);
```

#### `user_quiz_result`（クイズ結果）

```sql
CREATE TABLE user_quiz_result (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  quiz_id          TEXT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL REFERENCES quiz_option(id),
  is_correct       INTEGER NOT NULL,
  answered_at      INTEGER NOT NULL,
  UNIQUE(user_id, quiz_id)  -- 1回のみ回答（再試行時は UPDATE）
);

CREATE INDEX user_quiz_result_user_id_idx ON user_quiz_result(user_id);
```

### API 追加

新規ルーター `packages/api/src/routers/quiz.ts` を作成。

#### `quiz.getByLesson`

| 項目 | 内容 |
|------|------|
| 認証 | 不要 |
| 入力 | `{ lessonId: string }` |

**出力**:

```typescript
{
  quizzes: Array<{
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      order: number;
    }>;
    order: number;
  }>;
}
```

#### `quiz.submit` ※認証必須

| 項目 | 内容 |
|------|------|
| 認証 | 必須 |
| 入力 | `{ quizId: string; selectedOptionId: string }` |

**出力**:

```typescript
{
  isCorrect: boolean;
  explanation: string | null;
  correctOptionId: string;
}
```

### UI フロー

```
レッスン本文 → [完了する] ボタン → クイズモーダル（問題表示）
  → 選択肢をクリック → 正解/不正解フィードバック + 解説
  → 全問完了 → 「レッスン完了！」画面 → 次のレッスンへ
```

### ルート変更

`courses.getLesson` の出力に `hasQuiz: boolean` を追加。

---

## 8. 記事のシリーズ機能

### 概要

複数の記事を「シリーズ」としてグループ化し、前後ナビゲーション付きで連載として提供する。

### DBスキーマ追加

#### `article_series`（シリーズ）

```sql
CREATE TABLE article_series (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,    -- シリーズ名
  description TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
```

#### `article_series_item`（シリーズと記事の中間テーブル）

```sql
CREATE TABLE article_series_item (
  series_id  TEXT NOT NULL REFERENCES article_series(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  "order"    INTEGER NOT NULL,  -- シリーズ内順番
  PRIMARY KEY (series_id, article_id)
);

CREATE INDEX article_series_item_series_id_idx ON article_series_item(series_id);
```

### API 変更

#### `articles.get` 出力への追加

```typescript
series: {
  id: string;
  slug: string;
  title: string;
  currentOrder: number;
  totalCount: number;
  prevArticle: { slug: string; title: string } | null;
  nextArticle: { slug: string; title: string } | null;
} | null;
```

### UI

```
┌───────────────────────────────────────────────────────┐
│ シリーズ: カントを読む（3 / 5）                        │
│ ← [前の記事] カントの生涯と時代背景                    │
│ → [次の記事] 純粋理性批判 入門                         │
└───────────────────────────────────────────────────────┘
```

- 記事詳細ページ本文の末尾（関連記事の上）に配置
- モバイルでも縦並び表示

---

## 9. 学習マップ（ビジュアル）

### 概要

テーマ・哲学者・記事の関係性をグラフ（ネットワーク図）で可視化するページ。哲学体系の全体像を把握しやすくする。

### ルート

`/map`

### 技術要件

| 項目 | 内容 |
|------|------|
| グラフライブラリ | `@xyflow/react`（React Flow）を推奨。軽量で SSR 不要 |
| ノード種別 | `theme`（テーマ） / `philosopher`（哲学者） / `article`（記事） |
| エッジ種別 | テーマ⇔哲学者 / テーマ⇔記事 / 哲学者⇔記事 |

### API 追加

新規エンドポイント `map.getData`

| 項目 | 内容 |
|------|------|
| 認証 | 不要 |

**出力**:

```typescript
{
  nodes: Array<{
    id: string;
    type: 'theme' | 'philosopher' | 'article';
    label: string;
    slug: string;
  }>;
  edges: Array<{
    source: string;  // node id
    target: string;  // node id
    type: 'theme-philosopher' | 'theme-article' | 'philosopher-article';
  }>;
}
```

### ルーター追加

`packages/api/src/routers/map.ts` を新規作成。

### UI

```
┌──────────────────────────────────────────────────────┐
│  Philosophy Map — 哲学の地図                          │
│  [テーマ ●] [哲学者 ●] [記事 ●]  凡例フィルター      │
├──────────────────────────────────────────────────────┤
│                                                       │
│    (存在論) ── ソクラテス ── (プラトンの洞窟)         │
│       │              │                                │
│    (認識論) ── デカルト                               │
│                                                       │
└──────────────────────────────────────────────────────┘
```

- ノードをクリックすると詳細ページへ遷移
- ノードをホバーすると関連コンテンツのプレビューを表示
- ズーム・パン操作対応
- 複雑度が高いため実装はPhase C（後期）

---

## ER図（追加分）

```
quiz ──── lesson
  └── quiz_option ──── user_quiz_result ──── user

article_series ──── article_series_item ──── article
```

---

## ページ・ルート追加一覧

| パス | ページ名 | 認証要否 | 新規/変更 |
|------|---------|---------|---------|
| `/philosophers/timeline` | 哲学者タイムライン | 不要 | 新規 |
| `/compare` | 哲学者比較 | 不要 | 新規 |
| `/map` | 学習マップ | 不要 | 新規 |
