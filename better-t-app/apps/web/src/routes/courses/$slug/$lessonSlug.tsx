import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { QuizModal } from "@/components/quiz-modal";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/courses/$slug/$lessonSlug")({
  component: LessonPage,
});

function LessonPage() {
  const { slug, lessonSlug } = Route.useParams();
  const queryClient = useQueryClient();
  const [quizOpen, setQuizOpen] = useState(false);

  const { data, isLoading } = useQuery(
    orpc.courses.getLesson.queryOptions({ input: { courseSlug: slug, lessonSlug } }),
  );

  const completeLesson = useMutation(
    orpc.progress.completeLesson.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["progress"] });
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-72 rounded" style={{ backgroundColor: "var(--aged)" }} />
          <div className="h-64 mt-6 rounded" style={{ backgroundColor: "var(--aged)" }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p style={{ color: "var(--philo-muted)" }}>レッスンが見つかりませんでした。</p>
        <Link to="/courses/$slug" params={{ slug }} className="mt-4 block text-sm" style={{ color: "var(--accent)" }}>
          ← コースに戻る
        </Link>
      </div>
    );
  }

  const lessonNumber = data.number;

  return (
    <>
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* ヘッダー */}
      <div
        className="py-10 px-6"
        style={{ backgroundColor: "var(--aged)", borderBottom: "1px solid rgba(139,69,19,0.1)" }}
      >
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--light-muted)" }}>
            <Link to="/courses" style={{ color: "var(--philo-muted)" }}>コース</Link>
            <span>/</span>
            <Link to="/courses/$slug" params={{ slug }} style={{ color: "var(--philo-muted)" }}>
              {data.course.title}
            </Link>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>{data.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--light-muted)" }}
            >
              Lesson {lessonNumber}
            </span>
            {data.estimatedMinutes && (
              <span className="text-xs" style={{ color: "var(--light-muted)" }}>
                約 {data.estimatedMinutes} 分
              </span>
            )}
          </div>

          <h1
            className="text-xl md:text-2xl font-bold"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            {data.title}
          </h1>

          {/* 進捗バー */}
          <div className="mt-5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(139,69,19,0.12)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(lessonNumber / Math.max(lessonNumber, lessonNumber + (data.nextLesson ? 1 : 0))) * 100}%`,
                backgroundColor: "var(--accent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* レッスン本文 */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="prose-philo">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {data.content}
          </ReactMarkdown>
        </div>

        {/* レッスン完了ボタン */}
        <div
          className="mt-12 p-6 rounded-xl text-center"
          style={{ backgroundColor: "var(--aged)", border: "1px solid rgba(139,69,19,0.1)" }}
        >
          <p
            className="text-sm mb-4"
            style={{ color: "var(--philo-muted)" }}
          >
            {data.hasQuiz
              ? "このレッスンを学習し終えたらクイズに挑戦してみましょう。"
              : "このレッスンを学習し終えたら完了にしましょう。"}
          </p>
          {data.hasQuiz ? (
            <button
              type="button"
              onClick={() => setQuizOpen(true)}
              className="px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "var(--accent)", color: "var(--paper)" }}
            >
              ℹ️ クイズを完了する
            </button>
          ) : (
            <button
              type="button"
              onClick={() => completeLesson.mutate({ lessonId: data.id })}
              disabled={completeLesson.isPending}
              className="px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--paper)",
                opacity: completeLesson.isPending ? 0.7 : 1,
              }}
            >
              {completeLesson.isPending ? "処理中..." : "✓ レッスン完了"}
            </button>
          )}
        </div>

        {/* 前後ナビゲーション */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {data.prevLesson ? (
            <Link
              to="/courses/$slug/$lessonSlug"
              params={{ slug, lessonSlug: data.prevLesson.slug }}
              className="group flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200 hover:-translate-x-0.5"
              style={{
                backgroundColor: "var(--aged)",
                color: "var(--philo-muted)",
                border: "1px solid rgba(139,69,19,0.1)",
              }}
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              <span>{data.prevLesson.title}</span>
            </Link>
          ) : (
            <div />
          )}

          {data.nextLesson ? (
            <Link
              to="/courses/$slug/$lessonSlug"
              params={{ slug, lessonSlug: data.nextLesson.slug }}
              className="group flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200 hover:translate-x-0.5"
              style={{
                backgroundColor: "var(--ink)",
                color: "var(--paper)",
                border: "1px solid transparent",
              }}
            >
              <span>{data.nextLesson.title}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ) : (
            <Link
              to="/courses/$slug"
              params={{ slug }}
              className="group flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                backgroundColor: "var(--ink)",
                color: "var(--paper)",
              }}
            >
              <span>コース完了 →</span>
            </Link>
          )}
        </div>
      </div>
    </div>

      {/* クイズモーダル */}
      {quizOpen && (
        <QuizModal
          lessonId={data.id}
          onClose={() => setQuizOpen(false)}
          onComplete={() => {
            setQuizOpen(false);
            completeLesson.mutate({ lessonId: data.id });
          }}
        />
      )}
    </>
  );
}
