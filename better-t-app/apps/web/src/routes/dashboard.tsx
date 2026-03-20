import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

const TARGET_TYPE_LABELS: Record<string, string> = {
  article: "記事",
  philosopher: "哲学者",
  course: "コース",
};

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const { data: progress, isLoading: progressLoading } = useQuery(
    orpc.progress.get.queryOptions(),
  );

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery(
    orpc.bookmarks.list.queryOptions(),
  );

  const removeBookmark = useMutation(
    orpc.bookmarks.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      },
    }),
  );

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* ページヘッダー */}
      <div
        className="py-12 px-6"
        style={{ backgroundColor: "var(--aged)", borderBottom: "1px solid rgba(139,69,19,0.1)" }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
            DASHBOARD
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            マイページ
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--philo-muted)" }}>
            ようこそ、{session.data?.user.name} さん
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_300px] gap-8">
        {/* 学習進捗 */}
        <div>
          <h2
            className="text-base font-semibold mb-4"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            学習進捗
          </h2>

          {progressLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl"
                  style={{ backgroundColor: "var(--aged)" }}
                />
              ))}
            </div>
          ) : !progress || progress.completedLessons.length === 0 ? (
            <div
              className="p-8 rounded-xl text-center"
              style={{ backgroundColor: "var(--aged)", border: "1px solid rgba(139,69,19,0.1)" }}
            >
              <p className="text-sm mb-4" style={{ color: "var(--philo-muted)" }}>
                まだコースを始めていません。
              </p>
              <Link
                to="/courses"
                className="text-sm px-4 py-2 rounded-full"
                style={{ backgroundColor: "var(--accent)", color: "var(--paper)" }}
              >
                コースを探す
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 統計 */}
              <div className="grid grid-cols-3 gap-3 mb-2">
                {[
                  { label: "完了レッスン", value: progress.totalCompletedLessons },
                  { label: "完了コース", value: progress.totalCompletedCourses },
                  { label: "学習中", value: new Set(progress.completedLessons.map((l) => l.courseSlug)).size },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-4 rounded-xl text-center"
                    style={{
                      backgroundColor: "var(--aged)",
                      border: "1px solid rgba(139,69,19,0.08)",
                    }}
                  >
                    <span
                      className="text-2xl font-bold block"
                      style={{ fontFamily: '"Cormorant Garamond", serif', color: "var(--accent)" }}
                    >
                      {value}
                    </span>
                    <span className="text-xs" style={{ color: "var(--light-muted)" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* コース別進捗 */}
              {progress.completedCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "var(--aged)",
                    border: "1px solid rgba(139,69,19,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      to="/courses/$slug"
                      params={{ slug: course.courseSlug }}
                      className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
                      style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                    >
                      {course.courseTitle}
                    </Link>
                    <span className="text-xs" style={{ color: "var(--green-dark)" }}>
                      ✓ 完了
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "rgba(139,69,19,0.1)" }}
                  >
                    <div
                      className="h-full w-full rounded-full"
                      style={{ backgroundColor: "var(--green-dark)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ブックマーク */}
        <div>
          <h2
            className="text-base font-semibold mb-4"
            style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
          >
            ブックマーク
          </h2>

          {bookmarksLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl"
                  style={{ backgroundColor: "var(--aged)" }}
                />
              ))}
            </div>
          ) : !bookmarks || bookmarks.bookmarks.length === 0 ? (
            <div
              className="p-6 rounded-xl text-center"
              style={{ backgroundColor: "var(--aged)", border: "1px solid rgba(139,69,19,0.1)" }}
            >
              <p className="text-sm" style={{ color: "var(--philo-muted)" }}>
                ブックマークがありません。
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {bookmarks.bookmarks.map((bm) => {
                const to =
                  bm.type === "article"
                    ? `/articles/${bm.targetSlug}`
                    : bm.type === "philosopher"
                      ? `/philosophers/${bm.targetSlug}`
                      : `/courses/${bm.targetSlug}`;

                return (
                  <div
                    key={bm.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: "var(--aged)",
                      border: "1px solid rgba(139,69,19,0.08)",
                    }}
                  >
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: "rgba(139,69,19,0.08)",
                        color: "var(--accent)",
                      }}
                    >
                      {TARGET_TYPE_LABELS[bm.type] ?? bm.type}
                    </span>
                    <a
                      href={to}
                      className="text-sm flex-1 hover:text-[var(--accent)] transition-colors truncate"
                      style={{ color: "var(--ink)" }}
                    >
                      {bm.targetTitle || bm.targetId}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        removeBookmark.mutate({
                          bookmarkId: bm.id,
                        })
                      }
                      className="text-xs shrink-0 transition-opacity hover:opacity-60"
                      style={{ color: "var(--light-muted)" }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
