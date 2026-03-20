# データベース設計書

## 1. 概要

- **DBMS**: SQLite（開発・本番とも。将来的に Turso/libSQL への移行を想定）
- **ORM**: Drizzle ORM
- **スキーマ格納先**: `packages/db/src/schema/`
- **マイグレーション**: `drizzle-kit` を使用

---

## 2. テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| `user` | ユーザー（better-auth 管理） |
| `session` | セッション（better-auth 管理） |
| `account` | OAuthアカウント（better-auth 管理） |
| `verification` | メール認証トークン（better-auth 管理） |
| `philosopher` | 哲学者マスタ |
| `theme` | 哲学テーママスタ |
| `article` | 解説記事 |
| `article_theme` | 記事⇔テーマ 中間テーブル |
| `course` | 学習コース |
| `lesson` | コース内レッスン |
| `quote` | 名言 |
| `glossary_term` | 用語集 |
| `user_lesson_progress` | ユーザーのレッスン完了状況 |
| `user_bookmark` | ユーザーのブックマーク |

---

## 3. テーブル定義

### 3.1 `philosopher`（哲学者）

```sql
CREATE TABLE philosopher (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,          -- 日本語名（例: "ソクラテス"）
  name_en     TEXT NOT NULL,          -- 英語名（例: "Socrates"）
  initial     TEXT NOT NULL,          -- アバター表示用文字（例: "Σ"）
  era         TEXT NOT NULL,          -- 生没年表示（例: "紀元前470 – 399"）
  birth_year  INTEGER,                -- 生年（紀元前はマイナス値）
  death_year  INTEGER,                -- 没年（紀元前はマイナス値）
  region      TEXT NOT NULL,          -- 地域（例: "古代ギリシャ"）
  short_bio   TEXT NOT NULL,          -- 短い紹介文（一覧用）
  biography   TEXT NOT NULL,          -- 詳細解説（Markdown）
  key_ideas   TEXT NOT NULL,          -- 主要思想（JSON配列: string[]）
  major_works TEXT NOT NULL,          -- 主要著作（JSON配列: string[]）
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `slug` | TEXT | NOT NULL, UNIQUE | URLスラッグ（例: `socrates`） |
| `name` | TEXT | NOT NULL | 日本語名 |
| `name_en` | TEXT | NOT NULL | 英語名 |
| `initial` | TEXT | NOT NULL | アバター表示文字 |
| `era` | TEXT | NOT NULL | 生没年の表示文字列 |
| `birth_year` | INTEGER | | 生年（紀元前はマイナス） |
| `death_year` | INTEGER | | 没年（紀元前はマイナス） |
| `region` | TEXT | NOT NULL | 地域・時代区分 |
| `short_bio` | TEXT | NOT NULL | 短い紹介文 |
| `biography` | TEXT | NOT NULL | Markdown詳細解説 |
| `key_ideas` | TEXT | NOT NULL | JSON配列 |
| `major_works` | TEXT | NOT NULL | JSON配列 |
| `created_at` | INTEGER | NOT NULL | Unix時間（ms） |
| `updated_at` | INTEGER | NOT NULL | Unix時間（ms） |

---

### 3.2 `theme`（哲学テーマ）

```sql
CREATE TABLE theme (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  number      INTEGER NOT NULL UNIQUE,  -- 表示番号（01〜）
  name        TEXT NOT NULL,            -- テーマ名（例: "存在とは何か（存在論）"）
  description TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `slug` | TEXT | NOT NULL, UNIQUE | URLスラッグ（例: `ontology`） |
| `number` | INTEGER | NOT NULL, UNIQUE | 表示順序番号 |
| `name` | TEXT | NOT NULL | テーマ名 |
| `description` | TEXT | NOT NULL | テーマ説明 |
| `created_at` | INTEGER | NOT NULL | Unix時間（ms） |
| `updated_at` | INTEGER | NOT NULL | Unix時間（ms） |

---

### 3.3 `article`（記事）

```sql
CREATE TABLE article (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,    -- 一覧用の短い説明
  content         TEXT NOT NULL,    -- 本文（Markdown）
  tag             TEXT NOT NULL,    -- 表示用タグラベル（例: "倫理学"）
  reading_time    INTEGER NOT NULL, -- 推定読了時間（分）
  featured        INTEGER NOT NULL DEFAULT 0,  -- 特集記事フラグ
  philosopher_id  TEXT REFERENCES philosopher(id),
  published_at    INTEGER NOT NULL, -- 公開日時（Unix時間ms）
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX article_philosopher_idx ON article(philosopher_id);
CREATE INDEX article_published_at_idx ON article(published_at DESC);
CREATE INDEX article_featured_idx ON article(featured);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `slug` | TEXT | NOT NULL, UNIQUE | URLスラッグ |
| `title` | TEXT | NOT NULL | 記事タイトル |
| `description` | TEXT | NOT NULL | 短い説明（一覧用） |
| `content` | TEXT | NOT NULL | 本文（Markdown） |
| `tag` | TEXT | NOT NULL | 表示用タグ |
| `reading_time` | INTEGER | NOT NULL | 読了時間（分） |
| `featured` | INTEGER | NOT NULL | 特集フラグ（0/1） |
| `philosopher_id` | TEXT | FK → philosopher | 関連哲学者（任意） |
| `published_at` | INTEGER | NOT NULL | 公開日時（Unix時間ms） |
| `created_at` | INTEGER | NOT NULL | Unix時間（ms） |
| `updated_at` | INTEGER | NOT NULL | Unix時間（ms） |

---

### 3.4 `article_theme`（記事⇔テーマ 中間テーブル）

```sql
CREATE TABLE article_theme (
  article_id  TEXT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  theme_id    TEXT NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, theme_id)
);
```

---

### 3.5 `course`（学習コース）

```sql
CREATE TABLE course (
  id                 TEXT PRIMARY KEY,
  slug               TEXT NOT NULL UNIQUE,
  number             INTEGER NOT NULL UNIQUE,  -- 表示番号
  title              TEXT NOT NULL,
  description        TEXT NOT NULL,
  difficulty         TEXT NOT NULL,  -- 'beginner' | 'intermediate' | 'advanced'
  estimated_minutes  INTEGER NOT NULL,
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL
);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `slug` | TEXT | NOT NULL, UNIQUE | URLスラッグ |
| `number` | INTEGER | NOT NULL, UNIQUE | 表示番号（01, 02, ...） |
| `title` | TEXT | NOT NULL | コース名 |
| `description` | TEXT | NOT NULL | コース説明 |
| `difficulty` | TEXT | NOT NULL | 難易度 |
| `estimated_minutes` | INTEGER | NOT NULL | 推定学習時間（分） |
| `created_at` | INTEGER | NOT NULL | Unix時間（ms） |
| `updated_at` | INTEGER | NOT NULL | Unix時間（ms） |

