# API 設計書

## 1. 概要

- フレームワーク: **oRPC** (Type-safe RPC over HTTP)
- サーバー: **Hono** + **Bun**
- エンドポイントベース: `/api/rpc`
- 認証: **better-auth** セッション（Cookie ベース）
- 通信形式: JSON

---

## 2. ルーター構成

```
packages/api/src/routers/
├── index.ts          # appRouter の集約
├── articles.ts       # 記事関連
├── philosophers.ts   # 哲学者関連
├── courses.ts        # 学習コース関連
├── themes.ts         # テーマ関連
├── glossary.ts       # 用語集関連
├── quotes.ts         # 名言関連
├── search.ts         # 検索
├── progress.ts       # 学習進捗（認証必須）
└── bookmarks.ts      # ブックマーク（認証必須）
```

---

## 3. プロシージャ一覧

### 3.1 記事 (`articles`)

#### `articles.list`
記事一覧を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `themeSlug` | `string` | 任意 | テーマでフィルター |
  | `philosopherSlug` | `string` | 任意 | 哲学者でフィルター |
  | `limit` | `number` | 任意 | 取得件数（デフォルト: 20） |
  | `offset` | `number` | 任意 | オフセット（デフォルト: 0） |
  | `featured` | `boolean` | 任意 | 特集記事のみ |
- **出力**:
  ```typescript
  {
    articles: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
      tag: string;          // 表示用タグラベル
      readingTime: number;  // 推定読了時間（分）
      publishedAt: Date;
      featured: boolean;
      themes: Array<{ id: string; name: string; slug: string }>;
      philosopher: { id: string; name: string; slug: string } | null;
    }>;
    total: number;
  }
  ```

#### `articles.get`
記事詳細を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `slug` | `string` | ○ | 記事スラッグ |
- **出力**:
  ```typescript
  {
    id: string;
    slug: string;
    title: string;
    description: string;
    content: string;        // Markdown形式の本文
    tag: string;
    readingTime: number;
    publishedAt: Date;
    featured: boolean;
    themes: Array<{ id: string; name: string; slug: string }>;
    philosopher: { id: string; name: string; slug: string } | null;
    relatedArticles: Array<{
      id: string; slug: string; title: string; tag: string;
    }>;
  }
  ```

---

### 3.2 哲学者 (`philosophers`)

#### `philosophers.list`
哲学者一覧を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `region` | `string` | 任意 | 地域でフィルター（`western` / `eastern`） |
  | `era` | `string` | 任意 | 時代でフィルター |
  | `limit` | `number` | 任意 | 取得件数（デフォルト: 50） |
  | `offset` | `number` | 任意 | オフセット |
- **出力**:
  ```typescript
  {
    philosophers: Array<{
      id: string;
      slug: string;
      name: string;
      nameEn: string;
      initial: string;      // アバター表示用イニシャル/文字
      era: string;          // 生没年
      region: string;       // 地域（例: "古代ギリシャ"）
      shortBio: string;     // 短い紹介文
    }>;
    total: number;
  }
  ```

#### `philosophers.get`
哲学者詳細を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `slug` | `string` | ○ | 哲学者スラッグ |
- **出力**:
  ```typescript
  {
    id: string;
    slug: string;
    name: string;
    nameEn: string;
    initial: string;
    era: string;
    birthYear: number | null;
    deathYear: number | null;
    region: string;
    biography: string;      // Markdown形式の詳細解説
    keyIdeas: string[];     // 主要な思想・キーワード
    majorWorks: string[];   // 主要著作
    themes: Array<{ id: string; name: string; slug: string }>;
    articles: Array<{ id: string; slug: string; title: string; tag: string }>;
    quotes: Array<{ id: string; text: string }>;
  }
  ```

---

### 3.3 学習コース (`courses`)

#### `courses.list`
学習コース一覧を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `difficulty` | `string` | 任意 | 難易度（`beginner` / `intermediate` / `advanced`） |
- **出力**:
  ```typescript
  {
    courses: Array<{
      id: string;
      slug: string;
      number: number;       // 表示番号（01, 02, ...）
      title: string;
      description: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      estimatedMinutes: number;
      lessonCount: number;
      tag: string;          // 表示用タグ（例: "入門 · 30分"）
    }>;
  }
  ```

#### `courses.get`
コース詳細とレッスン一覧を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `slug` | `string` | ○ | コーススラッグ |
- **出力**:
  ```typescript
  {
    id: string;
    slug: string;
    number: number;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedMinutes: number;
    lessons: Array<{
      id: string;
      slug: string;
      number: number;
      title: string;
      description: string;
      estimatedMinutes: number;
    }>;
  }
  ```

#### `courses.getLesson`
コースのレッスン詳細を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `courseSlug` | `string` | ○ | コーススラッグ |
  | `lessonSlug` | `string` | ○ | レッスンスラッグ |
- **出力**:
  ```typescript
  {
    id: string;
    slug: string;
    number: number;
    title: string;
    content: string;        // Markdown形式
    estimatedMinutes: number;
    prevLesson: { slug: string; title: string } | null;
    nextLesson: { slug: string; title: string } | null;
    course: { id: string; slug: string; title: string };
  }
  ```

---

### 3.4 テーマ (`themes`)

#### `themes.list`
テーマ一覧を取得する。

- **認証**: 不要
- **出力**:
  ```typescript
  {
    themes: Array<{
      id: string;
      slug: string;
      number: number;
      name: string;
      description: string;
      articleCount: number;
    }>;
  }
  ```

