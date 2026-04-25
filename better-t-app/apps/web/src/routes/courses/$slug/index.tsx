import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/courses/$slug/")({
  component: CourseDetailPage,
});

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: session } = authClient.useSession();

  const { data, isLoading } = useQuery(
    orpc.courses.get.queryOptions({ input: { slug } }),
  );

  const { data: progress } = useQuery({
    ...orpc.progress.get.queryOptions(),
    enabled: !!session,
  });

  const completedLessonIds = new Set(
    progress?.completedLessons.map((l) => l.lessonId) ?? [],
  );

  const uncompleteLesson = useMutation(
    orpc.progress.uncompleteLesson.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.progress.get.queryOptions().queryKey,
        });
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-64 rounded" style={{ backgroundColor: "var(--aged)" }} />
          <div className="h-4 w-96 rounded" style={{ backgroundColor: "var(--aged)" }} />
          <div className="h-64 mt-8 rounded" style={{ backgroundColor: "var(--aged)" }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p style={{ color: "var(--philo-muted)" }}>コースが見つかりませんでした。</p>
        <Link to="/courses" className="mt-4 block text-sm" style={{ color: "var(--accent)" }}>
          ← コース一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* ヘッダー */}
      <div
        className="py-16 px-6"
        style={{
          backgroundColor: "var(--aged)",
          borderBottom: "1px solid rgba(139,69,19,0.1)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--light-muted)" }}>
            <Link to="/" style={{ color: "var(--philo-muted)" }}>ホーム</Link>
            <span>/</span>
            <Link to="/courses" style={{ color: "var(--philo-muted)" }}>学習コース</Link>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>{data.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-3xl font-bold"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--light-muted)" }}
            >
              {String(data.number).padStart(2, "0")}
            </span>
            {data.difficulty && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(139,69,19,0.1)",
                  color: "var(--accent)",
                  border: "1px solid rgba(139,69,19,0.2)",
                }}
              >
                {DIFFICULTY_LABELS[data.difficulty] ?? data.difficulty}
              </span>
            )}
          </div>

          <h1
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            {data.title}
          </h1>
          <p className="text-sm mb-4" style={{ color: "var(--philo-muted)" }}>
            {data.description}
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--light-muted)" }}>
            <span>{data.lessons.length} レッスン</span>
            {data.estimatedMinutes && (
              <span>合計 約 {Math.round(data.estimatedMinutes / 60)} 時間</span>
            )}
          </div>
        </div>
      </div>

      {/* レッスン一覧 */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2
          className="text-base font-semibold mb-5"
          style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--philo-muted)" }}
        >
          カリキュラム
        </h2>
        <ol className="flex flex-col gap-3">
          {data.lessons.map((lesson) => {
            const completed = completedLessonIds.has(lesson.id);
            return (
              <li key={lesson.id} className="flex items-stretch gap-2">
                <Link
                  to="/courses/$slug/$lessonSlug"
                  params={{ slug, lessonSlug: lesson.slug }}
                  className="group flex flex-1 items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: completed
                      ? "rgba(34,197,94,0.07)"
                      : "var(--aged)",
                    border: completed
                      ? "1px solid rgba(34,197,94,0.25)"
                      : "1px solid rgba(139,69,19,0.1)",
                  }}
                >
                  <span
                    className="text-xl font-bold w-8 text-center shrink-0"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      color: completed ? "var(--green-dark)" : "var(--light-muted)",
                    }}
                  >
                    {completed ? "✓" : lesson.number}
                  </span>
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium transition-colors group-hover:text-[var(--accent)]"
                      style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                    >
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--light-muted)" }}>
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  {lesson.estimatedMinutes && (
                    <span className="text-xs shrink-0" style={{ color: "var(--light-muted)" }}>
                      {lesson.estimatedMinutes} 分
                    </span>
                  )}
                  <span
                    className="text-base transition-transform group-hover:translate-x-1"
                    style={{ color: completed ? "var(--green-dark)" : "var(--light-muted)" }}
                  >
                    {completed ? "✓" : "→"}
                  </span>
                </Link>
                {session && completed && (
                  <button
                    type="button"
                    onClick={() => uncompleteLesson.mutate({ lessonId: lesson.id })}
                    disabled={uncompleteLesson.isPending}
                    title="未完了に戻す"
                    className="shrink-0 px-3 rounded-xl text-xs transition-all duration-200 hover:opacity-70"
                    style={{
                      backgroundColor: "rgba(139,69,19,0.06)",
                      border: "1px solid rgba(139,69,19,0.1)",
                      color: "var(--philo-muted)",
                    }}
                  >
                    取り消す
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
