# 実装計画書：バグ修正・懸念事項対応（add-spec01.md）

作成日: 2026-04-25

## 対象仕様ファイル

`/workspace/docs/user/add-spec01.md`

---

## 概要

add-spec01.md に記載された以下の項目を実装・修正する。

| # | 種別 | 内容 |
|---|------|------|
| 1 | バグ | レッスン完了ボタン押下後にボタン状態が変化せず、他ページでも完了状態が確認できない |
| 2 | 懸念事項 | ログイン後にマイページへの導線がない |

---

## 1. バグ修正：レッスン完了ボタンの状態反映

### 原因分析

**問題点①：完了済み状態のロード不足**

- `courses/$slug/$lessonSlug.tsx` は `orpc.courses.getLesson` のみ使用しており、進捗情報（`progress.get`）を取得していない
- ページ表示時点でそのレッスンが既に完了済みかどうかを判定できない

**問題点②：ミューテーション後の UI 更新不足**

- `completeLesson.mutate()` 成功後に `queryClient.invalidateQueries({ queryKey: ["progress"] })` を呼んでいるが、レッスンページ自体は progress クエリを購読していないため UI が変わらない
- ボタンは常に「✓ レッスン完了」と表示され続け、完了後の視覚的フィードバックがない

**問題点③：クイズ経由の完了でも同様**

- クイズ完了後に `completeLesson.mutate()` を呼んでいるが、クイズボタンも完了後に変化しない

### 修正方針

1. `lessonSlug.tsx` でログインユーザーの場合は `orpc.progress.get` も取得し、現在のレッスンが完了済みかチェックする
2. 完了済みの場合はボタンを「✓ 完了済み」に変更し、非活性・グリーン系スタイルに変更する
3. `completeLesson.mutate()` 成功後に、ローカル状態として完了フラグを立て即時 UI を更新する（楽観的 UI）
4. クイズボタン（`data.hasQuiz === true` のケース）も同様に完了状態を表示する
5. `invalidateQueries` のクエリキーを `orpc.progress.get.queryOptions().queryKey` に修正する

### 修正対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `apps/web/src/routes/courses/$slug/$lessonSlug.tsx` | ①進捗取得クエリ追加、②完了済み判定ロジック追加、③ボタン表示切り替え実装 |

### 実装詳細

```tsx
// 追加: 進捗クエリ（ログイン時のみ有効）
const { data: progress } = useQuery(
  orpc.progress.get.queryOptions(),
);

// 追加: 完了済み判定
const isCompleted = progress?.completedLessons.some(
  (l) => l.lessonId === data?.id
) ?? false;

// 修正: completeLesson の invalidateQueries
const completeLesson = useMutation(
  orpc.progress.completeLesson.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.progress.get.queryOptions().queryKey,
      });
    },
  }),
);
```

**完了済みボタンの表示切り替え（クイズなし）:**

```tsx
{isCompleted || completeLesson.isSuccess ? (
  <div className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-medium"
    style={{ backgroundColor: "var(--green-dark)", color: "var(--paper)" }}>
    ✓ 完了済み
  </div>
) : (
  <button ... >
    {completeLesson.isPending ? "処理中..." : "✓ レッスン完了"}
  </button>
)}
```

**クイズあり（`data.hasQuiz === true`）の場合も同様に完了状態を表示する。**

---

## 2. 懸念事項対応：ログイン後のマイページへの導線追加

### 現状分析

- `components/user-menu.tsx` のドロップダウンメニューには「アカウント」セクションにメールアドレス表示と「ログアウト」しかない
- ログイン後にダッシュボード（`/dashboard`）への導線がない

### 修正方針

`UserMenu` のドロップダウンメニューに「マイページ」リンクを追加する。

### 修正対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `apps/web/src/components/user-menu.tsx` | ドロップダウンに「マイページ」メニュー項目を追加 |

### 実装詳細

`DropdownMenuSeparator`（メールアドレスの下）の後ろに `DropdownMenuItem` としてマイページリンクを追加する。

```tsx
<DropdownMenuItem asChild style={{ fontFamily: '"Noto Serif JP", serif', fontSize: "0.875rem" }}>
  <Link to="/dashboard">マイページ</Link>
</DropdownMenuItem>
<DropdownMenuSeparator style={{ backgroundColor: "rgba(139,69,19,0.12)" }} />
```

---

## タスク一覧

| # | タスク | 対象ファイル |
|---|--------|-------------|
| 1 | レッスン完了ボタン：進捗取得クエリの追加 | `lessonSlug.tsx` |
| 2 | レッスン完了ボタン：完了済み判定と UI 切り替え（クイズなし） | `lessonSlug.tsx` |
| 3 | レッスン完了ボタン：完了済み判定と UI 切り替え（クイズあり） | `lessonSlug.tsx` |
| 4 | レッスン完了ボタン：`invalidateQueries` のクエリキー修正 | `lessonSlug.tsx` |
| 5 | ユーザーメニュー：マイページリンクの追加 | `user-menu.tsx` |

---

## 注意事項

- `orpc.progress.get` は認証必須 API のため、未ログイン時は `useQuery` がエラーになる可能性がある。セッション状態を確認した上でクエリを有効化する（`enabled: !!session`）。
- ボタンのスタイル変更は既存の CSS 変数（`--green-dark`）を使用し、デザインの統一性を保つ。
- ユニットテストは変更した各コンポーネントに対して実施する。