#### `themes.get`
テーマ詳細と関連記事一覧を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `slug` | `string` | ○ | テーマスラッグ |
  | `limit` | `number` | 任意 | 記事取得件数（デフォルト: 20） |
  | `offset` | `number` | 任意 | オフセット |
- **出力**:
  ```typescript
  {
    id: string;
    slug: string;
    number: number;
    name: string;
    description: string;
    articles: Array<{
      id: string; slug: string; title: string;
      description: string; readingTime: number; publishedAt: Date;
    }>;
    total: number;
  }
  ```

---

### 3.5 用語集 (`glossary`)

#### `glossary.list`
用語集一覧を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `initial` | `string` | 任意 | 先頭文字でフィルター |
- **出力**:
  ```typescript
  {
    terms: Array<{
      id: string;
      term: string;
      reading: string;      // 読み仮名
      definition: string;   // 短い定義
      philosopher: { id: string; name: string; slug: string } | null;
      theme: { id: string; name: string; slug: string } | null;
    }>;
  }
  ```

---

### 3.6 名言 (`quotes`)

#### `quotes.getRandom`
ランダムな名言を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `count` | `number` | 任意 | 取得件数（デフォルト: 1） |
- **出力**:
  ```typescript
  {
    quotes: Array<{
      id: string;
      text: string;
      philosopherName: string;
      philosopherSlug: string;
    }>;
  }
  ```

#### `quotes.list`
名言一覧を取得する。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `philosopherSlug` | `string` | 任意 | 哲学者でフィルター |
  | `limit` | `number` | 任意 | 取得件数（デフォルト: 20） |
  | `offset` | `number` | 任意 | オフセット |
- **出力**:
  ```typescript
  {
    quotes: Array<{
      id: string;
      text: string;
      source: string | null;    // 出典（書名など）
      philosopher: {
        id: string; name: string; slug: string;
      };
    }>;
    total: number;
  }
  ```

---

### 3.7 検索 (`search`)

#### `search.query`
キーワードによるグローバル検索。

- **認証**: 不要
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `q` | `string` | ○ | 検索キーワード（最低2文字） |
  | `type` | `string` | 任意 | 検索対象絞り込み（`article` / `philosopher` / `theme` / `glossary`） |
  | `limit` | `number` | 任意 | 各カテゴリの取得件数（デフォルト: 5） |
- **出力**:
  ```typescript
  {
    articles: Array<{
      id: string; slug: string; title: string; description: string; tag: string;
    }>;
    philosophers: Array<{
      id: string; slug: string; name: string; era: string; region: string;
    }>;
    themes: Array<{
      id: string; slug: string; name: string;
    }>;
    glossaryTerms: Array<{
      id: string; term: string; definition: string;
    }>;
    total: number;
  }
  ```

---

### 3.8 学習進捗 (`progress`) ※認証必須

#### `progress.get`
ユーザーの学習進捗を取得する。

- **認証**: 必須
- **出力**:
  ```typescript
  {
    completedLessons: Array<{
      lessonId: string;
      lessonSlug: string;
      courseSlug: string;
      completedAt: Date;
    }>;
    completedCourses: Array<{
      courseId: string;
      courseSlug: string;
      courseTitle: string;
      completedAt: Date;
    }>;
    totalCompletedLessons: number;
    totalCompletedCourses: number;
  }
  ```

#### `progress.completeLesson`
レッスンを完了済みとしてマークする。

- **認証**: 必須
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `lessonId` | `string` | ○ | レッスンID |
- **出力**:
  ```typescript
  { success: boolean; courseCompleted: boolean }
  ```

---

### 3.9 ブックマーク (`bookmarks`) ※認証必須

#### `bookmarks.list`
ブックマーク一覧を取得する。

- **認証**: 必須
- **出力**:
  ```typescript
  {
    bookmarks: Array<{
      id: string;
      type: 'article' | 'philosopher' | 'course';
      targetId: string;
      targetSlug: string;
      targetTitle: string;
      createdAt: Date;
    }>;
  }
  ```

#### `bookmarks.add`
ブックマークを追加する。

- **認証**: 必須
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `type` | `'article' \| 'philosopher' \| 'course'` | ○ | 対象の種別 |
  | `targetId` | `string` | ○ | 対象のID |
- **出力**: `{ success: boolean; bookmarkId: string }`

#### `bookmarks.remove`
ブックマークを削除する。

- **認証**: 必須
- **入力パラメータ**:
  | パラメータ | 型 | 必須 | 説明 |
  |-----------|---|------|------|
  | `bookmarkId` | `string` | ○ | ブックマークID |
- **出力**: `{ success: boolean }`

---

## 4. エラーハンドリング

| エラーコード | HTTPステータス | 説明 |
|-------------|--------------|------|
| `UNAUTHORIZED` | 401 | 認証が必要な操作で未ログイン |
| `NOT_FOUND` | 404 | 対象リソースが見つからない |
| `VALIDATION_ERROR` | 400 | 入力パラメータが不正 |
| `INTERNAL_SERVER_ERROR` | 500 | サーバー内部エラー |

---

## 5. 認証フロー

```
クライアント → better-auth エンドポイント (/api/auth/*)
  ↓ Cookie にセッショントークン設定
クライアント → oRPC エンドポイント (/api/rpc)
  ↓ Cookie から セッション検証 (better-auth)
  ↓ context.session に注入
  → protectedProcedure で認証チェック
```

---

## 6. ページネーション方針

- オフセットベースページネーション（`limit` + `offset`）
- 一覧取得レスポンスには必ず `total` を含める
- デフォルト `limit`: コンテンツ種別により 20〜50
- 最大 `limit`: 100