**difficulty の値**:
- `beginner` — 入門（例: 「哲学ってなに？」）
- `intermediate` — 中級（例: 「倫理と善悪」）
- `advanced` — 応用（例: 「近現代哲学」）

---

### 3.6 `lesson`（コース内レッスン）

```sql
CREATE TABLE lesson (
  id                 TEXT PRIMARY KEY,
  slug               TEXT NOT NULL UNIQUE,
  course_id          TEXT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  number             INTEGER NOT NULL,   -- コース内の順番
  title              TEXT NOT NULL,
  description        TEXT NOT NULL,
  content            TEXT NOT NULL,      -- 本文（Markdown）
  estimated_minutes  INTEGER NOT NULL,
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL,
  UNIQUE(course_id, number)
);

CREATE INDEX lesson_course_id_idx ON lesson(course_id);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `slug` | TEXT | NOT NULL, UNIQUE | URLスラッグ |
| `course_id` | TEXT | FK → course | 所属コース |
| `number` | INTEGER | NOT NULL | コース内順番 |
| `title` | TEXT | NOT NULL | レッスン名 |
| `description` | TEXT | NOT NULL | 短い説明 |
| `content` | TEXT | NOT NULL | 本文（Markdown） |
| `estimated_minutes` | INTEGER | NOT NULL | 推定時間（分） |
| `created_at` | INTEGER | NOT NULL | Unix時間（ms） |
| `updated_at` | INTEGER | NOT NULL | Unix時間（ms） |

---

### 3.7 `quote`（名言）

```sql
CREATE TABLE quote (
  id              TEXT PRIMARY KEY,
  text            TEXT NOT NULL,
  source          TEXT,                -- 出典（書名など）
  philosopher_id  TEXT NOT NULL REFERENCES philosopher(id),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX quote_philosopher_id_idx ON quote(philosopher_id);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `text` | TEXT | NOT NULL | 名言テキスト |
| `source` | TEXT | | 出典（書名・対話篇名など） |
| `philosopher_id` | TEXT | FK → philosopher | 発言者の哲学者 |
| `created_at` | INTEGER | NOT NULL | Unix時間（ms） |
| `updated_at` | INTEGER | NOT NULL | Unix時間（ms） |

---

### 3.8 `glossary_term`（用語集）

```sql
CREATE TABLE glossary_term (
  id              TEXT PRIMARY KEY,
  term            TEXT NOT NULL UNIQUE,  -- 用語名
  reading         TEXT NOT NULL,         -- 読み仮名
  definition      TEXT NOT NULL,         -- 短い定義
  detail          TEXT,                  -- 詳細説明（Markdown）
  philosopher_id  TEXT REFERENCES philosopher(id),
  theme_id        TEXT REFERENCES theme(id),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `term` | TEXT | NOT NULL, UNIQUE | 用語名（例: "カテゴリー論"） |
| `reading` | TEXT | NOT NULL | 読み仮名 |
| `definition` | TEXT | NOT NULL | 短い定義文 |
| `detail` | TEXT | | 詳細説明（Markdown、任意） |
| `philosopher_id` | TEXT | FK → philosopher | 関連哲学者（任意） |
| `theme_id` | TEXT | FK → theme | 関連テーマ（任意） |
| `created_at` | INTEGER | NOT NULL | Unix時間（ms） |
| `updated_at` | INTEGER | NOT NULL | Unix時間（ms） |

---

### 3.9 `user_lesson_progress`（学習進捗）

```sql
CREATE TABLE user_lesson_progress (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  lesson_id     TEXT NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  completed_at  INTEGER NOT NULL,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX user_lesson_progress_user_id_idx ON user_lesson_progress(user_id);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `user_id` | TEXT | FK → user | ユーザー |
| `lesson_id` | TEXT | FK → lesson | 完了済みレッスン |
| `completed_at` | INTEGER | NOT NULL | 完了日時（Unix時間ms） |

---

### 3.10 `user_bookmark`（ブックマーク）

```sql
CREATE TABLE user_bookmark (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  target_type  TEXT NOT NULL,   -- 'article' | 'philosopher' | 'course'
  target_id    TEXT NOT NULL,
  created_at   INTEGER NOT NULL,
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX user_bookmark_user_id_idx ON user_bookmark(user_id);
```

| カラム | 型 | 制約 | 説明 |
|-------|----|------|------|
| `id` | TEXT | PK | UUIDv7 |
| `user_id` | TEXT | FK → user | ユーザー |
| `target_type` | TEXT | NOT NULL | 対象種別 |
| `target_id` | TEXT | NOT NULL | 対象ID |
| `created_at` | INTEGER | NOT NULL | 登録日時（Unix時間ms） |

---

## 4. ER図

```
user ──────────────────────────┐
  │                            │
  ├── user_lesson_progress     │
  │     └── lesson             │
  │           └── course       │
  │                            │
  └── user_bookmark ──────────┘
        (article | philosopher | course)

article ───── article_theme ───── theme
  │
  └── philosopher
        ├── quote
        └── glossary_term ───── theme
```

---

## 5. ファイル構成

```
packages/db/src/schema/
├── auth.ts          # better-auth 管理テーブル（既存）
├── philosopher.ts   # philosopher テーブル
├── theme.ts         # theme テーブル
├── article.ts       # article, article_theme テーブル
├── course.ts        # course, lesson テーブル
├── quote.ts         # quote テーブル
├── glossary.ts      # glossary_term テーブル
├── progress.ts      # user_lesson_progress テーブル
├── bookmark.ts      # user_bookmark テーブル
└── index.ts         # 全スキーマのエクスポート
```

---

## 6. 初期データ（Seed）方針

- `packages/db/src/seed.ts` にシードスクリプトを作成
- 各テーブルに最低限のサンプルデータを投入
  - 哲学者: 20名程度（ソクラテス、プラトン、アリストテレス、カント、ニーチェ、老子、孔子、サルトル など）
  - テーマ: 8件（sample.html 記載の8テーマ）
  - 学習コース: 6件（sample.html 記載の6コース）
  - 記事: 20件程度
  - 名言: 各哲学者3〜5件
  - 用語集: 30件程度
- シード実行コマンド: `bun run db:seed`
