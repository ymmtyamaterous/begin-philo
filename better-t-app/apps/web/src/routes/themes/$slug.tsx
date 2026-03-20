import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { RevealWrapper } from "@/components/reveal-wrapper";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/themes/$slug")({
  component: ThemeDetailPage,
});

const PAGE_SIZE = 9;

function ThemeDetailPage() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery(
    orpc.themes.get.queryOptions({
      input: { slug, limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    }),
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div style={{ backgroundColor: "var(--paper)", minHeight: "100vh" }}>
      {/* ヘッダー */}
      <div
        className="py-20 px-6"
        style={{
          backgroundColor: "var(--ink)",
          backgroundImage:
            "radial-gradient(ellipse at 60% 40%, rgba(139,69,19,0.15) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <nav
            className="flex items-center gap-2 text-xs mb-8"
            style={{ color: "rgba(181,166,138,0.7)" }}
          >
            <Link to="/" style={{ color: "var(--light-muted)" }}>
              ホーム
            </Link>
            <span>/</span>
            <Link to="/themes" style={{ color: "var(--light-muted)" }}>
              テーマ
            </Link>
            <span>/</span>
            <span style={{ color: "var(--aged)" }}>{data?.name ?? slug}</span>
          </nav>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 w-48 rounded" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
              <div className="h-4 w-80 rounded" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            </div>
          ) : (
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "var(--gold)" }}
              >
                THEME
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--paper)" }}
              >
                {data?.name}
              </h1>
              <div
                className="w-14 h-0.5 mb-4"
                style={{ backgroundColor: "var(--gold)" }}
              />
              <p className="max-w-xl text-sm leading-relaxed" style={{ color: "var(--light-muted)" }}>
                {data?.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 記事一覧 */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-xl"
                style={{ backgroundColor: "var(--aged)" }}
              />
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: "var(--light-muted)" }}>
              {data?.total ?? 0} 件の記事
            </p>
            <RevealWrapper stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.articles ?? []).map((article) => (
                <Link
                  key={article.id}
                  to="/articles/$slug"
                  params={{ slug: article.slug }}
                  className="group flex flex-col p-5 rounded-xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: "var(--aged)",
                    border: "1px solid rgba(139,69,19,0.1)",
                    boxShadow: "0 1px 4px rgba(26,18,9,0.04)",
                  }}
                >
                  <h3
                    className="text-base font-semibold leading-snug mb-2 transition-colors group-hover:text-[var(--accent)]"
                    style={{ fontFamily: '"Shippori Mincho", serif', color: "var(--ink)" }}
                  >
                    {article.title}
                  </h3>
                  <p
                    className="text-xs flex-1 line-clamp-3"
                    style={{ color: "var(--philo-muted)" }}
                  >
                    {article.description}
                  </p>
                  {article.readingTime && (
                    <p className="text-xs mt-3" style={{ color: "var(--light-muted)" }}>
                      約 {article.readingTime} 分
                    </p>
                  )}
                </Link>
              ))}
            </RevealWrapper>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--aged)",
                    color: "var(--philo-muted)",
                    border: "1px solid rgba(139,69,19,0.15)",
                  }}
                >
                  ← 前へ
                </button>
                <span className="text-sm" style={{ color: "var(--philo-muted)" }}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-40"
                  style={{
                    backgroundColor: "var(--aged)",
                    color: "var(--philo-muted)",
                    border: "1px solid rgba(139,69,19,0.15)",
                  }}
                >
                  次へ →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
